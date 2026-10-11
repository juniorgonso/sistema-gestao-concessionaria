import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonButton, useIonRouter, IonText,
  IonTextarea, IonItem, IonLabel
} from '@ionic/react';
import { listarParaVistoria, registrarVistoria, VeiculoLavagem } from '../services/workflow';
import { logout } from '../services/auth';

const Vistoria: React.FC = () => {
  const [veiculos, setVeiculos] = useState<VeiculoLavagem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [observacoes, setObservacoes] = useState<{ [key: number]: string }>({}); // Guarda o texto de cada carro
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
      const dados = await listarParaVistoria();
      setVeiculos(dados);
    } catch (error: any) {
      if (error.response?.status === 401) handleSair();
    } finally {
      setLoading(false);
    }
  };

  const handleResultado = async (cicloId: number, resultado: string) => {
    const obs = observacoes[cicloId] || (resultado === 'APROVADO' ? 'Tudo em ordem' : 'Requer atenção');
    
    try {
      await registrarVistoria(cicloId, resultado, obs);
      alert(`Vistoria registada como ${resultado}!`);
      carregarVeiculos(); // Recarrega a lista para sumir com o carro avaliado
    } catch (error: any) {
      alert('Erro ao registar vistoria. Tem certeza de que você é da Qualidade?');
      if (error.response?.status === 401) handleSair();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>🔍 Controle de Qualidade</IonTitle>
          <IonButton slot="end" fill="clear" color="dark" onClick={handleSair}>
            Sair
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
            <p>A procurar veículos para inspeção...</p>
          </div>
        ) : veiculos.length === 0 ? (
          <IonText color="medium" className="ion-text-center">
            <p>Nenhum veículo aguardando vistoria no momento. Bom trabalho!</p>
          </IonText>
        ) : (
          veiculos.map((v) => (
            <IonCard key={v.id}>
              <IonCardHeader>
                <IonCardTitle>{v.marca_modelo}</IonCardTitle>
                <IonBadge color="dark">{v.placa}</IonBadge>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Status Atual:</strong> Aguardando Vistoria</p>
                <p><strong>Ciclo:</strong> #{v.ciclo_ativo}</p>
                
                <IonItem style={{ marginTop: '10px' }}>
                  <IonLabel position="stacked">Observações do Inspetor</IonLabel>
                  <IonTextarea 
                    placeholder="Ex: Pintura ok, higienização impecável..."
                    value={observacoes[v.ciclo_ativo] || ''}
                    onIonChange={(e) => setObservacoes({...observacoes, [v.ciclo_ativo]: e.detail.value!})}
                  />
                </IonItem>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <IonButton 
                    expand="block" 
                    color="success" 
                    style={{ flex: 1 }}
                    onClick={() => handleResultado(v.ciclo_ativo, 'APROVADO')}
                  >
                    APROVAR
                  </IonButton>
                  <IonButton 
                    expand="block" 
                    color="danger" 
                    style={{ flex: 1 }}
                    onClick={() => handleResultado(v.ciclo_ativo, 'REPROVADO')}
                  >
                    REPROVAR
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default Vistoria;