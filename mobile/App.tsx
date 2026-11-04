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
  ActivityIndicator,
} from 'react-native';

// Tipos
import { Food, MealResponse } from './src/types';

// Servicios
import { foodService } from './src/services/foodService';
import { mealService } from './src/services/mealService';
import { tokenStorage } from './src/services/tokenStorage';
import { StoredUser } from './src/types';

// Componentes
import { SearchBar } from './src/components/SearchBar';
import { FoodCard } from './src/components/FoodCard';
import { AddGramsModal } from './src/components/AddGramsModal';
import { MealSummaryCard } from './src/components/MealSummaryCard';
import { AuthScreen } from './src/components/AuthScreen';

interface PlateItem {
  foodId: number;
  foodName: string;
  quantityInGrams: number;
}

export default function App() {
  // Estado de Autenticación
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Estados de datos
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados del plato interactivo
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<Food | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastCalculatedMeal, setLastCalculatedMeal] = useState<MealResponse | null>(null);

  // 1. Al abrir la app: comprobar si ya había sesión iniciada
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await tokenStorage.getUser();
        const token = await tokenStorage.getToken();
        if (user && token) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error al recuperar sesión previa:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // 2. Cargar alimentos (solo si hay usuario autenticado)
  const loadFoods = async (searchTerm = '') => {
    try {
      setLoading(true);
      const data = await foodService.getAll(searchTerm);
      setFoods(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los alimentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadFoods();
    }
  }, [currentUser]);

  // Manejo de Logout
  const handleLogout = async () => {
    await tokenStorage.clearAuthData();
    setCurrentUser(null);
    setFoods([]);
    setPlate([]);
    setLastCalculatedMeal(null);
  };

  // Manejo de plato y modal
  const handleSelectFood = (food: Food) => {
    setSelectedFoodForModal(food);
    setModalVisible(true);
  };

  const handleAddGrams = (grams: number) => {
    if (!selectedFoodForModal) return;
    setPlate(prev => [
      ...prev,
      {
        foodId: selectedFoodForModal.id,
        foodName: selectedFoodForModal.name,
        quantityInGrams: grams,
      },
    ]);
    setModalVisible(false);
  };

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
      setPlate([]);
      Alert.alert('¡Éxito!', 'Comida calculada y registrada en el servidor.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo calcular la comida.');
    }
  };

  // Pantalla de carga mientras se verifica el token en el arranque
  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  // 🛑 SI NO HAY USUARIO: Mostramos pantalla de login / registro
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={user => setCurrentUser(user)} />;
  }

  //  SI HAY USUARIO: Mostramos la aplicación completa
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.contentContainer}>
        {/* Cabecera con datos del usuario y Logout */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Hola, {currentUser.nickname} 👋</Text>
            <Text style={styles.headerSubtitle}>NutriCreater Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen de macros calculados */}
        {lastCalculatedMeal && <MealSummaryCard meal={lastCalculatedMeal} />}

        {/* Plato en construcción */}
        {plate.length > 0 && (
          <View style={styles.plateContainer}>
            <Text style={styles.plateTitle}>🍽️ Plato actual ({plate.length} ingredientes):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {plate.map((item, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {item.foodName} ({item.quantityInGrams}g)
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.calculateBtn} onPress={handleCalculateMeal}>
              <Text style={styles.calculateBtnText}>🔥 Calcular y Guardar Comida</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Buscador */}
        <SearchBar
          value={search}
          onChangeText={text => {
            setSearch(text);
            loadFoods(text);
          }}
          placeholder="Buscar alimento (ej: pollo, avena)..."
        />

        {/* Listado de alimentos */}
        {loading ? (
          <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={foods}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => <FoodCard food={item} onPress={() => handleSelectFood(item)} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay alimentos disponibles.</Text>
            }
          />
        )}

        {/* Diálogo modal de gramos */}
        <AddGramsModal
          visible={modalVisible}
          food={selectedFoodForModal}
          onClose={() => setModalVisible(false)}
          onConfirm={handleAddGrams}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  contentContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  greetingText: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  plateContainer: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#c8e6c9' },
  plateTitle: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  chipsScroll: { marginVertical: 8 },
  chip: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#a5d6a7' },
  chipText: { fontSize: 13, color: '#1b5e20', fontWeight: '500' },
  calculateBtn: { backgroundColor: '#2e7d32', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  calculateBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#868e96', marginTop: 40, fontSize: 15 },
});