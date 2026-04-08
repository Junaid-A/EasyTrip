"use client";

import { useState } from "react";

type FormState = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  businessType: string;
  specialization: string;
  yearsExperience: string;
  monthlyBookingVolume: string;
  notes: string;
};

const initialState: FormState = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  city: "",
  country: "India",
  businessType: "",
  specialization: "",
  yearsExperience: "",
  monthlyBookingVolume: "",
  notes: "",
};

export default function AgentOnboardingPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/agent/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not submit onboarding form.");
        setSubmitting(false);
        return;
      }

      setSuccess("Application submitted. Admin review is pending.");
      setForm(initialState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-10 text-[#171717]">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">
            EasyTrip365
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Agent onboarding
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Submit your agency details. Once approved by admin, you will receive your login email
            and temporary password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Company name"
              value={form.companyName}
              onChange={(value) => updateField("companyName", value)}
              required
            />
            <Field
              label="Contact person"
              value={form.contactPerson}
              onChange={(value) => updateField("contactPerson", value)}
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
              required
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
              required
            />
            <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} />
            <Field
              label="Country"
              value={form.country}
              onChange={(value) => updateField("country", value)}
            />
            <Field
              label="Business type"
              value={form.businessType}
              onChange={(value) => updateField("businessType", value)}
            />
            <Field
              label="Specialization"
              value={form.specialization}
              onChange={(value) => updateField("specialization", value)}
            />
            <Field
              label="Years experience"
              type="number"
              value={form.yearsExperience}
              onChange={(value) => updateField("yearsExperience", value)}
            />
            <Field
              label="Monthly booking volume"
              value={form.monthlyBookingVolume}
              onChange={(value) => updateField("monthlyBookingVolume", value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={5}
              className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              placeholder="Tell us more about your travel business and package strengths."
            />
          </div>

          {error ? (
            <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#020826] px-6 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit onboarding"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-1 text-orange-500">*</span> : null}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
      />
    </div>
  );
}