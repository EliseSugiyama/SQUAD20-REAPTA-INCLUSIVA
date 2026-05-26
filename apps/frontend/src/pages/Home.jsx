import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarArquivos, uploadPlanilha } from '../services/api';
import { Upload, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const [arquivos, setArquivos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = 15;
  const navigate = useNavigate();

  const carregarArquivos = async () => {
    try {
      const res = await listarArquivos();
      setArquivos(res.arquivos || []);
    } catch (err) {
      console.error('Erro ao listar arquivos', err);
    }
  };

  useEffect(() => { carregarArquivos(); }, []);

  const handleFileChange = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    setCarregando(true);
    try {
      await uploadPlanilha(arquivo);
      await carregarArquivos();
      setPage(0);
    } catch (err) {
      alert('Erro ao enviar arquivo');
    } finally { setCarregando(false); }
  };

  const totalPages = Math.max(1, Math.ceil(arquivos.length / itemsPerPage));

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <LayoutDashboard size={30} color="#f48c3d" />
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Selecione um arquivo no histórico ou envie um novo.</h1>
      </header>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div style={{ flex: 1, background: 'white', padding: 20, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0, marginBottom: 18 }}>Histórico</h2>
          {arquivos.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhum arquivo encontrado.</p>
          ) : (
            <div>
              <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                {arquivos.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((a) => (
                  <li key={a.id_arquivos_excel ?? a.id} style={{ marginBottom: 10 }}>
                    <button onClick={() => navigate(`/detalhes/${a.id_arquivos_excel ?? a.id}`)} style={{
                      width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid #e6e7eb', background: 'white', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ color: '#111827' }}>{a.nome_arquivo}</span>
                      <small style={{ color: '#6b7280' }}>{new Date(a.data_upload).toLocaleString()}</small>
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: page === 0 ? '#f3f4f6' : 'white', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>◀</button>
                <span style={{ color: '#6b7280' }}>Página {page + 1} de {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: page >= totalPages - 1 ? '#f3f4f6' : 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>▶</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 320, maxHeight: 220, background: 'white', padding: 20, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0, marginBottom: 18 }}>Enviar nova planilha</h3>
          <div style={{ border: '1px dashed #e6e7eb', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <input id="upload-input-home" type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
            <label htmlFor="upload-input-home" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f48c3d', color: 'white', fontWeight: 500, padding: '10px 14px', borderRadius: 8 }}>
              <Upload size={14} />{carregando ? 'Enviando...' : 'Selecionar e enviar arquivo'}
            </label>
            <small style={{ color: '#6b7280', textAlign: 'center' }}>Aceitamos arquivos Excel (.xlsx, .xls). Após o upload, os dados serão processados e estarão disponíveis no histórico.</small>
          </div>
        </div>
      </div>

      <p style={{ color: '#6b7280' }}>Selecione um arquivo no histórico para ver os gráficos, resumo e insight gerado.</p>
    </div>
  );
}
