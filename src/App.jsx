import { useState } from "react";
import Welcome from "./components/Welcome";
import Browse from "./components/Browse";
import RecipeDetail from "./components/RecipeDetail";
import ShoppingList from "./components/ShoppingList";
import { useShoppingList } from "./hooks/useShoppingList";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [preferences, setPreferences] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const { items, checked, addRecipe, removeRecipe, isInList, toggleCheck } =
    useShoppingList();

  function handlePreferencesSubmit(prefs) {
    setPreferences(prefs);
    setScreen("browse");
  }

  function handleSelectRecipe(recipe) {
    setSelectedRecipe(recipe);
    setScreen("detail");
  }

  function handleBack() {
    setScreen("browse");
    window.scrollTo(0, 0);
  }

  function navigate(s) {
    setScreen(s);
    window.scrollTo(0, 0);
  }

  const servings = preferences?.servings || 2;

  return (
    <div className="app">
      <header>
        <div className="container header-inner">
          <div className="logo" onClick={() => navigate("welcome")} style={{ cursor: "pointer" }}>
            Budget<span>Bites</span>
          </div>
          <nav>
            <button
              className={screen === "browse" ? "active" : ""}
              onClick={() => navigate("browse")}
            >
              Recipes
            </button>
            <button
              className={screen === "list" ? "active" : ""}
              onClick={() => navigate("list")}
            >
              Ingredients
              {items.length > 0 && (
                <span className="cart-count">{items.length}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {screen === "welcome" && (
          <Welcome onSubmit={handlePreferencesSubmit} />
        )}

        {screen === "browse" && preferences && (
          <Browse
            preferences={preferences}
            onSelectRecipe={handleSelectRecipe}
          />
        )}

        {screen === "detail" && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            servings={servings}
            isInList={isInList(selectedRecipe.id)}
            onAddToList={addRecipe}
            onRemoveFromList={removeRecipe}
            onBack={handleBack}
          />
        )}

        {screen === "list" && (
          <ShoppingList
            items={items}
            checked={checked}
            onToggleCheck={toggleCheck}
            onRemoveRecipe={removeRecipe}
            onBrowse={() => navigate("browse")}
          />
        )}
      </main>

      <footer>
        <div className="container">Budget Bites — Simple meals, smart savings.</div>
      </footer>
      <Analytics />
    </div>
  );
}
