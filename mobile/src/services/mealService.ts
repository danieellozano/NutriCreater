import {API_BASE_URL} from './client';
import {MealRequest, MealResponse} from '../types/';

const BASE_URL = `${API_BASE_URL}/meals`;

export const mealService = {
    // Fetch meals from the backend
    async getAll(search?: string): Promise<MealResponse[]> {
        const url = search
            ? `${BASE_URL}/meals?search=${encodeURIComponent(search)}`
            : BASE_URL;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching meals: ${response.status}`);
        }
        return response.json();
    },

    // Fetch a single meal by ID
    async getById(id: number): Promise<MealResponse> {
        const response = await fetch(`${BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Error fetching meal: ${response.status}`);
        }
        return response.json();
    },

    // Create a new meal
    async create(meal: MealRequest): Promise<MealResponse> {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meal)
        });
        if (!response.ok) {
            throw new Error(`Error creating meal: ${response.status}`);
        }
        return response.json();
    },

    // Update an existing meal
    async update(id: number, meal: MealRequest): Promise<MealResponse> {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meal)
        });
        if (!response.ok) {
            throw new Error(`Error updating meal: ${response.status}`);
        }
        return response.json();
    },

    // Delete a meal by ID
    async delete(id: number): Promise<void> {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Error deleting meal: ${response.status}`);
        }
    }
};
