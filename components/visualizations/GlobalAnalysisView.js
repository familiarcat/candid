import { useMemo } from 'react'
import { useVisualizationData } from './VisualizationDataProvider'

export default function GlobalAnalysisView() {
  const { rawData, globalNetworkData, loading, errors } = useVisualizationData()

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    if (loading || !rawData.companies.length) return null

    const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = rawData

    // Company analysis
    const companyAnalysis = {
      total: companies.length,
      bySize: {
        startup: companies.filter(c => (c.employee_count || c.employeeCount || 0) < 100).length,
        midsize: companies.filter(c => {
          const count = c.employee_count || c.employeeCount || 0
          return count >= 100 && count < 1000
        }).length,
        enterprise: companies.filter(c => (c.employee_count || c.employeeCount || 0) >= 1000).length
      },
      industries: [...new Set(companies.map(c => c.industry).filter(Boolean))].length
    }

    // Authority analysis
    const authorityAnalysis = {
      total: hiringAuthorities.length,
      byPower: {
        ultimate: hiringAuthorities.filter(a => a.hiring_power === 'Ultimate' || a.hiringPower === 'Ultimate').length,
        high: hiringAuthorities.filter(a => a.hiring_power === 'High' || a.hiringPower === 'High').length,
        medium: hiringAuthorities.filter(a => a.hiring_power === 'Medium' || a.hiringPower === 'Medium').length
      },
      avgPerCompany: companies.length > 0 ? (hiringAuthorities.length / companies.length).toFixed(1) : 0
    }

    // Job seeker analysis
    const jobSeekerAnalysis = {
      total: jobSeekers.length,
      withSkills: jobSeekers.filter(js => js.skills && js.skills.length > 0).length,
      avgSkillsPerSeeker: jobSeekers.length > 0 ? 
        (jobSeekers.reduce((sum, js) => sum + (js.skills?.length || 0), 0) / jobSeekers.length).toFixed(1) : 0
    }

    // Skills analysis
    const skillsAnalysis = {
      total: skills.length,
      mostCommon: skills.slice(0, 5).map(skill => ({
        name: skill.name,
        seekerCount: jobSeekers.filter(js => js.skills?.includes(skill.name)).length,
        authorityCount: hiringAuthorities.filter(auth => 
          auth.desired_skills?.includes(skill.name) || 
          auth.skillsLookingFor?.includes(skill.name)
        ).length
      }))
    }

    // Match analysis
    const matchAnalysis = {
      total: matches.length,
      highQuality: matches.filter(m => (m.compatibility_score || m.score || 0) >= 0.8).length,
      avgScore: matches.length > 0 ? 
        (matches.reduce((sum, m) => sum + (m.compatibility_score || m.score || 0), 0) / matches.length).toFixed(2) : 0,
      byCompany: companies.map(company => ({
        name: company.name,
        matchCount: matches.filter(match => {
          const authority = hiringAuthorities.find(auth => auth.id === match.hiring_authority_id)
          return authority && authority.company_id === company.id
        }).length
      })).sort((a, b) => b.matchCount - a.matchCount).slice(0, 5)
    }

    // Network analysis
    const networkAnalysis = {
      density: globalNetworkData.nodes.length > 0 ? 
        (globalNetworkData.links.length / (globalNetworkData.nodes.length * (globalNetworkData.nodes.length - 1) / 2)).toFixed(4) : 0,
      avgDegree: globalNetworkData.nodes.length > 0 ? 
        (globalNetworkData.links.length * 2 / globalNetworkData.nodes.length).toFixed(1) : 0,
      components: 1, // Simplified - would need graph analysis for actual components
      clustering: 0.3 // Placeholder - would need actual clustering coefficient calculation
    }

    return {
      company: companyAnalysis,
      authority: authorityAnalysis,
      jobSeeker: jobSeekerAnalysis,
      skills: skillsAnalysis,
      match: matchAnalysis,
      network: networkAnalysis
    }
  }, [rawData, globalNetworkData, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing network data...</p>
        </div>
      </div>
    )
  }

  if (errors.length > 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Error Loading Analysis Data</h3>
        <ul className="text-red-700 text-sm space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Analysis Data</h3>
        <p className="text-gray-600">No data available for analysis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Network Analysis</h2>
        <p className="text-gray-600">
          Comprehensive analysis of the entire network ecosystem
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics.company.total}</div>
          <div className="text-sm text-blue-600">Companies</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{analytics.authority.total}</div>
          <div className="text-sm text-green-600">Hiring Authorities</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{analytics.jobSeeker.total}</div>
          <div className="text-sm text-purple-600">Job Seekers</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{analytics.match.total}</div>
          <div className="text-sm text-orange-600">Total Matches</div>
        </div>
      </div>

      {/* Detailed Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🏢 Company Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Company Size Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Startups (&lt;100 employees)</span>
                  <span className="font-medium">{analytics.company.bySize.startup}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mid-size (100-999 employees)</span>
                  <span className="font-medium">{analytics.company.bySize.midsize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Enterprise (1000+ employees)</span>
                  <span className="font-medium">{analytics.company.bySize.enterprise}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Industries Represented</span>
                <span className="font-medium">{analytics.company.industries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Authority Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">👥 Authority Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Hiring Power Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ultimate Power</span>
                  <span className="font-medium text-red-600">{analytics.authority.byPower.ultimate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Power</span>
                  <span className="font-medium text-orange-600">{analytics.authority.byPower.high}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium Power</span>
                  <span className="font-medium text-yellow-600">{analytics.authority.byPower.medium}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Authorities per Company</span>
                <span className="font-medium">{analytics.authority.avgPerCompany}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Skills Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top Skills</h4>
              <div className="space-y-2">
                {analytics.skills.mostCommon.map((skill, index) => (
                  <div key={skill.name} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{skill.name}</span>
                    <div className="flex space-x-2 text-xs">
                      <span className="text-purple-600">{skill.seekerCount} seekers</span>
                      <span className="text-green-600">{skill.authorityCount} demand</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Skills per Job Seeker</span>
                <span className="font-medium">{analytics.jobSeeker.avgSkillsPerSeeker}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Match Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Match Quality</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Quality Matches (80%+)</span>
                  <span className="font-medium text-green-600">{analytics.match.highQuality}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Match Score</span>
                  <span className="font-medium">{(analytics.match.avgScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Top Companies by Matches</h4>
              <div className="space-y-1">
                {analytics.match.byCompany.slice(0, 3).map((company, index) => (
                  <div key={company.name} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{company.name}</span>
                    <span className="font-medium">{company.matchCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Topology Analysis */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🕸️ Network Topology</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.network.density}</div>
            <div className="text-sm text-gray-600">Network Density</div>
            <div className="text-xs text-gray-500 mt-1">
              {parseFloat(analytics.network.density) > 0.1 ? 'Dense' : 'Sparse'} network
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.network.avgDegree}</div>
            <div className="text-sm text-gray-600">Avg Connections</div>
            <div className="text-xs text-gray-500 mt-1">Per node</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.network.components}</div>
            <div className="text-sm text-gray-600">Connected Components</div>
            <div className="text-xs text-gray-500 mt-1">Network segments</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{(analytics.network.clustering * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Clustering Coefficient</div>
            <div className="text-xs text-gray-500 mt-1">Local connectivity</div>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">💡 Key Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Strengths</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {analytics.match.highQuality} high-quality matches identified</li>
              <li>• {analytics.authority.byPower.ultimate} ultimate decision makers in network</li>
              <li>• {analytics.skills.total} unique skills represented</li>
              <li>• {analytics.company.industries} different industries covered</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Opportunities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Increase match quality from {(analytics.match.avgScore * 100).toFixed(0)}%</li>
              <li>• Expand network density ({analytics.network.density})</li>
              <li>• Target {analytics.company.bySize.enterprise} enterprise companies</li>
              <li>• Develop {analytics.jobSeeker.total - analytics.jobSeeker.withSkills} job seekers without skills</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
