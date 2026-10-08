import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Car, ClipboardList, Clock, AlertTriangle, X, Camera, Check, Ban, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Dados do Gráfico
const DADOS_PRODUTIVIDADE = [
  { dia: 'Seg', Oficina: 4, Lavagem: 12 },
  { dia: 'Ter', Oficina: 6, Lavagem: 15 },
  { dia: 'Qua', Oficina: 5, Lavagem: 10 },
  { dia: 'Qui', Oficina: 8, Lavagem: 18 },
  { dia: 'Sex', Oficina: 7, Lavagem: 14 },
  { dia: 'Sáb', Oficina: 9, Lavagem: 22 },
];

// Dados dos Veículos com Vistoria Detalhada (Avarias)
const VEICULOS_MOCK = [
  { 
    id: '1', placa: 'ABC-1234', modelo: 'Honda Civic', origem: 'Cliente (Garantia)', setor: 'Oficina', 
    status: 'AGUARDANDO APROVAÇÃO', prioridade: 'ALTA', responsavel: 'Carlos (Qualidade)', 
    observacao: 'Veículo com múltiplas avarias reportadas na triagem.',
    dataEntrada: '2026-09-28T08:00:00',
    avarias: [
      { id: 'a1', descricao: 'Para-brisa trincado por pedra', foto: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=600', statusAutorizacao: 'PENDENTE' },
      { id: 'a2', descricao: 'Arranhão profundo na porta direita', foto: 'https://images.unsplash.com/photo-1621255502931-31a89c362cb2?auto=format&fit=crop&q=80&w=600', statusAutorizacao: 'PENDENTE' }
    ]
  },
  { 
    id: '2', placa: 'DEF-5678', modelo: 'VW Nivus', origem: 'Showroom', setor: 'Qualidade', 
    status: 'AGUARDANDO RECEBIMENTO', prioridade: 'NORMAL', responsavel: 'Recepção',
    observacao: 'Faturado. Iniciar preparação.',
    dataEntrada: null,
    avarias: []
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<any[]>(VEICULOS_MOCK);
  const [veiculoAberto, setVeiculoAberto] = useState<any>(null);
  const [fotoZoom, setFotoZoom] = useState<string | null>(null);

  const calcularDias = (dataString: string | null) => {
    if (!dataString) return null;
    const diff = Math.abs(new Date().getTime() - new Date(dataString).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const receberVeiculo = (id: string) => {
    const dataAtual = new Date().toISOString();
    const atualizados = veiculos.map(v => v.id === id ? { ...v, status: 'FILA', dataEntrada: dataAtual } : v);
    setVeiculos(atualizados);
    setVeiculoAberto({ ...veiculoAberto, status: 'FILA', dataEntrada: dataAtual });
  };

  // Função para o Administrativo autorizar ou recusar um serviço específico
  const gerenciarAutorizacao = (veiculoId: string, avariaId: string, novoStatus: string) => {
    const novosVeiculos = veiculos.map(v => {
      if (v.id === veiculoId) {
        const novasAvarias = v.avarias.map((a: any) => a.id === avariaId ? { ...a, statusAutorizacao: novoStatus } : a);
        const atualizado = { ...v, avarias: novasAvarias };
        if (veiculoAberto?.id === veiculoId) setVeiculoAberto(atualizado);
        return atualizado;
      }
      return v;
    });
    setVeiculos(novosVeiculos);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      
      {/* Menu Lateral */}
      <div style={{ width: '260px', backgroundColor: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '25px', fontSize: '22px', fontWeight: 'bold', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Car size={28} color="#38BDF8" /> Via 1 Gestão
        </div>
        <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#38BDF8', cursor: 'pointer', fontWeight: '600' }}><LayoutDashboard size={20} /> Painel Central</div>
         <div onClick={() => navigate('/ordens')} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#94A3B8', cursor: 'pointer' }}><ClipboardList size={20} /> Histórico de OS</div>
        </div>
        
        {/* Botão de Sair do Sistema */}
        <div onClick={() => navigate('/')} style={{ padding: '25px', borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '15px', color: '#EF4444', cursor: 'pointer' }}>
          <LogOut size={20} /> Sair do Sistema
        </div>
      </div>

      {/* Área Principal */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#1E293B', fontSize: '28px' }}>Monitoramento de Operações</h1>
          <div style={{ backgroundColor: '#E2E8F0', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', color: '#334155' }}>Perfil: Administrativo</div>
        </div>

        {/* Gráfico de Produtividade */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', marginBottom: '40px', border: '1px solid #E2E8F0', height: '350px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1E293B' }}>Produtividade Semanal por Setor (Veículos Finalizados)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DADOS_PRODUTIVIDADE} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="dia" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{fill: '#F1F5F9'}} />
              <Bar dataKey="Lavagem" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Oficina" fill="#0F172A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela Interativa */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '25px', color: '#1E293B' }}>Veículos no Pátio</h2>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ paddingBottom: '15px' }}>Placa</th>
                <th style={{ paddingBottom: '15px' }}>Modelo / Origem</th>
                <th style={{ paddingBottom: '15px' }}>Status</th>
                <th style={{ paddingBottom: '15px' }}>Avarias</th>
                <th style={{ paddingBottom: '15px' }}>Tempo no Pátio</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((veiculo) => {
                const dias = calcularDias(veiculo.dataEntrada);
                return (
                  <tr 
                    key={veiculo.id} 
                    style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                    onClick={() => setVeiculoAberto(veiculo)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '20px 0', fontWeight: 'bold', color: '#0F172A' }}>{veiculo.placa}</td>
                    <td>
                      <div style={{ color: '#334155', fontWeight: '600' }}>{veiculo.modelo}</div>
                      <div style={{ color: '#94A3B8', fontSize: '12px' }}>{veiculo.origem}</div>
                    </td>
                    <td>
                      <span style={{ backgroundColor: veiculo.status.includes('APROVAÇÃO') ? '#FEE2E2' : '#F1F5F9', color: veiculo.status.includes('APROVAÇÃO') ? '#DC2626' : '#64748B', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {veiculo.status}
                      </span>
                    </td>
                    <td>
                      {veiculo.avarias.length > 0 ? (
                        <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          {veiculo.avarias.length} Registro(s)
                        </span>
                      ) : <span style={{ color: '#94A3B8' }}>Nenhuma</span>}
                    </td>
                    <td>
                      {dias === null ? <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Não iniciado</span> : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: dias > 3 ? '#DC2626' : '#16A34A' }}>
                          {dias > 3 ? <AlertTriangle size={16}/> : <Clock size={16}/>} {dias} {dias === 1 ? 'dia' : 'dias'}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DO VEÍCULO (Lateral) */}
      {veiculoAberto && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}>
          <div style={{ width: '600px', backgroundColor: 'white', height: '100%', padding: '40px', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B' }}>Gestão da OS</h2>
              <button onClick={() => setVeiculoAberto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={28} /></button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0F172A' }}>{veiculoAberto.placa}</div>
              <div style={{ fontSize: '18px', color: '#64748B' }}>{veiculoAberto.modelo}</div>
            </div>

            {veiculoAberto.status === 'AGUARDANDO RECEBIMENTO' && (
              <button onClick={() => receberVeiculo(veiculoAberto.id)} style={{ width: '100%', background: '#16A34A', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
                MARCAR COMO RECEBIDO (INICIAR CONTAGEM)
              </button>
            )}

            {/* SEÇÃO DE VISTORIA E AVARIAS */}
            {veiculoAberto.avarias.length > 0 && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginTop: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={20} /> Vistoria de Qualidade (Necessita Autorização)
                </h3>
                
                {veiculoAberto.avarias.map((avaria: any) => (
                  <div key={avaria.id} style={{ display: 'flex', gap: '15px', backgroundColor: '#F1F5F9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    
                    {/* Thumbnail clicável para dar zoom */}
                    <div onClick={() => setFotoZoom(avaria.foto)} style={{ cursor: 'pointer', position: 'relative' }}>
                      <img src={avaria.foto} alt="Avaria" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #CBD5E1' }} />
                      <div style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '4px' }}><Camera size={14} color="white" /></div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontWeight: '600', color: '#1E293B', margin: '0 0 5px 0' }}>{avaria.descricao}</p>
                        <span style={{ 
                          fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px',
                          backgroundColor: avaria.statusAutorizacao === 'AUTORIZADO' ? '#DCFCE7' : avaria.statusAutorizacao === 'RECUSADO' ? '#FEE2E2' : '#FEF3C7',
                          color: avaria.statusAutorizacao === 'AUTORIZADO' ? '#16A34A' : avaria.statusAutorizacao === 'RECUSADO' ? '#DC2626' : '#D97706'
                        }}>
                          {avaria.statusAutorizacao}
                        </span>
                      </div>

                      {/* Botões de Ação do Administrativo */}
                      {avaria.statusAutorizacao === 'PENDENTE' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button onClick={() => gerenciarAutorizacao(veiculoAberto.id, avaria.id, 'AUTORIZADO')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: '#22C55E', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                            <Check size={14}/> AUTORIZAR
                          </button>
                          <button onClick={() => gerenciarAutorizacao(veiculoAberto.id, avaria.id, 'RECUSADO')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: '#EF4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                            <Ban size={14}/> RECUSAR
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE ZOOM DA FOTO (Lightbox) */}
      {fotoZoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <button onClick={() => setFotoZoom(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={40} />
          </button>
          <img src={fotoZoom} alt="Zoom Avaria" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', border: '2px solid #334155' }} />
        </div>
      )}

    </div>
  );
}