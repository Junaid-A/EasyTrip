type PackageLike = {
  id: string;
  title: string;
  basePrice: number;
  popularityScore?: number;
  marginScore?: number;
  budgetFitScore?: number;
  tripMoodFitScore?: number;
  recommendedLabel?: string;
};

export function getRecommendedPackages(packages: PackageLike[]): PackageLike[] {
  return [...packages]
    .sort((a, b) => {
      const scoreA =
        (a.popularityScore || 0) +
        (a.marginScore || 0) +
        (a.budgetFitScore || 0) +
        (a.tripMoodFitScore || 0);

      const scoreB =
        (b.popularityScore || 0) +
        (b.marginScore || 0) +
        (b.budgetFitScore || 0) +
        (b.tripMoodFitScore || 0);

      return scoreB - scoreA;
    })
    .slice(0, 6);
}

export function getPackageBadge(pkg: PackageLike): string {
  if (pkg.recommendedLabel) return pkg.recommendedLabel;

  if ((pkg.popularityScore || 0) >= 9) return "Most Booked";
  if ((pkg.budgetFitScore || 0) >= 9) return "Best Value";
  if ((pkg.tripMoodFitScore || 0) >= 9) return "Great Match for You";
  if ((pkg.marginScore || 0) >= 9) return "Top Pick";
  return "Popular Choice";
}

export function getRecommendationReason(pkg: PackageLike): string {
  if ((pkg.tripMoodFitScore || 0) >= 9) {
    return "This package strongly matches your selected trip mood.";
  }

  if ((pkg.budgetFitScore || 0) >= 9) {
    return "This package gives a strong balance of experience and value.";
  }

  if ((pkg.popularityScore || 0) >= 9) {
    return "Travelers choose this package often for its overall convenience.";
  }

  if ((pkg.marginScore || 0) >= 9) {
    return "This option includes premium value additions and smoother experience.";
  }

  return "This is a solid all-round option for your travel plan.";
}