package com.nutricreater.backend.controller;

import com.nutricreater.backend.dto.AuthResponse;
import com.nutricreater.backend.dto.LoginRequest;
import com.nutricreater.backend.dto.RegisterRequest;
import com.nutricreater.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService service){
        this.authService = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login (@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }
}
