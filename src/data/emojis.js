/**
 * @file Curated emoji set, grouped by category
 * @module data/emojis
 */
export const emojiCategories = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🙂', '😉', '😊', '😍', '😎', '🤔', '😴', '😭', '😡'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
  food: ['🍎', '🍌', '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🍰', '🍫', '🍭', '🍇', '🍉', '🍓'],
  travel: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚀', '🚁', '⛵', '🚲', '🏍️'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏆', '🎮', '🎸'],
  objects: ['💡', '📱', '💻', '⌚', '📷', '🔑', '💰', '🎁', '📚', '✏️'],
};

export default Object.values(emojiCategories).flat();
