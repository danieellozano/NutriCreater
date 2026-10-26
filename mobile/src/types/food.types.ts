export interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  salt?: number;
}

// Para cuando creemos o editemos alimentos desde la app:
export type FoodFormData = Omit<Food, 'id'>;