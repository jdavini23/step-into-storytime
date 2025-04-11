# Conversational UI Implementation Plan

## 1. Core Chat Components

### Message System

```typescript
// Types
interface Message {
  id: string;
  type: 'system' | 'user' | 'option';
  content: string | React.ReactNode;
  timestamp: number;
  options?: ChatOption[];
  metadata?: Record<string, any>;
}

interface ChatOption {
  id: string;
  label: string;
  value: any;
  icon?: React.ReactNode;
}
```

### Components to Create

- [ ] ChatMessage

  - System message with avatar
  - User response bubble
  - Option chips/buttons
  - Typing indicators
  - Animations for appear/disappear

- [ ] ChatInput

  - Text input with send button
  - Option selection interface
  - Emoji/reaction support
  - Input validation

- [ ] ChatContainer
  - Message list with scroll
  - Auto-scroll to new messages
  - Message grouping
  - Loading states

## 2. Conversation Flow

### Step 1: Welcome

```typescript
// Example conversation flow
const welcomeFlow = {
  initial: {
    message: 'Hi! Ready to create a magical bedtime story together?',
    options: [
      { label: "Let's Create!", value: 'create' },
      { label: 'Surprise Me', value: 'surprise' },
    ],
  },
};
```

### Step 2: Character Creation

```typescript
const characterFlow = {
  name: {
    message: "Who's the hero of our story?",
    input: 'text',
    validation: (name) => name.length > 0,
  },
  traits: {
    message: 'What makes them special? Choose some traits:',
    options: [
      { label: 'Brave', value: 'brave' },
      { label: 'Curious', value: 'curious' },
      // ... more traits
    ],
    multiSelect: true,
  },
};
```

## 3. Implementation Phases

### Phase 1: Base Chat UI

- [ ] Create ChatMessage component

  - Implement message types
  - Add animations
  - Style message bubbles
  - Add avatars/icons

- [ ] Build ChatContainer

  - Message list management
  - Scroll handling
  - Message grouping
  - Viewport management

- [ ] Develop ChatInput
  - Text input handling
  - Option selection
  - Input validation
  - Submit handling

### Phase 2: Conversation Logic

- [ ] Create ConversationManager

  ```typescript
  interface ConversationState {
    messages: Message[];
    currentStep: string;
    context: Record<string, any>;
    inputType: 'text' | 'options' | 'multiSelect';
    pending: boolean;
  }
  ```

- [ ] Implement conversation flows
  - Step progression
  - Context management
  - Input validation
  - Error handling

### Phase 3: UI/UX Enhancement

- [ ] Add animations

  - Message appear/disappear
  - Typing indicators
  - Smooth scrolling
  - Option selection

- [ ] Improve accessibility
  - Keyboard navigation
  - Screen reader support
  - Focus management
  - ARIA labels

### Phase 4: Data Integration

- [ ] Connect to StoryManager
  - Story data updates
  - Progress tracking
  - State persistence
  - Error handling

## 4. Component Updates

### Update StoryWizard.tsx

```typescript
function StoryWizard() {
  return (
    <ConversationProvider>
      <ChatContainer>
        <MessageList />
        <ChatInput />
      </ChatContainer>
    </ConversationProvider>
  );
}
```

### Create ConversationProvider

```typescript
function ConversationProvider({ children }) {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  // Conversation management logic
  const sendMessage = (message: Message) => {
    dispatch({ type: 'SEND_MESSAGE', payload: message });
    processNextStep(message);
  };

  return (
    <ConversationContext.Provider value={{ state, sendMessage }}>
      {children}
    </ConversationContext.Provider>
  );
}
```

## 5. Testing Strategy

### Unit Tests

- [ ] Message components
- [ ] Input handling
- [ ] Option selection
- [ ] Validation logic

### Integration Tests

- [ ] Conversation flow
- [ ] Data management
- [ ] State transitions
- [ ] Error scenarios

### E2E Tests

- [ ] Complete story creation
- [ ] Error recovery
- [ ] Navigation
- [ ] Data persistence

## 6. Migration Plan

1. **Create New Components**

   - Build chat components
   - Test in isolation
   - Document APIs

2. **Parallel Implementation**

   - Keep existing UI functional
   - Build chat UI alongside
   - Test both versions

3. **Gradual Transition**

   - Switch one step at a time
   - Validate each conversion
   - Maintain fallbacks

4. **Complete Switchover**
   - Remove old components
   - Clean up dependencies
   - Update documentation

## 7. Timeline

Week 1:

- Base chat components
- Message system
- Basic styling

Week 2:

- Conversation logic
- State management
- Flow implementation

Week 3:

- UI/UX polish
- Animations
- Accessibility

Week 4:

- Testing
- Bug fixes
- Documentation

## 8. Success Metrics

- [ ] Smooth message animations
- [ ] < 100ms input response time
- [ ] 100% keyboard accessibility
- [ ] Zero UI regressions
- [ ] Improved user engagement
- [ ] Reduced completion time
- [ ] Higher satisfaction scores
