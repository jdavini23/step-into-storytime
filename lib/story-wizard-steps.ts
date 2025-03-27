export const storySteps = [
  {
    message:
      "✨ Let's begin our magical adventure! First, tell me the name of our story's hero - who will be starring in this tale?",
    inputType: 'text',
    field: 'mainCharacter.name',
  },
  {
    message: '🎂 And how many birthdays has our hero celebrated?',
    inputType: 'text',
    field: 'mainCharacter.age',
  },
  {
    message:
      '🌟 What makes our hero special? Pick the magical qualities that make them shine! (Choose as many as you like)',
    inputType: 'multiselect',
    field: 'mainCharacter.traits',
    options: [
      { label: '🦁 Brave as a Lion', value: 'brave' },
      { label: '🔍 Curious as a Cat', value: 'curious' },
      { label: '💝 Kind as an Angel', value: 'kind' },
      { label: '🦊 Clever as a Fox', value: 'clever' },
      { label: '🌈 Adventurous as a Dragon', value: 'adventurous' },
      { label: '🦋 Gentle as a Butterfly', value: 'shy' },
      { label: '😄 Funny as a Monkey', value: 'funny' },
      { label: '🎨 Creative as a Wizard', value: 'creative' },
    ],
  },
  {
    message:
      "🗺️ Now, let's pick a magical place where our story will unfold! Where shall we go?",
    inputType: 'choice',
    field: 'setting',
    options: [
      {
        label: '🌳 The Whispering Enchanted Forest',
        value: 'an enchanted forest',
      },
      { label: '👑 The Sparkling Magical Kingdom', value: 'a magical kingdom' },
      { label: '🚀 The Twinkling Galaxy of Wonder', value: 'outer space' },
      {
        label: "🐠 The Mysterious Mermaid's Kingdom",
        value: 'an underwater world',
      },
      { label: '🏡 The Charming Storybook Village', value: 'a cozy village' },
      { label: '🏝️ The Secret Rainbow Island', value: 'a mysterious island' },
    ],
  },
  {
    message:
      '💫 Every great story has a special message! Which magical theme speaks to your heart?',
    inputType: 'choice',
    field: 'theme',
    options: [
      { label: '🤝 The Magic of Friendship', value: 'friendship' },
      { label: '⚔️ The Power of Courage', value: 'courage' },
      { label: '🔮 The Joy of Discovery', value: 'discovery' },
      { label: '💖 The Wonder of Kindness', value: 'kindness' },
      { label: '✨ The Spark of Imagination', value: 'imagination' },
      { label: '🤗 The Spirit of Teamwork', value: 'teamwork' },
    ],
  },
  {
    message:
      '🎭 Time to add some extra magic! What special ingredients should we sprinkle into our story? (Pick as many as you like)',
    inputType: 'multiselect',
    field: 'plotElements',
    options: [
      { label: '✨ A Sparkling Magic Spell', value: 'magic spell' },
      { label: '💎 A Glowing Hidden Treasure', value: 'hidden treasure' },
      { label: '🦊 Wise Talking Animals', value: 'talking animals' },
      { label: '🚪 A Mysterious Secret Door', value: 'secret door' },
      { label: '⭐ An Amazing Special Power', value: 'special power' },
      { label: '🤝 A Wonderful New Friend', value: 'new friend' },
      {
        label: '🎭 An Intriguing Mystery Friend',
        value: 'mysterious stranger',
      },
    ],
  },
];
