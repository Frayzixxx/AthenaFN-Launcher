/**
 * Après `yarn tauri build` (avec TAURI_PRIVATE_KEY), génère update.generated.json
 * (version + signature + URL du fichier à télécharger).
 *
 * Usage : yarn update:manifest
 *
 * URL du fichier installateur (.zip ou .exe) :
 *
 *   Option A — ton site / CDN (sans GitHub) :
 *     UPDATE_ASSET_BASE_URL=https://ton-site.com/launcher/files
 *     → URL finale : https://ton-site.com/launcher/files/NomDuFichier.nsis.zip
 *     (uploade le même fichier que dans bundle/nsis/ à cet emplacement HTTPS.)
 *
 *   Option B — GitHub Releases (défaut si UPDATE_ASSET_BASE_URL absent) :
 *     UPDATE_GITHUB_REPO=Frayzixxx/Launcher-
 *     UPDATE_RELEASE_TAG=v1.0.21
 *
 * Sortie : update.generated.json → à uploader où ton tauri.conf.json pointe (HTTPS).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const tauriConfPath = path.join(root, "src-tauri", "tauri.conf.json");
const nsisDir = path.join(root, "src-tauri", "target", "release", "bundle", "nsis");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  if (!fs.existsSync(tauriConfPath)) {
    console.error("Fichier introuvable:", tauriConfPath);
    process.exit(1);
  }

  if (!fs.existsSync(nsisDir)) {
    console.error(
      "Dossier NSIS introuvable:",
      nsisDir,
      "\nLance d'abord: yarn tauri build (avec TAURI_PRIVATE_KEY pour les .sig)"
    );
    process.exit(1);
  }

  const tauri = readJson(tauriConfPath);
  const version = tauri.package?.version;
  if (!version) {
    console.error("package.version manquant dans tauri.conf.json");
    process.exit(1);
  }

  const assetBase = process.env.UPDATE_ASSET_BASE_URL?.trim();
  const repo = process.env.UPDATE_GITHUB_REPO || "Frayzixxx/Launcher-";
  const tag = process.env.UPDATE_RELEASE_TAG || `v${version}`;

  const files = fs.readdirSync(nsisDir);

  /** Paire .nsis.zip + .nsis.zip.sig (souvent ce que Tauri signe pour les MAJ) */
  const zips = files.filter((f) => f.endsWith(".nsis.zip") && !f.includes(".sig"));
  let assetName = null;
  let sigPath = null;

  for (const zip of zips) {
    const sigFile = `${zip}.sig`;
    if (files.includes(sigFile)) {
      assetName = zip;
      sigPath = path.join(nsisDir, sigFile);
      break;
    }
  }

  /** Sinon .exe + .exe.sig */
  if (!assetName) {
    const exes = files.filter((f) => f.endsWith("_x64-setup.exe"));
    for (const exe of exes) {
      const sigFile = `${exe}.sig`;
      if (files.includes(sigFile)) {
        assetName = exe;
        sigPath = path.join(nsisDir, sigFile);
        break;
      }
    }
  }

  if (!assetName || !sigPath) {
    console.error(
      "Aucune paire trouvée dans",
      nsisDir,
      ":\n  - fichier.nsis.zip + fichier.nsis.zip.sig\n  ou\n  - *_x64-setup.exe + *.exe.sig\nRebuild avec TAURI_PRIVATE_KEY."
    );
    process.exit(1);
  }

  const signature = fs.readFileSync(sigPath, "utf8").trim();

  let url;
  if (assetBase) {
    const base = assetBase.replace(/\/+$/, "");
    url = `${base}/${encodeURIComponent(assetName)}`;
  } else {
    url = `https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(assetName)}`;
  }

  const manifest = {
    version,
    notes: "Mise à jour du launcher.",
    pub_date: new Date().toISOString(),
    platforms: {
      "windows-x86_64": {
        signature,
        url,
      },
    },
  };

  const outPath = path.join(root, "update.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log("OK — manifeste généré :\n", outPath);
  if (assetBase) {
    console.log("\n→ Uploade", assetName, "sur ton hébergement à l’URL ci-dessous (ou équivalent).");
    console.log("→ Publie le contenu de update.generated.json à l’URL configurée dans tauri.conf.json (HTTPS).");
  } else {
    console.log("\n→ Copie update.generated.json là où pointe ton endpoint (ex. GitHub raw update.json).");
    console.log("→ Vérifie que la Release", tag, "contient l’asset :", assetName);
  }
  console.log("\nURL asset dans le manifeste :\n", url);
}

main();
