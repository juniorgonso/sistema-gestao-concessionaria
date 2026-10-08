import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.X.X:8000/api/v1'; // Ajuste para o seu IP local

export default function App() {
  const [perfil, setPerfil] = useState<'AVALIADOR' | 'OFICINA' | 'ADMIN' | 'QUALIDADE' | 'LAVAGEM'>('AVALIADOR');
  const [dados, setDados] = useState<any[]>([]);
  const [textoInput, setTextoInput] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);

  const carregarDados = async () => {
    try {
      if (perfil === 'AVALIADOR') {
        const res = await axios.get(`${API_URL}/veiculos/lista/?status=AVALIADOR`);
        setDados(res.data);
      } else if (perfil === 'OFICINA') {
        const res = await axios.get(`${API_URL}/veiculos/lista/?status=OFICINA`);
        setDados(res.data);
      } else if (perfil === 'ADMIN') {
        const res = await axios.get(`${API_URL}/ordens/servicos/`);
        setDados(res.data);
      } else if (perfil === 'QUALIDADE') {
        const res = await axios.get(`${API_URL}/veiculos/lista/?status=QUALIDADE_POS`);
        setDados(res.data);
      } else if (perfil === 'LAVAGEM') {
        const res = await axios.get(`${API_URL}/veiculos/lista/?status=LAVAGEM`);
        setDados(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarDados();
    setItemSelecionado(null);
  }, [perfil]);

  const executarAcao = async () => {
    try {
      if (perfil === 'AVALIADOR') {
        await axios.post(`${API_URL}/concessionaria/ocorrencias/`, {
          descricao: textoInput, setor_solicitante: 'Avaliador', veiculo_relacionado: itemSelecionado.placa
        });
        await axios.patch(`${API_URL}/veiculos/lista/${itemSelecionado.id}/`, { status: 'OFICINA' });
        Alert.alert('Sucesso', 'Enviado para Oficina!');
      } else if (perfil === 'OFICINA') {
        await axios.post(`${API_URL}/ordens/servicos/`, {
          veiculo: itemSelecionado.id, descricao: textoInput, precisa_autorizacao: true
        });
        Alert.alert('Sucesso', 'Serviço solicitado ao Administrativo!');
      } else if (perfil === 'ADMIN') {
        await axios.post(`${API_URL}/ordens/autorizacoes/`, {
          servico: itemSelecionado.id, status: 'APROVADA', observacao: 'Autorizado via Mobile'
        });
        Alert.alert('Sucesso', 'Serviço Aprovado!');
      }
      setTextoInput('');
      setItemSelecionado(null);
      carregarDados();
    } catch (e) {
      Alert.alert('Erro', 'Falha ao executar ação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Via 1 - Operacional V2</Text>
      
      {/* Seletor de Perfis */}
      <View style={styles.perfisContainer}>
        {['AVALIADOR', 'OFICINA', 'ADMIN', 'QUALIDADE', 'LAVAGEM'].map((p: any) => (
          <TouchableOpacity key={p} style={[styles.btnPerfil, perfil === p && styles.btnPerfilAtivo]} onPress={() => setPerfil(p)}>
            <Text style={[styles.txtPerfil, perfil === p && styles.txtPerfilAtivo]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subHeader}>Painel: {perfil}</Text>

      {itemSelecionado ? (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Item: {itemSelecionado.placa || itemSelecionado.descricao}</Text>
          <TextInput style={styles.input} placeholder="Descrição / Laudo / Observação" value={textoInput} onChangeText={setTextoInput} />
          <TouchableOpacity style={styles.btnAcao} onPress={executarAcao}>
            <Text style={styles.btnAcaoText}>Confirmar Ação</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => setItemSelecionado(null)}>
            <Text style={styles.txtVoltar}>Voltar à Fila</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setItemSelecionado(item)}>
              <Text style={styles.cardTitle}>{item.placa || `Serviço #${item.id}`}</Text>
              <Text>{item.marca_modelo || item.descricao} - Loja: {item.loja_display || 'Geral'}</Text>
              <Text style={{color: '#0066cc', marginTop: 5, fontWeight: 'bold'}}>Toque para gerenciar ➔</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{marginTop: 20, textAlign: 'center'}}>Nenhum item pendente para este perfil.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', paddingTop: 50, paddingHorizontal: 15 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  perfisContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 },
  btnPerfil: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#ddd', margin: 3, borderRadius: 5 },
  btnPerfilAtivo: { backgroundColor: '#0066cc' },
  txtPerfil: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  txtPerfilAtivo: { color: '#fff' },
  subHeader: { fontSize: 16, fontWeight: 'bold', color: '#444', marginVertical: 10 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginTop: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15, backgroundColor: '#fafafa' },
  btnAcao: { backgroundColor: '#28a745', padding: 12, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  btnAcaoText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnVoltar: { padding: 10, alignItems: 'center' },
  txtVoltar: { color: '#666', fontWeight: 'bold' }
});