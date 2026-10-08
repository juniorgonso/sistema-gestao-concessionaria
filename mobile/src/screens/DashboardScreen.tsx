import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Veiculo } from '../types';

const VEICULOS_MOCK: Veiculo[] = [
  { id: '1', placa: 'ABC-1234', modelo: 'Honda Civic', origem: 'CLIENTE', status: 'EM_ANDAMENTO', setor_atual: 'OFICINA', prioridade: 'ALTA' },
  { id: '2', placa: 'XYZ-9876', modelo: 'Toyota Corolla', origem: 'CONCESSIONARIA', status: 'AGUARDANDO', setor_atual: 'PINTURA', prioridade: 'NORMAL' },
  { id: '3', placa: 'DEF-5678', modelo: 'VW Nivus', origem: 'CLIENTE', status: 'FILA', setor_atual: 'LAVAGEM', prioridade: 'NORMAL' },
];

export default function DashboardScreen() {
  const navigation = useNavigation<any>();

  const renderVeiculo = ({ item }: { item: Veiculo }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DetalhesVeiculo', { veiculo: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.placa}>{item.placa}</Text>
        {item.prioridade === 'ALTA' && (
          <View style={styles.badgePrioridade}>
            <Text style={styles.textPrioridade}>URGENTE</Text>
          </View>
        )}
      </View>
      <Text style={styles.modelo}>{item.modelo}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Setor:</Text>
        <Text style={styles.valor}>{item.setor_atual}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Origem:</Text>
        <Text style={styles.valor}>{item.origem}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fila de Veículos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Historico')} style={styles.historyBtn}>
            <Text style={styles.historyText}>📋 Ver Histórico</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={VEICULOS_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={renderVeiculo}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  historyBtn: { marginTop: 5 },
  historyText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },
  logoutText: { color: '#EF4444', fontWeight: '600', marginTop: 5 },
  listContainer: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  placa: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  badgePrioridade: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  textPrioridade: { color: '#DC2626', fontSize: 10, fontWeight: 'bold' },
  modelo: { fontSize: 16, color: '#64748B', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { fontSize: 14, color: '#94A3B8' },
  valor: { fontSize: 14, fontWeight: '600', color: '#334155' }
});