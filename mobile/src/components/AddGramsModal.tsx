import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Food } from '../types';

interface AddGramsModalProps {
  visible: boolean;
  food: Food | null;
  onClose: () => void;
  onConfirm: (grams: number) => void;
}

export function AddGramsModal({ visible, food, onClose, onConfirm }: AddGramsModalProps) {
  const [grams, setGrams] = useState('100');

  if (!food) return null;

  const handleConfirm = () => {
    const parsedGrams = parseFloat(grams);
    if (isNaN(parsedGrams) || parsedGrams <= 0) {
      Alert.alert('Cantidad inválida', 'Por favor, introduce un número mayor que cero.');
      return;
    }
    onConfirm(parsedGrams);
    setGrams('100'); // Resetea a 100 para la próxima vez
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>¿Cuántos gramos de {food.name}?</Text>
          
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={grams}
            onChangeText={setGrams}
            autoFocus
            selectTextOnFocus
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.7}>
              <Text style={styles.confirmBtnText}>Añadir al plato</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    width: '85%',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    width: '100%',
    padding: 10,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#212529',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});