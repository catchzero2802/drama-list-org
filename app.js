/* ═══════════════════════════════════════════════════════════════
   HER DRAMA LIST — app.js
   ─────────────────────────────────────────────────────────────
   SETUP REQUIRED (see README.md):
     1. Replace TMDB_API_KEY  with your key from themoviedb.org
     2. Replace the firebaseConfig object with your Firebase config
   ═══════════════════════════════════════════════════════════════ */

// ── CONFIG ── FILL THESE IN ──────────────────────────────────
const TMDB_API_KEY    = "ba8ddf8e7b60437308efe36024b1c3d6";
const ADMIN_PASSWORD  = "jolene";

const firebaseConfig = {
  apiKey: "AIzaSyD5k6pwAwZ89dfoUfcUhwD22tcuHkR2A_A",
  authDomain: "drama-list-e4b7a.firebaseapp.com",
  databaseURL: "https://drama-list-e4b7a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "drama-list-e4b7a",
  storageBucket: "drama-list-e4b7a.firebasestorage.app",
  messagingSenderId: "60250688988",
  appId: "1:60250688988:web:51c318c98d4f1ce534d319"
};
// ─────────────────────────────────────────────────────────────

// ── Firebase SDK (loaded from CDN) ───────────────────────────
import { initializeApp }                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseApp = initializeApp(firebaseConfig);
const db          = getDatabase(firebaseApp);
const dramasRef   = ref(db, "dramas");

// ── App State ─────────────────────────────────────────────────
let dramas      = {};    // { id: dramaObject }
let isAdmin     = false;
let currentSort = "added";

// ── Boot: listen for realtime changes from Firebase ──────────
onValue(dramasRef, (snapshot) => {
  dramas = snapshot.val() || {};
  render();
});

// ── Password Modal ────────────────────────────────────────────
function openPasswordModal() {
  if (isAdmin) { setAdmin(false); return; }
  document.getElementById("modalBg").classList.add("open");
  document.getElementById("pwInput").value = "";
  document.getElementById("pwErr").textContent = "";
  setTimeout(() => document.getElementById("pwInput").focus(), 120);
}

function closePasswordModal() {
  document.getElementById("modalBg").classList.remove("open");
}

function checkPassword() {
  const pw = document.getElementById("pwInput").value;
  if (pw === ADMIN_PASSWORD) {
    closePasswordModal();
    setAdmin(true);
  } else {
    document.getElementById("pwErr").textContent = "Wrong password — try again";
    document.getElementById("pwInput").value = "";
    document.getElementById("pwInput").focus();
  }
}

function setAdmin(v) {
  isAdmin = v;
  const btn   = document.getElementById("adminToggle");
  const panel = document.getElementById("addPanel");
  document.querySelector(".page-wrap").classList.toggle("admin-mode", v);

  if (v) {
    btn.textContent = "🔓 done editing";
    btn.classList.add("active");
    panel.classList.add("open");
    document.getElementById("titleInput").focus();
  } else {
    btn.textContent = "🔒 manage list";
    btn.classList.remove("active");
    panel.classList.remove("open");
  }
  render();
}

// ── TMDB poster fetch ────────────────────────────────────────
async function fetchPoster(title, year) {
  if (!TMDB_API_KEY || TMDB_API_KEY === "PASTE_YOUR_TMDB_KEY_HERE") return "";
  try {
    const query = encodeURIComponent(title);
    const url   = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${query}&first_air_date_year=${year}&language=en-US`;
    const res   = await fetch(url);
    const data  = await res.json();

    // Find best match (prefer TV shows)
    const results = (data.results || []).filter(r => r.poster_path);
    if (!results.length) return "";

    const best = results.find(r => r.media_type === "tv") || results[0];
    return `https://image.tmdb.org/t/p/w300${best.poster_path}`;
  } catch (e) {
    console.warn("TMDB fetch failed:", e);
    return "";
  }
}

// ── Add Drama ─────────────────────────────────────────────────
async function addDrama() {
  const title   = document.getElementById("titleInput").value.trim();
  const year    = parseInt(document.getElementById("yearInput").value) || new Date().getFullYear();
  const country = document.getElementById("countryInput").value || "Korean";

  if (!title) { showToast("✦ Please enter a drama title"); return; }

  const btn = document.getElementById("addBtn");
  btn.disabled    = true;
  btn.textContent = "Fetching poster...";

  // auto-fetch poster from TMDB
  const poster = await fetchPoster(title, year);

  const id    = "d_" + Date.now();
  const drama = { id, title, year, country, fav: false, addedAt: Date.now(), poster };

  // save to Firebase — syncs to ALL devices instantly
  await set(ref(db, `dramas/${id}`), drama);

  // clear inputs
  document.getElementById("titleInput").value  = "";
  document.getElementById("yearInput").value   = "";

  showToast("✓ Added: " + title + (poster ? " 🖼" : ""));
  btn.disabled    = false;
  btn.textContent = "+ Add";
}

// ── Toggle Favourite ──────────────────────────────────────────
async function toggleFav(id, e) {
  e.stopPropagation();
  const drama = dramas[id];
  if (!drama) return;
  await set(ref(db, `dramas/${id}/fav`), !drama.fav);
}

// ── Delete Drama ──────────────────────────────────────────────
async function deleteDrama(id, e) {
  e.stopPropagation();
  if (!confirm("Remove this drama from the list?")) return;
  await remove(ref(db, `dramas/${id}`));
  showToast("Drama removed");
}

// ── Sort ──────────────────────────────────────────────────────
function setSort(s, btn) {
  currentSort = s;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  render();
}

// ── Render ────────────────────────────────────────────────────
function render() {
  const q    = document.getElementById("searchInput").value.toLowerCase();
  let list   = Object.values(dramas);

  // search filter
  if (q) list = list.filter(d =>
    d.title.toLowerCase().includes(q) ||
    (d.country || "").toLowerCase().includes(q)
  );

  // sort
  switch (currentSort) {
    case "alpha":  list.sort((a, b) => a.title.localeCompare(b.title));          break;
    case "year":   list.sort((a, b) => b.year - a.year);                         break;
    case "fav":    list.sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0));      break;
    default:       list.sort((a, b) => b.addedAt - a.addedAt);                   break;  // recent
  }

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="es-emoji">🎭</div>
        <p>${q ? "No dramas found" : "No dramas yet"}</p>
        <span>${q ? "Try a different search" : "Add your first drama above!"}</span>
      </div>`;
  } else {
    list.forEach((d, i) => {
      const card = document.createElement("div");
      card.className = "drama-card";
      card.style.animationDelay = (i * 0.04) + "s";

      const posterHTML = d.poster
        ? `<img class="drama-poster" src="${d.poster}" alt="${escHtml(d.title)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : "";

      const placeholderVisible = d.poster ? "display:none" : "";

      card.innerHTML = `
        ${posterHTML}
        <div class="poster-placeholder" style="${placeholderVisible}">
          <span class="ph-emoji">${countryEmoji(d.country)}</span>
          <p class="ph-title">${escHtml(d.title)}</p>
        </div>
        ${d.fav ? `<div class="fav-badge">★</div>` : ""}
        <button class="delete-btn" onclick="deleteDrama('${d.id}', event)" title="Remove">✕</button>
        <div class="drama-info">
          <div class="drama-title">${escHtml(d.title)}</div>
          <div class="drama-meta">
            <span class="drama-year">${d.year}${d.country ? " · " + d.country : ""}</span>
            <button class="fav-btn" onclick="toggleFav('${d.id}', event)" title="${d.fav ? "Unfavourite" : "Favourite"}">
              ${d.fav ? "★" : "☆"}
            </button>
          </div>
        </div>`;

      grid.appendChild(card);
    });
  }

  // stats
  const all   = Object.values(dramas);
  const favs  = all.filter(d => d.fav).length;
  const ctrs  = new Set(all.map(d => d.country).filter(Boolean)).size;
  const new24 = all.filter(d => d.year >= 2024).length;

  document.getElementById("statsRow").innerHTML = `
    <div class="stat-card"><div class="stat-num">${all.length}</div><div class="stat-label">Total dramas</div></div>
    <div class="stat-card"><div class="stat-num">${favs}</div><div class="stat-label">Favourites</div></div>
    <div class="stat-card"><div class="stat-num">${ctrs}</div><div class="stat-label">Countries</div></div>
    <div class="stat-card"><div class="stat-num">${new24}</div><div class="stat-label">2024+</div></div>`;
}

// ── Helpers ───────────────────────────────────────────────────
function countryEmoji(c) {
  const map = { Korean: "🇰🇷", Chinese: "🇨🇳", Japanese: "🇯🇵", Thai: "🇹🇭", Taiwanese: "🇹🇼" };
  return map[c] || "🎭";
}

function escHtml(s) {
  return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

// ── Falling petals ────────────────────────────────────────────
function spawnPetals() {
  const container = document.getElementById("petals");
  const symbols   = ["🌸", "🌺", "✿", "❀", "🌷"];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement("span");
    el.className     = "petal";
    el.textContent   = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left              = Math.random() * 100 + "%";
    el.style.fontSize          = (11 + Math.random() * 12) + "px";
    el.style.animationDuration = (3.5 + Math.random() * 5) + "s";
    el.style.animationDelay    = (Math.random() * 6) + "s";
    container.appendChild(el);
  }
}

// ── Close modal on background click ──────────────────────────
document.getElementById("modalBg").addEventListener("click", function(e) {
  if (e.target === this) closePasswordModal();
});

// ── Expose functions to HTML onclick handlers ─────────────────
window.openPasswordModal  = openPasswordModal;
window.closePasswordModal = closePasswordModal;
window.checkPassword      = checkPassword;
window.addDrama           = addDrama;
window.toggleFav          = toggleFav;
window.deleteDrama        = deleteDrama;
window.setSort            = setSort;

// ── Init ──────────────────────────────────────────────────────
spawnPetals();
