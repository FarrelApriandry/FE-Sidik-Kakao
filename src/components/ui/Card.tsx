interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className = "", children }: Props) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-xs ${className}`}
    >
      {children}
    </div>
  );
}
