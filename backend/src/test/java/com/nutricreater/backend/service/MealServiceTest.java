package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.MealItemRequest;
import com.nutricreater.backend.dto.MealRequest;
import com.nutricreater.backend.dto.MealResponse;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.model.Meal;
import com.nutricreater.backend.repository.MealRepository;
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
public class MealServiceTest {

    @Mock
    private MealRepository mealRepository;

    @Mock
    private FoodService foodService;

    @InjectMocks
    private MealService mealService;

    private Food avena;
    private Food leche;

    @BeforeEach
    void setUp(){
        avena = new Food("Avena", 370.0, 13.0, 60.0, 7.0, 10.0, 0.0);
        avena.setId(1L);

        leche = new Food("Leche", 65.0, 3.2, 4.8, 3.6, 0.0, 0.1);
        leche.setId(2L);
    }


    // ==========================================
    // 1. CÁLCULO MATEMÁTICO Y CREACIÓN
    // ==========================================
    @Nested
    @DisplayName("Creación y Cálculo de Nutrientes")
    class CreationAndCalculationTests {

        @Test
        @DisplayName("Debe calcular los macros totales con precisión matemática")
        void createMeal_ShouldCalculateMacrosCorrectly() {
            // 1. Arrange: 100g de avena y 200g de leche
            MealItemRequest item1 = new MealItemRequest(1L, 100.0);
            MealItemRequest item2 = new MealItemRequest(2L, 200.0);
            MealRequest request = new MealRequest("Desayuno Fitness", List.of(item1, item2));

            when(foodService.getFoodById(1L)).thenReturn(avena);
            when(foodService.getFoodById(2L)).thenReturn(leche);

            // Simulación de que al guardar la comida, se le asigna el ID 10
            when(mealRepository.save(any(Meal.class))).thenAnswer(invocation -> {
                Meal mealToSave = invocation.getArgument(0);
                mealToSave.setId(10L);
                return mealToSave;
            });

            // 2. Act
            MealResponse response = mealService.createMeal(request);

            // 3. Assert: Comprobamos las matemáticas exactas
            // Calorías: (1.0 * 370) + (2.0 * 65) = 500.0
            // Proteínas: (1.0 * 13) + (2.0 * 3.2) = 19.4
            assertNotNull(response);
            assertEquals(10L, response.id());
            assertEquals("Desayuno Fitness", response.name());
            assertEquals(2, response.items().size());
            assertEquals(500.0, response.totalCalories());
            assertEquals(19.4, response.totalProtein(), 0.001); // margen de precisión para decimales

            verify(foodService, times(1)).getFoodById(1L);
            verify(foodService, times(1)).getFoodById(2L);
            verify(mealRepository, times(1)).save(any(Meal.class));

        }
    }


    // ==========================================
    // 2. TESTS DE LECTURA (GET)
    // ==========================================
    @Nested
    @DisplayName("Lectura de comidas")
    class ReadTest {

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si la comida no existe")
        void getMealById_WhenNotFound_ShouldThrowException() {
            when(mealRepository.findById(99L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                mealService.getMealById(99L);
            });

            verify(mealRepository, times(1)).findById(99L);
        }

        @Test
        @DisplayName("Debe devolver la comida calculada si existe")
        void getMealById_WhenExists_ShouldReturnMealResponse() {
            Meal meal = new Meal("Comida Simple");
            meal.setId(1L);
            meal.addItem(avena, 100.0);

            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));

            MealResponse response = mealService.getMealById(1L);

            assertNotNull(response);
            assertEquals(1L, response.id());
            assertEquals(370, response.totalCalories());
            verify(mealRepository, times(1)).findById(1L);
        }
    }

    // ==========================================
    // 3. ACTUALIZACIÓN (PUT)
    // ==========================================
    @Nested
    @DisplayName("Actualización de Comidas")
    class UpdateTests{

        @Test
        @DisplayName("Debe recalcular los macros tras actualizar ingredientes")
        void updateMeal_ShouldRecalculateTotals(){
            // Comida original con 100g de avena (370 kcal)
            Meal existingMeal = new Meal("Desayuno Antiguo");
            existingMeal.setId(1L);
            existingMeal.addItem(avena,100.0);

            // Petición para actualizar a 200g de leche (130 kcal)
            MealRequest updateRequest = new MealRequest("Desayuno Nuevo", List.of(new MealItemRequest(2L, 200.0)));

            when(mealRepository.findById(1L)).thenReturn(Optional.of(existingMeal));
            when(foodService.getFoodById(2L)).thenReturn(leche);
            when(mealRepository.save(any(Meal.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MealResponse response = mealService.updateMeal(1L, updateRequest);

            assertNotNull(response);
            assertEquals("Desayuno Nuevo", response.name());
            assertEquals(1, response.items().size());
            assertEquals(130.0, response.totalCalories()); // (2.0 * 65)
            verify(mealRepository, times(1)).save(existingMeal);
        }
    }

    // ==========================================
    // 4. ELIMINACIÓN (DELETE)
    // ==========================================
    @Nested
    @DisplayName("Eliminación de Comidas")
    class DeleteTests{

        @Test
        @DisplayName("Debe eliminar la comida si existe")
        void deleteMeal_WhenExists_ShouldDelete() {
            Meal meal = new Meal("A borrar");
            meal.setId(1L);

            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));
            doNothing().when(mealRepository).delete(meal);

            assertDoesNotThrow(() -> mealService.deleteMeal(1L));

            verify(mealRepository, times(1)).delete(meal);
        }
    }

}
