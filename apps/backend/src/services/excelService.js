const xlsx = require('xlsx');

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const normalized = String(value)
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.\-]/g, '');
  const number = Number(normalized);
  return Number.isNaN(number) ? 0 : number;
};

const getCellValue = (sheet, keys) => {
  for (const key of keys) {
    if (sheet[key]) return sheet[key].v;
  }
  return null;
};

const processarPlanilha = (caminhoDoArquivo) => {
  const workbook = xlsx.readFile(caminhoDoArquivo);

  const nomeDaAba = workbook.SheetNames[0];
  const aba = workbook.Sheets[nomeDaAba];

  const valorTotalGeral = parseNumber(getCellValue(aba, ['B2', 'A2', 'C2']));
  const quantidadeTotal = parseNumber(getCellValue(aba, ['B3', 'A3', 'C3']));

  const dadosDaTabela = xlsx.utils.sheet_to_json(aba, { range: 3 });

  return {
    resumo: {
      totalGeral: valorTotalGeral,
      quantidadeTotal: quantidadeTotal
    },
    vendas: dadosDaTabela
  };
};

module.exports = { processarPlanilha };