const xlsx = require('xlsx');
const ws_data = [
  ['Header1'],
  [1000],
  [50],
  ['Venda','Data Venda','Entrega','Email','Cidade','Estado','Vendedor','Codigos','Produto','Comissao','Entregue','Entregar','Quantidade vendida','Custo unitario','Preco venda','Desconto produto','Valor item'],
  ['100','2024-05-01','2024-05-05','teste@exemplo.com','Brasília','DF','João','123','Produto A','10.5','1','0','5','10.00','20.00','0','200.00']
];
const ws = xlsx.utils.aoa_to_sheet(ws_data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
xlsx.writeFile(wb, 'test-upload.xlsx');
console.log('Created test-upload.xlsx');
