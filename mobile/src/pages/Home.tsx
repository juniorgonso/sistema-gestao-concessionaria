import React, { useEffect, useState, useRef } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonText, IonButton, useIonRouter,
  IonFab, IonFabButton, IonIcon, IonToast
} from '@ionic/react';
import { add, camera } from 'ionicons/icons';
import { listarOcorrencias, Ocorrencia, atualizarStatus } from '../services/ocorrencias';
import { enviarFotoEvidencia } from '../services/evidencias'; // IMPORTÁMOS O NOSSO CAMIÃO
import { logout } from '../services/auth';

const Home: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<boolean>(false);
  const router = useIonRouter();

  // Referência invisível para abrir a câmara
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cicloAlvo, setCicloAlvo] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSair = () => {
    logout();
    router.push('/login', 'forward', 'replace');
  };

  const carregarDados = async () => {
    try {
      const dados = await listarOcorrencias();
      setOcorrencias(dados);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        handleSair();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConcluir = async (id: number) => {
    try {
      await atualizarStatus(id, 'CONCLUIDO');
      carregarDados();
    } catch (error: any) {
      if (error.response && error.response.status === 401) handleSair();
    }
  };

  // 📸 PASSO 1: O utilizador clica no botão e nós "enganamos" o navegador para clicar no input invisível
  const abrirCamera = (ciclo: number) => {
    setCicloAlvo(ciclo);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 📸 PASSO 2: O utilizador tira a foto e este código dispara automaticamente
  const handleUploadFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !cicloAlvo) return;

    setUploading(true);
    try {
      await enviarFotoEvidencia(cicloAlvo, file, "Evidência capturada via aplicação mobile.");
      setMensagemSucesso(true); // Mostra o aviso verde de sucesso!
    } catch (error) {
      alert("Falha ao enviar a foto. Verifique a ligação.");
    } finally {
      setUploading(false);
      setCicloAlvo(null);
      event.target.value = ''; // Limpa a câmara para a próxima foto
    }
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
        
        {/* O INPUT INVISÍVEL QUE ABRE A CÂMARA */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleUploadFoto} 
        />

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
            <p>A carregar dados...</p>
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
                <p style={{ fontSize: '0.8rem', margin: '10px 0', color: 'gray' }}>
                  Ciclo: {ocorrencia.ciclo} | Registo: {new Date(ocorrencia.criado_em).toLocaleDateString('pt-PT')}
                </p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  {ocorrencia.status === 'PENDENTE' && (
                    <IonButton fill="outline" size="small" color="success" onClick={() => handleConcluir(ocorrencia.id)}>
                      Concluir
                    </IonButton>
                  )}
                  
                  {/* O BOTÃO QUE CHAMA A CÂMARA */}
                  <IonButton 
                    fill="solid" 
                    size="small" 
                    color="secondary" 
                    onClick={() => abrirCamera(ocorrencia.ciclo)}
                    disabled={uploading && cicloAlvo === ocorrencia.ciclo}
                  >
                    <IonIcon icon={camera} slot="start" />
                    {(uploading && cicloAlvo === ocorrencia.ciclo) ? 'A Enviar...' : 'Tirar Foto'}
                  </IonButton>
                </div>

              </IonCardContent>
            </IonCard>
          ))
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => router.push('/nova-ocorrencia', 'forward')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Notificação de Sucesso */}
        <IonToast
          isOpen={mensagemSucesso}
          onDidDismiss={() => setMensagemSucesso(false)}
          message="📸 Evidência guardada no cofre com sucesso!"
          duration={2500}
          color="success"
          position="top"
        />
        
      </IonContent>
    </IonPage>
  );
};

export default Home;