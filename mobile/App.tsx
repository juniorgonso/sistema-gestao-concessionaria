import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, SafeAreaView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Role = 'LAVAGEM' | 'QUALIDADE' | 'OFICINA' | 'EXTERNO';

export default function App() {
  // ================= ESTADOS DE AUTENTICAÇÃO E UX =================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [userRole, setUserRole] = useState<Role | null>(null);
  
  const senhaRef = useRef<TextInput>(null);

  // ================= ESTADOS OPERACIONAIS =================
  const [filaLavagem, setFilaLavagem] = useState<any[]>([
    { id: 'l1', placa: 'ABC-1234', modelo: 'Honda Civic', status: 'AGUARDANDO', servico: 'Lavagem completa + Remoção de película' }
  ]);

  const [filaQualidade, setFilaQualidade] = useState<any[]>([
    { id: 'q1', placa: 'XYZ-9876', modelo: 'Jeep Compass', status: 'EM INSPEÇÃO', etapa: 'ENTRADA', dataRecebimento: '04/10/2026 08:30', destino: 'SHOWROOM', polimentoConcluido: false, manutencaoConcluida: true, ocorrencias: [] },
    { id: 'q3', placa: 'WWW-1111', modelo: 'Ford Ka', status: 'EM INSPEÇÃO', etapa: 'ENTRADA', dataRecebimento: '04/10/2026 09:15', destino: 'VENDA NO ESTADO', polimentoConcluido: false, manutencaoConcluida: false, ocorrencias: [] },
    { id: 'q2', placa: 'LMN-0987', modelo: 'Fiat Toro', status: 'AGUARDANDO REVISÃO', etapa: 'POS_LAVAGEM', dataRecebimento: null, destino: 'SHOWROOM', ocorrencias: [] }
  ]);
  const [veiculoQualidadeAtivo, setVeiculoQualidadeAtivo] = useState<any>(null);
  const [modalQualidade, setModalQualidade] = useState(false);
  const [descQualidade, setDescQualidade] = useState('');
  const [modalEncaminhar, setModalEncaminhar] = useState(false);

  const [filaOficina, setFilaOficina] = useState<any[]>([
    { id: 'of1', placa: 'DEF-5678', modelo: 'VW Nivus', status: 'AGUARDANDO INÍCIO', ocorrenciaspecas: [{ id: 1, descricao: 'Kit amortecedor dianteiro', statusAdm: 'PENDENTE', obsAdm: null }] }
  ]);
  const [veiculoOficinaAtivo, setVeiculoOficinaAtivo] = useState<any>(null);
  const [modalOficina, setModalOficina] = useState(false);
  const [descOficina, setDescOficina] = useState('');

  const [filaExterno, setFilaExterno] = useState<any[]>([
    { id: 'ext1', titulo: 'Buscar 4 pneus', local: 'Fornecedor Pneus Sul', prioridade: 'ALTA', status: 'PENDENTE', veiculo_relacionado: 'DEF-5678', obs: 'Falar com gerente Carlos' },
    { id: 'ext2', titulo: 'Levar documento ao Detran', local: 'Detran Centro', prioridade: 'NORMAL', status: 'EM ANDAMENTO', veiculo_relacionado: null, obs: 'Procurar despachante na sala 2' }
  ]);
  const [modalExterno, setModalExterno] = useState(false);
  const [itemExternoAtivo, setItemExternoAtivo] = useState<any>(null);
  const [descExterno, setDescExterno] = useState('');

  // ================= FUNÇÕES =================
  const handleLogin = () => {
    const email = emailInput.toLowerCase();
    let role: Role = 'QUALIDADE';
    if (email.includes('lavagem')) role = 'LAVAGEM';
    else if (email.includes('oficina') || email.includes('mecanica')) role = 'OFICINA';
    else if (email.includes('externo') || email.includes('auxiliar')) role = 'EXTERNO';
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setUserRole(null); setEmailInput(''); setSenhaInput('');
  };

  const iniciarLavagem = (id: string) => setFilaLavagem(filaLavagem.map(v => v.id === id ? { ...v, status: 'EM EXECUÇÃO' } : v));
  const concluirLavagem = (veiculo: any) => {
    setFilaLavagem(filaLavagem.filter(v => v.id !== veiculo.id));
    setFilaQualidade([...filaQualidade, { ...veiculo, id: Date.now().toString(), status: 'AGUARDANDO REVISÃO', etapa: 'POS_LAVAGEM', ocorrencias: [] }]);
    alert('Serviço concluído! Veículo enviado para Revisão.');
  };

  const confirmarRecebimentoQualidade = (veiculo: any) => {
    setFilaQualidade(filaQualidade.map(v => v.id === veiculo.id ? { ...veiculo, status: 'EM INSPEÇÃO', dataRecebimento: new Date().toLocaleString() } : v));
    alert('Recebimento confirmado.');
  };

  const salvarOcorrenciaQualidade = () => {
    if (!descQualidade.trim()) return alert('Informe a ocorrência.');
    const novaOco = { id: Date.now(), descricao: descQualidade, statusAdm: 'PENDENTE', obsAdm: null };
    const veiculoUp = { ...veiculoQualidadeAtivo, ocorrencias: [...veiculoQualidadeAtivo.ocorrencias, novaOco] };
    setVeiculoQualidadeAtivo(veiculoUp);
    setFilaQualidade(filaQualidade.map(v => v.id === veiculoUp.id ? veiculoUp : v));
    setDescQualidade(''); setModalQualidade(false);
    alert('Ocorrência salva!');
  };

  const marcarRetornoTerceirizado = (veiculo: any) => {
    setFilaQualidade(filaQualidade.map(v => v.id === veiculo.id ? { ...veiculo, polimentoConcluido: true } : v));
    alert('Marcado como POLIDO.');
  };

  const executarEncaminhamento = (destino: string) => {
    if (destino === 'Lavagem') {
      if (veiculoQualidadeAtivo.ocorrencias.some((o: any) => o.statusAdm === 'PENDENTE')) return alert('AÇÃO BLOQUEADA! Resolva ocorrências pendentes.');
      if (veiculoQualidadeAtivo.destino === 'SHOWROOM') {
        if (!veiculoQualidadeAtivo.polimentoConcluido) return alert('AÇÃO BLOQUEADA! Polimento obrigatório.');
        if (!veiculoQualidadeAtivo.manutencaoConcluida) return alert('AÇÃO BLOQUEADA! Manutenção pendente.');
      }
    }
    setFilaQualidade(filaQualidade.filter(v => v.id !== veiculoQualidadeAtivo.id));
    setVeiculoQualidadeAtivo(null); setModalEncaminhar(false);
    alert(`Veículo encaminhado para: ${destino}!`);
  };

  const revisarLavagem = (id: string, decisao: 'APROVAR' | 'REPROVAR') => {
    const veiculo = filaQualidade.find(v => v.id === id);
    setFilaQualidade(filaQualidade.filter(v => v.id !== id));
    if (decisao === 'APROVAR') {
      alert('Liberado para SHOWROOM!');
    } else {
      setFilaLavagem([...filaLavagem, { ...veiculo, id: Date.now().toString(), status: 'RETRABALHO', servico: 'Reprovado. Refazer.' }]);
      alert('Reprovado. Retornou para Lavagem.');
    }
  };

  const iniciarServicoOficina = (veiculo: any) => setFilaOficina(filaOficina.map(v => v.id === veiculo.id ? { ...veiculo, status: 'EM ANDAMENTO' } : v));
  const salvarProblemaPecaOficina = () => {
    if (!descOficina.trim()) return alert('Informe o problema.');
    const novaDemanda = { id: Date.now(), descricao: descOficina, statusAdm: 'PENDENTE', obsAdm: null };
    const veiculoUp = { ...veiculoOficinaAtivo, ocorrenciaspecas: [...veiculoOficinaAtivo.ocorrenciaspecas, novaDemanda] };
    setVeiculoOficinaAtivo(veiculoUp);
    setFilaOficina(filaOficina.map(v => v.id === veiculoUp.id ? veiculoUp : v));
    setDescOficina(''); setModalOficina(false);
    alert('Demanda registrada!');
  };
  const finalizarServicoOficina = (veiculo: any) => {
    if (veiculo.ocorrenciaspecas.some((p: any) => p.statusAdm === 'PENDENTE')) return alert('AÇÃO BLOQUEADA! Aguarde aprovação do ADM.');
    setFilaOficina(filaOficina.filter(v => v.id !== veiculo.id));
    setVeiculoOficinaAtivo(null);
    alert('Serviço concluído!');
  };

  const iniciarDemanda = (id: string) => setFilaExterno(filaExterno.map(d => d.id === id ? { ...d, status: 'EM ANDAMENTO' } : d));
  const concluirDemanda = (id: string) => { setFilaExterno(filaExterno.filter(d => d.id !== id)); alert('Demanda concluída!'); };
  const salvarImpedimentoDemanda = () => {
    if (!descExterno.trim()) return alert('Descreva o motivo.');
    setFilaExterno(filaExterno.filter(d => d.id !== itemExternoAtivo.id));
    setModalExterno(false); setDescExterno('');
    alert('Ocorrência registrada! Enviado ao ADM.');
  };

  const TagStatusAdm = ({ status, obs }: { status: string, obs: string | null }) => (
    <View style={{ marginTop: 8 }}>
      <View style={{ alignSelf: 'flex-start', backgroundColor: status === 'AUTORIZADA' ? '#DCFCE7' : status === 'NEGADA' ? '#FEE2E2' : '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: status === 'AUTORIZADA' ? '#16A34A' : status === 'NEGADA' ? '#DC2626' : '#D97706' }}>STATUS ADM: {status}</Text>
      </View>
      {obs && <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4, fontStyle: 'italic' }}>💬 Obs: {obs}</Text>}
    </View>
  );

  // ================= TELA DE LOGIN =================
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
        {/* Usamos behavior="padding" explícito e offset para garantir que suba no Android e iOS */}
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView contentContainerStyle={styles.loginScrollContainer} keyboardShouldPersistTaps="handled" bounces={false}>
            <View style={styles.loginCard}>
              <View style={styles.loginIconBox}><Ionicons name="car-sport" size={40} color="#38BDF8" /></View>
              <Text style={styles.loginTitle}>Via 1 Operação</Text>
              <Text style={styles.loginSubtitle}>Acesso por setor</Text>
              
              <TextInput 
                style={styles.inputLogin} 
                placeholder="E-mail (ex: externo@via1.com)" 
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => senhaRef.current?.focus()}
                blurOnSubmit={false}
                value={emailInput} 
                onChangeText={setEmailInput} 
              />
              <TextInput 
                ref={senhaRef}
                style={styles.inputLogin} 
                placeholder="Senha" 
                secureTextEntry 
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                value={senhaInput} 
                onChangeText={setSenhaInput} 
              />
              <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}><Text style={styles.btnLoginText}>ENTRAR NO SISTEMA</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ================= TELA PRINCIPAL DO APP =================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Via 1 • Operacional</Text>
          <Text style={styles.headerSubtitle}>Setor: <Text style={{color: '#38BDF8', fontWeight: 'bold'}}>{userRole}</Text></Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* ================= REPETIÇÃO DAS TELAS (LAVAGEM, QUALIDADE, OFICINA, EXTERNO) ================= */}
        {userRole === 'LAVAGEM' && (
          <View>
            <View style={styles.welcomeBox}><Ionicons name="water" size={24} color="#0369A1" /><Text style={styles.welcomeText}>Lavagem e Higienização</Text></View>
            {filaLavagem.map((veiculo) => (
              <View key={veiculo.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.placa}>{veiculo.placa}</Text>
                  <Text style={[styles.badge, veiculo.status === 'RETRABALHO' ? styles.badgeDanger : styles.badgeWaiting]}>{veiculo.status}</Text>
                </View>
                <Text style={styles.modelo}>{veiculo.modelo}</Text>
                {veiculo.status === 'AGUARDANDO' || veiculo.status === 'RETRABALHO' ? (
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => iniciarLavagem(veiculo.id)}><Ionicons name="play" size={18} color="#FFF" /><Text style={styles.btnText}>INICIAR SERVIÇO</Text></TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.btnSuccess} onPress={() => concluirLavagem(veiculo)}><Ionicons name="checkmark-done" size={18} color="#FFF" /><Text style={styles.btnText}>ENVIAR PARA REVISÃO</Text></TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {userRole === 'QUALIDADE' && (
          <View>
            <View style={styles.welcomeBoxQualidade}><Ionicons name="shield-checkmark" size={24} color="#92400E" /><Text style={styles.welcomeTextQualidade}>Inspeção e Qualidade</Text></View>
            {filaQualidade.map((veiculo) => (
              <View key={veiculo.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.placa}>{veiculo.placa}</Text>
                  <Text style={veiculo.etapa === 'POS_LAVAGEM' ? styles.badgeSuccess : styles.badgeWarning}>{veiculo.status}</Text>
                </View>
                <Text style={styles.modelo}>{veiculo.modelo}</Text>
                
                {veiculo.etapa === 'ENTRADA' && (
                  <View>
                    <View style={styles.infoDestinoBox}>
                      <Text style={{ fontWeight: 'bold', color: '#1E293B', fontSize: 13 }}>DESTINO: {veiculo.destino}</Text>
                      {veiculo.destino === 'SHOWROOM' && <Text style={{ fontSize: 11, color: '#64748B' }}>Polimento: {veiculo.polimentoConcluido ? '✅' : '❌'}</Text>}
                    </View>
                    {veiculo.status === 'AGUARDANDO RECEBIMENTO' ? (
                      <TouchableOpacity style={styles.btnPrimary} onPress={() => confirmarRecebimentoQualidade(veiculo)}><Ionicons name="checkbox" size={18} color="#FFF" /><Text style={styles.btnText}>CONFIRMAR RECEBIMENTO</Text></TouchableOpacity>
                    ) : (
                      <View>
                        <TouchableOpacity style={styles.btnDark} onPress={() => { setVeiculoQualidadeAtivo(veiculo); setModalQualidade(true); }}><Ionicons name="add-circle" size={18} color="#FFF" /><Text style={styles.btnText}>REGISTRAR OCORRÊNCIA</Text></TouchableOpacity>
                        {veiculo.destino === 'SHOWROOM' && !veiculo.polimentoConcluido && (
                          <TouchableOpacity style={[styles.btnOutline, { marginTop: 10 }]} onPress={() => marcarRetornoTerceirizado(veiculo)}><Text style={{color: '#0F172A', fontWeight: 'bold', fontSize: 12}}>MARCAR VOLTA DO POLIMENTO</Text></TouchableOpacity>
                        )}
                        {veiculo.ocorrencias.map((occ: any) => (
                          <View key={occ.id} style={styles.miniTag}><Text style={{ fontSize: 13, fontWeight: 'bold' }}>{occ.descricao}</Text><TagStatusAdm status={occ.statusAdm} obs={occ.obsAdm} /></View>
                        ))}
                        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 15 }]} onPress={() => { setVeiculoQualidadeAtivo(veiculo); setModalEncaminhar(true); }}><Ionicons name="arrow-redo" size={18} color="#FFF" /><Text style={styles.btnText}>ENCAMINHAR VEÍCULO</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {veiculo.etapa === 'POS_LAVAGEM' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={[styles.btnDanger, { flex: 1 }]} onPress={() => revisarLavagem(veiculo.id, 'REPROVAR')}><Text style={styles.btnText}>REPROVAR</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.btnSuccess, { flex: 1.2 }]} onPress={() => revisarLavagem(veiculo.id, 'APROVAR')}><Text style={styles.btnText}>LIBERAR SHOWROOM</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {userRole === 'OFICINA' && (
          <View>
            <View style={styles.welcomeBoxOficina}><Ionicons name="construct" size={24} color="#1E3A8A" /><Text style={styles.welcomeTextOficina}>Mecânica e Diagnóstico</Text></View>
            {filaOficina.map((veiculo) => (
              <View key={veiculo.id} style={styles.card}>
                <View style={styles.cardHeader}><Text style={styles.placa}>{veiculo.placa}</Text><Text style={styles.badgeOficina}>{veiculo.status}</Text></View>
                <Text style={styles.modelo}>{veiculo.modelo}</Text>
                {veiculo.status === 'AGUARDANDO INÍCIO' ? (
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => iniciarServicoOficina(veiculo)}><Ionicons name="play" size={18} color="#FFF" /><Text style={styles.btnText}>INICIAR SERVIÇO</Text></TouchableOpacity>
                ) : (
                  <View>
                    <TouchableOpacity style={styles.btnDark} onPress={() => { setVeiculoOficinaAtivo(veiculo); setModalOficina(true); }}><Text style={styles.btnText}>SOLICITAR PEÇA</Text></TouchableOpacity>
                    {veiculo.ocorrenciaspecas.map((item: any) => (
                      <View key={item.id} style={styles.miniTag}><Text style={{ fontSize: 13, fontWeight: 'bold' }}>{item.descricao}</Text><TagStatusAdm status={item.statusAdm} obs={item.obsAdm} /></View>
                    ))}
                    <TouchableOpacity style={[styles.btnSuccess, { marginTop: 15 }]} onPress={() => finalizarServicoOficina(veiculo)}><Text style={styles.btnText}>FINALIZAR SERVIÇO</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {userRole === 'EXTERNO' && (
          <View>
            <View style={styles.welcomeBoxExterno}><Ionicons name="map" size={24} color="#4D7C0F" /><Text style={styles.welcomeTextExterno}>Logística Externa</Text></View>
            {filaExterno.map((demanda) => (
              <View key={demanda.id} style={styles.card}>
                <View style={styles.cardHeader}><Text style={styles.tituloDemanda}>{demanda.titulo}</Text><Text style={[styles.badge, demanda.prioridade === 'ALTA' ? styles.badgeDanger : styles.badgeNormal]}>{demanda.prioridade}</Text></View>
                <View style={styles.infoRow}><Ionicons name="location-outline" size={16} color="#64748B" /><Text style={styles.infoText}>{demanda.local}</Text></View>
                {demanda.status === 'PENDENTE' ? (
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => iniciarDemanda(demanda.id)}><Text style={styles.btnText}>INICIAR DESLOCAMENTO</Text></TouchableOpacity>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity style={[styles.btnDanger, { flex: 1 }]} onPress={() => { setItemExternoAtivo(demanda); setModalExterno(true); }}><Text style={styles.btnText}>OCORRÊNCIA</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.btnSuccess, { flex: 1.2 }]} onPress={() => concluirDemanda(demanda.id)}><Text style={styles.btnText}>CONCLUÍDO</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ================= MODAIS (Com proteção total de teclado e padding) ================= */}
      
      <Modal visible={modalQualidade} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Registrar Ocorrência</Text>
            <TextInput style={styles.input} placeholder="Descreva o problema..." value={descQualidade} onChangeText={setDescQualidade} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancelModal} onPress={() => setModalQualidade(false)}><Text style={{ color: '#64748B', fontWeight: 'bold' }}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSaveModal} onPress={salvarOcorrenciaQualidade}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>SALVAR</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalOficina} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Solicitação Técnica</Text>
            <TextInput style={styles.input} placeholder="Qual peça ou serviço?" value={descOficina} onChangeText={setDescOficina} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancelModal} onPress={() => setModalOficina(false)}><Text style={{ color: '#64748B', fontWeight: 'bold' }}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSaveModal} onPress={salvarProblemaPecaOficina}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>ENVIAR AO ADM</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalExterno} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Registrar Impedimento</Text>
            <TextInput style={styles.input} placeholder="Por que não foi concluída?" value={descExterno} onChangeText={setDescExterno} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancelModal} onPress={() => setModalExterno(false)}><Text style={{ color: '#64748B', fontWeight: 'bold' }}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSaveModal} onPress={salvarImpedimentoDemanda}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>ENVIAR AO ADM</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalEncaminhar} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Encaminhar Veículo</Text>
            <TouchableOpacity style={styles.btnDestino} onPress={() => executarEncaminhamento('Oficina Mecânica')}><Text style={styles.btnTextDestino}>🔧 Oficina Mecânica</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnDestino} onPress={() => executarEncaminhamento('Pintura / Polimento')}><Text style={styles.btnTextDestino}>🎨 Pintura / Polimento</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnDestino} onPress={() => executarEncaminhamento('Lavagem')}><Text style={styles.btnTextDestino}>💧 Lavagem Final</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btnCancelModal, { marginTop: 15 }]} onPress={() => setModalEncaminhar(false)}><Text style={{ color: '#64748B', fontWeight: 'bold' }}>CANCELAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loginScrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  loginCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center' },
  loginIconBox: { backgroundColor: '#0F172A', padding: 20, borderRadius: 50, marginBottom: 20 },
  loginTitle: { fontSize: 26, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  loginSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 25, textAlign: 'center' },
  inputLogin: { width: '100%', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 15, marginBottom: 15 },
  btnLogin: { width: '100%', backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnLoginText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  btnLogout: { backgroundColor: '#1E293B', padding: 8, borderRadius: 6 },
  content: { padding: 20 },
  welcomeBox: { backgroundColor: '#E0F2FE', padding: 15, borderRadius: 8, flexDirection: 'row', gap: 10, marginBottom: 20 },
  welcomeText: { color: '#0369A1', fontWeight: 'bold', fontSize: 14 },
  welcomeBoxQualidade: { backgroundColor: '#FEF3C7', padding: 15, borderRadius: 8, flexDirection: 'row', gap: 10, marginBottom: 20 },
  welcomeTextQualidade: { color: '#92400E', fontWeight: 'bold', fontSize: 14 },
  welcomeBoxOficina: { backgroundColor: '#DBEAFE', padding: 15, borderRadius: 8, flexDirection: 'row', gap: 10, marginBottom: 20 },
  welcomeTextOficina: { color: '#1E3A8A', fontWeight: 'bold', fontSize: 14 },
  welcomeBoxExterno: { backgroundColor: '#ECFCCB', padding: 15, borderRadius: 8, flexDirection: 'row', gap: 10, marginBottom: 20 },
  welcomeTextExterno: { color: '#3F6212', fontWeight: 'bold', fontSize: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  tituloDemanda: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', flex: 1, marginRight: 10 },
  placa: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  modelo: { fontSize: 15, color: '#64748B', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoText: { fontSize: 14, color: '#475569' },
  infoDestinoBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 6, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 10, fontWeight: 'bold' },
  badgeWaiting: { backgroundColor: '#E0F2FE', color: '#0369A1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 11, fontWeight: 'bold' },
  badgeActive: { backgroundColor: '#FEF3C7', color: '#D97706', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 11, fontWeight: 'bold' },
  badgeWarning: { backgroundColor: '#FEE2E2', color: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 11, fontWeight: 'bold' },
  badgeDanger: { backgroundColor: '#FEE2E2', color: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 11, fontWeight: 'bold' },
  badgeSuccess: { backgroundColor: '#DCFCE7', color: '#16A34A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 11, fontWeight: 'bold' },
  badgeOficina: { backgroundColor: '#DBEAFE', color: '#1E3A8A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 11, fontWeight: 'bold' },
  badgeNormal: { backgroundColor: '#E0F2FE', color: '#0369A1' },
  btnPrimary: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  btnSuccess: { backgroundColor: '#10B981', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  btnDark: { backgroundColor: '#0F172A', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  btnDanger: { backgroundColor: '#EF4444', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  btnOutline: { backgroundColor: 'transparent', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  miniTag: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 15, height: 90, textAlignVertical: 'top', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 15 },
  btnCancelModal: { flex: 1, padding: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#F1F5F9' },
  btnSaveModal: { flex: 1, padding: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#3B82F6' },
  btnDestino: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  btnTextDestino: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' }
});