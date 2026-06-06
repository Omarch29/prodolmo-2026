import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "info" | "danger";
export type ButtonSize = "md" | "sm";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-ink active:bg-primary-active hover:bg-primary-hover",
  secondary: "bg-line-white text-ink hover:bg-card-yellow",
  ghost: "bg-scoreboard-slate text-line-white hover:bg-grey-500",
  info: "bg-sky-blue text-line-white hover:brightness-110",
  danger: "bg-card-red text-line-white hover:bg-card-red-dark",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "text-[10px] px-[18px] py-[14px] shadow-pixel",
  sm: "text-[8px] px-3 py-[9px] shadow-pixel-xs",
};

/**
 * Clases del botón del design system pixel-art. Reutilizable por <button>
 * y por links (<Link>) que deben verse como botón.
 *
 * Estado "presionado": al hacer :active la sombra colapsa
 * (shadow-pixel-pressed) y el botón se traslada (3px,3px), como si se hundiera.
 */
export function buttonClassName({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-[10px] cursor-pointer select-none",
    "font-display uppercase tracking-[1.5px] border-pixel rounded-none",
    "transition-[transform,box-shadow,background] duration-[60ms]",
    "active:translate-x-[3px] active:translate-y-[3px] active:shadow-pixel-pressed",
    "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-ink",
    "disabled:border-disabled-border disabled:shadow-pixel disabled:translate-x-0 disabled:translate-y-0",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    block && "w-full",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClassName({ variant, size, block, className })} {...props} />
  );
}
