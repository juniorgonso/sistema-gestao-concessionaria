import api from './api';


export const enviarFotoEvidencia = async (cicloId: number, fotoFile: File, descricao: string) => {
  
  // 🔒 CORREÇÃO DO AUDITOR: Validação rigorosa na ponta do cliente
  if (!fotoFile.type.startsWith('image/')) {
    throw new Error('Segurança: O ficheiro selecionado não é uma imagem válida.');
  }

  const tamanhoMaximoMB = 5; // Limite de 5MB por foto
  if (fotoFile.size > tamanhoMaximoMB * 1024 * 1024) {
    throw new Error(`Segurança: A foto é muito pesada. O limite máximo é de ${tamanhoMaximoMB}MB.`);
  }

  const formData = new FormData();
  formData.append('ciclo', cicloId.toString());
  formData.append('foto', fotoFile);
  formData.append('descricao', descricao);

  try {
    // 🔒 CORREÇÃO DO AUDITOR: Rota alinhada!
    const response = await api.post('/workflow/evidencias/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro no envio da evidência:", error);
    throw error;
  }
};