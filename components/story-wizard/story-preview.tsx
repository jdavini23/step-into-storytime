'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Share2, Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface StoryPreviewProps {
  story: string;
  storyData: any;
  onBack: () => void;
  onSave: () => Promise<void>;
}

export default function StoryPreview({
  story,
  storyData,
  onBack,
  onSave,
}: StoryPreviewProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'edit'>('read');
  const [editedStory, setEditedStory] = useState(story);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving story:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    // Create a blob with the story content
    const blob = new Blob([editedStory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyData.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: storyData.title,
          text: 'Check out this story I created with Step Into Storytime!',
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(
        'Sharing is not supported in your browser. You can copy the URL manually.'
      );
    }
  };

  const formatStoryText = (text: string) => {
    return (
      text
        // Handle multiple hashes properly
        .replace(/#{2,}/g, '\n## ')
        // Handle single hashes with proper spacing
        .replace(/#([^#\n])/g, '\n# $1')
        // Ensure proper paragraph breaks
        .split(/\n{2,}/)
        .join('\n\n')
        .trim()
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="border-b border-slate-100 p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h2 className="font-bold text-2xl md:text-3xl text-slate-900">
              {storyData.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <span>By {storyData.mainCharacter?.name}'s family</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-violet-600">{storyData.theme}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`${
              activeTab === 'read'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : ''
            }`}
            onClick={() => setActiveTab('read')}
          >
            Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${
              activeTab === 'edit'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : ''
            }`}
            onClick={() => setActiveTab('edit')}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 min-h-[60vh]">
        {activeTab === 'read' ? (
          <div className="prose prose-lg prose-violet max-w-none">
            <div className="mb-8 p-4 bg-violet-50 rounded-lg border border-violet-100">
              <h3 className="text-violet-800 font-medium mb-2">
                Story Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Main Character:</span>
                  <p className="font-medium">{storyData.mainCharacter?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Setting:</span>
                  <p className="font-medium">{storyData.setting}</p>
                </div>
                <div>
                  <span className="text-slate-500">Theme:</span>
                  <p className="font-medium">{storyData.theme}</p>
                </div>
                <div>
                  <span className="text-slate-500">Elements:</span>
                  <p className="font-medium">
                    {storyData.plotElements?.join(', ')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-lg leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ node, children }) => (
                    <p className="mb-6 text-slate-700 whitespace-pre-wrap">
                      {children}
                    </p>
                  ),
                  h1: ({ node, children }) => (
                    <h1 className="text-3xl font-bold mb-6 text-slate-900">
                      {children}
                    </h1>
                  ),
                  h2: ({ node, children }) => (
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                      {children}
                    </h2>
                  ),
                  strong: ({ node, children }) => (
                    <strong className="font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),
                  em: ({ node, children }) => (
                    <em className="text-slate-800">{children}</em>
                  ),
                }}
              >
                {formatStoryText(editedStory)}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <p>
                You're editing the story. The content uses Markdown formatting:
              </p>
              <ul className="mt-2 list-disc list-inside">
                <li># Title</li>
                <li>## Subtitle</li>
                <li>**Bold text**</li>
                <li>*Italic text*</li>
              </ul>
            </div>
            <textarea
              value={editedStory}
              onChange={(e) => setEditedStory(e.target.value)}
              className="w-full h-[500px] p-6 border border-slate-200 rounded-lg font-mono text-sm leading-relaxed focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
              placeholder="Edit your story here..."
            />
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4 md:p-6 flex items-center justify-between bg-slate-50">
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
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {isSaving ? 'Saving...' : 'Save Story'}
          </Button>
        </div>
      </div>
    </div>
  );
}
