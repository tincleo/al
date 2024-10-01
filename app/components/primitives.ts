import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    size: {
      xxs: "text-xl lg:text-2xl",
      xs: "text-2xl lg:text-3xl",
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl leading-9",
      lg: "text-4xl lg:text-6xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const titleStyles = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    size: {
      xxs: "text-xl",
      xs: "text-2xl",
      sm: "text-3xl",
      md: "text-4xl",
      lg: "text-5xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});