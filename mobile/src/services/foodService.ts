import {Food} from '../types/';
import {API_BASE_URL, getAuthHeaders } from './client';

const BASE_URL = `${API_BASE_URL}/foods`;

export const foodService = {
    // Fetch foods from the backend
    async getAll(search?: string): Promise<Food[]> {
        const url = search
            ? `${BASE_URL}?search=${encodeURIComponent(search)}`
            : BASE_URL;

        console.log('>>> EL MOVIL ESTA LLAMANDO A:', url);

        const headers = await getAuthHeaders(); // Assuming you have a function to get auth headers
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching foods: ${response.status}`);
        }
        return response.json();
    },

    // Fetch a single food by ID
    async getById(id: number): Promise<Food> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching food: ${response.status}`);
        }
        return response.json();
    },

    // Create a new food
    async create(food: Omit<Food, 'id'>): Promise<Food> {
        const headers = await getAuthHeaders();
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(food)
        });
        if (!response.ok) {
            throw new Error(`Error creating food: ${response.status}`);
        }
        return response.json();
    },

    // Update an existing food
    async update(id: number, food: Omit<Food, 'id'>): Promise<Food> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(food)
        });
        if (!response.ok) {
            throw new Error(`Error updating food: ${response.status}`);
        }
        return response.json();
    },

    // Delete a food by ID
    async delete(id: number): Promise<void> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            throw new Error(`Error deleting food: ${response.status}`);
        }
    }
};





