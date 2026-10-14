import React, { useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardContent, IonButton, IonItem, IonLabel, 
  IonInput, IonTextarea, IonIcon, IonSelect, IonSelectOption,
  IonButtons, useIonRouter
} from '@ionic/react';
import { cameraOutline, trashOutline, carSportOutline, arrowBackOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { logout } from '../services/auth';

const NovaOcorrencia: React.FC = () => {
  const router = useIonRouter();
  
  const [placa, setPlaca] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('');
  const [loja, setLoja] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const capturarFoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Camera 
      });
      if (image.dataUrl) setFotos([image.dataUrl, ...fotos]); 
    } catch (error) { console.log("Câmera cancelada"); }
  };

  const removerFoto = (index: number) => {
    const novasFotos = [...fotos];
    novasFotos.splice(index, 1);
    setFotos(novasFotos);
  };

  const registrarEntradaVeiculo = async () => {
    if (!placa || !marcaModelo || !loja) {
      alert("⚠️ Preencha a Placa, o Modelo e a Loja antes de registrar!");
      return;
    }

    setLoading(true);
    let token = localStorage.getItem('token') || localStorage.getItem('access');
    
    if (!token) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.toLowerCase().includes('token') || key.toLowerCase().includes('access'))) {
          token = localStorage.getItem(key);
          break;
        }
      }
    }

    try {
      const url = 'http://127.0.0.1:8000/api/v1/veiculos/lista/'; 
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          placa: placa,
          marca_modelo: marcaModelo,
          loja: loja, // Agora envia 'EUROVIA', 'GRAN_VIA' ou 'PIEDADE'
          observacoes: observacoes
        })
      });

      if (response.ok || response.status === 201) {
        alert(`✅ Veículo ${marcaModelo} (${placa}) registrado com sucesso! Foi enviado direto para a Oficina.`);
        window.location.href = '/home'; 
      } else {
        const erroDjango = await response.text();
        alert(`❌ Erro do Servidor: ${erroDjango}`);
      }
    } catch (error) {
      alert("❌ Falha de conexão com o banco de dados. O Django está a rodar?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary"> 
          <IonButtons slot="start">
            <IonButton onClick={() => router.push('/home', 'back')}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Nova Entrada de Veículo</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        
        <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
          <h2>Painel do Avaliador</h2>
          <p style={{ color: '#666' }}>Cadastre um novo veículo para iniciar o fluxo no sistema.</p>
        </div>

        <IonCard>
          <IonCardContent>
            
            <IonItem>
              <IonLabel position="stacked">Placa do Veículo *</IonLabel>
              <IonInput 
                placeholder="Ex: ABC-1234" 
                value={placa} 
                onIonChange={e => setPlaca(e.detail.value!.toUpperCase())} 
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Marca e Modelo *</IonLabel>
              <IonInput 
                placeholder="Ex: Honda Civic 2024" 
                value={marcaModelo} 
                onIonChange={e => setMarcaModelo(e.detail.value!)} 
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Loja de Entrada *</IonLabel>
              <IonSelect 
                placeholder="Selecione a Concessionária" 
                value={loja} 
                onIonChange={e => setLoja(e.detail.value)}
              >
                {/* 🔥 AQUI ESTÁ A CORREÇÃO: Os values agora batem com o LOJAS_CHOICES do Django */}
                <IonSelectOption value="PIEDADE">Piedade</IonSelectOption>
                <IonSelectOption value="GRAN_VIA">Gran Via</IonSelectOption>
                <IonSelectOption value="EUROVIA">Eurovia</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem style={{ marginTop: '15px' }}>
              <IonLabel position="stacked">Observações Iniciais</IonLabel>
              <IonTextarea 
                rows={4}
                placeholder="Estado geral do veículo, arranhões pré-existentes..."
                value={observacoes}
                onIonChange={(e) => setObservacoes(e.detail.value!)}
              />
            </IonItem>

            <div style={{ marginTop: '25px', padding: '0 5px' }}>
              <IonLabel style={{ fontWeight: 'bold', color: '#444' }}>Fotos do Veículo na Entrada</IonLabel>
              <IonButton expand="block" fill="outline" onClick={capturarFoto} style={{ marginTop: '10px' }}>
                <IonIcon slot="start" icon={cameraOutline} />
                Capturar Imagem
              </IonButton>
              
              {fotos.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '15px', paddingBottom: '10px' }}>
                  {fotos.map((foto, index) => (
                    <div key={index} style={{ position: 'relative', minWidth: '100px' }}>
                      <img src={foto} alt={`Foto ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                      <IonButton color="danger" size="small" style={{ position: 'absolute', top: '-15px', right: '-15px' }} onClick={() => removerFoto(index)}>
                        <IonIcon icon={trashOutline} />
                      </IonButton>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <IonButton expand="block" color="primary" style={{ marginTop: '30px' }} onClick={registrarEntradaVeiculo} disabled={loading}>
              <IonIcon slot="start" icon={carSportOutline} />
              {loading ? 'Registrando...' : 'Registrar Veículo'}
            </IonButton>

          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default NovaOcorrencia;