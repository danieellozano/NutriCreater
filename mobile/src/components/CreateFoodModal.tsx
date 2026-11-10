import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Food } from '../types';
import { foodService } from '../services/foodService';

interface CreateFoodModalProps {
    visible: boolean;
    onClose: () => void;
    onFoodCreated: (newFood : Food) => void;
}

export function CreateFoodModal({ visible, onClose, onFoodCreated }: CreateFoodModalProps) {
    // Estados
    const [name, setName] = React.useState('');
    const [calories, setCalories] = React.useState('');
    const [protein, setProtein] = React.useState('');
    const [carbohydrates, setCarbohydrates] = React.useState('');
    const [fat, setFat] = React.useState('');
    const [fiber, setFiber] = React.useState('');
    const [salt, setSalt] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleCreateFood = async () => {
        // Validar que no falten los datos básicos
        if (!name || !calories || !protein || !carbohydrates || !fat) {
            Alert.alert('Campos incompletos', 'Por favor, rellena el nombre, calorías, proteínas, carbohidratos y grasas.');
            return;
        }

        const kcalNum = parseFloat(calories);
        const proteinNum = parseFloat(protein);
        const carbsNum = parseFloat(carbohydrates);
        const fatNum = parseFloat(fat);

        if (isNaN(kcalNum) || isNaN(proteinNum) || isNaN(carbsNum) || isNaN(fatNum)) {
            Alert.alert('Datos inválidos', 'Por favor, introduce valores numéricos válidos para calorías, proteínas, carbohidratos y grasas.');
            return;
        }

        try {
            setLoading(true);
            // Enviar la solicitud al backend para crear el alimento
            const newFood: Food = await foodService.create({
                name: name.trim(),
                calories: kcalNum, 
                protein: proteinNum,
                carbohydrates: carbsNum,
                fat: fatNum,
                fiber: fiber ? parseFloat(fiber) : 0,
                salt: salt ? parseFloat(salt) : 0,
            });

            onFoodCreated(newFood);
            resetForm();
            onClose();
        } catch (error: any) {
            Alert.alert('Error al crear alimento', error.message || 'Ocurrió un error al crear el alimento.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setCalories('');
        setProtein('');
        setCarbohydrates('');
        setFat('');
        setFiber('');
        setSalt('');
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scroll}>
                
                <Text style={styles.title}>🥑 Añadir Alimento Propio</Text>
                <Text style={styles.subtitle}>Valores referidos a 100 gramos de producto</Text>

                {/* Campo: Nombre */}
                <Text style={styles.label}>Nombre del alimento *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ej: Jamón serrano Hacendado"
                    value={name}
                    onChangeText={setName}
                />

                {/* Fila: Calorías y Proteínas */}
                <View style={styles.row}>
                    <View style={styles.col}>
                    <Text style={styles.label}>Calorías (kcal) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={calories}
                        onChangeText={setCalories}
                    />
                    </View>
                    <View style={styles.col}>
                    <Text style={styles.label}>Proteínas (g) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={protein}
                        onChangeText={setProtein}
                    />
                    </View>
                </View>

                {/* Fila: Carbohidratos y Grasas */}
                <View style={styles.row}>
                    <View style={styles.col}>
                    <Text style={styles.label}>Carbohidratos (g) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={carbohydrates}
                        onChangeText={setCarbohydrates}
                    />
                    </View>
                    <View style={styles.col}>
                    <Text style={styles.label}>Grasas (g) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={fat}
                        onChangeText={setFat}
                    />
                    </View>
                </View>

                {/* Fila: Fibra y Sal (Opcionales) */}
                <View style={styles.row}>
                    <View style={styles.col}>
                    <Text style={styles.label}>Fibra (g)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={fiber}
                        onChangeText={setFiber}
                    />
                    </View>
                    <View style={styles.col}>
                    <Text style={styles.label}>Sal (g)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={salt}
                        onChangeText={setSalt}
                    />
                    </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleCreateFood} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveText}>Guardar en mi despensa</Text>
                    )}
                    </TouchableOpacity>
                </View>

                </ScrollView>
            </SafeAreaView>
        </Modal>
  );  


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        padding: 20,
        paddingBottom: 32,
    },
    title: {
        marginBottom: 8,
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        marginBottom: 24,
        color: '#666',
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        minHeight: 44,
        marginBottom: 16,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    col: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    cancelText: {
        fontWeight: '600',
    },
    saveBtn: {
        flex: 2,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#2e7d32',
        borderRadius: 8,
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
});

