package com.nutricreater.backend.controller;

import com.nutricreater.backend.dto.MealRequest;
import com.nutricreater.backend.dto.MealResponse;
import com.nutricreater.backend.service.MealService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealService service;

    public MealController(MealService service) { this.service = service;}

    @GetMapping
    public List<MealResponse> getMeals(@RequestParam(required = false) String search, Principal principal){
        if (search != null && !search.isBlank()){
            return service.getMealsByName(principal.getName(), search);
        }
        return service.getAllMeals(principal.getName());
    }

    @GetMapping("/{id}")
    public MealResponse getMealById(@PathVariable Long id, Principal principal){ return service.getMealById(id, principal.getName());}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealResponse createMeal(@Valid @RequestBody MealRequest request, Principal principal) {
        return service.createMeal(request, principal.getName());
    }

    @PutMapping("/{id}")
    public MealResponse updateMeal(@PathVariable Long id, @Valid @RequestBody MealRequest request, Principal principal) {
        return service.updateMeal(id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeal(@PathVariable Long id, Principal principal) {
        service.deleteMeal(id, principal.getName());
    }

}
