import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Routers(){
  const [routers,setRouters]=useState([])
  const [form,setForm]=useState({name:'',host:'',port:8728,user:'',password:'',hotspotInterface:''})
  const [err,setErr]=useState('')

  useEffect(()=>load(),[])
  async function load(){try{const r=await api.call('/admin/routers'); setRouters(r.routers)}catch(e){setErr(e.message)}}

  async function create(){try{await api.call('/admin/routers',{method:'POST', body:JSON.stringify(form)}); setForm({name:'',host:'',port:8728,user:'',password:'',hotspotInterface:''}); load()}catch(e){setErr(e.message)}}

  return (
    <div className="space-y-4">
      <div className="card-bg p-4 rounded">
        <h3 className="font-semibold">Add Router</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Host" value={form.host} onChange={e=>setForm({...form,host:e.target.value})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="User" value={form.user} onChange={e=>setForm({...form,user:e.target.value})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Port" value={form.port} onChange={e=>setForm({...form,port:Number(e.target.value)})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Hotspot Interface" value={form.hotspotInterface} onChange={e=>setForm({...form,hotspotInterface:e.target.value})} />
        </div>
        <div className="mt-3"><button className="px-3 py-2 bg-[var(--mint)] text-black rounded" onClick={create}>Create</button></div>
      </div>

      <div className="card-bg p-4 rounded">
        <h3 className="font-semibold">Configured Routers</h3>
        <div className="mt-3 space-y-2">
          {routers.map(r=> (
            <div key={r._id} className="p-3 rounded border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-mute text-xs">{r.host}:{r.port}</div>
              </div>
              <div className="text-mute text-sm">{r.hotspotInterface||'—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
