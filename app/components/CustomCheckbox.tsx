import React from "react";
import { Button, ButtonProps } from "@nextui-org/react";

export const CustomCheckbox = (
  props: ButtonProps & { isSelected?: boolean },
) => {
  return (
    <Button
      {...props}
      className={`
        m-0 
        bg-transparent
        border
        border-solid
        ${
          props.isSelected
            ? "border-blue-500 text-white"
            : "border-[#414142] text-[#A1A1AA]"
        } 
        cursor-pointer 
        rounded-full 
        px-2 
        py-0 
        text-sm 
        transition-colors
      `}
    >
      {props.children}
    </Button>
  );
};
