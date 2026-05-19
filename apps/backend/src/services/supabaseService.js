const { createClient } = require('@supabase/supabase-js');

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!process.env.SUPABASE_URL || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY must be defined in .env');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseKey
);
console.log('Supabase client initialized with', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role key' : 'anon/key');

const salvarDadosNoBanco = async (dadosProcessados) => {
  try { 
    const arquivoPayload = {
      id_usuario: null,
      nome_arquivo: dadosProcessados.nomeArquivo || 'upload.xlsx',
      caminho_storage: dadosProcessados.caminhoStorage || null,
      total_geral_planilha: dadosProcessados.resumo.totalGeral,
      qtd_total_planilha: dadosProcessados.resumo.quantidadeTotal,
      data_upload: new Date()
    };
    console.log('Insert arquivos_excel payload:', arquivoPayload);

    const { data: arquivoSalvo, error: erroArquivo } = await supabase
      .from('arquivos_excel') 
      .insert([arquivoPayload])
      .select()
      .single();

    if (erroArquivo) throw erroArquivo;

    const arquivoId = arquivoSalvo.id_arquivos_excel ?? arquivoSalvo.id;

    const transformarNumero = (valor) => {
      if (valor === null || valor === undefined || valor === '') return null;
      let texto = String(valor).trim();
      texto = texto.replace(/\s/g, '').replace(/%/g, '');
      if (texto === '') return null;

      if (texto.includes(',') && texto.includes('.')) {
        const partes = texto.split('.');
        const ultimo = partes.pop();
        texto = partes.join('') + '.' + ultimo.replace(/,/g, '');
      } else {
        texto = texto.replace(/,/g, '.');
      }

      const normalized = texto.replace(/[^0-9.\-]/g, '');
      const numero = Number(normalized);
      return Number.isNaN(numero) ? null : numero;
    };

    const excelDateToJSDate = (serial) => {
      const utcDays = Math.floor(serial - 25569);
      const utcValue = utcDays * 86400;
      const fraction = serial - Math.floor(serial);
      const totalSeconds = Math.round((fraction * 86400));
      return new Date((utcValue + totalSeconds) * 1000);
    };

    const parseDateString = (valor) => {
      if (typeof valor !== 'string') return null;
      const texto = valor.trim();
      if (!texto) return null;

      const diaMesAno = texto.match(/^([0-3]?\d)[/\-]([0-1]?\d)[/\-](\d{4})$/);
      if (diaMesAno) {
        const [, dia, mes, ano] = diaMesAno;
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
      }

      const anoMesDia = texto.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (anoMesDia) {
        const [, ano, mes, dia] = anoMesDia;
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
      }

      const data = new Date(texto);
      return Number.isNaN(data.getTime()) ? null : data;
    };

    const transformarData = (valor) => {
      if (valor === null || valor === undefined || valor === '') return null;
      let data;
      if (typeof valor === 'number') {
        data = excelDateToJSDate(valor);
      } else if (typeof valor === 'string') {
        data = parseDateString(valor);
      } else if (valor instanceof Date) {
        data = valor;
      } else {
        return null;
      }
      if (!data || Number.isNaN(data.getTime())) return null;
      return data.toISOString().slice(0, 10);
    };

    const normalizeKey = (key) =>
      key
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]/g, '');

    const normalizeRowKeys = (row) =>
      Object.entries(row).reduce((acc, [key, value]) => {
        acc[normalizeKey(key)] = value;
        return acc;
      }, {});

    const getRowValue = (row, ...keys) => {
      for (const key of keys) {
        const normalized = normalizeKey(key);
        if (row[normalized] !== undefined && row[normalized] !== null) {
          return row[normalized];
        }
      }
      return null;
    };

    const mapVendasParaDB = (venda) => {
      const row = normalizeRowKeys(venda);
      return {
        tabela: getRowValue(row, 'Tabela', 'tabela') ?? 'Desconhecido',
        venda: getRowValue(row, 'Venda', 'venda') ?? null,
        data_venda: transformarData(getRowValue(row, 'Data Venda', 'dataVenda', 'data_venda')),
        entrega: transformarData(getRowValue(row, 'Entrega', 'entrega')),
        email: getRowValue(row, 'Email', 'email') ?? null,
        cidade: getRowValue(row, 'Cidade', 'cidade') ?? null,
        estado: getRowValue(row, 'Estado', 'estado') ?? null,
        vendedor: getRowValue(row, 'Vendedor', 'vendedor') ?? null,
        codigos: transformarNumero(getRowValue(row, 'Codigos', 'Códigos', 'codigos')),
        produto: getRowValue(row, 'Produto', 'produto') ?? null,
        comissao: transformarNumero(getRowValue(row, 'Comissao', 'comissão', 'comissao')),
        entregue: transformarNumero(getRowValue(row, 'Entregue', 'entregue')),
        entregar: transformarNumero(getRowValue(row, 'Entregar', 'entregar')),
        quantidade_vendida: transformarNumero(getRowValue(row, 'Quantidade vendida', 'Quantidade Vendida', 'QuantidadeVenda', 'quantidade_vendida', 'quantidadeTotal')),
        custo_unitario: transformarNumero(getRowValue(row, 'Custo unitário', 'Custo Unitário', 'CustoUnitario', 'custo_unitario')),
        preco_venda: transformarNumero(getRowValue(row, 'Preço venda', 'Preço Venda', 'PrecoVenda', 'preco_venda')),
        desconto_produto: transformarNumero(getRowValue(row, 'Desconto produto', 'Desconto Produto', 'DescontoProduto', 'desconto_produto')),
        valor_item: transformarNumero(getRowValue(row, 'Valor item', 'Valor Item', 'Valor', 'valor_item')),
        id_arquivos_excel: arquivoId
      };
    };

    const vendasComId = dadosProcessados.vendas.map(mapVendasParaDB);
    console.log('First venda mapped:', vendasComId[0]);

    const { error: erroVendas } = await supabase
      .from('vendas_dados')
      .insert(vendasComId);

    if (erroVendas) throw erroVendas;

    console.log('Arquivo salvo no Supabase:', arquivoSalvo);
    console.log('Número de vendas inseridas:', vendasComId.length);

    return { sucesso: true, arquivoId };

  } catch (error) {
  console.error("--- 🚨 ERRO NO SUPABASE 🚨 ---");
  console.error("Mensagem:", error.message);
  console.error("Dica do Banco:", error.hint);
  console.error("Detalhes:", error.details);
  console.error("-----------------------------");
  return { sucesso: false, erro: error.message };
}
};

module.exports = { salvarDadosNoBanco };