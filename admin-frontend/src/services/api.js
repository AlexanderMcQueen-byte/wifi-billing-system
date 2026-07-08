const API = import.meta.env.VITE_API_URL || (() => {
  throw new Error('VITE_API_URL environment variable is required; no local fallback allowed');
})()
import { getToken } from './auth'

async function call(path, opts={}){
  const headers = opts.headers || {}
  const token = getToken()
  if(token) headers['Authorization'] = `Bearer ${token}`
  headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API}${path}`, {...opts, headers})
  const json = await res.json().catch(()=>null)
  if(!res.ok) throw new Error(json?.error || json?.message || 'API error')
  return json
}

export default { call }
