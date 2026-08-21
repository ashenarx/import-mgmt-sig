// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Escape a value for safe insertion into HTML text content.
 * Prevents XSS when building innerHTML strings from user/DB data.
 */
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Disable/re-enable a form's submit button and swap its label
 * to give users clear feedback during async saves.
 * Usage:
 *   setSubmitting(formEl, true);
 *   try { await save(); } finally { setSubmitting(formEl, false); }
 */
function setSubmitting(form, isSubmitting) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  if (isSubmitting) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = "Menyimpan...";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText ?? btn.textContent;
    btn.disabled = false;
  }
}

// ─── PO context from URL ─────────────────────────────────────────────────────

const params   = new URLSearchParams(window.location.search);
const nomorPO  = params.get("po");
const shipment = params.get("shipment");

function poFilter() {
  return `nomor_po=eq.${encodeURIComponent(nomorPO)}&shipment=eq.${shipment}`;
}

async function loadContext() {
  const ctx = document.getElementById("po-context");
  if (!nomorPO || !shipment) {
    ctx.innerHTML = `<em>PO tidak ditemukan di URL. Kembali ke Home dan pilih PO terlebih dahulu.</em>`;
    return;
  }
  try {
    const master = await sbGet("master_po_data", `?${poFilter()}&select=*`);
    if (master.length === 0) {
      ctx.innerHTML = `<em>Data master PO tidak ditemukan.</em>`;
      return;
    }
    const po = master[0];
    ctx.innerHTML = `
      <div>
        <span style="color: var(--text-secondary);">PO:</span> <strong>${po.nomor_po}</strong>
        <span style="color: var(--text-muted);"> | Shipment:</span> <strong>${po.shipment}</strong>
        <span style="color: var(--text-muted);"> | Plant:</span> ${po.plant ?? "-"}
        <span style="color: var(--text-muted);"> | Vendor:</span> ${po.vendor ?? "-"}
      </div>`;
  } catch (err) {
    ctx.innerHTML = `<em>Gagal memuat data: ${err.message}</em>`;
  }
}

// Show/hide placeholder styling for date inputs based on whether they have a value
document.querySelectorAll('input[type="date"]').forEach(input => {
  const update = () => input.classList.toggle("has-value", !!input.value);
  input.addEventListener("input", update);
  input.addEventListener("change", update);
  update();
});

// Clamp number inputs to a minimum of 0
document.querySelectorAll("input[type='number']").forEach(input => {
  input.addEventListener("input", (e) => {
    if (e.target.value < 0) e.target.value = 0;
  });
});
