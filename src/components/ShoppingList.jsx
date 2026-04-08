export default function ShoppingList({
  items,
  checked,
  onToggleCheck,
  onRemoveRecipe,
  onBrowse,
}) {
  if (items.length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24 }}>
          Your Ingredient List
        </h2>
        <div className="list-empty">
          <div className="icon">:)</div>
          <p>Your ingredient list is empty.</p>
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

  // Consolidate ingredients across recipes, grouped by normalized name
  function buildConsolidated() {
    const map = new Map(); // normalized name -> { name, sources: [{ recipe, amount }] }

    items.forEach((recipe) => {
      const ingredients = recipe.ingredients || [];
      ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, { name: ing.name, sources: [] });
        }
        map.get(key).sources.push({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          recipeEmoji: recipe.emoji || "\ud83c\udf7d\ufe0f",
          amount: ing.amount,
        });
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  const consolidated = buildConsolidated();

  function buildPlainText() {
    let text = "Ingredient List\n================\n\n";
    consolidated.forEach((item) => {
      const checkKey = item.name.toLowerCase().trim();
      const mark = checked[checkKey] ? "[x]" : "[ ]";
      text += `${mark} ${item.name}\n`;
      item.sources.forEach((s) => {
        text += `    - ${s.amount} (${s.recipeTitle})\n`;
      });
      text += "\n";
    });
    return text;
  }

  function handlePrint() {
    window.print();
  }

  function handleEmail() {
    const body = encodeURIComponent(buildPlainText());
    const subject = encodeURIComponent("My Budget Bites Ingredient List");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildPlainText()).then(() => {
      const btn = document.getElementById("copy-btn");
      if (btn) {
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = "Copy to Clipboard";
        }, 2000);
      }
    });
  }

  return (
    <div>
      <div className="list-header">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Your Ingredient List
        </h2>
        <div className="list-actions">
          <button className="btn-action" onClick={handlePrint}>
            Print
          </button>
          <button className="btn-action" onClick={handleEmail}>
            Email
          </button>
          <button className="btn-action" id="copy-btn" onClick={handleCopy}>
            Copy to Clipboard
          </button>
        </div>
      </div>

      <div className="list-recipes-summary">
        {items.map((recipe) => (
          <div key={recipe.id} className="list-recipe-tag">
            <span>
              {recipe.emoji || "\ud83c\udf7d\ufe0f"} {recipe.title}
            </span>
            <button
              className="btn-remove-small no-print"
              onClick={() => onRemoveRecipe(recipe.id)}
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div id="printable-list">
        {consolidated.map((item) => {
          const checkKey = item.name.toLowerCase().trim();
          const isChecked = checked[checkKey];
          return (
            <div
              key={checkKey}
              className={`ingredient-row ${isChecked ? "checked" : ""}`}
            >
              <div className="ingredient-main">
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => onToggleCheck(checkKey)}
                />
                <span className="ingredient-name">{item.name}</span>
              </div>
              <div className="ingredient-sources">
                {item.sources.map((s, i) => (
                  <span key={i} className="ingredient-source">
                    {s.amount}
                    <span className="source-recipe">
                      {s.recipeEmoji} {s.recipeTitle}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
