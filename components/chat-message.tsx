"use client"

import { motion } from "framer-motion"
import { Sparkles, User } from "lucide-react"

interface ChatMessageProps {
  message: string
  type: "system" | "user"
}

export default function ChatMessage({ message, type }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${type === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[80%] ${type === "user" ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            type === "user" ? "bg-indigo-100 ml-2" : "bg-violet-100 mr-2"
          }`}
        >
          {type === "user" ? (
            <User className="h-4 w-4 text-indigo-600" />
          ) : (
            <Sparkles className="h-4 w-4 text-violet-600" />
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-2 ${
            type === "user" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-800"
          }`}
        >
          <p className="text-sm md:text-base">{message}</p>
        </div>
      </div>
    </motion.div>
  )
}

