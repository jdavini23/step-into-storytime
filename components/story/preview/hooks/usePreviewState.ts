import { useReducer } from 'react';
import { FontSize } from '../../common/types';

// State management
export type PreviewAction =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_FONT_SIZE'; payload: FontSize }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'TOGGLE_AUTO_PLAY'; payload: boolean }
  | { type: 'SET_THEME'; payload: string };

export interface PreviewState {
  currentPage: number;
  fontSize: FontSize;
  soundEnabled: boolean;
  autoPlayEnabled: boolean;
  theme: string;
}

const previewReducer = (
  state: PreviewState,
  action: PreviewAction
): PreviewState => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: action.payload };
    case 'TOGGLE_AUTO_PLAY':
      return { ...state, autoPlayEnabled: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

export function usePreviewState(initialTheme: string = 'default') {
  const [state, dispatch] = useReducer(previewReducer, {
    currentPage: 0,
    fontSize: 'medium',
    soundEnabled: false,
    autoPlayEnabled: false,
    theme: initialTheme,
  });

  return {
    state,
    dispatch,
  };
}
