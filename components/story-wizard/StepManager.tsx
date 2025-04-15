import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryData } from '@/lib/types';

// Step configuration
export const WIZARD_STEPS = {
  WELCOME: {
    id: 'welcome',
    title: 'Welcome',
    message: 'Hi! Ready to create a magical bedtime story together?',
    progress: 0,
  },
  CHARACTER: {
    id: 'character',
    title: 'Character Creation',
    message: "Who's the hero of our story?",
    progress: 20,
  },
  SETTING: {
    id: 'setting',
    title: 'Story Setting',
    message: 'Where does this story take place?',
    progress: 40,
  },
  THEME: {
    id: 'theme',
    title: 'Story Theme',
    message: 'What kind of story should this be?',
    progress: 60,
  },
  LENGTH: {
    id: 'length',
    title: 'Story Length',
    message: 'How long should the story be?',
    progress: 80,
  },
  PREVIEW: {
    id: 'preview',
    title: 'Story Preview',
    message: "Here's your story preview!",
    progress: 100,
  },
} as const;

type StepKey =
  | 'WELCOME'
  | 'CHARACTER'
  | 'SETTING'
  | 'THEME'
  | 'LENGTH'
  | 'PREVIEW';

export interface StepState {
  currentStep: StepKey;
  storyData: Partial<StoryData>;
}

type StepAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_STORY_DATA'; payload: Partial<StoryData> }
  | { type: 'RESET_WIZARD' }
  | { type: 'SET_STEP'; payload: StepKey };

const STEPS: StepKey[] = [
  'WELCOME',
  'CHARACTER',
  'SETTING',
  'THEME',
  'PREVIEW',
];

const initialState: StepState = {
  currentStep: 'WELCOME',
  storyData: {},
};

function stepReducer(state: StepState, action: StepAction): StepState {
  const currentIndex = STEPS.indexOf(state.currentStep);

  switch (action.type) {
    case 'NEXT_STEP': {
      const nextIndex = currentIndex + 1;
      if (nextIndex < STEPS.length) {
        return {
          ...state,
          currentStep: STEPS[nextIndex],
        };
      }
      return state;
    }
    case 'PREV_STEP': {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        return {
          ...state,
          currentStep: STEPS[prevIndex],
        };
      }
      return state;
    }
    case 'UPDATE_STORY_DATA':
      return {
        ...state,
        storyData: { ...state.storyData, ...action.payload },
      };
    case 'RESET_WIZARD':
      return initialState;
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    default:
      return state;
  }
}

interface StepManagerContextValue {
  state: StepState;
  dispatch: React.Dispatch<StepAction>;
  storyData: Partial<StoryData>;
  setStoryData: (data: Partial<StoryData>) => void;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

const StepManagerContext = createContext<StepManagerContextValue | undefined>(
  undefined
);

export function StepManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(stepReducer, initialState);
  const [isGenerating, setIsGenerating] = useState(false);

  const setStoryData = (data: Partial<StoryData>) => {
    dispatch({ type: 'UPDATE_STORY_DATA', payload: data });
  };

  return (
    <StepManagerContext.Provider
      value={{
        state,
        dispatch,
        storyData: state.storyData,
        setStoryData,
        isGenerating,
        setIsGenerating,
      }}
    >
      {children}
    </StepManagerContext.Provider>
  );
}

export function useStepManager() {
  const context = useContext(StepManagerContext);
  if (!context) {
    throw new Error('useStepManager must be used within a StepManagerProvider');
  }
  return context;
}

interface StepManagerProps {
  children: ReactNode;
}

export function StepManager({ children }: StepManagerProps) {
  const { state } = useStepManager();
  const currentStepConfig = WIZARD_STEPS[state.currentStep];

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{currentStepConfig.title}</h2>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${currentStepConfig.progress}%` }}
          />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
