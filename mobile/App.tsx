import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';

// 1. Importamos nuestros tipos
import { Food, MealResponse } from './src/types';

// 2. Importamos nuestros servicios desacoplados
import { foodService } from './src/services/foodService';
import { mealService } from './src/services/mealService';

// 3. Importamos nuestros componentes reutilizables
import { SearchBar } from './src/components/SearchBar';
import { FoodCard } from './src/components/FoodCard';
import { AddGramsModal } from './src/components/AddGramsModal';
import { MealSummaryCard } from './src/components/MealSummaryCard';

interface PlateItem {
  foodId: number;
  foodName: string;
  quantityInGrams: number;
}

export default function App() {
  // Estados de datos
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para armar el plato actual
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<Food | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Estado del último cálculo devuelto por Spring Boot
  const [lastCalculatedMeal, setLastCalculatedMeal] = useState<MealResponse | null>(null);

  // Cargar alimentos usando foodService
  const loadFoods = async (searchTerm = '') => {
    try {
      setLoading(true);
      const data = await foodService.getAll(searchTerm);
      setFoods(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor Spring Boot');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  // Al pulsar una tarjeta, abrimos el modal
  const handleSelectFood = (food: Food) => {
    setSelectedFoodForModal(food);
    setModalVisible(true);
  };

  // Cuando el modal confirma los gramos, añadimos al plato
  const handleAddGrams = (grams: number) => {
    if (!selectedFoodForModal) return;

    setPlate(prev => [
      ...prev,
      {
        foodId: selectedFoodForModal.id,
        foodName: selectedFoodForModal.name,
        quantityInGrams: grams,
      }
    ]);
    setModalVisible(false);
  };

  // Enviar el plato a Spring Boot usando mealService
  const handleCalculateMeal = async () => {
    if (plate.length === 0) return;

    try {
      const response = await mealService.create({
        name: 'Mi Comida Personalizada',
        items: plate.map(item => ({
          foodId: item.foodId,
          quantityInGrams: item.quantityInGrams,
        })),
      });

      setLastCalculatedMeal(response);
      setPlate([]); // Vaciamos el plato tras guardar
      Alert.alert('¡Éxito!', 'Comida calculada y guardada en Spring Boot');
    } catch (error) {
      Alert.alert('Error', 'No se pudo calcular la comida');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>🥑 NutriCreater</Text>

              {/* 1. Componente: Resumen de macros calculados */}
      {lastCalculatedMeal && <MealSummaryCard meal={lastCalculatedMeal} />}

      {/* 2. Plato en construcción */}
      {plate.length > 0 && (
        <View style={styles.plateContainer}>
          <Text style={styles.plateTitle}>🍽️ Plato actual ({plate.length} ingredientes):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {plate.map((item, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{item.foodName} ({item.quantityInGrams}g)</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.calculateBtn} onPress={handleCalculateMeal}>
            <Text style={styles.calculateBtnText}>🔥 Calcular y Guardar Comida</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Componente: Buscador */}
      <SearchBar
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          loadFoods(text);
        }}
        placeholder="Buscar alimento (ej: pollo, avena)..."
      />

      {/* 4. Lista usando nuestro componente FoodCard */}
      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FoodCard food={item} onPress={() => handleSelectFood(item)} />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay alimentos disponibles</Text>
          }
        />
      )}
      </View>



      {/* 5. Componente: Diálogo modal de gramos */}
      <AddGramsModal
        visible={modalVisible}
        food={selectedFoodForModal}
        onClose={() => setModalVisible(false)}
        onConfirm={handleAddGrams}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20, // <-- Ahora sí separará los bordes 20px reales
    paddingTop: 10,        // Un pequeño respiro bajo la cámara
  },
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 100, paddingTop: 55, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 14 },
  plateContainer: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#c8e6c9' },
  plateTitle: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  chipsScroll: { marginVertical: 8 },
  chip: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#a5d6a7' },
  chipText: { fontSize: 13, color: '#1b5e20', fontWeight: '500' },
  calculateBtn: { backgroundColor: '#2e7d32', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  calculateBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#868e96', marginTop: 40, fontSize: 15 },
});