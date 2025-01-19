import { Button, ButtonProps } from "@/components/ui/button";

type PageControlButtonProps = Omit<ButtonProps, "style">;

export type PageProps = {
  title: string;
  previousLabel?: string;
  nextLabel?: string;
  nextButtonProps?: PageControlButtonProps;
  previousButtonProps?: PageControlButtonProps;
  children: JSX.Element;
};

const Page = ({
  title,
  nextLabel,
  nextButtonProps,
  previousLabel,
  previousButtonProps,
  children,
}: PageProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center gap-y-4">
      <h1 className="text-2xl">{title}</h1>
      <div className="flex-grow h-full w-full overflow-auto">{children}</div>
      <div className="w-full">
        {previousLabel && (
          <Button style={{ float: "left" }} {...previousButtonProps}>
            {previousLabel}
          </Button>
        )}
        {nextLabel && (
          <Button style={{ float: "right" }} {...nextButtonProps}>
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Page;
