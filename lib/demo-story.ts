import { StoryData } from '@/components/story/common/types';

export const demoStory: StoryData = {
  id: 'demo-story',
  title: 'The Magic of Reading',
  description: 'A delightful tale about the joy of reading and imagination',
  content: {
    en: [
      'Once upon a time, in a cozy little room filled with books, there was a young child who discovered the magic of reading.',
      'With each turn of the page, new worlds unfolded before their eyes. Dragons soared through crystal-clear skies, and brave adventurers embarked on incredible journeys.',
      'The more they read, the more they realized that within the pages of every book lay endless possibilities and wonderful discoveries waiting to be made.',
    ],
    es: [
      'Había una vez, en una acogedora habitación llena de libros, un niño que descubrió la magia de la lectura.',
      'Con cada vuelta de página, nuevos mundos se desplegaban ante sus ojos. Dragones surcaban cielos cristalinos y valientes aventureros emprendían viajes increíbles.',
      'Cuanto más leía, más se daba cuenta de que dentro de las páginas de cada libro había infinitas posibilidades y maravillosos descubrimientos esperando ser realizados.',
    ],
  },
  mainCharacter: {
    name: 'Alex',
    age: '7',
    traits: ['curious', 'imaginative'],
    appearance: 'A bright-eyed child with a warm smile',
  },
  setting: 'A cozy reading room',
  theme: 'adventure',
  plotElements: ['discovery', 'imagination', 'books'],
  targetAge: 6,
  readingLevel: 'beginner',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    targetAge: 6,
    difficulty: 'easy',
    theme: 'adventure',
    setting: 'reading room',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 150,
    readingTime: 5,
  },
  accessibility: {
    contrast: 'normal',
    motionReduced: false,
    fontSize: 'medium',
    lineHeight: 1.5,
  },
};
