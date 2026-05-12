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

    const transformarData = (valor) => {
      if (!valor) return null;
      if (typeof valor === 'number') return excelDateToJSDate(valor);
      const data = new Date(valor);
      return Number.isNaN(data.getTime()) ? null : data;
    };

    const mapVendasParaDB = (venda) => ({
      tabela: venda.Tabela ?? venda.tabela ?? 'Desconhecido',
      venda: venda.Venda ?? venda.venda ?? null,
      data_venda: transformarData(venda['Data Venda'] ?? venda.dataVenda ?? venda.data_venda),
      entrega: transformarData(venda.Entrega ?? venda.entrega),
      email: venda.Email ?? venda.email ?? null,
      cidade: venda.Cidade ?? venda.cidade ?? null,
      estado: venda.Estado ?? venda.estado ?? null,
      vendedor: venda.Vendedor ?? venda.vendedor ?? null,
      codigos: transformarNumero(venda.Codigos ?? venda['Códigos'] ?? venda.codigos),
      produto: venda.Produto ?? venda.produto ?? null,
      comissao: transformarNumero(venda.Comissao ?? venda.comissao),
      entregue: transformarNumero(venda.Entregue ?? venda.entregue),
      entregar: transformarNumero(venda.Entregar ?? venda.entregar),
      quantidade_vendida: transformarNumero(venda['Quantidade vendida'] ?? venda.QuantidadeVenda ?? venda.quantidade_vendida ?? venda.quantidadeTotal),
      custo_unitario: transformarNumero(venda['Custo unitário'] ?? venda.CustoUnitario ?? venda.custo_unitario),
      preco_venda: transformarNumero(venda['Preço venda'] ?? venda.PrecoVenda ?? venda.preco_venda),
      desconto_produto: transformarNumero(venda['Desconto produto'] ?? venda.DescontoProduto ?? venda.desconto_produto),
      valor_item: transformarNumero(venda['Valor item'] ?? venda.Valor ?? venda.valor_item),
      id_arquivos_excel: arquivoId
    });

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