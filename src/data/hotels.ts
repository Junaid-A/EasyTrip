export type HotelStarCategory = "3 Star" | "4 Star" | "5 Star";
export type HotelTag =
  | "value"
  | "shopping"
  | "family"
  | "couple"
  | "luxury"
  | "nightlife"
  | "first-timer"
  | "premium-comfort";

export type Hotel = {
  id: string;
  destinationId: string;
  name: string;
  category: HotelStarCategory;
  area: string;
  rating: number;
  nightlyRate: number;
  priceDelta: number;
  margin: number;
  amenities: string[];
  idealFor: string[];
  tags: HotelTag[];
  image: string;
  isActive: boolean;
};

export const hotels: Hotel[] = [
  {
    id: "hotel-bkk-001",
    destinationId: "dest-bangkok",
    name: "Bangkok City Inn",
    category: "3 Star",
    area: "Pratunam",
    rating: 4.1,
    nightlyRate: 3200,
    priceDelta: 0,
    margin: 450,
    amenities: ["Breakfast", "Wi-Fi", "City access"],
    idealFor: ["Budget travelers", "Shoppers"],
    tags: ["value", "shopping", "first-timer"],
    image: "/images/hotels/bangkok-city-inn.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-002",
    destinationId: "dest-bangkok",
    name: "Siam Comfort Hotel",
    category: "4 Star",
    area: "Siam",
    rating: 4.4,
    nightlyRate: 5200,
    priceDelta: 4500,
    margin: 700,
    amenities: ["Breakfast", "Pool", "Family rooms"],
    idealFor: ["Couples", "Families"],
    tags: ["family", "couple", "shopping", "premium-comfort", "first-timer"],
    image: "/images/hotels/siam-comfort.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-003",
    destinationId: "dest-bangkok",
    name: "Riverside Grand Bangkok",
    category: "5 Star",
    area: "Riverside",
    rating: 4.7,
    nightlyRate: 9600,
    priceDelta: 12500,
    margin: 1100,
    amenities: ["Breakfast", "Pool", "Spa", "River view"],
    idealFor: ["Couples", "Luxury travelers"],
    tags: ["luxury", "couple", "premium-comfort"],
    image: "/images/hotels/riverside-grand.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-004",
    destinationId: "dest-bangkok",
    name: "Sukhumvit Pulse Stay",
    category: "4 Star",
    area: "Sukhumvit",
    rating: 4.3,
    nightlyRate: 5600,
    priceDelta: 5200,
    margin: 800,
    amenities: ["Breakfast", "Pool", "Skytrain access"],
    idealFor: ["Friends", "Couples"],
    tags: ["nightlife", "shopping", "couple", "premium-comfort"],
    image: "/images/hotels/sukhumvit-pulse-stay.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-005",
    destinationId: "dest-bangkok",
    name: "Bangkok Family Suites",
    category: "4 Star",
    area: "Pratunam",
    rating: 4.4,
    nightlyRate: 5800,
    priceDelta: 5600,
    margin: 750,
    amenities: ["Breakfast", "Family rooms", "Wi-Fi"],
    idealFor: ["Families", "First-time visitors"],
    tags: ["family", "shopping", "first-timer", "premium-comfort"],
    image: "/images/hotels/bangkok-family-suites.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-006",
    destinationId: "dest-bangkok",
    name: "Silom Value Hotel",
    category: "3 Star",
    area: "Silom",
    rating: 4.0,
    nightlyRate: 3400,
    priceDelta: 900,
    margin: 400,
    amenities: ["Breakfast", "Wi-Fi", "Transit access"],
    idealFor: ["Young travelers", "Couples"],
    tags: ["value", "nightlife", "first-timer"],
    image: "/images/hotels/silom-value-hotel.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-007",
    destinationId: "dest-bangkok",
    name: "Bangkok Luxe Atrium",
    category: "5 Star",
    area: "Siam",
    rating: 4.8,
    nightlyRate: 10800,
    priceDelta: 14800,
    margin: 1200,
    amenities: ["Breakfast", "Pool", "Spa", "Executive lounge"],
    idealFor: ["Luxury travelers", "Couples"],
    tags: ["luxury", "couple", "shopping", "premium-comfort"],
    image: "/images/hotels/bangkok-luxe-atrium.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-008",
    destinationId: "dest-bangkok",
    name: "Asoke Smart Stay",
    category: "3 Star",
    area: "Asoke",
    rating: 4.1,
    nightlyRate: 3600,
    priceDelta: 1200,
    margin: 450,
    amenities: ["Breakfast", "Wi-Fi", "Metro access"],
    idealFor: ["Budget travelers", "Shoppers"],
    tags: ["value", "shopping", "nightlife", "first-timer"],
    image: "/images/hotels/asoke-smart-stay.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-009",
    destinationId: "dest-bangkok",
    name: "Chatuchak Garden Comfort",
    category: "4 Star",
    area: "Chatuchak",
    rating: 4.2,
    nightlyRate: 5000,
    priceDelta: 4200,
    margin: 650,
    amenities: ["Breakfast", "Pool", "Quiet stay"],
    idealFor: ["Families", "Relaxed travelers"],
    tags: ["family", "value", "premium-comfort"],
    image: "/images/hotels/chatuchak-garden-comfort.jpg",
    isActive: true,
  },
  {
    id: "hotel-bkk-010",
    destinationId: "dest-bangkok",
    name: "Ratchada Urban Suites",
    category: "4 Star",
    area: "Ratchada",
    rating: 4.3,
    nightlyRate: 5400,
    priceDelta: 4700,
    margin: 700,
    amenities: ["Breakfast", "Wi-Fi", "Night market access"],
    idealFor: ["Friends", "Couples", "Nightlife seekers"],
    tags: ["nightlife", "shopping", "couple", "premium-comfort"],
    image: "/images/hotels/ratchada-urban-suites.jpg",
    isActive: true,
  },
];