package com.nutricreater.backend.repository;

import com.nutricreater.backend.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {

    List<Food> findByNameContainingIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}