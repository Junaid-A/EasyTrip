type BuilderModeCardProps = {
  title: string;
  description: string;
  isActive?: boolean;
  helperText?: string;
  onClick?: () => void;
};

export function BuilderModeCard({
  title,
  description,
  isActive = false,
  helperText,
  onClick,
}: BuilderModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left shadow-sm transition ${
        isActive
          ? "border-black bg-black text-white"
          : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
      }`}
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p
        className={`mt-2 text-sm leading-6 ${
          isActive ? "text-white/80" : "text-neutral-600"
        }`}
      >
        {description}
      </p>
      {helperText ? (
        <p
          className={`mt-3 text-xs font-medium ${
            isActive ? "text-white/70" : "text-neutral-500"
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </button>
  );
}