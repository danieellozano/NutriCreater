import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MealResponse } from '../types';

interface MealDetailModalProps {
  visible: boolean;
  meal: MealResponse | null;
  onClose: () => void;
  onEdit?: (meal: MealResponse) => void; // Opcional (solo disponible en tus propias comidas)
}

export function MealDetailModal({ visible, meal, onClose, onEdit }: MealDetailModalProps) {
  if (!meal) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Cabecera del modal */}
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.title} numberOfLines={2}>
                {meal.name}
              </Text>
              {meal.authorNickname && (
                <Text style={styles.author}>👨‍🍳 Receta de @{meal.authorNickname}</Text>
              )}
            </View>

            {/* Botones de acción en cabecera */}
            <View style={styles.headerActions}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.editModalBtn}
                  onPress={() => {
                    onClose();
                    onEdit(meal);
                  }}
                  hitSlop={6}
                >
                  <Text style={styles.editModalBtnText}>✏️ Editar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={6}>
                <Text style={styles.closeBtnText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tarjeta de Totales Agregados */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📊 Totales Nutricionales del Plato</Text>
              <View style={styles.macrosGrid}>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{meal.totalCalories.toFixed(0)}</Text>
                  <Text style={styles.macroLabel}>🔥 Kcal</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{meal.totalProtein.toFixed(1)}g</Text>
                  <Text style={styles.macroLabel}>🥩 Proteína</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{meal.totalCarbohydrates.toFixed(1)}g</Text>
                  <Text style={styles.macroLabel}>🍚 Carbos</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{meal.totalFat.toFixed(1)}g</Text>
                  <Text style={styles.macroLabel}>🥑 Grasa</Text>
                </View>
              </View>

              {(meal.totalFiber !== undefined || meal.totalSalt !== undefined) && (
                <View style={styles.microRow}>
                  <Text style={styles.microText}>
                    🌾 Fibra: {(meal.totalFiber ?? 0).toFixed(1)}g
                  </Text>
                  <Text style={styles.microText}>
                    🧂 Sal: {(meal.totalSalt ?? 0).toFixed(2)}g
                  </Text>
                </View>
              )}
            </View>

            {/* Tabla con el desglose de ingredientes */}
            <Text style={styles.sectionHeading}>Desglose por Ingrediente</Text>

            <View style={styles.table}>
              {/* Encabezado de la tabla */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.cell, styles.colName, styles.headerCell]}>Alimento</Text>
                <Text style={[styles.cell, styles.colGrams, styles.headerCell]}>Peso</Text>
                <Text style={[styles.cell, styles.colNum, styles.headerCell]}>Kcal</Text>
                <Text style={[styles.cell, styles.colNum, styles.headerCell]}>Prot</Text>
                <Text style={[styles.cell, styles.colNum, styles.headerCell]}>Carb</Text>
                <Text style={[styles.cell, styles.colNum, styles.headerCell]}>Gra</Text>
              </View>

              {/* Filas de la tabla */}
              {meal.items && meal.items.length > 0 ? (
                meal.items.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                    ]}
                  >
                    <Text style={[styles.cell, styles.colName]} numberOfLines={1}>
                      {item.foodName}
                    </Text>
                    <Text style={[styles.cell, styles.colGrams]}>{item.quantityInGrams}g</Text>
                    <Text style={[styles.cell, styles.colNum]}>{item.calories.toFixed(0)}</Text>
                    <Text style={[styles.cell, styles.colNum]}>{item.protein.toFixed(1)}</Text>
                    <Text style={[styles.cell, styles.colNum]}>{item.carbohydrates.toFixed(1)}</Text>
                    <Text style={[styles.cell, styles.colNum]}>{item.fat.toFixed(1)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Sin ingredientes registrados.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  author: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  editModalBtn: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editModalBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  closeBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  macrosGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  macroBox: { alignItems: 'center' },
  macroValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  macroLabel: { color: '#CBD5E1', fontSize: 11, marginTop: 2 },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  microText: { color: '#94A3B8', fontSize: 12 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 10 },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeader: { backgroundColor: '#F3F4F6', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  rowEven: { backgroundColor: '#FFFFFF' },
  rowOdd: { backgroundColor: '#F9FAFB' },
  cell: { fontSize: 12, color: '#374151' },
  headerCell: { fontWeight: '700', color: '#1F2937' },
  colName: { flex: 2.5, fontWeight: '500' },
  colGrams: { flex: 1.2, textAlign: 'center' },
  colNum: { flex: 1, textAlign: 'center' },
  emptyText: { textAlign: 'center', padding: 20, color: '#9CA3AF' },
});