import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Share } from 'react-native';
import { MealResponse } from '../types';

interface MealCardProps {
  meal: MealResponse;
  onPress?: () => void;
  onDelete?: (id: number) => void;
  onClone?: (id: number) => void;
  onLike?: (id: number) => void;
  onEdit?: (meal: MealResponse) => void;
}

export function MealCard({ meal, onPress, onDelete, onClone, onLike, onEdit }: MealCardProps) {
  const handleShare = async () => {
    try {
      const macrosText = `${meal.totalCalories.toFixed(0)} kcal | ${meal.totalProtein.toFixed(0)}g P | ${meal.totalCarbohydrates.toFixed(0)}g C | ${meal.totalFat.toFixed(0)}g G`;
      await Share.share({
        message: `🥑 ¡Mira este plato en NutriCreater!\n"${meal.name}"\n🔥 Macros: ${macrosText}\n👨‍🍳 Creado por @${meal.authorNickname || 'Comunidad'}`,
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      {/* Cabecera con Nombre, Autor y Botones de acción */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {meal.name || 'Comida sin nombre'}
          </Text>
          {meal.authorNickname && (
            <Text style={styles.authorText}>👤 @{meal.authorNickname}</Text>
          )}
        </View>

        {/* Botones de acción (sin duplicados) */}
        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(meal)} hitSlop={8}>
              <Text style={styles.editBtn}>✏️ Editar</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(meal.id)} hitSlop={8}>
              <Text style={styles.deleteBtn}>Eliminar</Text>
            </TouchableOpacity>
          )}

          {onClone && (
            <TouchableOpacity onPress={() => onClone(meal.id)} hitSlop={8}>
              <Text style={styles.cloneBtn}>📥 Guardar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Badges de Macros */}
      <View style={styles.macros}>
        <Text style={styles.badge}>🔥 {meal.totalCalories.toFixed(1)} kcal</Text>
        <Text style={styles.badge}>🥩 {meal.totalProtein.toFixed(1)}g P</Text>
        <Text style={styles.badge}>🍚 {meal.totalCarbohydrates.toFixed(1)}g C</Text>
        <Text style={styles.badge}>🥑 {meal.totalFat.toFixed(1)}g G</Text>
      </View>

      {/* Ingredientes */}
      <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
      <Text style={styles.ingredients}>
        {meal.items && meal.items.length > 0
          ? meal.items.map(item => `${item.foodName} (${item.quantityInGrams}g)`).join(', ')
          : 'Sin ingredientes registrados'}
      </Text>

      {/* Pie de tarjeta: Botón Like y Botón Compartir */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={() => onLike && onLike(meal.id)}
          disabled={!onLike}
        >
          <Text style={styles.likeText}>❤️ {meal.likesCount ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>📤 Compartir</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  authorText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  editBtn: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteBtn: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cloneBtn: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
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
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  likeText: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  shareText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MealCard;