// Advanced Analytics Engine for Candid Connections Enterprise Features
// Provides predictive modeling, anomaly detection, and recommendation engine

/**
 * Advanced Analytics Engine for Enterprise Features
 */
export class AdvancedAnalytics {
  constructor() {
    this.historicalData = new Map()
    this.predictions = new Map()
    this.anomalies = new Map()
    this.modelCache = new Map()
  }

  /**
   * Generate predictive insights
   */
  generatePredictiveInsights(networkData, timeframe = '30d') {
    const insights = {
      matchPredictions: this.predictFutureMatches(networkData),
      networkGrowth: this.predictNetworkGrowth(networkData),
      skillDemandForecast: this.forecastSkillDemand(networkData),
      hiringTrends: this.analyzeTrendPatterns(networkData),
      riskAssessment: this.assessNetworkRisks(networkData)
    }

    return insights
  }

  /**
   * Predict future matches based on current patterns
   */
  predictFutureMatches(networkData) {
    const { nodes, links } = networkData
    const jobSeekers = nodes.filter(n => n.type === 'jobSeeker')
    const authorities = nodes.filter(n => n.type === 'authority')
    
    const predictions = []
    
    jobSeekers.forEach(seeker => {
      authorities.forEach(authority => {
        const score = this.calculateMatchProbability(seeker, authority, networkData)
        if (score > 0.7) {
          predictions.push({
            jobSeeker: seeker,
            authority: authority,
            probability: score,
            confidence: this.calculateConfidence(score),
            factors: this.getMatchFactors(seeker, authority),
            estimatedTimeToMatch: this.estimateMatchTime(score),
            recommendedActions: this.getRecommendedActions(seeker, authority, score)
          })
        }
      })
    })

    return predictions.sort((a, b) => b.probability - a.probability).slice(0, 10)
  }

  /**
   * Calculate match probability using ML-like scoring
   */
  calculateMatchProbability(seeker, authority, networkData) {
    let score = 0
    const factors = []

    // Skill alignment (40% weight)
    const skillMatch = this.calculateSkillAlignment(seeker, authority)
    score += skillMatch * 0.4
    if (skillMatch > 0.5) factors.push('Strong skill alignment')

    // Experience level match (25% weight)
    const experienceMatch = this.calculateExperienceMatch(seeker, authority)
    score += experienceMatch * 0.25
    if (experienceMatch > 0.7) factors.push('Experience level match')

    // Network proximity (20% weight)
    const proximityScore = this.calculateNetworkProximity(seeker, authority, networkData)
    score += proximityScore * 0.2
    if (proximityScore > 0.6) factors.push('Strong network connections')

    // Company culture fit (15% weight)
    const cultureScore = this.calculateCultureFit(seeker, authority)
    score += cultureScore * 0.15
    if (cultureScore > 0.8) factors.push('Excellent culture fit')

    return Math.min(score, 1)
  }

  /**
   * Predict network growth patterns
   */
  predictNetworkGrowth(networkData) {
    const currentSize = networkData.nodes.length
    const connectionDensity = networkData.links.length / (currentSize * (currentSize - 1) / 2)
    
    // Simple growth model based on current patterns
    const growthRate = this.calculateGrowthRate(networkData)
    const projectedSizes = []
    
    for (let months = 1; months <= 12; months++) {
      const projectedSize = Math.round(currentSize * Math.pow(1 + growthRate, months))
      projectedSizes.push({
        month: months,
        nodes: projectedSize,
        connections: Math.round(projectedSize * connectionDensity),
        confidence: Math.max(0.9 - (months * 0.05), 0.3)
      })
    }

    return {
      currentSize,
      growthRate,
      projections: projectedSizes,
      factors: this.getGrowthFactors(networkData)
    }
  }

  /**
   * Forecast skill demand trends
   */
  forecastSkillDemand(networkData) {
    const skills = networkData.nodes.filter(n => n.type === 'skill')
    const authorities = networkData.nodes.filter(n => n.type === 'authority')
    const jobSeekers = networkData.nodes.filter(n => n.type === 'jobSeeker')

    const skillAnalysis = skills.map(skill => {
      const currentDemand = authorities.filter(auth => 
        auth.skillsLookingFor?.includes(skill.name)
      ).length

      const currentSupply = jobSeekers.filter(seeker =>
        seeker.skills?.includes(skill.name)
      ).length

      const trend = this.calculateSkillTrend(skill, networkData)
      const futureProjections = this.projectSkillDemand(skill, currentDemand, trend)

      return {
        skill: skill.name,
        category: skill.category || 'General',
        currentDemand,
        currentSupply,
        gap: currentDemand - currentSupply,
        trend,
        projections: futureProjections,
        priority: this.calculateSkillPriority(currentDemand, currentSupply, trend)
      }
    })

    return skillAnalysis.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Detect network anomalies
   */
  detectAnomalies(networkData) {
    const anomalies = []

    // Unusual connection patterns
    const connectionAnomalies = this.detectConnectionAnomalies(networkData)
    anomalies.push(...connectionAnomalies)

    // Skill demand spikes
    const skillAnomalies = this.detectSkillAnomalies(networkData)
    anomalies.push(...skillAnomalies)

    // Match quality drops
    const qualityAnomalies = this.detectQualityAnomalies(networkData)
    anomalies.push(...qualityAnomalies)

    // Isolated nodes
    const isolationAnomalies = this.detectIsolatedNodes(networkData)
    anomalies.push(...isolationAnomalies)

    return anomalies.sort((a, b) => b.severity - a.severity)
  }

  /**
   * Generate recommendation engine insights
   */
  generateRecommendations(networkData, entityType, entityId) {
    const recommendations = []

    switch (entityType) {
      case 'jobSeeker':
        recommendations.push(...this.recommendForJobSeeker(entityId, networkData))
        break
      case 'authority':
        recommendations.push(...this.recommendForAuthority(entityId, networkData))
        break
      case 'company':
        recommendations.push(...this.recommendForCompany(entityId, networkData))
        break
    }

    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Calculate network health metrics
   */
  calculateNetworkHealth(networkData) {
    const metrics = {
      connectivity: this.calculateConnectivity(networkData),
      diversity: this.calculateDiversity(networkData),
      efficiency: this.calculateEfficiency(networkData),
      resilience: this.calculateResilience(networkData),
      growth: this.calculateGrowthRate(networkData)
    }

    const overallHealth = Object.values(metrics).reduce((sum, metric) => sum + metric.score, 0) / Object.keys(metrics).length

    return {
      overall: overallHealth,
      metrics,
      recommendations: this.generateHealthRecommendations(metrics),
      alerts: this.generateHealthAlerts(metrics)
    }
  }

  // Helper methods for calculations
  calculateSkillAlignment(seeker, authority) {
    const seekerSkills = seeker.skills || []
    const authorityNeeds = authority.skillsLookingFor || []
    
    if (seekerSkills.length === 0 || authorityNeeds.length === 0) return 0
    
    const matches = seekerSkills.filter(skill => 
      authorityNeeds.some(need => 
        need.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(need.toLowerCase())
      )
    )
    
    return matches.length / Math.max(seekerSkills.length, authorityNeeds.length)
  }

  calculateExperienceMatch(seeker, authority) {
    const seekerExp = seeker.experience || 0
    const requiredExp = authority.requiredExperience || 0
    
    if (requiredExp === 0) return 0.8
    
    const ratio = seekerExp / requiredExp
    if (ratio >= 0.8 && ratio <= 1.5) return 1
    if (ratio >= 0.6 && ratio <= 2) return 0.7
    return 0.3
  }

  calculateNetworkProximity(seeker, authority, networkData) {
    // Calculate shortest path between entities
    const seekerConnections = networkData.links.filter(l => 
      l.source?.id === seeker.id || l.target?.id === seeker.id
    )
    const authorityConnections = networkData.links.filter(l =>
      l.source?.id === authority.id || l.target?.id === authority.id
    )
    
    // Find common connections
    const commonConnections = seekerConnections.filter(sc =>
      authorityConnections.some(ac => 
        (sc.source?.id === ac.source?.id || sc.source?.id === ac.target?.id) ||
        (sc.target?.id === ac.source?.id || sc.target?.id === ac.target?.id)
      )
    )
    
    return Math.min(commonConnections.length / 3, 1) // Normalize to 0-1
  }

  calculateCultureFit(seeker, authority) {
    // Simplified culture matching based on company size, industry, etc.
    const seekerPrefs = seeker.preferences || {}
    const companyInfo = authority.company || {}
    
    let fit = 0.5 // Base score
    
    if (seekerPrefs.companySize && companyInfo.size) {
      if (seekerPrefs.companySize === companyInfo.size) fit += 0.3
    }
    
    if (seekerPrefs.industry && companyInfo.industry) {
      if (seekerPrefs.industry === companyInfo.industry) fit += 0.2
    }
    
    return Math.min(fit, 1)
  }

  calculateConfidence(score) {
    // Higher scores have higher confidence, but with some uncertainty
    return Math.min(score * 0.9 + 0.1, 1)
  }

  getMatchFactors(seeker, authority) {
    const factors = []
    
    if (this.calculateSkillAlignment(seeker, authority) > 0.7) {
      factors.push('Strong skill alignment')
    }
    
    if (this.calculateExperienceMatch(seeker, authority) > 0.8) {
      factors.push('Perfect experience match')
    }
    
    if (this.calculateNetworkProximity(seeker, authority, {}) > 0.5) {
      factors.push('Good network proximity')
    }
    
    return factors
  }

  estimateMatchTime(probability) {
    // Higher probability = faster estimated match time
    if (probability > 0.9) return '1-2 weeks'
    if (probability > 0.8) return '2-4 weeks'
    if (probability > 0.7) return '1-2 months'
    return '2-3 months'
  }

  getRecommendedActions(seeker, authority, score) {
    const actions = []
    
    if (score > 0.8) {
      actions.push('Schedule immediate interview')
      actions.push('Prepare detailed skill assessment')
    } else if (score > 0.7) {
      actions.push('Conduct preliminary screening')
      actions.push('Review portfolio/experience')
    }
    
    return actions
  }

  calculateGrowthRate(networkData) {
    // Simplified growth rate calculation
    // In production, this would use historical data
    return 0.05 // 5% monthly growth
  }

  getGrowthFactors(networkData) {
    return [
      'Active hiring authorities',
      'Diverse skill requirements',
      'Strong network connectivity',
      'Regular platform engagement'
    ]
  }

  calculateSkillTrend(skill, networkData) {
    // Simplified trend calculation
    // In production, this would analyze historical demand
    const randomTrend = Math.random()
    if (randomTrend > 0.7) return 'increasing'
    if (randomTrend < 0.3) return 'decreasing'
    return 'stable'
  }

  projectSkillDemand(skill, currentDemand, trend) {
    const projections = []
    let demand = currentDemand
    
    for (let months = 1; months <= 6; months++) {
      if (trend === 'increasing') demand *= 1.1
      else if (trend === 'decreasing') demand *= 0.95
      
      projections.push({
        month: months,
        demand: Math.round(demand),
        confidence: Math.max(0.9 - (months * 0.1), 0.4)
      })
    }
    
    return projections
  }

  calculateSkillPriority(demand, supply, trend) {
    let priority = demand - supply // Gap-based priority
    
    if (trend === 'increasing') priority *= 1.5
    else if (trend === 'decreasing') priority *= 0.7
    
    return Math.max(priority, 0)
  }

  // Anomaly detection methods
  detectConnectionAnomalies(networkData) {
    const anomalies = []
    
    // Find nodes with unusually high connections
    const avgConnections = networkData.links.length / networkData.nodes.length
    
    networkData.nodes.forEach(node => {
      const connections = networkData.links.filter(l =>
        l.source?.id === node.id || l.target?.id === node.id
      ).length
      
      if (connections > avgConnections * 3) {
        anomalies.push({
          type: 'high_connectivity',
          entity: node,
          severity: 0.7,
          description: `${node.name} has unusually high connectivity (${connections} connections)`
        })
      }
    })
    
    return anomalies
  }

  detectSkillAnomalies(networkData) {
    // Placeholder for skill demand spike detection
    return []
  }

  detectQualityAnomalies(networkData) {
    // Placeholder for match quality drop detection
    return []
  }

  detectIsolatedNodes(networkData) {
    const anomalies = []
    
    networkData.nodes.forEach(node => {
      const connections = networkData.links.filter(l =>
        l.source?.id === node.id || l.target?.id === node.id
      ).length
      
      if (connections === 0) {
        anomalies.push({
          type: 'isolated_node',
          entity: node,
          severity: 0.5,
          description: `${node.name} has no connections in the network`
        })
      }
    })
    
    return anomalies
  }

  // Recommendation methods
  recommendForJobSeeker(seekerId, networkData) {
    return [
      {
        type: 'skill_development',
        priority: 0.8,
        title: 'Develop in-demand skills',
        description: 'Focus on skills with high market demand'
      },
      {
        type: 'network_expansion',
        priority: 0.6,
        title: 'Expand professional network',
        description: 'Connect with more hiring authorities'
      }
    ]
  }

  recommendForAuthority(authorityId, networkData) {
    return [
      {
        type: 'candidate_outreach',
        priority: 0.9,
        title: 'Proactive candidate outreach',
        description: 'Reach out to high-potential matches'
      }
    ]
  }

  recommendForCompany(companyId, networkData) {
    return [
      {
        type: 'hiring_strategy',
        priority: 0.7,
        title: 'Optimize hiring strategy',
        description: 'Review and improve hiring processes'
      }
    ]
  }

  // Health metric calculations
  calculateConnectivity(networkData) {
    const density = networkData.links.length / (networkData.nodes.length * (networkData.nodes.length - 1) / 2)
    return { score: Math.min(density * 10, 1), value: density }
  }

  calculateDiversity(networkData) {
    const types = [...new Set(networkData.nodes.map(n => n.type))]
    return { score: Math.min(types.length / 5, 1), value: types.length }
  }

  calculateEfficiency(networkData) {
    // Simplified efficiency metric
    return { score: 0.8, value: 0.8 }
  }

  calculateResilience(networkData) {
    // Simplified resilience metric
    return { score: 0.7, value: 0.7 }
  }

  generateHealthRecommendations(metrics) {
    const recommendations = []
    
    if (metrics.connectivity.score < 0.5) {
      recommendations.push('Increase network connectivity through targeted introductions')
    }
    
    if (metrics.diversity.score < 0.6) {
      recommendations.push('Expand entity type diversity to improve network balance')
    }
    
    return recommendations
  }

  generateHealthAlerts(metrics) {
    const alerts = []
    
    Object.entries(metrics).forEach(([key, metric]) => {
      if (metric.score < 0.3) {
        alerts.push({
          type: 'warning',
          metric: key,
          message: `${key} score is critically low (${(metric.score * 100).toFixed(1)}%)`
        })
      }
    })
    
    return alerts
  }
}

// Global analytics instance
export const advancedAnalytics = new AdvancedAnalytics()

export default {
  AdvancedAnalytics,
  advancedAnalytics
}
