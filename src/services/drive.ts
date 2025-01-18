export const DEFAULT_FOLDER_NAME = "EXCEL_MAPPER";

export const listFiles = async () => {
  try {
    const response = await gapi.client.drive.files.list({
      pageSize: 10,
      fields: "files(id, name, mimeType)",
      q: "trashed = false", // Avoid files in Trash
    });
    if (response?.result?.files?.length === 0) {
      console.log("No files found.");
    } else {
      console.log("Files:", response.result.files);
    }
    return response.result.files;
  } catch (error) {
    console.error("Error listing files:", error);
  }
};

export const getFolderByName = async (
  folderName: string = DEFAULT_FOLDER_NAME
) => {
  try {
    const response = await gapi.client.drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
    });

    const folders = response.result.files;
    if (!folders || folders?.length === 0) {
      return;
    } else {
      return folders[0].id;
    }
  } catch (error) {
    console.error("Error finding folder:", error);
  }
};

export const createFolder = async (
  folderName: string = DEFAULT_FOLDER_NAME
) => {
  try {
    const metadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    const response = await gapi.client.drive.files.create({
      resource: metadata,
      fields: "id",
    });

    return response.result.id;
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};
