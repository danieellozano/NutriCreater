package com.nutricreater.backend.dto;

public record AuthResponse (
    String token,
    String nickname,
    String email,
    String role
){}
