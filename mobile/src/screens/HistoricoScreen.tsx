import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Veiculo } from '../types';

// MOCK: Veículos que já passaram pelo processo e estão concluídos
const HISTORICO_MOCK: Veiculo[] = [
  { id: '10', placa: 'AAA-0000', modelo: 'Chevrolet Tracker', origem: 'CONCESSIONARIA', status: 'CONCLUIDO', setor_atual: 'ENTREGA', prioridade: 'NORMAL' },
  { id: '11', placa: 'BBB-1111', modelo: 'Fiat Toro', origem: 'CLIENTE', status: 'CONCLUIDO', setor_atual: 'ENTREGA', prioridade: 'ALTA' },
];

export default function HistoricoScreen() {
  const navigation = useNavigation<any>();

  const renderVeiculoHistorico = ({ item }: { item: Veiculo }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.placa}>{item.placa}</Text>
        <View style={styles.badgeConcluido}>
          <Text style={styles.textConcluido}>FINALIZADO</Text>
        </View>
      </View>
      <Text style={styles.modelo}>{item.modelo}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Origem:</Text>
        <Text style={styles.valor}>{item.origem}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Histórico</Text>
      </View>

      <FlatList
        data={HISTORICO_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={renderVeiculoHistorico}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum veículo no histórico.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#3B82F6', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  listContainer: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  placa: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  badgeConcluido: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  textConcluido: { color: '#166534', fontSize: 10, fontWeight: 'bold' },
  modelo: { fontSize: 16, color: '#64748B', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { fontSize: 14, color: '#94A3B8' },
  valor: { fontSize: 14, fontWeight: '600', color: '#334155' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 20 }
});