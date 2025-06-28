// Export Controls Component for Candid Connections
// Provides comprehensive export options for visualizations

import { useState } from 'react'
import {
  exportVisualizationAsPNG,
  exportVisualizationAsSVG,
  exportNetworkDataAsJSON,
  exportNetworkDataAsCSV,
  copyShareableLinkToClipboard,
  exportVisualizationReport
} from '../../lib/exportSystem'

export default function ExportControls({
  networkData = { nodes: [], links: [] },
  visualizationState = {},
  svgElement = null,
  className = ''
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const showStatus = (message, type = 'success') => {
    setExportStatus({ message, type })
    setTimeout(() => setExportStatus(''), 3000)
  }

  const handleExport = async (exportFn, ...args) => {
    setIsExporting(true)
    try {
      await exportFn(...args)
      showStatus('Export completed successfully!', 'success')
    } catch (error) {
      console.error('Export error:', error)
      showStatus('Export failed. Please try again.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShareableLink = async () => {
    setIsExporting(true)
    try {
      const link = await copyShareableLinkToClipboard(visualizationState)
      showStatus('Shareable link copied to clipboard!', 'success')
    } catch (error) {
      console.error('Share error:', error)
      showStatus('Failed to copy link. Please try again.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      id: 'png',
      label: 'Export as PNG',
      icon: '🖼️',
      description: 'High-quality image file',
      action: () => svgElement && handleExport(exportVisualizationAsPNG, svgElement),
      disabled: !svgElement
    },
    {
      id: 'svg',
      label: 'Export as SVG',
      icon: '📐',
      description: 'Scalable vector graphics',
      action: () => svgElement && handleExport(exportVisualizationAsSVG, svgElement),
      disabled: !svgElement
    },
    {
      id: 'json',
      label: 'Export Data (JSON)',
      icon: '📄',
      description: 'Raw network data',
      action: () => handleExport(exportNetworkDataAsJSON, networkData)
    },
    {
      id: 'csv-nodes',
      label: 'Export Nodes (CSV)',
      icon: '📊',
      description: 'Node data spreadsheet',
      action: () => handleExport(exportNetworkDataAsCSV, networkData, 'network-nodes.csv', 'nodes')
    },
    {
      id: 'csv-links',
      label: 'Export Links (CSV)',
      icon: '🔗',
      description: 'Connection data spreadsheet',
      action: () => handleExport(exportNetworkDataAsCSV, networkData, 'network-links.csv', 'links')
    },
    {
      id: 'report',
      label: 'Export Report',
      icon: '📋',
      description: 'Comprehensive HTML report',
      action: () => handleExport(exportVisualizationReport, networkData, visualizationState)
    },
    {
      id: 'share',
      label: 'Copy Share Link',
      icon: '🔗',
      description: 'Shareable URL',
      action: handleShareableLink
    }
  ]

  if (!isExpanded) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Export Options</span>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isExporting}
          >
            📤
          </button>
        </div>
        {exportStatus && (
          <div className={`mt-2 text-xs ${
            exportStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {exportStatus.message}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Export Visualization</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Export Options */}
      <div className="p-4 space-y-3">
        {exportOptions.map(option => (
          <button
            key={option.id}
            onClick={option.action}
            disabled={isExporting || option.disabled}
            className={`w-full flex items-center p-3 rounded-lg border transition-all ${
              option.disabled
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : isExporting
                ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-wait'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <span className="text-xl mr-3">{option.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
            {isExporting && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        ))}
      </div>

      {/* Status */}
      {exportStatus && (
        <div className="p-4 border-t border-gray-200">
          <div className={`text-sm ${
            exportStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {exportStatus.message}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Nodes:</strong> {networkData.nodes?.length || 0}
            </div>
            <div>
              <strong>Links:</strong> {networkData.links?.length || 0}
            </div>
          </div>
          {visualizationState.rootNode && (
            <div className="mt-2">
              <strong>Root:</strong> {visualizationState.rootNode.name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
