export async function api(path, opts = {}) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {})
  };

  const res = await fetch(base + path, {
    ...opts,
    headers, // <-- ensure headers are not overwritten
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
