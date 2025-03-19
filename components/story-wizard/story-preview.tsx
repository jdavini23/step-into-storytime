"use client"

import { useState } from "react"
import { ArrowLeft, Download, Share2, Save, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

interface StoryPreviewProps {
  story: string
  storyData: any
  onBack: () => void
  onSave: () => Promise<void>
}

export default function StoryPreview({ story, storyData, onBack, onSave }: StoryPreviewProps) {
  const [activeTab, setActiveTab] = useState<"read" | "edit">("read")
  const [editedStory, setEditedStory] = useState(story)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave()
    } catch (error) {
      console.error("Error saving story:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    // Create a blob with the story content
    const blob = new Blob([editedStory], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = `${storyData.title.replace(/\s+/g, "-").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: storyData.title,
          text: "Check out this story I created with Step Into Storytime!",
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing:", error))
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert("Sharing is not supported in your browser. You can copy the URL manually.")
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h2 className="font-semibold text-slate-900">{storyData.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={activeTab === "read" ? "bg-slate-100" : ""}
            onClick={() => setActiveTab("read")}
          >
            Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={activeTab === "edit" ? "bg-slate-100" : ""}
            onClick={() => setActiveTab("edit")}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "read" ? (
          <div className="prose prose-violet max-w-none">
            <ReactMarkdown>{editedStory}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={editedStory}
            onChange={(e) => setEditedStory(e.target.value)}
            className="w-full h-[400px] p-4 border border-slate-200 rounded-lg font-mono text-sm"
            placeholder="Edit your story here..."
          />
        )}
      </div>

      <div className="border-t border-slate-100 p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Wizard
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {isSaving ? "Saving..." : "Save Story"}
          </Button>
        </div>
      </div>
    </div>
  )
}

