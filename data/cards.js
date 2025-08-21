// data/cards.js
export const cards = Array.from({ length: 20 }, (_, i) => ({
  id: `card-${i + 1}`,
  index: i,
  front: `Card ${i + 1} Front`,
  back: `Card ${i + 1} Back`,
}));
