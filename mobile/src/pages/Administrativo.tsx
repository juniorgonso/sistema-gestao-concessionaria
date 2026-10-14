import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, useIonRouter } from '@ionic/react';
import api from '../services/api';
import { logout } from '../services/auth';

const Administrativo: React.FC = () => {
  const [servicos, setServicos] = useState<any[]>([]);
  const router = useIonRouter();

  useEffect(() => { carregarPendentes(); }, []);

  const handleSair = () => { logout(); window.location.href = '/login'; };

  const carregarPendentes = async () => {
    try {
      const response = await api.get('/ordens/servicos/'); // Na V2 real, filtar por status 'CRIADO'
      setServicos(response.data);
    } catch { /* erro invisível para já */ }
  };

  const autorizar = async (servicoId: number) => {
    try {
      await api.post('/ordens/autorizacoes/', { servico: servicoId, status: 'APROVADA' });
      alert('Orçamento APROVADO!');
      carregarPendentes();
    } catch {
      alert('Acesso Negado. Você não é Diretor.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle>💼 Diretoria (Aprovações)</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair}>Sair</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {servicos.map(s => (
          <IonCard key={s.id}>
            <IonCardContent>
              <p><strong>Serviço #{s.id}:</strong> {s.descricao}</p>
              <IonButton expand="block" color="primary" onClick={() => autorizar(s.id)}>Aprovar Orçamento</IonButton>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};
export default Administrativo;