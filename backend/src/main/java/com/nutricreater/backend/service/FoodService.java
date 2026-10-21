package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.FoodRequest;
import com.nutricreater.backend.exception.ResourceAlreadyExistsException;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.repository.FoodRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {

    private  final FoodRepository  repository;

    public FoodService (FoodRepository repository) {
        this.repository = repository;
    }

    // Devolver la lista completa de Foods.
    public List<Food> getAllFoods(){
        return repository.findAll();
    }

    public Food getFoodById(Long id){
        return repository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Food no encontrada con ID: " + id));
    }

    public List<Food> searchFoodsByName(String name){
        return repository.findByNameContainingIgnoreCase(name);
    }

    public Food createFood(FoodRequest request){
        if (repository.existsByNameIgnoreCase(request.name())) {
            throw new ResourceAlreadyExistsException("Ya existe un alimento con el nombre: " + request.name());
        }
        return repository.save(new Food(
                request.name(),
                request.calories(),
                request.protein(),
                request.carbohydrates(),
                request.fat(),
                request.fiber() != null ? request.fiber() : 0.0,
                request.salt() != null ? request.salt() : 0.0
        ));
    }

    public Food updateFood(Long id, FoodRequest request){
        Food toUpdate = getFoodById(id);
        toUpdate.setName(request.name());
        toUpdate.setCalories(request.calories());
        toUpdate.setProtein(request.protein());
        toUpdate.setCarbohydrates(request.carbohydrates());
        toUpdate.setFat(request.fat());
        toUpdate.setFiber(request.fiber() != null ? request.fiber() : 0.0);
        toUpdate.setSalt(request.salt() != null ? request.salt() : 0.0);
        return repository.save(toUpdate);
    }

    public void deleteFood(Long id){
        Food toDelete = getFoodById(id);
        repository.delete(toDelete);
    }


}
