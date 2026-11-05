package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.MealItemRequest;
import com.nutricreater.backend.dto.MealItemResponse;
import com.nutricreater.backend.dto.MealRequest;
import com.nutricreater.backend.dto.MealResponse;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.model.Meal;
import com.nutricreater.backend.model.MealItem;
import com.nutricreater.backend.model.User;
import com.nutricreater.backend.repository.MealRepository;
import com.nutricreater.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;
    private final FoodService foodService;
    private final UserRepository userRepository;

    public MealService(MealRepository repository, FoodService foodService, UserRepository userRepository) {
        this.mealRepository = repository;
        this.foodService = foodService;
        this.userRepository = userRepository;
    }

    // Método privado auxiliar para verificar pertenencia (evita vulnerabilidad IDOR)
    private Meal findUserMealEntity(Long id, String userEmail) {
        return mealRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Comida no encontrada o no pertenece a tu usuario"));
    }

    // 1. Obtener todas las comidas del usuario
    public List<MealResponse> getAllMeals(String userEmail) {
        return mealRepository.findByUserEmail(userEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 2. Buscar comidas del usuario por nombre
    public List<MealResponse> getMealsByName(String userEmail, String name) {
        return mealRepository.findByUserEmailAndNameContainingIgnoreCase(userEmail, name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 3. Obtener una comida por ID asegurando que sea suya
    public MealResponse getMealById(Long id, String userEmail) {
        return mapToResponse(findUserMealEntity(id, userEmail));
    }

    // 4. Crear comida vinculada al usuario
    @Transactional
    public MealResponse createMeal(MealRequest request, String userEmail) {
        User user = userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + userEmail));

        Meal meal = new Meal();
        meal.setName(request.name());
        meal.setUser(user);

        for (MealItemRequest itemRequest : request.items()) {
            Food food = foodService.getFoodById(itemRequest.foodId());
            meal.addItem(food, itemRequest.quantityInGrams());
        }

        Meal saved = mealRepository.save(meal);
        return mapToResponse(saved);
    }

    // 5. Actualizar comida del usuario
    @Transactional
    public MealResponse updateMeal(Long id, MealRequest request, String userEmail) {
        Meal toUpdate = findUserMealEntity(id, userEmail);
        toUpdate.setName(request.name());
        toUpdate.getItems().clear();

        for (MealItemRequest item : request.items()) {
            Food food = foodService.getFoodById(item.foodId());
            toUpdate.addItem(food, item.quantityInGrams());
        }

        Meal saved = mealRepository.save(toUpdate);
        return mapToResponse(saved);
    }

    // 6. Eliminar comida del usuario
    @Transactional
    public void deleteMeal(Long id, String userEmail) {
        Meal toDelete = findUserMealEntity(id, userEmail);
        mealRepository.delete(toDelete);
    }

    // 7. Cálculo matemático de macronutrientes (Exactamente igual que antes)
    private MealResponse mapToResponse(Meal meal) {
        Double totalCalories = 0.0;
        Double totalProteins = 0.0;
        Double totalCarbs = 0.0;
        Double totalFat = 0.0;
        Double totalFiber = 0.0;
        Double totalSalt = 0.0;

        List<MealItemResponse> itemResponses = new ArrayList<>();

        for (MealItem item : meal.getItems()) {
            double factor = item.getQuantityInGrams() / 100.0;
            Food food = item.getFood();

            double itemCalories = factor * food.getCalories();
            double itemProtein = factor * food.getProtein();
            double itemCarbs = factor * food.getCarbohydrates();
            double itemFat = factor * food.getFat();
            double itemFiber = (food.getFiber() != null) ? factor * food.getFiber() : 0.0;
            double itemSalt = (food.getSalt() != null) ? factor * food.getSalt() : 0.0;

            totalCalories += itemCalories;
            totalProteins += itemProtein;
            totalCarbs += itemCarbs;
            totalFat += itemFat;
            totalFiber += itemFiber;
            totalSalt += itemSalt;

            itemResponses.add(new MealItemResponse(
                    item.getId(),
                    food.getId(),
                    food.getName(),
                    item.getQuantityInGrams(),
                    itemCalories,
                    itemProtein,
                    itemCarbs,
                    itemFat,
                    itemFiber,
                    itemSalt
            ));
        }

        return new MealResponse(
                meal.getId(),
                meal.getName(),
                itemResponses,
                totalCalories,
                totalProteins,
                totalCarbs,
                totalFat,
                totalFiber,
                totalSalt
        );
    }
}