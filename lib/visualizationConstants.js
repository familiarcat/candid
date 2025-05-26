// Centralized visualization constants for consistent colors and shapes across the application

// Node Colors (consistent with 3D legend)
export const NODE_COLORS = {
  company: {
    hex: 0x8b5cf6,        // Purple
    css: '#8b5cf6',       // For CSS/HTML usage
    rgb: 'rgb(139, 92, 246)',
    tailwind: 'purple-500'
  },
  authority: {
    hex: 0x00d4ff,        // Cyan/Primary
    css: '#00d4ff',
    rgb: 'rgb(0, 212, 255)',
    tailwind: 'primary-500'
  },
  jobSeeker: {
    hex: 0xf97316,        // Orange/Accent
    css: '#f97316',
    rgb: 'rgb(249, 115, 22)',
    tailwind: 'orange-500'
  },
  skill: {
    hex: 0x10b981,        // Green/Emerald
    css: '#10b981',
    rgb: 'rgb(16, 185, 129)',
    tailwind: 'emerald-500'
  },
  position: {
    hex: 0xef4444,        // Red
    css: '#ef4444',
    rgb: 'rgb(239, 68, 68)',
    tailwind: 'red-500'
  }
}

// Link/Connection Colors
export const LINK_COLORS = {
  employment: {
    hex: 0x8b5cf6,        // Purple (company connections)
    css: '#8b5cf6'
  },
  hiring: {
    hex: 0x00d4ff,        // Cyan (authority connections)
    css: '#00d4ff'
  },
  skill: {
    hex: 0xf97316,        // Orange (skill connections)
    css: '#f97316'
  },
  company: {
    hex: 0x8b5cf6,        // Purple (company relationships)
    css: '#8b5cf6'
  },
  preference: {
    hex: 0x10b981,        // Green (preference connections)
    css: '#10b981'
  },
  match: {
    hex: 0xef4444,        // Red (match connections)
    css: '#ef4444'
  },
  default: {
    hex: 0x6b7280,        // Gray (fallback)
    css: '#6b7280'
  }
}

// Node Shapes and Descriptions (consistent with 3D legend)
export const NODE_SHAPES = {
  company: {
    shape: 'sphere',
    description: 'Companies (Spheres)',
    icon: '🏢',
    clipPath: 'circle(50%)'  // For CSS shape representation
  },
  authority: {
    shape: 'cone',
    description: 'Authorities (Cones)',
    icon: '👔',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'  // Triangle for cone representation
  },
  jobSeeker: {
    shape: 'cube',
    description: 'Job Seekers (Cubes)',
    icon: '👥',
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'  // Square for cube
  },
  skill: {
    shape: 'octahedron',
    description: 'Skills (Octahedrons)',
    icon: '🛠️',
    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'  // Pentagon for octahedron
  },
  position: {
    shape: 'cylinder',
    description: 'Positions (Cylinders)',
    icon: '📋',
    clipPath: 'polygon(0% 20%, 100% 20%, 100% 80%, 0% 80%)'  // Rectangle for cylinder
  }
}

// Three.js Geometry Configurations
export const THREEJS_GEOMETRIES = {
  company: {
    type: 'SphereGeometry',
    params: [3, 16, 16]  // radius, widthSegments, heightSegments
  },
  authority: {
    type: 'ConeGeometry',
    params: [2, 4, 8]    // radius, height, radialSegments
  },
  jobSeeker: {
    type: 'BoxGeometry',
    params: [2.5, 2.5, 2.5]  // width, height, depth
  },
  skill: {
    type: 'OctahedronGeometry',
    params: [1.5]        // radius
  },
  position: {
    type: 'CylinderGeometry',
    params: [1.5, 1.5, 3, 8]  // radiusTop, radiusBottom, height, radialSegments
  }
}

// Background Geometry Configurations (smaller for background use)
export const BACKGROUND_GEOMETRIES = {
  company: {
    type: 'SphereGeometry',
    params: [2, 12, 12]
  },
  authority: {
    type: 'ConeGeometry',
    params: [1.5, 3, 6]
  },
  jobSeeker: {
    type: 'BoxGeometry',
    params: [2, 2, 2]
  },
  skill: {
    type: 'OctahedronGeometry',
    params: [1.2]
  },
  position: {
    type: 'CylinderGeometry',
    params: [1.2, 1.2, 2.5, 6]
  }
}

// Legend Configuration
export const LEGEND_CONFIG = [
  {
    type: 'company',
    color: NODE_COLORS.company.css,
    shape: NODE_SHAPES.company.clipPath,
    description: NODE_SHAPES.company.description,
    icon: NODE_SHAPES.company.icon
  },
  {
    type: 'authority',
    color: NODE_COLORS.authority.css,
    shape: NODE_SHAPES.authority.clipPath,
    description: NODE_SHAPES.authority.description,
    icon: NODE_SHAPES.authority.icon
  },
  {
    type: 'jobSeeker',
    color: NODE_COLORS.jobSeeker.css,
    shape: NODE_SHAPES.jobSeeker.clipPath,
    description: NODE_SHAPES.jobSeeker.description,
    icon: NODE_SHAPES.jobSeeker.icon
  },
  {
    type: 'skill',
    color: NODE_COLORS.skill.css,
    shape: NODE_SHAPES.skill.clipPath,
    description: NODE_SHAPES.skill.description,
    icon: NODE_SHAPES.skill.icon
  },
  {
    type: 'position',
    color: NODE_COLORS.position.css,
    shape: NODE_SHAPES.position.clipPath,
    description: NODE_SHAPES.position.description,
    icon: NODE_SHAPES.position.icon
  }
]

// Helper functions for consistent usage
export const getNodeColor = (nodeType, format = 'hex') => {
  const colorConfig = NODE_COLORS[nodeType] || NODE_COLORS.skill
  switch (format) {
    case 'css': return colorConfig.css
    case 'rgb': return colorConfig.rgb
    case 'tailwind': return colorConfig.tailwind
    case 'hex':
    default: return colorConfig.hex
  }
}

export const getLinkColor = (linkType, format = 'hex') => {
  const colorConfig = LINK_COLORS[linkType] || LINK_COLORS.default
  return format === 'css' ? colorConfig.css : colorConfig.hex
}

export const getNodeShape = (nodeType) => {
  return NODE_SHAPES[nodeType] || NODE_SHAPES.skill
}

export const getThreeJSGeometry = (nodeType, isBackground = false) => {
  const geometries = isBackground ? BACKGROUND_GEOMETRIES : THREEJS_GEOMETRIES
  return geometries[nodeType] || geometries.skill
}
