# Mapa de Telas Operacionais - V2.2 (Mobile)
**Arquitetura Oficial:** Ionic React + Vite + TypeScript (Diretório: `/mobile/src/`)
**Estado Geral:** Estrutura base implementada; em fase de adequação estrita de regras de negócio (Backend V2.2).

## 1. Login e Autenticação
* **Arquivo:** `src/pages/Login.tsx`
* **Ações:** Autenticação, armazenamento seguro de token, definição de escopo de permissões.
* **Endpoints:** `POST /api/token/`
* **Estado:** Integrado à API com validação JWT.

## 2. Avaliador (Inspeção Inicial)
* **Arquivo:** `src/pages/Avaliador.tsx` (A ser unificado ou renderizado via Home dinamicamente)
* **Ações:** Fila de avaliação, checklist de inspeção de entrada, registro de ocorrências primárias, upload de fotografias. Encaminhamento para a Oficina.
* **Endpoints:** `GET /v1/concessionaria/veiculos/?status=AVALIADOR`, `POST /v1/concessionaria/ocorrencias/`
* **Regras de Negócio:** Cria apenas a ocorrência (avaria), sem gerar serviço automático.

## 3. Oficina Mecânica
* **Arquivo:** `src/pages/Oficina.tsx`
* **Ações:** Fila de veículos por unidade (Gran Via, Eurovia, Piedade). Reavaliação, solicitação de peças/serviços, registro de execução.
* **Endpoints:** `GET /v1/concessionaria/veiculos/?status=OFICINA`, `POST /v1/concessionaria/servicos/`
* **Regras de Negócio:** Serviços que exigem autorização ficam bloqueados para execução até aprovação administrativa.

## 4. Qualidade Pós-Oficina (Intermediária)
* **Arquivo:** `src/pages/QualidadePos.tsx`
* **Ações:** Inspeção dos serviços concluídos pela oficina. Aprovação, reprovação, geração de novas ocorrências e devolução para correção.
* **Endpoints:** `GET /v1/concessionaria/veiculos/?status=QUALIDADE_POS`, `POST /v1/concessionaria/inspecoes/`
* **Regras de Negócio:** Passagem obrigatória. O veículo não pode pular para a Lavagem sem aprovação nesta etapa.

## 5. Lavagem
* **Arquivo:** `src/pages/Lavagem.tsx`
* **Ações:** Fila exclusiva de veículos liberados. Registro de início, conclusão e observações.
* **Endpoints:** `GET /v1/concessionaria/veiculos/?status=LAVAGEM`, `PATCH /v1/concessionaria/lavagem/{id}/`
* **Regras de Negócio:** Visibilidade restrita aos veículos previamente validados pela Qualidade Pós-Oficina.

## 6. Qualidade Final
* **Arquivo:** `src/pages/QualidadeFinal.tsx`
* **Ações:** Inspeção pós-lavagem e decisão final.
* **Endpoints:** `GET /v1/concessionaria/veiculos/?status=QUALIDADE_FINAL`
* **Regras de Negócio:** Última barreira antes da liberação do veículo para a Loja/Showroom.

## 7. Serviço Externo (Auxiliar Operacional)
* **Arquivo:** `src/pages/ServicoExterno.tsx`
* **Ações:** Fila de demandas ordenada por prioridade/FIFO. Registro de início, impedimentos e conclusão com fotos.
* **Endpoints:** `GET /v1/concessionaria/demandas_externas/`
* **Regras de Negócio:** Histórico de falhas ou recusas preservado incondicionalmente no banco.

## 8. Detalhes do Veículo e Histórico
* **Arquivo:** `src/pages/DetalhesVeiculo.tsx`
* **Ações:** Consulta unificada de ocorrências, fotos, serviços, autorizações e rastreabilidade (HistoricoEvento).
* **Endpoints:** `GET /v1/concessionaria/veiculos/{id}/historico/`