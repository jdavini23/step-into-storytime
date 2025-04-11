'use client';

import { motion } from 'framer-motion';
import { Sparkles, Wand2, Book, Stars } from 'lucide-react';

export function StoryWizardHeader() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center py-4 overflow-hidden">
      {/* Floating Elements Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-1/4 left-1/4"
        >
          <Sparkles className="h-6 w-6 text-primary/60" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute top-1/3 right-1/3"
        >
          <Stars className="h-8 w-8 text-primary/70" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-1/3 right-1/4"
        >
          <Book className="h-7 w-7 text-primary/60" />
        </motion.div>
      </div>

      {/* Main Title Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Wand2 className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Create Your Story
          </h1>
          <motion.div
            animate={{
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            <Wand2 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      {/* Subtitle with Sparkle Effect */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-lg text-muted-foreground text-center max-w-xl mx-auto relative"
      >
        Let's craft a magical story together! I'll guide you through the process
        with a few simple questions.
        <motion.span
          className="absolute -right-6 -top-4"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ✨
        </motion.span>
      </motion.p>

      {/* Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-6"
      />
    </div>
  );
}
