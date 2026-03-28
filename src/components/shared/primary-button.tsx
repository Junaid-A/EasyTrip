import Link from "next/link";

type PrimaryButtonProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
};

export function PrimaryButton({
  href,
  children,
  className = "",
}: PrimaryButtonProps) {
  const styles =
    `inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-[0_10px_30px_rgba(37,99,235,0.22)] ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return <button className={styles}>{children}</button>;
}