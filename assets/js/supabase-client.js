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
    let details = null;

    try {
      details = text ? JSON.parse(text) : null;
    } catch {}

    const error = new Error(
      `${operation} ${table} failed: ${res.status} ${text}`
    );

    error.status = res.status;
    error.code = details?.code;

    throw error;
  }

  return text ? JSON.parse(text) : null;
}


// Supabase error message
function getSupabaseErrorMessage(err, fallback) {
  if (!navigator.onLine) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }

  return fallback;
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


// Supabase Insert function
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
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify(data),
    }
  );
  return handleSupabaseResponse(res, "UPDATE", table);
}

// Supabase Delete function
async function sbDelete(table, filter) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${filter}`,
    {
      method: "DELETE",
      headers: supabaseHeaders(),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${table} failed: ${res.status} ${text}`);
  }
  return true;
}

// Toast notification function
function showToast(message, type = "error") {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const messageElement = document.createElement("span");
  messageElement.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.className = "toast-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Tutup");
  closeButton.innerHTML = "&times;";

  closeButton.addEventListener("click", () => {
    toast.remove();
  });

  toast.appendChild(messageElement);
  toast.appendChild(closeButton);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s forwards";

    setTimeout(() => toast.remove(), 300);
  }, 3000);
}