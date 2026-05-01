import { ReactNode } from "react";

import Container from "@/app/_components/Container";

interface IProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

const PageHeading = ({ title, description, eyebrow, action }: IProps) => (
  <Container as="header" className="flex items-start justify-between gap-3 pb-4 pt-5 lg:pb-6 lg:pt-8">
    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground lg:text-xs lg:tracking-[0.18em] lg:text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="text-lg font-bold leading-tight tracking-tight lg:text-2xl xl:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground tabular-nums lg:text-sm">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </Container>
);

export default PageHeading;
