
package com.nutricreater.backend.service;

import com.nutricreater.backend.dto.FoodRequest;
import com.nutricreater.backend.exception.ResourceAlreadyExistsException;
import com.nutricreater.backend.exception.ResourceNotFoundException;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.model.User;
import com.nutricreater.backend.repository.FoodRepository;
import com.nutricreater.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FoodService {

    private  final FoodRepository  repository;
    private final UserRepository userRepository;

    public FoodService (FoodRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    // Devolver la lista completa de Foods.
    public List<Food> getAllFoods(String userEmail){

        return repository.findByUserEmail(userEmail);
    }

    public Food getFoodById(Long id){
        return repository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Food no encontrada con ID: " + id));
    }

    public List<Food> searchFoodsByName(String name, String userEmail){
        return repository.findByUserEmailAndNameContaining(userEmail,name);
    }

    @Transactional
    public Food createFood(FoodRequest request, String userEmail){
        User user = userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userEmail));

        boolean yaExisteEnMiDespensa = user.getFoods().stream()
                .anyMatch(f -> f.getName().equalsIgnoreCase(request.name()));

        if (yaExisteEnMiDespensa) {
            throw new ResourceAlreadyExistsException("Ya tienes un alimento con este nombre en tu despensa: " + request.name());
        }

        Food created = this.repository.save(new Food(
                request.name(),
                request.calories(),
                request.protein(),
                request.carbohydrates(),
                request.fat(),
                request.fiber() != null ? request.fiber() : 0.0,
                request.salt() != null ? request.salt() : 0.0
        ));

        user.addFood(created);
        userRepository.save(user);

        return created;
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

    @Transactional
    public void deleteFood(Long id, String userEmail){
        User user = userRepository.findByEmailIgnoreCaseOrNicknameIgnoreCase(userEmail, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userEmail));

        Food toDelete = getFoodById(id);

        user.getFoods().remove(toDelete);
        userRepository.save(user);
    }


}
