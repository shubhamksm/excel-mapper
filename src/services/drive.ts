import { Transaction } from "@/types";
import { groupTransactionsByYear } from "@/utils";
import { parse, unparse } from "papaparse";

export const listFiles = async () => {
  try {
    // @ts-ignore
    const response = await gapi.client.drive.files.list({
      pageSize: 10,
      fields: "files(id, name, mimeType)",
      q: "trashed = false", // Avoid files in Trash
    });
    return response.result.files;
  } catch (error) {
    console.error("Error listing files:", error);
  }
};

const getByName = async (query: string) => {
  try {
    // @ts-ignore
    const response = await gapi.client.drive.files.list({
      q: query,
      fields: "files(id, name)",
    });

    const items = response.result.files;
    if (!items || items.length === 0) {
      return;
    } else {
      return items[0].id;
    }
  } catch (error) {
    console.error("Error finding item:", error);
  }
};
export const getFolderByName = async (folderName: string) => {
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  return await getByName(query);
};

export const getJsonFileByName = async (fileName: string) => {
  const query = `name = '${fileName}' and mimeType = 'application/json' and trashed = false`;
  return await getByName(query);
};

export const createFolder = async (folderName: string) => {
  try {
    const metadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    // @ts-ignore
    const response = await gapi.client.drive.files.create({
      resource: metadata,
      fields: "id",
    });

    return response.result.id;
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};

export const readJsonFileContent = async <T>(
  fileId: string
): Promise<T | undefined> => {
  try {
    // @ts-ignore
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: "media",
    });

    return response.body ? JSON.parse(response.body) : undefined;
  } catch (error) {
    console.error("Error reading file content:", error);
  }
};

export const createJsonFile = async (
  fileName: string,
  data: any,
  folderId?: string
) => {
  try {
    const metadata = {
      name: fileName,
      mimeType: "application/json",
      ...(folderId && { parents: [folderId] }),
    };

    const boundary = `-------${Math.random().toString(36).substring(2, 15)}`;
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(data) +
      closeDelimiter;

    const response = await gapi.client.request({
      path: "/upload/drive/v3/files",
      method: "POST",
      params: {
        uploadType: "multipart",
      },
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    return response.result.id as string;
  } catch (error) {
    console.error("Error creating JSON file:", error);
  }
};

export const updateJsonFile = async (fileId: string, newData: any) => {
  try {
    const boundary = `-------${Math.random().toString(36).substring(2, 15)}`;
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify({}) + // No new metadata for updates
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(newData) +
      closeDelimiter;

    const response = await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: "PATCH",
      params: {
        uploadType: "multipart",
      },
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    return response.result.id;
  } catch (error) {
    console.error("Error updating JSON file:", error);
  }
};

export const createCsvFile = async (
  fileName: string,
  data: any,
  folderId: string
) => {
  try {
    const metadata = {
      name: fileName,
      mimeType: "text/csv",
      ...(folderId && { parents: [folderId] }),
    };

    const boundary = `-------${Math.random().toString(36).substring(2, 15)}`;
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const csvContent = unparse(data);

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: text/csv\r\n\r\n" +
      csvContent +
      closeDelimiter;

    const response = await gapi.client.request({
      path: "/upload/drive/v3/files",
      method: "POST",
      params: {
        uploadType: "multipart",
      },
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    return response.result.id;
  } catch (error) {
    console.error("Error creating CSV file:", error);
  }
};

export const readCsvFileContent = async (fileId: string) => {
  try {
    // @ts-ignore
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: "media",
    });

    return response.body ? parse(response.body, { header: true }).data : [];
  } catch (error) {
    console.error("Error reading CSV file content:", error);
  }
};

export const updateCsvFile = async (fileId: string, newData: any) => {
  try {
    const boundary = `-------${Math.random().toString(36).substring(2, 15)}`;
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const csvContent = unparse(newData);

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify({}) + // No new metadata for updates
      delimiter +
      "Content-Type: text/csv\r\n\r\n" +
      csvContent +
      closeDelimiter;

    const response = await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: "PATCH",
      params: {
        uploadType: "multipart",
      },
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    return response.result.id;
  } catch (error) {
    console.error("Error updating CSV file:", error);
  }
};

export const sortAndDivideTransactions = async (
  transactions: Transaction[],
  folderId: string
) => {
  try {
    const transactionsByYear = groupTransactionsByYear(transactions);

    for (const [year, yearTransactions] of Object.entries(transactionsByYear)) {
      const fileName = `${year}.csv`;
      const fileId = await getByName(
        `name = '${fileName}' and mimeType = 'text/csv' and trashed = false`
      );

      if (fileId) {
        const existingData = await readCsvFileContent(fileId);
        if (existingData) {
          const updatedData = [...existingData, ...yearTransactions];
          await updateCsvFile(fileId, updatedData);
        }
      } else {
        await createCsvFile(fileName, yearTransactions, folderId);
      }
    }
  } catch (error) {
    console.error("Error processing transactions:", error);
  }
};
