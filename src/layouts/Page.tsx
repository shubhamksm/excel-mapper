import { Button, ButtonProps } from "antd";

type PageControlButtonProps = Omit<
  ButtonProps & React.RefAttributes<HTMLButtonElement>,
  "style"
>;

export type PageProps = {
  title: string;
  mainContent: JSX.Element;
  previousLabel?: string;
  nextLabel?: string;
  nextButtonProps?: PageControlButtonProps;
  previousButtonProps?: PageControlButtonProps;
};

const Page = ({
  title,
  mainContent,
  nextLabel,
  nextButtonProps,
  previousLabel,
  previousButtonProps,
}: PageProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center gap-y-4">
      <h1 className="text-2xl">{title}</h1>
      <div className="flex-grow">{mainContent}</div>
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
