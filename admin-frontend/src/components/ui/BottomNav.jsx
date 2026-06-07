import React from 'react'
import { Link } from 'react-router-dom'

export default function BottomNav(){
  return (
    <div className="flex justify-between items-center bg-[#0e0f14] border-t border-[var(--border)] p-2">
      <Link to="/" className="text-mute text-xs">Dashboard</Link>
      <Link to="/routers" className="text-mute text-xs">Routers</Link>
      <Link to="/settings" className="text-mute text-xs">M-Pesa</Link>
      <Link to="/packages" className="text-mute text-xs">Plans</Link>
    </div>
  )
}
