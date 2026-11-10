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
import { MealCard } from './src/components/MealCard';
import { AuthScreen } from './src/components/AuthScreen';

interface PlateItem {
  foodId: number;
  foodName: string;
  quantityInGrams: number;
}

export default function App() {
  // Autenticación
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Control de pestaña ('calculator' o 'myMeals')
  const [activeTab, setActiveTab] = useState<'calculator' | 'myMeals'>('calculator');

  // Datos de Alimentos (Calculadora)
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [loadingFoods, setLoadingFoods] = useState(false);

  // Datos del Plato actual
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<Food | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastCalculatedMeal, setLastCalculatedMeal] = useState<MealResponse | null>(null);

  // Datos de Comidas Guardadas
  const [savedMeals, setSavedMeals] = useState<MealResponse[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);

  // 1. Verificar sesión previa al arrancar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await tokenStorage.getUser();
        const token = await tokenStorage.getToken();
        if (user && token) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error recuperando sesión:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // 2. Cargar alimentos al iniciar sesión
  const loadFoods = async (searchTerm = '') => {
    try {
      setLoadingFoods(true);
      const data = await foodService.getAll(searchTerm);
      setFoods(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los alimentos.');
    } finally {
      setLoadingFoods(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadFoods();
    }
  }, [currentUser]);

  // 3. Cargar comidas guardadas del usuario
  const loadSavedMeals = async () => {
    try {
      setLoadingMeals(true);
      const data = await mealService.getAll();
      setSavedMeals(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar tus comidas.');
    } finally {
      setLoadingMeals(false);
    }
  };

  // Cada vez que el usuario cambia a la pestaña "Mis Comidas", recarga la lista
  const handleTabChange = (tab: 'calculator' | 'myMeals') => {
    setActiveTab(tab);
    if (tab === 'myMeals') {
      loadSavedMeals();
    }
  };

  // Logout
  const handleLogout = async () => {
    await tokenStorage.clearAuthData();
    setCurrentUser(null);
    setFoods([]);
    setPlate([]);
    setSavedMeals([]);
    setLastCalculatedMeal(null);
    setActiveTab('calculator');
  };

  // Manejo de Modal y Plato
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

  // Guardar y Calcular Comida
  const handleCalculateMeal = async () => {
    if (plate.length === 0) return;

    try {
      const response = await mealService.create({
        name: `Plato de ${currentUser?.nickname || 'Usuario'} #${savedMeals.length + 1}`,
        items: plate.map(item => ({
          foodId: item.foodId,
          quantityInGrams: item.quantityInGrams,
        })),
      });

      setLastCalculatedMeal(response);
      setPlate([]);
      Alert.alert('¡Éxito!', 'Comida calculada y registrada en tu cuenta.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo calcular ni guardar la comida.');
    }
  };

  // Borrar Comida
  const handleDeleteMeal = async (id: number) => {
    try {
      await mealService.delete(id);
      setSavedMeals(prev => prev.filter(m => m.id !== id));
      Alert.alert('Eliminado', 'Comida eliminada con éxito.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la comida.');
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={user => setCurrentUser(user)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.contentContainer}>
        {/* Cabecera de Usuario */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Hola, {currentUser.nickname} 👋</Text>
            <Text style={styles.headerSubtitle}>NutriCreater Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de Pestañas (Selector) */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'calculator' && styles.tabButtonActive]}
            onPress={() => handleTabChange('calculator')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'calculator' && styles.tabButtonTextActive]}>
              🍽️ Armar Plato
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'myMeals' && styles.tabButtonActive]}
            onPress={() => handleTabChange('myMeals')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'myMeals' && styles.tabButtonTextActive]}>
              📖 Mis Comidas
            </Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* VISTA 1: CALCULADORA / ARMAR PLATO                      */}
        {/* ======================================================== */}
        {activeTab === 'calculator' && (
          <>
            {lastCalculatedMeal && <MealSummaryCard meal={lastCalculatedMeal} />}

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

            <SearchBar
              value={search}
              onChangeText={text => {
                setSearch(text);
                loadFoods(text);
              }}
              placeholder="Buscar alimento (ej: pollo, avena)..."
            />

            {loadingFoods ? (
              <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={foods}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => <FoodCard food={item} onPress={() => handleSelectFood(item)} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No hay alimentos en tu despensa.</Text>
                }
              />
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* VISTA 2: HISTORIAL DE MIS COMIDAS                        */}
        {/* ======================================================== */}
        {activeTab === 'myMeals' && (
          <View style={{ flex: 1 }}>
            {loadingMeals ? (
              <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 30 }} />
            ) : (
              <FlatList
                data={savedMeals}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                  <MealCard meal={item} onDelete={handleDeleteMeal} />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>🍽️</Text>
                    <Text style={styles.emptyTitle}>Aún no tienes comidas guardadas</Text>
                    <Text style={styles.emptySub}>
                      Ve a la pestaña "Armar Plato", añade alimentos con sus gramos y pulsa "Calcular y Guardar".
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}

        {/* Modal de selección de gramos */}
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greetingText: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },

  // Selector de pestañas
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#1F2937',
    fontWeight: '700',
  },

  // Plato
  plateContainer: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#c8e6c9' },
  plateTitle: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  chipsScroll: { marginVertical: 8 },
  chip: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#a5d6a7' },
  chipText: { fontSize: 13, color: '#1b5e20', fontWeight: '500' },
  calculateBtn: { backgroundColor: '#2e7d32', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  calculateBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#868e96', marginTop: 40, fontSize: 15 },

  // Estado vacío de Mis Comidas
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', textAlign: 'center', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});