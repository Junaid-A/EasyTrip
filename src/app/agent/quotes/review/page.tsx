"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  Loader2,
  MapPin,
  Receipt,
  Sparkles,
} from "lucide-react";

import { PortalShell } from "@/components/shared/portal-shell";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { useTripBuilderStore } from "@/store/useTripBuilderStore";
import { hotels } from "@/data/hotels";
import { transfers } from "@/data/transfers";
import { meals } from "@/data/meals";
import { sightseeing } from "@/data/sightseeing";

/* -------------------- helpers -------------------- */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/* -------------------- page -------------------- */

export default function AgentQuoteReviewPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* -------------------- NEW: customer form -------------------- */

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  /* -------------------- store -------------------- */

  const customTripDays = useTripBuilderStore((s) => s.customTripDays);
  const selectedPackagePrice = useTripBuilderStore((s) => s.selectedPackagePrice);

  const hotelTotal = useTripBuilderStore((s) => s.estimatedHotelTotal);
  const transferTotal = useTripBuilderStore((s) => s.estimatedTransferTotal);
  const sightseeingTotal = useTripBuilderStore((s) => s.estimatedSightseeingTotal);
  const mealsTotal = useTripBuilderStore((s) => s.estimatedMealsTotal);
  const serviceFee = useTripBuilderStore((s) => s.serviceFee);
  const grandTotal = useTripBuilderStore((s) => s.estimatedGrandTotal);

  const destination = useTripBuilderStore((s) => s.destination);
  const departureCity = useTripBuilderStore((s: any) => s.departureCity);
  const travelDates = useTripBuilderStore((s) => s.travelDates);
  const nights = useTripBuilderStore((s) => s.nights);
  const adults = useTripBuilderStore((s) => s.adults);
  const children = useTripBuilderStore((s) => s.children);
  const selectedFlightLabel = useTripBuilderStore((s) => s.selectedFlightLabel);

  /* -------------------- CREATE -------------------- */

  async function createQuote(status: "draft" | "pending") {
    setSubmitError("");

    if (!destination) {
      setSubmitError("Destination missing");
      return;
    }

    if (!customTripDays?.length) {
      setSubmitError("Itinerary missing");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/agent/quotes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          departureCity,
          travelDates,
          nights,
          adults: safeNumber(adults),
          children: safeNumber(children),
          selectedFlightLabel,
          customTripDays,

          pricing: {
            hotelTotal,
            transferTotal,
            sightseeingTotal,
            mealsTotal,
            serviceFee,
            grandTotal,
          },

          selectedPackagePrice,

          customerName,
          customerEmail,
          customerPhone,
          notes,

          status, // ✅ NEW
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result?.error || "Failed");
        return;
      }

      // ✅ FIXED REDIRECT
      router.push(`/agent/quotes/${result.quote.id}`);
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <PortalShell
      title="Quote Review"
      subtitle="Finalize and create quote"
      sidebar={<AgentSidebar />}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* LEFT */}
        <div className="space-y-6">

          <InfoPanel title="Customer Details">
            <div className="grid gap-4 md:grid-cols-2">

              <input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input"
              />

              <input
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input"
              />

              <input
                placeholder="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input"
              />

              <input
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
              />

            </div>
          </InfoPanel>

        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {submitError && (
            <div className="text-red-500 text-sm">{submitError}</div>
          )}

          <button
            onClick={() => createQuote("draft")}
            className="w-full border p-3 rounded-xl"
          >
            Save Draft
          </button>

          <button
            onClick={() => createQuote("pending")}
            disabled={isSubmitting}
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            {isSubmitting ? "Creating..." : "Create Quote"}
          </button>

        </div>

      </div>
    </PortalShell>
  );
}