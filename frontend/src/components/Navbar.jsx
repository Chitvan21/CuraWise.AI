import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict' },
  { to: '/chat', label: 'Chat' },
  { to: '/report', label: 'Report' },
]

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="glass-strong border-b border-teal-500/10 h-14 flex items-center px-6 sticky top-0 z-50">
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
                  `text-sm transition-colors ${isActive ? 'text-teal-400' : 'text-gray-500 hover:text-gray-200'}`
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
              <span className="text-gray-500 text-sm">{user.email}</span>
              <div className="w-px h-4 bg-teal-500/20" />
              <button onClick={handleLogout} className="text-gray-500 hover:text-teal-400 text-sm transition-colors">
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-gray-500 hover:text-teal-400 text-sm transition-colors">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
