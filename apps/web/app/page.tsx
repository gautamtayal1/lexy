"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import Sidebar from './components/sidebar'
import ChatArea from './components/chatarea'

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative w-screen h-screen">
      <Image 
        src="/night.jpg" 
        alt="background" 
        fill
        className="object-cover"
        priority
      />
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <ChatArea isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
    </div>
  )
}

export default Page