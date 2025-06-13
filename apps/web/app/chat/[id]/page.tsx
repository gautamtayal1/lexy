"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import Sidebar from "../../components/Sidebar"
import ChatArea from "../../components/ChatArea"

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="relative w-screen h-screen">
      <Image 
        src="/new.jpg" 
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