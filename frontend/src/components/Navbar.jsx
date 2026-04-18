import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict' },
  { to: '/chat', label: 'Chat' },
  { to: '/report', label: 'Report' },
]

export default function Navbar() {
  const [user, setUser] = useState(() => localStorage.getItem('user'))
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthChange = () => setUser(localStorage.getItem('user'))
    window.addEventListener('authChange', handleAuthChange)
    return () => window.removeEventListener('authChange', handleAuthChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-[#030712] border-b border-gray-800/50 h-14 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-white font-semibold text-sm tracking-tight">
            CuraWise.AI
          </Link>
          <div className="flex gap-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-200'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-500 text-sm">{user}</span>
              <div className="w-px h-4 bg-gray-800" />
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-200 text-sm transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-500 hover:text-gray-200 text-sm transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
