import { useState } from 'react'
import GraphVisualization2D from './GraphVisualization2D'
import GraphVisualization3D from './GraphVisualization3D'

export default function VisualizationModal({ isOpen, onClose, data, title }) {
  const [viewMode, setViewMode] = useState('2D')
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{title || 'Network Visualization'}</h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('2D')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        viewMode === '2D' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      2D View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('3D')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        viewMode === '3D' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      3D View
                    </button>
                  </div>
                </div>
                
                <div className="mt-2">
                  {viewMode === '2D' ? (
                    <GraphVisualization2D data={data} />
                  ) : (
                    <GraphVisualization3D data={data} />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}