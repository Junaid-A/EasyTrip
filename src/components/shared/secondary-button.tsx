import Link from "next/link";

type SecondaryButtonProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
};

export function SecondaryButton({
  href,
  children,
  className = "",
}: SecondaryButtonProps) {
  const styles =
    `inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return <button className={styles}>{children}</button>;
}