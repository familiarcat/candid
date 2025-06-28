// Export System for Candid Connections
// Provides comprehensive export capabilities for visualizations and data

/**
 * Export visualization as PNG image
 */
export async function exportVisualizationAsPNG(svgElement, filename = 'visualization.png', options = {}) {
  const {
    width = 1200,
    height = 800,
    backgroundColor = '#ffffff',
    scale = 2 // For high DPI
  } = options

  try {
    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')

    // Set background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        
        // Cleanup
        URL.revokeObjectURL(url)
        URL.revokeObjectURL(svgUrl)
      }, 'image/png')
    }
    img.src = svgUrl

  } catch (error) {
    console.error('Error exporting PNG:', error)
    throw error
  }
}

/**
 * Export visualization as SVG
 */
export function exportVisualizationAsSVG(svgElement, filename = 'visualization.svg') {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting SVG:', error)
    throw error
  }
}

/**
 * Export network data as JSON
 */
export function exportNetworkDataAsJSON(networkData, filename = 'network-data.json') {
  try {
    const jsonData = JSON.stringify(networkData, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting JSON:', error)
    throw error
  }
}

/**
 * Export network data as CSV
 */
export function exportNetworkDataAsCSV(networkData, filename = 'network-data.csv', type = 'nodes') {
  try {
    let csvContent = ''
    
    if (type === 'nodes' && networkData.nodes) {
      // Export nodes
      const headers = ['id', 'name', 'type', 'size', 'group']
      csvContent = headers.join(',') + '\n'
      
      networkData.nodes.forEach(node => {
        const row = [
          node.id || '',
          `"${(node.name || '').replace(/"/g, '""')}"`,
          node.type || '',
          node.size || '',
          node.group || ''
        ]
        csvContent += row.join(',') + '\n'
      })
    } else if (type === 'links' && networkData.links) {
      // Export links
      const headers = ['source', 'target', 'value', 'type']
      csvContent = headers.join(',') + '\n'
      
      networkData.links.forEach(link => {
        const row = [
          link.source?.id || link.source || '',
          link.target?.id || link.target || '',
          link.value || '',
          link.type || ''
        ]
        csvContent += row.join(',') + '\n'
      })
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting CSV:', error)
    throw error
  }
}

/**
 * Generate shareable visualization link
 */
export function generateShareableLink(visualizationState, baseUrl = window.location.origin) {
  try {
    const params = new URLSearchParams()
    
    // Encode visualization state
    if (visualizationState.rootNode) {
      params.set('root', `${visualizationState.rootNode.type}:${visualizationState.rootNode.id}`)
    }
    if (visualizationState.sortMethod) {
      params.set('sort', visualizationState.sortMethod)
    }
    if (visualizationState.layout) {
      params.set('layout', visualizationState.layout)
    }
    if (visualizationState.filters) {
      params.set('filters', btoa(JSON.stringify(visualizationState.filters)))
    }
    
    return `${baseUrl}/visualizations?${params.toString()}`
  } catch (error) {
    console.error('Error generating shareable link:', error)
    return baseUrl
  }
}

/**
 * Copy shareable link to clipboard
 */
export async function copyShareableLinkToClipboard(visualizationState) {
  try {
    const link = generateShareableLink(visualizationState)
    await navigator.clipboard.writeText(link)
    return link
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    throw error
  }
}

/**
 * Export comprehensive report as HTML
 */
export function exportVisualizationReport(networkData, visualizationState, filename = 'visualization-report.html') {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candid Connections - Visualization Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #00d4ff; padding-bottom: 20px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #00d4ff; }
        .section { margin: 30px 0; }
        .node-list, .link-list { max-height: 300px; overflow-y: auto; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 Candid Connections - Network Visualization Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        ${visualizationState.rootNode ? `<p><strong>Root Node:</strong> ${visualizationState.rootNode.name} (${visualizationState.rootNode.type})</p>` : ''}
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${networkData.nodes?.length || 0}</div>
            <div>Total Nodes</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${networkData.links?.length || 0}</div>
            <div>Total Connections</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${new Set(networkData.nodes?.map(n => n.type)).size || 0}</div>
            <div>Entity Types</div>
        </div>
    </div>

    <div class="section">
        <h2>📊 Network Overview</h2>
        <p>This visualization represents the network connections within the Candid Connections platform, showing relationships between job seekers, hiring authorities, companies, positions, and skills.</p>
    </div>

    <div class="section">
        <h2>🎯 Nodes</h2>
        <div class="node-list">
            <table>
                <thead>
                    <tr><th>Name</th><th>Type</th><th>Connections</th></tr>
                </thead>
                <tbody>
                    ${networkData.nodes?.slice(0, 50).map(node => `
                        <tr>
                            <td>${node.name || 'Unnamed'}</td>
                            <td>${node.type || 'Unknown'}</td>
                            <td>${networkData.links?.filter(l => l.source?.id === node.id || l.target?.id === node.id).length || 0}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="3">No nodes available</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <h2>🔗 Connections</h2>
        <div class="link-list">
            <table>
                <thead>
                    <tr><th>Source</th><th>Target</th><th>Type</th></tr>
                </thead>
                <tbody>
                    ${networkData.links?.slice(0, 50).map(link => `
                        <tr>
                            <td>${link.source?.name || link.source || 'Unknown'}</td>
                            <td>${link.target?.name || link.target || 'Unknown'}</td>
                            <td>${link.type || 'Connection'}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="3">No connections available</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <h2>⚙️ Visualization Settings</h2>
        <ul>
            <li><strong>Sort Method:</strong> ${visualizationState.sortMethod || 'Default'}</li>
            <li><strong>Layout:</strong> ${visualizationState.layout || 'Force-directed'}</li>
            <li><strong>Max Distance:</strong> ${visualizationState.filters?.maxDistance || 3} hops</li>
        </ul>
    </div>

    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
        <p>Generated by Candid Connections - Graph-based talent matching platform</p>
    </footer>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting report:', error)
    throw error
  }
}

export default {
  exportVisualizationAsPNG,
  exportVisualizationAsSVG,
  exportNetworkDataAsJSON,
  exportNetworkDataAsCSV,
  generateShareableLink,
  copyShareableLinkToClipboard,
  exportVisualizationReport
}
