import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Packages(){
  const [packages,setPackages]=useState([])
  const [form,setForm]=useState({key:'',name:'',amount:0,duration:'',speed:''})
  const [err,setErr]=useState('')

  useEffect(()=>{load()},[])
  async function load(){try{const res=await api.call('/admin/packages'); setPackages(res.packages)}catch(e){setErr(e.message)}}
  async function create(){setErr(''); try{await api.call('/admin/packages',{method:'POST', body:JSON.stringify(form)}); setForm({key:'',name:'',amount:0,duration:'',speed:''}); load()}catch(e){setErr(e.message)}}

  return (
    <div>
      <h2>Packages</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <div className="card">
        <h4>Create package</h4>
        <input className="input" placeholder="Key" value={form.key} onChange={e=>setForm({...form,key:e.target.value})} />
        <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="input" placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm({...form,amount:Number(e.target.value)})} />
        <input className="input" placeholder="Duration" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} />
        <input className="input" placeholder="Speed" value={form.speed} onChange={e=>setForm({...form,speed:e.target.value})} />
        <button className="button" onClick={create}>Create</button>
      </div>

      <div>
        <h4>Existing packages</h4>
        {packages.map(p=> (
          <div key={p.key} className="card">
            <div><strong>{p.name}</strong> - KES {p.amount} - {p.duration} - {p.speed}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
