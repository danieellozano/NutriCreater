package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.AuthResponse;
import com.nutricreater.backend.dto.LoginRequest;
import com.nutricreater.backend.dto.RegisterRequest;
import com.nutricreater.backend.exception.ResourceAlreadyExistsException;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Role;
import com.nutricreater.backend.model.User;
import com.nutricreater.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    // ==========================================
    // 1. TESTS DE REGISTRO
    // ==========================================
    @Nested
    @DisplayName("Registro de Usuarios")
    class RegisterTests {

        @Test
        @DisplayName("Debe registrar un usuario correctamente, cifrar su contraseña y devolver token")
        void register_WhenDataIsValid_ShouldSaveAndReturnToken() {
            // 1. Arrange
            RegisterRequest request = new RegisterRequest("daniellozano", "daniel@gmail.com", "password123");
            User savedUser = new User("daniellozano", "daniel@gmail.com", "encodedHash", Role.ROLE_USER);
            savedUser.setId(1L);

            when(userRepository.existsByEmailIgnoreCase("daniel@gmail.com")).thenReturn(false);
            when(userRepository.existsByNicknameIgnoreCase("daniellozano")).thenReturn(false);
            when(passwordEncoder.encode("password123")).thenReturn("encodedHash");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(jwtService.generateToken(savedUser)).thenReturn("fake.jwt.token");

            // 2. Act
            AuthResponse response = authService.register(request);

            // 3. Assert
            assertNotNull(response);
            assertEquals("fake.jwt.token", response.token());
            assertEquals("daniellozano", response.nickname());
            assertEquals("daniel@gmail.com", response.email());
            assertEquals("ROLE_USER", response.role());

            // Verificamos que se llamó a cifrar la contraseña y a guardar el usuario
            verify(passwordEncoder, times(1)).encode("password123");
            verify(userRepository, times(1)).save(any(User.class));
            verify(jwtService, times(1)).generateToken(savedUser);
        }

        @Test
        @DisplayName("Debe lanzar ResourceAlreadyExistsException si el email ya existe")
        void register_WhenEmailAlreadyExists_ShouldThrowException() {
            // 1. Arrange
            RegisterRequest request = new RegisterRequest("daniellozano", "duplicado@gmail.com", "password123");
            when(userRepository.existsByEmailIgnoreCase("duplicado@gmail.com")).thenReturn(true);

            // 2. Act & Assert
            ResourceAlreadyExistsException ex = assertThrows(ResourceAlreadyExistsException.class, () -> {
                authService.register(request);
            });

            assertTrue(ex.getMessage().contains("duplicado@gmail.com"));
            verify(userRepository, never()).save(any(User.class));
            verify(jwtService, never()).generateToken(any());
        }

        @Test
        @DisplayName("Debe lanzar ResourceAlreadyExistsException si el nickname ya existe")
        void register_WhenNicknameAlreadyExists_ShouldThrowException() {
            // 1. Arrange
            RegisterRequest request = new RegisterRequest("nicknameUsado", "nuevo@gmail.com", "password123");
            when(userRepository.existsByEmailIgnoreCase("nuevo@gmail.com")).thenReturn(false);
            when(userRepository.existsByNicknameIgnoreCase("nicknameUsado")).thenReturn(true);

            // 2. Act & Assert
            ResourceAlreadyExistsException ex = assertThrows(ResourceAlreadyExistsException.class, () -> {
                authService.register(request);
            });

            assertTrue(ex.getMessage().contains("nicknameUsado"));
            verify(userRepository, never()).save(any(User.class));
            verify(jwtService, never()).generateToken(any());
        }
    }

    // ==========================================
    // 2. TESTS DE LOGIN
    // ==========================================
    @Nested
    @DisplayName("Inicio de Sesión (Login)")
    class LoginTests {

        @Test
        @DisplayName("Debe iniciar sesión correctamente con credenciales válidas y devolver token")
        void login_WhenCredentialsAreValid_ShouldReturnToken() {
            // 1. Arrange
            LoginRequest request = new LoginRequest("daniellozano", "password123");
            User existingUser = new User("daniellozano", "daniel@gmail.com", "encodedHash", Role.ROLE_USER);

            // Simulamos que authenticationManager valida la contraseña con éxito (no lanza excepción)
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase("daniellozano", "daniellozano"))
                    .thenReturn(Optional.of(existingUser));
            when(jwtService.generateToken(existingUser)).thenReturn("fake.jwt.token");

            // 2. Act
            AuthResponse response = authService.login(request);

            // 3. Assert
            assertNotNull(response);
            assertEquals("fake.jwt.token", response.token());
            assertEquals("daniellozano", response.nickname());
            assertEquals("ROLE_USER", response.role());

            verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtService, times(1)).generateToken(existingUser);
        }

        @Test
        @DisplayName("Debe lanzar BadCredentialsException si la contraseña es incorrecta")
        void login_WhenPasswordIsIncorrect_ShouldThrowException() {
            // 1. Arrange
            LoginRequest request = new LoginRequest("daniellozano", "passwordMala");

            // Simulamos que Spring Security rechaza la contraseña lanzando BadCredentialsException
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            // 2. Act & Assert
            assertThrows(BadCredentialsException.class, () -> {
                authService.login(request);
            });

            // Si falla la contraseña, nunca se debe buscar al usuario ni generar token
            verify(userRepository, never()).findByEmailIgnoreCaseOrNicknameIgnoreCase(any(), any());
            verify(jwtService, never()).generateToken(any());
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si el usuario no existe en la base de datos")
        void login_WhenUserNotFoundInDatabase_ShouldThrowException() {
            // 1. Arrange
            LoginRequest request = new LoginRequest("noExiste", "password123");

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase("noExiste", "noExiste"))
                    .thenReturn(Optional.empty());

            // 2. Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> {
                authService.login(request);
            });

            verify(jwtService, never()).generateToken(any());
        }
    }
}