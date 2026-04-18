import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Predict from './pages/Predict'
import Chat from './pages/Chat'
import Report from './pages/Report'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const { session } = useAuth()
  if (session === undefined) return null // still loading
  if (!session) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#030712]">
      <Navbar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/predict" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}
