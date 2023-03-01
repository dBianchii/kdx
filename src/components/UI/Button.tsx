import { cva, type VariantProps } from "class-variance-authority";
import classNames from "classnames";
import type { ButtonHTMLAttributes } from "react";

const buttoncva = cva("rounded-md relative text-white font-medium", {
  variants: {
    intent: {
      primary: "bg-indigo-600 hover:bg-indigo-700",
      secondary: "bg-gray-600 hover:bg-gray-700",
      danger: "bg-red-500 hover:bg-red-600",
      skeleton: "animate-pulse bg-gray-200 rounded-full dark:bg-gray-700 w-16",
    },
    modifier: {
      outline:
        "bg-transparent border border-current shadow-[0_0_0_1px_currentColor]",
      plain: "shadow-none bg-transparent border-none px-2 py-1 text-sm",
    },
    size: {
      slim: "text-sm",
      medium: "text-sm",
      large: "text-base",
    },
    fullWidth: {
      true: "w-full",
    },
    disabled: {
      true: "bg-surfaceDisabled text-textDisabled",
    },
  },
  compoundVariants: [
    {
      modifier: "outline",
      intent: "danger",
      className: "text-destructive",
    },
    {
      modifier: "outline",
      intent: "primary",
      className: "text-primary",
    },
    {
      modifier: "plain",
      intent: "danger",
      className: "text-destructive",
    },
    {
      modifier: "plain",
      intent: "danger",
      className: "text-primary",
    },
    {
      modifier: undefined,
      size: "slim",
      className: "px-3 py-[3px]",
    },
    {
      modifier: "outline",
      size: "slim",
      className: "px-3 py-[3px]",
    },
    {
      modifier: undefined,
      size: "medium",
      className: "px-4 py-2",
    },
    {
      modifier: "outline",
      size: "medium",
      className: "px-4 py-2",
    },
    {
      modifier: undefined,
      size: "large",
      className: "px-6 py-3",
    },
    {
      modifier: "outline",
      size: "large",
      className: "px-6 py-3",
    },
    {
      disabled: true,
      intent: "primary",
      className: "border-borderDisabled",
    },
  ],
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttoncva> {
  children: React.ReactNode;
  loading?: boolean;
}

const Button = ({
  children,
  intent,
  modifier,
  size,
  fullWidth,
  disabled,
  loading,
  onClick,
  className,
}: ButtonProps) => {
  return (
    <>
      {intent == "skeleton" ? (
        <div className={buttoncva({ intent })}></div>
      ) : (
        <button
          className={`${buttoncva({
            intent,
            modifier,
            size,
            fullWidth,
            disabled,
          })} ${className ? className : ""}`}
          onClick={onClick}
        >
          <span
            className={classNames(
              "leading-[1.25rem]",
              loading && "text-transparent"
            )}
          >
            {children}
          </span>
          {loading && (
            <span className="absolute left-1/2 top-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2">
              <svg
                className="animate-spin"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="fill-current"
                  d="M7.229 1.173a9.25 9.25 0 1011.655 11.412 1.25 1.25 0 10-2.4-.698 6.75 6.75 0 11-8.506-8.329 1.25 1.25 0 10-.75-2.385z"
                ></path>
              </svg>
              <span className="sr-only">Loading</span>
            </span>
          )}
        </button>
      )}
    </>
  );
};

export default Button;
