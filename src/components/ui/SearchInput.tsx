import MaterialIcon from "./MaterialIcon";

interface Props {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder,
  value = "",
  onChange,
  className = "",
}: Props) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <MaterialIcon
        name="search"
        size={18}
        className="absolute left-3 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100 text-slate-800 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-all"
      />
    </div>
  );
}
