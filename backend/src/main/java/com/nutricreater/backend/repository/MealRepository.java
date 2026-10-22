package com.nutricreater.backend.repository;

import com.nutricreater.backend.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByNameContainingIgnoreCase(String name);

}
