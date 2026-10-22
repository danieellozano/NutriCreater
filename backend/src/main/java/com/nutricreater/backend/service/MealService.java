package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.MealItemRequest;
import com.nutricreater.backend.dto.MealItemResponse;
import com.nutricreater.backend.dto.MealRequest;
import com.nutricreater.backend.dto.MealResponse;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.model.Meal;
import com.nutricreater.backend.model.MealItem;
import com.nutricreater.backend.repository.MealRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;
    private final FoodService foodService;

    public MealService(MealRepository repository, FoodService foodService){
        this.mealRepository = repository;
        this.foodService = foodService;
    }

    private Meal findMealEntityById(Long id) {
        return mealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comida no encontrada con ID: " + id));
    }

    public List<MealResponse> getAllMeals() {
        return mealRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<MealResponse> getMealsByName(String name) {
        return mealRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public MealResponse getMealById(Long id) {
        return mapToResponse(findMealEntityById(id));
    }

    @Transactional
    public MealResponse createMeal(MealRequest request){
        Meal created = new Meal();
        created.setName(request.name());

        // Recorrer la lista de ingredientes.
        for (MealItemRequest itemRequest : request.items()){
            // Buscar el alimento en la base de datos.
            Food food = foodService.getFoodById(itemRequest.foodId());
            // Añadir el alimento a la comida.
            created.addItem(food, itemRequest.quantityInGrams());
        }

        // Guardar la comida en la base de datos.
        Meal saved = mealRepository.save(created);

        return mapToResponse(saved);
    }

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

            // Calcular los macros de ESTE cada ingrediente
            double itemCalories = factor * food.getCalories();
            double itemProtein = factor * food.getProtein();
            double itemCarbs = factor * food.getCarbohydrates();
            double itemFat = factor * food.getFat();
            double itemFiber = (food.getFiber() != null) ? factor * food.getFiber() : 0.0;
            double itemSalt = (food.getSalt() != null) ? factor * food.getSalt() : 0.0;

            // Sumar a los acumuladores totales de la comida
            totalCalories += itemCalories;
            totalProteins += itemProtein;
            totalCarbs += itemCarbs;
            totalFat += itemFat;
            totalFiber += itemFiber;
            totalSalt += itemSalt;

            // Guardar el DTO de este ingrediente con sus datos desglosados
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

        // Devolver la respuesta con la lista de DTOs y los totales sumados
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

    @Transactional
    public MealResponse updateMeal(Long id, MealRequest request){
        Meal toUpdate = findMealEntityById(id);
        toUpdate.setName(request.name());
        toUpdate.getItems().clear();
        for (MealItemRequest item : request.items()){
            Food food = foodService.getFoodById(item.foodId());
            toUpdate.addItem(food,item.quantityInGrams());
        }

        Meal saved = mealRepository.save(toUpdate);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteMeal(Long id){
        Meal deleted = findMealEntityById(id);
        this.mealRepository.delete(deleted);
    }
}
