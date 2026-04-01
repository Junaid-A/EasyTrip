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
  activitiesCount: number;
  highlightList: string[];
  bestFor: string[];
  basePricePerPerson: number;
  accentFrom: string;
  accentTo: string;
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
    shortDescription: "Resort stays, islands, beaches",
    popular: true,
  },
  {
    id: "city-krabi",
    name: "Krabi",
    destinationId: "dest-krabi",
    region: "South",
    shortDescription: "Scenic beaches and relaxed stays",
    popular: true,
  },
  {
    id: "city-chiang-mai",
    name: "Chiang Mai",
    destinationId: "dest-chiang-mai",
    region: "North",
    shortDescription: "Temples, mountains, calm vibe",
    popular: true,
  },
  {
    id: "city-chiang-rai",
    name: "Chiang Rai",
    destinationId: "dest-chiang-rai",
    region: "North",
    shortDescription: "Nature and cultural landmarks",
  },
  {
    id: "city-hua-hin",
    name: "Hua Hin",
    destinationId: "dest-hua-hin",
    region: "Central",
    shortDescription: "Quiet seaside with premium resorts",
  },
  {
    id: "city-koh-samui",
    name: "Koh Samui",
    destinationId: "dest-koh-samui",
    region: "South",
    shortDescription: "Luxury island stays and beaches",
    popular: true,
  },
  {
    id: "city-ayutthaya",
    name: "Ayutthaya",
    destinationId: "dest-ayutthaya",
    region: "Central",
    shortDescription: "Historic temples and day-trip extensions",
  },
];

export const bangkokAreas = thailandCities.filter(
  (city) => city.destinationId === "dest-bangkok"
);

export const categoryTabs: Array<{ value: PackageCategory; label: string }> = [
  { value: "all", label: "All Packages" },
  { value: "family", label: "Family Vacays" },
  { value: "group", label: "Group Tours" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "premium", label: "Premium" },
  { value: "beach", label: "Beach Escapes" },
];

export const standardPackages: StandardPackage[] = [
  {
    id: "bangkok-pattaya-comfort",
    title: "Enchanting Pattaya, Bangkok & Krabi",
    subtitle:
      "Balanced city + beach itinerary for first-time Thailand travellers who want a clean, comfortable route.",
    category: ["all", "family", "premium", "beach"],
    badge: "Most Booked",
    durationNights: 6,
    durationDays: 7,
    citySplit: [
      { city: "Pattaya", nights: 2 },
      { city: "Bangkok", nights: 2 },
      { city: "Krabi", nights: 2 },
    ],
    hotelCategory: "4 Star",
    transferType: "Airport + private intercity transfers",
    mealsLabel: "Breakfast included",
    includedFlights: false,
    activitiesCount: 6,
    highlightList: [
      "Coral Island",
      "Chao Phraya Dinner Cruise",
      "Safari World",
      "Leisure beach day",
    ],
    bestFor: ["Families", "First-time travellers", "Comfort seekers"],
    basePricePerPerson: 36900,
    accentFrom: "from-amber-100",
    accentTo: "to-orange-200",
    dayPlan: [
      {
        day: 1,
        city: "Pattaya",
        title: "Arrival and transfer to Pattaya",
        description:
          "Airport pickup, hotel check-in, and easy evening to settle in.",
        transfer: "Private airport transfer",
        hotel: "4★ Pattaya stay",
        meals: ["Breakfast"],
      },
      {
        day: 2,
        city: "Pattaya",
        title: "Coral Island day excursion",
        description:
          "Shared island excursion with relaxed return timing and free evening.",
        activities: ["Coral Island excursion"],
        meals: ["Breakfast"],
      },
      {
        day: 3,
        city: "Bangkok",
        title: "Move to Bangkok and evening cruise",
        description:
          "Private transfer to Bangkok, check-in, and Chao Phraya dinner cruise.",
        transfer: "Private Pattaya to Bangkok transfer",
        hotel: "4★ Bangkok city hotel",
        activities: ["Chao Phraya Dinner Cruise"],
        meals: ["Breakfast"],
      },
      {
        day: 4,
        city: "Bangkok",
        title: "City sightseeing and shopping window",
        description:
          "Half-day city highlights with flexible shopping and leisure time.",
        activities: ["Bangkok city highlights", "Shopping time"],
        meals: ["Breakfast"],
      },
      {
        day: 5,
        city: "Krabi",
        title: "Transfer onward to Krabi",
        description:
          "Onward routing to Krabi, hotel check-in, and relaxed evening.",
        transfer: "Intercity transfer",
        hotel: "4★ Krabi stay",
        meals: ["Breakfast"],
      },
      {
        day: 6,
        city: "Krabi",
        title: "Beach leisure day",
        description:
          "A slower day for resort enjoyment, local walks, and optional add-ons.",
        activities: ["Leisure day"],
        meals: ["Breakfast"],
      },
      {
        day: 7,
        city: "Krabi",
        title: "Departure",
        description:
          "Hotel checkout and transfer for onward journey.",
        transfer: "Departure transfer",
        meals: ["Breakfast"],
      },
    ],
  },
  {
    id: "thailand-city-island-highlights",
    title: "Thailand City & Island Highlights",
    subtitle:
      "A cleaner premium route blending Krabi, Phuket, and Bangkok with stronger couple appeal.",
    category: ["all", "honeymoon", "premium", "beach"],
    badge: "Premium Pick",
    durationNights: 6,
    durationDays: 7,
    citySplit: [
      { city: "Krabi", nights: 2 },
      { city: "Phuket", nights: 2 },
      { city: "Bangkok", nights: 2 },
    ],
    hotelCategory: "4 Star",
    transferType: "Airport + intercity flight transfers",
    mealsLabel: "Breakfast + selected meals",
    includedFlights: true,
    activitiesCount: 5,
    highlightList: [
      "7 Islands Sunset Tour",
      "Promthep Cape",
      "Safari World",
      "Bangkok free evening",
    ],
    bestFor: ["Couples", "Beach lovers", "Premium routing"],
    basePricePerPerson: 58900,
    accentFrom: "from-sky-100",
    accentTo: "to-cyan-200",
    dayPlan: [
      {
        day: 1,
        city: "Krabi",
        title: "Arrival in Krabi",
        description:
          "Airport pickup, hotel check-in, and a light evening near the coast.",
        transfer: "Airport transfer",
        hotel: "4★ Krabi premium stay",
        meals: ["Breakfast"],
      },
      {
        day: 2,
        city: "Krabi",
        title: "Island and sunset experience",
        description:
          "A scenic day designed around coastal viewpoints and sea-facing experiences.",
        activities: ["7 Islands Sunset Tour"],
        meals: ["Breakfast"],
      },
      {
        day: 3,
        city: "Phuket",
        title: "Transfer to Phuket",
        description:
          "Smooth onward routing to Phuket with check-in and free time.",
        transfer: "Intercity flight/transfer",
        hotel: "4★ Phuket stay",
        meals: ["Breakfast"],
      },
      {
        day: 4,
        city: "Phuket",
        title: "Phuket highlights",
        description:
          "Scenic touring with optional premium add-ons and flexible pacing.",
        activities: ["Promthep Cape", "City highlights"],
        meals: ["Breakfast"],
      },
      {
        day: 5,
        city: "Bangkok",
        title: "Fly to Bangkok",
        description:
          "Arrival into Bangkok, hotel check-in, and a free evening in the city.",
        transfer: "Domestic intercity flight",
        hotel: "4★ Bangkok premium stay",
        meals: ["Breakfast"],
      },
      {
        day: 6,
        city: "Bangkok",
        title: "Safari World and free time",
        description:
          "A guided city day balanced with time for self-paced movement.",
        activities: ["Safari World"],
        meals: ["Breakfast"],
      },
      {
        day: 7,
        city: "Bangkok",
        title: "Departure",
        description: "Departure transfer after hotel checkout.",
        transfer: "Airport transfer",
        meals: ["Breakfast"],
      },
    ],
  },
  {
    id: "bangkok-pattaya-honeymoon",
    title: "Bangkok & Pattaya Honeymoon Escape",
    subtitle:
      "Romantic routing with softer pacing, clean hotel comfort, and better evening experiences.",
    category: ["all", "honeymoon", "premium"],
    badge: "Couple Favourite",
    durationNights: 5,
    durationDays: 6,
    citySplit: [
      { city: "Bangkok", nights: 3 },
      { city: "Pattaya", nights: 2 },
    ],
    hotelCategory: "4 Star",
    transferType: "Private transfers throughout",
    mealsLabel: "Breakfast included",
    includedFlights: false,
    activitiesCount: 4,
    highlightList: [
      "Dinner Cruise",
      "Coral Island",
      "Romantic city evening",
      "Private routing",
    ],
    bestFor: ["Couples", "Honeymoon", "Relaxed pace"],
    basePricePerPerson: 47900,
    accentFrom: "from-rose-100",
    accentTo: "to-pink-200",
    dayPlan: [
      {
        day: 1,
        city: "Bangkok",
        title: "Arrival and hotel check-in",
        description:
          "Airport pickup, hotel check-in, and easy evening in Bangkok.",
        transfer: "Private airport transfer",
        hotel: "4★ premium Bangkok hotel",
        meals: ["Breakfast"],
      },
      {
        day: 2,
        city: "Bangkok",
        title: "Bangkok highlights and free evening",
        description:
          "Comfort-led city touring with flexible evening for shopping or dining.",
        activities: ["Bangkok highlights"],
        meals: ["Breakfast"],
      },
      {
        day: 3,
        city: "Bangkok",
        title: "Dinner cruise evening",
        description:
          "A lighter day leading into a romantic river dinner experience.",
        activities: ["Dinner Cruise"],
        meals: ["Breakfast"],
      },
      {
        day: 4,
        city: "Pattaya",
        title: "Transfer to Pattaya",
        description:
          "Private transfer to Pattaya and hotel check-in with leisure time.",
        transfer: "Private Bangkok to Pattaya transfer",
        hotel: "4★ Pattaya stay",
        meals: ["Breakfast"],
      },
      {
        day: 5,
        city: "Pattaya",
        title: "Coral Island and free evening",
        description:
          "Island day with better pacing for couples and relaxed free time after.",
        activities: ["Coral Island excursion"],
        meals: ["Breakfast"],
      },
      {
        day: 6,
        city: "Pattaya",
        title: "Departure",
        description: "Checkout and departure transfer for onward journey.",
        transfer: "Private departure transfer",
        meals: ["Breakfast"],
      },
    ],
  },
  {
    id: "family-thailand-loop",
    title: "Thailand Family Fun Circuit",
    subtitle:
      "Sensible day loads, family-friendly stays, and easy movement across three cities.",
    category: ["all", "family", "group"],
    badge: "Family Favourite",
    durationNights: 6,
    durationDays: 7,
    citySplit: [
      { city: "Bangkok", nights: 2 },
      { city: "Pattaya", nights: 2 },
      { city: "Phuket", nights: 2 },
    ],
    hotelCategory: "4 Star",
    transferType: "Airport + private intercity transfers",
    mealsLabel: "Breakfast + selected meals",
    includedFlights: true,
    activitiesCount: 6,
    highlightList: [
      "Safari World",
      "Coral Island",
      "Phuket city tour",
      "Family pacing",
    ],
    bestFor: ["Families", "Children", "Value comfort"],
    basePricePerPerson: 42900,
    accentFrom: "from-lime-100",
    accentTo: "to-emerald-200",
    dayPlan: [
      {
        day: 1,
        city: "Bangkok",
        title: "Arrival and city hotel check-in",
        description:
          "Airport pickup and hotel check-in with a light first day.",
        transfer: "Airport transfer",
        hotel: "4★ Bangkok family stay",
        meals: ["Breakfast"],
      },
      {
        day: 2,
        city: "Bangkok",
        title: "Safari World day",
        description:
          "A full but manageable family day designed around children and group comfort.",
        activities: ["Safari World"],
        meals: ["Breakfast"],
      },
      {
        day: 3,
        city: "Pattaya",
        title: "Transfer to Pattaya",
        description:
          "Private transfer, check-in, and evening at leisure.",
        transfer: "Private intercity transfer",
        hotel: "4★ Pattaya family stay",
        meals: ["Breakfast"],
      },
      {
        day: 4,
        city: "Pattaya",
        title: "Coral Island outing",
        description:
          "A comfortable island day with flexible return timing.",
        activities: ["Coral Island"],
        meals: ["Breakfast"],
      },
      {
        day: 5,
        city: "Phuket",
        title: "Move to Phuket",
        description:
          "Intercity flight or routed transfer with check-in afterward.",
        transfer: "Intercity routing",
        hotel: "4★ Phuket family stay",
        meals: ["Breakfast"],
      },
      {
        day: 6,
        city: "Phuket",
        title: "Phuket city highlights",
        description:
          "A medium-paced sightseeing day with family-friendly movement.",
        activities: ["Phuket city tour"],
        meals: ["Breakfast"],
      },
      {
        day: 7,
        city: "Phuket",
        title: "Departure",
        description: "Departure transfer after hotel checkout.",
        transfer: "Airport transfer",
        meals: ["Breakfast"],
      },
    ],
  },
  {
    id: "bangkok-value-break",
    title: "Bangkok Value City Break",
    subtitle:
      "A neat city-first Thailand entry package for shorter travel windows and tighter budgets.",
    category: ["all", "group", "premium"],
    badge: "Easy Starter",
    durationNights: 4,
    durationDays: 5,
    citySplit: [{ city: "Bangkok", nights: 4 }],
    hotelCategory: "4 Star",
    transferType: "Airport transfers + city support",
    mealsLabel: "Breakfast included",
    includedFlights: false,
    activitiesCount: 4,
    highlightList: [
      "Safari World",
      "Shopping drop",
      "Dinner cruise option",
      "Central stay",
    ],
    bestFor: ["Short trips", "Young couples", "Friends"],
    basePricePerPerson: 28999,
    accentFrom: "from-orange-100",
    accentTo: "to-amber-200",
    dayPlan: [
      {
        day: 1,
        city: "Bangkok",
        title: "Arrival and city check-in",
        description:
          "Airport pickup, check-in, and open evening for light local exploration.",
        transfer: "Airport transfer",
        hotel: "4★ Bangkok stay",
        meals: ["Breakfast"],
      },
      {
        day: 2,
        city: "Bangkok",
        title: "Safari World or city option",
        description:
          "A fuller sightseeing day with flexible pacing and shopping options later.",
        activities: ["Safari World"],
        meals: ["Breakfast"],
      },
      {
        day: 3,
        city: "Bangkok",
        title: "Shopping and local movement",
        description:
          "Dedicated shopping window with optional evening add-on.",
        activities: ["Shopping time"],
        meals: ["Breakfast"],
      },
      {
        day: 4,
        city: "Bangkok",
        title: "Free day or premium add-on",
        description:
          "Use the day for custom sightseeing, dining, or a premium evening experience.",
        activities: ["Leisure day"],
        meals: ["Breakfast"],
      },
      {
        day: 5,
        city: "Bangkok",
        title: "Departure",
        description:
          "Checkout and departure transfer.",
        transfer: "Airport transfer",
        meals: ["Breakfast"],
      },
    ],
  },
  {
    id: "phuket-krabi-beach-pairing",
    title: "Phuket & Krabi Beach Pairing",
    subtitle:
      "A more beach-led route for travellers who want resort energy without too much city movement.",
    category: ["all", "beach", "honeymoon", "premium"],
    badge: "Beach Escape",
    durationNights: 6,
    durationDays: 7,
    citySplit: [
      { city: "Phuket", nights: 3 },
      { city: "Krabi", nights: 3 },
    ],
    hotelCategory: "4 Star",
    transferType: "Airport + intercity coastal routing",
    mealsLabel: "Breakfast + selected meals",
    includedFlights: true,
    activitiesCount: 5,
    highlightList: [
      "Island tour",
      "Beach leisure",
      "Sunset viewpoints",
      "Resort comfort",
    ],
    bestFor: ["Couples", "Beach lovers", "Leisure seekers"],
    basePricePerPerson: 48999,
    accentFrom: "from-cyan-100",
    accentTo: "to-sky-200",
    dayPlan: [
      {
        day: 1,
        city: "Phuket",
        title: "Arrival in Phuket",
        description:
          "Airport pickup, hotel check-in, and free evening near the beach.",
        transfer: "Airport transfer",
        hotel: "4★ Phuket stay",
        meals: ["Breakfast"],
      },
      {
        day: 2,
        city: "Phuket",
        title: "Island tour day",
        description:
          "A scenic island-focused day planned around photo points and sea movement.",
        activities: ["Island tour"],
        meals: ["Breakfast"],
      },
      {
        day: 3,
        city: "Phuket",
        title: "Leisure and optional premium evening",
        description:
          "A softer day for shopping, cafés, beach time, or curated premium add-ons.",
        activities: ["Leisure day"],
        meals: ["Breakfast"],
      },
      {
        day: 4,
        city: "Krabi",
        title: "Transfer to Krabi",
        description:
          "Coastal intercity movement, hotel check-in, and relaxed evening.",
        transfer: "Intercity coastal transfer",
        hotel: "4★ Krabi stay",
        meals: ["Breakfast"],
      },
      {
        day: 5,
        city: "Krabi",
        title: "Krabi coastal experience",
        description:
          "A slower scenic day with beach and local touring balance.",
        activities: ["Coastal highlights"],
        meals: ["Breakfast"],
      },
      {
        day: 6,
        city: "Krabi",
        title: "Beach leisure day",
        description:
          "A relaxed final full day before departure.",
        activities: ["Leisure day"],
        meals: ["Breakfast"],
      },
      {
        day: 7,
        city: "Krabi",
        title: "Departure",
        description:
          "Checkout and airport transfer for onward travel.",
        transfer: "Airport transfer",
        meals: ["Breakfast"],
      },
    ],
  },
];

export const readyPackages: PackageItem[] = standardPackages.map((pkg) => ({
  id: pkg.id,
  title: pkg.title,
  tag: pkg.badge,
  nights: pkg.durationNights,
  hotelCategory: pkg.hotelCategory,
  price: pkg.basePricePerPerson,
  area: pkg.citySplit.map((item) => item.city).join(" + "),
  includes: [
    pkg.mealsLabel,
    pkg.transferType,
    ...pkg.highlightList.slice(0, 2),
  ],
}));

export const sightseeingItems: SightseeingItem[] = [
  {
    id: "ss-1",
    title: "Safari World",
    category: "Family",
    duration: "Full Day",
    price: 3800,
  },
  {
    id: "ss-2",
    title: "Chao Phraya Dinner Cruise",
    category: "Luxury",
    duration: "Evening",
    price: 3200,
  },
  {
    id: "ss-3",
    title: "Grand Palace + Wat Pho Tour",
    category: "Culture",
    duration: "Half Day",
    price: 2600,
  },
  {
    id: "ss-4",
    title: "SEA LIFE Bangkok",
    category: "Family",
    duration: "2-3 Hours",
    price: 2200,
  },
  {
    id: "ss-5",
    title: "Floating Market Tour",
    category: "Popular",
    duration: "Half Day",
    price: 2400,
  },
  {
    id: "ss-6",
    title: "Mahanakhon SkyWalk",
    category: "Luxury",
    duration: "2 Hours",
    price: 2800,
  },
  {
    id: "ss-7",
    title: "Chinatown Food Experience",
    category: "Popular",
    duration: "Evening",
    price: 2100,
  },
  {
    id: "ss-8",
    title: "Bangkok Night Market Experience",
    category: "Nightlife",
    duration: "Evening",
    price: 1600,
  },
];

export const budgetTiers = ["Economy", "Comfort", "Premium", "Luxury"] as const;

export const tripStyles = [
  "Relaxed",
  "Shopping",
  "Nightlife",
  "Family Fun",
  "Luxury",
  "Adventure",
  "Mixed",
] as const;

export const hotelCategories = ["3 Star", "4 Star", "5 Star"] as const;