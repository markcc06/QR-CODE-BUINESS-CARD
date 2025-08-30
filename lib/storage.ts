import { Card } from '@/types/card';

const CARDS_KEY = 'cardspark_cards';
const CURRENT_CARD_KEY = 'cardspark_current_card';

export function saveCard(card: Card): void {
  if (typeof window === 'undefined') return;
  
  const cards = getStoredCards();
  const existingIndex = cards.findIndex(c => c.id === card.id);
  
  if (existingIndex >= 0) {
    cards[existingIndex] = card;
  } else {
    cards.push(card);
  }
  
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function getStoredCards(): Card[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CARDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getCardById(id: string): Card | null {
  const cards = getStoredCards();
  return cards.find(c => c.id === id) || null;
}

export function saveCurrentCard(card: Partial<Card>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_CARD_KEY, JSON.stringify(card));
}

export function getCurrentCard(): Partial<Card> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CURRENT_CARD_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function generateCardId(): string {
  return Math.random().toString(36).substring(2, 15);
}