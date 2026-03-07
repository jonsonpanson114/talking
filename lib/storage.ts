import { UserProgress } from "@/lib/types";

const STORAGE_KEY = "talking-user-progress";

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

export function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load progress:", error);
  }
  return {
    answeredQuestions: {},
    favorites: [],
    lastViewed: {},
  };
}

export function saveAnswer(questionId: string, answer: string): void {
  const progress = loadProgress();
  progress.answeredQuestions[questionId] = answer;
  saveProgress(progress);
}

export function loadAnswer(questionId: string): string | undefined {
  const progress = loadProgress();
  return progress.answeredQuestions[questionId];
}

export function toggleFavorite(questionId: string): void {
  const progress = loadProgress();
  const index = progress.favorites.indexOf(questionId);
  if (index === -1) {
    progress.favorites.push(questionId);
  } else {
    progress.favorites.splice(index, 1);
  }
  saveProgress(progress);
}

export function isFavorite(questionId: string): boolean {
  const progress = loadProgress();
  return progress.favorites.includes(questionId);
}

export function saveLastViewed(category: string): void {
  const progress = loadProgress();
  progress.lastViewed[category] = new Date();
  saveProgress(progress);
}

export function loadLastViewed(category: string): Date | undefined {
  const progress = loadProgress();
  return progress.lastViewed[category];
}
