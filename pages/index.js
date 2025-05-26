import { useMemo } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import DashboardCards from '../components/DashboardCards'
import NetworkVisualization3DBackground from '../components/visualizations/NetworkVisualization3DBackground'
import { useData } from '../contexts/DataContext'
import { generateNetworkData } from '../lib/graphDataGenerator'

export default function Home() {
  const {
    stats,
    loading,
    companies,
    hiringAuthorities,
    jobSeekers,
    skills,
    positions,
    matches
  } = useData()

  // Memoized network data for 3D background visualization - only regenerates when data changes
  const networkData = useMemo(() => {
    if (companies.length === 0) {
      return { nodes: [], links: [] }
    }

    console.log('🎨 Generating dashboard 3D background data (memoized)...')
    return generateNetworkData(
      companies,
      hiringAuthorities,
      jobSeekers,
      skills,
      positions,
      matches
    )
  }, [companies, hiringAuthorities, jobSeekers, skills, positions, matches])

  return (
    <Layout>
      <Head>
        <title>Talent Network | Connect • Match • Succeed</title>
        <meta name="description" content="Advanced graph-based talent matching platform connecting job seekers with opportunities through intelligent relationship mapping." />
        <meta name="keywords" content="job matching, talent platform, career connections, hiring, recruitment, network" />
      </Head>

      {/* Interconnective Hero Section - 3D Network Background */}
      <div className="relative bg-gradient-to-br from-white/95 via-primary-50/80 to-secondary-50/90 backdrop-blur-sm rounded-3xl p-12 mb-12 overflow-hidden border border-primary-100/50 shadow-soft">
        {/* 3D Network Visualization Background */}
        {networkData.nodes.length > 0 && (
          <NetworkVisualization3DBackground
            data={networkData}
            width={1200}
            height={400}
            opacity={0.45}
            autoRotate={true}
            rotationSpeed={0.0008}
            cameraDistance={140}
            lightIntensity={0.54}
            className="opacity-80"
          />
        )}

        {/* Floating Connection Elements - Reduced for 3D background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle accent dots */}
          <div className="absolute top-8 left-8 w-2 h-2 bg-accent-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-primary-400 rounded-full animate-pulse opacity-25" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-secondary-800 mb-6">
            Connect to the Right<br />
            <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-600 bg-clip-text text-transparent">
              Hiring Authority
            </span>
          </h1>
          <p className="text-xl text-secondary-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Skip the job board grind. Our graph database maps your skills directly to the <span className="text-primary-600 font-semibold">correct hiring authority</span> based on company hierarchy, position requirements, and skill connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/matches" className="btn-primary text-lg px-8 py-4 shadow-medium hover:shadow-large transition-shadow duration-300">
              🎯 View Authority Matches
            </a>
            <a href="/visualizations" className="btn-outline text-lg px-8 py-4 hover:bg-primary-50 transition-colors duration-300">
              📊 Explore Network
            </a>
          </div>
        </div>
      </div>

      {/* Network Stats - Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-500">
            {loading.global ? '...' : stats.totalJobSeekers}
          </div>
          <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Job Seekers</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-accent-600">
            {loading.global ? '...' : stats.totalAuthorities}
          </div>
          <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Hiring Authorities</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-secondary-600">
            {loading.global ? '...' : stats.totalCompanies}
          </div>
          <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Companies</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600">
            {loading.global ? '...' : stats.skillConnections}
          </div>
          <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Skill Connections</div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-candid-navy-900 mb-8 text-center">
          Explore the Platform
        </h2>
        <DashboardCards />
      </div>

      {/* Professional Networking Section */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl p-12 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-secondary-800 mb-4">
            GIVE YOUR CLIENTS AND FRIENDS THE EDGE
          </h2>

          {/* Business Figures Illustration */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            {/* Business Person 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full mb-2 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
              <div className="w-12 h-20 bg-primary-600 rounded-t-lg"></div>
              <div className="w-16 h-12 bg-secondary-800 rounded-b-lg"></div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>

            {/* Business Person 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent-500 rounded-full mb-2 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
              <div className="w-12 h-20 bg-accent-600 rounded-t-lg"></div>
              <div className="w-16 h-12 bg-secondary-800 rounded-b-lg"></div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 h-1 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full"></div>

            {/* Business Person 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary-600 rounded-full mb-2 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
              <div className="w-12 h-20 bg-secondary-700 rounded-t-lg"></div>
              <div className="w-16 h-12 bg-secondary-800 rounded-b-lg"></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-secondary-700 leading-relaxed mb-8">
            No approval is necessary to become a referral partner—anyone can join! This is especially beneficial if you work with or know people in need of jobs but
            aren't able to assist them yourself. Let us help you make an impact and earn in the process. Simply register below as a Referral Partner. You will gain access
            to a referral portal where you can submit contact information for job seeking candidates. Once someone signs up through your referral, you'll earn a $50
            referral fee. It's that simple—help others and get rewarded.
          </p>

          <button className="bg-secondary-800 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary-900 transition-all duration-300 shadow-lg hover:shadow-xl underline">
            GET SIGNED UP NOW
          </button>
        </div>
      </div>

      {/* Graph Database Features */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-2xl font-semibold text-candid-navy-900 mb-6 text-center">
            Graph Database Powered Matching
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl">🏢</span>
              </div>
              <h3 className="text-lg font-semibold text-candid-navy-900 mb-2">Hiring Authority Hierarchy</h3>
              <p className="text-candid-gray-600 text-sm">
                Maps company organizational structure to identify the correct hiring authority based on company size, role level, and decision-making power.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold text-candid-navy-900 mb-2">Skill Connection Edges</h3>
              <p className="text-candid-gray-600 text-sm">
                Graph edges represent skill matches, experience overlap, and requirement alignment between job seekers and hiring authorities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl">⚖️</span>
              </div>
              <h3 className="text-lg font-semibold text-candid-navy-900 mb-2">Company Size Logic</h3>
              <p className="text-candid-gray-600 text-sm">
                Startup (&lt;100) routes to executives, mid-size (100-1000) to department heads, enterprise (&gt;1000) to specialized HR hierarchy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-3xl p-12 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-secondary-800 mb-4">
            How Graph Database Connections Work
          </h2>
          <p className="text-lg text-secondary-700 max-w-3xl mx-auto">
            Our platform uses graph database technology to create multi-dimensional connections between job seekers, skills, positions, and hiring authorities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="font-semibold text-secondary-800 mb-2 text-center">Job Seeker Profile</h3>
            <p className="text-sm text-secondary-600 text-center">
              Skills, experience, and career goals create the foundation node in our graph.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="font-semibold text-secondary-800 mb-2 text-center">Company Analysis</h3>
            <p className="text-sm text-secondary-600 text-center">
              Company size determines hiring authority hierarchy and decision-making structure.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="font-semibold text-secondary-800 mb-2 text-center">Edge Weighting</h3>
            <p className="text-sm text-secondary-600 text-center">
              Skill matches and experience overlap create weighted connections between nodes.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">4</span>
            </div>
            <h3 className="font-semibold text-secondary-800 mb-2 text-center">Authority Match</h3>
            <p className="text-sm text-secondary-600 text-center">
              Algorithm identifies the hiring authority with strongest connection weight.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}