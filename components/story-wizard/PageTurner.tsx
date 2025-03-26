'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageTurnerProps {
  children: ReactNode;
  pageSize?: number;
}

export default function PageTurner({ children, pageSize = 500 }: PageTurnerProps) {
  const [pages, setPages] = useState<ReactNode[][]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  // Split content into pages based on children
  useEffect(() => {
    // Ensure children is always treated as an array
    const childrenArray = React.Children.toArray(children);
    
    // Group children into pages
    const pageGroups: ReactNode[][] = [];
    let currentGroup: ReactNode[] = [];
    
    childrenArray.forEach((child, index) => {
      currentGroup.push(child);
      
      // Create a new page group either when we reach pageSize
      // or hit the last child
      if (currentGroup.length === pageSize || index === childrenArray.length - 1) {
        pageGroups.push([...currentGroup]);
        currentGroup = [];
      }
    });
    
    setPages(pageGroups.length > 0 ? pageGroups : [[...childrenArray]]);
  }, [children, pageSize]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        rotateY: { duration: 0.8 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        rotateY: { duration: 0.8 }
      }
    })
  };

  if (pages.length === 0) return null;

  return (
    <div className="relative">
      <div 
        className="page-container relative overflow-hidden" 
        style={{ 
          perspective: '1200px',
          minHeight: '50vh'
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="page absolute w-full"
          >
            {pages[currentPage]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page navigation controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`p-2 rounded-full ${
            currentPage === 0 ? 'text-gray-300' : 'text-violet-600 hover:bg-violet-100'
          } transition-colors`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="text-sm text-slate-500">
          Page {currentPage + 1} of {pages.length}
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className={`p-2 rounded-full ${
            currentPage === pages.length - 1 ? 'text-gray-300' : 'text-violet-600 hover:bg-violet-100'
          } transition-colors`}
          aria-label="Next page"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
