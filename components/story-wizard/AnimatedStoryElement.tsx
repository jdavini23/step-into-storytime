'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedStoryElementProps {
  children: ReactNode;
  delay?: number;
  type?: 'paragraph' | 'heading1' | 'heading2' | 'heading3';
}

export default function AnimatedStoryElement({
  children,
  delay = 0,
  type = 'paragraph',
}: AnimatedStoryElementProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const animations = {
    paragraph: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.7, 
          delay: delay * 0.15,
          ease: 'easeOut'
        }
      }
    },
    heading1: {
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.9, 
          delay: delay * 0.08,
          ease: 'easeOut'
        }
      }
    },
    heading2: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration: 0.8, 
          delay: delay * 0.1,
          ease: 'easeOut'
        }
      }
    },
    heading3: {
      hidden: { opacity: 0, x: -15 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration: 0.7, 
          delay: delay * 0.12,
          ease: 'easeOut'
        }
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={animations[type]}
      className="animation-wrapper relative"
    >
      {children}
    </motion.div>
  );
}
