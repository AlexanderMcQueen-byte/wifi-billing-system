import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './components/ui/Login'
import Dashboard from './components/ui/Dashboard'
import Settings from './components/ui/Settings'
import Routers from './components/ui/Routers'
import Packages from './components/ui/Packages'
import Sessions from './components/ui/Sessions'
import Layout from './components/ui/Layout'
import { getToken } from './services/auth'

function PrivateRoute({ children }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="app">
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/routers">Routers</Link>
        <Link to="/packages">Packages</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
          <Route path="/routers" element={<PrivateRoute><Layout><Routers /></Layout></PrivateRoute>} />
          <Route path="/packages" element={<PrivateRoute><Layout><Packages /></Layout></PrivateRoute>} />
          <Route path="/sessions" element={<PrivateRoute><Layout><Sessions /></Layout></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}
