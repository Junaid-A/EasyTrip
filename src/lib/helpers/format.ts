export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  if (!startDate || !endDate) return "Dates to be selected";

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formattedStart = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const formattedEnd = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formattedStart} - ${formattedEnd}`;
}

export function formatTravelerCount(adults = 0, children = 0): string {
  const parts: string[] = [];

  if (adults > 0) {
    parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
  }

  if (children > 0) {
    parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
  }

  if (parts.length === 0) {
    return "No travelers selected";
  }

  return parts.join(", ");
}