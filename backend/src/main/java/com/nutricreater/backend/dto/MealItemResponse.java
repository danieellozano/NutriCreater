package com.nutricreater.backend.dto;

public record MealItemResponse(
        Long id,
        Long foodId,
        String foodName,
        Double quantityInGrams,
        Double calories,
        Double protein,
        Double carbohydrates,
        Double fat,
        Double fiber,
        Double salt
) {}