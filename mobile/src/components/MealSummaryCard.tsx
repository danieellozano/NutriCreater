import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MealResponse } from '../types';

interface MealSummaryCardProps {
  meal: MealResponse;
}

export function MealSummaryCard({ meal }: MealSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>✨ {meal.name} (Calculado por Spring Boot)</Text>
      <View style={styles.macrosGrid}>
        <Text style={styles.badge}>🔥 {meal.totalCalories.toFixed(1)} kcal</Text>
        <Text style={styles.badge}>🥩 {meal.totalProtein.toFixed(1)}g P</Text>
        <Text style={styles.badge}>🍚 {meal.totalCarbohydrates.toFixed(1)}g C</Text>
        <Text style={styles.badge}>🥑 {meal.totalFat.toFixed(1)}g G</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  title: {
    color: '#4caf50',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});