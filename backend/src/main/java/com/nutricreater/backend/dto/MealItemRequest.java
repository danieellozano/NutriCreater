package com.nutricreater.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MealItemRequest(
        @NotNull(message = "El ID del alimento es obligatorio")
        Long foodId,

        @NotNull(message = "La cantidad en gramos es obligatoria")
        @Positive(message = "La cantidad debe ser mayor que cero")
        Double quantityInGrams
) {}