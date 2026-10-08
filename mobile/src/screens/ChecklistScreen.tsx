import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Veiculo } from '../types';

export default function ChecklistScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { veiculo } = route.params as { veiculo: Veiculo };

  // Tarefas simuladas baseadas no setor atual do veículo
  const getTarefasIniciais = () => {
    if (veiculo.setor_atual === 'LAVAGEM') {
      return [
        { id: '1', descricao: 'Lavagem Externa', concluido: false },
        { id: '2', descricao: 'Aspiração Interna', concluido: false },
        { id: '3', descricao: 'Limpeza dos Vidros', concluido: false },
        { id: '4', descricao: 'Aplicação de Revitalizador (Pretinho)', concluido: false },
      ];
    }
    if (veiculo.setor_atual === 'OFICINA') {
      return [
        { id: '1', descricao: 'Troca de Óleo e Filtro', concluido: false },
        { id: '2', descricao: 'Verificação de Pastilhas de Freio', concluido: false },
        { id: '3', descricao: 'Inspeção de Suspensão', concluido: false },
      ];
    }
    // Padrão para outros setores
    return [
      { id: '1', descricao: 'Inspeção Inicial', concluido: false },
      { id: '2', descricao: 'Execução do Serviço Padrão', concluido: false },
      { id: '3', descricao: 'Revisão de Qualidade', concluido: false },
    ];
  };

  const [tarefas, setTarefas] = useState(getTarefasIniciais());

  const toggleTarefa = (id: string) => {
    setTarefas(tarefas.map(t => t.id === id ? { ...t, concluido: !t.concluido } : t));
  };

  const finalizarServico = () => {
    const todasConcluidas = tarefas.every(t => t.concluido);
    
    if (!todasConcluidas) {
      Alert.alert('Atenção', 'Por favor, conclua todas as tarefas do checklist antes de finalizar o serviço.');
      return;
    }

    Alert.alert('Sucesso!', 'Serviço concluído. O veículo foi movido para o próximo setor.', [
      { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Execução: {veiculo.setor_atual}</Text>
      </View>

      <View style={styles.veiculoInfo}>
        <Text style={styles.placa}>{veiculo.placa}</Text>
        <Text style={styles.modelo}>{veiculo.modelo}</Text>
      </View>

      <ScrollView style={styles.checklistContainer}>
        <Text style={styles.sectionTitle}>Tarefas do Setor</Text>
        
        {tarefas.map((tarefa) => (
          <TouchableOpacity 
            key={tarefa.id} 
            style={[styles.taskCard, tarefa.concluido && styles.taskCardConcluido]}
            onPress={() => toggleTarefa(tarefa.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, tarefa.concluido && styles.checkboxConcluido]}>
              {tarefa.concluido && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskText, tarefa.concluido && styles.taskTextConcluido]}>
              {tarefa.descricao}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={finalizarServico}>
          <Text style={styles.finishButtonText}>CONCLUIR E AVANÇAR VEÍCULO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#3B82F6', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  veiculoInfo: { backgroundColor: '#0F172A', padding: 20 },
  placa: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  modelo: { fontSize: 16, color: '#94A3B8', marginTop: 5 },
  checklistContainer: { padding: 20, flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  taskCardConcluido: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  checkboxConcluido: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  taskText: { fontSize: 16, color: '#334155', flex: 1 },
  taskTextConcluido: { color: '#15803D', textDecorationLine: 'line-through' },
  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  finishButton: { backgroundColor: '#22C55E', height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});