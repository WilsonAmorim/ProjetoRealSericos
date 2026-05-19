Assunto: Faturamento da OS Contas a receber 
O modúlo de faturamento deve conter as mesmas informações do orçamento mas com algumas diferenças, 
Derve Conter tres abas: Elaboração do Faturamento, Faturas Emitidas, Contas a receber

A primeira aba : Elaboração do Faturamento
-A direita deve ter um cobobox para informar qual OS,s, devem ser faturadas(pode conter mais de uma OS e devem ter o status igual a "Pronto para Entrega" ou "Entregue ao cliente", não pode repetir o mesmo OS).
-Após selecionar a(s) OS(s), deve atualizar os dados do orçamento (Valor total da OS ou das OS's selecionadas).
-Deve informar a data de emissão da nota fiscal e a data de vencimento.
-Deve informar o Desconto se houver.
-Deve informar uma numeração ex: NF-e 000001.
-Deve ter um botão Salvar que salva os dados na tabela doa supabase (faturamento).
Tabela faturamento:
create table public.faturamento (
  id_faturamento serial not null,
  id_os integer null,
  valor_servico numeric(10, 2) null,
  data_vencimento date null,
  status_pagamento character varying(20) null default 'Pendente'::character varying,
  data_pagamento timestamp with time zone null,
  valor_desconto numeric(10, 2) null default 0,
  valor_pagamento numeric(10, 2) null,
  numero_nota_fiscal character varying null,
  constraint faturamento_pkey primary key (id_faturamento),
  constraint faturamento_id_os_fkey foreign KEY (id_os) references ordens_servico (id_os),
  constraint faturamento_status_pagamento_check check (
    (
      (status_pagamento)::text = any (
        (
          array[
            'Pendente'::character varying,
            'Pago'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;
O Status Pagamento deve começar como "Pendente".
Na segunda aba :Faturas Emitidas
-Deve listar todas as faturas emitidas "Pagas" ou "A Vencer".
-Deve ter um botão para informar se já foi pago (e atualiza o status de pagamento para "Pago") e o valor pago. 
-Deve ter um botão para cancelar a fatura.

Na terceira aba: Relatório de Faturamento(por mês e ano)
-Deve listar todas as faturas emitidas por OS(oes).
-Deve listar as seguintes informações: 
  -Número da OS(pode conter mais de uma)
  -Número da NF-e
  -Data de emissão da nota fiscal
  -Data de vencimento
  -Valor do faturamento
  -Desconto se houver
  -Valor total do faturamento
  -Status de pagamento
  -Valor total dos sevciços realizados  (pegar da tabela os_servicos)(pode haver mais de um)
  -Valor total das peças  (pegar da tabela os_pecas)(pode haver mais de um)
  -Valor total  (valor do faturamento - valor dos serviços - valor das peças)

Lenbrando que a arquitetura é Hexagonal, deve-se seguir a mesma arquitetura e padrões utilizados no resto do projeto. Usar React, TypeScript, TailwindCss, Supabase, VITE.   