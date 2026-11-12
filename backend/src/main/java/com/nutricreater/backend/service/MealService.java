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
        meal.setPublic(Boolean.TRUE.equals(request.isPublic()));

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
        if (request.isPublic() != null) {
            toUpdate.setPublic(request.isPublic());
        }
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
                totalSalt,
                meal.isPublic(),
                meal.getUser() != null ? meal.getUser().getNickname() : "Comunidad",
                meal.getLikesCount(),
                meal.getCreatedAt()
        );
    }

    public List<MealResponse> getCommunityMeals(String search, String sort) {
        boolean isTop = "top".equalsIgnoreCase(sort);
        boolean hasSearch = search != null && !search.isBlank();

        List<Meal> meals;

        if (isTop) {
            meals = hasSearch
                    ? mealRepository.findTopRatedPublicMealsByName(search)
                    : mealRepository.findTopRatedPublicMeals();
        } else {
            meals = hasSearch
                    ? mealRepository.findByIsPublicTrueAndNameContainingIgnoreCaseOrderByCreatedAtDesc(search)
                    : mealRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        }

        return meals.stream().map(this::mapToResponse).toList();


    }

    @Transactional
    public MealResponse cloneMeal(Long mealId,String customName, String userEmail){
        // Buscar la comida original
        Meal originalMeal = mealRepository.findById(mealId)
                .orElseThrow(() -> new ResourceNotFoundException("Comida no encontrada con ID: " + mealId));

        // Validar que sea pública (o que sea del propio usuario)
        if (!originalMeal.isPublic() && !originalMeal.getUser().getEmail().equalsIgnoreCase(userEmail)){
            throw new ResourceNotFoundException("No tienes permiso para clonar esta comida");
        }

        // Buscar al usuario que clona
        User currentUser = userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Crear la copia de la comida
        Meal clonedMeal = new Meal();

        // Si el usuario escribió un nombre se usa, si no se deja el original.
        String finalName = (customName != null && !customName.isBlank())
                ? customName.trim()
                : originalMeal.getName();

        clonedMeal.setName(finalName);
        clonedMeal.setUser(currentUser);
        clonedMeal.setPublic(false);

        // Prorpagar ingredientes.
        for (MealItem item: originalMeal.getItems()){
            Food food = item.getFood();

            if(!currentUser.getFoods().contains(food)){
                currentUser.addFood(food);
            }

            clonedMeal.addItem(food, item.getQuantityInGrams());
        }

        userRepository.save(currentUser);
        Meal saved = mealRepository.save(clonedMeal);
        return  mapToResponse(saved);

    }

    @Transactional
    public MealResponse toggleLike(Long mealId, String userEmail){
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new ResourceNotFoundException("Comida no encontrada con Id : " + mealId));

        if(!meal.isPublic()){
            throw new ResourceNotFoundException("No se puede dar like a una comida privada");
        }

        User user = userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Si ya le dio like, lo quitamos (unlike). Si no lo añadimos (like)
        if(meal.getLikedByUsers().contains(user)){
            meal.getLikedByUsers().remove(user);
        } else {
            meal.getLikedByUsers().add(user);
        }

        Meal saved = mealRepository.save(meal);
        return mapToResponse(saved);
    }



}
