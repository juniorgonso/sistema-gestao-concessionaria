import React, { useState, useEffect } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonButton, IonSpinner, IonText
} from '@ionic/react';
import { logout } from '../services/auth';

// Interface genérica que permite solicitações de qualquer líder no futuro
interface DemandaExterna {
  id: number;
  titulo: string;
  descricao: string;
  solicitante: string; // Ex: 'Administrativo', 'Gerente de Vendas', 'Chefe de Oficina'
  data_solicitacao: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';
}

const ServicoExterno: React.FC = () => {
  const [demandas, setDemandas] = useState<DemandaExterna[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDemandas();
  }, []);

  const handleSair = () => {
    logout();
    window.location.href = '/login'; // Mantendo a limpeza de cache segura!
  };

  const carregarDemandas = async () => {
    setLoading(true);
    // 🛡️ MOCK PARA DEMONSTRAÇÃO: Simulando as tarefas enviadas pelos líderes
    setTimeout(() => {
      setDemandas([
        {
          id: 1,
          titulo: 'Buscar Jogo de Pneus',
          descricao: 'Buscar pneus na distribuidora Y para a Hilux que está na oficina.',
          solicitante: 'Administrativo',
          data_solicitacao: '2026-10-12T10:00:00',
          status: 'PENDENTE'
        },
        {
          id: 2,
          titulo: 'Serviço de Torneiro',
          descricao: 'Levar cabeçote do motor do Civic (Placa QWE-1234) ao torneiro mecânico parceiro.',
          solicitante: 'Administrativo',
          data_solicitacao: '2026-10-12T11:30:00',
          status: 'EM_ANDAMENTO'
        }
      ]);
      setLoading(false);
    }, 800);
  };

  const iniciarDemanda = (id: number) => {
    // Atualiza visualmente para o operador saber que ele assumiu a tarefa
    setDemandas(demandas.map(d => d.id === id ? { ...d, status: 'EM_ANDAMENTO' } : d));
  };

  const concluirDemanda = (id: number) => {
    alert('Demanda concluída! O solicitante será notificado.');
    // Remove da tela após concluído (no futuro, fará um POST/PATCH pra API)
    setDemandas(demandas.filter(d => d.id !== id));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonTitle>🚚 Serviço Externo</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair}>Sair</IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
            <p>Buscando solicitações...</p>
          </div>
        ) : demandas.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <IonText color="medium">
              <p>Nenhuma demanda externa pendente no momento.</p>
            </IonText>
          </div>
        ) : (
          demandas.map((d) => (
            <IonCard key={d.id}>
              <IonCardHeader>
                <IonCardTitle>{d.titulo}</IonCardTitle>
                <IonBadge color={d.status === 'PENDENTE' ? 'danger' : 'warning'}>
                  {d.status.replace('_', ' ')}
                </IonBadge>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Descrição:</strong> {d.descricao}</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Solicitado por:</strong> <IonBadge color="dark">{d.solicitante}</IonBadge>
                </p>
                <p><strong>Data:</strong> {new Date(d.data_solicitacao).toLocaleString('pt-BR')}</p>
                
                {d.status === 'PENDENTE' ? (
                  <IonButton 
                    expand="block" 
                    color="primary" 
                    style={{ marginTop: '15px' }}
                    onClick={() => iniciarDemanda(d.id)}
                  >
                    Aceitar e Iniciar Trajeto
                  </IonButton>
                ) : (
                  <IonButton 
                    expand="block" 
                    color="success" 
                    style={{ marginTop: '15px' }}
                    onClick={() => concluirDemanda(d.id)}
                  >
                    Marcar como Concluído
                  </IonButton>
                )}
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default ServicoExterno;