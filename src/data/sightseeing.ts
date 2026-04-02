export type SightseeingSlot = "morning" | "afternoon" | "evening" | "night";

export type SightseeingOption = {
  id: string;
  destinationId: string;
  name: string;
  type: string;
  duration: string;
  price: number;
  tags: string[];
  image: string;
  gallery: string[];
  availableSlots: SightseeingSlot[];
  pickupIncluded: boolean;
  suitableOnArrivalDay: boolean;
  area: string;
  isActive: boolean;
};

export const sightseeing: SightseeingOption[] = [
  {
    id: "ss-bkk-001",
    destinationId: "dest-bangkok",
    name: "Bangkok Temple & City Tour",
    type: "City Tour",
    duration: "Half Day",
    price: 1800,
    tags: ["Culture", "City", "Easy"],
    image: "/images/sightseeing/bangkok-city-tour.jpg",
    gallery: [
      "/images/sightseeing/bangkok-city-tour.jpg",
      "/images/sightseeing/bangkok-city-tour-2.jpg",
      "/images/sightseeing/bangkok-city-tour-3.jpg",
    ],
    availableSlots: ["morning", "afternoon"],
    pickupIncluded: true,
    suitableOnArrivalDay: true,
    area: "Central Bangkok",
    isActive: true,
  },
  {
    id: "ss-bkk-002",
    destinationId: "dest-bangkok",
    name: "Chao Phraya Dinner Cruise",
    type: "Cruise",
    duration: "Evening",
    price: 3200,
    tags: ["Romantic", "Nightlife", "Premium"],
    image: "/images/sightseeing/chao-phraya-cruise.jpg",
    gallery: [
      "/images/sightseeing/chao-phraya-cruise.jpg",
      "/images/sightseeing/chao-phraya-cruise-2.jpg",
      "/images/sightseeing/chao-phraya-cruise-3.jpg",
    ],
    availableSlots: ["evening", "night"],
    pickupIncluded: false,
    suitableOnArrivalDay: false,
    area: "Riverside",
    isActive: true,
  },
  {
    id: "ss-bkk-003",
    destinationId: "dest-bangkok",
    name: "Safari World Visit",
    type: "Theme Park",
    duration: "Full Day",
    price: 3500,
    tags: ["Family", "Fun", "Popular"],
    image: "/images/sightseeing/safari-world.jpg",
    gallery: [
      "/images/sightseeing/safari-world.jpg",
      "/images/sightseeing/safari-world-2.jpg",
      "/images/sightseeing/safari-world-3.jpg",
    ],
    availableSlots: ["morning"],
    pickupIncluded: true,
    suitableOnArrivalDay: false,
    area: "Outer Bangkok",
    isActive: true,
  },
  {
    id: "ss-bkk-004",
    destinationId: "dest-bangkok",
    name: "Floating Market Excursion",
    type: "Day Excursion",
    duration: "Half Day",
    price: 2400,
    tags: ["Popular", "Culture", "Morning"],
    image: "/images/sightseeing/floating-market.jpg",
    gallery: [
      "/images/sightseeing/floating-market.jpg",
      "/images/sightseeing/floating-market-2.jpg",
      "/images/sightseeing/floating-market-3.jpg",
    ],
    availableSlots: ["morning"],
    pickupIncluded: true,
    suitableOnArrivalDay: false,
    area: "Bangkok Surroundings",
    isActive: true,
  },
  {
    id: "ss-bkk-005",
    destinationId: "dest-bangkok",
    name: "Shopping & Market Circuit",
    type: "Shopping",
    duration: "Flexible",
    price: 1400,
    tags: ["Shopping", "Leisure", "Easy"],
    image: "/images/sightseeing/bangkok-shopping.jpg",
    gallery: [
      "/images/sightseeing/bangkok-shopping.jpg",
      "/images/sightseeing/bangkok-shopping-2.jpg",
      "/images/sightseeing/bangkok-shopping-3.jpg",
    ],
    availableSlots: ["afternoon", "evening"],
    pickupIncluded: false,
    suitableOnArrivalDay: true,
    area: "Siam / Pratunam",
    isActive: true,
  },
  {
    id: "ss-bkk-006",
    destinationId: "dest-bangkok",
    name: "Bangkok Nightlife Access Pass",
    type: "Nightlife",
    duration: "Night",
    price: 1900,
    tags: ["Nightlife", "Friends", "Couples"],
    image: "/images/sightseeing/bangkok-nightlife.jpg",
    gallery: [
      "/images/sightseeing/bangkok-nightlife.jpg",
      "/images/sightseeing/bangkok-nightlife-2.jpg",
      "/images/sightseeing/bangkok-nightlife-3.jpg",
    ],
    availableSlots: ["night"],
    pickupIncluded: false,
    suitableOnArrivalDay: true,
    area: "Sukhumvit",
    isActive: true,
  },
];