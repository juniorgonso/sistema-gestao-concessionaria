import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonBadge, IonSpinner, IonButton, IonText, IonIcon,
  IonAlert, useIonRouter
} from '@ionic/react';
import { waterOutline, refreshOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';
import { logout } from '../services/auth';

interface VeiculoLavagem {
  id: number;
  placa: string;
  marca_modelo: string;
  criado_em: string;
  status: string; 
  loja: string;
  observacoes?: string;
  [key: string]: any;
}

// 🔥 EXTRATOR RESTRITO: Só lê a Qualidade, ignora o Avaliador completamente
const extrairMensagemLavador = (obs: string | undefined) => {
  if (!obs || typeof obs !== 'string') return null;
  
  // Procura estritamente pelas assinaturas da tela de Vistoria (Qualidade)
  const indexFinal = obs.lastIndexOf('[Vistoria Final]');
  const indexInicial = obs.lastIndexOf('[Qualidade Inicial]');
  
  const corte = Math.max(indexFinal, indexInicial);
  
  // Se a Qualidade NÃO interagiu com texto (ou seja, não tem as tags no histórico),
  // nós devolvemos null. Isso impede que o texto do Avaliador inicial apareça aqui.
  if (corte === -1) return null;
  
  // Pega apenas o trecho do diário de onde a Qualidade assinou para a frente
  let textoQualidade = obs.substring(corte);
  
  const isReprovado = textoQualidade.includes('REPROVADO') || textoQualidade.includes('Retrabalho');
  
  // Limpeza cirúrgica das palavras robóticas do sistema
  let textoLimpo = textoQualidade
    .replace(/\[Vistoria Final\]/gi, '')
    .replace(/\[Qualidade Inicial\]/gi, '')
    .replace(/REPROVADO\.\s*Retrabalho na Lavagem\.?/gi, '')
    .replace(/Aprovado para Lavagem\.?/gi, '')
    .replace(/^[:\-\s]+/g, '') // Limpa dois-pontos ou traços soltos no começo
    .trim();
    
  // Se depois de limpar as marcações do robô não sobrar texto humano, oculta a caixa
  if (!textoLimpo || textoLimpo === '') return null;
  
  return {
    tipo: isReprovado ? 'reprovado' : 'observacao',
    texto: textoLimpo
  };
};

const Lavagem: React.FC = () => {
  const router = useIonRouter();
  const [veiculos, setVeiculos] = useState<VeiculoLavagem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erroApi, setErroApi] = useState<string>('');
  
  const [veiculoConfirmacao, setVeiculoConfirmacao] = useState<VeiculoLavagem | null>(null);
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
        headers: { 'Authorization': "Bearer " + token, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const dados = await response.json();
        
        if (Array.isArray(dados)) {
          let veiculosFiltrados = dados.filter(v => v.status === 'LAVAGEM');
          veiculosFiltrados.sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
          setVeiculos(veiculosFiltrados);
        }
      } else {
        setErroApi("Erro do Servidor: " + response.status);
      }
    } catch (error) {
      setErroApi("Falha de Conexão com o Servidor.");
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

  const finalizarLavagem = async () => {
    if (!veiculoConfirmacao) return;
    setProcessando(true);
    const token = getTokenSeguro();

    const obsAtual = veiculoConfirmacao.observacoes;
    const historico = obsAtual 
      ? obsAtual + "\n\n[Lavagem]: Serviço concluído. Pronto para Vistoria Final." 
      : "[Lavagem]: Serviço concluído. Pronto para Vistoria Final.";

    try {
      const url = "http://127.0.0.1:8000/api/v1/veiculos/lista/" + veiculoConfirmacao.id + "/";
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': "Bearer " + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'QUALIDADE_FINAL',
          observacoes: historico
        })
      });

      if (response.ok) {
        alert("Lavagem Concluída! O veículo foi enviado para a Vistoria Final.");
        setVeiculoConfirmacao(null);
        carregarVeiculos(); 
      } else {
        alert("Erro no envio ao servidor.");
      }
    } catch (error) {
      alert("Falha de conexão.");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Setor de Lavagem</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleSair} style={{ fontWeight: 'bold' }}>
            SAIR
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0' }}>Fila Geral de Lavagem</h2>
          <IonButton fill="clear" size="small" color="dark" onClick={carregarVeiculos}>
            <IonIcon icon={refreshOutline} slot="icon-only" />
          </IonButton>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
            <p>Buscando fila de lavagem...</p>
          </div>
        ) : (
          <>
            {erroApi && <IonCard color="danger"><IonCardContent><strong>{erroApi}</strong></IonCardContent></IonCard>}

            {veiculos.length === 0 && !erroApi ? (
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <IonIcon icon={waterOutline} style={{ fontSize: '60px', color: '#666' }} />
                <IonText color="medium">
                  <p>A fila de lavagem está vazia no momento.</p>
                </IonText>
              </div>
            ) : (
              veiculos.map((v, idx) => {
                const infoLavador = extrairMensagemLavador(v.observacoes);

                return (
                  <IonCard key={v.id || idx} style={{ borderLeft: '4px solid #3880ff' }}>
                    <IonCardHeader>
                      <IonCardTitle>{v.marca_modelo}</IonCardTitle>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <IonBadge color="primary">{v.placa}</IonBadge>
                        <IonBadge color="medium">{formatarLoja(v.loja)}</IonBadge> 
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#555' }}>
                        <IonIcon icon={timeOutline} style={{ fontSize: '1.2rem' }} />
                        <span style={{ fontSize: '0.9rem' }}>
                          <strong>Entrada:</strong> {v.criado_em ? new Date(v.criado_em).toLocaleString('pt-BR') : 'Sem data'}
                        </span>
                      </div>

                      {/* CAIXA DE MENSAGEM DO INSPETOR DE QUALIDADE (E SÓ DELE) */}
                      {infoLavador && (
                        <div style={{ 
                          backgroundColor: infoLavador.tipo === 'reprovado' ? '#f8d7da' : '#fff3cd', 
                          padding: '10px', 
                          borderRadius: '6px', 
                          marginBottom: '15px', 
                          borderLeft: '4px solid ' + (infoLavador.tipo === 'reprovado' ? '#dc3545' : '#ffc107') 
                        }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: infoLavador.tipo === 'reprovado' ? '#721c24' : '#856404' }}>
                            <strong><IonIcon icon={alertCircleOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> 
                            {infoLavador.tipo === 'reprovado' ? 'Motivo do Retrabalho:' : 'Observação Extra (Qualidade):'}
                            </strong><br/>
                            <span style={{ display: 'inline-block', marginTop: '5px' }}>{infoLavador.texto}</span>
                          </p>
                        </div>
                      )}
                      
                      {idx === 0 && veiculos.length > 1 && (
                        <div style={{ marginBottom: '10px' }}>
                          <IonBadge color="danger">MÁXIMA PRIORIDADE (Mais antigo)</IonBadge>
                        </div>
                      )}

                      <IonButton 
                        expand="block" 
                        color="light" 
                        style={{ marginTop: '15px', color: 'black', fontWeight: 'bold' }}
                        onClick={() => setVeiculoConfirmacao(v)}
                      >
                        CONCLUIR LAVAGEM
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                );
              })
            )}
          </>
        )}

        <IonAlert
          isOpen={!!veiculoConfirmacao}
          onDidDismiss={() => setVeiculoConfirmacao(null)}
          header="Finalizar Lavagem?"
          message={veiculoConfirmacao ? "Confirmar que a lavagem do " + veiculoConfirmacao.marca_modelo + " está concluída?" : ""}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setVeiculoConfirmacao(null)
            },
            {
              text: processando ? 'A enviar...' : 'Sim, Concluir',
              handler: () => finalizarLavagem()
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Lavagem;