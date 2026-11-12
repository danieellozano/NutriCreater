package com.nutricreater.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
        Double totalSalt,
        @JsonProperty("isPublic")
        boolean isPublic,
        String authorNickname,
        int likesCount,
        LocalDateTime createdAt
) {}