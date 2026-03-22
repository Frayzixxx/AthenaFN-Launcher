import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";

/**
 * Vérifie une mise à jour au démarrage (build release uniquement).
 * - Remplace l’URL dans `src-tauri/tauri.conf.json` → `tauri.updater.endpoints`.
 * - Héberge un manifeste JSON compatible Tauri (voir doc Tauri 1 updater).
 * - Pour signer : `TAURI_PRIVATE_KEY` = chemin vers `src-tauri/updater.key` (ou contenu).
 */
export async function checkAndApplyLauncherUpdate(): Promise<void> {
  if (import.meta.env.DEV) {
    return;
  }

  try {
    const update = await checkUpdate();
    if (!update.shouldUpdate) {
      return;
    }

    const version = update.manifest?.version ?? "";
    const ok = window.confirm(
      `Une nouvelle version du launcher est disponible${version ? ` (${version})` : ""}. Installer et redémarrer maintenant ?`
    );
    if (!ok) {
      return;
    }

    await installUpdate();
    await relaunch();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[launcher] mise à jour impossible:", msg, e);
  }
}
