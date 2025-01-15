import { TEMPLATE_COLUMNS } from "./constants";

export type StateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export type Headers = string[];

export type Template_Columns = (typeof TEMPLATE_COLUMNS)[number];

export type MappedHeaders = Record<string, Template_Columns>;

export type Generic_CSV_Record = Record<string, string>;
export type Generic_CSV_Data = Generic_CSV_Record[];

export type CSV_Record = Record<Template_Columns, string | number>;
export type CSV_Data = CSV_Record[];

export enum ExcelMappingScreens {
  UPLOAD_FILE = "UPLOAD_FILE",
  HEADER_MAPPING = "HEADER_MAPPING",
  TITLE_MAPPING = "TITLE_MAPPING",
}
