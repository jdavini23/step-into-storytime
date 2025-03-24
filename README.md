# Step Into Storytime

An AI-powered storytelling platform where kids and parents can create personalized bedtime stories in seconds.

## Features

- Create personalized stories with AI
- Choose from various themes and settings
- Customize characters to match your child
- Save and manage your stories
- Subscription tiers with different features

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/step-into-storytime.git
   cd step-into-storytime
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Optional: OpenAI API key for story generation
   OPENAI_API_KEY=your-openai-api-key
   ```

   Note: If you don't have Supabase credentials, the app will run in development mode with mock data.

