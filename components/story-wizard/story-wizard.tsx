'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ChatMessage from '@/components/story-wizard/chat-message';
import UserInput from '@/components/story-wizard/user-input';
import MultipleChoice from '@/components/story-wizard/multiple-choice';
import { storySteps } from '@/lib/story-wizard-steps';
import { useStory } from '@/contexts/story-context';
import CharacterCreator from '@/components/story-wizard/character-creator';
import StoryPreview from '@/components/story-wizard/story-preview';

// Define types for props and state
interface StoryWizardProps {
  onError?: (message: string) => void;
}

interface StoryData {
  title: string;
  mainCharacter: {
    name: string;
    age: string;
    traits: string[];
    appearance: string;
  };
  setting: string;
  theme: string;
  plotElements: string[];
  additionalCharacters: any[];
  [key: string]: any;
}

interface Message {
  type: 'system' | 'user';
  content: string;
  inputType?: string;
  field?: string;
  options?: Array<{ label: string; value: string }>;
}

export default function StoryWizard({ onError }: StoryWizardProps) {
  const { generateStoryContent, createStory } = useStory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [storyData, setStoryData] = useState<StoryData>({
    title: '',
    mainCharacter: {
      name: '',
      age: '',
      traits: [],
      appearance: '',
    },
    setting: '',
    theme: '',
    plotElements: [],
    additionalCharacters: [],
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleUserInput = (value: string | string[] | any, field: string) => {
    try {
      // Update story data
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setStoryData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
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
    } catch (error) {
      console.error('Error handling user input:', error);
      if (onError) {
        onError(
          'An error occurred while processing your input. Please try again.'
        );
      }
    }
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
          const storyContent = await generateStoryContent(storyData);
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

  const handleEditField = (field: string, value: any) => {
    // Update story data
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setStoryData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setStoryData((prev: any) => ({
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

  const renderInputComponent = (message: any) => {
    switch (message.inputType) {
      case 'text':
        return (
          <UserInput
            onSubmit={(value) => handleUserInput(value, message.field)}
            placeholder={
              message.field === 'mainCharacter.name'
                ? "Type your character's name..."
                : message.field === 'mainCharacter.age'
                ? "Type your character's age..."
                : message.field === 'title'
                ? 'Type your story title...'
                : `Type your ${message.field.split('.').pop()}...`
            }
            key={message.field}
          />
        );
      case 'choice':
        return (
          <MultipleChoice
            options={message.options}
            onSelect={(value) => {
              if (message.field === 'action') {
                handleFinalAction(value);
              } else if (message.field === 'viewStory') {
                handleViewStory(value);
              } else if (message.field === 'retry') {
                handleFinalAction(value);
              } else {
                handleUserInput(value, message.field);
              }
            }}
          />
        );
      case 'multiselect':
        return (
          <MultipleChoice
            options={message.options}
            onSelect={(value) => handleUserInput(value, message.field)}
            multiSelect
          />
        );
      case 'character':
        return (
          <CharacterCreator
            onSubmit={(character) => handleUserInput(character, message.field)}
          />
        );
      case 'review':
        return (
          <div className="bg-white rounded-xl shadow-md p-6 my-4">
            <h3 className="text-lg font-semibold mb-4">Story Elements</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Title</p>
                <div className="flex justify-between items-center">
                  <p className="font-medium">{storyData.title}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-violet-600"
                    onClick={() => {
                      const newTitle = prompt('Edit title:', storyData.title);
                      if (newTitle) handleEditField('title', newTitle);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Main Character</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {storyData.mainCharacter?.name || 'Unnamed Character'}{' '}
                      {storyData.mainCharacter?.age
                        ? `(${storyData.mainCharacter.age})`
                        : ''}
                    </p>
                    <p className="text-sm text-slate-600">
                      Traits:{' '}
                      {storyData.mainCharacter?.traits?.join(', ') || 'None'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-violet-600"
                      onClick={() => {
                        const newName = prompt(
                          'Edit character name:',
                          storyData.mainCharacter?.name || ''
                        );
                        if (newName)
                          handleEditField('mainCharacter.name', newName);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit Name
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-violet-600"
                      onClick={() => {
                        const newAge = prompt(
                          'Edit character age:',
                          storyData.mainCharacter?.age || ''
                        );
                        if (newAge)
                          handleEditField('mainCharacter.age', newAge);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit Age
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Setting</p>
                <div className="flex justify-between items-center">
                  <p className="font-medium">{storyData.setting}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-violet-600"
                    onClick={() => {
                      const newSetting = prompt(
                        'Edit setting:',
                        storyData.setting
                      );
                      if (newSetting) handleEditField('setting', newSetting);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Theme</p>
                <div className="flex justify-between items-center">
                  <p className="font-medium">{storyData.theme}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-violet-600"
                    onClick={() => {
                      const newTheme = prompt('Edit theme:', storyData.theme);
                      if (newTheme) handleEditField('theme', newTheme);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
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
              <div className="absolute inset-0 rounded-full border-4 border-violet-200 opacity-25"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-600" />
            </div>
            <p className="mt-4 text-slate-600">
              Creating your magical story...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Calculate progress percentage
  const progress = Math.max(
    0,
    Math.min(100, Math.round((currentStep / storySteps.length) * 100))
  );

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {showPreview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StoryPreview
              story={generatedStory}
              storyData={{
                id: storyData.id || '',
                title: storyData.title,
                content: generatedStory,
                metadata: {
                  wordCount: generatedStory.split(/\s+/).length,
                  readingTime: Math.ceil(
                    generatedStory.split(/\s+/).length / 200
                  ), // Assuming 200 words per minute
                  targetAge: 8, // Default target age
                  difficulty: 'medium',
                  theme: storyData.theme,
                  setting: storyData.setting,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                accessibility: {
                  contrast: 'normal',
                  motionReduced: false,
                  fontSize: 'medium',
                  lineHeight: 1.5,
                },
              }}
              onBack={() => setShowPreview(false)}
              onSave={handleSaveStory}
            />
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-3">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-slate-900">Story Wizard</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  {progress}% complete
                </span>
                <div className="w-32">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>

            <div className="h-[500px] overflow-y-auto p-4 bg-slate-50">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.content}
                    type={message.type}
                  />
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-slate-500 text-sm">
                    <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-white">
              {messages.length > 0 &&
                !isTyping &&
                renderInputComponent(messages[messages.length - 1])}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
