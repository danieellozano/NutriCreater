
package com.nutricreater.backend.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meals")
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealItem> items = new ArrayList<>();

    public Meal() {
    }

    public Meal(String name) {
        this.name = name;
    }

    // Método de conveniencia para añadir items manteniendo la relación bidireccional
    public void addItem(Food food, Double quantityInGrams){
        MealItem item = new MealItem(food, this, quantityInGrams);
        this.items.add(item);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<MealItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setItems(List<MealItem> items) {
        this.items = items;
    }
}
