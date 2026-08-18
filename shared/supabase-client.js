// Supabase client configuration
function supabaseHeaders() {
  return {
    "apikey": SUPABASE_ANON_KEY,
  };
}

// Helper function to handle Supabase responses
async function handleSupabaseResponse(res, operation, table) {
  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `${operation} ${table} failed: ${res.status} ${text}`
    );
  }
  return text ? JSON.parse(text) : null;
}


// Supabase GET function
async function sbGet(table, query = "") {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${query}`,
    {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
      },
    }
  );
  return handleSupabaseResponse(res, "GET", table);
}


// Supabase Insert and Update functions
async function sbInsert(table, data) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}`,
    {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify(data),
    }
  );
  return handleSupabaseResponse(res, "INSERT", table);
}

// Supabase Update function
async function sbUpdate(table, data, filter) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${filter}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseHeaders(),
        "Prefer": "return=representation",
      },
      body: JSON.stringify(data),
    }
  );
  return handleSupabaseResponse(res, "UPDATE", table);
}