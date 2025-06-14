"use client"

import React, { useState } from 'react'
import Sidebar from "../../components/Sidebar"
import ChatArea from "../../components/chatarea"

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="relative w-screen h-screen">
      <div className="absolute"></div>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)}/>
      <ChatArea isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} theme="dark" />
    </div>
  )
}

export default Page