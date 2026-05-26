import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarVendasPorArquivo, buscarArquivoPorId } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      console.log('Details: carregando id ->', id);
      try {
        setErro('');
        const [vendasRes, arquivoRes] = await Promise.all([
          buscarVendasPorArquivo(id),
          buscarArquivoPorId(id)
        ]);
        console.log('Details: vendasRes/vendas length ->', (vendasRes.vendas || []).length, 'arquivoRes ->', arquivoRes);
        setVendas(vendasRes.vendas || []);
        setArquivo(arquivoRes.arquivo || null);
      } catch (err) {
        const apiMessage = err?.response?.data?.erro || err?.response?.data?.detalhe || err?.message || 'Erro desconhecido';
        setErro(`Não foi possível carregar os dados do arquivo: ${apiMessage}`);
        console.error('Detalhe do erro ao carregar detalhes:', err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id]);

  const totalGeral = vendas.reduce((acc, v) => acc + (Number(v.valor_item) || 0), 0);
  const quantidadeTotal = vendas.reduce((acc, v) => acc + (Number(v.quantidade_vendida) || 0), 0);
  const uniqueProducts = Array.from(new Set(vendas.map(v => v.produto).filter(Boolean))).length;

  const truncate = (s, n = 12) => s && s.length > n ? s.slice(0, n - 1) + '…' : s;

  const produtoAgg = Object.entries(vendas.reduce((acc, v) => {
    const produto = (v.produto || 'Desconhecido').toString();
    acc[produto] = (acc[produto] || 0) + (Number(v.valor_item) || 0);
    return acc;
  }, {}))
    .sort(([, aValue], [, bValue]) => bValue - aValue)
    .slice(0, 10);

  // aggregate states for bar chart & legend
  const estadoAgg = Object.entries(vendas.reduce((acc, v) => {
    const estado = (v.estado || 'Desconhecido').toString();
    acc[estado] = (acc[estado] || 0) + (Number(v.valor_item) || 0);
    return acc;
  }, {})).sort(([, aValue], [, bValue]) => bValue - aValue);

  const estadoColors = estadoAgg.map((_, i) => `hsl(${(i * 360) / Math.max(estadoAgg.length, 8)}, 70%, 52%)`);
  const produtoColors = produtoAgg.map((_, i) => `hsl(${(i * 360) / Math.max(produtoAgg.length, 8)}, 65%, 55%)`);

  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <h2 style={{ marginTop: 0, marginBottom: 8 }}>{arquivo ? arquivo.nome_arquivo : 'Detalhes do arquivo'}</h2>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>{arquivo ? `Dados provenientes de: ${arquivo.nome_arquivo}` : ''}</p>

      {carregando ? (
        <p style={{ color: '#9ca3af' }}>Carregando dados...</p>
      ) : erro ? (
        <p style={{ color: '#ef4444' }}>{erro}</p>
      ) : vendas.length === 0 ? (
        <div style={{ background: 'white', padding: 20, borderRadius: 12 }}>
          <p style={{ color: '#9ca3af' }}>Nenhuma venda registrada para este arquivo.</p>
          {arquivo && (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>Total de Vendas</p>
                <p style={{ marginTop: 8, fontSize: 20, fontWeight: 700, color: '#f48c3d' }}>R$ {Number(arquivo.total_geral_planilha || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>Quantidade vendida</p>
                <p style={{ marginTop: 8, fontSize: 20, fontWeight: 700, color: '#f48c3d' }}>{arquivo.qtd_total_planilha || 0}</p>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>Produtos únicos</p>
                <p style={{ marginTop: 8, fontSize: 20, fontWeight: 700, color: '#f48c3d' }}>{uniqueProducts}</p>
              </div>
              <div style={{ background: '#f3e8ff', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>Insight da IA</p>
                <p style={{ marginTop: 8, fontSize: 14, fontStyle: 'italic', color: '#6d28d9' }}>Nenhum insight disponível.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          <div style={{ background: 'white', padding: 20, borderRadius: 12, minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Resumo Geral</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>Total de Vendas</p>
                  <p style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: '#f48c3d' }}>R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>Quantidade vendida</p>
                  <p style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: '#f48c3d' }}>{quantidadeTotal}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>Produtos únicos</p>
                  <p style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: '#f48c3d' }}>{uniqueProducts}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>Arquivo</p>
                  <p style={{ marginTop: 8, fontSize: 14, color: '#374151' }}>{arquivo?.nome_arquivo || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#f3e8ff', padding: 20, borderRadius: 12, minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ margin: 0, color: '#6d28d9' }}>Insight da IA</h4>
            <p style={{ marginTop: 12, color: '#6d28d9', fontStyle: 'italic' }}>Nenhum insight disponível.</p>
            <div style={{ marginTop: 'auto', color: '#6d28d9', fontSize: 13 }}>Visão geral rápida do arquivo.</div>
          </div>

          <div style={{ gridColumn: '1 / -1', background: 'white', padding: 20, borderRadius: 12, minHeight: 440 }}>
            <h3 style={{ marginTop: 0 }}>Vendas por Produto (Top)</h3>
            <div style={{ height: 14 }} />
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={produtoAgg.map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                >
                  {produtoAgg.map(([name, value], i) => (
                    <Cell key={name} fill={produtoColors[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
              {produtoAgg.map(([name, value], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 10, padding: 10 }}>
                  <div style={{ width: 12, height: 12, background: produtoColors[i], borderRadius: 2 }} />
                  <div style={{ fontSize: 13, color: '#374151', wordBreak: 'break-word' }}>{name} — R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', background: 'white', padding: 20, borderRadius: 12, minHeight: 440 }}>
            <h3 style={{ marginTop: 0 }}>Vendas por Estado</h3>
            <div style={{ height: 14 }} />
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={estadoAgg.map(([name, value]) => ({ name, value }))} margin={{ top: 20, left: 0, right: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} tick={{ angle: -35, textAnchor: 'end', dy: 8, fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} />
                <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="value" fill="#f48c3d">
                  {estadoAgg.map(([name], i) => (
                    <Cell key={name} fill={estadoColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
              {estadoAgg.map(([name, value], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: estadoColors[i], borderRadius: 2 }} />
                  <div style={{ fontSize: 13, color: '#374151' }}>{name} — R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
