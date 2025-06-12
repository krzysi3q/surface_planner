import { classMerge } from "@/utils/classMerge";
import React from "react";

interface ToolbarButtonProps {
  onClick?: () => void;
  variant?: "default" | "danger"
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  wide?: boolean;
  style?: React.CSSProperties;
  iconRight?: boolean;
}

const getVariantStyles = (variant: ToolbarButtonProps['variant']) => {
  switch (variant) {
    case "default":
      return "bg-gray-100 text-gray-700 hover:text-black hover:bg-gray-200 active:bg-gray-300";
    case "danger":
      return "bg-gray-100 text-red-400 hover:text-red-800 hover:bg-gray-200 active:bg-gray-300";
    default:
      return "";
  }
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = (props) => {
  const { onClick, label, icon, disabled, variant = "default", active, wide, className, style, iconRight } = props;

  return (    
      <button className={classMerge(
        "rounded-md py-1.5 flex justify-center items-center cursor-pointer flex-row gap-1.5",
        label ? "px-5" : "px-1.5",
        getVariantStyles(variant),
        active ? "bg-gray-300" : "",
        disabled ? "cursor-default text-gray-400 bg-gray-100 hover:text-gray-400 hover:bg-gray-100 active:bg-gray-100" : "",
        wide ? "w-full" : "",
        className
      )}
      style={style}
      disabled={disabled}
      onClick={onClick}>{!iconRight && icon}{label && <span>{label}</span>}{iconRight && icon}</button>
  );
};