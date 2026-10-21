package com.nutricreater.backend.controller;

import com.nutricreater.backend.dto.FoodRequest;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService service;

    public FoodController(FoodService service) {
        this.service = service;
    }

    @GetMapping
    public List<Food> getFoods(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return service.searchFoodsByName(search);
        }
        return service.getAllFoods();
    }

    @GetMapping("/{id}")
    public Food getFoodById(@PathVariable Long id) {
        return service.getFoodById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Food createFood(@Valid @RequestBody FoodRequest request) {
        return service.createFood(request);
    }

    @PutMapping("/{id}")
    public Food updateFood(@PathVariable Long id, @Valid @RequestBody FoodRequest request) {
        return service.updateFood(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable Long id) {
        service.deleteFood(id);
    }
}