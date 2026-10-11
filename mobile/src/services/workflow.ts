import api from './api';

export interface VeiculoLavagem {
    id: number;
    veiculo_id: number;
    placa: string;
    marca_modelo: string;
    status: string;
    ciclo_ativo: number;
}

// 1. Lavagem (Bate com "Lavagem")
export const listarParaLavagem = async (): Promise<VeiculoLavagem[]> => {
    const response = await api.get('/veiculos/lista/?status=Lavagem');
    return response.data;
};

export const concluirLavagem = async (cicloId: number) => {
    const response = await api.post('/workflow/lavagens/', {
        ciclo: cicloId,
        status: 'CONCLUIDO'
    });
    return response.data;
};

// 2. Qualidade / Vistoria (Bate com "Qualidade Pós-Oficina")
export const listarParaVistoria = async (): Promise<VeiculoLavagem[]> => {
    const response = await api.get('/veiculos/lista/?status=Qualidade Pós-Oficina'); 
    return response.data;
};

export const registrarVistoria = async (cicloId: number, resultado: string, observacoes: string) => {
    const response = await api.post('/workflow/vistorias/', {
        ciclo: cicloId,
        etapa: 'POS_OFICINA',
        resultado: resultado,
        observacoes: observacoes
    });
    return response.data;
};

// 3. Serviços Externos
export const listarServicosExternos = async (): Promise<VeiculoLavagem[]> => {
    const response = await api.get('/veiculos/lista/?status=Servico Externo'); 
    return response.data;
};

export const concluirServicoExterno = async (cicloId: number) => {
    const response = await api.patch(`/veiculos/lista/${cicloId}/`, {
        status: 'Qualidade Pós-Oficina' 
    });
    return response.data;
};