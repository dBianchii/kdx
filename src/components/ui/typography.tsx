import { cn } from "@ui/lib/utils";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

export function H1({ children, className }: HeadingProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className }: HeadingProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className }: HeadingProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className }: HeadingProps) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h4>
  );
}

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
export function P({ children, className }: ParagraphProps) {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>
  );
}

type BlockQuoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;
export function Blockquote({ children, className }: BlockQuoteProps) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
      {children}
    </blockquote>
  );
}

type ULProps = React.HTMLAttributes<HTMLUListElement>;
export function UL({ children, className }: ULProps) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}>
      {children}
    </ul>
  );
}

export function Lead({ children, className }: ParagraphProps) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)}>{children}</p>
  );
}

type DivProps = React.HTMLAttributes<HTMLDivElement>;
export function Large({ children, className }: DivProps) {
  return (
    <div className={cn("text-lg font-semibold", className)}>{children}</div>
  );
}

type SmallProps = React.HTMLAttributes<HTMLElement>;
export function Small({ children, className }: SmallProps) {
  return (
    <small className={cn("text-sm font-medium leading-none", className)}>
      {children}
    </small>
  );
}

export function Muted({ children, className }: ParagraphProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
