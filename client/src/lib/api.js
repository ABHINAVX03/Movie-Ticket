const base = import.meta.env.VITE_API_URL || "http://localhost:3000";

function headers(extra = {}) {
  const h = { ...extra };
  const adminKey = import.meta.env.VITE_ADMIN_API_KEY;
  if (adminKey) h["x-admin-api-key"] = adminKey;
  return h;
}

export async function apiGet(path) {
  const r = await fetch(`${base()}${path}`, { headers: headers() });
  const text = await r.text();
  if (!r.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).message || text;
    } catch {
      /* ignore */
    }
    throw new Error(msg || `Request failed ${r.status}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiPost(path, body) {
  return apiJson(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPut(path, body) {
  return apiJson(path, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDelete(path) {
  return apiJson(path, { method: "DELETE" });
}

export async function apiJson(path, opts = {}) {
  const r = await fetch(`${base()}${path}`, {
    ...opts,
    headers: headers({
      "Content-Type": "application/json",
      ...opts.headers,
    }),
  });
  const text = await r.text();
  if (!r.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).message || text;
    } catch {
      /* ignore */
    }
    throw new Error(msg || `Request failed ${r.status}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
