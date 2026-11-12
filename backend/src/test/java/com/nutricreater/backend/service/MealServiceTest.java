package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.MealItemRequest;
import com.nutricreater.backend.dto.MealRequest;
import com.nutricreater.backend.dto.MealResponse;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.model.Meal;
import com.nutricreater.backend.model.Role;
import com.nutricreater.backend.model.User;
import com.nutricreater.backend.repository.MealRepository;
import com.nutricreater.backend.repository.UserRepository;
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

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MealService mealService;

    private Food avena;
    private Food leche;
    private User testUser;
    private final String userEmail = "daniel@gmail.com";

    @BeforeEach
    void setUp() {
        avena = new Food("Avena", 370.0, 13.0, 60.0, 7.0, 10.0, 0.0);
        avena.setId(1L);

        leche = new Food("Leche", 65.0, 3.2, 4.8, 3.6, 0.0, 0.1);
        leche.setId(2L);

        testUser = new User("user", userEmail, "encodedPassword", Role.ROLE_USER);
        testUser.setId(1L);
    }

    // ==========================================
    // 1. CÁLCULO MATEMÁTICO Y CREACIÓN
    // ==========================================
    @Nested
    @DisplayName("Creación y Cálculo de Nutrientes")
    class CreationAndCalculationTests {

        @Test
        @DisplayName("Debe calcular los macros totales con precisión matemática vinculando al usuario")
        void createMeal_ShouldCalculateMacrosCorrectly() {
            MealItemRequest item1 = new MealItemRequest(1L, 100.0);
            MealItemRequest item2 = new MealItemRequest(2L, 200.0);
            MealRequest request = new MealRequest("Desayuno Fitness", List.of(item1, item2), false);

            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail))
                    .thenReturn(Optional.of(testUser));
            when(foodService.getFoodById(1L)).thenReturn(avena);
            when(foodService.getFoodById(2L)).thenReturn(leche);

            when(mealRepository.save(any(Meal.class))).thenAnswer(invocation -> {
                Meal mealToSave = invocation.getArgument(0);
                mealToSave.setId(10L);
                return mealToSave;
            });

            MealResponse response = mealService.createMeal(request, userEmail);

            assertNotNull(response);
            assertEquals(10L, response.id());
            assertEquals("Desayuno Fitness", response.name());
            assertEquals(2, response.items().size());
            assertEquals(500.0, response.totalCalories());
            assertEquals(19.4, response.totalProtein(), 0.001);
            assertEquals(0, response.likesCount());

            verify(userRepository, times(1)).findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail);
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
        @DisplayName("Debe lanzar ResourceNotFoundException si la comida no existe o no es del usuario")
        void getMealById_WhenNotFound_ShouldThrowException() {
            when(mealRepository.findByIdAndUserEmail(99L, userEmail)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                mealService.getMealById(99L, userEmail);
            });

            verify(mealRepository, times(1)).findByIdAndUserEmail(99L, userEmail);
        }

        @Test
        @DisplayName("Debe devolver la comida calculada si existe y pertenece al usuario")
        void getMealById_WhenExists_ShouldReturnMealResponse() {
            Meal meal = new Meal("Comida Simple");
            meal.setId(1L);
            meal.setUser(testUser);
            meal.addItem(avena, 100.0);

            when(mealRepository.findByIdAndUserEmail(1L, userEmail)).thenReturn(Optional.of(meal));

            MealResponse response = mealService.getMealById(1L, userEmail);

            assertNotNull(response);
            assertEquals(1L, response.id());
            assertEquals(370.0, response.totalCalories());
            verify(mealRepository, times(1)).findByIdAndUserEmail(1L, userEmail);
        }
    }

    // ==========================================
    // 3. ACTUALIZACIÓN (PUT)
    // ==========================================
    @Nested
    @DisplayName("Actualización de Comidas")
    class UpdateTests {

        @Test
        @DisplayName("Debe recalcular los macros tras actualizar ingredientes")
        void updateMeal_ShouldRecalculateTotals() {
            Meal existingMeal = new Meal("Desayuno Antiguo");
            existingMeal.setId(1L);
            existingMeal.setUser(testUser);
            existingMeal.addItem(avena, 100.0);

            MealRequest updateRequest = new MealRequest("Desayuno Nuevo", List.of(new MealItemRequest(2L, 200.0)), false);

            when(mealRepository.findByIdAndUserEmail(1L, userEmail)).thenReturn(Optional.of(existingMeal));
            when(foodService.getFoodById(2L)).thenReturn(leche);
            when(mealRepository.save(any(Meal.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MealResponse response = mealService.updateMeal(1L, updateRequest, userEmail);

            assertNotNull(response);
            assertEquals("Desayuno Nuevo", response.name());
            assertEquals(1, response.items().size());
            assertEquals(130.0, response.totalCalories());
            verify(mealRepository, times(1)).save(existingMeal);
        }
    }

    // ==========================================
    // 4. ELIMINACIÓN (DELETE)
    // ==========================================
    @Nested
    @DisplayName("Eliminación de Comidas")
    class DeleteTests {

        @Test
        @DisplayName("Debe eliminar la comida si pertenece al usuario")
        void deleteMeal_WhenExists_ShouldDelete() {
            Meal meal = new Meal("A borrar");
            meal.setId(1L);
            meal.setUser(testUser);

            when(mealRepository.findByIdAndUserEmail(1L, userEmail)).thenReturn(Optional.of(meal));
            doNothing().when(mealRepository).delete(meal);

            assertDoesNotThrow(() -> mealService.deleteMeal(1L, userEmail));

            verify(mealRepository, times(1)).delete(meal);
        }
    }

    // ==========================================
    // 5. COMUNIDAD, CLONADO Y LIKES
    // ==========================================
    @Nested
    @DisplayName("Comunidad, Clonado y Likes")
    class CommunityAndCloneTests {

        @Test
        @DisplayName("Debe devolver comidas públicas ordenadas por más recientes")
        void getCommunityMeals_WhenSortRecent_ShouldReturnRecentPublicMeals() {
            Meal publicMeal = new Meal("Bowl Público");
            publicMeal.setId(1L);
            publicMeal.setUser(testUser);
            publicMeal.setPublic(true);

            when(mealRepository.findByIsPublicTrueOrderByCreatedAtDesc()).thenReturn(List.of(publicMeal));

            List<MealResponse> result = mealService.getCommunityMeals(null, "recent");

            assertNotNull(result);
            assertEquals(1, result.size());
            assertTrue(result.get(0).isPublic());
            assertEquals("user", result.get(0).authorNickname());
            verify(mealRepository, times(1)).findByIsPublicTrueOrderByCreatedAtDesc();
        }

        @Test
        @DisplayName("Debe devolver comidas públicas ordenadas por más valoradas (top)")
        void getCommunityMeals_WhenSortTop_ShouldReturnTopRatedPublicMeals() {
            Meal publicMeal = new Meal("Bowl Popular");
            publicMeal.setId(1L);
            publicMeal.setUser(testUser);
            publicMeal.setPublic(true);

            when(mealRepository.findTopRatedPublicMeals()).thenReturn(List.of(publicMeal));

            List<MealResponse> result = mealService.getCommunityMeals(null, "top");

            assertNotNull(result);
            assertEquals(1, result.size());
            verify(mealRepository, times(1)).findTopRatedPublicMeals();
        }

        @Test
        @DisplayName("Debe alternar Like (dar like y luego quitar like)")
        void toggleLike_ShouldAddAndRemoveLike() {
            Meal publicMeal = new Meal("Comida Para Votar");
            publicMeal.setId(10L);
            publicMeal.setPublic(true);

            when(mealRepository.findById(10L)).thenReturn(Optional.of(publicMeal));
            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail))
                    .thenReturn(Optional.of(testUser));
            when(mealRepository.save(any(Meal.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // 1. Dar Like
            MealResponse responseWithLike = mealService.toggleLike(10L, userEmail);
            assertEquals(1, responseWithLike.likesCount());
            assertTrue(publicMeal.getLikedByUsers().contains(testUser));

            // 2. Quitar Like (Unlike)
            MealResponse responseWithoutLike = mealService.toggleLike(10L, userEmail);
            assertEquals(0, responseWithoutLike.likesCount());
            assertFalse(publicMeal.getLikedByUsers().contains(testUser));
        }

        @Test
        @DisplayName("Debe lanzar excepción al intentar dar like a una comida privada")
        void toggleLike_WhenPrivate_ShouldThrowException() {
            Meal privateMeal = new Meal("Comida Privada");
            privateMeal.setId(15L);
            privateMeal.setPublic(false);

            when(mealRepository.findById(15L)).thenReturn(Optional.of(privateMeal));

            assertThrows(ResourceNotFoundException.class, () -> {
                mealService.toggleLike(15L, userEmail);
            });

            verify(mealRepository, never()).save(any());
        }

        @Test
        @DisplayName("Debe clonar una comida pública y añadir a la despensa los ingredientes que falten")
        void cloneMeal_WhenPublic_ShouldCloneAndPropagateMissingFoodsToPantry() {
            User author = new User("carlos", "carlos@gmail.com", "pass", Role.ROLE_USER);
            Meal originalMeal = new Meal("Desayuno de Carlos");
            originalMeal.setId(50L);
            originalMeal.setUser(author);
            originalMeal.setPublic(true);
            originalMeal.addItem(avena, 100.0);

            testUser.getFoods().clear(); // El usuario que clona no tiene avena

            when(mealRepository.findById(50L)).thenReturn(Optional.of(originalMeal));
            when(userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail))
                    .thenReturn(Optional.of(testUser));
            when(mealRepository.save(any(Meal.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MealResponse clonedResponse = mealService.cloneMeal(50L,null,  userEmail);

            assertNotNull(clonedResponse);
            assertEquals("Desayuno de Carlos", clonedResponse.name());
            assertFalse(clonedResponse.isPublic());

            assertTrue(testUser.getFoods().contains(avena));
            verify(userRepository, times(1)).save(testUser);
            verify(mealRepository, times(1)).save(any(Meal.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si se intenta clonar una comida privada de otro usuario")
        void cloneMeal_WhenPrivateAndNotOwner_ShouldThrowException() {
            User author = new User("carlos", "carlos@gmail.com", "pass", Role.ROLE_USER);
            Meal privateMeal = new Meal("Comida Secreta");
            privateMeal.setId(60L);
            privateMeal.setUser(author);
            privateMeal.setPublic(false);

            when(mealRepository.findById(60L)).thenReturn(Optional.of(privateMeal));

            assertThrows(ResourceNotFoundException.class, () -> {
                mealService.cloneMeal(60L,null,  userEmail);
            });

            verify(userRepository, never()).save(any());
            verify(mealRepository, never()).save(any());
        }
    }
}