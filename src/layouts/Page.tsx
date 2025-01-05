import { Button, Flex } from "antd";

export type PageProps = {
  title: string;
  content: JSX.Element;
  previousLabel?: string;
  nextLabel?: string;
  handlePreviousClick?: () => void;
  handleNextClick?: () => void;
  type?: "default" | "link" | "text" | "primary" | "dashed";
  disabled?: boolean;
  loading?: boolean;
};

const Page = ({
  title,
  content,
  previousLabel,
  nextLabel,
  handleNextClick,
  handlePreviousClick,
  type,
  disabled,
  loading,
}: PageProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="mx-20 text-lg">{title}</h1>
      {content}
      <Flex gap="small" wrap>
        {previousLabel && (
          <Button
            style={{ marginRight: "auto" }}
            type={type}
            onClick={handlePreviousClick}
            disabled={disabled}
            loading={loading}
          >
            {previousLabel}
          </Button>
        )}
        {nextLabel && (
          <Button
            style={{ marginLeft: "auto" }}
            type={type}
            onClick={handleNextClick}
            disabled={disabled}
            loading={loading}
          >
            {nextLabel}
          </Button>
        )}
      </Flex>
    </div>
  );
};

export default Page;
