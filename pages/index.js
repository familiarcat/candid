import Head from 'next/head'
import Layout from '../components/Layout'
import DashboardCards from '../components/DashboardCards'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Candid Connections Katra | Professional Talent Matching Platform</title>
        <meta name="description" content="Advanced graph-based talent matching platform connecting job seekers with opportunities through intelligent relationship mapping." />
        <meta name="keywords" content="job matching, talent platform, career connections, hiring, recruitment" />
      </Head>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-candid-navy-900 mb-4">
          Welcome to <span className="text-gradient">Candid Connections</span>
        </h1>
        <p className="text-xl text-candid-gray-600 max-w-3xl mx-auto leading-relaxed">
          The intelligent talent matching platform that visualizes connections between job seekers,
          companies, positions, and skills through advanced graph database technology.
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">156</div>
            <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Job Seekers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary-600">23</div>
            <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-600">89</div>
            <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Open Positions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-candid-blue-600">342</div>
            <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Connections</div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-candid-navy-900 mb-8 text-center">
          Explore the Platform
        </h2>
        <DashboardCards />
      </div>

      {/* Features Section */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-2xl font-semibold text-candid-navy-900 mb-6 text-center">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-candid-navy-900 mb-2">Smart Matching</h3>
              <p className="text-candid-gray-600 text-sm">
                AI-powered algorithms analyze skills, experience, and preferences to create optimal job matches.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-candid-navy-900 mb-2">Network Visualization</h3>
              <p className="text-candid-gray-600 text-sm">
                Interactive 2D and 3D visualizations reveal hidden connections and opportunities in the job market.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-candid-navy-900 mb-2">Market Analytics</h3>
              <p className="text-candid-gray-600 text-sm">
                Real-time insights into skill demand, salary trends, and market opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}