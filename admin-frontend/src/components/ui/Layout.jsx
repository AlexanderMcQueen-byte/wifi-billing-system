import React, { useState } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import Topbar from './Topbar'

export default function Layout({ children }){
  const [collapsed,setCollapsed] = useState(false)

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Topbar />
      <div className="flex flex-1">
        <aside className={`hidden md:block sidebar ${collapsed? 'sidebar-collapse':''}`}>{/* Sidebar handles its own content */}
          <Sidebar collapsed={collapsed} onToggle={()=>setCollapsed(!collapsed)} />
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-full mx-auto">{children}</div>
        </main>
      </div>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-transparent">
        <BottomNav />
      </footer>
    </div>
  )
}
