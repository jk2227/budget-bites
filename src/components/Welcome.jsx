import { useState } from "react";

const DIETS = [
  { val: "", label: "No Preference" },
  { val: "vegetarian", label: "Vegetarian" },
  { val: "vegan", label: "Vegan" },
  { val: "gluten-free", label: "Gluten-Free" },
  { val: "dairy-free", label: "Dairy-Free" },
];

const CUISINES = [
  { val: "", label: "All Cuisines" },
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
  const [diet, setDiet] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [budget, setBudget] = useState(2);
  const [servings, setServings] = useState(2);

  const budgetLabels = ["Under $5", "$5–$10", "$10–$15"];
  const budgetValues = [5, 10, 15];

  function handleSubmit() {
    onSubmit({
      diet,
      cuisine,
      maxPrice: budgetValues[budget - 1],
      servings,
    });
  }

  return (
    <div className="welcome">
      <h1>Eat Well, Spend Less</h1>
      <p className="tagline">Delicious meals on a budget.</p>
      <p>
        Tell us what you like, and we'll suggest affordable dishes with full
        nutrition info, ingredients, and estimated costs.
      </p>

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
        <h3>What cuisines do you enjoy?</h3>
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

      <div className="pref-section">
        <h3>Budget per meal?</h3>
        <div className="budget-slider">
          <input
            type="range"
            min={1}
            max={3}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          <div className="budget-labels">
            {budgetLabels.map((l, i) => (
              <span key={i} style={budget === i + 1 ? { fontWeight: 700, color: "var(--green)" } : {}}>
                {"$".repeat(i + 1)} {l}
              </span>
            ))}
          </div>
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

      <button className="btn-primary" onClick={handleSubmit}>
        Find Recipes
      </button>
    </div>
  );
}
