import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Settings(){
  const [settings,setSettings]=useState(null)
  const [saving,setSaving]=useState(false)
  const [err,setErr]=useState('')

  useEffect(()=>{async function load(){
    try{const res = await api.call('/admin/settings'); setSettings(res.settings)}catch(e){setErr(e.message)} } load()
  },[])

  async function save(){
    setSaving(true); setErr('')
    try{
      await api.call('/admin/settings',{method:'POST',body:JSON.stringify(settings)})
      alert('Saved')
    }catch(e){setErr(e.message)}
    setSaving(false)
  }

  if(!settings) return <div>Loading...</div>

  return (
    <div>
      <h2>Settings</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <div className="card">
        <h4>Daraja</h4>
        <input className="input" value={settings.daraja?.consumerKey||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, consumerKey:e.target.value}})} placeholder="Consumer Key" />
        <input className="input" value={settings.daraja?.consumerSecret||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, consumerSecret:e.target.value}})} placeholder="Consumer Secret" />
        <input className="input" value={settings.daraja?.shortCode||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, shortCode:e.target.value}})} placeholder="Shortcode" />
        <input className="input" value={settings.daraja?.callbackUrl||''} onChange={e=>setSettings({...settings, daraja:{...settings.daraja, callbackUrl:e.target.value}})} placeholder="Callback URL" />
      </div>

      <div className="card">
        <h4>Site</h4>
        <input className="input" value={settings.siteName||''} onChange={e=>setSettings({...settings, siteName:e.target.value})} placeholder="Site name" />
      </div>

      <button className="button" onClick={save} disabled={saving}>Save settings</button>
    </div>
  )
}
