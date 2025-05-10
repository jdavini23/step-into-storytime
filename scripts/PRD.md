# Step Into Storytime - Product Requirements Document

## 1. Elevator Pitch

Step Into Storytime is an AI-powered platform that transforms bedtime into a magical, personalized experience for children aged 3-8 and their families. Parents, caregivers, and educators can instantly create unique stories by choosing characters, settings, and themes, with AI generating engaging narratives in seconds. Offering text or narrated output and a "story vault" to save favorites, it solves the struggle of finding fresh, tailored bedtime stories—making every night a creative, screen-free bonding adventure.

## 2. Who is this app for

### Primary Users:

- Parents of children aged 3-8 seeking fun, customized bedtime stories
- Caregivers and grandparents wanting to bond through storytelling
- Educators and librarians looking for interactive, educational storytelling tools

### Personas:

- Sarah (Parent, 34): Needs quick, personalized stories for her 5-year-old, accessible on her phone
- Mr. Thomas (Teacher, 42): Wants stories to teach preschoolers values like kindness
- Grandma Susan (60): Reads to grandkids remotely and wants narrated or downloadable tales

## 3. Functional Requirements

- Story Customization: Users pick character (name, gender, traits), setting (e.g., forest, space), theme (e.g., adventure, friendship), and length (5-15 min)
- AI-Generated Stories: AI crafts unique narratives with dynamic plots and optional moral lessons
- Reading Modes: Text output for reading aloud or AI narration with synthetic voice
- Story Vault: Save and revisit past stories in a user profile
- Authentication: Sign up/login via Supabase (email, Google, Apple); supports multiple child profiles
- Subscription Model: Free tier (3 stories/week, basic options); Premium ($5-10/month) with unlimited stories, advanced customization, narration, and future illustrations

## 4. User Stories

- As Sarah (Parent), I want to input my child's name and favorite animal, so the story feels personal and exciting as I read it aloud at bedtime
- As Mr. Thomas (Teacher), I want to select a friendship theme and short length, so I can generate a 5-minute story to teach my preschoolers a lesson
- As Grandma Susan (Grandparent), I want to hear an AI-narrated story, so I can play it over a video call and save it for my next visit
- As a new user, I want a simple onboarding flow, so I can sign up, create a child profile, and try a starter story in minutes

## 5. User Interface

Platform: Web-first (mobile-responsive, tablet-friendly), with future mobile app potential
Visual Style: Kid-friendly yet modern—colorful pastels, soft edges, and a dark mode for bedtime

### Design Elements:

- Step-by-step story creation wizard with animated character previews
- Clean dashboard for saved stories and child profiles
- Audio controls for narration playback

### UX Flow:

Sign up → Add child profile → Customize story → Generate → Read/Listen/Save

## Technical Stack:

### Frontend:

- JavaScript with React (via Create React App or Vite)
- TailwindCSS for styling
- Component-based architecture

### Backend:

- Supabase for database, auth, and API
- Node.js (via Supabase Edge Functions) for custom logic
- OpenAI API for story generation
- Google Text-to-Speech API for narration

### Database Design:

- Users Table (auth and subscription info)
- Child_Profiles Table (user preferences)
- Stories Table (generated content and metadata)
- Subscription_Plans Table (tier features and pricing)
