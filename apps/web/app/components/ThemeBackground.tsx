"use client"

import React from 'react';
import Image from 'next/image';
import { useTheme } from '../hooks/useTheme';

const ThemeBackground = () => {
  const theme = useTheme();
  
  return (
    <Image 
      src={theme === 'dark' ? '/boat.jpg' : '/white.jpg'}
      alt="background" 
      fill
      className="object-cover transition-opacity duration-500"
      priority
    />
  );
};

export default ThemeBackground; 