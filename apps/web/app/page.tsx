import Image from 'next/image'
import React from 'react'
import Sidebar from './components/sidebar'
import ChatArea from './components/chatarea'

const page = () => {
  return (
    <div className="relative w-screen h-screen">
      <Image 
        src="/night.jpg" 
        alt="background" 
        fill
        className="object-cover"
        priority
      />
      <Sidebar />
      <ChatArea />
    </div>
  )
}

export default page