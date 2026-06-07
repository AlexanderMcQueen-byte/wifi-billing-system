import React from 'react'
import { Link } from 'react-router-dom'

export default function Topbar(){
  return (
    <header className="topbar p-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-[var(--brand)] font-bold shadow">Wi</div>
          <div>
            <div className="text-sm font-semibold">WiFi Billing</div>
            <div className="text-xs opacity-80">Admin Console</div>
          </div>
        </Link>
        <div className="hidden md:block bg-white rounded p-1 pl-3 pr-3 border border-[#e6eef7]">
          <input placeholder="Search users, mac, transaction id" className="outline-none text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-3 py-2 bg-white text-[var(--brand)] rounded">Create</button>
        <div className="text-sm text-white/90">Admin</div>
        <div className="w-8 h-8 rounded-full bg-white" />
      </div>
    </header>
  )
}
