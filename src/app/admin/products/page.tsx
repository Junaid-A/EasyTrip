"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CarFront,
  ChefHat,
  Globe2,
  Loader2,
  MapPinned,
  Mountain,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Ticket,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PortalShell } from "@/components/shared/portal-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { InfoPanel } from "@/components/shared/info-panel";
import { FilterBar } from "@/components/shared/filter-bar";
import { createClient } from "@/lib/supabase/client";

type EntityType =
  | "country"
  | "city"
  | "region"
  | "hotel"
  | "sightseeing"
  | "transfer"
  | "meal";

type CountryRow = {
  id: string;
  name: string;
  slug: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type CityRow = {
  id: string;
  country_id: string | null;
  name: string;
  is_primary: boolean | null;
  created_at: string | null;
};

type RegionRow = {
  id: string;
  city_id: string | null;
  name: string;
  type: string | null;
  created_at: string | null;
};

type HotelRow = {
  id: string;
  name: string;
  region_id: string | null;
  star_rating: number | null;
  description: string | null;
  amenities: string[] | null;
  images: string[] | null;
  base_cost: number | null;
  agent_price: number | null;
  customer_price: number | null;
  margin_value: number | null;
  margin_percent: number | null;
  tags: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
};

type SightseeingRow = {
  id: string;
  name: string;
  region_id: string | null;
  category: string | null;
  duration_hours: number | null;
  description: string | null;
  images: string[] | null;
  base_cost: number | null;
  agent_price: number | null;
  customer_price: number | null;
  tags: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
};

type TransferRow = {
  id: string;
  name: string | null;
  type: string | null;
  vehicle_type: string | null;
  capacity: number | null;
  region_id: string | null;
  base_cost: number | null;
  agent_price: number | null;
  customer_price: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

type MealRow = {
  id: string;
  name: string | null;
  type: string | null;
  cuisine: string | null;
  region_id: string | null;
  base_cost: number | null;
  agent_price: number | null;
  customer_price: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

type MediaAssetRow = {
  id: string;
  entity_type: string | null;
  entity_id: string | null;
  url: string | null;
  is_primary: boolean | null;
};

type ExplorerRow = {
  id: string;
  entityType: EntityType;
  name: string;
  subtitle: string;
  country: string;
  city: string;
  region: string;
  pricingLabel: string;
  status: "active" | "inactive";
  createdAt: string | null;
  canToggleActive: boolean;
  canManageMedia: boolean;
};

type CountryForm = {
  name: string;
  slug: string;
  is_active: boolean;
};

type CityForm = {
  country_id: string;
  name: string;
  is_primary: boolean;
};

type RegionForm = {
  city_id: string;
  name: string;
  type: string;
};

type HotelForm = {
  region_id: string;
  name: string;
  star_rating: string;
  description: string;
  amenities: string;
  base_cost: string;
  agent_price: string;
  customer_price: string;
  margin_value: string;
  margin_percent: string;
  tags: string;
  is_active: boolean;
};

type SightseeingForm = {
  region_id: string;
  name: string;
  category: string;
  duration_hours: string;
  description: string;
  base_cost: string;
  agent_price: string;
  customer_price: string;
  tags: string;
  is_active: boolean;
};

type TransferForm = {
  region_id: string;
  name: string;
  type: string;
  vehicle_type: string;
  capacity: string;
  base_cost: string;
  agent_price: string;
  customer_price: string;
  is_active: boolean;
};

type MealForm = {
  region_id: string;
  name: string;
  type: string;
  cuisine: string;
  base_cost: string;
  agent_price: string;
  customer_price: string;
  is_active: boolean;
};

const entityMeta: Record<
  EntityType,
  {
    label: string;
    shortLabel: string;
    icon: typeof Globe2;
    accent: string;
    description: string;
  }
> = {
  country: {
    label: "Countries",
    shortLabel: "Country",
    icon: Globe2,
    accent: "border-sky-200 bg-sky-50 text-sky-700",
    description: "Top-level destination market master.",
  },
  city: {
    label: "Cities",
    shortLabel: "City",
    icon: Building2,
    accent: "border-indigo-200 bg-indigo-50 text-indigo-700",
    description: "City-level destination mapping under countries.",
  },
  region: {
    label: "Provinces / Areas",
    shortLabel: "Province / Area",
    icon: MapPinned,
    accent: "border-violet-200 bg-violet-50 text-violet-700",
    description: "Operational locality layer under a city.",
  },
  hotel: {
    label: "Hotels",
    shortLabel: "Hotel",
    icon: Building2,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    description: "Stay inventory with pricing and margin structure.",
  },
  sightseeing: {
    label: "Sightseeing",
    shortLabel: "Sightseeing",
    icon: Ticket,
    accent: "border-amber-200 bg-amber-50 text-amber-700",
    description: "Tours, activities, tickets, and experiences.",
  },
  transfer: {
    label: "Transfers",
    shortLabel: "Transfer",
    icon: CarFront,
    accent: "border-orange-200 bg-orange-50 text-orange-700",
    description: "Vehicle and route-based movement inventory.",
  },
  meal: {
    label: "Meals",
    shortLabel: "Meal",
    icon: ChefHat,
    accent: "border-rose-200 bg-rose-50 text-rose-700",
    description: "Meal plans, restaurant inclusions, and dining.",
  },
};

function emptyCountryForm(): CountryForm {
  return { name: "", slug: "", is_active: true };
}
function emptyCityForm(): CityForm {
  return { country_id: "", name: "", is_primary: false };
}
function emptyRegionForm(): RegionForm {
  return { city_id: "", name: "", type: "" };
}
function emptyHotelForm(): HotelForm {
  return {
    region_id: "",
    name: "",
    star_rating: "",
    description: "",
    amenities: "",
    base_cost: "",
    agent_price: "",
    customer_price: "",
    margin_value: "",
    margin_percent: "",
    tags: "",
    is_active: true,
  };
}
function emptySightseeingForm(): SightseeingForm {
  return {
    region_id: "",
    name: "",
    category: "",
    duration_hours: "",
    description: "",
    base_cost: "",
    agent_price: "",
    customer_price: "",
    tags: "",
    is_active: true,
  };
}
function emptyTransferForm(): TransferForm {
  return {
    region_id: "",
    name: "",
    type: "",
    vehicle_type: "",
    capacity: "",
    base_cost: "",
    agent_price: "",
    customer_price: "",
    is_active: true,
  };
}
function emptyMealForm(): MealForm {
  return {
    region_id: "",
    name: "",
    type: "",
    cuisine: "",
    base_cost: "",
    agent_price: "",
    customer_price: "",
    is_active: true,
  };
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function inputClassName() {
  return "w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400";
}

function textareaClassName() {
  return "w-full rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400";
}

function panelCardClassName() {
  return "rounded-[24px] border border-[#e3e9f1] bg-white p-5";
}

function getStatusBadgeClasses(status: "active" | "inactive") {
  return status === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-700";
}

export default function AdminProductsPage() {
  const supabase = createClient();

  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [sightseeing, setSightseeing] = useState<SightseeingRow[]>([]);
  const [transfers, setTransfers] = useState<TransferRow[]>([]);
  const [meals, setMeals] = useState<MealRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rowActionId, setRowActionId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | EntityType>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedCountryId, setSelectedCountryId] = useState("all");
  const [selectedCityId, setSelectedCityId] = useState("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCreateType, setActiveCreateType] = useState<EntityType>("country");
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  const [countryForm, setCountryForm] = useState<CountryForm>(emptyCountryForm());
  const [cityForm, setCityForm] = useState<CityForm>(emptyCityForm());
  const [regionForm, setRegionForm] = useState<RegionForm>(emptyRegionForm());
  const [hotelForm, setHotelForm] = useState<HotelForm>(emptyHotelForm());
  const [sightseeingForm, setSightseeingForm] = useState<SightseeingForm>(emptySightseeingForm());
  const [transferForm, setTransferForm] = useState<TransferForm>(emptyTransferForm());
  const [mealForm, setMealForm] = useState<MealForm>(emptyMealForm());

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaEntityType, setMediaEntityType] = useState<EntityType | null>(null);
  const [mediaEntityId, setMediaEntityId] = useState<string | null>(null);
  const [mediaEntityName, setMediaEntityName] = useState("");
  const [mediaAssets, setMediaAssets] = useState<MediaAssetRow[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSubmitting, setMediaSubmitting] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState("");

  async function loadInventory(showRefreshing = false) {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    const [
      countriesRes,
      citiesRes,
      regionsRes,
      hotelsRes,
      sightseeingRes,
      transfersRes,
      mealsRes,
    ] = await Promise.all([
      supabase.from("countries").select("*").order("name", { ascending: true }),
      supabase.from("cities").select("*").order("name", { ascending: true }),
      supabase.from("regions").select("*").order("name", { ascending: true }),
      supabase.from("hotels").select("*").order("created_at", { ascending: false }),
      supabase.from("sightseeing").select("*").order("created_at", { ascending: false }),
      supabase.from("transfers").select("*").order("created_at", { ascending: false }),
      supabase.from("meals").select("*").order("created_at", { ascending: false }),
    ]);

    const firstError =
      countriesRes.error ||
      citiesRes.error ||
      regionsRes.error ||
      hotelsRes.error ||
      sightseeingRes.error ||
      transfersRes.error ||
      mealsRes.error;

    if (firstError) {
      setErrorMessage(firstError.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setCountries((countriesRes.data ?? []) as CountryRow[]);
    setCities((citiesRes.data ?? []) as CityRow[]);
    setRegions((regionsRes.data ?? []) as RegionRow[]);
    setHotels((hotelsRes.data ?? []) as HotelRow[]);
    setSightseeing((sightseeingRes.data ?? []) as SightseeingRow[]);
    setTransfers((transfersRes.data ?? []) as TransferRow[]);
    setMeals((mealsRes.data ?? []) as MealRow[]);

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (!editTargetId) {
      setCountryForm((prev) => ({ ...prev, slug: toSlug(prev.name) }));
    }
  }, [countryForm.name, editTargetId]);

  const countryById = useMemo(
    () => new Map(countries.map((item) => [item.id, item])),
    [countries]
  );

  const cityById = useMemo(() => new Map(cities.map((item) => [item.id, item])), [cities]);

  const regionById = useMemo(
    () => new Map(regions.map((item) => [item.id, item])),
    [regions]
  );

  const citiesFilteredForDropdown = useMemo(() => {
    if (selectedCountryId === "all") return cities;
    return cities.filter((city) => city.country_id === selectedCountryId);
  }, [cities, selectedCountryId]);

  const filteredRegionsForExplorer = useMemo(() => {
    return regions.filter((region) => {
      const city = region.city_id ? cityById.get(region.city_id) : null;
      if (!city) return selectedCountryId === "all" && selectedCityId === "all";
      if (selectedCountryId !== "all" && city.country_id !== selectedCountryId) return false;
      if (selectedCityId !== "all" && city.id !== selectedCityId) return false;
      return true;
    });
  }, [regions, cityById, selectedCountryId, selectedCityId]);

  const regionOptionsForInventory = useMemo(() => filteredRegionsForExplorer, [filteredRegionsForExplorer]);

  const statCards = useMemo(
    () => [
      { label: "Countries", value: countries.length.toString(), note: "Top-level inventory geography" },
      { label: "Cities", value: cities.length.toString(), note: "Destination city mapping" },
      { label: "Provinces / Areas", value: regions.length.toString(), note: "Operational locality structure" },
      {
        label: "Sellable Inventory",
        value: (hotels.length + sightseeing.length + transfers.length + meals.length).toString(),
        note: "Hotels, tours, transfers, and meals",
      },
    ],
    [countries.length, cities.length, regions.length, hotels.length, sightseeing.length, transfers.length, meals.length]
  );

  const coverageByCountry = useMemo(() => {
    return countries.map((country) => {
      const mappedCities = cities.filter((city) => city.country_id === country.id);
      const cityIds = new Set(mappedCities.map((city) => city.id));
      const mappedRegions = regions.filter((region) => region.city_id && cityIds.has(region.city_id));
      const regionIds = new Set(mappedRegions.map((region) => region.id));

      return {
        countryName: country.name,
        cities: mappedCities.length,
        regions: mappedRegions.length,
        hotels: hotels.filter((item) => item.region_id && regionIds.has(item.region_id)).length,
        sightseeing: sightseeing.filter((item) => item.region_id && regionIds.has(item.region_id)).length,
        transfers: transfers.filter((item) => item.region_id && regionIds.has(item.region_id)).length,
        meals: meals.filter((item) => item.region_id && regionIds.has(item.region_id)).length,
      };
    });
  }, [countries, cities, regions, hotels, sightseeing, transfers, meals]);

  const explorerRows = useMemo<ExplorerRow[]>(() => {
    const rows: ExplorerRow[] = [];

    countries.forEach((country) => {
      rows.push({
        id: country.id,
        entityType: "country",
        name: country.name,
        subtitle: country.slug ? `Slug: ${country.slug}` : "Country master",
        country: country.name,
        city: "—",
        region: "—",
        pricingLabel: "—",
        status: country.is_active === false ? "inactive" : "active",
        createdAt: country.created_at,
        canToggleActive: true,
        canManageMedia: false,
      });
    });

    cities.forEach((city) => {
      const country = city.country_id ? countryById.get(city.country_id) : null;
      rows.push({
        id: city.id,
        entityType: "city",
        name: city.name,
        subtitle: city.is_primary ? "Primary city" : "City master",
        country: country?.name ?? "—",
        city: city.name,
        region: "—",
        pricingLabel: "—",
        status: "active",
        createdAt: city.created_at,
        canToggleActive: false,
        canManageMedia: false,
      });
    });

    regions.forEach((region) => {
      const city = region.city_id ? cityById.get(region.city_id) : null;
      const country = city?.country_id ? countryById.get(city.country_id) : null;
      rows.push({
        id: region.id,
        entityType: "region",
        name: region.name,
        subtitle: region.type ? `Type: ${region.type}` : "Province / area",
        country: country?.name ?? "—",
        city: city?.name ?? "—",
        region: region.name,
        pricingLabel: "—",
        status: "active",
        createdAt: region.created_at,
        canToggleActive: false,
        canManageMedia: false,
      });
    });

    hotels.forEach((hotel) => {
      const region = hotel.region_id ? regionById.get(hotel.region_id) : null;
      const city = region?.city_id ? cityById.get(region.city_id) : null;
      const country = city?.country_id ? countryById.get(city.country_id) : null;
      rows.push({
        id: hotel.id,
        entityType: "hotel",
        name: hotel.name,
        subtitle: hotel.star_rating ? `${hotel.star_rating} Star Hotel` : "Hotel inventory",
        country: country?.name ?? "—",
        city: city?.name ?? "—",
        region: region?.name ?? "—",
        pricingLabel: `Cost ${formatCurrency(hotel.base_cost)} · Sell ${formatCurrency(hotel.customer_price)}`,
        status: hotel.is_active === false ? "inactive" : "active",
        createdAt: hotel.created_at,
        canToggleActive: true,
        canManageMedia: true,
      });
    });

    sightseeing.forEach((item) => {
      const region = item.region_id ? regionById.get(item.region_id) : null;
      const city = region?.city_id ? cityById.get(region.city_id) : null;
      const country = city?.country_id ? countryById.get(city.country_id) : null;
      rows.push({
        id: item.id,
        entityType: "sightseeing",
        name: item.name,
        subtitle:
          [item.category, item.duration_hours ? `${item.duration_hours} hrs` : null]
            .filter(Boolean)
            .join(" · ") || "Sightseeing inventory",
        country: country?.name ?? "—",
        city: city?.name ?? "—",
        region: region?.name ?? "—",
        pricingLabel: `Cost ${formatCurrency(item.base_cost)} · Sell ${formatCurrency(item.customer_price)}`,
        status: item.is_active === false ? "inactive" : "active",
        createdAt: item.created_at,
        canToggleActive: true,
        canManageMedia: true,
      });
    });

    transfers.forEach((item) => {
      const region = item.region_id ? regionById.get(item.region_id) : null;
      const city = region?.city_id ? cityById.get(region.city_id) : null;
      const country = city?.country_id ? countryById.get(city.country_id) : null;
      rows.push({
        id: item.id,
        entityType: "transfer",
        name: item.name || "Untitled transfer",
        subtitle:
          [item.type, item.vehicle_type, item.capacity ? `${item.capacity} pax` : null]
            .filter(Boolean)
            .join(" · ") || "Transfer inventory",
        country: country?.name ?? "—",
        city: city?.name ?? "—",
        region: region?.name ?? "—",
        pricingLabel: `Cost ${formatCurrency(item.base_cost)} · Sell ${formatCurrency(item.customer_price)}`,
        status: item.is_active === false ? "inactive" : "active",
        createdAt: item.created_at,
        canToggleActive: true,
        canManageMedia: true,
      });
    });

    meals.forEach((item) => {
      const region = item.region_id ? regionById.get(item.region_id) : null;
      const city = region?.city_id ? cityById.get(region.city_id) : null;
      const country = city?.country_id ? countryById.get(city.country_id) : null;
      rows.push({
        id: item.id,
        entityType: "meal",
        name: item.name || "Untitled meal",
        subtitle: [item.type, item.cuisine].filter(Boolean).join(" · ") || "Meal inventory",
        country: country?.name ?? "—",
        city: city?.name ?? "—",
        region: region?.name ?? "—",
        pricingLabel: `Cost ${formatCurrency(item.base_cost)} · Sell ${formatCurrency(item.customer_price)}`,
        status: item.is_active === false ? "inactive" : "active",
        createdAt: item.created_at,
        canToggleActive: true,
        canManageMedia: true,
      });
    });

    return rows.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [countries, cities, regions, hotels, sightseeing, transfers, meals, countryById, cityById, regionById]);

  const filteredExplorerRows = useMemo(() => {
    return explorerRows.filter((row) => {
      if (selectedType !== "all" && row.entityType !== selectedType) return false;
      if (selectedStatus !== "all" && row.status !== selectedStatus) return false;

      if (selectedCountryId !== "all") {
        const countryName = countryById.get(selectedCountryId)?.name ?? "";
        if (row.country !== countryName) return false;
      }

      if (selectedCityId !== "all") {
        const cityName = cityById.get(selectedCityId)?.name ?? "";
        if (row.city !== cityName) return false;
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = [
          row.name,
          row.subtitle,
          row.country,
          row.city,
          row.region,
          row.pricingLabel,
          entityMeta[row.entityType].label,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [explorerRows, selectedType, selectedStatus, selectedCountryId, selectedCityId, search, countryById, cityById]);

  function resetCreateForms() {
    setCountryForm(emptyCountryForm());
    setCityForm(emptyCityForm());
    setRegionForm(emptyRegionForm());
    setHotelForm(emptyHotelForm());
    setSightseeingForm(emptySightseeingForm());
    setTransferForm(emptyTransferForm());
    setMealForm(emptyMealForm());
  }

  function closeCreateModal() {
    if (submitting) return;
    setIsCreateOpen(false);
    setEditTargetId(null);
    resetCreateForms();
  }

  function openCreateModal(type: EntityType) {
    setSuccessMessage("");
    setErrorMessage("");
    setEditTargetId(null);
    resetCreateForms();
    setActiveCreateType(type);
    setIsCreateOpen(true);
  }

  function openEditModal(row: ExplorerRow) {
    setErrorMessage("");
    setSuccessMessage("");
    setActiveCreateType(row.entityType);
    setEditTargetId(row.id);

    if (row.entityType === "country") {
      const item = countries.find((entry) => entry.id === row.id);
      if (!item) return;
      setCountryForm({
        name: item.name,
        slug: item.slug ?? "",
        is_active: item.is_active !== false,
      });
    }

    if (row.entityType === "city") {
      const item = cities.find((entry) => entry.id === row.id);
      if (!item) return;
      setCityForm({
        country_id: item.country_id ?? "",
        name: item.name,
        is_primary: item.is_primary === true,
      });
    }

    if (row.entityType === "region") {
      const item = regions.find((entry) => entry.id === row.id);
      if (!item) return;
      setRegionForm({
        city_id: item.city_id ?? "",
        name: item.name,
        type: item.type ?? "",
      });
    }

    if (row.entityType === "hotel") {
      const item = hotels.find((entry) => entry.id === row.id);
      if (!item) return;
      setHotelForm({
        region_id: item.region_id ?? "",
        name: item.name,
        star_rating: item.star_rating?.toString() ?? "",
        description: item.description ?? "",
        amenities: (item.amenities ?? []).join(", "),
        base_cost: item.base_cost?.toString() ?? "",
        agent_price: item.agent_price?.toString() ?? "",
        customer_price: item.customer_price?.toString() ?? "",
        margin_value: item.margin_value?.toString() ?? "",
        margin_percent: item.margin_percent?.toString() ?? "",
        tags: (item.tags ?? []).join(", "),
        is_active: item.is_active !== false,
      });
    }

    if (row.entityType === "sightseeing") {
      const item = sightseeing.find((entry) => entry.id === row.id);
      if (!item) return;
      setSightseeingForm({
        region_id: item.region_id ?? "",
        name: item.name,
        category: item.category ?? "",
        duration_hours: item.duration_hours?.toString() ?? "",
        description: item.description ?? "",
        base_cost: item.base_cost?.toString() ?? "",
        agent_price: item.agent_price?.toString() ?? "",
        customer_price: item.customer_price?.toString() ?? "",
        tags: (item.tags ?? []).join(", "),
        is_active: item.is_active !== false,
      });
    }

    if (row.entityType === "transfer") {
      const item = transfers.find((entry) => entry.id === row.id);
      if (!item) return;
      setTransferForm({
        region_id: item.region_id ?? "",
        name: item.name ?? "",
        type: item.type ?? "",
        vehicle_type: item.vehicle_type ?? "",
        capacity: item.capacity?.toString() ?? "",
        base_cost: item.base_cost?.toString() ?? "",
        agent_price: item.agent_price?.toString() ?? "",
        customer_price: item.customer_price?.toString() ?? "",
        is_active: item.is_active !== false,
      });
    }

    if (row.entityType === "meal") {
      const item = meals.find((entry) => entry.id === row.id);
      if (!item) return;
      setMealForm({
        region_id: item.region_id ?? "",
        name: item.name ?? "",
        type: item.type ?? "",
        cuisine: item.cuisine ?? "",
        base_cost: item.base_cost?.toString() ?? "",
        agent_price: item.agent_price?.toString() ?? "",
        customer_price: item.customer_price?.toString() ?? "",
        is_active: item.is_active !== false,
      });
    }

    setIsCreateOpen(true);
  }

  async function handleCreateOrEditSubmit() {
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (activeCreateType === "country") {
        if (!countryForm.name.trim()) {
          throw new Error("Country name is required.");
        }

        const payload = {
          name: countryForm.name.trim(),
          slug: countryForm.slug.trim() || toSlug(countryForm.name),
          is_active: countryForm.is_active,
        };

        const query = editTargetId
          ? supabase.from("countries").update(payload).eq("id", editTargetId)
          : supabase.from("countries").insert(payload);

        const { error } = await query;
        if (error) throw error;

        setSuccessMessage(editTargetId ? "Country updated successfully." : "Country created successfully.");
      }

      if (activeCreateType === "city") {
        if (!cityForm.country_id) throw new Error("Country is required for city.");
        if (!cityForm.name.trim()) throw new Error("City name is required.");

        const payload = {
          country_id: cityForm.country_id,
          name: cityForm.name.trim(),
          is_primary: cityForm.is_primary,
        };

        const query = editTargetId
          ? supabase.from("cities").update(payload).eq("id", editTargetId)
          : supabase.from("cities").insert(payload);

        const { error } = await query;
        if (error) throw error;

        setSuccessMessage(editTargetId ? "City updated successfully." : "City created successfully.");
      }

      if (activeCreateType === "region") {
        if (!regionForm.city_id) throw new Error("City is required for province / area.");
        if (!regionForm.name.trim()) throw new Error("Province / area name is required.");

        const payload = {
          city_id: regionForm.city_id,
          name: regionForm.name.trim(),
          type: regionForm.type.trim() || null,
        };

        const query = editTargetId
          ? supabase.from("regions").update(payload).eq("id", editTargetId)
          : supabase.from("regions").insert(payload);

        const { error } = await query;
        if (error) throw error;

        setSuccessMessage(editTargetId ? "Province / area updated successfully." : "Province / area created successfully.");
      }

      if (activeCreateType === "hotel") {
        if (!hotelForm.region_id) throw new Error("Province / area is required for hotel.");
        if (!hotelForm.name.trim()) throw new Error("Hotel name is required.");

        const payload = {
          region_id: hotelForm.region_id,
          name: hotelForm.name.trim(),
          star_rating: toNumberOrNull(hotelForm.star_rating),
          description: hotelForm.description.trim() || null,
          amenities: parseCommaList(hotelForm.amenities),
          base_cost: toNumberOrNull(hotelForm.base_cost),
          agent_price: toNumberOrNull(hotelForm.agent_price),
          customer_price: toNumberOrNull(hotelForm.customer_price),
          margin_value: toNumberOrNull(hotelForm.margin_value),
          margin_percent: toNumberOrNull(hotelForm.margin_percent),
          tags: parseCommaList(hotelForm.tags),
          is_active: hotelForm.is_active,
        };

        const query = editTargetId
          ? supabase.from("hotels").update(payload).eq("id", editTargetId)
          : supabase.from("hotels").insert(payload);

        const { error } = await query;
        if (error) throw error;

        setSuccessMessage(editTargetId ? "Hotel updated successfully." : "Hotel created successfully.");
      }

      if (activeCreateType === "sightseeing") {
        if (!sightseeingForm.region_id) throw new Error("Province / area is required for sightseeing.");
        if (!sightseeingForm.name.trim()) throw new Error("Sightseeing name is required.");

        const payload = {
          region_id: sightseeingForm.region_id,
          name: sightseeingForm.name.trim(),
          category: sightseeingForm.category.trim() || null,
          duration_hours: toNumberOrNull(sightseeingForm.duration_hours),
          description: sightseeingForm.description.trim() || null,
          base_cost: toNumberOrNull(sightseeingForm.base_cost),
          agent_price: toNumberOrNull(sightseeingForm.agent_price),
          customer_price: toNumberOrNull(sightseeingForm.customer_price),
          tags: parseCommaList(sightseeingForm.tags),
          is_active: sightseeingForm.is_active,
        };

        const query = editTargetId
          ? supabase.from("sightseeing").update(payload).eq("id", editTargetId)
          : supabase.from("sightseeing").insert(payload);

        const { error } = await query;
        if (error) throw error;

        setSuccessMessage(editTargetId ? "Sightseeing updated successfully." : "Sightseeing created successfully.");
      }

      if (activeCreateType === "transfer") {
        if (!transferForm.region_id) throw new Error("Province / area is required for transfer.");
        if (!transferForm.name.trim()) throw new Error("Transfer name is required.");

        const payload = {
          region_id: transferForm.region_id,
          name: transferForm.name.trim(),
          type: transferForm.type.trim() || null,
          vehicle_type: transferForm.vehicle_type.trim() || null,
          capacity: toNumberOrNull(transferForm.capacity),
          base_cost: toNumberOrNull(transferForm.base_cost),
          agent_price: toNumberOrNull(transferForm.agent_price),
          customer_price: toNumberOrNull(transferForm.customer_price),
          is_active: transferForm.is_active,
        };

        const query = editTargetId
          ? supabase.from("transfers").update(payload).eq("id", editTargetId)
          : supabase.from("transfers").insert(payload);

        const { error } = await query;
        if (error) throw error;

        setSuccessMessage(editTargetId ? "Transfer updated successfully." : "Transfer created successfully.");
      }

      if (activeCreateType === "meal") {
        if (!mealForm.region_id) throw new Error("Province / area is required for meal.");
        if (!mealForm.name.trim()) throw new Error("Meal name is required.");

        const payload = {
          region_id: mealForm.region_id,
          name: mealForm.name.trim(),
          type: mealForm.type.trim() || null,
          cuisine: mealForm.cuisine.trim() || null,
          base_cost: toNumberOrNull(mealForm.base_cost),
          agent_price: toNumberOrNull(mealForm.agent_price),
          customer_price: toNumberOrNull(mealForm.customer_price),
          is_active: mealForm.is_active,
        };

        const query = editTargetId
          ? supabase.from("meals").update(payload).eq("id", editTargetId)
          : supabase.from("meals").insert(payload);

        const { error } = await query;
        if (error) throw error;

        setSuccessMessage(editTargetId ? "Meal updated successfully." : "Meal created successfully.");
      }

      await loadInventory(true);
      closeCreateModal();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save record.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(row: ExplorerRow) {
    if (!row.canToggleActive) return;

    setRowActionId(`${row.entityType}-${row.id}`);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const nextValue = row.status !== "active";
      let error: { message: string } | null = null;

      if (row.entityType === "country") {
        const response = await supabase.from("countries").update({ is_active: nextValue }).eq("id", row.id);
        error = response.error;
      }
      if (row.entityType === "hotel") {
        const response = await supabase.from("hotels").update({ is_active: nextValue }).eq("id", row.id);
        error = response.error;
      }
      if (row.entityType === "sightseeing") {
        const response = await supabase.from("sightseeing").update({ is_active: nextValue }).eq("id", row.id);
        error = response.error;
      }
      if (row.entityType === "transfer") {
        const response = await supabase.from("transfers").update({ is_active: nextValue }).eq("id", row.id);
        error = response.error;
      }
      if (row.entityType === "meal") {
        const response = await supabase.from("meals").update({ is_active: nextValue }).eq("id", row.id);
        error = response.error;
      }

      if (error) throw new Error(error.message);

      setSuccessMessage(
        `${entityMeta[row.entityType].shortLabel} ${nextValue ? "activated" : "deactivated"} successfully.`
      );
      await loadInventory(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update status.");
    } finally {
      setRowActionId(null);
    }
  }

  async function handleDelete(row: ExplorerRow) {
    const confirmed = window.confirm(`Delete ${entityMeta[row.entityType].shortLabel}: "${row.name}"?`);
    if (!confirmed) return;

    setRowActionId(`${row.entityType}-${row.id}`);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (row.entityType === "country") {
        const childCities = cities.filter((item) => item.country_id === row.id).length;
        if (childCities > 0) {
          throw new Error("Cannot delete country because cities exist under it.");
        }

        const { error } = await supabase.from("countries").delete().eq("id", row.id);
        if (error) throw error;
      }

      if (row.entityType === "city") {
        const childRegions = regions.filter((item) => item.city_id === row.id).length;
        if (childRegions > 0) {
          throw new Error("Cannot delete city because provinces / areas exist under it.");
        }

        const { error } = await supabase.from("cities").delete().eq("id", row.id);
        if (error) throw error;
      }

      if (row.entityType === "region") {
        const hotelCount = hotels.filter((item) => item.region_id === row.id).length;
        const sightseeingCount = sightseeing.filter((item) => item.region_id === row.id).length;
        const transferCount = transfers.filter((item) => item.region_id === row.id).length;
        const mealCount = meals.filter((item) => item.region_id === row.id).length;

        if (hotelCount + sightseeingCount + transferCount + mealCount > 0) {
          throw new Error("Cannot delete province / area because mapped inventory exists under it.");
        }

        const { error } = await supabase.from("regions").delete().eq("id", row.id);
        if (error) throw error;
      }

      if (row.entityType === "hotel") {
        await supabase.from("media_assets").delete().eq("entity_type", "hotel").eq("entity_id", row.id);
        const { error } = await supabase.from("hotels").delete().eq("id", row.id);
        if (error) throw error;
      }

      if (row.entityType === "sightseeing") {
        await supabase.from("media_assets").delete().eq("entity_type", "sightseeing").eq("entity_id", row.id);
        const { error } = await supabase.from("sightseeing").delete().eq("id", row.id);
        if (error) throw error;
      }

      if (row.entityType === "transfer") {
        await supabase.from("media_assets").delete().eq("entity_type", "transfer").eq("entity_id", row.id);
        const { error } = await supabase.from("transfers").delete().eq("id", row.id);
        if (error) throw error;
      }

      if (row.entityType === "meal") {
        await supabase.from("media_assets").delete().eq("entity_type", "meal").eq("entity_id", row.id);
        const { error } = await supabase.from("meals").delete().eq("id", row.id);
        if (error) throw error;
      }

      setSuccessMessage(`${entityMeta[row.entityType].shortLabel} deleted successfully.`);
      await loadInventory(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete record.");
    } finally {
      setRowActionId(null);
    }
  }

  async function loadMedia(entityType: EntityType, entityId: string) {
    setMediaLoading(true);
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("is_primary", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setMediaAssets([]);
      setMediaLoading(false);
      return;
    }

    setMediaAssets((data ?? []) as MediaAssetRow[]);
    setMediaLoading(false);
  }

  async function openMediaManager(row: ExplorerRow) {
    if (!row.canManageMedia) return;
    setErrorMessage("");
    setSuccessMessage("");
    setMediaEntityType(row.entityType);
    setMediaEntityId(row.id);
    setMediaEntityName(row.name);
    setNewMediaUrl("");
    setIsMediaOpen(true);
    await loadMedia(row.entityType, row.id);
  }

  function closeMediaManager() {
    if (mediaSubmitting) return;
    setIsMediaOpen(false);
    setMediaEntityType(null);
    setMediaEntityId(null);
    setMediaEntityName("");
    setMediaAssets([]);
    setNewMediaUrl("");
  }

  async function handleAddMedia() {
    if (!mediaEntityType || !mediaEntityId) return;
    if (!newMediaUrl.trim()) {
      setErrorMessage("Media URL is required.");
      return;
    }

    if (mediaEntityType === "transfer" && mediaAssets.length >= 1) {
      setErrorMessage("Transfers support only one media asset in this Phase 2 flow.");
      return;
    }

    if (["hotel", "sightseeing", "meal"].includes(mediaEntityType) && mediaAssets.length >= 20) {
      setErrorMessage("Maximum 20 media URLs allowed for this entity.");
      return;
    }

    setMediaSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        entity_type: mediaEntityType,
        entity_id: mediaEntityId,
        url: newMediaUrl.trim(),
        is_primary: mediaAssets.length === 0,
      };

      const { error } = await supabase.from("media_assets").insert(payload);
      if (error) throw error;

      setSuccessMessage("Media URL added successfully.");
      setNewMediaUrl("");
      await loadMedia(mediaEntityType, mediaEntityId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add media.");
    } finally {
      setMediaSubmitting(false);
    }
  }

  async function handleSetPrimaryMedia(assetId: string) {
    if (!mediaEntityType || !mediaEntityId) return;

    setMediaSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const resetRes = await supabase
        .from("media_assets")
        .update({ is_primary: false })
        .eq("entity_type", mediaEntityType)
        .eq("entity_id", mediaEntityId);

      if (resetRes.error) throw resetRes.error;

      const setRes = await supabase
        .from("media_assets")
        .update({ is_primary: true })
        .eq("id", assetId);

      if (setRes.error) throw setRes.error;

      setSuccessMessage("Primary media updated successfully.");
      await loadMedia(mediaEntityType, mediaEntityId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update primary media.");
    } finally {
      setMediaSubmitting(false);
    }
  }

  async function handleDeleteMedia(assetId: string) {
    if (!mediaEntityType || !mediaEntityId) return;

    setMediaSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const asset = mediaAssets.find((item) => item.id === assetId);
      const { error } = await supabase.from("media_assets").delete().eq("id", assetId);
      if (error) throw error;

      const remaining = mediaAssets.filter((item) => item.id !== assetId);

      if (asset?.is_primary && remaining.length > 0) {
        const promoteId = remaining[0].id;
        const promoteRes = await supabase
          .from("media_assets")
          .update({ is_primary: true })
          .eq("id", promoteId);
        if (promoteRes.error) throw promoteRes.error;
      }

      setSuccessMessage("Media removed successfully.");
      await loadMedia(mediaEntityType, mediaEntityId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to remove media.");
    } finally {
      setMediaSubmitting(false);
    }
  }

  const createPreviewRegion = useMemo(() => {
    let regionId = "";
    if (activeCreateType === "hotel") regionId = hotelForm.region_id;
    if (activeCreateType === "sightseeing") regionId = sightseeingForm.region_id;
    if (activeCreateType === "transfer") regionId = transferForm.region_id;
    if (activeCreateType === "meal") regionId = mealForm.region_id;

    const region = regionId ? regionById.get(regionId) : null;
    const city = region?.city_id ? cityById.get(region.city_id) : null;
    const country = city?.country_id ? countryById.get(city.country_id) : null;

    return {
      region: region?.name ?? "—",
      city: city?.name ?? "—",
      country: country?.name ?? "—",
    };
  }, [
    activeCreateType,
    hotelForm.region_id,
    sightseeingForm.region_id,
    transferForm.region_id,
    mealForm.region_id,
    regionById,
    cityById,
    countryById,
  ]);

  const bentoCards = [
    {
      type: "country" as EntityType,
      count: countries.length,
      activeCount: countries.filter((item) => item.is_active !== false).length,
    },
    {
      type: "city" as EntityType,
      count: cities.length,
      activeCount: cities.length,
    },
    {
      type: "region" as EntityType,
      count: regions.length,
      activeCount: regions.length,
    },
    {
      type: "hotel" as EntityType,
      count: hotels.length,
      activeCount: hotels.filter((item) => item.is_active !== false).length,
    },
    {
      type: "sightseeing" as EntityType,
      count: sightseeing.length,
      activeCount: sightseeing.filter((item) => item.is_active !== false).length,
    },
    {
      type: "transfer" as EntityType,
      count: transfers.length,
      activeCount: transfers.filter((item) => item.is_active !== false).length,
    },
    {
      type: "meal" as EntityType,
      count: meals.length,
      activeCount: meals.filter((item) => item.is_active !== false).length,
    },
  ];

  return (
    <>
      <PortalShell
        title="Products"
        subtitle="Master inventory control for countries, cities, provinces, hotels, sightseeing, transfers, and meals."
        sidebar={<AdminSidebar />}
      >
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-[#dfe6ee] bg-slate-50/90 px-5 py-5"
              >
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[22px]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{item.note}</p>
              </div>
            ))}
          </section>

          <InfoPanel
            title="Inventory Control Center"
            action={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => loadInventory(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d6dde8] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => openCreateModal("country")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,122,24,0.22)] transition hover:translate-y-[-1px]"
                >
                  <Plus className="h-4 w-4" />
                  Create New
                </button>
              </div>
            }
          >
            <div className="space-y-6">
              {(errorMessage || successMessage) && (
                <div
                  className={`rounded-[20px] border px-4 py-3 text-sm ${
                    errorMessage
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {errorMessage || successMessage}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {bentoCards.map((item) => {
                  const meta = entityMeta[item.type];
                  const Icon = meta.icon;

                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setSelectedType((prev) => (prev === item.type ? "all" : item.type))}
                      className="rounded-[24px] border border-[#e2e8f0] bg-white p-5 text-left transition hover:translate-y-[-1px] hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className={`inline-flex rounded-2xl border px-3 py-2 ${meta.accent}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {selectedType === item.type ? "Filtered" : "Open"}
                        </span>
                      </div>

                      <p className="mt-4 text-base font-semibold text-slate-950">{meta.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{meta.description}</p>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                            {item.count}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                            Total Records
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{item.activeCount} active</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {Math.max(0, item.count - item.activeCount)} inactive
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <div className="rounded-[28px] border border-[#e3e9f1] bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Geography Dependency Summary</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Country to city to province mapping, with inventory coverage.
                      </p>
                    </div>
                    <Mountain className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {coverageByCountry.length ? (
                      coverageByCountry.map((item) => (
                        <div
                          key={item.countryName}
                          className="rounded-[20px] border border-[#e3e9f1] bg-white px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-950">{item.countryName}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.cities} cities · {item.regions} provinces/areas
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const selected = countries.find((country) => country.name === item.countryName);
                                setSelectedCountryId(selected?.id ?? "all");
                              }}
                              className="rounded-full border border-[#d6dde8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              View Scope
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <SummaryMiniStat label="Hotels" value={item.hotels} />
                            <SummaryMiniStat label="Sightseeing" value={item.sightseeing} />
                            <SummaryMiniStat label="Transfers" value={item.transfers} />
                            <SummaryMiniStat label="Meals" value={item.meals} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyNotice
                        title="No geography records yet"
                        description="Create countries, cities, and provinces first to start mapping inventory."
                      />
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#e3e9f1] bg-slate-50/70 p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">Create Inventory</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Start from geography masters, then add sellable inventory against provinces / areas.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {(["country", "city", "region", "hotel", "sightseeing", "transfer", "meal"] as EntityType[]).map(
                      (type) => {
                        const meta = entityMeta[type];
                        const Icon = meta.icon;

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => openCreateModal(type)}
                            className="rounded-[20px] border border-[#e3e9f1] bg-white px-4 py-4 text-left transition hover:translate-y-[-1px] hover:shadow-[0_10px_26px_rgba(15,23,42,0.05)]"
                          >
                            <span className={`inline-flex rounded-2xl border px-3 py-2 ${meta.accent}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <p className="mt-4 font-semibold text-slate-950">Create {meta.shortLabel}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{meta.description}</p>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <FilterBar>
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search entity, country, city, province, type, or pricing"
                      className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as "all" | EntityType)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="country">Country</option>
                    <option value="city">City</option>
                    <option value="region">Province / Area</option>
                    <option value="hotel">Hotel</option>
                    <option value="sightseeing">Sightseeing</option>
                    <option value="transfer">Transfer</option>
                    <option value="meal">Meal</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "inactive")}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>

                  <select
                    value={selectedCountryId}
                    onChange={(e) => {
                      setSelectedCountryId(e.target.value);
                      setSelectedCityId("all");
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="all">All Countries</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="all">All Cities</option>
                    {citiesFilteredForDropdown.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </FilterBar>

                <div className="overflow-hidden rounded-[24px] border border-[#dfe6ee]">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-slate-100/80">
                        <tr className="text-left text-sm text-slate-500">
                          <th className="px-5 py-4 font-medium">Entity</th>
                          <th className="px-5 py-4 font-medium">Country</th>
                          <th className="px-5 py-4 font-medium">City</th>
                          <th className="px-5 py-4 font-medium">Province / Area</th>
                          <th className="px-5 py-4 font-medium">Pricing</th>
                          <th className="px-5 py-4 font-medium">Status</th>
                          <th className="px-5 py-4 font-medium">Created</th>
                          <th className="px-5 py-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {loading ? (
                          <tr>
                            <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                              Loading inventory records...
                            </td>
                          </tr>
                        ) : filteredExplorerRows.length ? (
                          filteredExplorerRows.map((row) => {
                            const meta = entityMeta[row.entityType];
                            const Icon = meta.icon;
                            const busy = rowActionId === `${row.entityType}-${row.id}`;

                            return (
                              <tr
                                key={`${row.entityType}-${row.id}`}
                                className="border-t border-[#edf2f7] align-top text-sm text-slate-700"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex gap-3">
                                    <span className={`mt-0.5 inline-flex rounded-2xl border px-3 py-2 ${meta.accent}`}>
                                      <Icon className="h-4 w-4" />
                                    </span>
                                    <div>
                                      <p className="font-semibold text-slate-950">{row.name}</p>
                                      <p className="mt-1 text-sm text-slate-500">
                                        {meta.shortLabel} · {row.subtitle}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4">{row.country}</td>
                                <td className="px-5 py-4">{row.city}</td>
                                <td className="px-5 py-4">{row.region}</td>
                                <td className="px-5 py-4">{row.pricingLabel}</td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                                      row.status
                                    )}`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4">{formatDate(row.createdAt)}</td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(row)}
                                      className="inline-flex items-center gap-1 rounded-full border border-[#d6dde8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit
                                    </button>

                                    {row.canToggleActive ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleActive(row)}
                                        disabled={busy}
                                        className="rounded-full border border-[#d6dde8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                      >
                                        {busy ? "Working..." : row.status === "active" ? "Deactivate" : "Activate"}
                                      </button>
                                    ) : null}

                                    {row.canManageMedia ? (
                                      <button
                                        type="button"
                                        onClick={() => openMediaManager(row)}
                                        className="inline-flex items-center gap-1 rounded-full border border-[#d6dde8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                      >
                                        <Upload className="h-3.5 w-3.5" />
                                        Media
                                      </button>
                                    ) : null}

                                    <button
                                      type="button"
                                      onClick={() => handleDelete(row)}
                                      disabled={busy}
                                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-5 py-12">
                              <EmptyNotice
                                title="No matching records"
                                description="Try changing filters or create your first geography / inventory master."
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </InfoPanel>
        </div>
      </PortalShell>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]">
          <div className="flex h-[92vh] w-full max-w-[1240px] flex-col overflow-hidden rounded-[32px] border border-[#d8d0c2] bg-[#f8f5ef] shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#ddd4c8] bg-white/75 px-7 py-5">
              <div>
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-slate-950">
                  {editTargetId ? "Edit Inventory" : "Create Inventory"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Build geography masters and mapped sellable inventory from one clean workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8dfe8] bg-white text-lg text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-0">
              <div className="min-h-0 overflow-y-auto px-7 py-6">
                <div className="space-y-6">
                  <section className={panelCardClassName()}>
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-slate-950">Choose Inventory Type</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Select what you want to create. Form fields will update accordingly.
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {(["country", "city", "region", "hotel", "sightseeing", "transfer", "meal"] as EntityType[]).map(
                        (type) => {
                          const meta = entityMeta[type];
                          const Icon = meta.icon;
                          const active = activeCreateType === type;

                          return (
                            <button
                              key={type}
                              type="button"
                              disabled={!!editTargetId}
                              onClick={() => setActiveCreateType(type)}
                              className={`rounded-[20px] border p-4 text-left transition ${
                                active
                                  ? "border-slate-950 bg-slate-950 text-white"
                                  : "border-[#e3e9f1] bg-white hover:shadow-[0_10px_26px_rgba(15,23,42,0.05)]"
                              } ${editTargetId ? "cursor-not-allowed opacity-75" : ""}`}
                            >
                              <span
                                className={`inline-flex rounded-2xl border px-3 py-2 ${
                                  active ? "border-white/20 bg-white/10 text-white" : meta.accent
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <p className="mt-4 font-semibold">{meta.shortLabel}</p>
                              <p className={`mt-1 text-sm leading-6 ${active ? "text-white/80" : "text-slate-500"}`}>
                                {meta.description}
                              </p>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </section>

                  {activeCreateType === "country" ? (
                    <section className={panelCardClassName()}>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">Country Basics</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Create the parent market under which cities will be added.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Country Name</label>
                          <input
                            value={countryForm.name}
                            onChange={(e) => setCountryForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Thailand"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
                          <input
                            value={countryForm.slug}
                            onChange={(e) => setCountryForm((prev) => ({ ...prev, slug: e.target.value }))}
                            placeholder="thailand"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="inline-flex items-center gap-3 rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={countryForm.is_active}
                              onChange={(e) => setCountryForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                            />
                            Active Country
                          </label>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {activeCreateType === "city" ? (
                    <section className={panelCardClassName()}>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">City Mapping</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Map a city under a country. This city will later hold provinces / areas.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
                          <select
                            value={cityForm.country_id}
                            onChange={(e) => setCityForm((prev) => ({ ...prev, country_id: e.target.value }))}
                            className={inputClassName()}
                          >
                            <option value="">Select country</option>
                            {countries.map((country) => (
                              <option key={country.id} value={country.id}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">City Name</label>
                          <input
                            value={cityForm.name}
                            onChange={(e) => setCityForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Bangkok"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="inline-flex items-center gap-3 rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={cityForm.is_primary}
                              onChange={(e) => setCityForm((prev) => ({ ...prev, is_primary: e.target.checked }))}
                            />
                            Mark as Primary City
                          </label>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {activeCreateType === "region" ? (
                    <section className={panelCardClassName()}>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">Province / Area Mapping</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Add a province, zone, or operational area under a selected city.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                          <select
                            value={regionForm.city_id}
                            onChange={(e) => setRegionForm((prev) => ({ ...prev, city_id: e.target.value }))}
                            className={inputClassName()}
                          >
                            <option value="">Select city</option>
                            {cities.map((city) => {
                              const country = city.country_id ? countryById.get(city.country_id) : null;
                              return (
                                <option key={city.id} value={city.id}>
                                  {city.name}{country ? ` · ${country.name}` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Province / Area Name</label>
                          <input
                            value={regionForm.name}
                            onChange={(e) => setRegionForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Sukhumvit"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
                          <input
                            value={regionForm.type}
                            onChange={(e) => setRegionForm((prev) => ({ ...prev, type: e.target.value }))}
                            placeholder="District, Beach Zone, Downtown, Airport Belt"
                            className={inputClassName()}
                          />
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {activeCreateType === "hotel" ? (
                    <section className={panelCardClassName()}>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">Hotel Inventory</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Map hotel inventory against a province / area with commercial pricing inputs.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Province / Area</label>
                          <select
                            value={hotelForm.region_id}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, region_id: e.target.value }))}
                            className={inputClassName()}
                          >
                            <option value="">Select province / area</option>
                            {regionOptionsForInventory.map((region) => {
                              const city = region.city_id ? cityById.get(region.city_id) : null;
                              const country = city?.country_id ? countryById.get(city.country_id) : null;
                              return (
                                <option key={region.id} value={region.id}>
                                  {region.name}{city ? ` · ${city.name}` : ""}{country ? ` · ${country.name}` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Hotel Name</label>
                          <input
                            value={hotelForm.name}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Grande Centre Point"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Star Rating</label>
                          <input
                            value={hotelForm.star_rating}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, star_rating: e.target.value }))}
                            placeholder="5"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                          <textarea
                            rows={3}
                            value={hotelForm.description}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Luxury city hotel with premium rooms and location advantage."
                            className={textareaClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Amenities (comma separated)
                          </label>
                          <input
                            value={hotelForm.amenities}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, amenities: e.target.value }))}
                            placeholder="Pool, Spa, Breakfast, Airport Shuttle"
                            className={inputClassName()}
                          />
                        </div>

                        <PricingFields
                          baseCost={hotelForm.base_cost}
                          agentPrice={hotelForm.agent_price}
                          customerPrice={hotelForm.customer_price}
                          onBaseCostChange={(value) => setHotelForm((prev) => ({ ...prev, base_cost: value }))}
                          onAgentPriceChange={(value) => setHotelForm((prev) => ({ ...prev, agent_price: value }))}
                          onCustomerPriceChange={(value) => setHotelForm((prev) => ({ ...prev, customer_price: value }))}
                        />

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Margin Value</label>
                          <input
                            value={hotelForm.margin_value}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, margin_value: e.target.value }))}
                            placeholder="1500"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Margin %</label>
                          <input
                            value={hotelForm.margin_percent}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, margin_percent: e.target.value }))}
                            placeholder="12"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Tags (comma separated)</label>
                          <input
                            value={hotelForm.tags}
                            onChange={(e) => setHotelForm((prev) => ({ ...prev, tags: e.target.value }))}
                            placeholder="Luxury, Family, City Center"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="inline-flex items-center gap-3 rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={hotelForm.is_active}
                              onChange={(e) => setHotelForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                            />
                            Active Hotel
                          </label>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {activeCreateType === "sightseeing" ? (
                    <section className={panelCardClassName()}>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">Sightseeing Inventory</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Add activities, tours, and experiences against a province / area.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Province / Area</label>
                          <select
                            value={sightseeingForm.region_id}
                            onChange={(e) => setSightseeingForm((prev) => ({ ...prev, region_id: e.target.value }))}
                            className={inputClassName()}
                          >
                            <option value="">Select province / area</option>
                            {regionOptionsForInventory.map((region) => {
                              const city = region.city_id ? cityById.get(region.city_id) : null;
                              const country = city?.country_id ? countryById.get(city.country_id) : null;
                              return (
                                <option key={region.id} value={region.id}>
                                  {region.name}{city ? ` · ${city.name}` : ""}{country ? ` · ${country.name}` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Sightseeing Name</label>
                          <input
                            value={sightseeingForm.name}
                            onChange={(e) => setSightseeingForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Safari World"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                          <input
                            value={sightseeingForm.category}
                            onChange={(e) => setSightseeingForm((prev) => ({ ...prev, category: e.target.value }))}
                            placeholder="Theme Park, Temple, Island Tour"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Duration Hours</label>
                          <input
                            value={sightseeingForm.duration_hours}
                            onChange={(e) => setSightseeingForm((prev) => ({ ...prev, duration_hours: e.target.value }))}
                            placeholder="6"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                          <textarea
                            rows={3}
                            value={sightseeingForm.description}
                            onChange={(e) => setSightseeingForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Family-friendly full day attraction with shows and wildlife experience."
                            className={textareaClassName()}
                          />
                        </div>

                        <PricingFields
                          baseCost={sightseeingForm.base_cost}
                          agentPrice={sightseeingForm.agent_price}
                          customerPrice={sightseeingForm.customer_price}
                          onBaseCostChange={(value) => setSightseeingForm((prev) => ({ ...prev, base_cost: value }))}
                          onAgentPriceChange={(value) => setSightseeingForm((prev) => ({ ...prev, agent_price: value }))}
                          onCustomerPriceChange={(value) =>
                            setSightseeingForm((prev) => ({ ...prev, customer_price: value }))
                          }
                        />

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Tags (comma separated)</label>
                          <input
                            value={sightseeingForm.tags}
                            onChange={(e) => setSightseeingForm((prev) => ({ ...prev, tags: e.target.value }))}
                            placeholder="Family, Bestseller, Private Tour"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="inline-flex items-center gap-3 rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={sightseeingForm.is_active}
                              onChange={(e) => setSightseeingForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                            />
                            Active Sightseeing
                          </label>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {activeCreateType === "transfer" ? (
                    <section className={panelCardClassName()}>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">Transfer Inventory</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Add vehicle and route-based transfer inventory mapped to a province / area.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Province / Area</label>
                          <select
                            value={transferForm.region_id}
                            onChange={(e) => setTransferForm((prev) => ({ ...prev, region_id: e.target.value }))}
                            className={inputClassName()}
                          >
                            <option value="">Select province / area</option>
                            {regionOptionsForInventory.map((region) => {
                              const city = region.city_id ? cityById.get(region.city_id) : null;
                              const country = city?.country_id ? countryById.get(city.country_id) : null;
                              return (
                                <option key={region.id} value={region.id}>
                                  {region.name}{city ? ` · ${city.name}` : ""}{country ? ` · ${country.name}` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Transfer Name</label>
                          <input
                            value={transferForm.name}
                            onChange={(e) => setTransferForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="BKK Airport to Sukhumvit Hotel"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Transfer Type</label>
                          <input
                            value={transferForm.type}
                            onChange={(e) => setTransferForm((prev) => ({ ...prev, type: e.target.value }))}
                            placeholder="Airport Pickup, Intercity, Disposal"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Vehicle Type</label>
                          <input
                            value={transferForm.vehicle_type}
                            onChange={(e) => setTransferForm((prev) => ({ ...prev, vehicle_type: e.target.value }))}
                            placeholder="Sedan, SUV, Van"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Capacity</label>
                          <input
                            value={transferForm.capacity}
                            onChange={(e) => setTransferForm((prev) => ({ ...prev, capacity: e.target.value }))}
                            placeholder="4"
                            className={inputClassName()}
                          />
                        </div>

                        <PricingFields
                          baseCost={transferForm.base_cost}
                          agentPrice={transferForm.agent_price}
                          customerPrice={transferForm.customer_price}
                          onBaseCostChange={(value) => setTransferForm((prev) => ({ ...prev, base_cost: value }))}
                          onAgentPriceChange={(value) => setTransferForm((prev) => ({ ...prev, agent_price: value }))}
                          onCustomerPriceChange={(value) => setTransferForm((prev) => ({ ...prev, customer_price: value }))}
                        />

                        <div className="md:col-span-2">
                          <label className="inline-flex items-center gap-3 rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={transferForm.is_active}
                              onChange={(e) => setTransferForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                            />
                            Active Transfer
                          </label>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {activeCreateType === "meal" ? (
                    <section className={panelCardClassName()}>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">Meal Inventory</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Add restaurant or meal inclusion inventory mapped to a province / area.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Province / Area</label>
                          <select
                            value={mealForm.region_id}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, region_id: e.target.value }))}
                            className={inputClassName()}
                          >
                            <option value="">Select province / area</option>
                            {regionOptionsForInventory.map((region) => {
                              const city = region.city_id ? cityById.get(region.city_id) : null;
                              const country = city?.country_id ? countryById.get(city.country_id) : null;
                              return (
                                <option key={region.id} value={region.id}>
                                  {region.name}{city ? ` · ${city.name}` : ""}{country ? ` · ${country.name}` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Meal Name</label>
                          <input
                            value={mealForm.name}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Indian Dinner"
                            className={inputClassName()}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Meal Type</label>
                          <input
                            value={mealForm.type}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, type: e.target.value }))}
                            placeholder="Breakfast, Lunch, Dinner, Buffet"
                            className={inputClassName()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Cuisine</label>
                          <input
                            value={mealForm.cuisine}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, cuisine: e.target.value }))}
                            placeholder="Indian, Thai, Continental"
                            className={inputClassName()}
                          />
                        </div>

                        <PricingFields
                          baseCost={mealForm.base_cost}
                          agentPrice={mealForm.agent_price}
                          customerPrice={mealForm.customer_price}
                          onBaseCostChange={(value) => setMealForm((prev) => ({ ...prev, base_cost: value }))}
                          onAgentPriceChange={(value) => setMealForm((prev) => ({ ...prev, agent_price: value }))}
                          onCustomerPriceChange={(value) => setMealForm((prev) => ({ ...prev, customer_price: value }))}
                        />

                        <div className="md:col-span-2">
                          <label className="inline-flex items-center gap-3 rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={mealForm.is_active}
                              onChange={(e) => setMealForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                            />
                            Active Meal
                          </label>
                        </div>
                      </div>
                    </section>
                  ) : null}
                </div>
              </div>

              <aside className="min-h-0 border-l border-[#ddd4c8] bg-white/70 px-6 py-6">
                <div className="sticky top-0 space-y-5">
                  <div className="rounded-[24px] border border-[#e4ebf3] bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">Create Summary</p>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Mode</span>
                        <span className="text-right font-medium text-slate-900">
                          {editTargetId ? "Edit" : "Create"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Type</span>
                        <span className="text-right font-medium text-slate-900">
                          {entityMeta[activeCreateType].shortLabel}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Country</span>
                        <span className="text-right font-medium text-slate-900">
                          {createPreviewRegion.country}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">City</span>
                        <span className="text-right font-medium text-slate-900">
                          {createPreviewRegion.city}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Province / Area</span>
                        <span className="text-right font-medium text-slate-900">
                          {createPreviewRegion.region}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#e4ebf3] bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">System Guidance</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <p>1. Create country first.</p>
                      <p>2. Add city under country.</p>
                      <p>3. Add province / area under city.</p>
                      <p>4. Map hotels, sightseeing, transfers, and meals to province / area.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className="flex-1 rounded-full border border-[#d6dde8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleCreateOrEditSubmit}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,122,24,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {editTargetId ? "Update" : "Save"}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      {isMediaOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]">
          <div className="flex h-[84vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[32px] border border-[#d8d0c2] bg-[#f8f5ef] shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#ddd4c8] bg-white/75 px-7 py-5">
              <div>
                <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-950">
                  Manage Media
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {mediaEntityName} · {mediaEntityType ? entityMeta[mediaEntityType].shortLabel : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={closeMediaManager}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8dfe8] bg-white text-lg text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
              <div className="space-y-6">
                <section className={panelCardClassName()}>
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-slate-950">Add Media URL</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Use direct image URLs. Transfers allow one media item. Hotels, sightseeing, and meals allow up to 20.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 rounded-[18px] border border-[#d6dde8] bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedia}
                      disabled={mediaSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#ff7a18] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      {mediaSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add URL
                    </button>
                  </div>
                </section>

                <section className={panelCardClassName()}>
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-slate-950">Current Media</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Mark one media record as primary. Primary will stay at the top.
                    </p>
                  </div>

                  {mediaLoading ? (
                    <div className="rounded-[20px] border border-dashed border-[#d6dde8] bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                      Loading media...
                    </div>
                  ) : mediaAssets.length ? (
                    <div className="space-y-3">
                      {mediaAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="rounded-[20px] border border-[#e3e9f1] bg-white p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {asset.is_primary ? (
                                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Primary
                                  </span>
                                ) : (
                                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    Secondary
                                  </span>
                                )}
                              </div>
                              <p className="mt-3 break-all text-sm text-slate-700">{asset.url || "No URL"}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {!asset.is_primary ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryMedia(asset.id)}
                                  disabled={mediaSubmitting}
                                  className="rounded-full border border-[#d6dde8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                >
                                  Set Primary
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleDeleteMedia(asset.id)}
                                disabled={mediaSubmitting}
                                className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyNotice
                      title="No media added"
                      description="Add your first image URL for this inventory item."
                    />
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SummaryMiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-[#e3e9f1] bg-slate-50 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function EmptyNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#d6dde8] bg-slate-50 px-5 py-8 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function PricingFields({
  baseCost,
  agentPrice,
  customerPrice,
  onBaseCostChange,
  onAgentPriceChange,
  onCustomerPriceChange,
}: {
  baseCost: string;
  agentPrice: string;
  customerPrice: string;
  onBaseCostChange: (value: string) => void;
  onAgentPriceChange: (value: string) => void;
  onCustomerPriceChange: (value: string) => void;
}) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Base Cost</label>
        <input
          value={baseCost}
          onChange={(e) => onBaseCostChange(e.target.value)}
          placeholder="4500"
          className={inputClassName()}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Agent Price</label>
        <input
          value={agentPrice}
          onChange={(e) => onAgentPriceChange(e.target.value)}
          placeholder="5200"
          className={inputClassName()}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Customer Price</label>
        <input
          value={customerPrice}
          onChange={(e) => onCustomerPriceChange(e.target.value)}
          placeholder="5900"
          className={inputClassName()}
        />
      </div>
    </>
  );
}