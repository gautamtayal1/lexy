"use client"

import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomePage from './components/HomePage'

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="relative w-full h-full">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <HomePage isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
    </div>
  )
}

export default Page