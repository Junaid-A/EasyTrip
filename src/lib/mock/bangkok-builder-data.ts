export type BookingMode = "ready" | "ai" | "custom";

export type DepartureCity = {
  id: string;
  city: string;
  airport: string;
  airportCode: string;
  state: string;
};

export type ThailandCity = {
  id: string;
  name: string;
  destinationId: string;
  region: string;
  shortDescription: string;
  popular?: boolean;
};

export type TripSegment = {
  id: string;
  city: string;
  destinationId?: string;
  checkIn: string;
  checkOut: string;
};

export type PackageCategory =
  | "all"
  | "family"
  | "group"
  | "honeymoon"
  | "premium"
  | "beach";

export type DayPlanItem = {
  day: number;
  city: string;
  title: string;
  description: string;
  transfer?: string;
  hotel?: string;
  activities?: string[];
  meals?: string[];
};

export type StandardPackage = {
  id: string;
  packageFamilyId: string;
  title: string;
  subtitle: string;
  category: PackageCategory[];
  badge: string;
  durationNights: number;
  durationDays: number;
  citySplit: Array<{
    city: string;
    nights: number;
  }>;
  hotelCategory: "3 Star" | "4 Star" | "5 Star";
  transferType: string;
  mealsLabel: string;
  includedFlights: boolean;
  flightSelectionValue: 0 | 1;
  activitiesCount: number;
  highlightList: string[];
  bestFor: string[];
  basePricePerPerson: number;
  accentFrom: string;
  accentTo: string;
  image: string;
  dayPlan: DayPlanItem[];
};

export type PackageItem = {
  id: string;
  title: string;
  tag: string;
  nights: number;
  hotelCategory: "3 Star" | "4 Star" | "5 Star";
  price: number;
  area: string;
  includes: string[];
};

export type SightseeingItem = {
  id: string;
  title: string;
  category:
    | "Popular"
    | "Family"
    | "Culture"
    | "Nightlife"
    | "Shopping"
    | "Luxury";
  duration: string;
  price: number;
};

export const categoryTabs: Array<{ value: PackageCategory; label: string }> = [
  { value: "all", label: "All Packages" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "premium", label: "Premium" },
  { value: "beach", label: "Beach" },
];

export const departureCities: DepartureCity[] = [
  {
    id: "dep-bangalore",
    city: "Bangalore",
    airport: "Kempegowda International Airport",
    airportCode: "BLR",
    state: "Karnataka",
  },
  {
    id: "dep-mumbai",
    city: "Mumbai",
    airport: "Chhatrapati Shivaji Maharaj International Airport",
    airportCode: "BOM",
    state: "Maharashtra",
  },
  {
    id: "dep-delhi",
    city: "Delhi",
    airport: "Indira Gandhi International Airport",
    airportCode: "DEL",
    state: "Delhi",
  },
  {
    id: "dep-hyderabad",
    city: "Hyderabad",
    airport: "Rajiv Gandhi International Airport",
    airportCode: "HYD",
    state: "Telangana",
  },
  {
    id: "dep-chennai",
    city: "Chennai",
    airport: "Chennai International Airport",
    airportCode: "MAA",
    state: "Tamil Nadu",
  },
  {
    id: "dep-kolkata",
    city: "Kolkata",
    airport: "Netaji Subhas Chandra Bose International Airport",
    airportCode: "CCU",
    state: "West Bengal",
  },
  {
    id: "dep-kochi",
    city: "Kochi",
    airport: "Cochin International Airport",
    airportCode: "COK",
    state: "Kerala",
  },
  {
    id: "dep-ahmedabad",
    city: "Ahmedabad",
    airport: "Sardar Vallabhbhai Patel International Airport",
    airportCode: "AMD",
    state: "Gujarat",
  },
  {
    id: "dep-pune",
    city: "Pune",
    airport: "Pune Airport",
    airportCode: "PNQ",
    state: "Maharashtra",
  },
  {
    id: "dep-goa",
    city: "Goa",
    airport: "Manohar International Airport",
    airportCode: "GOX",
    state: "Goa",
  },
  {
    id: "dep-jaipur",
    city: "Jaipur",
    airport: "Jaipur International Airport",
    airportCode: "JAI",
    state: "Rajasthan",
  },
  {
    id: "dep-lucknow",
    city: "Lucknow",
    airport: "Chaudhary Charan Singh International Airport",
    airportCode: "LKO",
    state: "Uttar Pradesh",
  },
  {
    id: "dep-chandigarh",
    city: "Chandigarh",
    airport: "Chandigarh International Airport",
    airportCode: "IXC",
    state: "Chandigarh",
  },
  {
    id: "dep-indore",
    city: "Indore",
    airport: "Devi Ahilya Bai Holkar Airport",
    airportCode: "IDR",
    state: "Madhya Pradesh",
  },
  {
    id: "dep-nagpur",
    city: "Nagpur",
    airport: "Dr. Babasaheb Ambedkar International Airport",
    airportCode: "NAG",
    state: "Maharashtra",
  },
  {
    id: "dep-visakhapatnam",
    city: "Visakhapatnam",
    airport: "Visakhapatnam Airport",
    airportCode: "VTZ",
    state: "Andhra Pradesh",
  },
  {
    id: "dep-coimbatore",
    city: "Coimbatore",
    airport: "Coimbatore International Airport",
    airportCode: "CJB",
    state: "Tamil Nadu",
  },
  {
    id: "dep-trivandrum",
    city: "Trivandrum",
    airport: "Trivandrum International Airport",
    airportCode: "TRV",
    state: "Kerala",
  },
  {
    id: "dep-bhubaneswar",
    city: "Bhubaneswar",
    airport: "Biju Patnaik International Airport",
    airportCode: "BBI",
    state: "Odisha",
  },
  {
    id: "dep-guwahati",
    city: "Guwahati",
    airport: "Lokpriya Gopinath Bordoloi International Airport",
    airportCode: "GAU",
    state: "Assam",
  },
];

export const thailandCities: ThailandCity[] = [
  {
    id: "city-bangkok",
    name: "Bangkok",
    destinationId: "dest-bangkok",
    region: "Central",
    shortDescription: "Shopping, city life, culture",
    popular: true,
  },
  {
    id: "city-pattaya",
    name: "Pattaya",
    destinationId: "dest-pattaya",
    region: "East",
    shortDescription: "Beach, nightlife, quick escape",
    popular: true,
  },
  {
    id: "city-phuket",
    name: "Phuket",
    destinationId: "dest-phuket",
    region: "South",
    shortDescription: "Island, beaches, premium stays",
    popular: true,
  },
  {
    id: "city-krabi",
    name: "Krabi",
    destinationId: "dest-krabi",
    region: "South",
    shortDescription: "Scenic beaches, island hopping",
    popular: true,
  },
  {
    id: "city-chiang-mai",
    name: "Chiang Mai",
    destinationId: "dest-chiang-mai",
    region: "North",
    shortDescription: "Culture, temples, calm pace",
  },
];

type PackageTemplate = {
  familyId: string;
  title: string;
  subtitle: string;
  badge: string;
  citySplit: Array<{ city: string; nights: number }>;
  categories: PackageCategory[];
  transferType: string;
  mealsLabel: string;
  bestFor: string[];
  highlights: string[];
  image: string;
  area: string;
  activityBase: number;
  basePrice: number;
};

const templates: PackageTemplate[] = [
  {
    familyId: "fam-bkk-pat-4n",
    title: "Bangkok + Pattaya Quick Escape",
    subtitle: "A compact city-plus-beach circuit that sells fast for first-timers.",
    badge: "Most Booked",
    citySplit: [
      { city: "Bangkok", nights: 2 },
      { city: "Pattaya", nights: 2 },
    ],
    categories: ["all", "family", "group"],
    transferType: "Private airport + intercity transfer",
    mealsLabel: "Breakfast + 1 dinner",
    bestFor: ["First timers", "Family", "Quick trip"],
    highlights: [
      "Bangkok city orientation",
      "Pattaya beach time",
      "Flexible shopping stop",
      "Private intercity movement",
    ],
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Pattaya",
    activityBase: 4,
    basePrice: 22900,
  },
  {
    familyId: "fam-bkk-pat-5n",
    title: "Bangkok + Pattaya Comfort Circuit",
    subtitle: "The safer standard package with strong conversion for couples and families.",
    badge: "Top Seller",
    citySplit: [
      { city: "Bangkok", nights: 3 },
      { city: "Pattaya", nights: 2 },
    ],
    categories: ["all", "family", "premium"],
    transferType: "Private airport + sightseeing transfer",
    mealsLabel: "Breakfast + 2 dinners",
    bestFor: ["Couples", "Family", "Comfort"],
    highlights: [
      "Siam and Pratunam access",
      "Coral Island add-on ready",
      "Private airport pickup",
      "Easy customization next",
    ],
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Pattaya",
    activityBase: 5,
    basePrice: 25900,
  },
  {
    familyId: "fam-bkk-krabi-5n",
    title: "Bangkok + Krabi Scenic Pairing",
    subtitle: "One city plus one scenic beach leg for broader appeal.",
    badge: "Scenic Pick",
    citySplit: [
      { city: "Bangkok", nights: 2 },
      { city: "Krabi", nights: 3 },
    ],
    categories: ["all", "beach", "premium"],
    transferType: "Airport + island-side private transfer",
    mealsLabel: "Breakfast + 1 lunch",
    bestFor: ["Couples", "Beach lovers", "Premium"],
    highlights: [
      "Beach-heavy pacing",
      "Krabi island excursion ready",
      "Balanced city entry",
      "Good upsell base",
    ],
    image:
      "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Krabi",
    activityBase: 5,
    basePrice: 28900,
  },
  {
    familyId: "fam-bkk-phuket-5n",
    title: "Bangkok + Phuket Bestseller",
    subtitle: "A cleaner city-plus-island Thailand package with strong premium potential.",
    badge: "Premium Value",
    citySplit: [
      { city: "Bangkok", nights: 2 },
      { city: "Phuket", nights: 3 },
    ],
    categories: ["all", "beach", "premium"],
    transferType: "Private airport + local island transfer",
    mealsLabel: "Breakfast + 1 dinner",
    bestFor: ["Couples", "Friends", "Beach trip"],
    highlights: [
      "Bangkok shopping start",
      "Phuket premium stay",
      "Island-day ready",
      "Strong upgrade potential",
    ],
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Phuket",
    activityBase: 5,
    basePrice: 30900,
  },
  {
    familyId: "fam-bkk-only-4n",
    title: "Bangkok City Break",
    subtitle: "A neat Bangkok-only plan that is easy to close for short breaks.",
    badge: "City Favorite",
    citySplit: [{ city: "Bangkok", nights: 4 }],
    categories: ["all", "group", "premium"],
    transferType: "Airport + city movement transfer",
    mealsLabel: "Breakfast included",
    bestFor: ["Friends", "Shopping", "Nightlife"],
    highlights: [
      "Siam area friendly",
      "Market and mall focused",
      "Easy hotel swaps",
      "Fast approval plan",
    ],
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok",
    activityBase: 4,
    basePrice: 19900,
  },
  {
    familyId: "fam-bkk-phu-kra-7n",
    title: "Thailand Island Triangle",
    subtitle: "For longer premium customers wanting city plus two beach legs.",
    badge: "Long Stay",
    citySplit: [
      { city: "Bangkok", nights: 2 },
      { city: "Phuket", nights: 3 },
      { city: "Krabi", nights: 2 },
    ],
    categories: ["all", "beach", "premium", "group"],
    transferType: "Private airport + intercity + local transfer",
    mealsLabel: "Breakfast + 2 dinners",
    bestFor: ["Group", "Premium", "Long trip"],
    highlights: [
      "Three-stop routing",
      "Heavy sightseeing potential",
      "Premium transfer value",
      "Great merchandising base",
    ],
    image:
      "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Phuket + Krabi",
    activityBase: 7,
    basePrice: 40900,
  },
  {
    familyId: "fam-bkk-pat-kra-6n",
    title: "Bangkok + Pattaya + Krabi Mix",
    subtitle: "A strong mixed-mode package for city, beach, and nightlife buyers.",
    badge: "Mixed Bestseller",
    citySplit: [
      { city: "Bangkok", nights: 2 },
      { city: "Pattaya", nights: 2 },
      { city: "Krabi", nights: 2 },
    ],
    categories: ["all", "group", "beach"],
    transferType: "Airport + intercity private transfer",
    mealsLabel: "Breakfast + 1 dinner",
    bestFor: ["Friends", "Mixed trip", "Group"],
    highlights: [
      "3-city split",
      "Balanced day pacing",
      "Good for upsells",
      "Popular mixed itinerary",
    ],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Pattaya + Krabi",
    activityBase: 6,
    basePrice: 34900,
  },
  {
    familyId: "fam-bkk-pat-hm-5n",
    title: "Bangkok + Pattaya Honeymoon Edit",
    subtitle: "A cleaner romantic itinerary with better dinner and transfer positioning.",
    badge: "Honeymoon",
    citySplit: [
      { city: "Bangkok", nights: 2 },
      { city: "Pattaya", nights: 3 },
    ],
    categories: ["all", "honeymoon", "premium", "beach"],
    transferType: "Private romantic transfer setup",
    mealsLabel: "Breakfast + romantic dinner",
    bestFor: ["Couples", "Honeymoon", "Premium"],
    highlights: [
      "Dinner cruise friendly",
      "Private movement",
      "Romantic pacing",
      "Easy premium upsells",
    ],
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Pattaya",
    activityBase: 5,
    basePrice: 31900,
  },
  {
    familyId: "fam-phu-kra-6n",
    title: "Phuket + Krabi Beach Pair",
    subtitle: "For customers who want mostly island time with less city noise.",
    badge: "Beach Heavy",
    citySplit: [
      { city: "Phuket", nights: 3 },
      { city: "Krabi", nights: 3 },
    ],
    categories: ["all", "beach", "honeymoon", "premium"],
    transferType: "Airport + beachside private transfer",
    mealsLabel: "Breakfast + 1 sunset dinner",
    bestFor: ["Beach lovers", "Couples", "Premium"],
    highlights: [
      "Beach-first routing",
      "Island tour friendly",
      "Good premium hotel base",
      "Lower friction itinerary",
    ],
    image:
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1400&q=80",
    area: "Phuket + Krabi",
    activityBase: 6,
    basePrice: 36900,
  },
  {
    familyId: "fam-bkk-chiang-6n",
    title: "Bangkok + Chiang Mai Contrast",
    subtitle: "Urban entry with a calmer cultural second leg.",
    badge: "Culture + City",
    citySplit: [
      { city: "Bangkok", nights: 3 },
      { city: "Chiang Mai", nights: 3 },
    ],
    categories: ["all", "family", "premium", "group"],
    transferType: "Airport + cultural city transfer",
    mealsLabel: "Breakfast included",
    bestFor: ["Family", "Culture", "Balanced trip"],
    highlights: [
      "Temple and city mix",
      "Calmer final leg",
      "Good for first repeat travelers",
      "Strong edit flexibility",
    ],
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Chiang Mai",
    activityBase: 5,
    basePrice: 29900,
  },
  {
    familyId: "fam-thai-grand-8n",
    title: "Thailand Grand Highlights",
    subtitle: "A stronger longer-duration package built for serious planners.",
    badge: "8N Grand",
    citySplit: [
      { city: "Bangkok", nights: 3 },
      { city: "Pattaya", nights: 2 },
      { city: "Phuket", nights: 3 },
    ],
    categories: ["all", "family", "premium", "beach", "group"],
    transferType: "Private airport + intercity + day movement",
    mealsLabel: "Breakfast + 2 dinners",
    bestFor: ["Family", "Group", "Long trip"],
    highlights: [
      "8N structure",
      "Multiple upsell points",
      "Balanced city and beach",
      "Higher package value",
    ],
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Pattaya + Phuket",
    activityBase: 8,
    basePrice: 45900,
  },
  {
    familyId: "fam-thai-legend-11n",
    title: "Thailand 11N Complete Circuit",
    subtitle: "Long-stay demonstration package to show deep inventory and flexibility.",
    badge: "11N Complete",
    citySplit: [
      { city: "Bangkok", nights: 3 },
      { city: "Pattaya", nights: 2 },
      { city: "Phuket", nights: 3 },
      { city: "Krabi", nights: 3 },
    ],
    categories: ["all", "group", "premium", "beach"],
    transferType: "Complete multi-city private transfer",
    mealsLabel: "Breakfast + 3 dinners",
    bestFor: ["Group", "Long stay", "Premium"],
    highlights: [
      "11N showcase package",
      "Multi-city routing",
      "High activity density",
      "Best for advanced planners",
    ],
    image:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1400&q=80",
    area: "Bangkok + Pattaya + Phuket + Krabi",
    activityBase: 10,
    basePrice: 57900,
  },
];

const hotelVariants: Array<{
  hotelCategory: "3 Star" | "4 Star" | "5 Star";
  priceDelta: number;
}> = [
  { hotelCategory: "3 Star", priceDelta: 0 },
  { hotelCategory: "4 Star", priceDelta: 6500 },
];

function getAccent(index: number) {
  const pairs = [
    ["from-orange-200", "to-rose-100"],
    ["from-sky-200", "to-cyan-100"],
    ["from-amber-200", "to-orange-100"],
    ["from-fuchsia-200", "to-pink-100"],
    ["from-emerald-200", "to-teal-100"],
    ["from-violet-200", "to-indigo-100"],
  ];

  const selected = pairs[index % pairs.length];

  return {
    accentFrom: selected[0],
    accentTo: selected[1],
  };
}

function getDestinationIdFromCity(city: string) {
  const normalized = city.trim().toLowerCase();

  const map: Record<string, string> = {
    bangkok: "dest-bangkok",
    pattaya: "dest-pattaya",
    phuket: "dest-phuket",
    krabi: "dest-krabi",
    "chiang mai": "dest-chiang-mai",
  };

  return map[normalized] ?? `dest-${normalized.replace(/\s+/g, "-")}`;
}

function createDayPlan(
  citySplit: Array<{ city: string; nights: number }>,
  hotelCategory: "3 Star" | "4 Star" | "5 Star",
  transferType: string,
  mealsLabel: string
): DayPlanItem[] {
  const plans: DayPlanItem[] = [];
  let day = 1;

  citySplit.forEach((segment, segmentIndex) => {
    for (let i = 0; i < segment.nights; i += 1) {
      const isArrival = i === 0;
      const isLastNight = i === segment.nights - 1;

      plans.push({
        day,
        city: segment.city,
        title: isArrival
          ? `Arrival and check-in in ${segment.city}`
          : isLastNight
          ? `Flexible exploration in ${segment.city}`
          : `Sightseeing and free time in ${segment.city}`,
        description: isArrival
          ? `Airport arrival, hotel check-in, and lighter first-day movement suited for realistic arrival timing.`
          : isLastNight
          ? `Use this day for shopping, relaxation, or optional experiences before the next movement leg.`
          : `Core day for the most popular sightseeing, shopping, or beach movement in ${segment.city}.`,
        transfer:
          isArrival || segmentIndex > 0
            ? transferType
            : "Local movement as per package plan",
        hotel: `${hotelCategory} stay in ${segment.city}`,
        activities: isArrival
          ? ["Check-in support", "Leisure time", "Area orientation"]
          : ["Popular sightseeing", "Photo stops", "Flexible add-on slot"],
        meals: [mealsLabel],
      });

      day += 1;
    }
  });

  return plans;
}

function createPackageVariant(
  template: PackageTemplate,
  hotelCategory: "3 Star" | "4 Star" | "5 Star",
  hotelPriceDelta: number,
  includedFlights: boolean,
  index: number
): StandardPackage {
  const { accentFrom, accentTo } = getAccent(index);
  const durationNights = template.citySplit.reduce((sum, item) => sum + item.nights, 0);
  const durationDays = durationNights + 1;

  return {
    id: `${template.familyId}-${hotelCategory.toLowerCase().replace(/\s+/g, "-")}-${includedFlights ? "with-flight" : "without-flight"}`,
    packageFamilyId: template.familyId,
    title: template.title,
    subtitle: template.subtitle,
    category: template.categories,
    badge: template.badge,
    durationNights,
    durationDays,
    citySplit: template.citySplit,
    hotelCategory,
    transferType: template.transferType,
    mealsLabel: template.mealsLabel,
    includedFlights,
    flightSelectionValue: includedFlights ? 1 : 0,
    activitiesCount: template.activityBase + (hotelCategory === "4 Star" ? 1 : 0),
    highlightList: template.highlights,
    bestFor: template.bestFor,
    basePricePerPerson: template.basePrice + hotelPriceDelta,
    accentFrom,
    accentTo,
    image: template.image,
    dayPlan: createDayPlan(
      template.citySplit,
      hotelCategory,
      template.transferType,
      template.mealsLabel
    ),
  };
}

export const standardPackages: StandardPackage[] = templates.flatMap((template, templateIndex) =>
  hotelVariants.flatMap((hotel, hotelIndex) => [
    createPackageVariant(template, hotel.hotelCategory, hotel.priceDelta, false, templateIndex * 4 + hotelIndex),
    createPackageVariant(template, hotel.hotelCategory, hotel.priceDelta, true, templateIndex * 4 + hotelIndex + 1),
  ])
);

export const readyPackages: PackageItem[] = templates.map((template, index) => {
  const representative = standardPackages.find(
    (item) => item.packageFamilyId === template.familyId && item.hotelCategory === "4 Star" && !item.includedFlights
  )!;

  return {
    id: representative.id,
    title: representative.title,
    tag: representative.badge,
    nights: representative.durationNights,
    hotelCategory: representative.hotelCategory,
    price: representative.basePricePerPerson,
    area: template.area,
    includes: [
      representative.hotelCategory,
      representative.transferType,
      representative.mealsLabel,
      `${representative.activitiesCount} activities`,
    ],
  };
});

export const sightseeingOptions: SightseeingItem[] = [
  {
    id: "s-1",
    title: "Bangkok Temple & City Tour",
    category: "Culture",
    duration: "Half Day",
    price: 1800,
  },
  {
    id: "s-2",
    title: "Safari World",
    category: "Family",
    duration: "Full Day",
    price: 3500,
  },
  {
    id: "s-3",
    title: "Chao Phraya Dinner Cruise",
    category: "Luxury",
    duration: "Evening",
    price: 3200,
  },
  {
    id: "s-4",
    title: "Coral Island Tour",
    category: "Popular",
    duration: "Full Day",
    price: 2800,
  },
  {
    id: "s-5",
    title: "Alcazar Show",
    category: "Nightlife",
    duration: "Evening",
    price: 2200,
  },
  {
    id: "s-6",
    title: "Phi Phi Day Trip",
    category: "Popular",
    duration: "Full Day",
    price: 4200,
  },
];