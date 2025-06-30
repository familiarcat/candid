#!/bin/bash
# Usage: ./deploy_to_ec2.sh ec2-user@your-ec2-ip /path/to/key.pem

EC2_HOST=$1
PEM_PATH=$2

echo "Deploying to $EC2_HOST..."

# Copy archive
scp -i $PEM_PATH candid-lcars-unified-final.zip $EC2_HOST:~

# SSH and deploy
ssh -i $PEM_PATH $EC2_HOST << EOF
  sudo apt update
  sudo apt install docker.io docker-compose unzip -y
  unzip -o candid-lcars-unified-final.zip -d candid-app
  cd candid-app
  docker-compose down
  docker-compose up -d --build
EOF
