import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonInput, IonButton, IonItem, IonLabel, IonToggle, useIonRouter } from '@ionic/react';
import api from '../services/api';
import { logout } from '../services/auth';

const Oficina: React.FC = () => {
  const [veiculoId, setVeiculoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precisaAutorizacao, setPrecisaAutorizacao] = useState(true);
  const router = useIonRouter();

  const handleSair = () => {
    logout();
    router.push('/login', 'forward', 'replace');
  };

  const criarServico = async () => {
    if (!veiculoId || !descricao) return alert('Preencha veículo e descrição.');
    try {
      await api.post('/ordens/servicos/', {
        veiculo: parseInt(veiculoId),
        descricao: descricao,
        precisa_autorizacao: precisaAutorizacao
      });
      alert('Orçamento/Serviço enviado para aprovação!');
      setDescricao('');
      setVeiculoId('');
    } catch (error) {
      alert('Erro ao criar serviço. É mecânico?');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>⚙️ Oficina Mecânica</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair}>Sair</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">ID do Veículo (Ciclo)</IonLabel>
              <IonInput type="number" value={veiculoId} onIonChange={e => setVeiculoId(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">O que precisa ser feito?</IonLabel>
              <IonInput value={descricao} onIonChange={e => setDescricao(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel>Exige aprovação do Diretor?</IonLabel>
              <IonToggle checked={precisaAutorizacao} onIonChange={e => setPrecisaAutorizacao(e.detail.checked)} />
            </IonItem>
            <IonButton expand="block" style={{ marginTop: '20px' }} onClick={criarServico}>
              Criar Orçamento de Serviço
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
export default Oficina;