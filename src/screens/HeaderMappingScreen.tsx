import {
  Headers,
  MappedHeaders,
  StateAction,
  Template_Columns,
} from "../types";
import { Select } from "antd";
import { TEMPLATE_COLUMNS } from "../constants";

type HeaderMappingScreenProps = {
  headers: Headers;
  setMappedHeaders: StateAction<MappedHeaders>;
};

const OptionsFromTemplateColumns = TEMPLATE_COLUMNS.map((column) => {
  return {
    label: column,
    value: column,
  };
});

export const HeaderMappingScreen = ({
  headers,
  setMappedHeaders,
}: HeaderMappingScreenProps) => {
  const handleChange = (header: string, value: Template_Columns) => {
    setMappedHeaders((prev) => {
      return {
        ...prev,
        [header]: value,
      };
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      {headers.map((header) => {
        return (
          <div
            className="flex justify-between items-center gap-x-4"
            key={header}
          >
            <h3>{header}</h3>
            <Select
              options={OptionsFromTemplateColumns}
              onChange={(value) =>
                handleChange(header, value as Template_Columns)
              }
              style={{ minWidth: 120, width: "fit-content" }}
            />
          </div>
        );
      })}
    </div>
  );
};
