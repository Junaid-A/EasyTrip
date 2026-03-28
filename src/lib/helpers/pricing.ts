export function calculateBasePackagePrice(basePrice: number): number {
  return basePrice || 0;
}

export function calculateHotelDelta(delta: number): number {
  return delta || 0;
}

export function calculateSightseeingTotal(
  selectedItems: Array<{ price?: number }>
): number {
  return selectedItems.reduce((sum, item) => sum + (item.price || 0), 0);
}

export function calculateMealsTotal(
  selectedItems: Array<{ price?: number }>
): number {
  return selectedItems.reduce((sum, item) => sum + (item.price || 0), 0);
}

export function calculateGrandTotal(params: {
  basePrice: number;
  hotelDelta?: number;
  transferDelta?: number;
  sightseeingTotal?: number;
  mealsTotal?: number;
}): number {
  return (
    (params.basePrice || 0) +
    (params.hotelDelta || 0) +
    (params.transferDelta || 0) +
    (params.sightseeingTotal || 0) +
    (params.mealsTotal || 0)
  );
}