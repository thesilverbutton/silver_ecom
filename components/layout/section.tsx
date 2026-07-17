import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div";
}

function Section({ className, as: Tag = "section", children, ...props }: SectionProps) {
  return (
    <Tag className={cn("py-12 md:py-20", className)} {...props}>
      {children}
    </Tag>
  );
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

function Container({ className, size = "default", children, ...props }: ContainerProps) {
  const maxWidths = {
    narrow: "max-w-3xl",
    default: "max-w-[1280px]",
    wide: "max-w-[1536px]",
  };

  return (
    <div className={cn("mx-auto px-4 md:px-6 lg:px-8", maxWidths[size], className)} {...props}>
      {children}
    </div>
  );
}

export { Section, Container };
