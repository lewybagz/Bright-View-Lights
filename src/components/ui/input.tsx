// components/ui/input.tsx
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils"; // Make sure this import path matches your project structure

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string; // Explicitly typing className in our interface
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputRef, ...props }, ref) => {
    return (
      <input
        {...props}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={(element) => {
          // Handle the regular ref
          if (typeof ref === "function") {
            ref(element);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current =
              element;
          }
          // Handle the input ref from react-hook-form
          if (typeof inputRef === "function") {
            inputRef(element);
          }
        }}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
