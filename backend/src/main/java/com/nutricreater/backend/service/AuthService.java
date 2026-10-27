package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.AuthResponse;
import com.nutricreater.backend.dto.LoginRequest;
import com.nutricreater.backend.dto.RegisterRequest;
import com.nutricreater.backend.exception.ResourceAlreadyExistsException;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Role;
import com.nutricreater.backend.model.User;
import com.nutricreater.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // REGISTRO
    public AuthResponse register(RegisterRequest request){
        // Validar duplicados
        if(userRepository.existsByEmailIgnoreCase(request.email())){
            throw new ResourceAlreadyExistsException("El email ya está registrado: " + request.email());
        }
        if (userRepository.existsByNicknameIgnoreCase(request.nickname())){
            throw new ResourceAlreadyExistsException("El nombre de usuario ya está en uso: " + request.nickname());
        }

        // Crear un usuario con contraseña cifrada
        User user = new User(
                request.nickname(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Role.ROLE_USER
        );

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(token, savedUser.getNickname(), savedUser.getEmail(), savedUser.getRole().name());
    }

    // LOGIN
    public AuthResponse login(LoginRequest request){
        // Validar si la contraseña coincide con el hash cifrado
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.identifier(),request.password())
        );

        // Si no falló, buscar al usuario para generar el token
        User user = userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(request.identifier(), request.identifier())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getNickname(), user.getEmail(), user.getRole().name());
    }
}
