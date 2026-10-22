package com.nutricreater.backend.dto;

import java.util.List;

public record MealResponse(
        Long id,
        String name,
        List<MealItemResponse> items,
        Double totalCalories,
        Double totalProtein,
        Double totalCarbohydrates,
        Double totalFat,
        Double totalFiber,
        Double totalSalt
) {}