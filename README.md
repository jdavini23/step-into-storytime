# Step Into Storytime

An AI-powered storytelling platform where kids and parents can create personalized bedtime stories in seconds. Transform bedtime into a magical, personalized experience for children aged 3-8 and their families.

## 🌟 Features

- **AI-Powered Story Generation**: Create unique, personalized stories instantly
- **Customization Options**:
  - Character customization (name, traits, preferences)
  - Various settings (forest, space, etc.)
  - Multiple themes (adventure, friendship, etc.)
  - Adjustable story length (5-15 minutes)
- **Reading Modes**:
  - Text output for reading aloud
  - AI narration with synthetic voice
- **Story Management**:
  - Save favorites to your Story Vault
  - Multiple child profiles
  - Easy story organization
- **Subscription Tiers**:
  - Free: 3 stories/week with basic options
  - Premium: Unlimited stories, advanced customization, narration

## 🚀 Tech Stack

- **Frontend**: React.js with TailwindCSS
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI API
- **Text-to-Speech**: Google Text-to-Speech API
- **Database**: PostgreSQL (via Supabase)

## 🛠️ Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account
- OpenAI API key
- Google Cloud account (for Text-to-Speech)

## 📦 Installation

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

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your API keys and configuration

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📁 Project Structure

```
step-into-storytime/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── pages/             # App pages
├── public/                 # Static assets
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```

## 🔑 Environment Variables

Required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@stepintostorytime.com or join our Slack community.
