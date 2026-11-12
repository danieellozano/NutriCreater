package com.nutricreater.backend.repository;

import com.nutricreater.backend.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByNameContainingIgnoreCase(String name);

    // Obtener comidas de un usuario concreto
    List<Meal> findByUserEmail(String email);

    // Filtrar comidas del usuario por nombre
    List<Meal> findByUserEmailAndNameContainingIgnoreCase(String email, String name);

    Optional<Meal> findByIdAndUserEmail(Long id, String email);

    // Obtener todas las comidas públicas del feed
    List<Meal> findByIsPublicTrue();

    // Buscar en el feed público por nombre
    List<Meal> findByPublicTrueAndNameContainingIgnoreCase(String name);

    //  Más recientes (por fecha descendente)
    List<Meal> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Meal> findByIsPublicTrueAndNameContainingIgnoreCaseOrderByCreatedAtDesc(String name);

    // Más valoradas (por cantidad de likes)
    @Query("SELECT m FROM Meal m WHERE m.isPublic = true ORDER BY size(m.likedByUsers) DESC, m.createdAt DESC")
    List<Meal> findTopRatedPublicMeals();

    @Query("SELECT m FROM Meal m WHERE m.isPublic = true AND LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY size(m.likedByUsers) DESC, m.createdAt DESC")
    List<Meal> findTopRatedPublicMealsByName(@Param("name") String name);

}
