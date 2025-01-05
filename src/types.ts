export type StateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export enum ExcelMappingScreens {
  UPLOAD_FILE = "UPLOAD_FILE",
  HEADER_MAPPING = "HEADER_MAPPING",
  TITLE_MAPPING = "TITLE_MAPPING",
}
