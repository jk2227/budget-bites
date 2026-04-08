async function request(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== 0 && v !== null && v !== undefined) {
      query.set(k, v);
    }
  });

  const qs = query.toString();
  const url = qs ? `${path}?${qs}` : path;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}

export async function searchRecipes({ query, cuisine, diet, maxPrice, sort, number } = {}) {
  return request("/api/recipes/search", {
    query: query || "",
    cuisine: cuisine || "",
    diet: diet || "",
    max_price: maxPrice || 0,
    sort: sort || "",
    number: number || 12,
  });
}

export async function getRecipe(id) {
  return request(`/api/recipes/${id}`);
}

export async function getRecipePrice(id) {
  return request("/api/recipes/price", { id });
}

export async function getCuisines() {
  return request("/api/cuisines");
}

export async function healthCheck() {
  return request("/api/health");
}
