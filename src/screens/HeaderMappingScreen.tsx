import { Headers, MappedHeaders, StateAction, Template_Columns } from "@/types";
import { TEMPLATE_COLUMNS } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HeaderMappingScreenProps = {
  headers: Headers;
  setMappedHeaders: StateAction<MappedHeaders>;
};

const OptionsFromTemplateColumns = TEMPLATE_COLUMNS.map((column) => {
  return (
    <SelectItem key={column} value={column}>
      {column}
    </SelectItem>
  );
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
    <div className="flex w-2/3 mx-auto flex-col gap-y-4">
      {headers.map((header) => {
        return (
          <div
            className="flex justify-between items-center gap-x-4"
            key={header}
          >
            <h3>{header}</h3>
            <Select
              onValueChange={(value) =>
                handleChange(header, value as Template_Columns)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Add Mapping" />
              </SelectTrigger>
              <SelectContent>{OptionsFromTemplateColumns}</SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
};
