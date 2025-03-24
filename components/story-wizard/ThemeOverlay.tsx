'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThemeOverlayProps {
  theme: string;
  setting: string;
}

export default function ThemeOverlay({ theme, setting }: ThemeOverlayProps) {
  const [overlayType, setOverlayType] = useState<
    'underwater' | 'space' | 'forest' | 'default'
  >('default');

  useEffect(() => {
    // Detect setting and set appropriate overlay type
    if (
      setting.toLowerCase().includes('underwater') ||
      setting.toLowerCase().includes('ocean') ||
      setting.toLowerCase().includes('sea')
    ) {
      setOverlayType('underwater');
    } else if (
      setting.toLowerCase().includes('space') ||
      setting.toLowerCase().includes('galaxy') ||
      setting.toLowerCase().includes('star')
    ) {
      setOverlayType('space');
    } else if (
      setting.toLowerCase().includes('forest') ||
      setting.toLowerCase().includes('jungle') ||
      setting.toLowerCase().includes('woods')
    ) {
      setOverlayType('forest');
    } else {
      setOverlayType('default');
    }
  }, [setting]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-50">
      {overlayType === 'underwater' && <UnderwaterOverlay />}
      {overlayType === 'space' && <SpaceOverlay />}
      {overlayType === 'forest' && <ForestOverlay />}
      {overlayType === 'default' && <DefaultOverlay />}
    </div>
  );
}

function UnderwaterOverlay() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {Array.from({ length: 20 }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            'absolute rounded-full bg-white/30',
            'transform -translate-y-full'
          )}
          style={{
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100 + 100}%`,
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
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-500/20" />
    </div>
  );
}

function SpaceOverlay() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {Array.from({ length: 50 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
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
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/20" />
    </div>
  );
}

function ForestOverlay() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {Array.from({ length: 15 }).map((_, index) => {
        const r = Math.floor(Math.random() * 50 + 100);
        const g = Math.floor(Math.random() * 100 + 155);
        const b = Math.floor(Math.random() * 50 + 50);

        return (
          <motion.div
            key={index}
            className="absolute rounded-tl-full rounded-bl-full rounded-br-full"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
              transform: `rotate(${Math.random() * 360}deg)`,
              left: `${Math.random() * 100}%`,
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
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-green-500/10" />
    </div>
  );
}

function DefaultOverlay() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-200/5 to-gray-200/10" />
    </div>
  );
}
