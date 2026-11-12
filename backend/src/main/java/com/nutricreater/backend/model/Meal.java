
package com.nutricreater.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "meals")
public class Meal {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name =  "user_id", nullable = false)
    private User user;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealItem> items = new ArrayList<>();

    @Column(nullable = false)
    private boolean isPublic = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "meal_likes",
            joinColumns = @JoinColumn(name = "meal_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likedByUsers = new HashSet<>();


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

    public User getUser() { return user; }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<MealItem> getItems() {
        return items;
    }

    public void setUser(User user) { this.user = user; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setItems(List<MealItem> items) {
        this.items = items;
    }

    public boolean isPublic() {return isPublic;}

    public void setPublic(boolean aPublic){
        this.isPublic = aPublic;
    }

    public int getLikesCount() {
        return likedByUsers.size();
    }

    public Set<User> getLikedByUsers(){
        return likedByUsers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
