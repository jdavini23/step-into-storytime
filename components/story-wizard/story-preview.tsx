'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, Download, Share2, Save, Edit, Volume } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import AnimatedStoryElement from './AnimatedStoryElement';
import ThemeOverlay from './ThemeOverlay';
import AmbientSoundPlayer from './AmbientSoundPlayer';
import { motion } from 'framer-motion';

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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

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

  // Process story for PageTurner by splitting paragraphs
  const storyParagraphs = useMemo(() => {
    if (!editedStory) return [];
    
    const formattedText = formatStoryText(editedStory);
    
    // Split by paragraphs, headings, and other block elements
    return formattedText
      .split(/\n{1,}/)
      .filter(paragraph => paragraph.trim().length > 0)
      .map((paragraph, index) => {
        // Determine paragraph type
        let type: 'paragraph' | 'heading1' | 'heading2' = 'paragraph';
        if (paragraph.startsWith('# ')) {
          type = 'heading1';
          paragraph = paragraph.substring(2);
        } else if (paragraph.startsWith('## ')) {
          type = 'heading2';
          paragraph = paragraph.substring(3);
        }
        
        return { content: paragraph, type, index };
      });
  }, [editedStory]);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
      {/* Theme-based particle overlay */}
      {activeTab === 'read' && showParticles && (
        <ThemeOverlay theme={storyData.theme} setting={storyData.setting} />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-slate-100 p-4 md:p-6 flex items-center justify-between"
      >
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
      </motion.div>

      <div className="p-6 md:p-8 lg:p-10 min-h-[60vh] relative">
        {activeTab === 'read' ? (
          <div className="prose prose-lg prose-violet max-w-none">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-4 bg-violet-50 rounded-lg border border-violet-100"
            >
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
              <div className="flex mt-4 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParticles(!showParticles)}
                  className="text-xs"
                >
                  {showParticles ? 'Disable' : 'Enable'} Effects
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-xs"
                >
                  <Volume className="h-3 w-3 mr-1" />
                  {soundEnabled ? 'Disable' : 'Enable'} Sound
                </Button>
              </div>
            </motion.div>
            
            <div className="text-lg leading-relaxed">
              {storyParagraphs.map((paragraph, index) => (
                <AnimatedStoryElement 
                  key={index} 
                  delay={index} 
                  type={paragraph.type}
                >
                  {paragraph.type === 'heading1' ? (
                    <h1 className="text-3xl font-bold mb-6 text-slate-900">
                      {paragraph.content}
                    </h1>
                  ) : paragraph.type === 'heading2' ? (
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900">
                      {paragraph.content}
                    </h2>
                  ) : (
                    <p className="mb-6 text-slate-700 whitespace-pre-wrap">
                      {paragraph.content}
                    </p>
                  )}
                </AnimatedStoryElement>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <p>
                You're editing the story. The content uses Markdown formatting:
              </p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Use # for titles and ## for subtitles</li>
                <li>
                  Paragraphs are separated by blank lines (press Enter twice)
                </li>
                <li>
                  Use **bold** for <strong>bold text</strong> and *italic* for{' '}
                  <em>italic text</em>
                </li>
              </ul>
            </div>
            <textarea
              value={editedStory}
              onChange={(e) => setEditedStory(e.target.value)}
              className="w-full h-[50vh] p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Start writing your story here..."
            />
            <div className="flex justify-end space-x-3">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-violet-600 hover:bg-violet-700 text-white"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Story'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Ambient sound player */}
      {activeTab === 'read' && (
        <AmbientSoundPlayer 
          setting={storyData.setting} 
          isEnabled={soundEnabled} 
        />
      )}
    </div>
  );
}
