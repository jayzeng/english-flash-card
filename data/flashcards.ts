import flashcardsData from './flashcards.json';

export interface FlashCard {
  word: string;
  image: string;
}

let FLASHCARDS: FlashCard[];

try {
  FLASHCARDS = flashcardsData as FlashCard[];
  console.log('Flashcards loaded successfully:', FLASHCARDS.length);
} catch (error) {
  console.error('Error loading flashcards:', error);
  FLASHCARDS = [];
}

export { FLASHCARDS };

