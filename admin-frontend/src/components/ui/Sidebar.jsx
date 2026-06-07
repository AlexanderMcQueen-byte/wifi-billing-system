import React from 'react'
import { Link } from 'react-router-dom'

function Icon({name}){
  if(name==='dashboard') return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z"></path></svg>)
  if(name==='router') return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" d="M12 2v20M2 12h20"/></svg>)
  if(name==='mpesa') return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="1.5"/></svg>)
  if(name==='plans') return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="6" rx="2" strokeWidth="1.5"/></svg>)
  if(name==='live') return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14" strokeWidth="1.5"/></svg>)
  return null
}

export default function Sidebar({collapsed,onToggle}){
  return (
    <div className="h-full p-4 bg-[#16171D] border-r border-[#242631] text-sm text-[#F5F6F9] font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#00E676] inline-block shadow-[0_0_10px_rgba(0,230,118,0.25)] animate-pulse" aria-hidden="true"></span>
            <div>
              <div className="text-white font-semibold">Hotspot Core</div>
              <div className="text-[#8A8F9E] text-xs">Control Console</div>
            </div>
          </div>
        </div>
        <button onClick={onToggle} className="text-[#8A8F9E]">≡</button>
      </div>

      <nav className="flex flex-col gap-2">
        <Link className="flex items-center gap-3 p-3 rounded-md hover:bg-[#0f1114]" to="/"> <Icon name="dashboard"/> <span>Overview</span></Link>
        <Link className="flex items-center gap-3 p-3 rounded-md hover:bg-[#0f1114]" to="/routers"> <Icon name="router"/> <span>Multi-Router</span></Link>
        <Link className="flex items-center gap-3 p-3 rounded-md hover:bg-[#0f1114]" to="/settings"> <Icon name="mpesa"/> <span>M-Pesa Engine</span></Link>
        <Link className="flex items-center gap-3 p-3 rounded-md hover:bg-[#0f1114]" to="/packages"> <Icon name="plans"/> <span>Packages</span></Link>
        <Link className="flex items-center gap-3 p-3 rounded-md hover:bg-[#0f1114]" to="/sessions"> <Icon name="live"/> <span>Live Sessions</span></Link>
        <Link className="flex items-center gap-3 p-3 rounded-md hover:bg-[#0f1114]" to="/notifications"> <Icon name="live"/> <span>Notifications</span></Link>
        <Link className="flex items-center gap-3 p-3 rounded-md hover:bg-[#0f1114]" to="/subscribers"> <Icon name="dashboard"/> <span>Subscriber Logs</span></Link>
      </nav>
    </div>
  )
}
