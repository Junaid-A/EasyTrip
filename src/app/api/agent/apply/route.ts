import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AgentApplyPayload = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  businessType?: string;
  specialization?: string;
  yearsExperience?: number | null;
  monthlyBookingVolume?: string;
  notes?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AgentApplyPayload;

    if (!body.companyName?.trim()) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    if (!body.contactPerson?.trim()) {
      return NextResponse.json({ error: "Contact person is required." }, { status: 400 });
    }

    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!body.phone?.trim()) {
      return NextResponse.json({ error: "Phone is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const email = normalizeEmail(body.email);

    const { data: existingApplication, error: applicationError } = await supabase
      .from("agent_applications")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (applicationError) {
      return NextResponse.json({ error: applicationError.message }, { status: 500 });
    }

    if (existingApplication?.status === "pending") {
      return NextResponse.json(
        { error: "An onboarding application with this email is already pending." },
        { status: 409 },
      );
    }

    const { data: existingAgent, error: agentError } = await supabase
      .from("agents")
      .select("id, email")
      .ilike("email", email)
      .maybeSingle();

    if (agentError) {
      return NextResponse.json({ error: agentError.message }, { status: 500 });
    }

    if (existingAgent) {
      return NextResponse.json(
        { error: "An approved agent account already exists for this email." },
        { status: 409 },
      );
    }

    const { error: insertError } = await supabase.from("agent_applications").insert({
      company_name: body.companyName.trim(),
      contact_person: body.contactPerson.trim(),
      email,
      phone: body.phone.trim(),
      city: body.city?.trim() || null,
      country: body.country?.trim() || null,
      business_type: body.businessType?.trim() || null,
      specialization: body.specialization?.trim() || null,
      years_experience:
        typeof body.yearsExperience === "number" && Number.isFinite(body.yearsExperience)
          ? body.yearsExperience
          : null,
      monthly_booking_volume: body.monthlyBookingVolume?.trim() || null,
      notes: body.notes?.trim() || null,
      status: "pending",
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Agent onboarding application submitted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}