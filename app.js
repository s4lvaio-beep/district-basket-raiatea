/* ============================================================
   District Basket Raiatea — Application principale
============================================================ */

let STATE = {
  data: JSON.parse(JSON.stringify(DEFAULT_DATA)),
  tab: "championnat",
  isAdmin: false,
  password: null,
  resultCat: CATEGORIES[0],
  online: false,
};

const $app = document.getElementById("app");
const $loader = document.getElementById("loader");

/* ---------------- API (Google Apps Script) ---------------- */

function apiConfigured() {
  return CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.startsWith("REMPLACE_PAR");
}

async function apiLoad() {
  if (!apiConfigured()) return null;
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL + "?action=getAll");
    if (!res.ok) throw new Error("network");
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("Chargement Apps Script impossible, utilisation des données locales.", e);
    return null;
  }
}

async function apiWrite(action, payload) {
  if (!apiConfigured()) {
    alert("Le Google Sheet n'est pas encore connecté. Configure APPS_SCRIPT_URL dans data.js.");
    return { ok: false };
  }
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, password: STATE.password, ...payload }),
    });
    const json = await res.json();
    if (!json.ok && json.error === "unauthorized") {
      alert("Mot de passe incorrect ou session expirée. Reconnecte-toi.");
      logout();
    }
    return json;
  } catch (e) {
    alert("Erreur réseau : la modification n'a pas pu être enregistrée.");
    return { ok: false };
  }
}

async function refreshFromSheet() {
  const remote = await apiLoad();
  if (remote && remote.ok) {
    STATE.data = remote.data;
    if (!STATE.data.playoffs) {
      STATE.data.playoffs = JSON.parse(JSON.stringify(DEFAULT_DATA.playoffs));
    }
    STATE.online = true;
  } else {
    STATE.online = false;
  }
}

/* ---------------- Auth (bureau du district) ---------------- */

function openLogin() {
  document.getElementById("loginModal").classList.remove("hidden");
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").classList.add("hidden");
  document.getElementById("loginPassword").focus();
}
function closeLogin() {
  document.getElementById("loginModal").classList.add("hidden");
}
async function attemptLogin() {
  const pwd = document.getElementById("loginPassword").value;
  if (!apiConfigured()) {
    STATE.isAdmin = true;
    STATE.password = pwd;
    closeLogin();
    render();
    return;
  }
  STATE.password = pwd;
  const check = await apiWrite("checkPassword", {});
  if (check.ok) {
    STATE.isAdmin = true;
    closeLogin();
    render();
  } else {
    document.getElementById("loginError").classList.remove("hidden");
  }
}
function logout() {
  STATE.isAdmin = false;
  STATE.password = null;
  render();
}

document.getElementById("adminToggle").addEventListener("click", () => {
  if (STATE.isAdmin) {
    logout();
  } else {
    openLogin();
  }
});
document.getElementById("loginClose").addEventListener("click", closeLogin);
document.getElementById("loginSubmit").addEventListener("click", attemptLogin);
document.getElementById("loginPassword").addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptLogin();
});

/* ---------------- Helpers ---------------- */

function uid() {
  return "id" + Math.random().toString(36).slice(2, 10);
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}
function fmtMoney(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(Number(n) || 0)) + " F";
}
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function icon(name) {
  const icons = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
  };
  return icons[name] || "";
}

/* ---------------- Tabs ---------------- */

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    STATE.tab = btn.dataset.tab;
    render();
  });
});

/* ---------------- Render dispatch ---------------- */

function render() {
  document.getElementById("adminToggle").classList.toggle("active", STATE.isAdmin);
  document.getElementById("adminToggle").textContent = STATE.isAdmin ? "Bureau (connecté)" : "Espace bureau";

  const renderers = {
    championnat: renderChampionnat,
    playoffs: renderPlayoffs,
    salle: renderSalle,
    clubs: renderClubs,
    classement: renderClassement,
    annonces: renderAnnonces,
  };
  $app.innerHTML = "";
  renderers[STATE.tab]();
}

/* ---------------- Championnat ---------------- */

function computeChampionnatStandings(matches) {
  const table = {};
  const ensure = (team) => (table[team] = table[team] || { team, played: 0, wins: 0, losses: 0, points: 0, diff: 0 });
  matches.forEach((m) => {
    if (m.scoreDomicile === "" || m.scoreDomicile === undefined || m.scoreDomicile === null) return;
    if (m.scoreExterieur === "" || m.scoreExterieur === undefined || m.scoreExterieur === null) return;
    const sa = Number(m.scoreDomicile), sb = Number(m.scoreExterieur);
    const a = ensure(m.domicile), b = ensure(m.exterieur);
    a.played++; b.played++;
    a.diff += (sa - sb); b.diff += (sb - sa);
    if (sa > sb) { a.wins++; a.points += 2; b.losses++; b.points += 1; }
    else if (sb > sa) { b.wins++; b.points += 2; a.losses++; a.points += 1; }
  });
  return Object.values(table).sort((x, y) => y.points - x.points || y.diff - x.diff);
}

function renderChampionnat() {
  const matches = STATE.data.championnat || [];
  const grouped = [];
  let lastJ = null;
  matches.forEach((m) => {
    if (m.journee !== lastJ) {
      grouped.push({ journee: m.journee, items: [] });
      lastJ = m.journee;
    }
    grouped[grouped.length - 1].items.push(m);
  });

  const standings = computeChampionnatStandings(matches);

  let html = `
    <div class="section-head">
      <div class="section-title">Championnat du vendredi (5 équipes)</div>
    </div>
    <p class="section-note">Saison 2026/2027 · Salle de Uturoa · ${matches.length} matchs sur ${grouped.length} journées</p>
  `;

  html += `<div class="section-head"><div class="section-title">Classement phase régulière</div></div>`;
  if (standings.length === 0) {
    html += `<div class="empty">Aucun score saisi pour le moment.</div>`;
  } else {
    html += `<div class="tbl-wrap"><table class="tbl"><thead><tr>
      <th>Équipe</th><th class="tcenter">J</th><th class="tcenter">V</th><th class="tcenter">D</th><th class="tcenter">+/-</th><th class="tcenter">Pts</th>
    </tr></thead><tbody>`;
    standings.forEach((s, i) => {
      html += `<tr><td><strong>${i + 1}. ${escapeHtml(s.team)}</strong></td>
        <td class="tcenter">${s.played}</td><td class="tcenter" style="color:var(--good)">${s.wins}</td>
        <td class="tcenter" style="color:var(--bad)">${s.losses}</td>
        <td class="tcenter">${s.diff > 0 ? "+" : ""}${s.diff}</td>
        <td class="tcenter" style="color:var(--accent); font-weight:800">${s.points}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    if (standings.length < 5) {
      html += `<p class="section-note" style="margin-top:-14px;">Le classement complet (5 équipes) apparaît au fur et à mesure que les scores sont saisis.</p>`;
    }
  }

  grouped.forEach((g) => {
    const isTreve = g.journee.includes("TRÊVE");
    html += `<div class="day-group-label ${isTreve ? "treve" : ""}">${escapeHtml(g.journee)}</div>`;
    g.items.forEach((m) => {
      html += `
        <div class="card match-row" data-id="${m.id}">
          <div class="match-date">${fmtDate(m.date)}<br>${escapeHtml(m.heure || "")}</div>
          <div class="match-teams">
            <div class="score-team-row">
              <span>${escapeHtml(m.domicile)}</span>
              <input type="number" min="0" class="score-input match-score" data-id="${m.id}" data-side="scoreDomicile" placeholder="-" value="${escapeHtml(m.scoreDomicile ?? "")}" ${STATE.isAdmin ? "" : "disabled"}>
            </div>
            <div class="score-team-row">
              <span>${escapeHtml(m.exterieur)}</span>
              <input type="number" min="0" class="score-input match-score" data-id="${m.id}" data-side="scoreExterieur" placeholder="-" value="${escapeHtml(m.scoreExterieur ?? "")}" ${STATE.isAdmin ? "" : "disabled"}>
            </div>
            ${m.exempte && m.exempte !== "-" ? `<div class="match-bye">Exempte : ${escapeHtml(m.exempte)}</div>` : ""}
            ${renderSalleField(m.id, m.salle, "match-salle", STATE.isAdmin)}
          </div>
        </div>
      `;
    });
  });

  $app.innerHTML = html;

  document.querySelectorAll(".match-score").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const side = e.target.dataset.side;
      const value = e.target.value;
      const m = STATE.data.championnat.find((x) => x.id === id);
      if (m) m[side] = value;
      const res = await apiWrite("updateMatch", { id, [side]: value });
      if (!res.ok) { console.warn("Échec sauvegarde score"); return; }
      render();
    });
  });

  document.querySelectorAll(".match-salle").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const salle = e.target.value;
      const m = STATE.data.championnat.find((x) => x.id === id);
      if (m) m.salle = salle;
      const res = await apiWrite("updateMatch", { id, salle });
      if (!res.ok) console.warn("Échec sauvegarde salle");
    });
  });
}

/* ---------------- Salle (sélecteur réutilisable) ---------------- */

function renderSalleField(id, currentSalle, cssClass, isAdmin) {
  if (!isAdmin) {
    return `<div class="muted-sm match-salle-display">📍 ${escapeHtml(currentSalle || SALLES[0])}</div>`;
  }
  const options = SALLES.map((s) => `<option value="${escapeHtml(s)}" ${currentSalle === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("");
  return `<select class="input ${cssClass}" data-id="${id}" style="margin: 6px 0 0; padding: 6px 10px; font-size:0.78rem;">${options}</select>`;
}

/* ---------------- Playoffs ---------------- */

function getPlayoffSeeding(matches) {
  // Classement de la phase régulière, dans l'ordre 1er -> 5e
  return computeChampionnatStandings(matches).map((s) => s.team);
}

function winner(po, key) {
  const m = po[key];
  if (!m || m.scoreA === "" || m.scoreB === "" || m.scoreA === undefined || m.scoreB === undefined) return null;
  const sa = Number(m.scoreA), sb = Number(m.scoreB);
  if (sa === sb) return null;
  return sa > sb ? m.equipeA : m.equipeB;
}
function loser(po, key) {
  const m = po[key];
  const w = winner(po, key);
  if (!w) return null;
  return w === m.equipeA ? m.equipeB : m.equipeA;
}

function syncPlayoffTeams(seeding) {
  const po = STATE.data.playoffs;
  if (!po) return;
  if (seeding.length < 5) return; // classement pas encore complet

  const [s1, s2, s3, s4, s5] = seeding;

  // Quarts (figés une fois le classement complet)
  if (!po.quart1.equipeA) { po.quart1.equipeA = s2; po.quart1.equipeB = s5; }
  if (!po.quart2.equipeA) { po.quart2.equipeA = s3; po.quart2.equipeB = s4; }

  // Repêchage : perdants des deux quarts
  const lq1 = loser(po, "quart1"), lq2 = loser(po, "quart2");
  if (lq1 && lq2) { po.repechage.equipeA = lq1; po.repechage.equipeB = lq2; }

  // Demi-finale 1 : exempté (1er) vs vainqueur du repêchage
  const wRep = winner(po, "repechage");
  po.demi1.equipeA = s1;
  if (wRep) po.demi1.equipeB = wRep;

  // Demi-finale 2 : vainqueurs des deux quarts
  const wq1 = winner(po, "quart1"), wq2 = winner(po, "quart2");
  if (wq1) po.demi2.equipeA = wq1;
  if (wq2) po.demi2.equipeB = wq2;

  // Finale (meilleur des 3) : vainqueurs des demies
  const wd1 = winner(po, "demi1"), wd2 = winner(po, "demi2");
  if (wd1) { po.finaleM1.equipeA = wd1; po.finaleM2.equipeA = wd1; po.finaleM3.equipeA = wd1; }
  if (wd2) { po.finaleM1.equipeB = wd2; po.finaleM2.equipeB = wd2; po.finaleM3.equipeB = wd2; }
}

function finaleSeriesStatus(po) {
  const w1 = winner(po, "finaleM1"), w2 = winner(po, "finaleM2"), w3 = winner(po, "finaleM3");
  const wins = {};
  [w1, w2, w3].forEach((w) => { if (w) wins[w] = (wins[w] || 0) + 1; });
  const champion = Object.keys(wins).find((t) => wins[t] >= 2) || null;
  const needsMatch3 = !!w1 && !!w2 && w1 !== w2 && !champion;
  return { wins, champion, needsMatch3 };
}

function renderPlayoffMatchCard(po, key, opts = {}) {
  const m = po[key];
  const locked = opts.locked || !m.equipeA || !m.equipeB;
  return `
    <div class="card po-card">
      <div class="eyebrow">${escapeHtml(m.label)}</div>
      ${locked && (!m.equipeA || !m.equipeB) ? `
        <div class="muted-sm" style="margin-top:4px;">En attente des équipes qualifiées</div>
      ` : `
        <div class="po-team-row">
          <span>${escapeHtml(m.equipeA)}</span>
          <input type="number" min="0" class="score-input po-score" data-key="${key}" data-side="scoreA" value="${escapeHtml(m.scoreA ?? "")}" placeholder="-" ${STATE.isAdmin ? "" : "disabled"}>
        </div>
        <div class="po-team-row">
          <span>${escapeHtml(m.equipeB)}</span>
          <input type="number" min="0" class="score-input po-score" data-key="${key}" data-side="scoreB" value="${escapeHtml(m.scoreB ?? "")}" placeholder="-" ${STATE.isAdmin ? "" : "disabled"}>
        </div>
        ${renderSalleField(key, m.salle, "po-salle", STATE.isAdmin)}
      `}
    </div>
  `;
}

function renderPlayoffs() {
  const matches = STATE.data.championnat || [];
  const seeding = getPlayoffSeeding(matches);
  syncPlayoffTeams(seeding);
  const po = STATE.data.playoffs;

  let html = `<div class="section-head"><div class="section-title">Playoffs</div></div>`;

  if (seeding.length < 5) {
    html += `<div class="empty">Les playoffs se déclencheront une fois tous les matchs de phase régulière saisis (classement à 5 équipes complet).</div>`;
    $app.innerHTML = html;
    return;
  }

  html += `<p class="section-note">1ère place exemptée des quarts · Finale au meilleur des 3 matchs</p>`;

  html += `<div class="day-group-label">Quarts de finale</div>`;
  html += renderPlayoffMatchCard(po, "quart1");
  html += renderPlayoffMatchCard(po, "quart2");

  html += `<div class="day-group-label">Repêchage (perdants des quarts)</div>`;
  html += renderPlayoffMatchCard(po, "repechage");

  html += `<div class="day-group-label">Demi-finales</div>`;
  html += renderPlayoffMatchCard(po, "demi1");
  html += renderPlayoffMatchCard(po, "demi2");

  html += `<div class="day-group-label">Finale (au meilleur des 3)</div>`;
  html += renderPlayoffMatchCard(po, "finaleM1");
  html += renderPlayoffMatchCard(po, "finaleM2");

  const { champion, needsMatch3 } = finaleSeriesStatus(po);
  if (needsMatch3 || (po.finaleM3.scoreA !== "" && po.finaleM3.scoreA !== undefined)) {
    html += renderPlayoffMatchCard(po, "finaleM3");
  }

  if (champion) {
    html += `<div class="alert" style="background:#1F3320; border-color:#2A4A2E; color:var(--good);">🏆 Champion du district : <strong>${escapeHtml(champion)}</strong></div>`;
  }

  $app.innerHTML = html;

  document.querySelectorAll(".po-score").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const key = e.target.dataset.key;
      const side = e.target.dataset.side;
      const value = e.target.value;
      STATE.data.playoffs[key][side] = value;
      const res = await apiWrite("updatePlayoffMatch", { key, [side]: value, equipeA: STATE.data.playoffs[key].equipeA, equipeB: STATE.data.playoffs[key].equipeB });
      if (!res.ok) console.warn("Échec sauvegarde score playoff");
      render();
    });
  });

  document.querySelectorAll(".po-salle").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const key = e.target.dataset.id;
      const salle = e.target.value;
      STATE.data.playoffs[key].salle = salle;
      const res = await apiWrite("updatePlayoffMatch", { key, salle, equipeA: STATE.data.playoffs[key].equipeA, equipeB: STATE.data.playoffs[key].equipeB });
      if (!res.ok) console.warn("Échec sauvegarde salle playoff");
    });
  });
}

/* ---------------- Planning de la salle omnisports (créneaux hebdo) ---------------- */

function renderSalle() {
  const slots = STATE.data.salle || [];
  let html = `
    <div class="section-head">
      <div class="section-title">Planning salle omnisports Uturoa</div>
    </div>
    <p class="section-note">Saison 2026/2027 · Occupation hebdomadaire</p>
  `;
  slots.forEach((s) => {
    const typeClass = s.type === "Entraînement" ? "type-entrainement" : (s.type && s.type.includes("Match")) ? "type-match" : "";
    html += `
      <div class="card slot-card ${typeClass}">
        <div class="card-row">
          <div>
            <div><strong>${escapeHtml(s.jour)}</strong> ${s.debut ? `<span class="muted-sm">${escapeHtml(s.debut)} – ${escapeHtml(s.fin)}</span>` : ""}</div>
            <div class="eyebrow" style="margin-top:6px;">${escapeHtml(s.type)}</div>
            <div class="muted">${escapeHtml(s.details)}</div>
            ${s.responsable ? `<div class="muted-sm" style="margin-top:4px;">Responsable : ${escapeHtml(s.responsable)}</div>` : ""}
          </div>
          ${STATE.isAdmin ? `<button class="icon-btn edit-slot" data-id="${s.id}">${icon("edit")}</button>` : ""}
        </div>
      </div>
    `;
  });
  html += `
    <div class="legend">
      <span><span class="legend-dot" style="background:var(--warn)"></span>Entraînements</span>
      <span><span class="legend-dot" style="background:var(--accent)"></span>Matchs officiels</span>
    </div>
  `;
  $app.innerHTML = html;
  document.querySelectorAll(".edit-slot").forEach((btn) => {
    btn.addEventListener("click", () => openSlotModal(btn.dataset.id));
  });
}

function openSlotModal(id) {
  const s = STATE.data.salle.find((x) => x.id === id);
  if (!s) return;
  const html = `
    <div class="modal-overlay" id="dynModal">
      <div class="modal">
        <button class="modal-close" id="dynClose">&times;</button>
        <h3>Créneau du ${escapeHtml(s.jour)}</h3>
        <div class="field-row">
          <div><label class="field-label">Heure de début</label><input type="time" class="input" id="f_debut" value="${s.debut || ""}"></div>
          <div><label class="field-label">Heure de fin</label><input type="time" class="input" id="f_fin" value="${s.fin || ""}"></div>
        </div>
        <label class="field-label">Type d'activité</label>
        <select class="input" id="f_type">
          ${["Aucun", "Entraînement", "Matchs de Championnat", "Autre"].map((t) => `<option ${s.type === t ? "selected" : ""}>${t}</option>`).join("")}
        </select>
        <label class="field-label">Catégories / précisions</label>
        <input class="input" id="f_details" value="${escapeHtml(s.details || "")}">
        <label class="field-label">Responsable de créneau</label>
        <input class="input" id="f_resp" value="${escapeHtml(s.responsable || "")}">
        <button class="btn-primary" id="dynSave">Enregistrer</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  document.getElementById("dynClose").addEventListener("click", closeDynModal);
  document.getElementById("dynSave").addEventListener("click", async () => {
    const payload = {
      id,
      debut: document.getElementById("f_debut").value,
      fin: document.getElementById("f_fin").value,
      type: document.getElementById("f_type").value,
      details: document.getElementById("f_details").value,
      responsable: document.getElementById("f_resp").value,
    };
    Object.assign(s, payload);
    await apiWrite("updateSlot", payload);
    closeDynModal();
    render();
  });
}
function closeDynModal() {
  const m = document.getElementById("dynModal");
  if (m) m.remove();
}

/* ---------------- Clubs ---------------- */

function renderClubs() {
  const clubs = STATE.data.clubs || [];
  let html = `
    <div class="section-head"><div class="section-title">Clubs affiliés (${clubs.length})</div></div>
  `;
  if (clubs.length === 0) {
    html += `<div class="empty">Aucun club enregistré.</div>`;
  } else {
    clubs.forEach((c) => {
      const badgeClass = c.cotisation === "payée" ? "badge-good" : c.cotisation === "impayée" ? "badge-bad" : "badge-warn";
      html += `
        <div class="card card-row">
          <div>
            <strong>${escapeHtml(c.nom)}</strong>
            <div class="muted-sm">${c.effectif || 0} licenciés</div>
            ${c.contact ? `<div class="muted-sm">${escapeHtml(c.contact)}</div>` : ""}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge ${badgeClass}">${escapeHtml(c.cotisation || "en attente")}</span>
            ${STATE.isAdmin ? `
              <button class="icon-btn edit-club" data-id="${c.id}">${icon("edit")}</button>
              <button class="icon-btn danger del-club" data-id="${c.id}">${icon("trash")}</button>
            ` : ""}
          </div>
        </div>
      `;
    });
  }
  $app.innerHTML = html;
  if (STATE.isAdmin) addFab(() => openClubModal(null));
  document.querySelectorAll(".edit-club").forEach((b) => b.addEventListener("click", () => openClubModal(b.dataset.id)));
  document.querySelectorAll(".del-club").forEach((b) => b.addEventListener("click", () => deleteClub(b.dataset.id)));
}

function openClubModal(id) {
  const c = id ? STATE.data.clubs.find((x) => x.id === id) : { id: uid(), nom: "", effectif: "", contact: "", cotisation: "en attente" };
  const html = `
    <div class="modal-overlay" id="dynModal">
      <div class="modal">
        <button class="modal-close" id="dynClose">&times;</button>
        <h3>${id ? "Modifier le club" : "Nouveau club"}</h3>
        <label class="field-label">Nom du club</label>
        <input class="input" id="f_nom" value="${escapeHtml(c.nom)}" placeholder="Ex : Basket Club Uturoa">
        <label class="field-label">Effectif (licenciés)</label>
        <input type="number" min="0" class="input" id="f_effectif" value="${c.effectif || ""}">
        <label class="field-label">Contact</label>
        <input class="input" id="f_contact" value="${escapeHtml(c.contact || "")}" placeholder="Nom · téléphone">
        <label class="field-label">Statut cotisation</label>
        <select class="input" id="f_cotis">
          ${["payée", "en attente", "impayée"].map((s) => `<option ${c.cotisation === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <button class="btn-primary" id="dynSave">Enregistrer</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  document.getElementById("dynClose").addEventListener("click", closeDynModal);
  document.getElementById("dynSave").addEventListener("click", async () => {
    const payload = {
      id: c.id,
      nom: document.getElementById("f_nom").value,
      effectif: Number(document.getElementById("f_effectif").value) || 0,
      contact: document.getElementById("f_contact").value,
      cotisation: document.getElementById("f_cotis").value,
    };
    if (!payload.nom) return;
    const exists = STATE.data.clubs.some((x) => x.id === c.id);
    if (exists) {
      Object.assign(STATE.data.clubs.find((x) => x.id === c.id), payload);
    } else {
      STATE.data.clubs.push(payload);
    }
    await apiWrite(exists ? "updateClub" : "addClub", payload);
    closeDynModal();
    render();
  });
}
async function deleteClub(id) {
  if (!confirm("Supprimer ce club ?")) return;
  STATE.data.clubs = STATE.data.clubs.filter((x) => x.id !== id);
  await apiWrite("deleteClub", { id });
  render();
}

/* ---------------- Classement ---------------- */

function computeStandings(results) {
  const table = {};
  const ensure = (team) => (table[team] = table[team] || { team, played: 0, wins: 0, losses: 0, points: 0 });
  results.forEach((r) => {
    const a = ensure(r.equipeA), b = ensure(r.equipeB);
    a.played++; b.played++;
    const sa = Number(r.scoreA), sb = Number(r.scoreB);
    if (sa > sb) { a.wins++; a.points += 2; b.losses++; b.points += 1; }
    else if (sb > sa) { b.wins++; b.points += 2; a.losses++; a.points += 1; }
  });
  return Object.values(table).sort((x, y) => y.points - x.points || (y.wins - y.losses) - (x.wins - x.losses));
}

function renderClassement() {
  const results = (STATE.data.resultats || []).filter((r) => r.categorie === STATE.resultCat);
  const standings = computeStandings(results);

  let html = `
    <div class="section-head">
      <div class="section-title">Classement</div>
      <select class="input" id="catSelect" style="width:auto; margin:0; padding:7px 10px;">
        ${CATEGORIES.map((c) => `<option ${STATE.resultCat === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>
    </div>
  `;

  if (standings.length === 0) {
    html += `<div class="empty">Aucun résultat saisi pour cette catégorie.</div>`;
  } else {
    html += `<div class="tbl-wrap"><table class="tbl"><thead><tr>
      <th>Équipe</th><th class="tcenter">J</th><th class="tcenter">V</th><th class="tcenter">D</th><th class="tcenter">Pts</th>
    </tr></thead><tbody>`;
    standings.forEach((s, i) => {
      html += `<tr><td><strong>${i + 1}. ${escapeHtml(s.team)}</strong></td>
        <td class="tcenter">${s.played}</td><td class="tcenter" style="color:var(--good)">${s.wins}</td>
        <td class="tcenter" style="color:var(--bad)">${s.losses}</td><td class="tcenter" style="color:var(--accent); font-weight:800">${s.points}</td></tr>`;
    });
    html += `</tbody></table></div>`;
  }

  html += `<div class="section-head"><div class="section-title">Résultats saisis</div></div>`;
  const allResults = STATE.data.resultats || [];
  if (allResults.length === 0) {
    html += `<div class="empty">Aucun résultat saisi.</div>`;
  } else {
    [...allResults].reverse().forEach((r) => {
      html += `
        <div class="card card-row">
          <div>
            <div class="eyebrow">${escapeHtml(r.categorie)}</div>
            <div>${escapeHtml(r.equipeA)} <strong>${r.scoreA}</strong> – <strong>${r.scoreB}</strong> ${escapeHtml(r.equipeB)}</div>
          </div>
          ${STATE.isAdmin ? `<button class="icon-btn danger del-result" data-id="${r.id}">${icon("trash")}</button>` : ""}
        </div>
      `;
    });
  }

  $app.innerHTML = html;
  document.getElementById("catSelect").addEventListener("change", (e) => { STATE.resultCat = e.target.value; render(); });
  if (STATE.isAdmin) addFab(() => openResultModal());
  document.querySelectorAll(".del-result").forEach((b) => b.addEventListener("click", () => deleteResult(b.dataset.id)));
}

function openResultModal() {
  const html = `
    <div class="modal-overlay" id="dynModal">
      <div class="modal">
        <button class="modal-close" id="dynClose">&times;</button>
        <h3>Nouveau résultat</h3>
        <label class="field-label">Catégorie</label>
        <select class="input" id="f_cat">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select>
        <div class="field-row">
          <div><label class="field-label">Équipe A</label><input class="input" id="f_eqA"></div>
          <div><label class="field-label">Score A</label><input type="number" min="0" class="input" id="f_scA"></div>
        </div>
        <div class="field-row">
          <div><label class="field-label">Équipe B</label><input class="input" id="f_eqB"></div>
          <div><label class="field-label">Score B</label><input type="number" min="0" class="input" id="f_scB"></div>
        </div>
        <button class="btn-primary" id="dynSave">Enregistrer</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  document.getElementById("dynClose").addEventListener("click", closeDynModal);
  document.getElementById("dynSave").addEventListener("click", async () => {
    const payload = {
      id: uid(),
      categorie: document.getElementById("f_cat").value,
      equipeA: document.getElementById("f_eqA").value,
      equipeB: document.getElementById("f_eqB").value,
      scoreA: Number(document.getElementById("f_scA").value) || 0,
      scoreB: Number(document.getElementById("f_scB").value) || 0,
    };
    if (!payload.equipeA || !payload.equipeB) return;
    STATE.data.resultats.push(payload);
    await apiWrite("addResult", payload);
    closeDynModal();
    render();
  });
}
async function deleteResult(id) {
  if (!confirm("Supprimer ce résultat ?")) return;
  STATE.data.resultats = STATE.data.resultats.filter((x) => x.id !== id);
  await apiWrite("deleteResult", { id });
  render();
}

/* ---------------- Annonces ---------------- */

function renderAnnonces() {
  const annonces = STATE.data.annonces || [];
  let html = `<div class="section-head"><div class="section-title">Annonces du district</div></div>`;
  if (annonces.length === 0) {
    html += `<div class="empty">Aucune annonce publiée.</div>`;
  } else {
    [...annonces].reverse().forEach((a) => {
      html += `
        <div class="card card-row">
          <div>
            <p style="margin:0; white-space:pre-wrap;">${escapeHtml(a.texte)}</p>
            <div class="muted-sm" style="margin-top:8px;">${fmtDate(a.date)}</div>
          </div>
          ${STATE.isAdmin ? `<button class="icon-btn danger del-annonce" data-id="${a.id}">${icon("trash")}</button>` : ""}
        </div>
      `;
    });
  }
  $app.innerHTML = html;
  if (STATE.isAdmin) addFab(() => openAnnonceModal());
  document.querySelectorAll(".del-annonce").forEach((b) => b.addEventListener("click", () => deleteAnnonce(b.dataset.id)));
}

function openAnnonceModal() {
  const html = `
    <div class="modal-overlay" id="dynModal">
      <div class="modal">
        <button class="modal-close" id="dynClose">&times;</button>
        <h3>Nouvelle annonce</h3>
        <label class="field-label">Message</label>
        <textarea class="input" id="f_texte" placeholder="Ex : Convocation des délégués de club pour l'assemblée générale du district..."></textarea>
        <button class="btn-primary" id="dynSave">Publier</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  document.getElementById("dynClose").addEventListener("click", closeDynModal);
  document.getElementById("dynSave").addEventListener("click", async () => {
    const texte = document.getElementById("f_texte").value.trim();
    if (!texte) return;
    const payload = { id: uid(), texte, date: new Date().toISOString().slice(0, 10) };
    STATE.data.annonces.push(payload);
    await apiWrite("addAnnouncement", payload);
    closeDynModal();
    render();
  });
}
async function deleteAnnonce(id) {
  if (!confirm("Supprimer cette annonce ?")) return;
  STATE.data.annonces = STATE.data.annonces.filter((x) => x.id !== id);
  await apiWrite("deleteAnnouncement", { id });
  render();
}

/* ---------------- FAB (bouton ajouter flottant) ---------------- */

function addFab(onClick) {
  const fab = document.createElement("button");
  fab.className = "fab";
  fab.textContent = "+";
  fab.addEventListener("click", onClick);
  $app.appendChild(fab);
}

/* ---------------- Boot ---------------- */

(async function boot() {
  await refreshFromSheet();
  $loader.remove();
  render();
})();
