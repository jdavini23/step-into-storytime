import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoryPreview from '../story-preview';
import '@testing-library/jest-dom';

// Mock StoryPreviewStyles
jest.mock('../StoryPreviewStyles', () => ({
  storyPreviewStyles: {
    container: 'mock-container-styles',
    header: 'mock-header-styles',
    headerLeft: 'mock-header-left-styles',
    headerInfo: 'mock-header-info-styles',
    title: 'mock-title-styles',
    metadata: 'mock-metadata-styles',
    content: 'mock-content-styles',
    tabButton: (isActive: boolean, primaryColor: string) => 'mock-tab-button-styles',
    tooltip: 'mock-tooltip-styles',
  }
}));

// Mock dependencies
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    measureElement: () => {},
    scrollToIndex: () => {},
  }),
}));

// Mock Emotion
jest.mock('@emotion/react', () => ({
  ...jest.requireActual('@emotion/react'),
  css: jest.fn((styles) => styles),
  Global: jest.fn(({ styles }) => null),
}));

// Mock theme colors for testing
jest.mock('../theme-colors', () => ({
  themeColors: {
    friendship: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
    },
    courage: {
      primary: '#4D96FF',
      secondary: '#6BCB77',
      accent: '#FFD93D',
    },
    discovery: {
      primary: '#9C27B0',
      secondary: '#2196F3',
      accent: '#FF9800',
    },
    kindness: {
      primary: '#FF96AD',
      secondary: '#B5DEFF',
      accent: '#AFF6D6',
    },
    imagination: {
      primary: '#A78BFA',
      secondary: '#34D399',
      accent: '#F472B6',
    },
    teamwork: {
      primary: '#0EA5E9',
      secondary: '#A3E635',
      accent: '#FB923C',
    },
    default: {
      primary: '#8B5CF6',
      secondary: '#FF9800',
      accent: '#2DD4BF',
    },
  },
}));

// Mock AmbientSoundPlayer
jest.mock('../AmbientSoundPlayer', () => ({
  __esModule: true,
  default: ({ theme, setting, isEnabled }: { theme: string; setting: string; isEnabled: boolean }) => (
    <div data-testid="ambient-sound-player">
      <span className="sr-only">
        {isEnabled ? 'Playing ambient sound for ' : 'Ambient sound disabled for '} {setting} theme
      </span>
    </div>
  ),
}));

const mockStoryData = {
  id: '1',
  title: 'Test Story',
  content: 'Once upon a time...',
  metadata: {
    wordCount: 100,
    readingTime: 5,
    targetAge: 7,
    difficulty: 'medium' as const,
    theme: 'friendship' as const,
    setting: 'forest' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  accessibility: {
    contrast: 'normal' as const,
    motionReduced: false,
    fontSize: 'medium' as const,
    lineHeight: 1.5,
  },
};

const mockProps = {
  story: 'Once upon a time...',
  storyData: mockStoryData,
  onBack: jest.fn().mockImplementation(() => Promise.resolve()),
  onSave: jest.fn().mockImplementation(() => Promise.resolve()),
};

describe('StoryPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders story content correctly', () => {
    console.log('mockStoryData:', mockStoryData);
    render(<StoryPreview {...mockProps} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('Once upon a time...')).toBeInTheDocument();
  });

  it('applies correct theme colors', () => {
    render(<StoryPreview {...mockProps} />);
    const container = screen.getByRole('article');
    const styles = window.getComputedStyle(container);
    expect(styles.getPropertyValue('--primary-color')).toBe('#FF6B6B');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<StoryPreview {...mockProps} />);
    const article = screen.getByRole('article');

    await act(async () => {
      article.focus();
      await user.keyboard('{ArrowRight}');
    });

    // Check if page navigation occurred
    expect(screen.getByText('Page 2 of')).toBeInTheDocument();
  });

  it('toggles sound correctly', async () => {
    const user = userEvent.setup();
    render(<StoryPreview {...mockProps} />);
    
    const soundButton = screen.getByRole('button', { name: /sound/i });
    await user.click(soundButton);
    
    expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
  });

  it('handles auto-play functionality', async () => {
    const user = userEvent.setup();
    render(<StoryPreview {...mockProps} />);
    
    const autoPlayButton = screen.getByRole('button', { name: /auto play/i });
    await user.click(autoPlayButton);
    
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<StoryPreview {...mockProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    expect(mockProps.onSave).toHaveBeenCalled();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<StoryPreview {...mockProps} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('handles font size changes', async () => {
    const user = userEvent.setup();
    render(<StoryPreview {...mockProps} />);
    
    const fontSizeButton = screen.getByRole('button', { name: /font size/i });
    await user.click(fontSizeButton);
    
    expect(screen.getByRole('button', { name: /large/i })).toBeInTheDocument();
  });

  it('maintains accessibility standards', () => {
    render(<StoryPreview {...mockProps} />);
    
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'Story: Test Story');
    expect(article).toHaveAttribute('tabIndex', '0');
  });

  describe('Story formatting', () => {
    it('formats headings correctly', () => {
      const storyWithHeadings = {
        ...mockProps,
        story: '# Chapter 1\nOnce upon a time...',
      };
      
      render(<StoryPreview {...storyWithHeadings} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Chapter 1');
    });

    it('handles empty story gracefully', () => {
      const emptyStory = {
        ...mockProps,
        story: '',
      };
      
      render(<StoryPreview {...emptyStory} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });
});
