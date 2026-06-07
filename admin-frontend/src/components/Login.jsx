import React, { useState } from 'react'
import { login, saveToken } from '../services/auth'
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
    <div className="form">
      <h2>Admin Login</h2>
      <form onSubmit={onSubmit}>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
        <input className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" />
        <button className="button" type="submit">Login</button>
      </form>
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  )
}
