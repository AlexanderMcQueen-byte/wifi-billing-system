import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function MpesaPanel(){
  const [mode,setMode]=useState('stk') // 'till'|'paybill'|'stk'
  const [form,setForm]=useState({shortcode:'',passkey:'',consumerKey:'',consumerSecret:'',callbackUrl:''})
  const [msg,setMsg]=useState('')

  useEffect(()=>{
    async function load(){
      try{
        const s = await api.call('/admin/settings')
        if(s && s.daraja) setForm({...form, ...s.daraja})
      }catch(e){console.error(e)}
    }
    load()
  },[])

  async function save(){
    try{
      await api.call('/admin/settings',{method:'POST', body:JSON.stringify({daraja:form})})
      setMsg('Saved')
      setTimeout(()=>setMsg(''),2000)
    }catch(e){setMsg('Failed: '+e.message)}
  }

  function copyCallback(){
    const url = form.callbackUrl || (window.location.origin + '/api/callback')
    navigator.clipboard?.writeText(url)
    setMsg('Callback URL copied')
    setTimeout(()=>setMsg(''),1500)
  }

  return (
    <div className="p-4 rounded-lg border border-[#242631] bg-[#16171D]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[#8A8F9E]">M-Pesa Gateway</div>
          <div className="text-white font-semibold">Gateway Configurator</div>
        </div>
        <div className="text-xs text-[#8A8F9E]">Mode</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className={`p-2 rounded ${mode==='till'?'bg-[#0d2a44] text-white':'text-[#8A8F9E]'}`} onClick={()=>setMode('till')}>Till (Buy Goods)</button>
        <button className={`p-2 rounded ${mode==='paybill'?'bg-[#0d2a44] text-white':'text-[#8A8F9E]'}`} onClick={()=>setMode('paybill')}>Paybill</button>
        <button className={`p-2 rounded ${mode==='stk'?'bg-[#0d2a44] text-white':'text-[#8A8F9E]'}`} onClick={()=>setMode('stk')}>STK Push</button>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        <input placeholder="Shortcode / Till" value={form.shortcode} onChange={e=>setForm({...form,shortcode:e.target.value})} className="p-2 bg-[#0D0E12] border border-[#242631] rounded" />
        <input placeholder="Passkey" value={form.passkey} onChange={e=>setForm({...form,passkey:e.target.value})} className="p-2 bg-[#0D0E12] border border-[#242631] rounded" />
        <input placeholder="Consumer Key" value={form.consumerKey} onChange={e=>setForm({...form,consumerKey:e.target.value})} className="p-2 bg-[#0D0E12] border border-[#242631] rounded" />
        <input placeholder="Consumer Secret" value={form.consumerSecret} onChange={e=>setForm({...form,consumerSecret:e.target.value})} className="p-2 bg-[#0D0E12] border border-[#242631] rounded" />
        <input placeholder="Callback URL" value={form.callbackUrl} onChange={e=>setForm({...form,callbackUrl:e.target.value})} className="p-2 col-span-1 md:col-span-2 bg-[#0D0E12] border border-[#242631] rounded" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button className="px-3 py-2 bg-[#00B0FF] text-black rounded font-semibold" onClick={save}>Save Gateway</button>
        <button className="px-3 py-2 bg-transparent border border-[#242631] rounded text-[#8A8F9E]" onClick={copyCallback}>Copy Webhook Callback URL</button>
        {msg && <div className="text-sm text-[#8A8F9E] ml-3">{msg}</div>}
      </div>
    </div>
  )
}
