import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard(){
  const [summary,setSummary]=useState({revenue:0,active:0,routers:[]})
  const [err,setErr]=useState('')

  useEffect(()=>{
    async function load(){
      try{
        // backend endpoints not implemented for metrics; we derive from transactions and router logs
        const settings = await api.call('/admin/settings')
        const logs = await api.call('/admin/router-commands?limit=10')
        setSummary({revenue:0,active:0,routers:logs.logs||[]})
      }catch(e){setErr(e.message)}
    }
    load()
  },[])

  return (
    <div>
      <h2>Dashboard</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <div className="card">Total revenue (placeholder): KES {summary.revenue}</div>
      <div className="card">Active users (placeholder): {summary.active}</div>
      <div className="card">
        <h4>Recent router commands</h4>
        <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(summary.routers,null,2)}</pre>
      </div>
    </div>
  )
}
