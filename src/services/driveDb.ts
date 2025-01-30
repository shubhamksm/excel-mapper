import Dexie from "dexie";
import CryptoJS from "crypto-js";
import { Account, Transaction } from "@/types";

interface BudgetDBSchema {
  accounts: Account;
  transactions: Transaction;
  metadata: {
    key: string;
    value: string;
    updatedAt: Date;
  };
}

class BudgetDB extends Dexie {
  accounts!: Dexie.Table<BudgetDBSchema["accounts"], string>;
  transactions!: Dexie.Table<BudgetDBSchema["transactions"], string>;
  metadata!: Dexie.Table<BudgetDBSchema["metadata"], string>;

  constructor() {
    super("BudgetDB");

    // Define tables and indexes
    this.version(1).stores({
      accounts: "id, name, type, subType, currency, balance, parentAccountId",
      transactions:
        "id, accountId, year, title, amount, currency, date, category, note, exchangeRate, referenceAccountId, referenceAmount, linkedTransactionId",
      metadata: "key, value, updatedAt",
    });
  }
}

class DriveSync {
  private masterKey: string;
  private db: BudgetDB;
  private appFolderId: string | null;
  private backupFileName: string;
  private lastSyncKey: string;

  constructor(masterKey: string) {
    this.masterKey = masterKey;
    this.db = new BudgetDB();
    this.appFolderId = null;
    this.backupFileName = "budget_backup.enc";
    this.lastSyncKey = "lastSyncTimestamp";
  }

  // Initialize Google Drive folder
  async initialize() {
    try {
      const isEmpty = await this.isDatabaseEmpty();

      // @ts-ignore
      const response = await gapi.client.drive.files.list({
        q: "name='BudgetAppData' and mimeType='application/vnd.google-apps.folder'",
        spaces: "drive",
      });

      if (response.result.files.length === 0) {
        const folderMetadata = {
          name: "BudgetAppData",
          mimeType: "application/vnd.google-apps.folder",
        };
        // @ts-ignore
        const folder = await gapi.client.drive.files.create({
          resource: folderMetadata,
          fields: "id",
        });
        this.appFolderId = folder.result.id;
      } else {
        this.appFolderId = response.result.files[0].id;
      }

      // Try to restore from backup if database is empty
      if (isEmpty) {
        await this.restoreFromDrive();
      }
    } catch (error) {
      console.error("Failed to initialize Drive sync:", error);
      throw error;
    }
  }

  // Check if database is empty
  async isDatabaseEmpty() {
    const tableNames = this.db.tables.map((table) => table.name);
    for (const tableName of tableNames) {
      const count = await this.db.table(tableName).count();
      if (count > 0) return false;
    }
    return true;
  }

  // Encrypt data before saving to Drive
  encrypt(data: any) {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.masterKey
    ).toString();
  }

  // Decrypt data after loading from Drive
  decrypt(encryptedData: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.masterKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Export all data from IndexedDB
  async exportData() {
    const data: { [key: string]: any } = {};
    const tableNames = this.db.tables.map((table) => table.name);

    for (const tableName of tableNames) {
      data[tableName] = await this.db.table(tableName).toArray();
    }

    return data;
  }

  // Import data into IndexedDB
  async importData(data: { [key: string]: any }) {
    await this.db.transaction("rw", this.db.tables, async () => {
      const tableNames = Object.keys(data);

      for (const tableName of tableNames) {
        const table = this.db.table(tableName);
        await table.clear();
        await table.bulkAdd(data[tableName]);
      }
    });
  }

  // Save backup to Google Drive
  async backupToDrive() {
    try {
      const data = await this.exportData();

      if (!this.appFolderId) {
        throw new Error("App folder ID is not initialized");
      }

      const encryptedData = this.encrypt(data);

      // @ts-ignore
      const response = await gapi.client.drive.files.list({
        q: `name='${this.backupFileName}' and '${this.appFolderId}' in parents`,
        spaces: "drive",
        fields: "files(id, name, size)",
      });

      if (response.result.files.length > 0) {
        const fileId = response.result.files[0].id;

        const boundary = `-------${Math.random()
          .toString(36)
          .substring(2, 15)}`;
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const body =
          delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify({}) + // No metadata update needed
          delimiter +
          "Content-Type: application/octet-stream\r\n\r\n" +
          encryptedData +
          closeDelimiter;

        // @ts-ignore
        const backupResponse = await gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: "PATCH",
          params: { uploadType: "multipart" },
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        });
      } else {
        const metadata = {
          name: this.backupFileName,
          mimeType: "application/octet-stream",
          parents: [this.appFolderId],
        };

        const boundary = `-------${Math.random()
          .toString(36)
          .substring(2, 15)}`;
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const body =
          delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata) +
          delimiter +
          "Content-Type: application/octet-stream\r\n\r\n" +
          encryptedData +
          closeDelimiter;

        // @ts-ignore
        const createResponse = await gapi.client.request({
          path: "/upload/drive/v3/files",
          method: "POST",
          params: { uploadType: "multipart" },
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        });
      }

      // Update last sync timestamp
      await this.db.metadata.put({
        key: this.lastSyncKey,
        value: new Date().toISOString(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error backing up to Drive:", error);
      throw error;
    }
  }

  // Restore from Google Drive backup
  async restoreFromDrive() {
    try {
      // @ts-ignore
      const response = await gapi.client.drive.files.list({
        q: `name='${this.backupFileName}' and '${this.appFolderId}' in parents`,
        spaces: "drive",
        fields: "files(id, name, size)",
      });

      if (response.result.files.length === 0) {
        return false;
      }

      const fileId = response.result.files[0].id;

      // @ts-ignore
      const file = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: "media",
      });

      const decryptedData = this.decrypt(file.body);

      await this.importData(decryptedData);
      return true;
    } catch (error) {
      console.error("Error restoring from Drive:", error);
      throw error;
    }
  }

  // Set up auto-sync
  setupAutoSync(intervalMinutes = 5) {
    setInterval(async () => {
      try {
        await this.backupToDrive();
      } catch (error) {
        console.error("Auto-sync failed:", error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export { BudgetDB };
export default DriveSync;
