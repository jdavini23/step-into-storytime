'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ThemeOverlayProps {
  theme: string;
  setting: string;
}

export default function ThemeOverlay({ theme, setting }: ThemeOverlayProps) {
  const [overlayType, setOverlayType] = useState<'underwater' | 'space' | 'forest' | 'default'>('default');
  
  useEffect(() => {
    // Detect setting and set appropriate overlay type
    if (setting.toLowerCase().includes('underwater') || 
        setting.toLowerCase().includes('ocean') || 
        setting.toLowerCase().includes('sea')) {
      setOverlayType('underwater');
    } else if (setting.toLowerCase().includes('space') || 
               setting.toLowerCase().includes('galaxy') || 
               setting.toLowerCase().includes('star')) {
      setOverlayType('space');
    } else if (setting.toLowerCase().includes('forest') || 
               setting.toLowerCase().includes('jungle') || 
               setting.toLowerCase().includes('woods')) {
      setOverlayType('forest');
    } else {
      setOverlayType('default');
    }
  }, [setting]);

  return (
    <div className="theme-overlay" style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      pointerEvents: 'none', 
      zIndex: 1, 
      opacity: 0.5 
    }}>
      {overlayType === 'underwater' && <UnderwaterOverlay />}
      {overlayType === 'space' && <SpaceOverlay />}
      {overlayType === 'forest' && <ForestOverlay />}
      {overlayType === 'default' && <DefaultOverlay />}
    </div>
  );
}

function UnderwaterOverlay() {
  return (
    <div className="underwater-overlay">
      {Array.from({ length: 20 }).map((_, index) => (
        <motion.div
          key={index}
          className="bubble"
          style={{
            position: 'absolute',
            width: Math.random() * 20 + 10 + 'px',
            height: Math.random() * 20 + 10 + 'px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + 100 + '%',
          }}
          animate={{
            top: '-10%',
            x: Math.random() * 50 - 25,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,119,182,0.1) 0%, rgba(0,119,182,0.2) 100%)',
      }} />
    </div>
  );
}

function SpaceOverlay() {
  return (
    <div className="space-overlay">
      {Array.from({ length: 50 }).map((_, index) => (
        <motion.div
          key={index}
          className="star"
          style={{
            position: 'absolute',
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            background: 'white',
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(16,24,52,0.1) 0%, rgba(16,24,52,0.2) 100%)',
      }} />
    </div>
  );
}

function ForestOverlay() {
  return (
    <div className="forest-overlay">
      {Array.from({ length: 15 }).map((_, index) => (
        <motion.div
          key={index}
          className="leaf"
          style={{
            position: 'absolute',
            width: Math.random() * 10 + 5 + 'px',
            height: Math.random() * 10 + 5 + 'px',
            background: `rgba(${Math.floor(Math.random() * 50 + 100)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50 + 50)}, 0.5)`,
            borderRadius: '50% 0 50% 50%',
            transform: `rotate(${Math.random() * 360}deg)`,
            left: Math.random() * 100 + '%',
            top: '-5%',
          }}
          animate={{
            top: '105%',
            x: Math.random() * 100 - 50,
            rotate: Math.random() * 360 + 360,
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(76,175,80,0.05) 0%, rgba(76,175,80,0.1) 100%)',
      }} />
    </div>
  );
}

function DefaultOverlay() {
  return (
    <div className="default-overlay">
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(240,240,240,0.05) 0%, rgba(240,240,240,0.1) 100%)',
      }} />
    </div>
  );
}
