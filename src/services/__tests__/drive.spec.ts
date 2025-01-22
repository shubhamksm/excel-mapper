import { CSV_Data } from "@/types";
import {
  listFiles,
  getFolderByName,
  getJsonFileByName,
  createFolder,
  readJsonFileContent,
  createJsonFile,
  updateJsonFile,
  createCsvFile,
  readCsvFileContent,
  updateCsvFile,
  sortAndDivideTransactions,
} from "../drive";
import { genericCSVData1 } from "@/testData";

// Add at the top of the file, after imports
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Mock gapi client
const mockGapiClient = {
  drive: {
    files: {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
    },
  },
  request: jest.fn(),
};

// Mock global gapi object
(global as any).gapi = {
  client: mockGapiClient,
};

describe("Drive Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listFiles", () => {
    it("should list files successfully", async () => {
      const mockFiles = [
        { id: "1", name: "file1", mimeType: "text/csv" },
        { id: "2", name: "file2", mimeType: "application/json" },
      ];

      mockGapiClient.drive.files.list.mockResolvedValueOnce({
        result: { files: mockFiles },
      });

      const result = await listFiles();
      expect(result).toEqual(mockFiles);
      expect(mockGapiClient.drive.files.list).toHaveBeenCalledWith({
        pageSize: 10,
        fields: "files(id, name, mimeType)",
        q: "trashed = false",
      });
    });

    it("should handle empty files list", async () => {
      mockGapiClient.drive.files.list.mockResolvedValueOnce({
        result: { files: [] },
      });

      const result = await listFiles();
      expect(result).toEqual([]);
    });
  });

  describe("getFolderByName", () => {
    it("should get folder ID by name", async () => {
      const mockFolder = { id: "folder123", name: "TestFolder" };
      mockGapiClient.drive.files.list.mockResolvedValueOnce({
        result: { files: [mockFolder] },
      });

      const result = await getFolderByName("TestFolder");
      expect(result).toBe("folder123");
      expect(mockGapiClient.drive.files.list).toHaveBeenCalledWith({
        q: "name = 'TestFolder' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: "files(id, name)",
      });
    });
  });

  describe("getJsonFileByName", () => {
    it("should get JSON file ID by name", async () => {
      const mockFile = { id: "file123", name: "test.json" };
      mockGapiClient.drive.files.list.mockResolvedValueOnce({
        result: { files: [mockFile] },
      });

      const result = await getJsonFileByName("test.json");
      expect(result).toBe("file123");
    });
  });

  describe("createFolder", () => {
    it("should create a folder", async () => {
      mockGapiClient.drive.files.create.mockResolvedValueOnce({
        result: { id: "newFolder123" },
      });

      const result = await createFolder("NewFolder");
      expect(result).toBe("newFolder123");
      expect(mockGapiClient.drive.files.create).toHaveBeenCalledWith({
        resource: {
          name: "NewFolder",
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      });
    });
  });

  describe("readJsonFileContent", () => {
    it("should read JSON file content", async () => {
      const mockContent = { key: "value" };
      mockGapiClient.drive.files.get.mockResolvedValueOnce({
        body: JSON.stringify(mockContent),
      });

      const result = await readJsonFileContent("file123");
      expect(result).toEqual(mockContent);
    });
  });

  describe("createJsonFile", () => {
    it("should create JSON file", async () => {
      mockGapiClient.request.mockResolvedValueOnce({
        result: { id: "newFile123" },
      });

      const result = await createJsonFile(
        "test.json",
        { data: "test" },
        "folder123"
      );
      expect(result).toBe("newFile123");
      expect(mockGapiClient.request).toHaveBeenCalled();
    });
  });

  describe("updateJsonFile", () => {
    it("should update JSON file content", async () => {
      mockGapiClient.request.mockResolvedValueOnce({
        result: { id: "file123" },
      });

      const result = await updateJsonFile("file123", { newData: "test" });
      expect(result).toBe("file123");
      expect(mockGapiClient.request).toHaveBeenCalled();
    });
  });

  describe("CSV Operations", () => {
    describe("createCsvFile", () => {
      it("should create CSV file", async () => {
        mockGapiClient.request.mockResolvedValueOnce({
          result: { id: "newCsv123" },
        });

        const result = await createCsvFile(
          "test.csv",
          genericCSVData1,
          "folder123"
        );
        expect(result).toBe("newCsv123");
        expect(mockGapiClient.request).toHaveBeenCalled();
      });
    });

    describe("readCsvFileContent", () => {
      it("should read CSV file content", async () => {
        mockGapiClient.drive.files.get.mockResolvedValueOnce({
          body: "header1,header2\nvalue1,value2",
        });

        const result = await readCsvFileContent("file123");
        expect(Array.isArray(result)).toBeTruthy();
      });
    });

    describe("updateCsvFile", () => {
      it("should update CSV file content", async () => {
        mockGapiClient.request.mockResolvedValueOnce({
          result: { id: "file123" },
        });

        const result = await updateCsvFile("file123", genericCSVData1);
        expect(result).toBe("file123");
        expect(mockGapiClient.request).toHaveBeenCalled();
      });
    });
  });

  describe("sortAndDivideTransactions", () => {
    it("should sort and create files for transactions by year", async () => {
      // Mock for getByName (checking if file exists)
      mockGapiClient.drive.files.list
        .mockResolvedValueOnce({
          result: { files: [] },
        })
        .mockResolvedValueOnce({
          result: { files: [] },
        });

      // Mock for createCsvFile
      mockGapiClient.request
        .mockResolvedValueOnce({
          result: { id: "newFile1" },
        })
        .mockResolvedValueOnce({
          result: { id: "newFile2" },
        });

      const transactions = [
        { Date: "2022-01-01", Amount: 100, Title: "Test1" },
        { Date: "2023-01-01", Amount: 200, Title: "Test2" },
      ] as CSV_Data;

      await sortAndDivideTransactions(transactions, "folder123");

      // Verify that the request was called for each year's file creation
      expect(mockGapiClient.request).toHaveBeenCalledTimes(2);
      expect(mockGapiClient.drive.files.list).toHaveBeenCalledTimes(2);
    });

    it("should update existing files when they exist", async () => {
      // Mock for getByName (file exists)
      mockGapiClient.drive.files.list
        .mockResolvedValueOnce({
          result: { files: [{ id: "existingFile1" }] },
        })
        .mockResolvedValueOnce({
          result: { files: [{ id: "existingFile2" }] },
        });

      // Mock for readCsvFileContent
      mockGapiClient.drive.files.get
        .mockResolvedValueOnce({
          body: "Date,Amount,Title\n2022-01-01,100,ExistingTest1",
        })
        .mockResolvedValueOnce({
          body: "Date,Amount,Title\n2023-01-01,200,ExistingTest2",
        });

      // Mock for updateCsvFile
      mockGapiClient.request
        .mockResolvedValueOnce({
          result: { id: "existingFile1" },
        })
        .mockResolvedValueOnce({
          result: { id: "existingFile2" },
        });

      const transactions = [
        { Date: "2022-01-01", Amount: 100, Title: "Test1" },
        { Date: "2023-01-01", Amount: 200, Title: "Test2" },
      ] as CSV_Data;

      await sortAndDivideTransactions(transactions, "folder123");

      // Verify all API calls were made
      expect(mockGapiClient.drive.files.list).toHaveBeenCalledTimes(2);
      expect(mockGapiClient.drive.files.get).toHaveBeenCalledTimes(2);
      expect(mockGapiClient.request).toHaveBeenCalledTimes(2);
    });
  });
});
