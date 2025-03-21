"use client"

import {  useState  } from "react";
import {  ArrowLeft, Download, Share2, Save, Edit  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface StoryPreviewProps {
  story
  storyData
  onBack,onSave
};
export default function StoryPreview({ story, storyData, onBack, onSave }: StoryPreviewProps) {
  const [activeTab, setActiveTab] = useState<"read" | "edit">("read")
  const [editedStory, setEditedStory] = useState(story)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave;
    setIsSaving(true)
    try {
      await onSave()
    } catch (error) {
      console.error("Error saving story
    } finally {
      setIsSaving(false)
    };
  };
  const handleDownload=""// Create a blob with the story content/
    const blob;
    const url=""// Create a temporary link and trigger download/
    const a;
    a.href;
    a.download;
    document.body.appendChild(a)
    a.click()

    // Clean up/
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  };
  const handleShare=""// Check if Web Share API is available/
    if (navigator.share) {
      navigator
        .share({
          title,text,url
        })
        .catch((error) => console.log("Error sharing
    } else {
      // Fallback for browsers that don't support the Web Share API/
      alert("Sharing is not supported in your browser. You can copy the URL manually.")
    };
  };
  return (
    <div className=""
      <div className=""
        <div className=""
          <Button variant;
            <ArrowLeft className=""
            <span className=""
          </Button>/
          <h2 className=""
        </div>/

        <div className=""
          <Button
            variant,size;
            className={activeTab === "read" ? "bg-slate-100" : ""};
            onClick={() => setActiveTab("read")})
          >
            Read
          </Button>/
          <Button
            variant,size;
            className={activeTab === "edit" ? "bg-slate-100" : ""};
            onClick={() => setActiveTab("edit")})
          >
            <Edit className=""
            Edit/
          </Button>/
        </div>/
      </div>/

      <div className=""
        {activeTab;
          <div className=""
            <ReactMarkdown>{editedStory}</ReactMarkdown>/
          </div>/
        ) : (
          <textarea
            value={editedStory};
            onChange={(e) => setEditedStory(e.target.value)})
            className=""
            placeholder=""/>/
        )};
      </div>/

      <div className=""
        <Button variant;
          <ArrowLeft className=""
          Back to Wizard/
        </Button>/

        <div className=""
          <Button variant;
            <Share2 className=""
            Share/
          </Button>/
          <Button variant;
            <Download className=""
            Download/
          </Button>/
          <Button
            size;
            onClick={handleSave};
            disabled={isSaving};
            className=""
          >
            <Save className=""
            {isSaving ? "Saving..." : "Save Story"};
          </Button>/
        </div>/
      </div>/
    </div>/
  )
};