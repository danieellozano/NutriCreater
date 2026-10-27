package com.nutricreater.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest (
    @NotBlank(message = "Introduce tu email o nombre de usuario")
    String identifier,

    @NotBlank(message = "La contraseña es obligatoria")
    String password
){}
