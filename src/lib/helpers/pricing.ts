import { transfers, type Transfer, type TransferPurpose } from "@/data/transfers";
import type { Hotel } from "@/data/hotels";

export type PricedItem = {
  id: string;
  price?: number;
  quantity?: number;
};

export type PassengerMix = {
  adults: number;
  children: number;
};

export function getTotalPassengers({ adults, children }: PassengerMix): number {
  return Math.max(0, adults) + Math.max(0, children);
}

export function calculateNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const diffMs = end.getTime() - start.getTime();
  const nights = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return nights > 0 ? nights : 0;
}

export function getRecommendedTransfer(params: {
  adults: number;
  children: number;
  purpose: TransferPurpose;
  destinationId?: string;
  preferPremium?: boolean;
}): Transfer | null {
  const totalPax = getTotalPassengers({
    adults: params.adults,
    children: params.children,
  });

  const destinationId = params.destinationId ?? "dest-bangkok";

  const matching = transfers.filter(
    (item) =>
      item.isActive &&
      item.purpose === params.purpose &&
      item.destinationIds.includes(destinationId) &&
      totalPax >= item.minPax &&
      totalPax <= item.maxPax
  );

  if (!matching.length) return null;

  if (params.preferPremium) {
    const premium = matching.find((item) => item.serviceType === "premium-private");
    if (premium) return premium;
  }

  const preferredOrder = ["private", "premium-private", "shared"];

  const sorted = [...matching].sort((a, b) => {
    const serviceScore =
      preferredOrder.indexOf(a.serviceType) - preferredOrder.indexOf(b.serviceType);

    if (serviceScore !== 0) return serviceScore;

    const vehicleOrder = ["sedan", "suv", "van", "mini-coach", "seat-in-coach"];
    return vehicleOrder.indexOf(a.vehicleClass) - vehicleOrder.indexOf(b.vehicleClass);
  });

  return sorted[0] ?? null;
}

export function calculateHotelTotal(params: {
  hotel: Hotel | null;
  nights: number;
  rooms: number;
}): number {
  if (!params.hotel || params.nights <= 0 || params.rooms <= 0) return 0;

  return params.hotel.nightlyRate * params.nights * params.rooms;
}

export function calculateHotelMargin(params: {
  hotel: Hotel | null;
  nights: number;
  rooms: number;
}): number {
  if (!params.hotel || params.nights <= 0 || params.rooms <= 0) return 0;

  return params.hotel.margin * params.nights * params.rooms;
}

export function calculateSightseeingTotal(
  selectedItems: Array<PricedItem>,
  passengerCount = 1
): number {
  return selectedItems.reduce((sum, item) => {
    const quantity = item.quantity ?? passengerCount;
    return sum + (item.price ?? 0) * quantity;
  }, 0);
}

export function calculateMealsTotal(
  selectedItems: Array<PricedItem>,
  passengerCount = 1
): number {
  return selectedItems.reduce((sum, item) => {
    const quantity = item.quantity ?? passengerCount;
    return sum + (item.price ?? 0) * quantity;
  }, 0);
}

export function calculateTransferTotal(params: {
  arrivalTransfer?: Transfer | null;
  departureTransfer?: Transfer | null;
  localTransfer?: Transfer | null;
}): number {
  return (
    (params.arrivalTransfer?.price ?? 0) +
    (params.departureTransfer?.price ?? 0) +
    (params.localTransfer?.price ?? 0)
  );
}

export function calculateTransferMargin(params: {
  arrivalTransfer?: Transfer | null;
  departureTransfer?: Transfer | null;
  localTransfer?: Transfer | null;
}): number {
  return (
    (params.arrivalTransfer?.margin ?? 0) +
    (params.departureTransfer?.margin ?? 0) +
    (params.localTransfer?.margin ?? 0)
  );
}

export function calculateBasePackagePrice(basePrice: number): number {
  return basePrice > 0 ? basePrice : 0;
}

export function calculateHotelDelta(delta: number): number {
  return delta > 0 ? delta : 0;
}

export function calculateGrandTotal(params: {
  basePrice?: number;
  hotelTotal?: number;
  hotelDelta?: number;
  transferTotal?: number;
  sightseeingTotal?: number;
  mealsTotal?: number;
  serviceFee?: number;
}): number {
  return (
    (params.basePrice ?? 0) +
    (params.hotelTotal ?? 0) +
    (params.hotelDelta ?? 0) +
    (params.transferTotal ?? 0) +
    (params.sightseeingTotal ?? 0) +
    (params.mealsTotal ?? 0) +
    (params.serviceFee ?? 0)
  );
}

export function calculateTripGrandTotal(params: {
  packageBasePrice?: number;
  hotel: Hotel | null;
  nights: number;
  rooms: number;
  arrivalTransfer?: Transfer | null;
  departureTransfer?: Transfer | null;
  localTransfer?: Transfer | null;
  sightseeingItems?: Array<PricedItem>;
  mealItems?: Array<PricedItem>;
  passengerCount: number;
  serviceFee?: number;
  includeStandaloneHotel?: boolean;
}): number {
  const hotelTotal = params.includeStandaloneHotel
    ? calculateHotelTotal({
        hotel: params.hotel,
        nights: params.nights,
        rooms: params.rooms,
      })
    : 0;

  const transferTotal = calculateTransferTotal({
    arrivalTransfer: params.arrivalTransfer,
    departureTransfer: params.departureTransfer,
    localTransfer: params.localTransfer,
  });

  const sightseeingTotal = calculateSightseeingTotal(
    params.sightseeingItems ?? [],
    params.passengerCount
  );

  const mealsTotal = calculateMealsTotal(params.mealItems ?? [], params.passengerCount);

  return calculateGrandTotal({
    basePrice: params.packageBasePrice ?? 0,
    hotelTotal,
    transferTotal,
    sightseeingTotal,
    mealsTotal,
    serviceFee: params.serviceFee ?? 0,
  });
}