'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ChatMessage from '@/components/story-wizard/chat-message';
import UserInput from '@/components/story-wizard/user-input';
import MultipleChoice from '@/components/story-wizard/multiple-choice';
import CharacterCreator from '@/components/story-wizard/character-creator';
import { storySteps } from '@/lib/story-wizard-steps';
import { useStory } from '@/contexts/story-context';
import StoryPreview from '@/components/story-wizard/story-preview';

interface StoryWizardProps {
  onError?: (message: string) => void;
}

interface StoryData {
  title: string;
  mainCharacter={
    name: string;
    age: string;
    traits: string[];
    appearance: string;
  };
  setting: string;
  theme: string;
  plotElements: string[];
  additionalCharacters: string[];
  [key: string]: any;
}

interface Message {
  type: string;
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
    mainCharacter={
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
  const router = useRouter();

  // Add initial message when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          type: 'system',
          content:
            "Welcome to the Story Wizard! Let's create your story step by step.",
          inputType: 'text',
          field: 'title',
        },
      ]);
      setIsTyping(false);
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
  const validateStoryData = () => {
    const errors: string[] = [];

    if (!storyData.title.trim()) {
      errors.push('Please provide a title for your story');
    }
    if (!storyData.mainCharacter.name.trim()) {
      errors.push('Please provide a name for the main character');
    }
    if (!storyData.mainCharacter.age.trim()) {
      errors.push('Please provide an age for the main character');
    }
    if (!storyData.setting.trim()) {
      errors.push('Please select a setting for your story');
    }
    if (!storyData.theme.trim()) {
      errors.push('Please select a theme for your story');
    }
    return errors;
  };

  const handleUserInput = async (value: string, field: string) => {
    try {
      // Update story data
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setStoryData((prev: StoryData) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      } else if (field) {
        setStoryData((prev: StoryData) => ({
          ...prev,
          [field]: Array.isArray(value) ? value : [value],
        }));
      } else {
        setStoryData((prev: StoryData) => ({
          ...prev,
          [field]: value,
        }));
      }

      // Add user message
      const userMessage: Message = {
        type: 'user',
        content: value,
        inputType: field,
        field,
      };
      setMessages((prev: Message[]) => [...prev, userMessage]);

      // Show typing indicator
      setIsTyping(true);

      // Get next step
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Add system message after delay
      setTimeout(() => {
        if (nextStep < storySteps.length) {
          const step = storySteps[nextStep];
          setMessages((prev: Message[]) => [
            ...prev,
            {
              type: 'system',
              content: step.prompt,
              inputType: step.inputType,
              field: step.field,
              options: step.options,
            },
          ]);
          setIsTyping(false);
        } else {
          // Final step - generate story
          setMessages((prev: Message[]) => [
            ...prev,
            {
              type: 'system',
              content: 'Great! Ready to generate your story?',
              inputType: 'text',
              field: 'title',
            },
          ]);
          setIsTyping(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error handling user input');
      if (onError) {
        onError(
          'An error occurred while processing your input. Please try again.'
        );
      }
    }
  };

  const handleFinalAction = async (action: string) => {
    try {
      if (action === 'generate') {
        // Show review screen
        setMessages((prev: Message[]) => [
          ...prev,
          {
            type: 'system',
            content: 'Generating your story...',
          },
        ]);

        // Validate story data before generation
        const validationErrors = validateStoryData();

        if (validationErrors.length > 0) {
          setMessages((prev: Message[]) => [
            ...prev,
            {
              type: 'system',
              content: validationErrors.join('\n'),
            },
            {
              type: 'system',
              content:
                'Please correct the above errors before generating the story.',
              inputType: 'text',
              field: 'title',
            },
          ]);
          return;
        }

        // Generate story
        setMessages((prev: Message[]) => [
          ...prev,
          {
            type: 'system',
            content: 'Generating your story...',
          },
        ]);

        try {
          // Use the API to generate the story
          const storyContent = await generateStoryContent(storyData);
          setGeneratedStory(storyContent);

          setMessages((prev: Message[]) => [
            ...prev,
            {
              type: 'system',
              content: storyContent,
              inputType: 'text',
              field: 'title',
            },
          ]);

          // Save the story to the database
          const savedStory = await createStory({
            ...storyData,
            content: storyContent,
          });

          // Show success message
          alert('Story saved successfully!');

          // Navigate to the story page
          (router as AppRouterInstance).push(`/story/${savedStory.id}`);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An error occurred while generating the story.';

          setMessages((prev: Message[]) => [
            ...prev,
            {
              type: 'system',
              content: errorMessage,
              inputType: 'text',
              field: 'title',
            },
          ]);

          if (onError) {
            onError(errorMessage);
          }
        }
      } else {
        // Show review screen
        setMessages((prev: Message[]) => [
          ...prev,
          {
            type: 'system',
            content: 'Generating your story...',
          },
        ]);
      }
    } catch (error) {
      console.error('Error in final action');
      if (onError) {
        onError(
          'An error occurred while processing your request. Please try again.'
        );
      }
    }
  };

  const handleViewStory = (action: string) => {
    if (action === 'generate') {
      setShowPreview(true);
    } else {
      // Go back to review
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: 'Generating your story...',
        },
      ]);
    }
  };

  const handleEditField = (value: string, field: string) => {
    // Update story data
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setStoryData((prev: StoryData) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setStoryData((prev: StoryData) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Add message about edit
    setMessages((prev: Message[]) => [
      ...prev,
      {
        type: 'system',
        content: `Edited ${field}: ${value}`,
        inputType: field,
        field: field,
        options: [{ label: 'Edit', value: value }],
      },
    ]);
  };

  const handleSaveStory = async () => {
    try {
      // Save the story to the database
      const savedStory = await createStory({
        ...storyData,
        content: generatedStory,
      });

      // Show success message
      alert('Story saved successfully!');

      // Navigate to the story page
      (router as AppRouterInstance).push(`/story/${savedStory.id}`);
    } catch (error) {
      console.error('Error saving story');
      alert('Failed to save story. Please try again.');
    }
  };

  const renderInputComponent = (message: Message): ReactElement | null => {
    switch (message.inputType) {
      case 'text':
        return (
          <UserInput
            onSubmit={(value: string) =>
              handleUserInput(value, message.field || '')
            }
            placeholder={`Type your ${message.field || ''}...`}
          />
        );
      case 'choice':
        return (
          <MultipleChoice
            options={message.options || []}
            onSelect={(value: string) =>
              handleUserInput(value, message.field || '')
            }
          />
        );
      case 'multiselect':
        return (
          <MultipleChoice
            options={message.options || []}
            onSelect={(value: string) =>
              handleUserInput(value, message.field || '')
            }
            multiSelect
          />
        );
      case 'character':
        return (
          <CharacterCreator
            onSubmit={(value: string) =>
              handleUserInput(value, 'mainCharacter.name')
            }
          />
        );
      case 'review':
        return (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Story Preview</h3>
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.title}
                      icon={<Edit className="h-6 w-6" />}
                    />
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="character"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.mainCharacter.name}
                      icon={<Edit className="h-6 w-6" />}
                    />
                    <UserInput
                      placeholder="Enter character name..."
                      onSubmit={(value) =>
                        handleEditField(value, 'mainCharacter.name')
                      }
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="setting"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.setting}
                      icon={<Edit className="h-6 w-6" />}
                    />
                    <UserInput
                      placeholder="Enter setting..."
                      onSubmit={(value) => handleEditField(value, 'setting')}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="theme"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.theme}
                      icon={<Edit className="h-6 w-6" />}
                    />
                    <UserInput
                      placeholder="Enter theme..."
                      onSubmit={(value) => handleEditField(value, 'theme')}
                    />
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message="Great! Ready to generate your story?"
                      icon={<Sparkles className="h-6 w-6" />}
                    />
                    <div className="mt-4">
                      <Button
                        onClick={() => handleFinalAction('generate')}
                        disabled={isTyping}
                        className="w-full"
                      >
                        {isTyping ? 'Generating...' : 'Generate Story'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      case 'generating':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.title}
                      icon={<Edit className="h-6 w-6" />}
                    />
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="character"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.mainCharacter.name}
                      icon={<Edit className="h-6 w-6" />}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="setting"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.setting}
                      icon={<Edit className="h-6 w-6" />}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="theme"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message={storyData.theme}
                      icon={<Edit className="h-6 w-6" />}
                    />
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ChatMessage
                      message="Generating your story..."
                      icon={<Sparkles className="h-6 w-6" />}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Calculate progress percentage
  const renderContent = () => {
    if (showPreview) {
      return (
        <motion.div
          key="preview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <StoryPreview
            story={generatedStory}
            storyData={storyData}
            onBack={() => setShowPreview(false)}
            onSave={handleSaveStory}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="input"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Story Wizard</h2>
            <Progress value={(currentStep / 4) * 100} className="w-1/2" />
          </div>

          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message.content} />
            ))}
            {isTyping && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-primary"></div>
              </div>
            )}
          </div>

          <div className="mt-4">
            {messages.length > 0 &&
              !isTyping &&
              renderInputComponent(messages[messages.length - 1])}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}
