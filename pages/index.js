import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import DashboardCards from '../components/DashboardCards'

export default function Home() {
  const [stats, setStats] = useState({
    jobSeekers: 0,
    hiringAuthorities: 0,
    companies: 0,
    skills: 0,
    positions: 0,
    matches: 0,
    skillConnections: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [companiesRes, authoritiesRes, jobSeekersRes, skillsRes, positionsRes, matchesRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/hiring-authorities'),
          fetch('/api/job-seekers'),
          fetch('/api/skills'),
          fetch('/api/positions'),
          fetch('/api/matches')
        ])

        const [companies, authorities, jobSeekers, skills, positions, matches] = await Promise.all([
          companiesRes.json(),
          authoritiesRes.json(),
          jobSeekersRes.json(),
          skillsRes.json(),
          positionsRes.json(),
          matchesRes.json()
        ])

        // Calculate skill connections (job seeker skills + authority preferences + position requirements)
        const jobSeekerSkills = jobSeekers.reduce((total, js) => total + (js.skills?.length || 0), 0)
        const authorityPreferences = authorities.reduce((total, auth) => total + (auth.skillsLookingFor?.length || 0), 0)
        const positionRequirements = positions.reduce((total, pos) => total + (pos.requirements?.length || 0), 0)
        const skillConnections = jobSeekerSkills + authorityPreferences + positionRequirements

        setStats({
          jobSeekers: jobSeekers.length,
          hiringAuthorities: authorities.length,
          companies: companies.length,
          skills: skills.length,
          positions: positions.length,
          matches: matches.length,
          skillConnections
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])
  return (
    <Layout>
      <Head>
        <title>Candid Connections Katra | Professional Talent Matching Platform</title>
        <meta name="description" content="Advanced graph-based talent matching platform connecting job seekers with opportunities through intelligent relationship mapping." />
        <meta name="keywords" content="job matching, talent platform, career connections, hiring, recruitment" />
      </Head>

      {/* Network Hero Section - Hiring Authority Focus */}
      <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 rounded-3xl p-12 mb-12 overflow-hidden network-background">
        {/* Network Visualization - Hiring Authority Hierarchy */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {/* Central Company Node */}
          <div className="relative">
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">COMPANY</span>
            </div>

            {/* Hiring Authority Nodes */}
            <div className="absolute -top-16 -left-16 w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">CEO</span>
            </div>
            <div className="absolute -top-16 left-16 w-12 h-12 bg-accent-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">CTO</span>
            </div>
            <div className="absolute top-16 -left-16 w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">VP</span>
            </div>
            <div className="absolute top-16 left-16 w-12 h-12 bg-accent-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">HR</span>
            </div>

            {/* Job Seeker Nodes */}
            <div className="absolute -top-32 left-0 w-10 h-10 bg-primary-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">JS1</span>
            </div>
            <div className="absolute top-32 left-0 w-10 h-10 bg-primary-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">JS2</span>
            </div>
            <div className="absolute top-0 -left-32 w-10 h-10 bg-primary-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">JS3</span>
            </div>
            <div className="absolute top-0 left-32 w-10 h-10 bg-primary-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">JS4</span>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{width: '200px', height: '200px', left: '-100px', top: '-100px'}}>
              <line x1="100" y1="100" x2="84" y2="84" stroke="#00d4ff" strokeWidth="2" opacity="0.6"/>
              <line x1="100" y1="100" x2="116" y2="84" stroke="#00d4ff" strokeWidth="2" opacity="0.6"/>
              <line x1="100" y1="100" x2="84" y2="116" stroke="#00d4ff" strokeWidth="2" opacity="0.6"/>
              <line x1="100" y1="100" x2="116" y2="116" stroke="#00d4ff" strokeWidth="2" opacity="0.6"/>
              <line x1="84" y1="84" x2="100" y2="68" stroke="#f97316" strokeWidth="1" opacity="0.4"/>
              <line x1="116" y1="84" x2="100" y2="68" stroke="#f97316" strokeWidth="1" opacity="0.4"/>
              <line x1="84" y1="116" x2="100" y2="132" stroke="#f97316" strokeWidth="1" opacity="0.4"/>
              <line x1="116" y1="116" x2="100" y2="132" stroke="#f97316" strokeWidth="1" opacity="0.4"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Connect to the Right<br />
            <span className="cosmic-gradient">
              Hiring Authority
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Skip the job board grind. Our graph database maps your skills directly to the <span className="text-primary-400 font-semibold">correct hiring authority</span> based on company hierarchy, position requirements, and skill connections.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-secondary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Explore Network Connections
            </button>
            <button className="border-2 border-primary-400 text-primary-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-400 hover:text-secondary-900 transition-all duration-300">
              Visualize
            </button>
          </div>
        </div>
      </div>

      {/* Network Stats - Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-500">
            {loading ? '...' : stats.jobSeekers}
          </div>
          <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Job Seekers</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-accent-600">
            {loading ? '...' : stats.hiringAuthorities}
          </div>
          <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Hiring Authorities</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-secondary-600">
            {loading ? '...' : stats.companies}
          </div>
          <div className="text-sm text-candid-gray-500 uppercase tracking-wide">Companies</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600">
            {loading ? '...' : stats.skillConnections}
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