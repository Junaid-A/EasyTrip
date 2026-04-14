"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/shared/stat-card";
import { InfoPanel } from "@/components/shared/info-panel";

type PackageStatus = "Active" | "Draft" | "Review";
type MarginBand = "High" | "Medium" | "Low";

type PackageRow = {
  name: string;
  note: string;
  country: string;
  duration: string;
  category: string;
  margin: MarginBand;
  status: PackageStatus;
};

type CityData = {
  id: string;
  name: string;
  provinces: string[];
  hotels: string[];
  sightseeing: string[];
  transfers: string[];
  meals: string[];
};

type CountryData = {
  id: string;
  name: string;
  cities: CityData[];
};

type PackageForm = {
  packageName: string;
  shortDetails: string;
  countryId: string;
  cityId: string;
  province: string;
  hotel: string;
  days: string;
  nights: string;
  singlePassengerPrice: string;
  selectedSightseeing: string[];
  selectedTransfers: string[];
  selectedMeals: string[];
  coverImage: File | null;
  transferImage: File | null;
  sightseeingImages: File[];
  hotelImages: File[];
  mealImages: File[];
};

const countries: CountryData[] = [
  {
    id: "thailand",
    name: "Thailand",
    cities: [
      {
        id: "bangkok",
        name: "Bangkok",
        provinces: ["Sukhumvit", "Pratunam", "Silom", "Riverside"],
        hotels: ["Grande Centre Point", "The Berkeley", "Eastin Grand", "Amara Bangkok"],
        sightseeing: ["Safari World", "Chao Phraya Dinner Cruise", "Temple Tour", "Madame Tussauds"],
        transfers: ["Airport SIC Transfer", "Private Airport Sedan", "City Transfer Van"],
        meals: ["Indian Lunch", "Buffet Dinner", "Thai Veg Meal", "Premium Cruise Dinner"],
      },
      {
        id: "pattaya",
        name: "Pattaya",
        provinces: ["Central Pattaya", "North Pattaya", "Jomtien"],
        hotels: ["Holiday Inn Pattaya", "Siam@Siam", "A-One Pattaya"],
        sightseeing: ["Coral Island Tour", "Alcazar Show", "Nong Nooch Garden"],
        transfers: ["Bangkok to Pattaya", "Local Sedan", "Private Minivan"],
        meals: ["Indian Dinner", "Seafood Buffet", "Local Set Menu"],
      },
    ],
  },
  {
    id: "uae",
    name: "UAE",
    cities: [
      {
        id: "dubai",
        name: "Dubai",
        provinces: ["Deira", "Bur Dubai", "Downtown", "Marina"],
        hotels: ["Citymax Bur Dubai", "Carlton Dubai Creek", "Millennium Place"],
        sightseeing: ["Burj Khalifa", "Desert Safari", "Dhow Cruise", "Dubai Frame"],
        transfers: ["Airport Transfer", "Private SUV", "Marina Transfer"],
        meals: ["Indian Buffet", "BBQ Dinner", "Arabian Set Meal"],
      },
    ],
  },
];

const initialRows: PackageRow[] = [
  {
    name: "Bangkok Luxury Discovery",
    note: "Luxury stay, premium transfers, and curated sightseeing.",
    country: "Thailand",
    duration: "4D / 3N",
    category: "Luxury",
    margin: "High",
    status: "Active",
  },
  {
    name: "Pattaya Family Escape",
    note: "Family-friendly itinerary with island activity and transfers.",
    country: "Thailand",
    duration: "5D / 4N",
    category: "Family",
    margin: "Medium",
    status: "Review",
  },
  {
    name: "Dubai Smart Saver",
    note: "Affordable package designed for strong conversion.",
    country: "UAE",
    duration: "4D / 3N",
    category: "Budget",
    margin: "Low",
    status: "Draft",
  },
  {
    name: "Bangkok Premium Couple Retreat",
    note: "Romantic stay with dinner cruise and upgraded inclusions.",
    country: "Thailand",
    duration: "6D / 5N",
    category: "Couple",
    margin: "High",
    status: "Active",
  },
];

const initialForm = (countryList: CountryData[]): PackageForm => ({
  packageName: "",
  shortDetails: "",
  countryId: countryList[0]?.id ?? "",
  cityId: countryList[0]?.cities[0]?.id ?? "",
  province: "",
  hotel: "",
  days: "4",
  nights: "3",
  singlePassengerPrice: "",
  selectedSightseeing: [],
  selectedTransfers: [],
  selectedMeals: [],
  coverImage: null,
  transferImage: null,
  sightseeingImages: [],
  hotelImages: [],
  mealImages: [],
});

function marginClass(margin: MarginBand) {
  switch (margin) {
    case "High":
      return "bg-emerald-100 text-emerald-700";
    case "Medium":
      return "bg-amber-100 text-amber-700";
    case "Low":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function statusClass(status: PackageStatus) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Draft":
      return "bg-slate-100 text-slate-700";
    case "Review":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminPackagesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [packageRows, setPackageRows] = useState<PackageRow[]>(initialRows);
  const [form, setForm] = useState<PackageForm>(() => initialForm(countries));

  const selectedCountry = useMemo(() => {
    return countries.find((country) => country.id === form.countryId) ?? countries[0];
  }, [form.countryId]);

  const selectedCity = useMemo(() => {
    return (
      selectedCountry?.cities.find((city) => city.id === form.cityId) ??
      selectedCountry?.cities[0] ?? {
        id: "",
        name: "",
        provinces: [],
        hotels: [],
        sightseeing: [],
        transfers: [],
        meals: [],
      }
    );
  }, [form.cityId, selectedCountry]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return packageRows.filter((item) => {
      const matchesQuery =
        q.length === 0 ||
        item.name.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.duration.toLowerCase().includes(q);

      const matchesFilter =
        activeFilter === "All" ||
        item.status === activeFilter ||
        (activeFilter === "High Margin" && item.margin === "High");

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, packageRows, query]);

  const packageStats = useMemo(
    () => [
      {
        label: "Total Packages",
        value: String(packageRows.length),
        note: "All live, draft, and review packages",
      },
      {
        label: "Active Packages",
        value: String(packageRows.filter((item) => item.status === "Active").length),
        note: "Packages currently merchandised",
      },
      {
        label: "High Margin",
        value: String(packageRows.filter((item) => item.margin === "High").length),
        note: "Packages with strongest commercial spread",
      },
      {
        label: "Under Review",
        value: String(packageRows.filter((item) => item.status === "Review").length),
        note: "Needs validation before activation",
      },
    ],
    [packageRows]
  );

  function toggleMultiSelect(field: "selectedSightseeing" | "selectedTransfers" | "selectedMeals", value: string) {
    setForm((prev) => {
      const exists = prev[field].includes(value);

      return {
        ...prev,
        [field]: exists ? prev[field].filter((item) => item !== value) : [...prev[field], value],
      };
    });
  }

  function resetDependentSelections(nextCountryId: string, nextCityId?: string) {
    const nextCountry = countries.find((country) => country.id === nextCountryId) ?? countries[0];
    const resolvedCityId = nextCityId ?? nextCountry?.cities[0]?.id ?? "";

    setForm((prev) => ({
      ...prev,
      countryId: nextCountryId,
      cityId: resolvedCityId,
      province: "",
      hotel: "",
      selectedSightseeing: [],
      selectedTransfers: [],
      selectedMeals: [],
    }));
  }

  function handleSavePackage() {
    const countryName = selectedCountry?.name ?? "";
    const category =
      form.selectedSightseeing.length + form.selectedTransfers.length + form.selectedMeals.length >= 6
        ? "Premium"
        : "Standard";

    const nextRow: PackageRow = {
      name: form.packageName.trim() || "Untitled Package",
      note: form.shortDetails.trim() || "Package created from admin builder.",
      country: countryName,
      duration: `${form.days || "0"}D / ${form.nights || "0"}N`,
      category,
      margin: form.singlePassengerPrice ? "High" : "Medium",
      status: "Draft",
    };

    setPackageRows((prev) => [nextRow, ...prev]);
    setForm(initialForm(countries));
    setIsCreateOpen(false);
    setActiveFilter("All");
    setQuery("");
  }

  function handleFileChange(
    field: "coverImage" | "transferImage" | "sightseeingImages" | "hotelImages" | "mealImages",
    e: ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files) return;

    if (field === "coverImage" || field === "transferImage") {
      setForm((prev) => ({
        ...prev,
        [field]: files[0] ?? null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: Array.from(files),
    }));
  }

  return (
    <>
      <PortalShell
        title="Packages"
        subtitle="Standard packages, performance visibility, profitability, and recommendation priority."
        sidebar={<AdminSidebar />}
      >
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {packageStats.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} />
            ))}
          </section>

          <InfoPanel
            title="Package Performance"
            action={
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("All");
                  }}
                  className="rounded-full border border-[#d6dde8] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,122,24,0.22)] transition hover:translate-y-[-1px]"
                >
                  Create Package
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-[520px]">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search package, country, category, or duration"
                    className="w-full rounded-full border border-[#d6dde8] bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {["All", "Active", "Draft", "Review", "High Margin"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        filter === activeFilter
                          ? "bg-slate-950 text-white"
                          : "border border-[#d6dde8] bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-[#dfe6ee]">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-100/80">
                      <tr className="text-left text-sm text-slate-500">
                        <th className="px-5 py-4 font-medium">Package</th>
                        <th className="px-5 py-4 font-medium">Country</th>
                        <th className="px-5 py-4 font-medium">Duration</th>
                        <th className="px-5 py-4 font-medium">Category</th>
                        <th className="px-5 py-4 font-medium">Margin</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredRows.map((item) => (
                        <tr
                          key={`${item.name}-${item.country}-${item.duration}`}
                          className="border-t border-[#edf2f7] align-top text-sm text-slate-700"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-950">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.note}</p>
                          </td>
                          <td className="px-5 py-4">{item.country}</td>
                          <td className="px-5 py-4">{item.duration}</td>
                          <td className="px-5 py-4">{item.category}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${marginClass(
                                item.margin
                              )}`}
                            >
                              {item.margin}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button className="rounded-full border border-[#d6dde8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                                View
                              </button>
                              <button className="rounded-full border border-[#d6dde8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                            No packages matched your filters.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </InfoPanel>
        </div>
      </PortalShell>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]">
          <div className="flex h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[32px] border border-[#d8d0c2] bg-[#f8f5ef] shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#ddd4c8] bg-white/75 px-7 py-5">
              <div>
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-slate-950">Create Package</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure destination, inventory, pricing, and media in one clean flow.
                </p>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8dfe8] bg-white text-lg text-slate-700 transition hover:bg-slate-50"
              >
                ×
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-h-0 overflow-y-auto px-7 py-6">
                <div className="space-y-6">
                  <section className="rounded-[28px] border border-[#dde5ee] bg-white p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-slate-950">Package Basics</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Set the destination, stay structure, and base selling inputs.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Package Name</label>
                        <input
                          value={form.packageName}
                          onChange={(e) => setForm((prev) => ({ ...prev, packageName: e.target.value }))}
                          placeholder="Bangkok Luxury Discovery"
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Short Details</label>
                        <textarea
                          rows={3}
                          value={form.shortDetails}
                          onChange={(e) => setForm((prev) => ({ ...prev, shortDetails: e.target.value }))}
                          placeholder="Premium Bangkok package with luxury stay, curated sightseeing, transfers, and dining."
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
                        <select
                          value={form.countryId}
                          onChange={(e) => resetDependentSelections(e.target.value)}
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none"
                        >
                          {countries.map((country) => (
                            <option key={country.id} value={country.id}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                        <select
                          value={form.cityId}
                          onChange={(e) => resetDependentSelections(form.countryId, e.target.value)}
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none"
                        >
                          {selectedCountry?.cities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Province / Area</label>
                        <select
                          value={form.province}
                          onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none"
                        >
                          <option value="">Select province</option>
                          {selectedCity.provinces.map((province) => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Hotel</label>
                        <select
                          value={form.hotel}
                          onChange={(e) => setForm((prev) => ({ ...prev, hotel: e.target.value }))}
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none"
                        >
                          <option value="">Select hotel</option>
                          {selectedCity.hotels.map((hotel) => (
                            <option key={hotel} value={hotel}>
                              {hotel}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Days</label>
                        <input
                          type="number"
                          min={1}
                          value={form.days}
                          onChange={(e) => setForm((prev) => ({ ...prev, days: e.target.value }))}
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Nights</label>
                        <input
                          type="number"
                          min={0}
                          value={form.nights}
                          onChange={(e) => setForm((prev) => ({ ...prev, nights: e.target.value }))}
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Single Passenger Pricing
                        </label>
                        <input
                          value={form.singlePassengerPrice}
                          onChange={(e) => setForm((prev) => ({ ...prev, singlePassengerPrice: e.target.value }))}
                          placeholder="₹45,999"
                          className="w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-[#dde5ee] bg-white p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-slate-950">Package Inclusions</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Select sightseeing, transfers, and meals to fully control the package composition.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                      <div className="rounded-[20px] border border-[#e6edf5] bg-slate-50/80 p-4">
                        <p className="mb-3 text-sm font-semibold text-slate-900">Sightseeing</p>
                        <div className="space-y-2">
                          {selectedCity.sightseeing.map((item) => (
                            <label
                              key={item}
                              className="flex items-center gap-3 rounded-[14px] border border-transparent bg-white px-3 py-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={form.selectedSightseeing.includes(item)}
                                onChange={() => toggleMultiSelect("selectedSightseeing", item)}
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-[#e6edf5] bg-slate-50/80 p-4">
                        <p className="mb-3 text-sm font-semibold text-slate-900">Transfers</p>
                        <div className="space-y-2">
                          {selectedCity.transfers.map((item) => (
                            <label
                              key={item}
                              className="flex items-center gap-3 rounded-[14px] border border-transparent bg-white px-3 py-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={form.selectedTransfers.includes(item)}
                                onChange={() => toggleMultiSelect("selectedTransfers", item)}
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-[#e6edf5] bg-slate-50/80 p-4">
                        <p className="mb-3 text-sm font-semibold text-slate-900">Meals</p>
                        <div className="space-y-2">
                          {selectedCity.meals.map((item) => (
                            <label
                              key={item}
                              className="flex items-center gap-3 rounded-[14px] border border-transparent bg-white px-3 py-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={form.selectedMeals.includes(item)}
                                onChange={() => toggleMultiSelect("selectedMeals", item)}
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-[#dde5ee] bg-white p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-slate-950">Media Uploads</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Single cover image for package, single image for transfer, multi-image groups for sightseeing,
                        hotel, and meals.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[20px] border border-dashed border-[#d6dde8] bg-slate-50 p-4">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Package Cover Picture</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("coverImage", e)}
                          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffedd5] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#c2410c]"
                        />
                      </div>

                      <div className="rounded-[20px] border border-dashed border-[#d6dde8] bg-slate-50 p-4">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Transfer Picture</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("transferImage", e)}
                          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffedd5] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#c2410c]"
                        />
                      </div>

                      <div className="rounded-[20px] border border-dashed border-[#d6dde8] bg-slate-50 p-4">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Sightseeing Pictures</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileChange("sightseeingImages", e)}
                          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffedd5] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#c2410c]"
                        />
                      </div>

                      <div className="rounded-[20px] border border-dashed border-[#d6dde8] bg-slate-50 p-4">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Hotel Pictures</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileChange("hotelImages", e)}
                          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffedd5] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#c2410c]"
                        />
                      </div>

                      <div className="rounded-[20px] border border-dashed border-[#d6dde8] bg-slate-50 p-4 md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Meal Pictures</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileChange("mealImages", e)}
                          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffedd5] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#c2410c]"
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <aside className="min-h-0 border-l border-[#ddd4c8] bg-white/70 px-6 py-6">
                <div className="sticky top-0 space-y-5">
                  <div className="rounded-[24px] border border-[#e4ebf3] bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">Package Preview</p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Package</span>
                        <span className="text-right font-medium text-slate-900">
                          {form.packageName || "Untitled Package"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Country</span>
                        <span className="text-right font-medium text-slate-900">{selectedCountry?.name ?? "-"}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">City</span>
                        <span className="text-right font-medium text-slate-900">{selectedCity?.name ?? "-"}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Stay</span>
                        <span className="text-right font-medium text-slate-900">
                          {form.days}D / {form.nights}N
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Single Pax</span>
                        <span className="text-right font-medium text-slate-900">
                          {form.singlePassengerPrice || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#e4ebf3] bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">Selection Summary</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Sightseeing</span>
                        <span className="font-medium text-slate-900">{form.selectedSightseeing.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transfers</span>
                        <span className="font-medium text-slate-900">{form.selectedTransfers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meals</span>
                        <span className="font-medium text-slate-900">{form.selectedMeals.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cover Image</span>
                        <span className="font-medium text-slate-900">{form.coverImage ? "Added" : "Pending"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCreateOpen(false)}
                      className="flex-1 rounded-full border border-[#d6dde8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePackage}
                      className="flex-1 rounded-full bg-[#ff7a18] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,122,24,0.22)] transition hover:translate-y-[-1px]"
                    >
                      Save Package
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}