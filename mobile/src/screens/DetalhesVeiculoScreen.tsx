import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Veiculo } from '../types';

export default function DetalhesVeiculoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { veiculo } = route.params as { veiculo: Veiculo };

  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Precisamos de acesso à câmera para registrar evidências.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotoUri(resultado.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ordem de Serviço</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.placa}>{veiculo.placa}</Text>
          <Text style={styles.statusBadge}>{veiculo.status}</Text>
        </View>
        <Text style={styles.modelo}>{veiculo.modelo}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Origem</Text>
          <Text style={styles.value}>{veiculo.origem === 'CLIENTE' ? 'Cliente (Revisão/Garantia)' : 'Concessionária (Showroom)'}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Setor Atual</Text>
          <Text style={styles.valueHighlight}>{veiculo.setor_atual}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Text style={styles.sectionTitle}>Ações Disponíveis</Text>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Checklist', { veiculo })}
        >
          <Text style={styles.primaryButtonText}>INICIAR SERVIÇO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={tirarFoto}>
          <Text style={styles.secondaryButtonText}>📸 Capturar Evidência</Text>
        </TouchableOpacity>

        {fotoUri && (
          <View style={styles.fotoContainer}>
            <Text style={styles.label}>Evidência Registrada:</Text>
            <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
            <TouchableOpacity onPress={() => setFotoUri(null)}>
              <Text style={styles.removerFotoText}>Remover Foto</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#3B82F6', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  card: { backgroundColor: '#FFFFFF', margin: 20, borderRadius: 12, padding: 20, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placa: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  statusBadge: { backgroundColor: '#FEF3C7', color: '#D97706', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  modelo: { fontSize: 18, color: '#64748B', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  infoBlock: { marginBottom: 15 },
  label: { fontSize: 14, color: '#94A3B8', marginBottom: 2 },
  value: { fontSize: 16, color: '#334155', fontWeight: '500' },
  valueHighlight: { fontSize: 16, color: '#3B82F6', fontWeight: 'bold' },
  actionContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  primaryButton: { backgroundColor: '#0F172A', height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#FFFFFF', height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  secondaryButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  fotoContainer: { alignItems: 'center', marginTop: 10, padding: 15, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  fotoPreview: { width: '100%', height: 200, borderRadius: 8, marginTop: 10, marginBottom: 15 },
  removerFotoText: { color: '#EF4444', fontWeight: 'bold' }
});