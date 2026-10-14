import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonText, IonButton, useIonRouter,
  IonFab, IonFabButton, IonIcon
} from '@ionic/react';
import { add, carSportOutline, refreshOutline } from 'ionicons/icons';
import { logout } from '../services/auth';

const Home: React.FC = () => {
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erroApi, setErroApi] = useState<string>('');
  const router = useIonRouter();

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleSair = () => {
    logout();
    window.location.href = '/login'; 
  };

  const getTokenSeguro = () => {
    let t = localStorage.getItem('token') || localStorage.getItem('access');
    if (!t) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.toLowerCase().includes('token') || key.toLowerCase().includes('access'))) {
          t = localStorage.getItem(key);
          break;
        }
      }
    }
    return t;
  };

  const carregarVeiculos = async () => {
    setLoading(true);
    setErroApi('');
    const token = getTokenSeguro();

    if (!token) {
      setErroApi("Sessão expirada. Faça Login novamente.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/veiculos/lista/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const dados = await response.json();
        if (Array.isArray(dados)) {
          // Ordena dos mais recentes para os mais antigos
          dados.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
          
          // Mostra os últimos 15 veículos registrados
          const historicoRecentes = dados.slice(0, 15); 
          setVeiculos(historicoRecentes);
        }
      } else {
        setErroApi('Erro ao comunicar com o servidor: ' + response.status);
      }
    } catch (error) {
      setErroApi('Falha de conexão com o banco de dados Django.');
    } finally {
      setLoading(false);
    }
  };

  // Funções para formatar os dados e deixar o visual profissional
  const formatarLoja = (codigo: string) => {
    if (!codigo) return 'Loja Não Informada';
    if (codigo === 'GRAN_VIA') return 'Gran Via';
    if (codigo === 'EUROVIA') return 'Eurovia';
    if (codigo === 'PIEDADE') return 'Piedade';
    return codigo;
  };

  const formatarStatus = (status: string) => {
    const mapa: { [key: string]: string } = {
      'AGUARDANDO_APROVACAO': 'Aguardando Admin',
      'APROVADO': 'Aprovado (Oficina)',
      'OFICINA': 'Em Manutenção',
      'QUALIDADE_POS': 'Vistoria Inicial',
      'LAVAGEM': 'Setor de Lavagem',
      'QUALIDADE_FINAL': 'Vistoria Final',
      'SHOWROOM': 'No Showroom'
    };
    return mapa[status] || (status ? status : 'Em Processo');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Painel do Avaliador</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair} style={{ fontWeight: 'bold' }}>
            SAIR
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0' }}>Histórico de Entradas</h2>
          <IonButton fill="clear" size="small" color="dark" onClick={carregarVeiculos}>
            <IonIcon icon={refreshOutline} slot="icon-only" />
          </IonButton>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
            <p>A carregar veículos...</p>
          </div>
        ) : erroApi ? (
          <IonCard color="danger">
            <IonCardContent><strong>{erroApi}</strong></IonCardContent>
          </IonCard>
        ) : veiculos.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <IonIcon icon={carSportOutline} style={{ fontSize: '60px', color: '#ccc' }} />
            <IonText color="medium">
              <p>Nenhum veículo registrado recentemente.</p>
              <p style={{ fontSize: '0.9rem' }}>Clique no botão <strong>+</strong> para dar entrada num novo carro.</p>
            </IonText>
          </div>
        ) : (
          veiculos.map((v, index) => (
            <IonCard key={v.id || index} style={{ borderLeft: '4px solid var(--ion-color-medium)' }}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1.1rem' }}>
                  {v.marca_modelo || 'Veículo Não Identificado'}
                </IonCardTitle>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <IonBadge color="primary">{v.placa || 'SEM PLACA'}</IonBadge>
                  <IonBadge color="medium">{formatarLoja(v.loja)}</IonBadge>
                </div>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Setor Atual:</strong> <IonText color="secondary">{formatarStatus(v.status)}</IonText>
                  </p> 
                  <p style={{ margin: 0, color: '#555' }}>
                    <strong>Entrada:</strong> {v.criado_em ? new Date(v.criado_em).toLocaleString('pt-BR') : 'Data não registrada'}
                  </p>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" onClick={() => router.push('/nova-ocorrencia', 'forward')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        
      </IonContent>
    </IonPage>
  );
};

export default Home;