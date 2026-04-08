import { useState, useEffect } from "react";
import { getRecipe, getRecipePrice } from "../api/client";

export default function RecipeDetail({
  recipe: initialRecipe,
  servings,
  isInList,
  onAddToList,
  onRemoveFromList,
  onBack,
}) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    // Fetch full detail if we only have summary data
    if (!recipe.steps || recipe.steps.length === 0) {
      getRecipe(recipe.id).then(setRecipe).catch(() => {});
    }
    // Fetch price breakdown
    getRecipePrice(recipe.id).then(setPriceData).catch(() => {});
  }, [recipe.id]);

  const scale = servings / (recipe.servings || 1);
  const ingredients = priceData?.ingredients || recipe.ingredients || [];
  const totalCost = priceData
    ? (priceData.totalCost * scale).toFixed(2)
    : recipe.pricePerServing
      ? (recipe.pricePerServing * servings).toFixed(2)
      : null;
  const perServing = totalCost ? (totalCost / servings).toFixed(2) : null;
  const n = recipe.nutrition || {};

  function stripHtml(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>/g, "");
  }

  return (
    <div>
      <button className="detail-back" onClick={onBack}>
        &larr; Back to recipes
      </button>

      <div className="detail-hero">
        {recipe.emoji ? (
          recipe.emoji
        ) : recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius)" }}
          />
        ) : (
          "🍽️"
        )}
      </div>

      <h1 className="detail-title">{recipe.title}</h1>
      <p className="detail-subtitle">{stripHtml(recipe.summary)?.slice(0, 200)}</p>

      <div className="detail-stats">
        {totalCost && (
          <div className="stat-box">
            <div className="val">${totalCost}</div>
            <div className="label">Est. total ({servings} servings)</div>
          </div>
        )}
        {perServing && (
          <div className="stat-box">
            <div className="val">${perServing}</div>
            <div className="label">Per serving</div>
          </div>
        )}
        {recipe.readyInMinutes && (
          <div className="stat-box">
            <div className="val">{recipe.readyInMinutes}m</div>
            <div className="label">Cook time</div>
          </div>
        )}
      </div>

      {(n.calories || n.protein) && (
        <div className="detail-section" style={{ marginBottom: 24 }}>
          <h3>Nutrition per Serving</h3>
          <div className="nutrition-grid">
            {n.calories && (
              <div className="nutrition-item">
                <div className="nval">{n.calories}</div>
                <div className="nlabel">Calories</div>
              </div>
            )}
            {n.protein && (
              <div className="nutrition-item">
                <div className="nval">{n.protein}g</div>
                <div className="nlabel">Protein</div>
              </div>
            )}
            {n.carbs && (
              <div className="nutrition-item">
                <div className="nval">{n.carbs}g</div>
                <div className="nlabel">Carbs</div>
              </div>
            )}
            {n.fat && (
              <div className="nutrition-item">
                <div className="nval">{n.fat}g</div>
                <div className="nlabel">Fat</div>
              </div>
            )}
            {n.fiber && (
              <div className="nutrition-item">
                <div className="nval">{n.fiber}g</div>
                <div className="nlabel">Fiber</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="detail-columns">
        <div className="detail-section">
          <h3>Ingredients ({servings} servings)</h3>
          <ul className="ingredient-list">
            {ingredients.map((ing, i) => (
              <li key={i}>
                <span>
                  {ing.name} &mdash; {ing.amount}
                </span>
                {ing.price != null && (
                  <span className="price">
                    ${(ing.price * scale).toFixed(2)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {totalCost && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                fontWeight: 700,
                borderTop: "2px solid var(--green)",
              }}
            >
              <span>Total</span>
              <span style={{ color: "var(--green)" }}>${totalCost}</span>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h3>Instructions</h3>
          {recipe.steps && recipe.steps.length > 0 ? (
            <ol className="step-list">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>
              Instructions not available for this recipe.
            </p>
          )}
        </div>
      </div>

      <button
        className={`btn-add-list ${isInList ? "added" : ""}`}
        onClick={() =>
          isInList
            ? onRemoveFromList(recipe.id)
            : onAddToList(recipe)
        }
      >
        {isInList ? "Remove from Ingredient List" : "Add Ingredients to List"}
      </button>
    </div>
  );
}
