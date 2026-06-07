import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Routers(){
  const [list,setList]=useState([])
  const [form,setForm]=useState({name:'',host:'',user:'',password:'',port:8728})
  const [err,setErr]=useState('')

  useEffect(()=>{load();},[])
  async function load(){try{const r=await api.call('/admin/routers'); setList(r.routers)}catch(e){setErr(e.message)}}

  async function create(){setErr(''); try{await api.call('/admin/routers',{method:'POST',body:JSON.stringify(form)}); setForm({name:'',host:'',user:'',password:'',port:8728}); load()}catch(e){setErr(e.message)}}

  return (
    <div>
      <h2>Routers</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <div className="card">
        <h4>Add router</h4>
        <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="input" placeholder="Host" value={form.host} onChange={e=>setForm({...form,host:e.target.value})} />
        <input className="input" placeholder="User" value={form.user} onChange={e=>setForm({...form,user:e.target.value})} />
        <input className="input" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button className="button" onClick={create}>Create</button>
      </div>

      <div>
        <h4>Configured routers</h4>
        {list.map(r=> (
          <div key={r._id} className="card">
            <div><strong>{r.name}</strong> {r.host}:{r.port}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
