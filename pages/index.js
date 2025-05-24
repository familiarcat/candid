import Head from 'next/head'
import Layout from '../components/Layout'
import DashboardCards from '../components/DashboardCards'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Candid Connections Katra</title>
        <meta name="description" content="Job seeker-employer matching platform" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Candid Connections Dashboard</h1>
        <DashboardCards />
      </div>
    </Layout>
  )
}