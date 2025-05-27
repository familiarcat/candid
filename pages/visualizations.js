import { useState, useRef } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import VisualizationDataProvider from '../components/visualizations/VisualizationDataProvider'
import GraphExplorerGrid from '../components/visualizations/GraphExplorerGrid'
import EnhancedGraphExplorer from '../components/visualizations/EnhancedGraphExplorer'
import NetworkView from '../components/visualizations/NetworkView'
import GlobalAnalysisView from '../components/visualizations/GlobalAnalysisView'
import VisualizationDebugger from '../components/visualizations/VisualizationDebugger'
import SimpleVisualizationTest from '../components/visualizations/SimpleVisualizationTest'
import CollaborationPanel from '../components/collaboration/CollaborationPanel'
import ExportControls from '../components/visualizations/ExportControls'


export default function Visualizations() {
  const [activeTab, setActiveTab] = useState('enhanced') // Default to enhanced explorer
  const [visualizationState, setVisualizationState] = useState({})
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] })
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showExportControls, setShowExportControls] = useState(false)
  const svgRef = useRef(null)

  // Tab configuration
  const tabs = [
    {
      id: 'enhanced',
      name: 'Enhanced Explorer',
      icon: '🎯',
      description: 'Context-aware visualization with root node emphasis'
    },
    {
      id: 'explorer',
      name: 'Classic Explorer',
      icon: '🔍',
      description: 'Traditional entity-based exploration'
    },
    {
      id: 'network',
      name: 'Network View',
      icon: '🕸️',
      description: 'Global network visualization'
    },
    {
      id: 'global',
      name: 'Global Analysis',
      icon: '🌐',
      description: 'Comprehensive network analysis'
    },
    {
      id: 'debug',
      name: 'Debug',
      icon: '🔍',
      description: 'Debug visualization data'
    },
    {
      id: 'test',
      name: 'Test',
      icon: '🧪',
      description: 'Test visualization rendering'
    }
  ]

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'enhanced':
        return <EnhancedGraphExplorer />

      case 'explorer':
        return <GraphExplorerGrid />

      case 'network':
        return <NetworkView />

      case 'global':
        return <GlobalAnalysisView />

      case 'debug':
        return <VisualizationDebugger />

      case 'test':
        return <SimpleVisualizationTest />

      default:
        return <EnhancedGraphExplorer />
    }
  }

  return (
    <VisualizationDataProvider>
      <Layout>
        <Head>
          <title>Visualizations - Candid Connections</title>
          <meta name="description" content="Explore network connections and relationships" />
        </Head>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Network Visualizations</h1>
                <p className="text-gray-600">
                  Explore connections and relationships from multiple perspectives
                </p>
              </div>

              {/* Enterprise Feature Controls */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowCollaboration(!showCollaboration)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showCollaboration
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  👥 Collaborate
                </button>
                <button
                  onClick={() => setShowExportControls(!showExportControls)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showExportControls
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📤 Export
                </button>
                <button
                  onClick={() => window.open('/dashboard', '_blank')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  📊 Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation - Bento/Brockman Design */}
          <div className="mb-8">
            {/* Responsive Tab Container */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Desktop Navigation */}
              <div className="hidden md:block border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 text-center border-r border-gray-200 last:border-r-0 transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-xl">{tab.icon}</span>
                        <span className="text-sm font-medium">{tab.name}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Mobile Navigation - Dropdown */}
              <div className="md:hidden border-b border-gray-200">
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full py-4 px-6 text-center bg-white border-none focus:ring-0 focus:outline-none appearance-none text-gray-900 font-medium"
                  >
                    {tabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.icon} {tab.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Tab Description */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{tabs.find(tab => tab.id === activeTab)?.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {tabs.find(tab => tab.id === activeTab)?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tabs.find(tab => tab.id === activeTab)?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-screen">
            {renderTabContent()}
          </div>

          {/* Enterprise Feature Panels */}
          <div className="fixed bottom-4 right-4 space-y-4 z-50">
            {/* Collaboration Panel */}
            {showCollaboration && (
              <div className="w-80">
                <CollaborationPanel
                  visualizationState={visualizationState}
                  onStateChange={setVisualizationState}
                />
              </div>
            )}

            {/* Export Controls */}
            {showExportControls && (
              <div className="w-80">
                <ExportControls
                  networkData={networkData}
                  visualizationState={visualizationState}
                  svgElement={svgRef.current}
                />
              </div>
            )}
          </div>
        </div>
      </Layout>
    </VisualizationDataProvider>
  )
}
