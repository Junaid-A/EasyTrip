export type MealType = "breakfast" | "lunch" | "dinner";
export type MealPreference = "veg" | "non-veg" | "veg-jain" | "mixed";

export type MealOption = {
  id: string;
  name: string;
  mealType: MealType;
  preference: MealPreference;
  cuisine: string;
  price: number;
  description: string;
  tags: string[];
  image: string;
  destinationIds: string[];
  isActive: boolean;
};

export const meals: MealOption[] = [
  {
    id: "meal-bkk-001",
    name: "Hotel Breakfast Included",
    mealType: "breakfast",
    preference: "mixed",
    cuisine: "International",
    price: 0,
    description: "Daily breakfast served at hotel. Suitable for most travelers.",
    tags: ["included", "easy", "hotel"],
    image: "/images/meals/hotel-breakfast.jpg",
    destinationIds: ["dest-bangkok"],
    isActive: true,
  },
  {
    id: "meal-bkk-002",
    name: "Indian Veg Lunch",
    mealType: "lunch",
    preference: "veg",
    cuisine: "Indian",
    price: 1400,
    description: "Comfort Indian veg lunch for travelers wanting familiar food.",
    tags: ["veg", "indian", "comfort"],
    image: "/images/meals/indian-veg-lunch.jpg",
    destinationIds: ["dest-bangkok"],
    isActive: true,
  },
  {
    id: "meal-bkk-003",
    name: "Jain Friendly Veg Lunch",
    mealType: "lunch",
    preference: "veg-jain",
    cuisine: "Indian",
    price: 1600,
    description: "Simple Jain-friendly lunch option with lighter preparation.",
    tags: ["jain", "veg", "indian"],
    image: "/images/meals/jain-lunch.jpg",
    destinationIds: ["dest-bangkok"],
    isActive: true,
  },
  {
    id: "meal-bkk-004",
    name: "Thai Veg Dinner",
    mealType: "dinner",
    preference: "veg",
    cuisine: "Thai",
    price: 1800,
    description: "Vegetarian Thai dinner with curated local flavors.",
    tags: ["veg", "thai", "dinner"],
    image: "/images/meals/thai-veg-dinner.jpg",
    destinationIds: ["dest-bangkok"],
    isActive: true,
  },
  {
    id: "meal-bkk-005",
    name: "Indian Non-Veg Dinner",
    mealType: "dinner",
    preference: "non-veg",
    cuisine: "Indian",
    price: 2200,
    description: "Popular Indian non-veg dinner option for couples and families.",
    tags: ["non-veg", "indian", "popular"],
    image: "/images/meals/indian-nonveg-dinner.jpg",
    destinationIds: ["dest-bangkok"],
    isActive: true,
  },
  {
    id: "meal-bkk-006",
    name: "Buffet Dinner Plan",
    mealType: "dinner",
    preference: "mixed",
    cuisine: "International",
    price: 2600,
    description: "Wide buffet spread with both veg and non-veg selection.",
    tags: ["buffet", "mixed", "family"],
    image: "/images/meals/buffet-dinner.jpg",
    destinationIds: ["dest-bangkok"],
    isActive: true,
  },
  {
    id: "meal-bkk-007",
    name: "Romantic Premium Dinner",
    mealType: "dinner",
    preference: "non-veg",
    cuisine: "Premium Dining",
    price: 4200,
    description: "Premium private dinner best suited for couples and honeymooners.",
    tags: ["premium", "romantic", "couple"],
    image: "/images/meals/romantic-dinner.jpg",
    destinationIds: ["dest-bangkok"],
    isActive: true,
  },
];