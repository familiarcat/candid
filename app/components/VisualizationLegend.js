// Visualization Legend - Enhanced legend with emoji icons matching 3D shapes and proper colors
// Addresses the missing companies (purple) and shape/color mismatches

import { LEGEND_CONFIG, NODE_COLORS } from '../lib/visualizationConstants'

export default function VisualizationLegend({ 
  compact = false, 
  showShapes = false,
  className = '' 
}) {
  const legendItems = [
    {
      type: 'company',
      color: NODE_COLORS.company.css, // Purple #8b5cf6
      shape: '🏢', // Building emoji for sphere
      description: showShapes ? 'Companies (Spheres)' : 'Companies',
      count: null
    },
    {
      type: 'authority',
      color: NODE_COLORS.authority.css, // Cyan #00d4ff
      shape: '👔', // Necktie emoji for cone
      description: showShapes ? 'Authorities (Cones)' : 'Hiring Authorities',
      count: null
    },
    {
      type: 'jobSeeker',
      color: NODE_COLORS.jobSeeker.css, // Orange #f97316
      shape: '👥', // People emoji for cube
      description: showShapes ? 'Job Seekers (Cubes)' : 'Job Seekers',
      count: null
    },
    {
      type: 'skill',
      color: NODE_COLORS.skill.css, // Green #10b981
      shape: '🛠️', // Tools emoji for octahedron
      description: showShapes ? 'Skills (Octahedrons)' : 'Skills',
      count: null
    },
    {
      type: 'position',
      color: NODE_COLORS.position.css, // Red #ef4444
      shape: '📋', // Clipboard emoji for cylinder
      description: showShapes ? 'Positions (Cylinders)' : 'Positions',
      count: null
    }
  ]

  if (compact) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-3 shadow-lg ${className}`}>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Legend</h4>
        <div className="space-y-1">
          {legendItems.map(item => (
            <div key={item.type} className="flex items-center space-x-2">
              {/* Color Indicator */}
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              {/* Emoji Shape */}
              <span className="text-sm">{item.shape}</span>
              {/* Description */}
              <span className="text-xs text-gray-700 font-medium">
                {item.description}
              </span>
            </div>
          ))}
        </div>
        
        {/* Connection Types */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <h5 className="text-xs font-semibold text-gray-600 mb-1">Connections</h5>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-purple-500 rounded"></div>
              <span className="text-xs text-gray-600">Employment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600">Matches</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Skills</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full legend for larger displays
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Network Legend</h3>
      
      {/* Entity Types */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Entity Types</h4>
        {legendItems.map(item => (
          <div key={item.type} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            {/* Color Indicator with Shape Preview */}
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-lg">{item.shape}</span>
            </div>
            
            {/* Description */}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">
                {item.description}
              </div>
              {showShapes && (
                <div className="text-xs text-gray-500">
                  3D Shape: {item.description.split('(')[1]?.replace(')', '') || 'Sphere'}
                </div>
              )}
            </div>
            
            {/* Count (if available) */}
            {item.count !== null && (
              <div className="text-sm font-medium text-gray-600">
                {item.count}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Connection Types */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Connection Types</h4>
        <div className="space-y-2">
          {[
            { type: 'employment', color: '#8b5cf6', label: 'Employment', description: 'Company-Authority relationships' },
            { type: 'match', color: '#ef4444', label: 'Matches', description: 'Job Seeker-Authority matches' },
            { type: 'skill', color: '#10b981', label: 'Skills', description: 'Skill requirements and expertise' },
            { type: 'hiring', color: '#00d4ff', label: 'Hiring', description: 'Authority hiring preferences' },
            { type: 'preference', color: '#f97316', label: 'Preferences', description: 'Job seeker preferences' }
          ].map(connection => (
            <div key={connection.type} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div 
                className="w-4 h-1 rounded-full"
                style={{ backgroundColor: connection.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {connection.label}
                </div>
                <div className="text-xs text-gray-500">
                  {connection.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Match Quality Indicators */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Match Quality</h4>
        <div className="space-y-2">
          {[
            { range: '90-100%', color: '#10b981', label: 'Excellent Match', description: 'Strong skill alignment & hierarchy fit' },
            { range: '75-89%', color: '#f59e0b', label: 'Good Match', description: 'Good compatibility with minor gaps' },
            { range: '60-74%', color: '#f97316', label: 'Fair Match', description: 'Moderate fit, may need development' },
            { range: '50-59%', color: '#ef4444', label: 'Weak Match', description: 'Limited compatibility' }
          ].map(quality => (
            <div key={quality.range} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: quality.color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{quality.label}</span>
                  <span className="text-xs font-mono text-gray-600">{quality.range}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {quality.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Interactive Controls Hint */}
      {showShapes && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">3D Controls</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• <strong>Mouse:</strong> Click and drag to rotate</div>
            <div>• <strong>Scroll:</strong> Zoom in/out</div>
            <div>• <strong>Right-click:</strong> Pan view</div>
            <div>• <strong>Click Node:</strong> Focus and highlight</div>
          </div>
        </div>
      )}
    </div>
  )
}
