export interface Flashcard {
  id: string;
  front: string;
  back: string;
  isMastered?: boolean;
}

export interface Deck {
  name: string;
  cards: Flashcard[];
}
