const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../..', '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processarPlanilha } = require('./services/excelService');
const { salvarDadosNoBanco } = require('./services/supabaseService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

app.listen(PORT, () => {
  console.log(`✅ Servidor ativo em: http://localhost:${PORT}`);
});