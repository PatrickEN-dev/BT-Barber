import { ReactNode } from "react";

interface IProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

const PageHeading = ({ title, description, eyebrow, action }: IProps) => (
  <header className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
    <div className="min-w-0">
      {eyebrow && (
        <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-semibold mb-1">
          {eyebrow}
        </p>
      )}
      <h1 className="text-lg font-bold leading-tight tracking-tight">{title}</h1>
      {description && (
        <p className="text-xs text-gray-400 mt-1 tabular-nums">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
);

export default PageHeading;
