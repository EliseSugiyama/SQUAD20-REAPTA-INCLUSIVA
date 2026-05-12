import React, { useState } from 'react';
import { uploadPlanilha } from './services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Upload, LayoutDashboard, BrainCircuit } from 'lucide-react';

function App() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleFileChange = async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    setCarregando(true);
    try {
      const resultado = await uploadPlanilha(arquivo);
      setDados(resultado);
    } catch (error) {
      alert("Erro ao enviar planilha!");
    } finally {
      setCarregando(false);
    }
  };

  const possuiDados = dados && dados.dados;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <LayoutDashboard size={32} color="#4f46e5" />
        <h1>Dashboard SQUAD-20</h1>
      </header>

      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>Fazer Upload de Planilha</h3>
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" id="upload-input" style={{ display: 'none' }} />
        <label htmlFor="upload-input" style={{ 
          cursor: 'pointer', backgroundColor: '#4f46e5', color: 'white', 
          padding: '10px 20px', borderRadius: '5px', display: 'inline-flex', alignItems: 'center', gap: '8px' 
        }}>
          <Upload size={18} /> {carregando ? 'Processando...' : 'Selecionar Arquivo Excel'}
        </label>
      </section>

      {possuiDados ? (
        <main style={{ marginTop: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3>Resumo Geral</h3>
              <p><strong>Total de Vendas:</strong> R$ {dados.dados.resumo.totalGeral}</p>
              <p><strong>Qtd Itens:</strong> {dados.dados.resumo.quantidadeTotal}</p>
              
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eef2ff', borderRadius: '8px', borderLeft: '4px solid #4f46e5' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                  <BrainCircuit size={18} /> Insight da IA
                </h4>
                <p style={{ fontStyle: 'italic', color: '#3730a3' }}>
                  "{dados.insight ?? 'Nenhum insight disponível.'}"
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: '300px' }}>
              <h3>Comparativo de Vendas</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados.dados.vendas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Produto" /> 
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Venda" fill="#4f46e5" /> 
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </main>
      ) : dados ? (
        <main style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <p>{dados.mensagem ?? 'Upload realizado com sucesso.'}</p>
        </main>
      ) : null}
    </div>
  );
}

export default App;