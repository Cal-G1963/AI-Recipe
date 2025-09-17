export interface Recipe {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  isVideoGenerating?: boolean;
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    glycemicIndex?: string;
  };
  rating?: number;
  notes?: string;
}

export enum MealType {
  ANY = 'Any',
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  SNACK = 'Snack',
  DESSERT = 'Dessert',
  SOUP = 'Soup'
}

export enum DietaryOption {
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  GLUTEN_FREE = 'Gluten-Free',
  DAIRY_FREE = 'Dairy-Free'
}

export enum CookingMethod {
  STOVETOP = 'Stovetop',
  OVEN = 'Oven',
  MICROWAVE = 'Microwave',
  GRILL = 'Grill',
  CHARCOAL_BBQ = 'Charcoal BBQ',
  GAS_BBQ = 'Gas BBQ',
  AIR_FRYER = 'Air Fryer',
  NO_COOK = 'No-Cook'
}