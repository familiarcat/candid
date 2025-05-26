import { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import VisualizationDataProvider from '../components/visualizations/VisualizationDataProvider'
import GraphExplorerGrid from '../components/visualizations/GraphExplorerGrid'
import EnhancedGraphExplorer from '../components/visualizations/EnhancedGraphExplorer'
import NetworkView from '../components/visualizations/NetworkView'
import GlobalAnalysisView from '../components/visualizations/GlobalAnalysisView'
import VisualizationDebugger from '../components/visualizations/VisualizationDebugger'
import SimpleVisualizationTest from '../components/visualizations/SimpleVisualizationTest'


export default function Visualizations() {
  const [activeTab, setActiveTab] = useState('enhanced') // Default to enhanced explorer

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Network Visualizations</h1>
            <p className="text-gray-600">
              Explore connections and relationships from multiple perspectives
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab description */}
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-screen">
            {renderTabContent()}
          </div>
        </div>
      </Layout>
    </VisualizationDataProvider>
  )
}
