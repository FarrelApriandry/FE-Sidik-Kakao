import MaterialIcon from "./MaterialIcon";

type ButtonVariant = "primary" | "secondary" | "amber";
type ButtonSize = "sm" | "md";

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200",
  amber:
    "bg-amber-600 hover:bg-amber-700 text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  onClick,
  className = "",
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <MaterialIcon name={icon} size={size === "sm" ? 14 : 18} />}
      {children}
    </button>
  );
}
