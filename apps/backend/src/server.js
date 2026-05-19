const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../..', '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processarPlanilha } = require('./services/excelService');
const { salvarDadosNoBanco } = require('./services/supabaseService');

//Novo require adicionado 
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// --- ROTAS ---

app.get('/', (req, res) => {
  res.send('🚀 Backend do SQUAD-20 rodando!');
});

app.get('/api/upload', (req, res) => {
  res.status(405).json({ erro: 'Use POST /api/upload para enviar a planilha.' });
});

app.post('/api/upload', upload.single('planilha'), async (req, res) => { 
    console.log("URL do Supabase:", process.env.SUPABASE_URL);
  try {
    if (!req.file) return res.status(400).json({ erro: 'Arquivo não enviado.' });

    const dadosExtraidos = processarPlanilha(req.file.path);
    console.log('Resumo extraído:', dadosExtraidos.resumo);
    console.log('Primeira venda extraída:', dadosExtraidos.vendas[0]);

    const resultado = await salvarDadosNoBanco({
      ...dadosExtraidos,
      nomeArquivo: req.file.originalname,
      caminhoStorage: req.file.path
    });

    if (!resultado.sucesso) {
      return res.status(500).json({ erro: 'Erro ao salvar no banco.', detalhe: resultado.erro });
    }

    res.json({
      mensagem: 'Sucesso! Dados processados e salvos no banco.',
      id: resultado.arquivoId,
      dados: dadosExtraidos,
      insight: null
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ erro: 'Falha no servidor.', detalhe: error.message });
  }
});

// -- Rota que eu coloquei para visualizar dados sem upload -- 

app.get('/api/vendas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendas_dados')
      .select('*')
      .limit(200);

    if (error) throw error;

    res.json({ sucesso: true, vendas: data });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar vendas.', detalhe: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor ativo em: http://localhost:${PORT}`);
});