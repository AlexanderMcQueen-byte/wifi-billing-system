import React, { useEffect, useState } from 'react'
import api from '../../services/api'

function Row({s, onKick}){
  const [remaining,setRemaining]=useState(s.timeRemaining||0)
  useEffect(()=>{
    const t=setInterval(()=>setRemaining(r=>Math.max(0,r-1)),1000)
    return ()=>clearInterval(t)
  },[])
  return (
    <div className="p-2 font-mono text-sm card-bg rounded flex items-center justify-between">
      <div className="w-1/5">{s.mac}</div>
      <div className="w-1/5">{s.ip}</div>
      <div className="w-1/5">{s.phone||'—'}</div>
      <div className="w-1/5">{s.package||'—'}</div>
      <div className="w-1/5">{new Date(remaining*1000).toISOString().substr(14,5)}</div>
      <div><button className="px-2 py-1 bg-[var(--alert)] text-black rounded" onClick={()=>onKick(s.mac)}>Kick</button></div>
    </div>
  )
}

export default function Sessions(){
  const [sessions,setSessions]=useState([])
  useEffect(()=>load(),[])
  async function load(){try{const r=await api.call('/admin/router-commands?limit=20'); setSessions([])}catch(e){} }
  async function kick(mac){try{await api.call(`/admin/kick/${encodeURIComponent(mac)}`,{method:'POST'}); alert('Kicked') }catch(e){alert(e.message)}}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Live Sessions Terminal</h3>
        <div className="text-xs text-[#8A8F9E]">Real-time session control</div>
      </div>

      <div className="hidden md:block bg-[#0D0E12] border border-[#242631] rounded">
        <div className="p-2 font-mono text-xs text-[#8A8F9E] grid grid-cols-6 gap-2 border-b border-[#242631]">
          <div>MAC</div><div>IP</div><div>Phone</div><div>Package</div><div>Time</div><div>Action</div>
        </div>
        <div className="p-2 space-y-2">
          {sessions.length===0 && <div className="p-6 text-center text-[#8A8F9E]">No live sessions — awaiting active sessions</div>}
          {sessions.map(s=> <Row key={s.mac} s={s} onKick={kick} />)}
        </div>
      </div>

      <div className="md:hidden">
        {sessions.length===0 && <div className="text-[#8A8F9E]">No live sessions</div>}
        {sessions.map(s=> <Row key={s.mac} s={s} onKick={kick} />)}
      </div>
    </div>
  )
}
