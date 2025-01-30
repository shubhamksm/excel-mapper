import { BudgetDB } from "@/services/driveDb";
import DriveSync from "@/services/driveDb";

export const db = new BudgetDB();
export let driveSync: DriveSync | null = null;

export const initializeDriveSync = async () => {
  if (!driveSync) {
    driveSync = new DriveSync(process.env.VITE_GAPI_API_KEY as string);
    await driveSync.initialize();
    driveSync.setupAutoSync(5); // 5 minutes auto-sync
  }
  return driveSync;
};
