import { TEMPLATE_COLUMNS } from "./constants";

export type StateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export type Headers = string[];

export type Template_Columns = (typeof TEMPLATE_COLUMNS)[number];

export type MappedHeaders = Record<string, Template_Columns>;

export enum ExcelMappingScreens {
  UPLOAD_FILE = "UPLOAD_FILE",
  HEADER_MAPPING = "HEADER_MAPPING",
  TITLE_MAPPING = "TITLE_MAPPING",
}
