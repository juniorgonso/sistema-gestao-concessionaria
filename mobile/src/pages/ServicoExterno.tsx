import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonButton, useIonRouter, IonText
} from '@ionic/react';
import { listarServicosExternos, concluirServicoExterno, VeiculoLavagem } from '../services/workflow';
import { logout } from '../services/auth';

const ServicoExterno: React.FC = () => {
  const [veiculos, setVeiculos] = useState<VeiculoLavagem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useIonRouter();

  useEffect(() => { carregarVeiculos(); }, []);

  const handleSair = () => { logout(); router.push('/login', 'forward', 'replace'); };

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      const dados = await listarServicosExternos();
      setVeiculos(dados);
    } catch (error: any) {
      if (error.response?.status === 401) handleSair();
    } finally {
      setLoading(false);
    }
  };

  const handleRetorno = async (cicloId: number) => {
    try {
      await concluirServicoExterno(cicloId);
      alert('Retorno de Serviço Externo confirmado!');
      carregarVeiculos();
    } catch (error: any) {
      alert('Erro ao confirmar retorno.');
      if (error.response?.status === 401) handleSair();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="medium">
          <IonTitle>🚚 Serviços Externos</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair}>Sair</IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="lines" />
            <p>A procurar veículos em terceiros...</p>
          </div>
        ) : veiculos.length === 0 ? (
          <IonText color="medium" className="ion-text-center">
            <p>Nenhum veículo em serviço externo no momento.</p>
          </IonText>
        ) : (
          veiculos.map((v) => (
            <IonCard key={v.id}>
              <IonCardHeader>
                <IonCardTitle>{v.marca_modelo}</IonCardTitle>
                <IonBadge color="dark">{v.placa}</IonBadge>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Status:</strong> Em Serviço Externo</p>
                <p><strong>Ciclo:</strong> #{v.ciclo_ativo}</p>
                
                <IonButton 
                  expand="block" 
                  color="success" 
                  style={{ marginTop: '15px' }}
                  onClick={() => handleRetorno(v.ciclo_ativo)}
                >
                  Confirmar Retorno do Veículo
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default ServicoExterno;