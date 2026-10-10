import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonText, IonButton, useIonRouter,
  IonFab, IonFabButton, IonIcon 
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { listarOcorrencias, Ocorrencia, atualizarStatus } from '../services/ocorrencias';
import { logout } from '../services/auth';

const Home: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useIonRouter();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const dados = await listarOcorrencias();
      setOcorrencias(dados);
    } catch (error) {
      console.error("Falha ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConcluir = async (id: number) => {
    try {
      await atualizarStatus(id, 'CONCLUIDO');
      carregarDados(); // Recarrega a lista automaticamente para o card ficar verde
    } catch (error) {
      console.error("Falha ao concluir ocorrência", error);
    }
  };

  const handleSair = () => {
    logout();
    router.push('/login', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Painel de Ocorrências</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair}>
            Sair
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
            <p>A carregar dados da V2.1...</p>
          </div>
        ) : ocorrencias.length === 0 ? (
          <IonText color="medium" className="ion-text-center">
            <p>Nenhuma ocorrência registada.</p>
          </IonText>
        ) : (
          ocorrencias.map((ocorrencia) => (
            <IonCard key={ocorrencia.id}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1.1rem' }}>
                  Veículo ID: {ocorrencia.veiculo}
                </IonCardTitle>
                <IonBadge color={ocorrencia.status === 'PENDENTE' ? 'warning' : 'success'}>
                  {ocorrencia.status}
                </IonBadge>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Origem:</strong> {ocorrencia.origem}</p>
                <p><strong>Descrição:</strong> {ocorrencia.descricao}</p>
                <p style={{ fontSize: '0.8rem', marginTop: '10px', color: 'gray' }}>
                  Ciclo: {ocorrencia.ciclo} | Registo: {new Date(ocorrencia.criado_em).toLocaleDateString('pt-PT')}
                </p>
                
                {/* O botão de concluir só aparece se o status for PENDENTE */}
                {ocorrencia.status === 'PENDENTE' && (
                  <IonButton 
                    fill="outline" 
                    size="small" 
                    color="success" 
                    className="ion-margin-top"
                    onClick={() => handleConcluir(ocorrencia.id)}
                  >
                    Marcar como Concluído
                  </IonButton>
                )}
              </IonCardContent>
            </IonCard>
          ))
        )}

        {/* Botão flutuante para adicionar nova ocorrência */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => router.push('/nova-ocorrencia', 'forward')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        
      </IonContent>
    </IonPage>
  );
};

export default Home;