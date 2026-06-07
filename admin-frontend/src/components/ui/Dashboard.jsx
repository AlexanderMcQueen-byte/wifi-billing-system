import React, { useEffect, useState } from 'react'
import api from '../../services/api'

function StatCard({title, children, className}){
  return (
    <div className={`p-5 rounded-lg border border-[#242631] bg-[#16171D] ${className||''}`}>
      <div className="text-xs text-[#8A8F9E]">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export default function Dashboard(){
  const [transactions,setTransactions]=useState([])
  const [revenue,setRevenue]=useState(0)
  const [active,setActive]=useState(0)
  const [routerStats,setRouterStats]=useState({ping:'12ms', cpu:'8%', uptime:'2d 4h'})

  useEffect(()=>{
    async function load(){
      try{
        const s = await api.call('/admin/settings')
        // placeholder: load recent transactions
        const recent = []
        setTransactions(recent)
        setRevenue(1240)
        setActive(42)
        setRouterStats({ping:'12ms', cpu:'8%', uptime:'2d 4h'})
      }catch(e){console.error(e)}
    }
    load()
  },[])

  return (
    <div className="space-y-6 font-sans">
      {/* Hero (mobilink-like) */}
      <div className="hero">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-4 text-sm uppercase tracking-wider text-white/80">Trusted by ISPs across East Africa</div>
          <h1 className="text-3xl md:text-5xl font-extrabold">Kenya's Leading <span className="accent">WiFi Billing System</span></h1>
          <p className="hero-sub mt-4 text-sm mx-auto">Complete PPPoE & Hotspot Billing Solution for ISPs. Automate invoicing, integrate M-Pesa, and manage networks from one dashboard.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button className="cta-primary">View Pricing Plans</button>
            <button className="cta-outline">Live Interactive Demo</button>
          </div>
        </div>
        <div className="hero-decor">
          <div className="dot" style={{left:'10%',top:'20%'}}></div>
          <div className="dot" style={{left:'80%',top:'40%'}}></div>
          <div className="dot" style={{left:'55%',top:'75%'}}></div>
        </div>
      </div>

      {/* Metric cards row (4) */}
      <div className="metric-row">
        <div className="metric-card">
          <div className="label">Today's Revenue</div>
          <div className="value text-[var(--brand)]">KES {revenue.toLocaleString()}</div>
          <div className="text-sm text-[var(--mint)] mt-1">▲ 5% vs yesterday</div>
        </div>

        <div className="metric-card">
          <div className="label">Active Users</div>
          <div className="value">{active}</div>
          <div className="text-sm text-[var(--mute)] mt-1">Platform Uptime: 99.9%</div>
        </div>

        <div className="metric-card">
          <div className="label">Network Status</div>
          <div className="value font-mono">Ping {routerStats.ping} • CPU {routerStats.cpu}</div>
          <div className="text-sm text-[var(--mute)] mt-1">Uptime {routerStats.uptime}</div>
        </div>

        <div className="metric-card">
          <div className="label">Signups</div>
          <div className="value">0</div>
          <div className="text-sm text-[var(--mute)] mt-1">New signups this cycle</div>
        </div>
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-5 rounded-lg border border-dashed border-[#242631] bg-[#0b0c10] h-72 flex flex-col">
            <div className="text-xs text-[#8A8F9E]">Hourly Revenue</div>
            <div className="mt-4 flex-1 flex items-center justify-center text-[#8A8F9E]">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-56 border-2 border-dashed border-[#242631] rounded-lg flex items-center justify-center text-sm text-[#8A8F9E]">Chart placeholder — Hourly Revenue</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="p-5 rounded-lg border border-[#242631] bg-[#16171D] h-72 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#8A8F9E]">Recent Transactions</div>
              <div className="text-xs text-[#8A8F9E]">Latest</div>
            </div>
            <div className="mt-3 overflow-auto flex-1">
              {transactions.length===0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8A8F9E]">
                  <div className="mb-2 text-sm">No recent transactions</div>
                  <div className="text-xs">Awaiting active Daraja payment callbacks.</div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {transactions.map((t,idx)=> (
                    <li key={idx} className="p-3 bg-[#0d0e12] rounded border border-[#242631]">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{t.display || t.id || 'Transaction'}</div>
                        <div className="text-sm text-[#00E676]">KES {t.amount?.toLocaleString?.() ?? t.amount}</div>
                      </div>
                      <div className="text-xs text-[#8A8F9E] mt-1">{t.when}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
