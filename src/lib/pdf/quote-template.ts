/* src/lib/pdf/quote-template.ts */

export type QuotePdfImage = {
  url: string;
  alt?: string;
};

export type QuotePdfCategorySelection = {
  category: string;
  selection: string;
  details?: string;
};

export type QuotePdfDay = {
  day: number;
  title: string;
  city?: string;
  description: string;
  hotel?: string;
  meals?: string[];
  transfers?: string;
  activities?: string[];
};

export type QuotePdfPriceLine = {
  label: string;
  amount: number;
};

export type QuotePdfData = {
  quoteRef: string;
  generatedAt: string;
  validUntil?: string;

  agent: {
    companyName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };

  customer: {
    name: string;
    destination: string;
    travelDates: string;
    travellers: string;
  };

  trip: {
    title: string;
    subtitle?: string;
    duration: string;
    hotelCategory?: string;
    flightIncluded?: boolean;
  };

  images?: {
    hero?: QuotePdfImage;
    gallery?: QuotePdfImage[];
  };

  selections?: QuotePdfCategorySelection[];
  itinerary: QuotePdfDay[];

  pricing: {
    lines: QuotePdfPriceLine[];
    total: number;
    currencySymbol?: string;
  };

  notes?: string;
  inclusions?: string[];
  exclusions?: string[];
  terms?: string[];
};

function escapeHtml(input: string | number | null | undefined): string {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMoney(amount: number, currencySymbol = "₹"): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${currencySymbol}${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(safe)}`;
}

function renderLogo(logoUrl?: string, companyName?: string) {
  if (logoUrl) {
    return `
      <div class="brand-logo-wrap">
        <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName || "Logo")}" class="brand-logo" />
      </div>
    `;
  }

  const initials =
    (companyName || "TR")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TR";

  return `
    <div class="brand-logo-fallback">${escapeHtml(initials)}</div>
  `;
}

function renderGallery(gallery?: QuotePdfImage[]) {
  if (!gallery || gallery.length === 0) return "";

  const items = gallery
    .slice(0, 3)
    .map(
      (img) => `
        <div class="gallery-card">
          <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || "Travel image")}" />
        </div>
      `,
    )
    .join("");

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Destination visuals</h2>
        <p>A quick visual feel of the journey.</p>
      </div>
      <div class="gallery-grid">
        ${items}
      </div>
    </section>
  `;
}

function renderSelections(selections?: QuotePdfCategorySelection[]) {
  if (!selections || selections.length === 0) return "";

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Selected experience categories</h2>
        <p>Everything chosen for this proposal, grouped cleanly.</p>
      </div>

      <div class="selection-grid">
        ${selections
          .map(
            (item) => `
              <div class="selection-card">
                <div class="selection-label">${escapeHtml(item.category)}</div>
                <div class="selection-value">${escapeHtml(item.selection)}</div>
                ${
                  item.details
                    ? `<div class="selection-details">${escapeHtml(item.details)}</div>`
                    : ""
                }
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderInclusionsExclusions(
  inclusions?: string[],
  exclusions?: string[],
) {
  if ((!inclusions || inclusions.length === 0) && (!exclusions || exclusions.length === 0)) {
    return "";
  }

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Inclusions & exclusions</h2>
        <p>Clear commercial scope for the quotation.</p>
      </div>

      <div class="two-col">
        <div class="scope-card">
          <div class="scope-title">Inclusions</div>
          ${
            inclusions && inclusions.length > 0
              ? `<ul class="scope-list">
                  ${inclusions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>`
              : `<div class="scope-empty">No inclusions listed.</div>`
          }
        </div>

        <div class="scope-card">
          <div class="scope-title">Exclusions</div>
          ${
            exclusions && exclusions.length > 0
              ? `<ul class="scope-list">
                  ${exclusions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>`
              : `<div class="scope-empty">No exclusions listed.</div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderItinerary(days: QuotePdfDay[]) {
  return `
    <section class="section">
      <div class="section-heading">
        <h2>Day-wise trip plan</h2>
        <p>Structured itinerary with category-level selections.</p>
      </div>

      <div class="day-list">
        ${days
          .map((day) => {
            const chips: string[] = [];

            if (day.city) chips.push(`<span class="chip">${escapeHtml(day.city)}</span>`);
            if (day.hotel) chips.push(`<span class="chip">Hotel: ${escapeHtml(day.hotel)}</span>`);
            if (day.transfers) chips.push(`<span class="chip">Transfer: ${escapeHtml(day.transfers)}</span>`);
            if (day.meals?.length) chips.push(`<span class="chip">Meals: ${escapeHtml(day.meals.join(", "))}</span>`);

            return `
              <article class="day-card">
                <div class="day-meta">
                  <div class="day-badge">Day ${escapeHtml(day.day)}</div>
                  <div class="day-title-wrap">
                    <h3>${escapeHtml(day.title)}</h3>
                    ${day.city ? `<div class="day-city">${escapeHtml(day.city)}</div>` : ""}
                  </div>
                </div>

                <p class="day-description">${escapeHtml(day.description)}</p>

                ${chips.length ? `<div class="chip-row">${chips.join("")}</div>` : ""}

                ${
                  day.activities?.length
                    ? `
                      <div class="activity-block">
                        <div class="activity-title">Activities</div>
                        <ul class="activity-list">
                          ${day.activities.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                        </ul>
                      </div>
                    `
                    : ""
                }
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderPricing(pricing: QuotePdfData["pricing"]) {
  const currencySymbol = pricing.currencySymbol || "₹";

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Pricing summary</h2>
        <p>Neat category-wise commercial breakup.</p>
      </div>

      <div class="pricing-card">
        <div class="pricing-lines">
          ${pricing.lines
            .map(
              (line) => `
                <div class="price-row">
                  <span>${escapeHtml(line.label)}</span>
                  <strong>${escapeHtml(formatMoney(line.amount, currencySymbol))}</strong>
                </div>
              `,
            )
            .join("")}
        </div>

        <div class="price-total">
          <span>Total price</span>
          <strong>${escapeHtml(formatMoney(pricing.total, currencySymbol))}</strong>
        </div>
      </div>
    </section>
  `;
}

function renderTerms(terms?: string[], notes?: string) {
  if ((!terms || terms.length === 0) && !notes) return "";

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Notes & terms</h2>
        <p>Commercial remarks and validity guidance.</p>
      </div>

      <div class="two-col">
        <div class="scope-card">
          <div class="scope-title">Important notes</div>
          ${
            notes
              ? `<p class="notes-copy">${escapeHtml(notes)}</p>`
              : `<div class="scope-empty">No notes added.</div>`
          }
        </div>

        <div class="scope-card">
          <div class="scope-title">Terms</div>
          ${
            terms && terms.length > 0
              ? `<ul class="scope-list">
                  ${terms.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>`
              : `<div class="scope-empty">No terms listed.</div>`
          }
        </div>
      </div>
    </section>
  `;
}

export function generateQuoteHtml(data: QuotePdfData): string {
  const primary = data.agent.primaryColor || "#f97316";
  const secondary = data.agent.secondaryColor || "#111827";
  const hero =
    data.images?.hero?.url ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

  return `
<!doctype html>
<html lang="en" data-scroll-behavior="smooth">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(data.quoteRef)} - Travel Proposal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --brand: ${escapeHtml(primary)};
      --ink: #111827;
      --muted: #6b7280;
      --line: #e5e7eb;
      --soft: #f8fafc;
      --card: #ffffff;
      --secondary: ${escapeHtml(secondary)};
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: #fff;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
    }

    .cover {
      position: relative;
      min-height: 760px;
      color: white;
      padding: 42px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(180deg, rgba(17,24,39,0.28) 0%, rgba(17,24,39,0.68) 100%),
        url("${escapeHtml(hero)}") center/cover no-repeat;
      page-break-after: always;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .brand-block {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 60%;
    }

    .brand-logo-wrap,
    .brand-logo-fallback {
      width: 58px;
      height: 58px;
      border-radius: 18px;
      overflow: hidden;
      background: rgba(255,255,255,0.14);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 0.06em;
      border: 1px solid rgba(255,255,255,0.18);
      flex: 0 0 auto;
    }

    .brand-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-text h1 {
      margin: 0;
      font-size: 24px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .brand-text p {
      margin: 6px 0 0;
      font-size: 12px;
      opacity: 0.92;
    }

    .quote-chip {
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.18);
      font-size: 12px;
      font-weight: 700;
      backdrop-filter: blur(12px);
      white-space: nowrap;
    }

    .hero-copy {
      max-width: 760px;
    }

    .eyebrow {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.18);
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 18px;
    }

    .hero-copy h2 {
      margin: 0;
      font-size: 54px;
      line-height: 1.02;
      letter-spacing: -0.04em;
    }

    .hero-copy .sub {
      margin: 18px 0 0;
      font-size: 18px;
      max-width: 620px;
      opacity: 0.95;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: 1.4fr 0.9fr;
      gap: 22px;
      align-items: end;
    }

    .glass-card {
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 28px;
      padding: 22px;
      backdrop-filter: blur(14px);
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .info-item .k {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.8;
      margin-bottom: 6px;
    }

    .info-item .v {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.3;
    }

    .summary-list {
      display: grid;
      gap: 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 14px;
      border-bottom: 1px dashed rgba(255,255,255,0.22);
      padding-bottom: 10px;
    }

    .summary-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .content {
      padding: 34px 34px 42px;
      background: #fff;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section-heading {
      margin-bottom: 16px;
    }

    .section-heading h2 {
      margin: 0 0 6px;
      font-size: 22px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .section-heading p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .gallery-card {
      border-radius: 22px;
      overflow: hidden;
      height: 165px;
      background: #f3f4f6;
      border: 1px solid var(--line);
    }

    .gallery-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .selection-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .selection-card,
    .scope-card,
    .pricing-card,
    .day-card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 24px;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.05);
    }

    .selection-card {
      padding: 18px;
    }

    .selection-label {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }

    .selection-value {
      font-size: 18px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .selection-details {
      margin-top: 8px;
      color: var(--muted);
      font-size: 13px;
    }

    .day-list {
      display: grid;
      gap: 14px;
    }

    .day-card {
      padding: 18px;
    }

    .day-meta {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 10px;
    }

    .day-badge {
      min-width: 82px;
      text-align: center;
      padding: 10px 12px;
      border-radius: 16px;
      background: rgba(249, 115, 22, 0.10);
      color: var(--brand);
      font-size: 13px;
      font-weight: 800;
    }

    .day-title-wrap h3 {
      margin: 0;
      font-size: 20px;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .day-city {
      margin-top: 4px;
      font-size: 13px;
      color: var(--muted);
    }

    .day-description {
      margin: 0 0 12px;
      font-size: 14px;
      color: #1f2937;
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 700;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
    }

    .activity-block {
      margin-top: 4px;
      background: #fbfdff;
      border: 1px dashed #dbeafe;
      border-radius: 18px;
      padding: 12px 14px;
    }

    .activity-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 6px;
      font-weight: 700;
    }

    .activity-list {
      margin: 0;
      padding-left: 18px;
      font-size: 14px;
    }

    .activity-list li + li {
      margin-top: 4px;
    }

    .pricing-card {
      padding: 20px;
    }

    .pricing-lines {
      display: grid;
      gap: 10px;
      margin-bottom: 14px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--line);
      font-size: 15px;
    }

    .price-total {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 18px 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(249,115,22,0.10), rgba(17,24,39,0.05));
      font-size: 18px;
      font-weight: 900;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .scope-card {
      padding: 18px;
    }

    .scope-title {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }

    .scope-list {
      margin: 0;
      padding-left: 18px;
      color: #334155;
      font-size: 14px;
    }

    .scope-list li + li {
      margin-top: 6px;
    }

    .scope-empty {
      color: var(--muted);
      font-size: 14px;
    }

    .notes-copy {
      margin: 0;
      color: #334155;
      font-size: 14px;
      white-space: pre-wrap;
    }

    .footer {
      margin-top: 22px;
      border-top: 1px solid var(--line);
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-start;
      font-size: 12px;
      color: var(--muted);
    }

    .footer strong {
      color: var(--secondary);
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .contact-lines div + div {
      margin-top: 3px;
    }

    @page {
      size: A4;
      margin: 18px;
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="cover">
      <div class="topbar">
        <div class="brand-block">
          ${renderLogo(data.agent.logoUrl, data.agent.companyName)}
          <div class="brand-text">
            <h1>${escapeHtml(data.agent.companyName)}</h1>
            <p>${escapeHtml(data.agent.contactPerson || "Travel Proposal")}</p>
          </div>
        </div>

        <div class="quote-chip">Quote Ref: ${escapeHtml(data.quoteRef)}</div>
      </div>

      <div class="hero-copy">
        <div class="eyebrow">White-label travel quotation</div>
        <h2>${escapeHtml(data.trip.title)}</h2>
        <p class="sub">
          ${escapeHtml(
            data.trip.subtitle ||
              `${data.customer.destination} • ${data.trip.duration} • premium itinerary and transparent pricing`,
          )}
        </p>
      </div>

      <div class="cover-grid">
        <div class="glass-card">
          <div class="info-grid">
            <div class="info-item">
              <div class="k">Customer</div>
              <div class="v">${escapeHtml(data.customer.name)}</div>
            </div>
            <div class="info-item">
              <div class="k">Destination</div>
              <div class="v">${escapeHtml(data.customer.destination)}</div>
            </div>
            <div class="info-item">
              <div class="k">Travel Dates</div>
              <div class="v">${escapeHtml(data.customer.travelDates)}</div>
            </div>
            <div class="info-item">
              <div class="k">Travellers</div>
              <div class="v">${escapeHtml(data.customer.travellers)}</div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <div class="summary-list">
            <div class="summary-row">
              <span>Duration</span>
              <strong>${escapeHtml(data.trip.duration)}</strong>
            </div>
            <div class="summary-row">
              <span>Hotel Category</span>
              <strong>${escapeHtml(data.trip.hotelCategory || "As selected")}</strong>
            </div>
            <div class="summary-row">
              <span>Flights</span>
              <strong>${data.trip.flightIncluded ? "Included" : "Excluded"}</strong>
            </div>
            <div class="summary-row">
              <span>Generated</span>
              <strong>${escapeHtml(data.generatedAt)}</strong>
            </div>
            ${
              data.validUntil
                ? `
                  <div class="summary-row">
                    <span>Validity</span>
                    <strong>${escapeHtml(data.validUntil)}</strong>
                  </div>
                `
                : ""
            }
          </div>
        </div>
      </div>
    </section>

    <section class="content">
      ${renderGallery(data.images?.gallery)}
      ${renderSelections(data.selections)}
      ${renderItinerary(data.itinerary)}
      ${renderPricing(data.pricing)}
      ${renderInclusionsExclusions(data.inclusions, data.exclusions)}
      ${renderTerms(data.terms, data.notes)}

      <footer class="footer">
        <div>
          <strong>${escapeHtml(data.agent.companyName)}</strong>
          <div>This proposal is prepared for customer review and trip discussion.</div>
        </div>

        <div class="contact-lines">
          ${
            data.agent.contactPerson
              ? `<div>${escapeHtml(data.agent.contactPerson)}</div>`
              : ""
          }
          ${data.agent.phone ? `<div>${escapeHtml(data.agent.phone)}</div>` : ""}
          ${data.agent.email ? `<div>${escapeHtml(data.agent.email)}</div>` : ""}
          ${data.agent.website ? `<div>${escapeHtml(data.agent.website)}</div>` : ""}
          ${data.agent.address ? `<div>${escapeHtml(data.agent.address)}</div>` : ""}
        </div>
      </footer>
    </section>
  </main>
</body>
</html>
  `;
}