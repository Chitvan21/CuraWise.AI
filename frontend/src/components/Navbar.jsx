import { NavLink, Link } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict' },
  { to: '/chat', label: 'Chat' },
  { to: '/report', label: 'Report' },
]

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-gray-800">
      <Link to="/" className="text-xl font-bold text-white hover:text-indigo-400 transition-colors">
        CuraWise.AI 🩺
      </Link>
      <div className="flex items-center gap-6">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-indigo-400 border-b-2 border-indigo-400 pb-0.5' : 'text-gray-300 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
        <Link
          to="/login"
          className="ml-4 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}
