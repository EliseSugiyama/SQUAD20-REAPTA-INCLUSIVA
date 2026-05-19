CREATE TABLE perfis (
  id_perfil uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_acesso varchar NOT NULL 
);

CREATE TABLE usuarios (
  id_usuario uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL,
  email varchar UNIQUE NOT NULL,
  senha varchar NOT NULL,
  id_perfil uuid REFERENCES perfis(id_perfil),
  data_cadastro timestamp with time zone DEFAULT now()
);

CREATE TABLE arquivos_excel (
  id_arquivos_excel uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid REFERENCES usuarios(id_usuario),
  nome_arquivo varchar NOT NULL,
  caminho_storage varchar,
  total_geral_planilha numeric(15,2), 
  qtd_total_planilha numeric(15,2),   
  data_upload timestamp with time zone DEFAULT now(),
  insight_ia varchar
);

CREATE TABLE vendas_dados (
  id_vendas_dados uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_arquivos_excel uuid REFERENCES arquivos_excel(id_arquivos_excel) ON DELETE CASCADE,
  
  tabela varchar,
  venda text,
  dataVenda date,
  entrega date,
  email varchar,
  cidade varchar,
  estado varchar(2),
  vendedor varchar,
  codigos numeric(15,2),
  produto text,
  comissao numeric,
  entregue integer,
  entregar integer,
  quantidade_vendida integer,
  custo_unitario numeric(15,2),
  preco_venda numeric(15,2), 
  desconto_produto numeric(15,2),
  valor_item numeric(15,2)
);

CREATE TABLE interacoes_ia (
  id_interacoes_ia uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_arquivos_excel uuid REFERENCES arquivos_excel(id_arquivos_excel),
  pergunta_usuario text,
  resposta_ia text,
  contexto_enviado text,
  data_hora timestamp with time zone DEFAULT now()
);

CREATE TABLE historico_acoes (
  id_historico_acoes uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid REFERENCES usuarios(id_usuario),
  acao text NOT NULL,
  detalhes jsonb,
  data_registro timestamp with time zone DEFAULT now()
);