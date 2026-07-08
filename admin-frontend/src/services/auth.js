const API = import.meta.env.VITE_API_URL || (() => {
  throw new Error('VITE_API_URL environment variable is required; no local fallback allowed');
})()

export function saveToken(token){
  localStorage.setItem('admin_token', token)
}
export function getToken(){
  return localStorage.getItem('admin_token')
}
export function logout(){
  localStorage.removeItem('admin_token')
}

export async function login(email,password){
  const res = await fetch(`${API}/admin/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
  if(!res.ok) throw new Error('Login failed')
  const data = await res.json()
  return data.token
}
