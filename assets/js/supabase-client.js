function supabaseHeaders() {
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
  };
  const token = localStorage.getItem("sb_access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Auth Functions
async function sbRegister(email, password, inviteCode) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password,
      data: { invite_code: inviteCode }
    })
  });
  return handleSupabaseResponse(res, "REGISTER", "auth");
}

async function sbLogin(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await handleSupabaseResponse(res, "LOGIN", "auth");
  if (data && data.access_token) {
    localStorage.setItem("sb_access_token", data.access_token);
    localStorage.setItem("sb_refresh_token", data.refresh_token);
    localStorage.setItem("sb_user", JSON.stringify(data.user));
  }
  return data;
}

function sbLogout() {
  localStorage.removeItem("sb_access_token");
  localStorage.removeItem("sb_refresh_token");
  localStorage.removeItem("sb_user");
  const isRoot = window.location.pathname.endsWith("index.html") || !window.location.pathname.includes("/pages/");
  window.location.href = isRoot ? "pages/login.html" : "login.html";
}

function sbGetSession() {
  const token = localStorage.getItem("sb_access_token");
  const user = localStorage.getItem("sb_user");
  return token && user ? JSON.parse(user) : null;
}

// Helper function to handle Supabase responses
async function handleSupabaseResponse(res, operation, table) {
  const text = await res.text();

  if (!res.ok) {
    let details = null;
    try {
      details = text ? JSON.parse(text) : null;
    } catch { }

    // Handle GoTrue error formats which usually have .msg or .message
    let errorMsg = details?.msg || details?.message || details?.error_description || text;

    const error = new Error(errorMsg || `${operation} ${table} failed with status ${res.status}`);
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
    { headers: supabaseHeaders() }
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
  await handleSupabaseResponse(res, "DELETE", table);
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