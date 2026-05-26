import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export const uploadPlanilha = async (arquivo) => {
  const formData = new FormData();
  formData.append('planilha', arquivo);

  const response = await api.post('/upload', formData);
  
  return response.data;
};

//Novo tbm

export const buscarVendas = async () => {
  const response = await api.get('/vendas');
  return response.data;
};

export const listarArquivos = async () => {
  const response = await api.get('/arquivos');
  return response.data;
};

export const buscarArquivoPorId = async (arquivoId) => {
  const response = await api.get(`/arquivos/${arquivoId}`);
  return response.data;
};

export const buscarVendasPorArquivo = async (arquivoId) => {
  const response = await api.get(`/vendas/arquivo/${arquivoId}`);
  return response.data;
};