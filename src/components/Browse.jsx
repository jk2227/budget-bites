import { useState, useEffect } from "react";
import { searchRecipes } from "../api/client";
import RecipeCard from "./RecipeCard";

const CUISINE_FILTERS = [
  "All", "Korean", "American", "Mexican", "Italian",
  "Asian", "Mediterranean", "Indian", "Chinese", "Japanese",
];

export default function Browse({ preferences, onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCuisine, setActiveCuisine] = useState(
    preferences.cuisine || ""
  );
  const [sort, setSort] = useState("price");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, [activeCuisine, sort]);

  async function fetchRecipes() {
    setLoading(true);
    try {
      const data = await searchRecipes({
        query: searchQuery,
        cuisine: activeCuisine === "All" ? "" : activeCuisine,
        diet: preferences.diet,
        maxPrice: preferences.maxPrice,
        sort,
        number: 20,
      });
      setRecipes(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchRecipes();
  }

  return (
    <div>
      <div className="browse-header">
        <h2>Budget-Friendly Recipes</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">Search</button>
        </form>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="price">Price: Low to High</option>
          <option value="time">Time: Quick First</option>
          <option value="calories">Calories: Low First</option>
          <option value="popularity">Most Popular</option>
        </select>
      </div>

      <div className="filter-bar">
        {CUISINE_FILTERS.map((c) => (
          <button
            key={c}
            className={`filter-chip ${
              (c === "All" && !activeCuisine) || activeCuisine === c
                ? "active"
                : ""
            }`}
            onClick={() => setActiveCuisine(c === "All" ? "" : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Finding recipes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="no-results">
          <div className="icon">:/</div>
          <p>No recipes found. Try different filters or a broader search.</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              servings={preferences.servings}
              onClick={() => onSelectRecipe(r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
