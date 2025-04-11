import { UIStory } from '@/lib/types';

export const demoStory: UIStory = {
  id: 'demo-story',
  user_id: 'demo-user',
  title: "Lucy's Magical Garden Adventure",
  content: {
    en: [
      "Once upon a time, there was a curious little girl named Lucy who loved to explore her grandmother's garden.",
      "One sunny morning, she discovered a tiny door at the base of an old oak tree. 'I wonder what's behind it?' she thought.",
      'When she opened the door, she found herself in a magical garden where flowers could talk and butterflies wore tiny crowns.',
      'Lucy spent the whole day making new friends with the garden creatures and learning their secrets.',
      'As the sun began to set, Lucy knew it was time to go home. But she promised her new friends she would visit again soon.',
      "From that day on, Lucy's grandmother's garden became her favorite place, full of magic and wonder.",
    ],
    es: [
      'Había una vez una niña curiosa llamada Lucy que amaba explorar el jardín de su abuela.',
      "Una mañana soleada, descubrió una pequeña puerta en la base de un viejo roble. '¿Qué habrá detrás?' pensó.",
      'Cuando abrió la puerta, se encontró en un jardín mágico donde las flores podían hablar y las mariposas llevaban pequeñas coronas.',
      'Lucy pasó todo el día haciendo nuevos amigos con las criaturas del jardín y aprendiendo sus secretos.',
      'Cuando el sol comenzó a ponerse, Lucy supo que era hora de volver a casa. Pero prometió a sus nuevos amigos que volvería pronto.',
      'Desde ese día, el jardín de la abuela de Lucy se convirtió en su lugar favorito, lleno de magia y asombro.',
    ],
  },
  character: {
    name: 'Lucy',
    age: 7,
    traits: ['curious', 'friendly', 'adventurous'],
  },
  setting: "grandmother's garden",
  theme: 'magic and friendship',
  plot_elements: ['magical creatures', 'hidden door', 'talking flowers'],
  is_published: true,
  thumbnail_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  length: 'short',
};
