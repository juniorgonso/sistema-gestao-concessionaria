import api from './api';

export interface Evidencia {
  id?: number;
  ciclo: number;
  foto: string;
  descricao: string;
  enviado_em?: string;
  enviado_por?: string;
}

// A FUNÇÃO MESTRA PARA ENVIAR FICHEIROS
export const enviarFotoEvidencia = async (cicloId: number, fotoFile: File, descricao: string) => {
  // Para ficheiros, NÃO usamos JSON. Usamos um "Camião de Carga" chamado FormData
  const formData = new FormData();
  formData.append('ciclo', cicloId.toString());
  formData.append('foto', fotoFile);
  formData.append('descricao', descricao);

  try {
    const response = await api.post('/evidencias/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Avisa o Backend que lá vem um ficheiro pesado
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar a foto:", error);
    throw error;
  }
};