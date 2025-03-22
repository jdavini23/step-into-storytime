/** @jsxImportSource @emotion/react */

'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Download, Share2, Save, Edit, 
  Volume2, VolumeX, Sparkles, BookOpen, 
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import AnimatedStoryElement from './AnimatedStoryElement';
import ThemeOverlay from './ThemeOverlay';
import AmbientSoundPlayer from './AmbientSoundPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { storyPreviewStyles } from './StoryPreviewStyles';

// Common theme colors for children's stories
const THEME_COLORS = {
  friendship: { primary: '#FF6B6B', secondary: '#FFD93D', accent: '#6BCB77' },
  courage: { primary: '#4D96FF', secondary: '#6BCB77', accent: '#FFD93D' },
  discovery: { primary: '#9C27B0', secondary: '#2196F3', accent: '#FF9800' },
  kindness: { primary: '#FF96AD', secondary: '#B5DEFF', accent: '#AFF6D6' },
  imagination: { primary: '#A78BFA', secondary: '#34D399', accent: '#F472B6' },
  teamwork: { primary: '#0EA5E9', secondary: '#A3E635', accent: '#FB923C' },
  default: { primary: '#8B5CF6', secondary: '#FF9800', accent: '#2DD4BF' }
};

interface StoryPreviewProps {
  story: string;
  storyData: any;
  onBack: () => void;
  onSave: () => Promise<void>;
}

type ParagraphType = 'paragraph' | 'heading1' | 'heading2' | 'heading3';

interface StoryParagraph {
  content: string;
  type: ParagraphType;
  index: number;
}

type FontSize = 'small' | 'medium' | 'large';

// Words per page based on font size
const WORDS_PER_PAGE: Record<FontSize, number> = {
  small: 250,
  medium: 200,
  large: 150
};

export default function StoryPreview({
  story,
  storyData,
  onBack,
  onSave,
}: StoryPreviewProps) {
  const [editedStory, setEditedStory] = useState(story);
  const [activeTab, setActiveTab] = useState<'read' | 'edit'>('read');
  const [currentPage, setCurrentPage] = useState(0);
  const [showToolTip, setShowToolTip] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [isSaving, setIsSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get theme colors based on the story theme
  const themeColors = useMemo(() => {
    const theme = storyData.theme?.toLowerCase() || 'default';
    return THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.default;
  }, [storyData.theme]);

  // Story text formatting function
  const formatStoryText = useCallback((text: string): { title: string; content: string } => {
    if (!text || typeof text !== 'string') return { title: '', content: '' };
    
    // Split text into lines and normalize line endings
    const lines = text.trim().replace(/\r\n/g, '\n').split('\n');
    const firstLine = lines[0] || '';
    
    // Extract title and story content
    let title = '';
    let content = text;
    
    // Find the title - look for "in" followed by location name
    const inIndex = firstLine.indexOf(' in ');
    if (inIndex > -1) {
      const locationStart = inIndex + 4; // length of " in "
      const locationEnd = firstLine.indexOf('Once upon a time');
      if (locationEnd > -1) {
        title = firstLine.substring(0, locationEnd).trim();
        content = firstLine.substring(locationEnd) + '\n' + lines.slice(1).join('\n');
      }
    }
    
    // If no location found, use first sentence as title
    if (!title) {
      const periodIndex = firstLine.indexOf('.');
      if (periodIndex > -1) {
        title = firstLine.substring(0, periodIndex + 1).trim();
        content = firstLine.substring(periodIndex + 1).trim() + '\n' + lines.slice(1).join('\n');
      } else {
        title = firstLine;
        content = lines.slice(1).join('\n');
      }
    }
    
    // Format the content with proper paragraph breaks
    content = content
      .trim()
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      // Ensure proper sentence breaks
      .replace(/\.\s*(\n)?/g, '.\n\n')
      // Clean up excessive newlines while preserving paragraph breaks
      .replace(/\n{3,}/g, '\n\n')
      // Ensure proper spacing after punctuation
      .replace(/([.!?])\s*(\w)/g, '$1 $2');
    
    return { title, content };
  }, []);

  // Format story text with better title extraction and paragraph handling
  const { title, content } = useMemo(() => formatStoryText(editedStory), [editedStory, formatStoryText]);

  // Process story for PageTurner by splitting paragraphs
  const storyParagraphs = useMemo(() => {
    if (!editedStory) return [];
    
    // Create paragraphs array starting with the title
    const paragraphs: StoryParagraph[] = [
      {
        content: title,
        type: 'heading1',
        index: 0
      }
    ];
    
    // Split remaining content into paragraphs
    const contentParagraphs = content
      .split(/\n\n+/)
      .filter((p: string) => p.trim().length > 0)
      .map((p: string, i: number): StoryParagraph => ({
        content: p.trim(),
        type: 'paragraph',
        index: i + 1
      }));
    
    return [...paragraphs, ...contentParagraphs];
  }, [editedStory, title, content]);

  // Split story into pages
  const storyPages = useMemo(() => {
    if (!storyParagraphs.length) return [];
    
    const pages: StoryParagraph[][] = [];
    let currentPage: StoryParagraph[] = [];
    let wordCount = 0;
    const wordsPerPage = WORDS_PER_PAGE[fontSize];
    
    storyParagraphs.forEach((paragraph) => {
      const paragraphWordCount = paragraph.content.split(/\s+/).length;
      
      // Always put title on its own page
      if (paragraph.type === 'heading1') {
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
        }
        pages.push([paragraph]);
        currentPage = [];
        wordCount = 0;
        return;
      }
      
      // Check if adding this paragraph would exceed the word limit
      if (wordCount + paragraphWordCount > wordsPerPage && currentPage.length > 0) {
        pages.push([...currentPage]);
        currentPage = [];
        wordCount = 0;
      }
      
      currentPage.push(paragraph);
      wordCount += paragraphWordCount;
    });
    
    // Add any remaining paragraphs
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    return pages;
  }, [storyParagraphs, fontSize]);

  // Auto-advance pages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPlayEnabled) {
      interval = setInterval(() => {
        setCurrentPage((prev) => {
          const nextPage = prev + 1;
          if (nextPage >= storyPages.length) {
            setAutoPlayEnabled(false);
            return prev;
          }
          return nextPage;
        });
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [autoPlayEnabled, storyPages.length]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      // Show a fun animation or effect when saving is complete
      playSuccessAnimation();
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
    
    // Show fun animation for kid engagement
    playSuccessAnimation();
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
    
    // Visual feedback when sharing
    playSuccessAnimation();
  };
  
  // Fun animation effect for successful actions
  const playSuccessAnimation = () => {
    if (containerRef.current) {
      const element = containerRef.current;
      element.classList.add('animate-wiggle');
      setTimeout(() => {
        element.classList.remove('animate-wiggle');
      }, 1000);
    }
  };

  // Toggle full screen for a more immersive reading experience
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Navigate between pages
  const goToNextPage = () => {
    const maxPage = storyPages.length - 1;
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get font size class based on current setting
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-base md:text-lg';
      case 'large': return 'text-xl md:text-2xl';
      case 'medium':
      default: return 'text-lg md:text-xl';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      css={storyPreviewStyles.container}
      ref={containerRef}
    >
      <div css={storyPreviewStyles.header}>
        <div css={storyPreviewStyles.headerLeft}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Go Back</span>
          </Button>
          {showToolTip === 'back' && (
            <div css={storyPreviewStyles.tooltip}>
              Go back to wizard
            </div>
          )}
          <div css={storyPreviewStyles.headerInfo}>
            <h2 
              className="font-bold text-2xl md:text-3xl" 
              style={{ 
                color: themeColors.primary,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {storyData.title}
            </h2>
            <div css={storyPreviewStyles.metadata}>
              <span>By {storyData.mainCharacter?.name}'s family</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span style={{ color: themeColors.primary }}>{storyData.theme}</span>
            </div>
          </div>
        </div>

        <div css={storyPreviewStyles.controls}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('read')}
            css={storyPreviewStyles.tabButton(activeTab === 'read', themeColors.primary)}
          >
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('edit')}
            css={storyPreviewStyles.tabButton(activeTab === 'edit', themeColors.primary)}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      <div css={storyPreviewStyles.content}>
        {activeTab === 'read' ? (
          <div>
            <motion.div 
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {storyPages[currentPage]?.map((paragraph, index) => (
                <motion.div
                  key={`${currentPage}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {paragraph.type === 'heading1' ? (
                    <h1 
                      className="text-3xl md:text-4xl font-bold mb-8 mt-6 tracking-tight text-center"
                      style={{ 
                        color: themeColors.primary,
                        textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {paragraph.content}
                    </h1>
                  ) : paragraph.type === 'heading2' ? (
                    <h2 
                      className="text-2xl md:text-3xl font-semibold mb-6 mt-8 tracking-tight"
                      style={{ color: themeColors.secondary }}
                    >
                      {paragraph.content}
                    </h2>
                  ) : paragraph.type === 'heading3' ? (
                    <h3 
                      className="text-xl md:text-2xl font-semibold mb-4 mt-6 tracking-tight"
                      style={{ color: themeColors.accent }}
                    >
                      {paragraph.content}
                    </h3>
                  ) : (
                    <p className="mb-6 whitespace-pre-line leading-relaxed text-slate-700">
                      {paragraph.content}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Page navigation */}
            <div css={storyPreviewStyles.pageNavigation}>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="hover:bg-slate-100"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage + 1} of {storyPages.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === storyPages.length - 1}
                className="hover:bg-slate-100"
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={editedStory}
              onChange={(e) => setEditedStory(e.target.value)}
              className="w-full min-h-[60vh] p-4 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none"
              placeholder="Edit your story here..."
              style={{
                background: `linear-gradient(to right, #f9f9f9, #ffffff)`,
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400">
              {editedStory.length} characters
            </div>
          </div>
        )}
      </div>

      <div 
        className="p-4 md:p-6 border-t flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}20)`,
          borderTop: `2px solid ${themeColors.primary}30`
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {soundEnabled && (
            <div className="hidden md:block">
              <AmbientSoundPlayer 
                theme={storyData.theme} 
                setting={storyData.setting} 
                isEnabled={soundEnabled} 
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="hidden md:flex items-center bg-white/90 hover:bg-white shadow-sm"
              style={{ 
                borderColor: themeColors.accent,
                color: themeColors.accent 
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="hidden md:flex items-center bg-white/90 hover:bg-white shadow-sm"
              style={{ 
                borderColor: themeColors.secondary,
                color: themeColors.secondary
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-1" />
              Share
            </Button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="relative overflow-hidden"
              style={{ 
                backgroundColor: themeColors.primary,
                borderColor: themeColors.primary
              }}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save Story
                </>
              )}
              {/* Sparkle effect on hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full hover:animate-shine" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile bottom controls */}
      <div className="md:hidden flex items-center justify-around p-3 border-t shadow-inner bg-white/80 backdrop-blur-sm">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-xs"
          onClick={handleDownload}
          style={{ color: themeColors.accent }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm" style={{ border: `2px solid ${themeColors.accent}20` }}>
            <Download className="h-5 w-5" />
          </div>
          Download
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-xs"
          onClick={handleShare}
          style={{ color: themeColors.secondary }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm" style={{ border: `2px solid ${themeColors.secondary}20` }}>
            <Share2 className="h-5 w-5" />
          </div>
          Share
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-xs"
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{ color: themeColors.primary }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm" style={{ border: `2px solid ${themeColors.primary}20` }}>
            {soundEnabled ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </div>
          {soundEnabled ? 'Mute' : 'Sound'}
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-xs"
          onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
          style={{ color: themeColors.accent }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm" style={{ border: `2px solid ${themeColors.accent}20` }}>
            <Zap className="h-5 w-5" />
          </div>
          {autoPlayEnabled ? 'Stop' : 'Auto'} Play
        </motion.button>
      </div>

      {/* Add CSS for wiggle animation and story content styling */}
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        
        @keyframes shine {
          to {
            transform: translateX(100%);
          }
        }
        
        .animate-shine {
          animation: shine 1s linear infinite;
        }
        
        .story-content {
          font-family: var(--font-sans);
          max-width: 65ch;
          margin: 0 auto;
          color: #4a5568;
        }
        
        .story-content h1 {
          font-family: var(--font-display);
          font-size: 2.5rem;
          line-height: 1.2;
          margin: 2rem 0;
          text-align: center;
          color: ${themeColors.primary};
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .story-content h2 {
          font-family: var(--font-display);
          font-size: 2rem;
          line-height: 1.3;
          margin: 1.5rem 0;
          color: ${themeColors.secondary};
        }
        
        .story-content h3 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          line-height: 1.4;
          margin: 1.25rem 0;
          color: ${themeColors.accent};
        }
        
        .story-content p {
          font-size: 1.125rem;
          line-height: 1.8;
          margin: 1.25rem 0;
          text-indent: 2rem;
          color: #4a5568;
          letter-spacing: 0.01em;
        }
        
        .story-content p:first-of-type {
          text-indent: 0;
          font-size: 1.25rem;
          line-height: 1.7;
        }
        
        .story-content p:first-of-type::first-letter {
          font-size: 3.25rem;
          font-family: var(--font-display);
          float: left;
          line-height: 1;
          padding: 0.1em 0.1em 0 0;
          color: ${themeColors.primary};
        }
        
        @media (max-width: 768px) {
          .story-content h1 {
            font-size: 2rem;
          }
          
          .story-content h2 {
            font-size: 1.75rem;
          }
          
          .story-content h3 {
            font-size: 1.5rem;
          }
          
          .story-content p {
            font-size: 1rem;
            line-height: 1.7;
          }
          
          .story-content p:first-of-type {
            font-size: 1.125rem;
          }
          
          .story-content p:first-of-type::first-letter {
            font-size: 2.75rem;
          }
        }
      `}</style>
    </motion.div>
  );
}
