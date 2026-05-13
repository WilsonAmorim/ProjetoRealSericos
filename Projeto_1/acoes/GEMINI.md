Prompt Mestre: Sistema RealServiços (Manutenção de Motores)
1. Contexto e Objetivo
Desenvolver o backend de um sistema de gestão para oficina de motores elétricos. O foco é a rastreabilidade total, desde a entrada do motor até o faturamento, com controle rigoroso de estoque e perfis de acesso. O sistema deve ser escalável, utilizando Arquitetura Hexagonal para separar regras de negócio de implementações de banco de dados.

2. Pilha Tecnológica
Linguagem: Node.js com TypeScript.

Framework: Express.

Banco de Dados: Supabase (PostgreSQL).
    
    - EXPO_PUBLIC_SUPABASE_URL=
    - EXPO_PUBLIC_SUPABASE_ANON_KEY=

Arquitetura: Hexagonal (Ports & Adapters).

Upload: Multer (armazenamento local para laudos e fotos de queima).

3. Regras de Negócio e "Skills" do Banco (Constraints)
Clientes: documento deve ser único e validado (CNPJ/CPF).

Estoque: O saldo da tabela produtos nunca é editado manualmente. Ele deve ser atualizado via Trigger sempre que houver um INSERT na tabela movimentacao_estoque.

Status de OS: A coluna id_andamento na tabela ordens_servico deve respeitar a ordem lógica (ex: não é possível "Entregar" sem antes estar "Pronto").

Integridade: Todas as tabelas devem possuir data_criacao e data_atualizacao automáticos (Timestamps).

4. Estrutura de Dados (Esquema SQL)
(Utilizar as tabelas definidas anteriormente, com as seguintes adições de restrições):

Tabela Cliente: Adicionar colunas cidade e estado. Documento como UNIQUE.

Tabela Usuários: Vinculada ao auth.users do Supabase via UUID. Campo ativo como Booleano (default True).

Tabela Faturamento: valor_total não pode ser negativo.

5. Requisitos Funcionais (Backend)
Busca Inteligente: Endpoint GET /search que aceite um parâmetro query. Deve buscar simultaneamente em:

cliente.nome_razao_social (ILike)

ordens_servico.id_os (Número exato)

motores.num_serie (Número exato)

Abertura de OS: Ao criar uma OS, o sistema deve permitir vincular uma causa_queima e fazer o upload de até 3 fotos via Multer.

Relatório Técnico: Endpoint para gerar um JSON estruturado com os dados do motor (potência, RPM, rolamentos) e os itens usados na OS para facilitar a geração de PDF no frontend.

Middleware de Acesso: Validar o id_perfil do usuário.

Mecânico/Eletricista: Apenas leitura de Clientes e escrita em os_itens_servico.

Recepção: Cadastro de Clientes, Motores e abertura de OS.

Admin: Acesso total, incluindo Faturamento e Gestão de Usuários.

6. Padrão de Resposta
As rotas devem seguir o padrão REST.

Tratamento de erros centralizado (Global Error Handler).

Logs de operações críticas (Ex: quem deu saída em material do estoque).

O que mudou?
Integridade: Agora o prompt exige que o estoque seja movido por transações (movimentacao_estoque), o que evita furos no inventário.

Busca Centralizada: Em vez de várias telas de busca, o backend agora entrega tudo em um único endpoint, o que facilita muito a criação do App Mobile.

Segurança: O middleware de perfil já está previsto, protegendo os dados financeiros de quem não deve vê-los.


Estrutura do Banco: 
    - Tabela cliente                     
        - id_cliente (PK) 
        - documento (cnpj/cpf) 
        - nome_razao_social 
        - nome_fantasia 
        - inscricao_estadual 
        - inscricao_municipal 
        - endereco 
        - bairro 
        - cep 
        - complemento        
        - celular 
        - telefone
        - email
        - observacao
        
    - Tabela contato 
        - id_contato (PK) 
        - id_cliente 
        - nome_contato 
        - cargo 
        - email 
        - telefone
        - setor
        - data_aniversario
        - observacao
    
    - Tabela fornecedor 
        - id_fornecedor (PK) 
        - documento 
        - razao_social 
        - nome_fantasia 
        - endereco 
        - bairro 
        - cep 
        - complemento        
        - celular 
        - telefone
        - email

    - Tabela grupos_estoque 
        - id_grupo (PK)
        - nome_grupo

    - Tabela formas_construtivas 
        - codigo_fconst (PK)
        - carcaca_tipo
        - posicao_eixo
        - fixacao
   
    - Tabela produtos 
        - id_produto (PK)
        - id_grupo
        - descricao_produto
        - fabricante
        - unidade
        - referencia
        - estoque_minimo

    - Tabela movimentacao_estoque
        - id_movimenta (PK)
        - id_produto
        - id_fornecedor
        - quantidade
        - valor_unitario
        - data_entrada
        - status (Entrada, Saida)

    - Tabela motores
        - id_motor (PK)
        - id_cliente
        - num_serie        
        - fabricante
        - potencia_cv_kw
        - rpm
        - tensao_v
        - codigo_fconst
        - rolamento_la
        - rolamento_loa   

    - Tabela causas_queima:
        - id_causa_queima (PK)
        - descricao_causa
        - link_imagem

    - Tabela andamento_servico:
        - id_andamento (PK)
        - descricao_andamento (Em desmontagem, Liberado para orçamento, Aguardando aprovação, Em produção, Entregue ao cliente, Não aprovado, Sucateado, Pronto para entrega )
    
    - Tabela tipo_servico:
        - id_tipo_servico (PK)
        - descricao_servico (Mecânica, Eletrica, Pintura)
    
    - Tabela Ordem de Serviço - ordens_servico:
        - id_os (PK)
        - id_motor 
        - data_entrada
        - observacoes_gerais
        - id_causa_queima
        - id_andamento

    - Tabela os_itens_servico:
        - id_item_os (PK)
        - id_os 
        - id_tipo_servico 
        - id_grupo_material
        - descricao_componente
        - servico_realizado
        - quantidade
        - valor_unitario
        - subtotal
   
    - Tabela faturamento:
        - id_faturamento (PK)
        - id_os
        - valor_servico
        - data_vencimento
        - status_pagamento (Pendente, Pago)
        - data_pagamento
        - valor_desconto
        - valor_pagamento
    
    - Tabela perfis_acesso:
        - id_perfil (PK)
        - nome_perfil (Administrador, Recepcao, Mecanico, Eletricista)
        
    -Tabela usuarios
        - id_usuario (PK)
        - nome_completo
        - email
        - id_perfil
        - data_criacao
        - ativo (S/N)
  