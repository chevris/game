/**
 * Static character definitions for the 3 playable characters on the home screen.
 * Each entry corresponds to a famous woman in history.
 * Portrait images are placeholder SVGs — replace imageSrc to swap in real portraits.
 */
export const characters = [
  {
    id: 0,
    name: 'Marie Curie',
    bio: 'Marie Curie (1867–1934) war eine polnisch-französische Physikerin und Chemikerin. Sie war die erste Frau, die einen Nobelpreis erhielt, und die einzige Person, die Nobelpreise in zwei verschiedenen Wissenschaften gewann: Physik (1903) und Chemie (1911). Ihr Werk legte den Grundstein für die moderne Atomphysik.',
    imageSrc: '/images/marie-curie.svg',
    playerColor: '#e63946',
  },
  {
    id: 1,
    name: 'Rosa Parks',
    bio: 'Rosa Parks (1913–2005) war eine US-amerikanische Bürgerrechtlerin. Ihr mutiger Protest gegen die Rassentrennung in einem Bus in Montgomery, Alabama im Jahr 1955 löste den Montgomery Bus Boycott aus und wurde zu einem Symbol der amerikanischen Bürgerrechtsbewegung. Sie gilt als „Mutter der Freiheitsbewegung".',
    imageSrc: '/images/rosa-parks.svg',
    playerColor: '#2a9d8f',
  },
  {
    id: 2,
    name: 'Malala Yousafzai',
    bio: 'Malala Yousafzai (* 1997) ist eine pakistanische Bildungsaktivistin. Sie überlebte 2012 ein Attentat der Taliban und kämpft seitdem weltweit für das Recht von Mädchen auf Bildung. Im Jahr 2014 erhielt sie als jüngste Person aller Zeiten den Nobelpreis für den Frieden.',
    imageSrc: '/images/malala-yousafzai.svg',
    playerColor: '#e9c46a',
  },
];
