package com.nutricreater.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "meal_items")
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @Column(nullable = false)
    private Double quantityInGrams;

    public MealItem(){}

    public MealItem(Food food, Meal meal, Double quantityInGrams) {
        this.food = food;
        this.meal = meal;
        this.quantityInGrams = quantityInGrams;
    }

    public Long getId() {
        return id;
    }

    public Food getFood() {
        return food;
    }

    public Meal getMeal() {
        return meal;
    }

    public Double getQuantityInGrams() {
        return quantityInGrams;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFood(Food food) {
        this.food = food;
    }

    public void setMeal(Meal meal) {
        this.meal = meal;
    }

    public void setQuantityInGrams(Double quantityInGrams) {
        this.quantityInGrams = quantityInGrams;
    }
}
