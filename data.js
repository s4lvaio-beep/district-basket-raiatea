/* ============================================================
   District Basket Raiatea — Configuration & données par défaut
   ============================================================
   1) Remplace APPS_SCRIPT_URL par l'URL de ton déploiement
      Google Apps Script (voir fichier apps-script.gs fourni à part).
   2) Les données ci-dessous ne servent que de secours si le
      Google Sheet n'est pas encore connecté ou indisponible.
============================================================ */

const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxLTxpF66DOhH_kPmhT6wVpNU_94uCPN9FRHxuRQFmZaRXK8yS188rjFJ2JdmigdnmU/exec",
};

const CATEGORIES = ["Cadets", "Seniors Hommes", "Seniors Dames"];

const SALLES = ["Salle Omnisports de Uturoa", "Salle de Taputapuātea", "Salle de Tumaraʻa"];

const DEFAULT_DATA = {
  championnat: [
    { id: "c1", journee: "Journée 1 (ALLER)", date: "2026-10-02", match: "Match 1", domicile: "Équipe A", exterieur: "Équipe D", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe E" },
    { id: "c2", journee: "Journée 1 (ALLER)", date: "2026-10-02", match: "Match 2", domicile: "Équipe B", exterieur: "Équipe C", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c3", journee: "Journée 2 (ALLER)", date: "2026-10-09", match: "Match 1", domicile: "Équipe C", exterieur: "Équipe A", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe D" },
    { id: "c4", journee: "Journée 2 (ALLER)", date: "2026-10-09", match: "Match 2", domicile: "Équipe E", exterieur: "Équipe B", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c5", journee: "Journée 3 (ALLER)", date: "2026-10-16", match: "Match 1", domicile: "Équipe A", exterieur: "Équipe B", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe C" },
    { id: "c6", journee: "Journée 3 (ALLER)", date: "2026-10-16", match: "Match 2", domicile: "Équipe D", exterieur: "Équipe E", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c7", journee: "Journée 4 (ALLER)", date: "2026-10-23", match: "Match 1", domicile: "Équipe E", exterieur: "Équipe A", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe B" },
    { id: "c8", journee: "Journée 4 (ALLER)", date: "2026-10-23", match: "Match 2", domicile: "Équipe C", exterieur: "Équipe D", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c9", journee: "Journée 5 (ALLER)", date: "2026-10-30", match: "Match 1", domicile: "Équipe B", exterieur: "Équipe D", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe A" },
    { id: "c10", journee: "Journée 5 (ALLER)", date: "2026-10-30", match: "Match 2", domicile: "Équipe C", exterieur: "Équipe E", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c11", journee: "Journée 6 (RETOUR)", date: "2026-11-13", match: "Match 1", domicile: "Équipe D", exterieur: "Équipe A", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe E" },
    { id: "c12", journee: "Journée 6 (RETOUR)", date: "2026-11-13", match: "Match 2", domicile: "Équipe C", exterieur: "Équipe B", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c13", journee: "Journée 7 (RETOUR)", date: "2026-11-20", match: "Match 1", domicile: "Équipe A", exterieur: "Équipe C", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe D" },
    { id: "c14", journee: "Journée 7 (RETOUR)", date: "2026-11-20", match: "Match 2", domicile: "Équipe B", exterieur: "Équipe E", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c15", journee: "Journée 8 (RETOUR)", date: "2026-11-27", match: "Match 1", domicile: "Équipe B", exterieur: "Équipe A", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe C" },
    { id: "c16", journee: "Journée 8 (RETOUR)", date: "2026-11-27", match: "Match 2", domicile: "Équipe E", exterieur: "Équipe D", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c17", journee: "Journée 9 (RETOUR)", date: "2026-12-04", match: "Match 1", domicile: "Équipe A", exterieur: "Équipe E", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe B" },
    { id: "c18", journee: "Journée 9 (RETOUR)", date: "2026-12-04", match: "Match 2", domicile: "Équipe D", exterieur: "Équipe C", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" },
    { id: "c19", journee: "Journée 10 (RETOUR)", date: "2026-12-11", match: "Match 1", domicile: "Équipe D", exterieur: "Équipe B", heure: "19:15", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "Équipe A" },
    { id: "c20", journee: "Journée 10 (RETOUR)", date: "2026-12-11", match: "Match 2", domicile: "Équipe E", exterieur: "Équipe C", heure: "20:45", scoreDomicile: "", scoreExterieur: "", salle: "Salle Omnisports de Uturoa", exempte: "-" }
  ],

  /* Playoffs — structure à 5 équipes :
     - quart1 : 2e du classement vs 5e
     - quart2 : 3e vs 4e
     - repechage : perdant quart1 vs perdant quart2 (désigne la 4e demi-finaliste)
     - demi1 : 1er du classement (exempté) vs vainqueur repêchage
     - demi2 : vainqueur quart1 vs vainqueur quart2
     - finale : au meilleur des 3 matchs (finaleM1, finaleM2, finaleM3 — le 3e ne se joue que si nécessaire) */
  playoffs: {
    quart1: { id: "po_q1", label: "Quart de finale 1 (2e vs 5e)", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" },
    quart2: { id: "po_q2", label: "Quart de finale 2 (3e vs 4e)", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" },
    repechage: { id: "po_rep", label: "Repêchage (perdants des quarts)", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" },
    demi1: { id: "po_d1", label: "Demi-finale 1 (1er vs vainqueur repêchage)", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" },
    demi2: { id: "po_d2", label: "Demi-finale 2 (vainqueurs des quarts)", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" },
    finaleM1: { id: "po_f1", label: "Finale — Match 1", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" },
    finaleM2: { id: "po_f2", label: "Finale — Match 2", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" },
    finaleM3: { id: "po_f3", label: "Finale — Match 3 (si nécessaire)", equipeA: "", equipeB: "", scoreA: "", scoreB: "", date: "", heure: "", salle: "Salle Omnisports de Uturoa" }
  },

  salle: [
    { id: "s1", jour: "Lundi", debut: "", fin: "", type: "Aucun", details: "Créneau libre / disponible", responsable: "" },
    { id: "s2", jour: "Mardi", debut: "17:00", fin: "19:00", type: "Entraînement", details: "Écoles de Basket / U13", responsable: "" },
    { id: "s3", jour: "Mercredi", debut: "17:00", fin: "19:00", type: "Entraînement", details: "Sélections Jeunes / U15", responsable: "" },
    { id: "s4", jour: "Jeudi", debut: "", fin: "", type: "Aucun", details: "Créneau libre / disponible", responsable: "" },
    { id: "s5", jour: "Vendredi", debut: "19:00", fin: "23:00", type: "Matchs de Championnat", details: "Seniors Hommes & Femmes", responsable: "" },
    { id: "s6", jour: "Samedi", debut: "", fin: "", type: "Aucun", details: "Créneau libre / disponible", responsable: "" },
    { id: "s7", jour: "Dimanche", debut: "", fin: "", type: "Aucun", details: "Fermeture administrative IJSPF", responsable: "" }
  ],

  clubs: [],

  resultats: [],

  annonces: []
};
