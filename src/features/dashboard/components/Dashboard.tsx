import { EmptyCard } from "@/components/ui/emptycard";
import { MonthlyRunCard } from "./MonthlyRunCard";

const FutureCard = () => {
  return (
    <div className="col-span-4">
      <EmptyCard />
    </div>
  );
};

export const Dashboard = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <MonthlyRunCard />
        <FutureCard />
      </div>
    </div>
  );
};
