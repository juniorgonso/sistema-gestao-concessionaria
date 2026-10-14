import React, { useState, useEffect } from 'react';

import { 

  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 

  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 

  IonBadge, IonButton, IonItem, IonLabel, IonTextarea, 

  IonModal, IonButtons, IonSpinner, IonText, IonIcon

} from '@ionic/react';

import { cameraOutline, trashOutline, checkmarkCircleOutline, refreshOutline, timeOutline, documentTextOutline } from 'ionicons/icons';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { logout } from '../services/auth';
import api from '../services/api';
import axios from 'axios';



interface VeiculoOficina {

  id: number;

  placa: string;

  marca_modelo: string;

  criado_em: string;

  status: string; 

  loja: string;

  status_oficina?: string;

  observacoes?: string;

  [key: string]: any;

}



const Oficina: React.FC = () => {


  const [veiculos, setVeiculos] = useState<VeiculoOficina[]>([]);

  const [loading, setLoading] = useState(true);

  const [minhaLoja, setMinhaLoja] = useState<string>('NÃO IDENTIFICADA'); 

  const [erroApi, setErroApi] = useState<string>(''); 



  const [veiculoSelecionado, setVeiculoSelecionado] = useState<VeiculoOficina | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [notasOrcamento, setNotasOrcamento] = useState(''); 

  const [fotos, setFotos] = useState<string[]>([]);

  const [processando, setProcessando] = useState(false);



  useEffect(() => {

    carregarDadosReais();

  }, []);



  const handleSair = () => {

    logout();

    window.location.href = '/login'; 

  };



  const carregarDadosReais = async () => {
    setLoading(true);
    setErroApi('');

    try {
      // Identidade e filtragem vêm do Django, não do ID contido no JWT.
      const response = await api.get<{
        unidade: { id: number; nome: string; codigo_loja: string };
        veiculos: VeiculoOficina[];
      }>('/veiculos/minha-oficina/');

      setMinhaLoja(response.data.unidade.nome);
      setVeiculos(response.data.veiculos);
    } catch (error) {
      setMinhaLoja('NÃO IDENTIFICADA');
      setVeiculos([]);
      if (axios.isAxiosError(error)) {
        const detalhe = error.response?.data?.detail || error.message;
        setErroApi(`Não foi possível carregar a oficina: ${detalhe}`);
      } else {
        setErroApi('Falha ao carregar dados da oficina.');
      }
    } finally {
      setLoading(false);
    }
  };


  const abrirPainel = (veiculo: VeiculoOficina) => {

    setVeiculoSelecionado(veiculo);

    setNotasOrcamento(''); 

    setFotos([]);

    setShowModal(true);

  };



  const capturarFoto = async () => {

    try {

      const image = await Camera.getPhoto({

        quality: 80, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Camera 

      });

      if (image.dataUrl) setFotos([image.dataUrl, ...fotos]); 

    } catch (error) { console.log("Câmera cancelada."); }

  };



  const removerFoto = (index: number) => {

    const novasFotos = [...fotos];

    novasFotos.splice(index, 1);

    setFotos(novasFotos);

  };



  const enviarOrcamento = async () => {
    if (!veiculoSelecionado) return;
    setProcessando(true);

    try {
      await api.patch(`/veiculos/lista/${veiculoSelecionado.id}/`, {
        status_oficina: 'AGUARDANDO_APROVACAO',
        observacoes: veiculoSelecionado.observacoes
          ? `${veiculoSelecionado.observacoes}\n\n[Orçamento]: ${notasOrcamento}`
          : `[Orçamento]: ${notasOrcamento}`,
      });
      alert('✅ Orçamento enviado ao Administrativo! Aguarde a aprovação.');
      setShowModal(false);
      await carregarDadosReais();
    } catch (error) {
      const detalhe = axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data || error.message)
        : 'Erro inesperado';
      alert(`❌ Não foi possível enviar o orçamento: ${detalhe}`);
    } finally {
      setProcessando(false);
    }
  };


  const simularAprovacaoAdmin = async () => {
    if (!veiculoSelecionado) return;
    setProcessando(true);
    try {
      // Funcionalidade de desenvolvimento herdada do arquivo original.
      // Remover para produção após implementar aprovação administrativa real.
      await api.patch(`/veiculos/lista/${veiculoSelecionado.id}/`, {
        status_oficina: 'APROVADO',
      });
      alert('🎉 (TESTE) Orçamento aprovado pelo Admin!');
      setShowModal(false);
      await carregarDadosReais();
    } catch (error) {
      alert('❌ Não foi possível simular a aprovação.');
    } finally {
      setProcessando(false);
    }
  };


  const finalizarServico = async () => {
    if (!veiculoSelecionado) return;
    setProcessando(true);
    try {
      await api.patch(`/veiculos/lista/${veiculoSelecionado.id}/`, {
        status: 'QUALIDADE_POS',
        status_oficina: 'CONCLUIDO',
      });
      alert('🚀 Serviço Concluído! Veículo enviado à Vistoria de Qualidade.');
      setShowModal(false);
      await carregarDadosReais();
    } catch (error) {
      const detalhe = axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data || error.message)
        : 'Erro inesperado';
      alert(`❌ Não foi possível concluir: ${detalhe}`);
    } finally {
      setProcessando(false);
    }
  };


  return (

    <IonPage>

      <IonHeader>

        <IonToolbar color="dark">

          <IonTitle>⚙️ Oficina - {minhaLoja}</IonTitle>

          <IonButton slot="end" fill="clear" color="light" onClick={handleSair}>Sair</IonButton>

        </IonToolbar>

      </IonHeader>



      <IonContent className="ion-padding">



        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>

          <h2 style={{ fontSize: '1.2rem', margin: '0' }}>Quadro de Serviços</h2>

          <IonButton fill="clear" size="small" color="dark" onClick={carregarDadosReais}>

            <IonIcon icon={refreshOutline} slot="icon-only" />

          </IonButton>

        </div>



        {loading ? (

          <div style={{ textAlign: 'center', marginTop: '50px' }}>

            <IonSpinner name="crescent" />

            <p>Buscando veículos...</p>

          </div>

        ) : (

          <>

            {erroApi && <IonCard color="danger"><IonCardContent><strong>{erroApi}</strong></IonCardContent></IonCard>}



            {veiculos.length === 0 && !erroApi ? (

              <div style={{ textAlign: 'center', marginTop: '50px' }}>

                <IonText color="medium"><p>Nenhum veículo na oficina da {minhaLoja}.</p></IonText>

              </div>

            ) : (

              veiculos.map((v, idx) => {

                let badgeCor = 'warning';

                let badgeTexto = 'INICIAR ORÇAMENTO';

                if (v.status_oficina === 'AGUARDANDO_APROVACAO') { badgeCor = 'medium'; badgeTexto = 'EM ANÁLISE (ADMIN)'; }

                if (v.status_oficina === 'APROVADO') { badgeCor = 'success'; badgeTexto = 'SERVIÇO AUTORIZADO'; }



                return (

                  <IonCard key={v.id || idx} style={{ borderLeft: `4px solid var(--ion-color-${badgeCor})` }}>

                    <IonCardHeader>

                      <IonCardTitle>{v.marca_modelo || 'Veículo Sem Modelo'}</IonCardTitle>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>

                        <IonBadge color="primary">{v.placa || 'SEM PLACA'}</IonBadge>

                        <IonBadge color={badgeCor}>{badgeTexto}</IonBadge>

                      </div>

                    </IonCardHeader>

                    <IonCardContent>

                      <p><strong>Entrada:</strong> {v.criado_em ? new Date(v.criado_em).toLocaleString('pt-PT') : 'Sem data'}</p>

                      <IonButton expand="block" color={badgeCor === 'warning' ? 'dark' : badgeCor} style={{ marginTop: '15px' }} onClick={() => abrirPainel(v)}>

                        {v.status_oficina === 'APROVADO' ? 'Executar Serviço' : 'Abrir Painel'}

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

            <IonToolbar color="dark">

              <IonTitle>Painel do Veículo</IonTitle>

              <IonButtons slot="end"><IonButton onClick={() => setShowModal(false)}>Fechar</IonButton></IonButtons>

            </IonToolbar>

          </IonHeader>

          <IonContent className="ion-padding">

            {veiculoSelecionado && (

              <>

                <h3 className="ion-text-center">Placa: {veiculoSelecionado.placa}</h3>

                <p className="ion-text-center" style={{ color: '#666', marginTop: '-5px' }}>{veiculoSelecionado.marca_modelo}</p>



                {veiculoSelecionado.status_oficina === 'AGUARDANDO_APROVACAO' ? (

                  <div style={{ textAlign: 'center', marginTop: '40px' }}>

                    <IonIcon icon={timeOutline} color="medium" style={{ fontSize: '80px' }} />

                    <h2>Orçamento em Análise</h2>

                    <p>O Administrativo está a avaliar os custos. Aguarde a autorização para iniciar o reparo.</p>



                    <IonButton expand="block" fill="outline" color="tertiary" style={{ marginTop: '30px' }} onClick={simularAprovacaoAdmin} disabled={processando}>

                      [DEV] Simular Aprovação do Admin

                    </IonButton>

                  </div>

                ) : 



                veiculoSelecionado.status_oficina === 'APROVADO' ? (

                  <div style={{ textAlign: 'center', marginTop: '40px' }}>

                    <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '80px' }} />

                    <h2 style={{ color: 'var(--ion-color-success)' }}>Serviço Autorizado!</h2>

                    <p>O orçamento foi aprovado. Realize os reparos necessários no veículo.</p>

                    <IonButton expand="block" color="success" style={{ marginTop: '40px' }} onClick={finalizarServico} disabled={processando}>

                      {processando ? 'A Processar...' : 'Concluir e Enviar para Qualidade'}

                    </IonButton>

                  </div>

                ) : 



                (

                  <>

                    <IonItem style={{ marginTop: '15px' }}>

                      <IonLabel position="stacked">Detalhes do Orçamento (Peças e Serviços)</IonLabel>

                      <IonTextarea 

                        rows={5} 

                        placeholder="Ex: Troca de óleo, pastilhas de freio..." 

                        value={notasOrcamento} 

                        onIonChange={e => setNotasOrcamento(e.detail.value!)} 

                      />

                    </IonItem>



                    <div style={{ marginTop: '25px', padding: '0 5px' }}>

                      <IonLabel style={{ fontWeight: 'bold', color: '#444' }}>Fotos do Problema</IonLabel>

                      <IonButton expand="block" fill="outline" color="medium" onClick={capturarFoto} style={{ marginTop: '10px' }}>

                        <IonIcon slot="start" icon={cameraOutline} /> Bater Foto

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



                    <IonButton expand="block" color="warning" style={{ marginTop: '40px' }} onClick={enviarOrcamento} disabled={processando}>

                      <IonIcon slot="start" icon={documentTextOutline} />

                      {processando ? 'A Enviar...' : 'Enviar Orçamento ao Admin'}

                    </IonButton>

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



export default Oficina;