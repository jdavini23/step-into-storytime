import { createContext, useContext, useReducer, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

type StepKey = keyof typeof WIZARD_STEPS;

interface StepState {
  currentStep: StepKey;
  completedSteps: Set<StepKey>;
  storyData: Record<string, any>;
  isGenerating: boolean;
}

type StepAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: StepKey }
  | { type: 'UPDATE_STORY_DATA'; payload: Record<string, any> }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'COMPLETE_STEP'; payload: StepKey };

const stepReducer = (state: StepState, action: StepAction): StepState => {
  switch (action.type) {
    case 'NEXT_STEP': {
      const currentIndex = Object.keys(WIZARD_STEPS).indexOf(state.currentStep);
      const nextStep = Object.keys(WIZARD_STEPS)[currentIndex + 1] as StepKey;
      return {
        ...state,
        currentStep: nextStep || state.currentStep,
      };
    }
    case 'PREV_STEP': {
      const currentIndex = Object.keys(WIZARD_STEPS).indexOf(state.currentStep);
      const prevStep = Object.keys(WIZARD_STEPS)[currentIndex - 1] as StepKey;
      return {
        ...state,
        currentStep: prevStep || state.currentStep,
      };
    }
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'UPDATE_STORY_DATA':
      return {
        ...state,
        storyData: { ...state.storyData, ...action.payload },
      };
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload,
      };
    case 'COMPLETE_STEP': {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(action.payload);
      return {
        ...state,
        completedSteps: newCompletedSteps,
      };
    }
    default:
      return state;
  }
};

const StepContext = createContext<{
  state: StepState;
  dispatch: React.Dispatch<StepAction>;
} | null>(null);

export function useStepManager() {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useStepManager must be used within a StepManagerProvider');
  }
  return context;
}

interface StepManagerProviderProps {
  children: ReactNode;
}

export function StepManagerProvider({ children }: StepManagerProviderProps) {
  const [state, dispatch] = useReducer(stepReducer, {
    currentStep: 'WELCOME' as StepKey,
    completedSteps: new Set<StepKey>(),
    storyData: {},
    isGenerating: false,
  });

  return (
    <StepContext.Provider value={{ state, dispatch }}>
      {children}
    </StepContext.Provider>
  );
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
