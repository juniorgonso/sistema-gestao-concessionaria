import api from './api';

export interface Ocorrencia {
  id: number;
  origem: string;
  descricao: string;
  status: string;
  criado_em: string;
  veiculo: number;
  ciclo: number;
}

export const listarOcorrencias = async (): Promise<Ocorrencia[]> => {
  try {
    const response = await api.get<Ocorrencia[]>('/v1/concessionaria/ocorrencias/');
    return response.data;
  } catch (error) {
    console.error("Erro ao procurar ocorrências:", error);
    throw error;
  }
};

export const criarOcorrencia = async (dados: { veiculo: number; ciclo: number; origem: string; descricao: string; status: string }): Promise<Ocorrencia> => {
  try {
    const response = await api.post<Ocorrencia>('/v1/concessionaria/ocorrencias/', dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar ocorrência:", error);
    throw error;
  }
};

export const atualizarStatus = async (id: number, status: string): Promise<Ocorrencia> => {
  try {
    // Usamos PATCH porque queremos atualizar apenas um campo (o status) e não o registro inteiro
    const response = await api.patch<Ocorrencia>(`/v1/concessionaria/ocorrencias/${id}/`, { status });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
};
