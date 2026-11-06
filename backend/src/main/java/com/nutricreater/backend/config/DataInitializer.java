package com.nutricreater.backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricreater.backend.model.Food;
import com.nutricreater.backend.repository.FoodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.List;

@Configuration
public class DataInitializer {

    private final FoodRepository foodRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public DataInitializer(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            if (foodRepository.count() == 0) {
                try (InputStream is = new ClassPathResource("foods.json").getInputStream()) {
                    List<Food> foods = mapper.readValue(is, new TypeReference<List<Food>>() {});
                    foodRepository.saveAll(foods);
                }
            }
        };
    }
}