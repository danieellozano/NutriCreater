package com.nutricreater.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record FoodRequest (
    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    String name,

    @NotNull(message = "Las calorías son obligatorias")
    @PositiveOrZero(message = "Las calorías deben ser cero o positivas")
    Double calories,

    @NotNull(message = "Las proteínas son obligatorias")
    @PositiveOrZero(message = "Las proteínas deben ser cero o positivas")
    Double protein,

    @NotNull(message = "Los carbohidratos son obligatorios")
    @PositiveOrZero(message = "Los carbohidratos deben ser cero o positivos")
    Double carbohydrates,

    @NotNull(message = "Las grasas son obligatorias")
    @PositiveOrZero(message = "Las grasas deben ser cero o positivas")
    Double fat,

    @PositiveOrZero(message = "La fibra debe ser cero o positiva")
    Double fiber,

    @PositiveOrZero(message = "La sal debe ser cero o positiva")
    Double salt
){}
