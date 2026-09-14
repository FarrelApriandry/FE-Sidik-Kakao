interface Props {
  name: string;
  size?: number;
  className?: string;
}

export default function MaterialIcon({
  name,
  size = 20,
  className = "",
}: Props) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      {name}
    </span>
  );
}
