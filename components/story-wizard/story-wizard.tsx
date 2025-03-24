'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ChatMessage from '@/components/story-wizard/chat-message';
import UserInput from '@/components/story-wizard/user-input';
import MultipleChoice from '@/components/story-wizard/multiple-choice';
import { storySteps } from '@/lib/story-wizard-steps';
import { useStory } from '@/contexts/story-context';
import CharacterCreator from '@/components/story-wizard/character-creator';
import StoryPreview from '@/components/story-wizard/story-preview';
import type { StoryData } from '@/components/story/common/types';
import {
  WizardContainer,
  WizardHeader,
  WizardProgress,
  WizardContent,
  MessageList,
  SystemMessage,
  UserMessage,
  InputContainer,
  WizardFooter,
} from './wizard-components';
import { Edit, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/styles';

// Animation variants
const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Define types for props and state
interface StoryWizardProps {
  onError?: (message: string) => void;
}

interface Message {
  type: 'system' | 'user';
  content: string;
  inputType?: string;
  field?: string;
  options?: Array<{ label: string; value: string }>;
}

type StoryField =
  | keyof StoryData
  | `mainCharacter.${keyof StoryData['mainCharacter']}`;

type StoryDataKey = keyof StoryData;
type MainCharacterKey = keyof StoryData['mainCharacter'];

export default function StoryWizard({ onError }: StoryWizardProps) {
  const { generateStoryContent, createStory } = useStory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [storyData, setStoryData] = useState<StoryData>({
    id: '',
    title: '',
    content: '',
    mainCharacter: {
      name: '',
      age: '',
      traits: [],
      appearance: '',
    },
    setting: '',
    theme: '',
    plotElements: [],
    metadata: {
      targetAge: 8,
      difficulty: 'medium',
      theme: '',
      setting: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
      readingTime: 0,
    },
    accessibility: {
      contrast: 'normal',
      motionReduced: false,
      fontSize: 'medium',
      lineHeight: 1.5,
    },
  });

  const [isTyping, setIsTyping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const getPlaceholder = (field: StoryField): string => {
    switch (field) {
      case 'mainCharacter.name':
        return "Type your character's name...";
      case 'mainCharacter.age':
        return "Type your character's age...";
      case 'title':
        return 'Type your story title...';
      default:
        return `Type your ${field.split('.').pop()}...`;
    }
  };

  const handleBackStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= -1) {
      setCurrentStep(prevStep);
      setMessages(messages.slice(0, -2));
    }
  };

  const handleUserInput = (value: string | string[], field: StoryField) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.') as [
        StoryDataKey,
        MainCharacterKey
      ];
      setStoryData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof StoryData],
          [child]: Array.isArray(value) ? value : value.trim(),
        },
      }));
    } else {
      setStoryData((prev) => ({
        ...prev,
        [field]: Array.isArray(value) ? value : value.trim(),
      }));
    }

    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: Array.isArray(value) ? value.join(', ') : value,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    // Get next step from storySteps array
    const nextStep = currentStep + 1;

    // Ensure we're showing the character name step after title
    if (field === 'title') {
      const characterNameStep = storySteps[0]; // First step is character name
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'system',
            content: characterNameStep.message,
            inputType: characterNameStep.inputType,
            field: characterNameStep.field,
            options: characterNameStep.options,
          },
        ]);
        setIsTyping(false);
        setCurrentStep(0);
      }, 1000);
    } else if (nextStep < storySteps.length) {
      const step = storySteps[nextStep];
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'system',
            content: step.message,
            inputType: step.inputType,
            field: step.field,
            options: step.options,
          },
        ]);
        setIsTyping(false);
        setCurrentStep(nextStep);
      }, 1000);
    } else {
      // Final step - show review/generate options
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'system',
            content:
              "Thanks for all that information! I'm ready to create your story now. Would you like to review your choices or generate the story?",
            inputType: 'choice',
            field: 'action',
            options: [
              { label: 'Review my choices', value: 'review' },
              { label: 'Generate my story!', value: 'generate' },
            ],
          },
        ]);
        setIsTyping(false);
        setCurrentStep(nextStep);
      }, 1000);
    }
  };

  const handleChoiceSelection = (
    value: string | string[],
    field: StoryField
  ) => {
    const finalValue = Array.isArray(value) ? value[0] : value;
    if (field === 'action') {
      handleFinalAction(finalValue);
    } else if (field === 'viewStory') {
      handleViewStory(finalValue);
    } else if (field === 'retry') {
      handleFinalAction(finalValue);
    } else {
      handleUserInput(finalValue, field);
    }
  };

  const handleTitleEdit = () => {
    const newTitle = prompt('Edit title:', storyData.title);
    if (newTitle) handleEditField('title', newTitle);
  };

  const handleSettingEdit = () => {
    const newSetting = prompt('Edit setting:', storyData.setting);
    if (newSetting) handleEditField('setting', newSetting);
  };

  const handleThemeEdit = () => {
    const newTheme = prompt('Edit theme:', storyData.theme);
    if (newTheme) handleEditField('theme', newTheme);
  };

  const renderReviewField = (
    label: string,
    value: string,
    onEdit: () => void
  ) => {
    return (
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex justify-between items-center">
          <p className="font-medium text-foreground">{value}</p>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8', buttonVariants({ variant: 'ghost' }))}
            onClick={onEdit}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    );
  };

  const renderCharacterReview = () => {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Main Character</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-foreground">
              {storyData.mainCharacter?.name || 'Unnamed Character'}{' '}
              {storyData.mainCharacter?.age
                ? `(${storyData.mainCharacter.age})`
                : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              Traits: {storyData.mainCharacter?.traits?.join(', ') || 'None'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-8', buttonVariants({ variant: 'ghost' }))}
              onClick={() => {
                const newName = prompt(
                  'Edit character name:',
                  storyData.mainCharacter?.name || ''
                );
                if (newName) handleEditField('mainCharacter.name', newName);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit Name
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-8', buttonVariants({ variant: 'ghost' }))}
              onClick={() => {
                const newAge = prompt(
                  'Edit character age:',
                  storyData.mainCharacter?.age || ''
                );
                if (newAge) handleEditField('mainCharacter.age', newAge);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit Age
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Add initial message when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          type: 'system',
          content:
            "Hi there! I'm your storytelling assistant. Let's create a magical story together! What would you like to name your story?",
          inputType: 'text',
          field: 'title',
        },
      ]);
      setIsTyping(false);
      setCurrentStep(-1); // Start at -1 so first step increment goes to 0
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Validate story data
  const validateStoryData = (): string[] => {
    const errors: string[] = [];

    if (!storyData.title?.trim()) {
      errors.push('Please provide a title for your story');
    }

    if (!storyData.mainCharacter?.name?.trim()) {
      errors.push('Please provide a name for the main character');
    }

    if (!storyData.mainCharacter?.age?.trim()) {
      errors.push('Please provide an age for the main character');
    }

    if (!storyData.setting?.trim()) {
      errors.push('Please select a setting for your story');
    }

    if (!storyData.theme?.trim()) {
      errors.push('Please select a theme for your story');
    }

    return errors;
  };

  const handleFinalAction = async (action: string | string[]) => {
    if (Array.isArray(action)) {
      action = action[0]; // Take the first value if it's an array
    }
    try {
      if (action === 'review') {
        // Show review screen
        setMessages((prev) => [
          ...prev,
          {
            type: 'user',
            content: "I'd like to review my choices",
          },
          {
            type: 'system',
            content:
              "Here's a summary of your story elements. You can edit any of them before we generate your story.",
            inputType: 'review',
          },
        ]);
      } else {
        // Validate story data before generation
        const validationErrors = validateStoryData();

        if (validationErrors.length > 0) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'user',
              content: 'Generate my story!',
            },
            {
              type: 'system',
              content: `Before we can generate your story, please fix the following: ${validationErrors.join(
                ', '
              )}`,
              inputType: 'choice',
              field: 'action',
              options: [{ label: 'Review my choices', value: 'review' }],
            },
          ]);
          return;
        }

        // Generate story
        setMessages((prev) => [
          ...prev,
          {
            type: 'user',
            content: 'Generate my story!',
          },
          {
            type: 'system',
            content: 'Creating your magical story...',
            inputType: 'generating',
          },
        ]);

        try {
          // Use the API to generate the story
          const storyContent = await generateStoryContent({
            ...storyData,
            plotElements: storyData.plotElements || [],
          });
          setGeneratedStory(storyContent);

          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              content: 'Your story is ready! Would you like to read it now?',
              inputType: 'choice',
              field: 'viewStory',
              options: [
                { label: 'Yes, show me my story!', value: 'view' },
                { label: 'I want to make changes first', value: 'edit' },
              ],
            },
          ]);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';

          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              content: `I'm sorry, there was an error generating your story: ${errorMessage}. Would you like to try again?`,
              inputType: 'choice',
              field: 'retry',
              options: [
                { label: 'Try again', value: 'generate' },
                { label: 'Review my choices', value: 'review' },
              ],
            },
          ]);

          if (onError) {
            onError(`Error generating story: ${errorMessage}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in final action:', error);
      if (onError) {
        onError(
          'An error occurred while processing your request. Please try again.'
        );
      }
    }
  };

  const handleViewStory = (action: string | string[]) => {
    if (Array.isArray(action)) {
      action = action[0]; // Take the first value if it's an array
    }
    if (action === 'view') {
      setShowPreview(true);
    } else {
      // Go back to review
      setMessages((prev) => [
        ...prev,
        {
          type: 'user',
          content: 'I want to make changes first',
        },
        {
          type: 'system',
          content:
            "No problem! Here's a summary of your story elements. You can edit any of them before we generate your story.",
          inputType: 'review',
        },
      ]);
    }
  };

  const handleEditField = (field: StoryField, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.') as [
        StoryDataKey,
        MainCharacterKey
      ];
      setStoryData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof StoryData],
          [child]: value,
        },
      }));
    } else {
      setStoryData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Add message about edit
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: `I've updated the ${
          field.includes('.') ? field.split('.')[1] : field
        } to: ${value}`,
      },
      {
        type: 'system',
        content:
          "Great! I've updated that for you. Would you like to make any other changes or generate your story?",
        inputType: 'choice',
        field: 'action',
        options: [
          { label: 'Make more changes', value: 'review' },
          { label: 'Generate my story!', value: 'generate' },
        ],
      },
    ]);
  };

  const handleSaveStory = async () => {
    try {
      // Save the story to the database
      await createStory({
        ...storyData,
        content: generatedStory,
      });

      // Show success message
      alert('Story saved successfully!');
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Failed to save story. Please try again.');
    }
  };

  const renderInputComponent = (message: Message) => {
    switch (message.inputType) {
      case 'text':
        return (
          <UserInput
            onSubmit={(value) =>
              handleUserInput(value, message.field as StoryField)
            }
            placeholder={getPlaceholder(message.field as StoryField)}
            key={message.field}
          />
        );
      case 'choice':
        return (
          <MultipleChoice
            options={message.options || []}
            onSelect={(value) =>
              handleChoiceSelection(value, message.field as StoryField)
            }
          />
        );
      case 'multiselect':
        return (
          <MultipleChoice
            options={message.options || []}
            onSelect={(value) =>
              handleUserInput(value, message.field as StoryField)
            }
            multiSelect
          />
        );
      case 'character':
        return (
          <CharacterCreator
            onSubmit={(character) =>
              handleUserInput(character, message.field as StoryField)
            }
          />
        );
      case 'review':
        return (
          <div className="rounded-xl shadow-md p-6 my-4 bg-card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Story Elements
            </h3>
            <div className="space-y-4">
              {renderReviewField('Title', storyData.title, handleTitleEdit)}
              {renderCharacterReview()}
              {renderReviewField(
                'Setting',
                storyData.setting,
                handleSettingEdit
              )}
              {renderReviewField('Theme', storyData.theme, handleThemeEdit)}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'bg-primary hover:bg-primary/90'
                )}
                onClick={() => handleFinalAction('generate')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Story
              </Button>
            </div>
          </div>
        );
      case 'generating':
        return (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
            </div>
            <p className="mt-4 text-muted-foreground">
              Creating your magical story...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <WizardContainer>
      <WizardHeader>
        <h2 className="text-xl font-semibold text-foreground">
          Create Your Story
        </h2>
        <WizardProgress
          progress={Math.min(
            ((currentStep + 1) / (storySteps.length + 1)) * 100,
            100
          )}
        />
      </WizardHeader>

      <WizardContent>
        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div {...fadeInOut}>
              <StoryPreview
                story={generatedStory}
                storyData={storyData}
                onBack={() => setShowPreview(false)}
                onSave={handleSaveStory}
              />
            </motion.div>
          ) : (
            <MessageList>
              {messages.map((message, index) =>
                message.type === 'system' ? (
                  <SystemMessage key={index}>
                    {message.content}
                    {renderInputComponent(message)}
                  </SystemMessage>
                ) : (
                  <UserMessage key={index}>{message.content}</UserMessage>
                )
              )}
              {isTyping && (
                <SystemMessage>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </SystemMessage>
              )}
              <div ref={messagesEndRef} />
            </MessageList>
          )}
        </AnimatePresence>
      </WizardContent>

      {!showPreview && currentStep >= 0 && (
        <WizardFooter>
          <Button
            variant="outline"
            onClick={handleBackStep}
            disabled={currentStep <= 0 || isTyping}
          >
            Back
          </Button>
          <Button
            variant="default"
            onClick={() => handleFinalAction('generate')}
            disabled={isTyping || !validateStoryData().length}
          >
            Generate Story
          </Button>
        </WizardFooter>
      )}
    </WizardContainer>
  );
}
