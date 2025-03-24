const fs = require('fs');
const path = require('path');

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('\x1b[33m%s\x1b[0m', '.env.local file already exists. Skipping creation.');
} else {
  // Create a template .env.local file
  const envContent = `# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: OpenAI API key for story generation
OPENAI_API_KEY=your-openai-api-key

# Note: If you don't provide real Supabase credentials, the app will use mock data in development mode
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\x1b[32m%s\x1b[0m', '.env.local file created successfully!');
}

console.log('\x1b[36m%s\x1b[0m', `
=================================================
Step Into Storytime - Development Setup
=================================================

Your development environment is now set up!

If you want to use real Supabase and OpenAI services:
1. Edit the .env.local file with your actual credentials
2. Restart the development server

To start the development server:
  npm run dev
  # or
  yarn dev

The app will run with mock data if no Supabase credentials are provided.

Happy coding!
=================================================
`);