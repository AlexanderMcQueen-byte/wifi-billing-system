import React, { useState } from 'react'
import { login, saveToken } from '../../services/auth'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const nav = useNavigate()

  async function onSubmit(e){
    e.preventDefault()
    try{
      const token = await login(email,password)
      saveToken(token)
      nav('/')
    }catch(e){setErr(e.message)}
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card-bg p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Secure Admin Access</h1>
            <p className="text-mute text-sm">Sign in to manage hotspot</p>
          </div>
          <div className="badge-mint flex items-center gap-2 px-3 py-1 text-xs"> 
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z" strokeWidth="1.2"/></svg>
            Secure
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-mute text-xs">Admin Username</label>
            <input className="mt-1 w-full p-3 rounded bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--mint)] focus-mint" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-mute text-xs">Security Token / PIN</label>
            <input type="password" className="mt-1 w-full p-3 rounded bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--mint)] focus-mint" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <button className="px-4 py-2 bg-[var(--cyber)] text-black rounded shadow-sm hover:brightness-110">Unlock</button>
            <button type="button" className="text-mute text-sm">Need help?</button>
          </div>
        </form>
        {err && <div className="mt-3 text-alert text-sm">{err}</div>}
      </div>
    </div>
  )
}
