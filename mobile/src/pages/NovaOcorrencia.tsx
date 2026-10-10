import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonInput, IonButton, IonItem, IonLabel, IonTextarea, 
  IonSelect, IonSelectOption, IonButtons, IonBackButton, useIonToast 
} from '@ionic/react';
import { criarOcorrencia } from '../services/ocorrencias';

const NovaOcorrencia: React.FC = () => {
  const navigate = useNavigate();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);

  const [veiculo, setVeiculo] = useState<number | ''>('');
  const [ciclo, setCiclo] = useState<number | ''>(1);
  const [origem, setOrigem] = useState<string>('OFICINA');
  const [descricao, setDescricao] = useState<string>('');

  const handleSalvar = async () => {
    if (!veiculo || !descricao) {
      present({ message: 'Preencha o veículo e a descrição.', duration: 2000, color: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await criarOcorrencia({
        veiculo: Number(veiculo),
        ciclo: Number(ciclo),
        origem,
        descricao,
        status: 'PENDENTE'
      });
      
      present({ message: 'Ocorrência registrada com sucesso!', duration: 2000, color: 'success' });
      // Volta para a Home e recarrega os dados
      navigate('/home', { replace: true });
    } catch (error) {
      present({ message: 'Erro ao salvar. Verifique os dados.', duration: 3000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Nova Ocorrência</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">ID do Veículo</IonLabel>
          <IonInput 
            type="number" 
            value={veiculo} 
            onIonChange={e => setVeiculo(e.detail.value ? Number(e.detail.value) : '')} 
          />
        </IonItem>
        
        <IonItem>
          <IonLabel position="floating">Ciclo</IonLabel>
          <IonInput 
            type="number" 
            value={ciclo} 
            onIonChange={e => setCiclo(e.detail.value ? Number(e.detail.value) : '')} 
          />
        </IonItem>

        <IonItem>
          <IonLabel>Origem</IonLabel>
          <IonSelect value={origem} onIonChange={e => setOrigem(e.detail.value)}>
            <IonSelectOption value="LAVAGEM">Lavagem</IonSelectOption>
            <IonSelectOption value="OFICINA">Oficina</IonSelectOption>
            <IonSelectOption value="PATIO">Pátio / Showroom</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Descrição do Serviço</IonLabel>
          <IonTextarea 
            rows={4} 
            value={descricao} 
            onIonChange={e => setDescricao(e.detail.value!)} 
          />
        </IonItem>

        <IonButton expand="block" className="ion-margin-top" onClick={handleSalvar} disabled={loading}>
          {loading ? 'Salvando...' : 'Registrar Ocorrência'}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default NovaOcorrencia;