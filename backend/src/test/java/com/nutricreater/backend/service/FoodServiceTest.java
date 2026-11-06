package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.FoodRequest;
import com.nutricreater.backend.exception.ResourceAlreadyExistsException;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.model.Role;
import com.nutricreater.backend.model.User;
import com.nutricreater.backend.repository.FoodRepository;
import com.nutricreater.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FoodService foodService;

    private Food sampleFood;
    private FoodRequest sampleRequest;
    private User testUser;
    private final String userEmail = "daniel@gmail.com";

    @BeforeEach
    void setUp() {
        sampleFood = new Food("Pechuga de pollo", 165.0, 31.0, 0.0, 3.6, 0.0, 0.0);
        sampleFood.setId(1L);

        sampleRequest = new FoodRequest("Pechuga de pollo", 165.0, 31.0, 0.0, 3.6, 0.0, 0.0);

        testUser = new User("daniellozano", userEmail, "password123", Role.ROLE_USER);
        testUser.setId(1L);
        testUser.setFoods(new HashSet<>());
    }

    // ==========================================
    // 1. TESTS DE LECTURA (GET)
    // ==========================================
    @Nested
    @DisplayName("Lectura de alimentos")
    class ReadTests {

        @Test
        @DisplayName("Debe devolver la lista de alimentos de la despensa del usuario")
        void getAllFoods_ShouldReturnList() {
            when(foodRepository.findByUserEmail(userEmail)).thenReturn(List.of(sampleFood));

            List<Food> result = foodService.getAllFoods(userEmail);

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Pechuga de pollo", result.get(0).getName());
            verify(foodRepository, times(1)).findByUserEmail(userEmail);
        }

        @Test
        @DisplayName("Debe devolver el alimento si el ID existe")
        void getFoodById_WhenExists_ShouldReturnFood() {
            when(foodRepository.findById(1L)).thenReturn(Optional.of(sampleFood));

            Food result = foodService.getFoodById(1L);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("Pechuga de pollo", result.getName());
            verify(foodRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si el ID no existe")
        void getFoodById_WhenNotFound_ShouldThrowException() {
            when(foodRepository.findById(99L)).thenReturn(Optional.empty());

            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                foodService.getFoodById(99L);
            });

            assertTrue(exception.getMessage().contains("99"));
            verify(foodRepository, times(1)).findById(99L);
        }

        @Test
        @DisplayName("Debe filtrar alimentos por nombre dentro de la despensa del usuario")
        void searchFoodsByName_ShouldReturnFilteredList() {
            when(foodRepository.findByUserEmailAndNameContaining(userEmail, "pechuga"))
                    .thenReturn(List.of(sampleFood));

            List<Food> result = foodService.searchFoodsByName("pechuga", userEmail);

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Pechuga de pollo", result.get(0).getName());
            verify(foodRepository, times(1)).findByUserEmailAndNameContaining(userEmail, "pechuga");
        }
    }

    // ==========================================
    // 2. TESTS DE CREACIÓN (POST)
    // ==========================================
    @Nested
    @DisplayName("Creación de alimentos")
    class CreateTests {

        @Test
        @DisplayName("Debe guardar el alimento y añadirlo a la despensa del usuario")
        void createFood_WhenNotExists_ShouldSaveAndAddToUser() {
            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail))
                    .thenReturn(Optional.of(testUser));
            when(foodRepository.save(any(Food.class))).thenReturn(sampleFood);
            when(userRepository.save(testUser)).thenReturn(testUser);

            Food result = foodService.createFood(sampleRequest, userEmail);

            assertNotNull(result);
            assertEquals("Pechuga de pollo", result.getName());
            assertTrue(testUser.getFoods().contains(sampleFood));

            verify(foodRepository, times(1)).save(any(Food.class));
            verify(userRepository, times(1)).save(testUser);
        }

        @Test
        @DisplayName("Debe lanzar ResourceAlreadyExistsException si el usuario ya tiene ese alimento en su despensa")
        void createFood_WhenAlreadyInPantry_ShouldThrowException() {
            testUser.addFood(sampleFood); // Ya existe en la despensa del usuario

            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail))
                    .thenReturn(Optional.of(testUser));

            ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class, () -> {
                foodService.createFood(sampleRequest, userEmail);
            });

            assertTrue(exception.getMessage().contains("Pechuga de pollo"));
            verify(foodRepository, never()).save(any(Food.class));
            verify(userRepository, never()).save(testUser);
        }
    }

    // ==========================================
    // 3. TESTS DE ACTUALIZACIÓN (PUT)
    // ==========================================
    @Nested
    @DisplayName("Actualización de alimentos")
    class UpdateTests {

        @Test
        @DisplayName("Debe actualizar los datos si el alimento existe")
        void updateFood_WhenExists_ShouldUpdateAndReturn() {
            FoodRequest updateRequest = new FoodRequest("Pechuga de pavo", 120.0, 24.0, 0.0, 1.5, 0.0, 0.5);

            when(foodRepository.findById(1L)).thenReturn(Optional.of(sampleFood));
            when(foodRepository.save(any(Food.class))).thenReturn(sampleFood);

            Food result = foodService.updateFood(1L, updateRequest);

            assertNotNull(result);
            assertEquals("Pechuga de pavo", result.getName());
            assertEquals(120.0, result.getCalories());
            verify(foodRepository, times(1)).findById(1L);
            verify(foodRepository, times(1)).save(sampleFood);
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si se intenta actualizar un ID inexistente")
        void updateFood_WhenNotFound_ShouldThrowException() {
            when(foodRepository.findById(99L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                foodService.updateFood(99L, sampleRequest);
            });

            verify(foodRepository, never()).save(any(Food.class));
        }
    }

    // ==========================================
    // 4. TESTS DE ELIMINACIÓN (DELETE)
    // ==========================================
    @Nested
    @DisplayName("Eliminación de alimentos de la despensa")
    class DeleteTests {

        @Test
        @DisplayName("Debe eliminar el alimento de la despensa del usuario")
        void deleteFood_WhenExists_ShouldRemoveFromUser() {
            testUser.addFood(sampleFood);

            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail))
                    .thenReturn(Optional.of(testUser));
            when(foodRepository.findById(1L)).thenReturn(Optional.of(sampleFood));
            when(userRepository.save(testUser)).thenReturn(testUser);

            assertDoesNotThrow(() -> foodService.deleteFood(1L, userEmail));

            assertFalse(testUser.getFoods().contains(sampleFood));
            verify(userRepository, times(1)).save(testUser);
            // Aseguramos que NO se borra físicamente de la base de datos
            verify(foodRepository, never()).delete(any(Food.class));
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si el alimento no existe")
        void deleteFood_WhenFoodNotFound_ShouldThrowException() {
            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail))
                    .thenReturn(Optional.of(testUser));
            when(foodRepository.findById(99L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                foodService.deleteFood(99L, userEmail);
            });

            verify(userRepository, never()).save(testUser);
        }
    }
}