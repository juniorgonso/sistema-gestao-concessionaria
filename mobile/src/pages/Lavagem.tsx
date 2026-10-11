import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonButton, useIonRouter, IonText
} from '@ionic/react';
import { listarParaLavagem, concluirLavagem, VeiculoLavagem } from '../services/workflow';
import { logout } from '../services/auth';

const Lavagem: React.FC = () => {
  const [veiculos, setVeiculos] = useState<VeiculoLavagem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useIonRouter();

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleSair = () => {
    logout();
    router.push('/login', 'forward', 'replace');
  };

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      const dados = await listarParaLavagem();
      console.log("🚗 DADOS QUE CHEGARAM À TELA LAVAGEM:", dados);
      setVeiculos(Array.isArray(dados) ? dados : []);
    } catch (error: any) {
      console.error("Erro ao carregar veículos:", error);
      if (error.response?.status === 401) handleSair();
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarLavagem = async (cicloId: number) => {
    try {
      await concluirLavagem(cicloId);
      alert('Lavagem concluída com sucesso!');
      carregarVeiculos();
    } catch (error: any) {
      alert('Erro ao concluir lavagem.');
      if (error.response?.status === 401) handleSair();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonTitle>🚿 Painel de Lavagem</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair}>
            Sair
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="bubbles" />
            <p>A procurar veículos na fila...</p>
          </div>
        ) : veiculos.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <IonText color="medium">
              <p>Nenhum veículo aguardando lavagem no momento.</p>
            </IonText>
            <p style={{ fontSize: '12px', color: '#888' }}>
              (Verifique o console F12 para ver o array bruto retornado pela API)
            </p>
          </div>
        ) : (
          veiculos.map((v, index) => (
            <IonCard key={v.id || index}>
              <IonCardHeader>
                <IonCardTitle>{v.marca_modelo || 'Veículo sem modelo'}</IonCardTitle>
                <IonBadge color="primary">{v.placa || 'Sem Placa'}</IonBadge>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Status Atual:</strong> {v.status || 'Pendente'}</p>
                <p><strong>Ciclo Operacional:</strong> #{v.ciclo_ativo || v.id}</p>
                
                <IonButton 
                  expand="block" 
                  color="success" 
                  style={{ marginTop: '15px' }}
                  onClick={() => handleFinalizarLavagem(v.ciclo_ativo || v.id)}
                >
                  Concluir Lavagem
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default Lavagem;