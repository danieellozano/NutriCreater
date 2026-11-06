package com.nutricreater.backend.repository;

import com.nutricreater.backend.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {

    List<Food> findByNameContainingIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT f FROM User u JOIN u.foods f WHERE u.email = :email")
    List<Food> findByUserEmail(@Param("email") String email);

    @Query("SELECT f FROM User u JOIN u.foods f WHERE u.email = :email AND LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Food> findByUserEmailAndNameContaining(@Param("email") String email, @Param("name") String name);
}