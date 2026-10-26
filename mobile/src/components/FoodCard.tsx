import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Food} from '../types/';

interface FoodCardProps {
    food: Food;
    onPress: () => void;
}

export function FoodCard({ food, onPress }: FoodCardProps) {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7} // Pequeño efecto visual al pulsar
    >
      <View style={styles.infoContainer}>
        <Text style={styles.foodName}>{food.name}</Text>
        <View style={styles.macrosContainer}>
          <Text style={[styles.macroBadge, styles.kcalBadge]}>
            🔥 {food.calories} kcal
          </Text>
          <Text style={[styles.macroBadge, styles.proteinBadge]}>
            🥩 {food.protein}g P
          </Text>
          <Text style={[styles.macroBadge, styles.carbBadge]}>
            🍚 {food.carbohydrates}g C
          </Text>
          <Text style={[styles.macroBadge, styles.fatBadge]}>
            🥑 {food.fat}g G
          </Text>
        </View>
      </View>
      <Text style={styles.addIcon}>+ Añadir</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row', // Coloca el contenido y el "+ Añadir" en horizontal
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2, // Sombra suave en Android
    shadowColor: '#000', // Sombra suave en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  macroBadge: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  kcalBadge: { backgroundColor: '#fff3e0', color: '#e65100' },
  proteinBadge: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  carbBadge: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  fatBadge: { backgroundColor: '#fce4ec', color: '#c2185b' },
  addIcon: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
  },
});