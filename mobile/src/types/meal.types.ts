// Lo que enviamos al backend:
export interface MealItemRequest {
  foodId: number;
  quantityInGrams: number;
}

export interface MealRequest {
  name: string;
  items: MealItemRequest[];
}

// Lo que nos devuelve el backend con los cálculos:
export interface MealItemResponse {
  id: number;
  foodId: number;
  foodName: string;
  quantityInGrams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  salt: number;
}

export interface MealResponse {
  id: number;
  name: string;
  items: MealItemResponse[];
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber?: number;
  totalSalt?: number;
}