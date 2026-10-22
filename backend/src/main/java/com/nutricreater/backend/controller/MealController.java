package com.nutricreater.backend.controller;

import com.nutricreater.backend.dto.MealRequest;
import com.nutricreater.backend.dto.MealResponse;
import com.nutricreater.backend.service.MealService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealService service;

    public MealController(MealService service) { this.service = service;}

    @GetMapping
    public List<MealResponse> getMeals(@RequestParam(required = false) String search){
        if (search != null && !search.isBlank()){
            return service.getMealsByName(search);
        }
        return service.getAllMeals();
    }

    @GetMapping("/{id}")
    public MealResponse getMealById(@PathVariable Long id){ return service.getMealById(id);}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealResponse createMeal(@Valid @RequestBody MealRequest request) {
        return service.createMeal(request);
    }

    @PutMapping("/{id}")
    public MealResponse updateMeal(@PathVariable Long id, @Valid @RequestBody MealRequest request) {
        return service.updateMeal(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeal(@PathVariable Long id) {
        service.deleteMeal(id);
    }

}
