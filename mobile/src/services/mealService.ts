import {API_BASE_URL, getAuthHeaders} from './client';
import {MealRequest, MealResponse} from '../types/';

const BASE_URL = `${API_BASE_URL}/meals`;

export const mealService = {
    // Fetch meals from the backend
    async getAll(search?: string): Promise<MealResponse[]> {
        const url = search
            ? `${BASE_URL}?search=${encodeURIComponent(search)}`
            : BASE_URL;

        const headers = await getAuthHeaders(); // Assuming you have a function to get auth headers
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching meals: ${response.status}`);
        }
        return response.json();
    },

    // Fetch a single meal by ID
    async getById(id: number): Promise<MealResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching meal: ${response.status}`);
        }
        return response.json();
    },

    // Create a new meal
    async create(meal: MealRequest): Promise<MealResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                ...headers,
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
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(meal)
        });
        if (!response.ok) {
            throw new Error(`Error updating meal: ${response.status}`);
        }
        return response.json();
    },

    // Delete a meal by ID
    async delete(id: number): Promise<void> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            throw new Error(`Error deleting meal: ${response.status}`);
        }
    },

    async getCommunity(search?: string, sort: 'recent' | 'top' = 'recent'): Promise<MealResponse[]> {
        const params = new URLSearchParams();
        if (search && search.trim()) params.append('search', search.trim());
        params.append('sort', sort);

        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/community?${params.toString()}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching community meals: ${response.status}`);
        }
        return response.json();
    },

    async toggleLike(id: number): Promise<MealResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}/like`, {
            method: 'POST',
            headers,
        });
        if (!response.ok) {
            throw new Error(`Error toggling like: ${response.status}`);
        }
        return response.json();
    },

    async cloneMeal(id: number, customName?: string): Promise<MealResponse> {
        const headers = await getAuthHeaders();
        const query = customName ? `?customName=${encodeURIComponent(customName)}` : '';
        const response = await fetch(`${BASE_URL}/${id}/clone${query}`, {
            method: 'POST',
            headers,
        });
        if (!response.ok) {
            throw new Error(`Error cloning meal: ${response.status}`);
        }
        return response.json();
    }
};
