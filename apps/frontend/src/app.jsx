/*import React, { useState } from 'react';
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

export default App;*/

import { useState, useEffect } from 'react';
import { uploadPlanilha, buscarVendas } from './services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Upload, LayoutDashboard, BrainCircuit, RefreshCw } from 'lucide-react';

function App() {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const carregarVendas = async () => {
    setCarregandoDados(true);
    try {
      const resultado = await buscarVendas();
      setVendas(resultado.vendas || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setCarregandoDados(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  const handleFileChange = async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;
    setCarregando(true);
    try {
      await uploadPlanilha(arquivo);
      await carregarVendas();
    } catch (error) {
      alert('Erro ao enviar planilha!');
    } finally {
      setCarregando(false);
    }
  };

  const totalGeral = vendas.reduce((acc, v) => acc + (Number(v.valor_item) || 0), 0);
  const quantidadeTotal = vendas.reduce((acc, v) => acc + (Number(v.quantidade_vendida) || 0), 0);

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <LayoutDashboard size={30} color="#4f46e5" />
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a2e' }}>
          Dashboard SQUAD-20
        </h1>
      </header>

      <div style={{
        background: 'white', borderRadius: '12px', padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <p style={{ fontWeight: '500', marginBottom: '14px', color: '#374151' }}>
            Fazer Upload de Planilha
          </p>
          <input type="file" id="upload-input" accept=".xlsx,.xls"
            onChange={handleFileChange} style={{ display: 'none' }} />
          <label htmlFor="upload-input" style={{
            cursor: 'pointer', background: '#4f46e5', color: 'white',
            padding: '10px 20px', borderRadius: '8px',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '500'
          }}>
            <Upload size={16} />
            {carregando ? 'Processando...' : 'Selecionar Arquivo Excel'}
          </label>
        </div>

        <button onClick={carregarVendas} style={{
          cursor: 'pointer', background: 'transparent', border: '1px solid #e5e7eb',
          padding: '10px 16px', borderRadius: '8px',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', color: '#6b7280'
        }}>
          <RefreshCw size={15} /> Atualizar dados
        </button>
      </div>

      {carregandoDados ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>
          Carregando dados do banco...
        </p>
      ) : vendas.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          <div style={{
            background: 'white', borderRadius: '12px', padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              Resumo Geral
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f5f3ff', borderRadius: '8px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total de Vendas</p>
                <p style={{ fontSize: '22px', fontWeight: '600', color: '#4f46e5' }}>
                  R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{ background: '#f5f3ff', borderRadius: '8px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Qtd de Itens Vendidos</p>
                <p style={{ fontSize: '22px', fontWeight: '600', color: '#4f46e5' }}>
                  {quantidadeTotal}
                </p>
              </div>
            </div>
            <div style={{
              marginTop: '16px', padding: '14px 16px',
              background: '#eef2ff', borderLeft: '4px solid #4f46e5',
              borderRadius: '0 8px 8px 0'
            }}>
              <p style={{
                fontSize: '13px', fontWeight: '600', color: '#3730a3',
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'
              }}>
                <BrainCircuit size={15} /> Insight da IA
              </p>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#4338ca' }}>
                "Nenhum insight disponível."
              </p>
            </div>
          </div>

          <div style={{
            background: 'white', borderRadius: '12px', padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              Comparativo de Vendas por Produto
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vendas.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="produto" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="valor_item" name="Valor (R$)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '40px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center'
        }}>
          <p style={{ color: '#9ca3af' }}>Nenhum dado encontrado. Faça o upload de uma planilha para começar.</p>
        </div>
      )}
    </div>
  );
}

export default App;