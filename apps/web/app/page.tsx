"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/Chatarea'
// import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const tasks = useQuery(api.tasks.get);
  return (
    <div className="relative w-screen h-screen">
      <Image 
        src="/j.jpg" 
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