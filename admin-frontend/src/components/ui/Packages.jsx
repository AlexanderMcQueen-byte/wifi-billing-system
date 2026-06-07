import React, { useEffect, useState } from 'react'
import api from '../../services/api'

function PlanCard({p, onDelete}){
  return (
    <div className="card-bg p-3 rounded flex items-center justify-between">
      <div>
        <div className="font-semibold">{p.name}</div>
        <div className="text-mute text-xs">KES {p.amount} • {p.duration} • {p.speed||'—'}</div>
      </div>
      <div className="flex gap-2">
        <button className="text-mute">✎</button>
        <button className="text-alert" onClick={()=>onDelete(p.key)}>🗑</button>
      </div>
    </div>
  )
}

export default function Packages(){
  const [packages,setPackages]=useState([])
  const [form,setForm]=useState({key:'',name:'',amount:0,duration:'',speed:''})
  const [err,setErr]=useState('')

  useEffect(()=>load(),[])
  async function load(){try{const r=await api.call('/admin/packages'); setPackages(r.packages)}catch(e){setErr(e.message)}}

  async function create(){try{await api.call('/admin/packages',{method:'POST', body:JSON.stringify(form)}); setForm({key:'',name:'',amount:0,duration:'',speed:''}); load()}catch(e){setErr(e.message)}}
  async function del(key){try{await api.call(`/admin/packages/${key}`,{method:'DELETE'}); load()}catch(e){setErr(e.message)}}

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-[#242631] bg-[#16171D]">
        <h3 className="font-semibold">Create Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
          <input className="p-2 bg-[#0D0E12] border border-[#242631] rounded" placeholder="Key" value={form.key} onChange={e=>setForm({...form,key:e.target.value})} />
          <input className="p-2 bg-[#0D0E12] border border-[#242631] rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="p-2 bg-[#0D0E12] border border-[#242631] rounded" placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm({...form,amount:Number(e.target.value)})} />
          <input className="p-2 bg-[#0D0E12] border border-[#242631] rounded" placeholder="Duration" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} />
        </div>
        <div className="mt-3"><button className="px-3 py-2 bg-[#00E676] text-black rounded font-semibold" onClick={create}>Add Package</button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {packages.length===0 && <div className="text-[#8A8F9E] p-6">No packages configured yet.</div>}
        {packages.map(p=> <PlanCard key={p.key} p={p} onDelete={del} />)}
      </div>
      {err && <div className="text-amber-400">{err}</div>}
    </div>
  )
}
