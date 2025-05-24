import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { generateSampleGraphData } from '../lib/graphData'
import GraphVisualization2D from '../components/GraphVisualization2D'

export default function Dashboard() {
  const [stats, setStats] = useState({
    jobSeekers: 0,
    companies: 0,
    positions: 0,
    matches: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // In a real app, fetch from API
    // For now, generate sample data
    setTimeout(() => {
      setStats({
        jobSeekers: 124,
        companies: 37,
        positions: 85,
        matches: 213
      })
      
      setRecentActivity([
        { id: 1, type: 'match', description: 'New match: John Doe and Senior Developer at TechCorp', time: '2 hours ago' },
        { id: 2, type: 'company', description: 'New company joined: InnovateTech', time: '5 hours ago' },
        { id: 3, type: 'position', description: 'New position posted: Full Stack Developer at WebSolutions', time: '1 day ago' },
        { id: 4, type: 'jobSeeker', description: 'New job seeker: Sarah Johnson', time: '1 day ago' },
        { id: 5, type: 'match', description: 'New match: Emily Chen and UX Designer at DesignHub', time: '2 days ago' }
      ])
      
      setGraphData(generateSampleGraphData())
      setLoading(false)
    }, 1000)
  }, [])
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'match': return '🤝'
      case 'company': return '🏢'
      case 'position': return '📋'
      case 'jobSeeker': return '👤'
      default: return '📄'
    }
  }
  
  return (
    <Layout>
      <Head>
        <title>Dashboard | Candid Connections Katra</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Job Seekers</h3>
            <p className="text-3xl font-bold">{stats.jobSeekers}</p>
            <Link href="/job-seekers" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Companies</h3>
            <p className="text-3xl font-bold">{stats.companies}</p>
            <Link href="/companies" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Open Positions</h3>
            <p className="text-3xl font-bold">{stats.positions}</p>
            <Link href="/positions" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Matches</h3>
            <p className="text-3xl font-bold">{stats.matches}</p>
            <Link href="/matches" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Visualization */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Network Visualization</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="h-96">
                <GraphVisualization2D data={graphData} />
              </div>
            )}
            <div className="mt-4 text-right">
              <Link href="/network" className="text-indigo-600 text-sm">
                View full network →
              </Link>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <Link href="/activity" className="text-indigo-600 text-sm">
                View all activity →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}