import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Settings(){
  const [settings,setSettings]=useState(null)
  const [err,setErr]=useState('')

  useEffect(()=>{async function load(){try{const r=await api.call('/admin/settings'); setSettings(r.settings||{});}catch(e){setErr(e.message)}} load()},[])

  async function save(){
    try{await api.call('/admin/settings',{method:'POST', body:JSON.stringify(settings)}); alert('Saved')}catch(e){setErr(e.message)}
  }

  if(!settings) return <div className="card-bg p-4 rounded">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="card-bg p-4 rounded">
        <h3 className="text-white font-semibold">M-Pesa Daraja</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Consumer Key" value={settings.daraja?.consumerKey||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, consumerKey:e.target.value}})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Consumer Secret" value={settings.daraja?.consumerSecret||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, consumerSecret:e.target.value}})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Shortcode" value={settings.daraja?.shortCode||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, shortCode:e.target.value}})} />
          <input className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" placeholder="Callback URL" value={settings.daraja?.callbackUrl||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, callbackUrl:e.target.value}})} />
        </div>
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-[var(--cyber)] text-black rounded" onClick={save}>Save</button>
        {err && <div className="text-alert">{err}</div>}
      </div>
    </div>
  )
}
