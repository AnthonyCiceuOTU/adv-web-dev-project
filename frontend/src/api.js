export async function api(path, opts={}){
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const res = await fetch(base + path, {
    headers: { 'Content-Type':'application/json', ...(opts.headers||{}) },
    ...opts
  });
  if(!res.ok){ throw new Error(await res.text()); }
  return res.json();
}
