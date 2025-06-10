import Image from 'next/image'
import React from 'react'

const page = () => {
  return (
    <div className="relative w-screen h-screen">
      <Image 
        src="/green.jpg" 
        alt="background" 
        fill
        className="object-cover"
        priority
      />
    </div>
  )
}

export default page