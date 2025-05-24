import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import GraphVisualization2D from '../components/GraphVisualization2D'

export default function JobSeekers() {
  const [jobSeekers, setJobSeekers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)
  
  useEffect(() => {
    const fetchJobSeekers = async () => {
      try {
        const response = await fetch('/api/job-seekers')
        if (!response.ok) throw new Error('Failed to fetch job seekers')
        
        const data = await response.json()
        setJobSeekers(data)
        
        // Create sample graph data for visualization
        // In a real app, this would come from a dedicated API endpoint
        const nodes = data.map(js => ({
          id: js._key,
          name: js.name,
          type: 'jobSeeker',
          size: 8
        }))
        
        // Sample links - in real app these would be actual relationships
        const links = []
        if (nodes.length > 1) {
          for (let i = 0; i < nodes.length - 1; i++) {
            links.push({
              source: nodes[i].id,
              target: nodes[i + 1].id,
              value: 1
            })
          }
        }
        
        setGraphData({ nodes, links })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobSeekers()
  }, [])
  
  return (
    <Layout>
      <Head>
        <title>Job Seekers | Candid Connections Katra</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Job Seekers</h1>
        
        {loading && <p>Loading job seekers...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Job Seekers List</h2>
                {jobSeekers.length === 0 ? (
                  <p>No job seekers found.</p>
                ) : (
                  <ul className="divide-y">
                    {jobSeekers.map(js => (
                      <li key={js._key} className="py-3">
                        <p className="font-medium">{js.name}</p>
                        <p className="text-sm text-gray-500">{js.title}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Network Visualization</h2>
                {graphData ? (
                  <GraphVisualization2D data={graphData} />
                ) : (
                  <p>No visualization data available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}