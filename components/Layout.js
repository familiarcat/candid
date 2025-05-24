import Navigation from './Navigation'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-candid-gray-50">
      <Navigation />
      <main className="container-app section-padding">{children}</main>
    </div>
  )
}