// Base headers for every request to Supabase's REST API
function supabaseHeaders() {
  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

// GET rows from a table. Optional query string, e.g. "?select=*&order=nomor_po"
async function sbGet(table, query = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: supabaseHeaders(),
  });
  if (!res.ok) throw new Error(`GET ${table} failed: ${res.status}`);
  return res.json();
}

// INSERT a row into a table. Returns the inserted row.
async function sbInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`INSERT ${table} failed: ${res.status}`);
  return res.json();
}

// UPDATE rows matching a filter, e.g. sbUpdate("master_po_data", {plant: "SI"}, "nomor_po=eq.123")
async function sbUpdate(table, data, filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: { ...supabaseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`UPDATE ${table} failed: ${res.status}`);
  return res.json();
}
