export default function RecipeCard({ recipe, servings, onClick }) {
  const pps = recipe.pricePerServing;
  const totalPrice = pps ? (pps * servings).toFixed(2) : null;
  const budgetLabel = !pps ? "" : pps < 2 ? "$" : pps < 3 ? "$$" : "$$$";
  const cal = recipe.nutrition?.calories;

  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="card-img">
        {recipe.emoji ? (
          <span>{recipe.emoji}</span>
        ) : recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span>🍽️</span>
        )}
        {budgetLabel && <span className="card-badge">{budgetLabel}</span>}
      </div>
      <div className="card-body">
        <h3>{recipe.title}</h3>
        <div className="card-meta">
          {totalPrice && <span>~${totalPrice} for {servings}</span>}
          {recipe.readyInMinutes && <span>{recipe.readyInMinutes} min</span>}
          {cal && <span>{cal} cal</span>}
        </div>
        <div className="card-tags">
          {recipe.cuisines?.map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
          {recipe.diets?.slice(0, 3).map((d) => (
            <span key={d} className="tag diet">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
