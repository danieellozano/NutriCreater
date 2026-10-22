package com.nutricreater.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record MealRequest(
        @NotBlank(message = "El nombre de la comida es obligatorio")
        String name,

        @NotEmpty(message = "La comida debe contener al menos un alimento")
        @Valid // Para que valide cada MealItemRequest dentro de la lista
        List<MealItemRequest> items
) {}