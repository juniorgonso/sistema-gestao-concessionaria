import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonButton, IonText,
  IonTextarea, IonItem, IonLabel, IonIcon, IonModal, IonButtons
} from '@ionic/react';
import { cameraOutline, trashOutline, refreshOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { logout } from '../services/auth';

interface VeiculoQualidade {
  id: number;
  placa: string;
  marca_modelo: string;
  criado_em: string;
  status: string; 
  loja: string;
  observacoes?: string;
  status_qualidade?: string;
  [key: string]: any;
}

const Vistoria: React.FC = () => {
  const [veiculos, setVeiculos] = useState<VeiculoQualidade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erroApi, setErroApi] = useState<string>('');
  
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<VeiculoQualidade | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [notasVistoria, setNotasVistoria] = useState<string>('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [processando, setProcessando] = useState<boolean>(false);

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

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleSair = () => {
    logout();
    window.location.href = '/login'; 
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
      const url = 'http://127.0.0.1:8000/api/v1/veiculos/lista/';
      const response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const dados = await response.json();
        if (Array.isArray(dados)) {
          let filtrados = dados.filter(v => 
            v.status === 'QUALIDADE_POS' || v.status === 'QUALIDADE_FINAL'
          );
          
          filtrados.sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
          setVeiculos(filtrados);
        }
      } else {
        setErroApi("Erro do Servidor: " + response.status);
      }
    } catch (error) {
      setErroApi("Falha de Conexão com o Django.");
    } finally {
      setLoading(false);
    }
  };

  const formatarLoja = (codigo: string) => {
    if (codigo === 'GRAN_VIA') return 'Gran Via';
    if (codigo === 'EUROVIA') return 'Eurovia';
    if (codigo === 'PIEDADE') return 'Piedade';
    return codigo;
  };

  const abrirModalVistoria = (veiculo: VeiculoQualidade) => {
    setVeiculoSelecionado(veiculo);
    setNotasVistoria('');
    setFotos([]);
    setShowModal(true);
  };

  const capturarFoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Camera 
      });
      if (image.dataUrl) setFotos([image.dataUrl, ...fotos]); 
    } catch (error) {}
  };

  const removerFoto = (index: number) => {
    const novasFotos = [...fotos];
    novasFotos.splice(index, 1);
    setFotos(novasFotos);
  };

  const atualizarDjango = async (dadosPatch: any, mensagemSucesso: string) => {
    if (!veiculoSelecionado) return;
    setProcessando(true);
    try {
      const url = "http://127.0.0.1:8000/api/v1/veiculos/lista/" + veiculoSelecionado.id + "/";
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': "Bearer " + getTokenSeguro(), 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPatch)
      });

      if (response.ok) {
        alert(mensagemSucesso);
        setShowModal(false);
        carregarVeiculos(); 
      } else {
        const erro = await response.text();
        alert("Erro do Django: " + erro);
      }
    } catch (error) {
      alert("Falha de conexão.");
    } finally {
      setProcessando(false);
    }
  };

  const enviarParaLavagemDireto = () => {
    const obs = veiculoSelecionado?.observacoes;
    const historico = obs 
      ? obs + "\n\n[Qualidade Inicial]: Aprovado para Lavagem. " + notasVistoria
      : "[Qualidade Inicial]: Aprovado para Lavagem. " + notasVistoria;
    
    atualizarDjango({ status: 'LAVAGEM', observacoes: historico }, "Tudo OK! Veículo enviado para a Lavagem.");
  };

  const enviarPendenciaAdmin = () => {
    const obs = veiculoSelecionado?.observacoes;
    const historico = obs 
      ? obs + "\n\n[Pendência Qualidade]: " + notasVistoria
      : "[Pendência Qualidade]: " + notasVistoria;
    
    atualizarDjango({ status_qualidade: 'AGUARDANDO_ADMIN', observacoes: historico }, "Pendência reportada ao Administrativo!");
  };

  const simularAdminQualidade = () => {
    atualizarDjango({ status_qualidade: 'RESOLVIDO' }, "O Admin resolveu a pendência!");
  };

  const finalizarAposAdmin = () => {
    atualizarDjango({ status: 'LAVAGEM', status_qualidade: 'CONCLUIDO' }, "Pendência superada. Veículo enviado para Lavagem.");
  };

  const avaliarQualidadeFinal = (resultado: 'SHOWROOM' | 'LAVAGEM') => {
    const msg = resultado === 'SHOWROOM' ? 'Aprovado para venda.' : 'REPROVADO. Retrabalho na Lavagem.';
    const obs = veiculoSelecionado?.observacoes;
    const historico = obs 
      ? obs + "\n\n[Vistoria Final]: " + msg + " " + notasVistoria
      : "[Vistoria Final]: " + msg + " " + notasVistoria;
    
    const sucesso = resultado === 'SHOWROOM' 
      ? "Perfeito! Veículo pronto e enviado para o Showroom!"
      : "Reprovado! Veículo devolvido para a Lavagem.";

    atualizarDjango({ status: resultado, observacoes: historico }, sucesso);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Controle de Qualidade</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair} style={{ fontWeight: 'bold' }}>SAIR</IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0' }}>Fila Geral de Vistoria</h2>
          <IonButton fill="clear" size="small" color="dark" onClick={carregarVeiculos}>
            <IonIcon icon={refreshOutline} slot="icon-only" />
          </IonButton>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}><IonSpinner name="crescent" /><p>Buscando veículos...</p></div>
        ) : (
          <>
            {erroApi && <IonCard color="danger"><IonCardContent><strong>{erroApi}</strong></IonCardContent></IonCard>}

            {veiculos.length === 0 && !erroApi ? (
              <div style={{ textAlign: 'center', marginTop: '50px' }}><IonText color="medium"><p>Nenhum veículo aguardando vistoria no momento.</p></IonText></div>
            ) : (
              veiculos.map((v, idx) => {
                const isFinal = v.status === 'QUALIDADE_FINAL';
                const corFase = isFinal ? 'tertiary' : 'warning';
                const txtFase = isFinal ? 'VISTORIA FINAL' : 'CHECKLIST INICIAL';

                return (
                  <IonCard key={v.id || idx} style={{ borderLeft: '4px solid var(--ion-color-' + corFase + ')' }}>
                    <IonCardHeader>
                      <IonCardTitle>{v.marca_modelo}</IonCardTitle>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <IonBadge color="primary">{v.placa}</IonBadge>
                        <IonBadge color="medium">{formatarLoja(v.loja)}</IonBadge>
                        <IonBadge color={corFase}>{txtFase}</IonBadge>
                        {v.status_qualidade === 'AGUARDANDO_ADMIN' && <IonBadge color="danger">EM ANÁLISE (ADMIN)</IonBadge>}
                        {v.status_qualidade === 'RESOLVIDO' && <IonBadge color="success">LIBERADO PELO ADMIN</IonBadge>}
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      <p><strong>Entrada:</strong> {v.criado_em ? new Date(v.criado_em).toLocaleString('pt-BR') : 'Sem data'}</p>
                      <IonButton expand="block" color="light" style={{ marginTop: '15px', color: 'black', fontWeight: 'bold' }} onClick={() => abrirModalVistoria(v)}>
                        {isFinal ? 'INSPEÇÃO FINAL' : 'ABRIR PAINEL'}
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                );
              })
            )}
          </>
        )}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color={veiculoSelecionado?.status === 'QUALIDADE_FINAL' ? 'tertiary' : 'warning'}>
              <IonTitle>Painel de Inspeção</IonTitle>
              <IonButtons slot="end"><IonButton color="dark" onClick={() => setShowModal(false)} style={{ fontWeight: 'bold' }}>FECHAR</IonButton></IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {veiculoSelecionado && (
              <>
                <h3 className="ion-text-center" style={{ fontWeight: 'bold' }}>Placa: {veiculoSelecionado.placa}</h3>
                <p className="ion-text-center" style={{ color: '#666', marginTop: '-5px' }}>
                  {veiculoSelecionado.marca_modelo} - {formatarLoja(veiculoSelecionado.loja)}
                </p>

                {veiculoSelecionado.status === 'QUALIDADE_FINAL' ? (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <IonIcon icon={checkmarkCircleOutline} color="tertiary" style={{ fontSize: '60px' }} />
                    <h2 style={{ fontWeight: 'bold' }}>Inspeção Final</h2>
                    <p style={{ color: '#555' }}>Verifique se o veículo está impecável e pronto para o cliente.</p>
                    
                    <IonItem style={{ marginTop: '15px', textAlign: 'left' }}>
                      <IonLabel position="stacked">Motivo (Caso haja retrabalho na lavagem)</IonLabel>
                      <IonTextarea rows={3} placeholder="Ex: Vidro manchado, tapete sujo..." value={notasVistoria} onIonChange={e => setNotasVistoria(e.detail.value!)} />
                    </IonItem>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '40px' }}>
                      <IonButton expand="block" color="success" style={{ flex: 1, fontWeight: 'bold' }} onClick={() => avaliarQualidadeFinal('SHOWROOM')} disabled={processando}>
                        APROVAR (Showroom)
                      </IonButton>
                      <IonButton expand="block" color="danger" style={{ flex: 1, fontWeight: 'bold' }} onClick={() => avaliarQualidadeFinal('LAVAGEM')} disabled={processando}>
                        REPROVAR (Lavar)
                      </IonButton>
                    </div>
                  </div>
                ) : 
                
                veiculoSelecionado.status_qualidade === 'AGUARDANDO_ADMIN' ? (
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <IonIcon icon={timeOutline} color="medium" style={{ fontSize: '80px' }} />
                    <h2 style={{ fontWeight: 'bold' }}>Aguardando Administrativo</h2>
                    <p>Você reportou uma pendência. Aguarde a solução da gestão para libertar o veículo.</p>
                    <IonButton expand="block" fill="outline" color="tertiary" style={{ marginTop: '30px' }} onClick={simularAdminQualidade} disabled={processando}>
                      [DEV] Simular Solução do Admin
                    </IonButton>
                  </div>
                ) : 
                
                veiculoSelecionado.status_qualidade === 'RESOLVIDO' ? (
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '80px' }} />
                    <h2 style={{ color: 'var(--ion-color-success)', fontWeight: 'bold' }}>Pendência Resolvida!</h2>
                    <p>O Administrativo resolveu a situação. O veículo já pode seguir para a lavagem.</p>
                    <IonButton expand="block" color="success" style={{ marginTop: '40px', fontWeight: 'bold' }} onClick={finalizarAposAdmin} disabled={processando}>
                      Enviar para Lavagem
                    </IonButton>
                  </div>
                ) : 
                
                (
                  <>
                    <IonItem style={{ marginTop: '15px' }}>
                      <IonLabel position="stacked">Observações ou Pendências</IonLabel>
                      <IonTextarea rows={4} placeholder="Descreva falhas da oficina ou pendências..." value={notasVistoria} onIonChange={e => setNotasVistoria(e.detail.value!)} />
                    </IonItem>

                    <div style={{ marginTop: '25px', padding: '0 5px' }}>
                      <IonLabel style={{ fontWeight: 'bold', color: '#444' }}>Evidências Visuais (Fotos)</IonLabel>
                      <IonButton expand="block" fill="outline" color="warning" onClick={capturarFoto} style={{ marginTop: '10px' }}>
                        <IonIcon slot="start" icon={cameraOutline} /> Bater Foto da Falha
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

                    <div style={{ display: 'flex', gap: '10px', marginTop: '40px' }}>
                      <IonButton expand="block" color="success" style={{ flex: 1, fontWeight: 'bold' }} onClick={enviarParaLavagemDireto} disabled={processando}>
                        TUDO OK (Lavagem)
                      </IonButton>
                      <IonButton expand="block" color="danger" style={{ flex: 1, fontWeight: 'bold' }} onClick={enviarPendenciaAdmin} disabled={processando}>
                        <IonIcon slot="start" icon={alertCircleOutline} /> PENDÊNCIA (Admin)
                      </IonButton>
                    </div>
                  </>
                )}
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Vistoria;