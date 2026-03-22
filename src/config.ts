/**
 * Backend AthenaFN — base URL pour ton API locale.
 *
 * `athenafn.localhost` est résolu vers 127.0.0.1 (RFC 6761), souvent sans fichier hosts.
 * Ton backend doit écouter sur ce port (ex. 0.0.0.0:5000) et accepter l’origine du launcher.
 *
 * Surcharge : variable d’environnement VITE_API_BASE_URL (voir .env).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://athenafn.localhost:5000";
