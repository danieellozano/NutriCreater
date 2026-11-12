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
  TextInput,
  Modal,
} from 'react-native';

// Tipos
import { Food, MealResponse, StoredUser } from './src/types';

// Servicios
import { foodService } from './src/services/foodService';
import { mealService } from './src/services/mealService';
import { tokenStorage } from './src/services/tokenStorage';

// Componentes
import { SearchBar } from './src/components/SearchBar';
import { FoodCard } from './src/components/FoodCard';
import { AddGramsModal } from './src/components/AddGramsModal';
import { MealCard } from './src/components/MealCard';
import { MealDetailModal } from './src/components/MealDetailModal';
import { AuthScreen } from './src/components/AuthScreen';
import { CreateFoodModal } from './src/components/CreateFoodModal';

interface PlateItem {
  foodId: number;
  foodName: string;
  quantityInGrams: number;
}

export default function App() {
  // Autenticación
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Navegación principal ('calculator' | 'myMeals' | 'community')
  const [activeTab, setActiveTab] = useState<'calculator' | 'myMeals' | 'community'>('calculator');

  // Subpestaña de comunidad ('recent' | 'top')
  const [communitySort, setCommunitySort] = useState<'recent' | 'top'>('recent');
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityMeals, setCommunityMeals] = useState<MealResponse[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  // Datos de Alimentos (Calculadora)
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [loadingFoods, setLoadingFoods] = useState(false);

  // Datos del Plato actual
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [mealName, setMealName] = useState('');
  const [isMealPublic, setIsMealPublic] = useState(true);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<Food | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Modo Edición de Comida
  const [editingMealId, setEditingMealId] = useState<number | null>(null);

  // Modal para editar los gramos de un ingrediente YA en el plato
  const [editGramsModalVisible, setEditGramsModalVisible] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editGramsValue, setEditGramsValue] = useState('');

  // Vista detallada de plato
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<MealResponse | null>(null);

  // Modal para clonar con nombre personalizado
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [cloningMeal, setCloningMeal] = useState<MealResponse | null>(null);
  const [cloneNameInput, setCloneNameInput] = useState('');

  // Datos de Mis Comidas Guardadas
  const [savedMeals, setSavedMeals] = useState<MealResponse[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);

  // Modal para crear alimento propio
  const [createFoodModalVisible, setCreateFoodModalVisible] = useState(false);

  // 1. Verificar sesión al inicio
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

  // 2. Cargar alimentos
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

  // 3. Cargar comidas guardadas propias
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

  // 4. Cargar comidas de la comunidad
  const loadCommunityMeals = async (searchTerm = communitySearch, sort = communitySort) => {
    try {
      setLoadingCommunity(true);
      const data = await mealService.getCommunity(searchTerm, sort);
      setCommunityMeals(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las comidas de la comunidad.');
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleTabChange = (tab: 'calculator' | 'myMeals' | 'community') => {
    setActiveTab(tab);
    if (tab === 'myMeals') loadSavedMeals();
    if (tab === 'community') loadCommunityMeals();
  };

  const handleCommunitySortChange = (sort: 'recent' | 'top') => {
    setCommunitySort(sort);
    loadCommunityMeals(communitySearch, sort);
  };

  // Logout
  const handleLogout = async () => {
    await tokenStorage.clearAuthData();
    setCurrentUser(null);
    setFoods([]);
    setPlate([]);
    setMealName('');
    setSavedMeals([]);
    setCommunityMeals([]);
    setEditingMealId(null);
    setActiveTab('calculator');
  };

  // Añadir ingrediente nuevo al plato
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

  // Eliminar ingrediente del plato actual
  const handleRemovePlateItem = (indexToRemove: number) => {
    setPlate(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Abrir modal para cambiar gramos de un ingrediente ya en el plato
  const handleOpenEditGrams = (index: number) => {
    setEditingItemIndex(index);
    setEditGramsValue(plate[index].quantityInGrams.toString());
    setEditGramsModalVisible(true);
  };

  const handleSaveEditedGrams = () => {
    if (editingItemIndex === null) return;
    const parsed = parseFloat(editGramsValue);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Valor inválido', 'Introduce una cantidad válida en gramos.');
      return;
    }
    setPlate(prev =>
      prev.map((item, idx) =>
        idx === editingItemIndex ? { ...item, quantityInGrams: parsed } : item
      )
    );
    setEditGramsModalVisible(false);
    setEditingItemIndex(null);
  };

  // Iniciar Modo Edición de comida completa
  const handleStartEdit = (meal: MealResponse) => {
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setIsMealPublic(meal.isPublic);
    setPlate(
      meal.items.map(item => ({
        foodId: item.foodId,
        foodName: item.foodName,
        quantityInGrams: item.quantityInGrams,
      }))
    );
    setActiveTab('calculator');
  };

  const handleCancelEdit = () => {
    setEditingMealId(null);
    setMealName('');
    setPlate([]);
    setIsMealPublic(true);
  };

  // Guardar (Crear o Actualizar) Comida
  const handleSaveMeal = async () => {
    if (plate.length === 0) {
      Alert.alert('Aviso', 'Añade al menos un alimento a tu comida.');
      return;
    }

    const finalName = mealName.trim() || `Plato #${savedMeals.length + 1}`;
    const payload = {
      name: finalName,
      items: plate.map(item => ({
        foodId: item.foodId,
        quantityInGrams: item.quantityInGrams,
      })),
      isPublic: isMealPublic,
    };

    try {
      if (editingMealId) {
        await mealService.update(editingMealId, payload);
        Alert.alert('¡Actualizado!', `Comida "${finalName}" actualizada con éxito.`);
      } else {
        await mealService.create(payload);
        Alert.alert('¡Éxito!', `Comida "${finalName}" guardada en tus platos.`);
      }

      handleCancelEdit();
      setActiveTab('myMeals');
      loadSavedMeals();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la comida.');
    }
  };

  // Borrar Comida Propia
  const handleDeleteMeal = (id: number) => {
    Alert.alert(
      '¿Eliminar plato?',
      '¿Estás seguro de que quieres eliminar este plato de tu historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await mealService.delete(id);
              setSavedMeals(prev => prev.filter(m => m.id !== id));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la comida.');
            }
          },
        },
      ]
    );
  };

  // Dar o quitar Like
  const handleLikeMeal = async (id: number) => {
    try {
      const updated = await mealService.toggleLike(id);
      setCommunityMeals(prev => prev.map(m => (m.id === id ? updated : m)));
    } catch (error) {
      Alert.alert('Error', 'No se pudo votar esta comida.');
    }
  };

  // Abrir ventana para clonar plato de la comunidad
  const handlePromptClone = (meal: MealResponse) => {
    setCloningMeal(meal);
    setCloneNameInput(meal.name);
    setCloneModalVisible(true);
  };

  // Confirmar el clonado enviando el nombre personalizado
  const handleConfirmClone = async () => {
    if (!cloningMeal) return;

    try {
      const nameToSend = cloneNameInput.trim() || cloningMeal.name;
      const cloned = await mealService.cloneMeal(cloningMeal.id, nameToSend);
      setCloneModalVisible(false);
      setCloningMeal(null);
      setSavedMeals(prev => [cloned, ...prev]);
      loadFoods();
      Alert.alert(
        '¡Plato Guardado!',
        `"${cloned.name}" se ha añadido a "Mis Comidas" y sus ingredientes a tu despensa.`
      );
      setActiveTab('myMeals');
      loadSavedMeals();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo clonar la comida.');
    }
  };

  // Abrir vista detallada
  const handleOpenDetail = (meal: MealResponse) => {
    setSelectedMealForDetail(meal);
    setDetailModalVisible(true);
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
        {/* Cabecera */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Hola, {currentUser.nickname} 👋</Text>
            <Text style={styles.headerSubtitle}>NutriCreater Community</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de 3 Pestañas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'calculator' && styles.tabButtonActive]}
            onPress={() => handleTabChange('calculator')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'calculator' && styles.tabButtonTextActive]}>
              {editingMealId ? '✏️ Editando' : '🍽️ Plato'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'myMeals' && styles.tabButtonActive]}
            onPress={() => handleTabChange('myMeals')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'myMeals' && styles.tabButtonTextActive]}>
              📖 Mías
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'community' && styles.tabButtonActive]}
            onPress={() => handleTabChange('community')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'community' && styles.tabButtonTextActive]}>
              🌍 Comunidad
            </Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* VISTA 1: CALCULADORA / MODO EDICIÓN                      */}
        {/* ======================================================== */}
        {activeTab === 'calculator' && (
          <>
            {editingMealId && (
              <View style={styles.editingBanner}>
                <Text style={styles.editingBannerText}>✏️ Modo Edición Activo</Text>
                <TouchableOpacity onPress={handleCancelEdit}>
                  <Text style={styles.cancelEditText}>✕ Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

            {plate.length > 0 && (
              <View style={styles.plateContainer}>
                <Text style={styles.plateTitle}>
                  🍽️ Plato actual ({plate.length} ingredientes) - Toca para cambiar gramos:
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {plate.map((item, index) => (
                    <View key={index} style={styles.chip}>
                      {/* Tocar el ingrediente abre el editor de gramos */}
                      <TouchableOpacity onPress={() => handleOpenEditGrams(index)}>
                        <Text style={styles.chipText}>
                          {item.foodName} ({item.quantityInGrams}g) ✏️
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.chipRemoveBtn}
                        onPress={() => handleRemovePlateItem(index)}
                        hitSlop={6}
                      >
                        <Text style={styles.chipRemoveText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <TextInput
                  style={styles.mealNameInput}
                  placeholder="Nombre de la comida (ej: Desayuno fitness)..."
                  placeholderTextColor="#718096"
                  value={mealName}
                  onChangeText={setMealName}
                />

                <TouchableOpacity
                  style={styles.publicToggleRow}
                  onPress={() => setIsMealPublic(!isMealPublic)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.publicToggleEmoji}>{isMealPublic ? '🌐' : '🔒'}</Text>
                  <Text style={styles.publicToggleText}>
                    {isMealPublic ? 'Visible para la comunidad' : 'Solo privado para mí'}
                  </Text>
                  <Text
                    style={[
                      styles.publicToggleBadge,
                      isMealPublic ? styles.badgeGreen : styles.badgeGray,
                    ]}
                  >
                    {isMealPublic ? 'PÚBLICO' : 'PRIVADO'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.calculateBtn} onPress={handleSaveMeal}>
                  <Text style={styles.calculateBtnText}>
                    {editingMealId ? '💾 Guardar Cambios' : '🔥 Calcular y Guardar Comida'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.foodHeaderRow}>
              <Text style={styles.sectionSubtitle}>Catálogo de tu Despensa</Text>
              <TouchableOpacity
                style={styles.addCustomFoodBtn}
                onPress={() => setCreateFoodModalVisible(true)}
              >
                <Text style={styles.addCustomFoodBtnText}>+ Nuevo Alimento</Text>
              </TouchableOpacity>
            </View>

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
                renderItem={({ item }) => (
                  <FoodCard food={item} onPress={() => handleSelectFood(item)} />
                )}
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
                  <MealCard
                    meal={item}
                    onPress={() => handleOpenDetail(item)}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteMeal}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>🍽️</Text>
                    <Text style={styles.emptyTitle}>Aún no tienes comidas guardadas</Text>
                    <Text style={styles.emptySub}>
                      Ve a la pestaña "Plato", añade alimentos con sus gramos y pulsa "Calcular y Guardar".
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* VISTA 3: FEED DE LA COMUNIDAD (RED SOCIAL)               */}
        {/* ======================================================== */}
        {activeTab === 'community' && (
          <View style={{ flex: 1 }}>
            <View style={styles.subTabsContainer}>
              <TouchableOpacity
                style={[styles.subTabBtn, communitySort === 'recent' && styles.subTabBtnActive]}
                onPress={() => handleCommunitySortChange('recent')}
              >
                <Text style={[styles.subTabBtnText, communitySort === 'recent' && styles.subTabBtnTextActive]}>
                  🕒 Más Recientes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTabBtn, communitySort === 'top' && styles.subTabBtnActive]}
                onPress={() => handleCommunitySortChange('top')}
              >
                <Text style={[styles.subTabBtnText, communitySort === 'top' && styles.subTabBtnTextActive]}>
                  ❤️ Más Valoradas
                </Text>
              </TouchableOpacity>
            </View>

            <SearchBar
              value={communitySearch}
              onChangeText={text => {
                setCommunitySearch(text);
                loadCommunityMeals(text, communitySort);
              }}
              placeholder="Buscar recetas de la comunidad..."
            />

            {loadingCommunity ? (
              <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 30 }} />
            ) : (
              <FlatList
                data={communityMeals}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                  <MealCard
                    meal={item}
                    onPress={() => handleOpenDetail(item)}
                    onLike={handleLikeMeal}
                    onClone={() => handlePromptClone(item)}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>🌍</Text>
                    <Text style={styles.emptyTitle}>No hay recetas públicas todavía</Text>
                    <Text style={styles.emptySub}>
                      ¡Sé el primero en publicar un plato fit marcándolo como público!
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}

        {/* Modal para añadir gramos a un alimento nuevo */}
        <AddGramsModal
          visible={modalVisible}
          food={selectedFoodForModal}
          onClose={() => setModalVisible(false)}
          onConfirm={handleAddGrams}
        />

        {/* Modal para editar gramos de un ingrediente YA en el plato */}
        <Modal visible={editGramsModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalBoxTitle}>✏️ Cambiar Gramaje</Text>
              <Text style={styles.modalBoxSubtitle}>
                {editingItemIndex !== null ? plate[editingItemIndex]?.foodName : ''}
              </Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={editGramsValue}
                onChangeText={setEditGramsValue}
                placeholder="Gramos..."
                autoFocus
                selectTextOnFocus
              />
              <View style={styles.modalBoxButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditGramsModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveEditedGrams}
                >
                  <Text style={styles.modalConfirmBtnText}>Actualizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para crear alimento propio */}
        <CreateFoodModal
          visible={createFoodModalVisible}
          onClose={() => setCreateFoodModalVisible(false)}
          onFoodCreated={newFood => {
            setFoods(prev => [newFood, ...prev]);
          }}
        />

        {/* Modal de Vista Detallada (Tabla de nutrientes) */}
        <MealDetailModal
          visible={detailModalVisible}
          meal={selectedMealForDetail}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedMealForDetail(null);
          }}
          onEdit={
            selectedMealForDetail && !communityMeals.some(m => m.id === selectedMealForDetail.id && m.authorNickname !== currentUser.nickname)
              ? handleStartEdit
              : undefined
          }
        />

        {/* Modal para nombrar plato al clonar de la comunidad */}
        <Modal visible={cloneModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalBoxTitle}>📥 Guardar en mis comidas</Text>
              <Text style={styles.modalBoxSubtitle}>
                Elige el nombre con el que quieres guardar este plato en tu cuenta:
              </Text>
              <TextInput
                style={styles.modalInput}
                value={cloneNameInput}
                onChangeText={setCloneNameInput}
                placeholder="Nombre del plato..."
                autoFocus
                selectTextOnFocus
              />
              <View style={styles.modalBoxButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setCloneModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleConfirmClone}
                >
                  <Text style={styles.modalConfirmBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  contentContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greetingText: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },

  // Selector de 3 pestañas principales
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#1F2937',
    fontWeight: '700',
  },

  // Banner Modo Edición
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  editingBannerText: { color: '#1E40AF', fontWeight: '700', fontSize: 13 },
  cancelEditText: { color: '#DC2626', fontWeight: '600', fontSize: 12 },

  // Subpestañas de comunidad
  subTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subTabBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  subTabBtnTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },

  // Fila del botón + Nuevo Alimento
  foodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  addCustomFoodBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  addCustomFoodBtnText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
  },

  // Plato
  plateContainer: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#c8e6c9' },
  plateTitle: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 },
  chipsScroll: { marginVertical: 8 },
  chip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#a5d6a7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: { fontSize: 13, color: '#1b5e20', fontWeight: '600' },
  chipRemoveBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipRemoveText: { color: '#DC2626', fontSize: 10, fontWeight: 'bold' },
  mealNameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  publicToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  publicToggleEmoji: { fontSize: 16, marginRight: 8 },
  publicToggleText: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  publicToggleBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeGreen: { backgroundColor: '#DCFCE7', color: '#15803D' },
  badgeGray: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  calculateBtn: { backgroundColor: '#2e7d32', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  calculateBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#868e96', marginTop: 40, fontSize: 15 },

  // Estados vacíos
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', textAlign: 'center', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  // Modales
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#FFFFFF', width: '85%', borderRadius: 16, padding: 20 },
  modalBoxTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6 },
  modalBoxSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 14, lineHeight: 18 },
  modalInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 16 },
  modalBoxButtons: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#F3F4F6' },
  modalCancelBtnText: { color: '#374151', fontWeight: '600' },
  modalConfirmBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#2E7D32' },
  modalConfirmBtnText: { color: '#FFFFFF', fontWeight: '700' },
});