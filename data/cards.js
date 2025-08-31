// data/cards.js
export const cards = Array.from({ length: 20 }, (_, i) => ({
  id: `card-${i + 1}`,
  index: i,
  front: `What's 2+2`,
  back: `Card ${i + 1} Back`,
}));
