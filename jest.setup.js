import '@testing-library/jest-dom';

// Mock Emotion
jest.mock('@emotion/react', () => ({
  ...jest.requireActual('@emotion/react'),
  css: jest.fn(),
  Global: jest.fn(({ styles }) => null),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock StoryPreviewStyles
jest.mock('./components/story-wizard/StoryPreviewStyles', () => ({
  StoryContainer: ({ children }) => <div data-testid="story-container">{children}</div>,
  PageContainer: ({ children }) => <div data-testid="page-container">{children}</div>,
  NavigationContainer: ({ children }) => <div data-testid="nav-container">{children}</div>,
  ControlsContainer: ({ children }) => <div data-testid="controls-container">{children}</div>,
}));

// Mock TanStack Virtual
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    measureElement: () => {},
    scrollToIndex: () => {},
  }),
}));
