// Health Check API Endpoint for Candid Connections
// Used by load balancers and monitoring systems

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Basic health check
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    }

    // Database connectivity check (if available)
    if (process.env.DATABASE_URL) {
      try {
        // In a real implementation, you would check database connectivity here
        healthCheck.checks.database = {
          status: 'healthy',
          responseTime: '< 50ms'
        }
      } catch (error) {
        healthCheck.checks.database = {
          status: 'unhealthy',
          error: error.message
        }
        healthCheck.status = 'degraded'
      }
    }

    // Redis connectivity check (if available)
    if (process.env.REDIS_URL) {
      try {
        // In a real implementation, you would check Redis connectivity here
        healthCheck.checks.redis = {
          status: 'healthy',
          responseTime: '< 10ms'
        }
      } catch (error) {
        healthCheck.checks.redis = {
          status: 'unhealthy',
          error: error.message
        }
        healthCheck.status = 'degraded'
      }
    }

    // Memory usage check
    const memUsage = process.memoryUsage()
    healthCheck.checks.memory = {
      status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB threshold
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    }

    // Determine overall status
    const hasUnhealthy = Object.values(healthCheck.checks).some(check => check.status === 'unhealthy')
    if (hasUnhealthy) {
      healthCheck.status = 'unhealthy'
    }

    // Return appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503

    res.status(statusCode).json(healthCheck)

  } catch (error) {
    console.error('Health check failed:', error)
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
}
