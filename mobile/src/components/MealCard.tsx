import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MealResponse } from '../types';

interface MealCardProps {
  meal: MealResponse;
  onPress?: () => void;
  onDelete: (id: number) => void;
}

export function MealCard({ meal, onPress, onDelete }: MealCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      {/* Cabecera con Nombre y Botón Eliminar */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {meal.name || 'Comida sin nombre'}
        </Text>
        <TouchableOpacity
          onPress={() => onDelete(meal.id)}
          accessibilityRole="button"
          accessibilityLabel="Eliminar comida"
          hitSlop={10}
        >
          <Text style={styles.delete}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      {/* Badges de Macros Totales Calculados */}
      <View style={styles.macros}>
        <Text style={styles.badge}>🔥 {meal.totalCalories.toFixed(1)} kcal</Text>
        <Text style={styles.badge}>🥩 {meal.totalProtein.toFixed(1)}g P</Text>
        <Text style={styles.badge}>🍚 {meal.totalCarbohydrates.toFixed(1)}g C</Text>
        <Text style={styles.badge}>🥑 {meal.totalFat.toFixed(1)}g G</Text>
      </View>

      {/* Lista de Ingredientes con sus Gramajes */}
      <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
      <Text style={styles.ingredients}>
        {meal.items && meal.items.length > 0
          ? meal.items
              .map(item => `${item.foodName} (${item.quantityInGrams}g)`)
              .join(', ')
          : 'Sin ingredientes registrados'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 10,
  },
  delete: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ingredientsTitle: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  ingredients: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default MealCard;