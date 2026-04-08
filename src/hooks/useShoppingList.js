import { useState, useCallback } from "react";

const STORAGE_KEY = "budgetbites_shopping_list";
const CHECKS_KEY = "budgetbites_checked";

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function useShoppingList() {
  const [items, setItems] = useState(() => loadFromStorage(STORAGE_KEY, []));
  const [checked, setChecked] = useState(() => loadFromStorage(CHECKS_KEY, {}));

  const persist = (newItems, newChecked) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    localStorage.setItem(CHECKS_KEY, JSON.stringify(newChecked));
  };

  const addRecipe = useCallback((recipe) => {
    setItems((prev) => {
      if (prev.some((r) => r.id === recipe.id)) return prev;
      const next = [...prev, recipe];
      persist(next, checked);
      return next;
    });
  }, [checked]);

  const removeRecipe = useCallback((recipeId) => {
    setItems((prev) => {
      const next = prev.filter((r) => r.id !== recipeId);
      const newChecked = { ...checked };
      Object.keys(newChecked).forEach((k) => {
        if (k.startsWith(recipeId + "-")) delete newChecked[k];
      });
      setChecked(newChecked);
      persist(next, newChecked);
      return next;
    });
  }, [checked]);

  const isInList = useCallback(
    (recipeId) => items.some((r) => r.id === recipeId),
    [items]
  );

  const toggleCheck = useCallback((key) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { items, checked, addRecipe, removeRecipe, isInList, toggleCheck };
}
