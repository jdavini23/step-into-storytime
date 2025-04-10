import { render, screen, fireEvent, act } from '@testing-library/react';
import InteractiveStoryViewer from '../index';
import { StoryData } from '@/lib/types';

// Mock the speech synthesis API
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  paused: false,
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
});

// Mock sound effects
jest.mock('../SoundEffects', () => ({
  useSoundEffects: () => ({
    handleWordEffect: jest.fn(),
    playPageFlip: jest.fn(),
  }),
}));

const now = new Date().toISOString();

const mockStory: StoryData = {
  id: '1',
  title: 'Test Story',
  content: {
    en: [
      'Page one content.',
      'Page two content with magic spell.',
      'Page three content.',
    ],
    es: [
      'Contenido de la página uno.',
      'Contenido de la página dos con hechizo mágico.',
      'Contenido de la página tres.',
    ],
  },
  character: {
    name: 'Test Character',
    description: 'Test appearance',
  },
  setting: 'Test setting',
  theme: 'Test theme',
  plot_elements: [],
  created_at: now,
  updated_at: now,
  user_id: '',
  is_published: true,
  thumbnail_url: null,
};

describe('InteractiveStoryViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the story viewer with initial page', () => {
    render(<InteractiveStoryViewer story={mockStory} />);
    expect(screen.getByText('Page one content.')).toBeInTheDocument();
  });

  it('handles language switching', () => {
    render(<InteractiveStoryViewer story={mockStory} />);

    const spanishButton = screen.getByText('ES');
    fireEvent.click(spanishButton);

    const audioController = screen.getByRole('button', {
      name: /play narration/i,
    });
    expect(audioController).toBeInTheDocument();
  });

  it('navigates between pages', async () => {
    render(<InteractiveStoryViewer story={mockStory} />);

    const nextButton = screen.getByText('Next');

    await act(async () => {
      fireEvent.click(nextButton);
      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(screen.getByText(/page two content/i)).toBeInTheDocument();
  });

  it('disables navigation during animation', () => {
    render(<InteractiveStoryViewer story={mockStory} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Button should be disabled immediately after click
    expect(nextButton).toBeDisabled();
  });

  it('handles word clicks and sound effects', () => {
    render(<InteractiveStoryViewer story={mockStory} />);

    const magicWord = screen.getByText('magic');
    fireEvent.click(magicWord);

    // Add assertions based on your sound effect implementation
  });

  it('maintains audio controller state', () => {
    render(<InteractiveStoryViewer story={mockStory} />);

    const playButton = screen.getByRole('button', { name: /play narration/i });
    fireEvent.click(playButton);

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
  });
});
