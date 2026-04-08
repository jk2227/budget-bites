import { useState } from "react";

const DIETS = [
  { val: "", label: "No Preference" },
  { val: "vegetarian", label: "Vegetarian" },
  { val: "vegan", label: "Vegan" },
  { val: "gluten-free", label: "Gluten-Free" },
  { val: "dairy-free", label: "Dairy-Free" },
];

const CUISINES = [
  { val: "korean", label: "Korean" },
  { val: "american", label: "American" },
  { val: "mexican", label: "Mexican" },
  { val: "italian", label: "Italian" },
  { val: "asian", label: "Asian" },
  { val: "mediterranean", label: "Mediterranean" },
  { val: "indian", label: "Indian" },
  { val: "chinese", label: "Chinese" },
  { val: "japanese", label: "Japanese" },
];

export default function Welcome({ onSubmit }) {
  const [mode, setMode] = useState(null); // "search" | "cuisine"
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [budget, setBudget] = useState(3);
  const [servings, setServings] = useState(2);

  const budgetLabels = ["Under $5", "$5–$10", "$10–$15", "$15–$20", "$20–$25"];
  const budgetValues = [5, 10, 15, 20, 25];

  function handleSubmit() {
    onSubmit({
      query: mode === "search" ? query : "",
      diet,
      cuisine: mode === "cuisine" ? cuisine : "",
      maxPrice: budgetValues[budget - 1],
      servings,
    });
  }

  function selectMode(m) {
    setMode(m);
    if (m === "search") {
      setCuisine("");
    } else {
      setQuery("");
    }
  }

  const canSubmit =
    (mode === "search" && query.trim().length > 0) ||
    (mode === "cuisine" && cuisine !== "");

  return (
    <div className="welcome">
      <h1>Eat Well, Spend Less</h1>
      <p className="tagline">Delicious meals on a budget.</p>
      <p>How would you like to find recipes?</p>

      <div className="mode-picker">
        <button
          className={`mode-btn ${mode === "search" ? "active" : ""}`}
          onClick={() => selectMode("search")}
        >
          <span className="mode-icon">&#128269;</span>
          <span className="mode-label">Search for a dish</span>
          <span className="mode-desc">Have something specific in mind</span>
        </button>
        <button
          className={`mode-btn ${mode === "cuisine" ? "active" : ""}`}
          onClick={() => selectMode("cuisine")}
        >
          <span className="mode-icon">&#127860;</span>
          <span className="mode-label">Browse by cuisine</span>
          <span className="mode-desc">Explore a type of cooking</span>
        </button>
      </div>

      {mode === "search" && (
        <div className="pref-section">
          <h3>What are you looking for?</h3>
          <input
            type="text"
            className="welcome-search"
            placeholder='Try "chicken stir fry", "pasta", "cheap lunch"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
            autoFocus
          />
        </div>
      )}

      {mode === "cuisine" && (
        <div className="pref-section">
          <h3>Pick a cuisine</h3>
          <div className="chip-group">
            {CUISINES.map((c) => (
              <button
                key={c.val}
                className={`chip ${cuisine === c.val ? "selected" : ""}`}
                onClick={() => setCuisine(c.val)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode && (
        <>
          <div className="pref-section">
            <h3>Any dietary preferences?</h3>
            <div className="chip-group">
              {DIETS.map((d) => (
                <button
                  key={d.val}
                  className={`chip ${diet === d.val ? "selected" : ""}`}
                  onClick={() => setDiet(d.val)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pref-section">
            <h3>Budget per meal?</h3>
            <div className="budget-slider">
              <input
                type="range"
                min={1}
                max={5}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
              <div className="budget-labels">
                <span style={budget === 1 ? { fontWeight: 700, color: "var(--green)" } : {}}>$5</span>
                <span style={budget === 3 ? { fontWeight: 700, color: "var(--green)" } : {}}>$15</span>
                <span style={budget === 5 ? { fontWeight: 700, color: "var(--green)" } : {}}>$25</span>
              </div>
            </div>
            <div className="budget-current">
              Up to <strong>${budgetValues[budget - 1]}</strong> per meal
            </div>
          </div>

          <div className="pref-section">
            <h3>Servings?</h3>
            <div className="servings-control">
              <button onClick={() => setServings(Math.max(1, servings - 1))}>
                -
              </button>
              <span className="count">{servings}</span>
              <button onClick={() => setServings(Math.min(10, servings + 1))}>
                +
              </button>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Find Recipes
          </button>
        </>
      )}
    </div>
  );
}
