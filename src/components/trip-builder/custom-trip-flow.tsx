"use client";

import { useMemo } from "react";
import { hotels } from "@/data/hotels";
import { transfers } from "@/data/transfers";

type Props = {
  step: number;
  budget: string;
  hotelCategory: string;
  transferType: string;
  selectedSightseeing: string[];
  selectedExtras: string[];
  onHotelCategoryChange: (value: string) => void;
  onTransferTypeChange: (value: string) => void;
  onToggleSightseeing: (id: string) => void;
  onToggleExtra: (value: string) => void;
  onStepChange: (step: number) => void;
};

const steps = ["Stay", "Transfers", "Sightseeing", "Extras", "Review"];
const hotelCategories = ["3 Star", "4 Star", "5 Star"];
const transferOptions = ["Shared", "Private", "Premium Private"];

const sightseeingItems = [
  { id: "ss-001", title: "Safari World", category: "Family", duration: "Half day to full day", price: 2200 },
  { id: "ss-002", title: "Bangkok Temple & City Tour", category: "Classic", duration: "Half day", price: 1800 },
  { id: "ss-003", title: "Chaophraya Dinner Cruise", category: "Evening", duration: "Evening", price: 2600 },
  { id: "ss-004", title: "Shopping + Local Market Circuit", category: "Leisure", duration: "Flexible", price: 1400 },
  { id: "ss-005", title: "Floating Market Excursion", category: "Day tour", duration: "Morning heavy", price: 2400 },
  { id: "ss-006", title: "Nightlife Drop + Pickup Support", category: "Night", duration: "Night", price: 1900 },
];

const extraOptions = [
  "Breakfast included",
  "Indian meal support",
  "SIM card",
  "Travel insurance",
  "Early check-in",
  "Late check-out",
];

function normalizeTransferLabel(value: string) {
  if (value === "Premium Private") return "premium-private";
  if (value === "Private") return "private";
  return "shared";
}

export function CustomTripFlow(props: Props) {
  const activeStep = useMemo(() => Math.min(Math.max(props.step, 1), 5), [props.step]);

  const matchingHotels = useMemo(
    () =>
      hotels.filter(
        (hotel) =>
          hotel.destinationId === "dest-bangkok" &&
          hotel.category === props.hotelCategory &&
          hotel.isActive
      ),
    [props.hotelCategory]
  );

  const matchingTransfers = useMemo(() => {
    const type = normalizeTransferLabel(props.transferType);

    return transfers.filter(
      (item) =>
        item.destinationIds.includes("dest-bangkok") &&
        item.isActive &&
        item.serviceType === type
    );
  }, [props.transferType]);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {steps.map((stepLabel, index) => {
            const number = index + 1;
            const active = number === activeStep;

            return (
              <button
                key={stepLabel}
                type="button"
                onClick={() => props.onStepChange(number)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {number}. {stepLabel}
              </button>
            );
          })}
        </div>
      </div>

      {activeStep === 1 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-semibold tracking-tight text-slate-950">Choose your stay</p>
          <p className="mt-1 text-sm text-slate-600">
            Pick hotel comfort level first. Matching Bangkok hotels are previewed below.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hotelCategories.map((item) => {
              const active = props.hotelCategory === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => props.onHotelCategoryChange(item)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-sky-500 bg-sky-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-950">{item}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {matchingHotels.slice(0, 4).map((hotel) => (
              <div
                key={hotel.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{hotel.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {hotel.area} • {hotel.category}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {hotel.rating.toFixed(1)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  From ₹{hotel.nightlyRate.toLocaleString("en-IN")} / night
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeStep === 2 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-semibold tracking-tight text-slate-950">Choose transfers</p>
          <p className="mt-1 text-sm text-slate-600">
            Select movement style. Vehicle sizing is handled automatically.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {transferOptions.map((item) => {
              const active = props.transferType === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => props.onTransferTypeChange(item)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-sky-500 bg-sky-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-950">{item}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {matchingTransfers.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.vehicleClass} • {item.purpose}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeStep === 3 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-semibold tracking-tight text-slate-950">Add sightseeing</p>
          <p className="mt-1 text-sm text-slate-600">
            Choose activities you want to include.
          </p>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {sightseeingItems.map((item) => {
              const active = props.selectedSightseeing.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => props.onToggleSightseeing(item.id)}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    active
                      ? "border-sky-500 bg-sky-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {item.category}
                      </span>
                      <p className="mt-3 text-base font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.duration}</p>
                    </div>

                    <p className="text-sm font-semibold text-slate-950">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeStep === 4 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-semibold tracking-tight text-slate-950">Add useful extras</p>
          <p className="mt-1 text-sm text-slate-600">Choose the extras you want included.</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {extraOptions.map((item) => {
              const active = props.selectedExtras.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => props.onToggleExtra(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeStep === 5 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-semibold tracking-tight text-slate-950">
            Review your custom trip choices
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ReviewCard label="Budget" value={props.budget || "Not selected"} />
            <ReviewCard label="Hotel category" value={props.hotelCategory || "Not selected"} />
            <ReviewCard label="Transfers" value={props.transferType || "Not selected"} />
            <ReviewCard label="Sightseeing" value={`${props.selectedSightseeing.length} selected`} />
            <ReviewCard label="Extras" value={`${props.selectedExtras.length} selected`} />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => props.onStepChange(Math.max(1, activeStep - 1))}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => props.onStepChange(Math.min(5, activeStep + 1))}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {activeStep === 5 ? "Continue booking" : "Next step"}
        </button>
      </div>
    </div>
  );
}

function ReviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}