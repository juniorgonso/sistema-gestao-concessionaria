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
      setVeiculos(dados);
    } catch (error: any) {
      if (error.response?.status === 401) handleSair();
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarLavagem = async (cicloId: number) => {
    try {
      await concluirLavagem(cicloId);
      alert('Lavagem concluída com sucesso!');
      carregarVeiculos(); // Atualiza a lista para remover o carro pronto
    } catch (error: any) {
      alert('Erro ao concluir lavagem. Verifique a permissão.');
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
          <IonText color="medium" className="ion-text-center">
            <p>Nenhum veículo aguardando lavagem no momento.</p>
          </IonText>
        ) : (
          veiculos.map((v) => (
            <IonCard key={v.id}>
              <IonCardHeader>
                <IonCardTitle>{v.marca_modelo}</IonCardTitle>
                <IonBadge color="primary">{v.placa}</IonBadge>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Status Atual:</strong> Aguardando Lavagem</p>
                <p><strong>Ciclo Operacional:</strong> #{v.ciclo_ativo}</p>
                
                <IonButton 
                  expand="block" 
                  color="success" 
                  style={{ marginTop: '15px' }}
                  onClick={() => handleFinalizarLavagem(v.ciclo_ativo)}
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