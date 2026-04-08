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

  function buildPlainText() {
    let text = "Ingredient List\n================\n\n";
    items.forEach((recipe) => {
      const ingredients = recipe.ingredients || [];
      text += `${recipe.title}\n`;
      text += "-".repeat(recipe.title.length) + "\n";
      ingredients.forEach((ing, idx) => {
        const key = `${recipe.id}-${idx}`;
        const mark = checked[key] ? "[x]" : "[ ]";
        text += `${mark} ${ing.name} — ${ing.amount}\n`;
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
        setTimeout(() => { btn.textContent = "Copy to Clipboard"; }, 2000);
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
          <button className="btn-action" onClick={handlePrint}>Print</button>
          <button className="btn-action" onClick={handleEmail}>Email</button>
          <button className="btn-action" id="copy-btn" onClick={handleCopy}>Copy to Clipboard</button>
        </div>
      </div>

      <div id="printable-list">
        {items.map((recipe) => {
          const ingredients = recipe.ingredients || [];

          return (
            <div key={recipe.id} className="list-recipe-group">
              <div className="list-recipe-header">
                <h3>
                  {recipe.emoji || "\ud83c\udf7d\ufe0f"} {recipe.title}
                </h3>
                <button
                  className="btn-remove no-print"
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
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
