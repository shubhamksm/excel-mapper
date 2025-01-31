import { CircleOff } from "lucide-react";

export const EmptyCard = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-2">
      <CircleOff className="h-10 w-10 text-muted-foreground" />
      <p className="text-md text-muted-foreground">No data</p>
    </div>
  );
};
