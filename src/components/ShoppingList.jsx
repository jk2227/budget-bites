export default function ShoppingList({
  items,
  checked,
  servings,
  onToggleCheck,
  onRemoveRecipe,
  onBrowse,
}) {
  if (items.length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24 }}>
          Your Shopping List
        </h2>
        <div className="list-empty">
          <div className="icon">:)</div>
          <p>Your shopping list is empty.</p>
          <p style={{ marginTop: 8, fontSize: "0.9rem" }}>
            Browse recipes and add ones you like!
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: 20 }}
            onClick={onBrowse}
          >
            Browse Recipes
          </button>
        </div>
      </div>
    );
  }

  let grandTotal = 0;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24 }}>
        Your Shopping List
      </h2>

      {items.map((recipe) => {
        const scale = servings / (recipe.servings || 1);
        const ingredients = recipe.ingredients || [];
        const recipeTotal = ingredients.reduce(
          (sum, i) => sum + (i.price || 0) * scale,
          0
        );
        grandTotal += recipeTotal;

        return (
          <div key={recipe.id} className="list-recipe-group">
            <div className="list-recipe-header">
              <h3>
                {recipe.emoji || "🍽️"} {recipe.title}
              </h3>
              <button
                className="btn-remove"
                onClick={() => onRemoveRecipe(recipe.id)}
              >
                Remove
              </button>
            </div>
            <ul className="checklist">
              {ingredients.map((ing, idx) => {
                const key = `${recipe.id}-${idx}`;
                const isChecked = checked[key];
                return (
                  <li key={key} className={isChecked ? "checked" : ""}>
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      onChange={() => onToggleCheck(key)}
                    />
                    <span>
                      {ing.name} &mdash; {ing.amount}
                      {ing.price != null &&
                        ` ($${(ing.price * scale).toFixed(2)})`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="list-total">
        Estimated Total
        <br />
        <span className="total-amount">${grandTotal.toFixed(2)}</span>
        <br />
        <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          for {servings} servings per recipe
        </span>
      </div>
    </div>
  );
}
