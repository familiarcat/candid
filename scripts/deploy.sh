#!/bin/bash

# Deployment Script for Candid Connections
# Handles AWS infrastructure deployment and application updates

set -e

# Configuration
AWS_REGION="us-east-1"
APP_NAME="candid-connections"
DOMAIN_NAME="talent.pbradygeorgen.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        exit 1
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Initialize Terraform backend
init_terraform() {
    log_info "Initializing Terraform..."
    
    cd infrastructure/terraform
    
    # Create S3 bucket for Terraform state if it doesn't exist
    aws s3api head-bucket --bucket "pbradygeorgen-terraform-state" 2>/dev/null || {
        log_info "Creating Terraform state bucket..."
        aws s3api create-bucket \
            --bucket "pbradygeorgen-terraform-state" \
            --region $AWS_REGION
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "pbradygeorgen-terraform-state" \
            --versioning-configuration Status=Enabled
        
        # Enable encryption
        aws s3api put-bucket-encryption \
            --bucket "pbradygeorgen-terraform-state" \
            --server-side-encryption-configuration '{
                "Rules": [{
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }]
            }'
    }
    
    terraform init
    cd ../..
    
    log_success "Terraform initialized"
}

# Deploy infrastructure
deploy_infrastructure() {
    local environment=${1:-production}
    local domain=${2:-$DOMAIN_NAME}
    
    log_info "Deploying infrastructure for environment: $environment"
    
    cd infrastructure/terraform
    
    # Plan
    log_info "Running Terraform plan..."
    terraform plan \
        -var="environment=$environment" \
        -var="domain_name=$domain" \
        -var="aws_region=$AWS_REGION"
    
    # Ask for confirmation
    read -p "Do you want to apply these changes? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Deployment cancelled"
        exit 0
    fi
    
    # Apply
    log_info "Applying Terraform configuration..."
    terraform apply \
        -auto-approve \
        -var="environment=$environment" \
        -var="domain_name=$domain" \
        -var="aws_region=$AWS_REGION"
    
    cd ../..
    
    log_success "Infrastructure deployed successfully"
}

# Build and push Docker image
build_and_push() {
    log_info "Building and pushing Docker image..."
    
    # Get ECR repository URL
    ECR_REPOSITORY_URL=$(aws ecr describe-repositories \
        --repository-names $APP_NAME \
        --region $AWS_REGION \
        --query 'repositories[0].repositoryUri' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$ECR_REPOSITORY_URL" ]; then
        log_error "ECR repository not found. Please deploy infrastructure first."
        exit 1
    fi
    
    # Login to ECR
    log_info "Logging in to ECR..."
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_REPOSITORY_URL
    
    # Build image
    log_info "Building Docker image..."
    docker build -t $APP_NAME .
    
    # Tag image
    IMAGE_TAG="latest"
    if [ ! -z "$GITHUB_SHA" ]; then
        IMAGE_TAG=$GITHUB_SHA
    fi
    
    docker tag $APP_NAME:latest $ECR_REPOSITORY_URL:$IMAGE_TAG
    docker tag $APP_NAME:latest $ECR_REPOSITORY_URL:latest
    
    # Push image
    log_info "Pushing Docker image..."
    docker push $ECR_REPOSITORY_URL:$IMAGE_TAG
    docker push $ECR_REPOSITORY_URL:latest
    
    log_success "Docker image pushed successfully"
    echo "Image URL: $ECR_REPOSITORY_URL:$IMAGE_TAG"
}

# Update ECS service
update_service() {
    local environment=${1:-production}
    
    log_info "Updating ECS service..."
    
    local cluster_name="$APP_NAME-cluster"
    local service_name="$APP_NAME-service"
    
    if [ "$environment" != "production" ]; then
        cluster_name="$cluster_name-$environment"
        service_name="$service_name-$environment"
    fi
    
    # Force new deployment
    aws ecs update-service \
        --cluster $cluster_name \
        --service $service_name \
        --force-new-deployment \
        --region $AWS_REGION
    
    # Wait for deployment to complete
    log_info "Waiting for deployment to complete..."
    aws ecs wait services-stable \
        --cluster $cluster_name \
        --services $service_name \
        --region $AWS_REGION
    
    log_success "ECS service updated successfully"
}

# Verify deployment
verify_deployment() {
    local domain=${1:-$DOMAIN_NAME}
    
    log_info "Verifying deployment..."
    
    # Wait a bit for DNS propagation
    sleep 30
    
    # Check health endpoint
    local health_url="https://$domain/api/health"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Checking health endpoint (attempt $attempt/$max_attempts)..."
        
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Health check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Health check failed after $max_attempts attempts"
            exit 1
        fi
        
        sleep 30
        ((attempt++))
    done
    
    # Check main page
    if curl -f -s "https://$domain" > /dev/null; then
        log_success "Main page accessible"
    else
        log_warning "Main page check failed"
    fi
    
    log_success "Deployment verification completed"
    echo "Application URL: https://$domain"
}

# Main deployment function
main() {
    local command=${1:-full}
    local environment=${2:-production}
    local domain=${3:-$DOMAIN_NAME}
    
    if [ "$environment" != "production" ]; then
        domain="$environment.$domain"
    fi
    
    log_info "Starting deployment process..."
    log_info "Command: $command"
    log_info "Environment: $environment"
    log_info "Domain: $domain"
    
    case $command in
        "infrastructure"|"infra")
            check_prerequisites
            init_terraform
            deploy_infrastructure $environment $domain
            ;;
        "build")
            check_prerequisites
            build_and_push
            ;;
        "deploy")
            check_prerequisites
            build_and_push
            update_service $environment
            verify_deployment $domain
            ;;
        "full")
            check_prerequisites
            init_terraform
            deploy_infrastructure $environment $domain
            build_and_push
            update_service $environment
            verify_deployment $domain
            ;;
        "verify")
            verify_deployment $domain
            ;;
        *)
            echo "Usage: $0 [infrastructure|build|deploy|full|verify] [environment] [domain]"
            echo ""
            echo "Commands:"
            echo "  infrastructure - Deploy AWS infrastructure only"
            echo "  build         - Build and push Docker image only"
            echo "  deploy        - Build, push, and update ECS service"
            echo "  full          - Complete deployment (infrastructure + application)"
            echo "  verify        - Verify deployment health"
            echo ""
            echo "Examples:"
            echo "  $0 full production"
            echo "  $0 deploy staging"
            echo "  $0 infrastructure production talent.pbradygeorgen.com"
            exit 1
            ;;
    esac
    
    log_success "Deployment process completed successfully!"
}

# Run main function with all arguments
main "$@"
