"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomePage from './components/HomePage'

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const tasks = useQuery(api.tasks.get);
  return (
    <div className="relative w-screen h-screen">
      <Image 
        src="/green.jpg" 
        alt="background" 
        fill
        className="object-cover"
        priority
      />
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <HomePage isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
    </div>
  )
}

export default Page