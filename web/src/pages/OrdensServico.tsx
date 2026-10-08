import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, ClipboardList, LogOut, Search, Filter, Download, CheckCircle } from 'lucide-react';

const HISTORICO_MOCK = [
  { id: '101', os: 'OS-5001', placa: 'AAA-0000', modelo: 'Chevrolet Tracker', origem: 'Showroom', servico: 'Lavagem + Polimento', tempoTotal: '4 horas', status: 'ENTREGUE', dataFinalizacao: '01/10/2026' },
  { id: '102', os: 'OS-5002', placa: 'BBB-1111', modelo: 'Fiat Toro', origem: 'Cliente', servico: 'Revisão 10.000km', tempoTotal: '1 dia', status: 'ENTREGUE', dataFinalizacao: '02/10/2026' },
  { id: '103', os: 'OS-5003', placa: 'CCC-2222', modelo: 'Jeep Renegade', origem: 'RAC/Garantia', servico: 'Troca de Para-brisa', tempoTotal: '5 dias', status: 'FINALIZADO', dataFinalizacao: '03/10/2026' },
  { id: '104', os: 'OS-5004', placa: 'DDD-3333', modelo: 'VW Polo', origem: 'Cliente', servico: 'Lavagem Simples', tempoTotal: '45 minutos', status: 'ENTREGUE', dataFinalizacao: '03/10/2026' },
];

export default function OrdensServico() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');

  // Filtro simples por placa ou OS
  const historicoFiltrado = HISTORICO_MOCK.filter(item => 
    item.placa.toLowerCase().includes(busca.toLowerCase()) || 
    item.os.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC' }}>
      
      {/* Menu Lateral */}
      <div style={{ width: '260px', backgroundColor: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '25px', fontSize: '22px', fontWeight: 'bold', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Car size={28} color="#38BDF8" /> Via 1 Gestão
        </div>
        <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#94A3B8', cursor: 'pointer' }}>
            <LayoutDashboard size={20} /> Painel Central
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#38BDF8', cursor: 'pointer', fontWeight: '600' }}>
            <ClipboardList size={20} /> Histórico de OS
          </div>
        </div>
        <div onClick={() => navigate('/')} style={{ padding: '25px', borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '15px', color: '#EF4444', cursor: 'pointer' }}>
          <LogOut size={20} /> Sair do Sistema
        </div>
      </div>

      {/* Área Principal */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ color: '#1E293B', fontSize: '28px' }}>Histórico de Serviços</h1>
            <p style={{ color: '#64748B', marginTop: '5px' }}>Consulta de Ordens de Serviço finalizadas</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Download size={18} /> Exportar Excel
          </button>
        </div>

        {/* Barra de Filtros */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: '0 15px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Search size={18} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Buscar por Placa ou Nº da OS..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px', outline: 'none', color: '#1E293B' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Filter size={18} /> Filtros Avançados
          </button>
        </div>

        {/* Tabela de Histórico */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '30px' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ paddingBottom: '15px' }}>Nº OS</th>
                <th style={{ paddingBottom: '15px' }}>Veículo</th>
                <th style={{ paddingBottom: '15px' }}>Serviço Realizado</th>
                <th style={{ paddingBottom: '15px' }}>Data Conclusão</th>
                <th style={{ paddingBottom: '15px' }}>Tempo Total</th>
                <th style={{ paddingBottom: '15px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {historicoFiltrado.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '20px 0', fontWeight: 'bold', color: '#3B82F6' }}>{item.os}</td>
                  <td>
                    <div style={{ color: '#1E293B', fontWeight: 'bold' }}>{item.placa}</div>
                    <div style={{ color: '#64748B', fontSize: '13px' }}>{item.modelo}</div>
                  </td>
                  <td style={{ color: '#334155' }}>{item.servico}</td>
                  <td style={{ color: '#334155' }}>{item.dataFinalizacao}</td>
                  <td style={{ fontWeight: '500', color: '#1E293B' }}>{item.tempoTotal}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#DCFCE7', color: '#16A34A', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content' }}>
                      <CheckCircle size={14} /> {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {historicoFiltrado.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    Nenhum registro encontrado para "{busca}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}