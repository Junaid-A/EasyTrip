type StickyBottomCTAProps = {
  title: string;
  subtitle?: string;
  buttonLabel: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function StickyBottomCTA({
  title,
  subtitle,
  buttonLabel,
  onClick,
  disabled = false,
}: StickyBottomCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          {subtitle ? (
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="shrink-0 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}