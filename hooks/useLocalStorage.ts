import { useState, useEffect } from "react";
import { loadProgress, saveAnswer, toggleFavorite, isFavorite, saveLastViewed } from "@/lib/storage";
import { UserProgress } from "@/lib/types";

export function useLocalStorage() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress());

  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(loadProgress());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    progress,
    saveAnswer,
    toggleFavorite,
    isFavorite,
    saveLastViewed,
  };
}
