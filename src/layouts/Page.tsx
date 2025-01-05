import { Button } from "antd";

export type PageProps = {
  title: string;
  content: JSX.Element;
  previousLabel?: string;
  nextLabel?: string;
  handlePreviousClick?: () => void;
  handleNextClick?: () => void;
};

const Page = ({ title, content, previousLabel, nextLabel }: PageProps) => {
  return (
    <div>
      <h1>{title}</h1>
      {content}
      <div className="flex space-between">
        {previousLabel && <Button type="primary">{previousLabel}</Button>}
        {nextLabel && <Button type="primary">{nextLabel}</Button>}
      </div>
    </div>
  );
};

export default Page;
