import Button from "../ui/Button";

interface Props {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaIcon?: string;
  onCtaClick?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  ctaLabel,
  ctaIcon = "add",
  onCtaClick,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      {ctaLabel && (
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" icon={ctaIcon} onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
