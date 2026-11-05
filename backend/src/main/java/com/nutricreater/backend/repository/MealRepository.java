package com.nutricreater.backend.repository;

import com.nutricreater.backend.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByNameContainingIgnoreCase(String name);

    // Obtener comidas de un usuario concreto
    List<Meal> findByUserEmail(String email);

    // Filtrar comidas del usuario por nombre
    List<Meal> findByUserEmailAndNameContainingIgnoreCase(String email, String name);

    Optional<Meal> findByIdAndUserEmail(Long id, String email);
}
