import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-6xl font-bold text-gray-200">404</div>
      <h1 className="text-xl font-semibold text-gray-800">Page not found</h1>
      <p className="text-gray-500 text-sm">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary mt-2">Go to Dashboard</Link>
    </div>
  )
}
