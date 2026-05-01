import { cn } from "@/app/_lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide" | "full";
  as?: "div" | "section" | "main" | "article";
}

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[1500px]",
  full: "max-w-none",
};

const Container = ({
  size = "default",
  as: Tag = "div",
  className,
  children,
  ...props
}: ContainerProps) => (
  <Tag
    className={cn("mx-auto w-full px-5 lg:px-8", sizes[size], className)}
    {...props}
  >
    {children}
  </Tag>
);

export default Container;
