import { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'

export default function Admin() {
  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSeedDatabase = async () => {
    setSeeding(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/seed-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to seed database')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Admin Panel | Candid Connections Katra</title>
        <meta name="description" content="Administrative tools for managing the Candid Connections platform." />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary-800 mb-4">
            Admin Panel
          </h1>
          <p className="text-xl text-candid-gray-600 max-w-3xl mx-auto">
            Administrative tools for managing the platform and database.
          </p>
        </div>

        {/* Database Seeding Section */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-2xl font-semibold text-secondary-800 mb-4">
              Database Management
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Warning</h3>
              <p className="text-yellow-700 text-sm">
                This will completely wipe the existing database and populate it with fresh mock data.
                This action cannot be undone.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-700">
                Seed Database with Mock Data
              </h3>
              <p className="text-candid-gray-600">
                This will create a comprehensive dataset for testing the hiring authority matching system:
              </p>

              <ul className="list-disc list-inside text-candid-gray-600 space-y-1 ml-4">
                <li><strong>5 Companies</strong> - Different sizes (Startup, Mid-size, Enterprise)</li>
                <li><strong>8 Hiring Authorities</strong> - Various levels (C-Suite, Executive, Director, Manager)</li>
                <li><strong>20 Job Seekers</strong> - Diverse skills and experience levels</li>
                <li><strong>20 Skills</strong> - Technical and soft skills with demand levels</li>
                <li><strong>Authority Matches</strong> - Generated using company size logic and skill alignment</li>
              </ul>

              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className={`btn-primary ${seeding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {seeding ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Seeding Database...
                  </>
                ) : (
                  '🌱 Seed Database'
                )}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ Success!</h4>
                <p className="text-green-700 mb-3">{result.message}</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.stats.companies}</div>
                    <div className="text-green-700">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.stats.hiringAuthorities}</div>
                    <div className="text-green-700">Authorities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.stats.jobSeekers}</div>
                    <div className="text-green-700">Job Seekers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.stats.skills}</div>
                    <div className="text-green-700">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.stats.matches}</div>
                    <div className="text-green-700">Matches</div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">❌ Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Data Overview */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-2xl font-semibold text-secondary-800 mb-4">
              Mock Data Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-700 mb-3">Company Size Logic</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Startup (&lt;100):</span>
                    <span className="text-candid-gray-600">CEO, CTO → Ultimate Power</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mid-size (100-1000):</span>
                    <span className="text-candid-gray-600">VP, Directors → High Power</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Enterprise (1000+):</span>
                    <span className="text-candid-gray-600">HR, Managers → Medium Power</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-700 mb-3">Authority Hierarchy</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">C-Suite:</span>
                    <span className="text-candid-gray-600">CEO, CTO, Founder</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Executive:</span>
                    <span className="text-candid-gray-600">VP, Creative Director</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Director:</span>
                    <span className="text-candid-gray-600">HR Director, Product Director</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Manager:</span>
                    <span className="text-candid-gray-600">Engineering Manager</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-2xl font-semibold text-secondary-800 mb-4">
              Quick Links
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/job-seekers" className="btn-outline text-center">
                👥 Job Seekers
              </a>
              <a href="/hiring-authorities" className="btn-outline text-center">
                👔 Hiring Authorities
              </a>
              <a href="/companies" className="btn-outline text-center">
                🏢 Companies
              </a>
              <a href="/matches" className="btn-outline text-center">
                🎯 Authority Matches
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
