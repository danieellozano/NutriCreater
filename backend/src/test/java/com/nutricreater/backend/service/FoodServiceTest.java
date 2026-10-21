package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.FoodRequest;
import com.nutricreater.backend.exception.ResourceAlreadyExistsException;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.repository.FoodRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @InjectMocks
    private FoodService foodService;

    private Food sampleFood;
    private FoodRequest sampleRequest;

    @BeforeEach
    void setUp() {
        // Objeto reutilizable para los tests
        sampleFood = new Food("Pechuga de pollo", 165.0, 31.0, 0.0, 3.6, 0.0, 0.0);
        sampleFood.setId(1L);

        sampleRequest = new FoodRequest("Pechuga de pollo", 165.0, 31.0, 0.0, 3.6, 0.0, 0.0);
    }

    // ==========================================
    // 1. TESTS DE LECTURA (GET)
    // ==========================================
    @Nested
    @DisplayName("Lectura de alimentos")
    class ReadTests {

        @Test
        @DisplayName("Debe devolver la lista completa de alimentos")
        void getAllFoods_ShouldReturnList() {
            when(foodRepository.findAll()).thenReturn(List.of(sampleFood));

            List<Food> result = foodService.getAllFoods();

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Pechuga de pollo", result.get(0).getName());
            verify(foodRepository, times(1)).findAll();
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
        @DisplayName("Debe filtrar alimentos por nombre")
        void searchFoodsByName_ShouldReturnFilteredList() {
            when(foodRepository.findByNameContainingIgnoreCase("pechuga")).thenReturn(List.of(sampleFood));

            List<Food> result = foodService.searchFoodsByName("pechuga");

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Pechuga de pollo", result.get(0).getName());
            verify(foodRepository, times(1)).findByNameContainingIgnoreCase("pechuga");
        }
    }

    // ==========================================
    // 2. TESTS DE CREACIÓN (POST)
    // ==========================================
    @Nested
    @DisplayName("Creación de alimentos")
    class CreateTests {

        @Test
        @DisplayName("Debe guardar y devolver el alimento si no existe previamente")
        void createFood_WhenNotExists_ShouldSaveAndReturn() {
            when(foodRepository.existsByNameIgnoreCase("Pechuga de pollo")).thenReturn(false);
            when(foodRepository.save(any(Food.class))).thenReturn(sampleFood);

            Food result = foodService.createFood(sampleRequest);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("Pechuga de pollo", result.getName());
            verify(foodRepository, times(1)).existsByNameIgnoreCase("Pechuga de pollo");
            verify(foodRepository, times(1)).save(any(Food.class));
        }

        @Test
        @DisplayName("Debe lanzar ResourceAlreadyExistsException si el nombre ya está registrado")
        void createFood_WhenAlreadyExists_ShouldThrowException() {
            when(foodRepository.existsByNameIgnoreCase("Pechuga de pollo")).thenReturn(true);

            ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class, () -> {
                foodService.createFood(sampleRequest);
            });

            assertTrue(exception.getMessage().contains("Pechuga de pollo"));
            // Importante: aseguramos que NUNCA se llamó a guardar
            verify(foodRepository, never()).save(any(Food.class));
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
    @DisplayName("Eliminación de alimentos")
    class DeleteTests {

        @Test
        @DisplayName("Debe eliminar el alimento si existe")
        void deleteFood_WhenExists_ShouldDelete() {
            when(foodRepository.findById(1L)).thenReturn(Optional.of(sampleFood));
            doNothing().when(foodRepository).delete(sampleFood);

            assertDoesNotThrow(() -> foodService.deleteFood(1L));

            verify(foodRepository, times(1)).findById(1L);
            verify(foodRepository, times(1)).delete(sampleFood);
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si se intenta borrar un ID inexistente")
        void deleteFood_WhenNotFound_ShouldThrowException() {
            when(foodRepository.findById(99L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                foodService.deleteFood(99L);
            });

            verify(foodRepository, never()).delete(any(Food.class));
        }
    }
}