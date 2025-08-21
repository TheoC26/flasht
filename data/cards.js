// data/cards.js
export const cards = Array.from({ length: 10 }, (_, i) => ({
  id: `card-${i + 1}`,
  front: `Card ${i + 1} Front`,
  back: `Card ${i + 1} Back`,
}));
