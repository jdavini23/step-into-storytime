export const storySteps = [
  {
    message: "Great! Now, let's create the main character. What's your character's name?",
    inputType: "text",
    field: "mainCharacter.name",
  },
  {
    message: "How old is your character?",
    inputType: "text",
    field: "mainCharacter.age",
  },
  {
    message: "What are some traits that describe your character? Select all that apply.",
    inputType: "multiselect",
    field: "traits",
    options: [
      { label: "Brave", value: "brave" },
      { label: "Curious", value: "curious" },
      { label: "Kind", value: "kind" },
      { label: "Clever", value: "clever" },
      { label: "Adventurous", value: "adventurous" },
      { label: "Shy", value: "shy" },
      { label: "Funny", value: "funny" },
      { label: "Creative", value: "creative" },
    ],
  },
  {
    message: "Where does your story take place? Choose a setting.",
    inputType: "choice",
    field: "setting",
    options: [
      { label: "Enchanted Forest", value: "an enchanted forest" },
      { label: "Magical Kingdom", value: "a magical kingdom" },
      { label: "Outer Space", value: "outer space" },
      { label: "Underwater World", value: "an underwater world" },
      { label: "Cozy Village", value: "a cozy village" },
      { label: "Mysterious Island", value: "a mysterious island" },
    ],
  },
  {
    message: "What theme would you like for your story?",
    inputType: "choice",
    field: "theme",
    options: [
      { label: "Friendship", value: "friendship" },
      { label: "Courage", value: "courage" },
      { label: "Discovery", value: "discovery" },
      { label: "Kindness", value: "kindness" },
      { label: "Imagination", value: "imagination" },
      { label: "Teamwork", value: "teamwork" },
    ],
  },
  {
    message: "What elements would you like to include in your story? Select all that apply.",
    inputType: "multiselect",
    field: "plotElements",
    options: [
      { label: "Magic Spell", value: "magic spell" },
      { label: "Hidden Treasure", value: "hidden treasure" },
      { label: "Talking Animals", value: "talking animals" },
      { label: "Secret Door", value: "secret door" },
      { label: "Special Power", value: "special power" },
      { label: "New Friend", value: "new friend" },
      { label: "Mysterious Stranger", value: "mysterious stranger" },
    ],
  },
]

