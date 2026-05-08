# Apresentação — Aula 01: Projeto Exemplo do Zero

> Formato: Slides em Markdown (compatível com Marp, Slidev, reveal.js)
> Para usar com Marp, adicione o front matter abaixo e instale a extensão Marp no VS Code.

---
marp: true
theme: default
paginate: true
backgroundColor: #1a1a2e
color: #eee
style: |
  section { font-family: 'Segoe UI', sans-serif; }
  h1 { color: #d97757; }
  h2 { color: #e8a87c; }
  code { background: #16213e; padding: 2px 8px; border-radius: 4px; }
  table { font-size: 0.85em; }
  a { color: #d97757; }
---

<!-- slide 1 -->
# Curso de Claude Code
## Encontro 1 — Projeto Exemplo do Zero

**Pandô APPs**

Construa seu primeiro projeto completo com IA

---

<!-- slide 2 -->
# Agenda do Encontro

1. Downloads e Instalação do Ambiente
2. Conhecendo o Claude Code
3. Primeiros Comandos
4. Construção do Projeto Exemplo
5. Boas Práticas de Prompt
6. Guia de Referência Rápida

**Duração estimada**: ~3 horas

---

<!-- slide 3 -->
# O que vamos instalar?

| Ferramenta | Para quê? |
|---|---|
| **Visual Studio Code** | Editor de código |
| **WSL** | Linux dentro do Windows |
| **Docker** | Containers para deploy |
| **Claude Code** | IA no terminal |

---

<!-- slide 4 -->
# Download — Visual Studio Code

**Link**: [visualstudio.microsoft.com/pt-br/downloads/](https://visualstudio.microsoft.com/pt-br/downloads/)

Opções importantes durante a instalação:
- Adicionar ao PATH
- "Abrir com Code" no menu de contexto

**Extensões obrigatórias**:
- WSL (Microsoft)
- Claude Code (Anthropic)

---

<!-- slide 5 -->
# Download — WSL

**Link**: [learn.microsoft.com/pt-br/windows/wsl/install](https://learn.microsoft.com/pt-br/windows/wsl/install)

**PowerShell como Administrador**:
```powershell
wsl --install
```

Reiniciar o computador e criar usuário/senha no Ubuntu.

**Verificar**:
```powershell
wsl --list --verbose
```

---

<!-- slide 6 -->
# Download — Docker Desktop

**Link**: [docker.com/get-started/](https://www.docker.com/get-started/)

- Marcar "Use WSL 2 instead of Hyper-V"
- Após instalar, habilitar integração com Ubuntu em Settings > Resources > WSL Integration

**Verificar**:
```bash
docker --version
docker run hello-world
```

---

<!-- slide 7 -->
# Download — Claude Code

**Link**: [code.claude.com/docs/en/quickstart](https://code.claude.com/docs/en/quickstart)

**PowerShell**:
```powershell
irm https://claude.ai/install.ps1 | iex
```

**WSL / Linux**:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

> Requer Git for Windows e uma conta Claude (Pro, Max, Team ou Enterprise)

---

<!-- slide 8 -->
# Primeiro Login

```bash
claude
```

- Na primeira execução, será solicitado o login
- Siga as instruções na tela
- Credenciais ficam salvas para próximas sessões

Para trocar de conta depois:
```
/login
```

---

<!-- slide 9 -->
# O que é o Claude Code?

- Assistente de IA que vive no **terminal**
- Lê seus arquivos automaticamente
- Escreve, edita e explica código
- Usa Git, roda testes, faz debug
- Funciona com **linguagem natural**

> Pense nele como um colega de equipe que sabe programar e está sempre disponível.

---

<!-- slide 10 -->
# Comandos Essenciais

| Comando | O que faz |
|---|---|
| `claude` | Modo interativo |
| `claude "tarefa"` | Tarefa pontual |
| `claude -p "pergunta"` | Consulta rápida |
| `claude -c` | Continuar conversa |
| `/help` | Ajuda |
| `/clear` | Limpar contexto |
| `exit` ou `Ctrl+D` | Sair |

---

<!-- slide 11 -->
# Ciclo de Trabalho

```
DESCREVA → ANALISE → PROPONHA → APROVE → EXECUTE → VALIDE
```

1. **Descreva** o que você quer em linguagem natural
2. O Claude **analisa** os arquivos do projeto
3. **Propõe** mudanças no código
4. Você **revisa e aprova** (ou pede ajustes)
5. O Claude **aplica** as mudanças
6. Você **testa** e itera se necessário

---

<!-- slide 12 -->
# Mão na Massa: Criando o Projeto

```bash
mkdir ~/meu-projeto-todo
cd ~/meu-projeto-todo
claude
```

**Prompt**:
```
crie um projeto de lista de tarefas (to-do list) com:
1. Backend em Node.js com Express
2. Frontend em HTML, CSS e JavaScript puro
3. Banco de dados SQLite
4. API REST (criar, listar, atualizar, deletar)
5. Interface limpa e responsiva
6. docker-compose.yml para rodar o projeto
```

---

<!-- slide 13 -->
# Entendendo o que foi gerado

Pergunte ao Claude:

```
explique a estrutura de arquivos que você criou
```

```
como o frontend se comunica com o backend?
```

```
quais endpoints foram criados na API?
```

> O Claude lê seus arquivos automaticamente. Não precisa copiar e colar código.

---

<!-- slide 14 -->
# Rodando o Projeto

**Com Docker**:
```bash
docker-compose up
```

**Sem Docker**:
```bash
npm install
npm start
```

Acesse no navegador: `http://localhost:3000`

---

<!-- slide 15 -->
# Fazendo Melhorias

```
adicione a funcionalidade de marcar tarefas como concluídas
```

```
adicione validação para não permitir tarefas com texto vazio
```

```
melhore o visual com um tema escuro
```

> Itere com o Claude até o resultado ficar como você quer!

---

<!-- slide 16 -->
# Versionando com Git

```
inicialize um repositório git e faça o primeiro commit
```

```
quais arquivos foram modificados?
```

```
faça commit das minhas mudanças
```

O Claude entende Git nativamente e cria commits com mensagens descritivas.

---

<!-- slide 17 -->
# Boas Práticas de Prompt

### Ruim vs. Bom

| Ruim | Bom |
|---|---|
| "arrume o bug" | "corrija o bug onde o formulário aceita campos vazios" |
| "faça o site" | "crie uma página de cadastro com campos nome, email e senha" |
| "melhore o código" | "refatore calcularTotal() para usar async/await" |

---

<!-- slide 18 -->
# Boas Práticas de Prompt (cont.)

### Use etapas para tarefas complexas:

```
1. crie a tabela de usuários no banco
2. crie um endpoint POST /api/usuarios
3. crie um formulário de cadastro
4. conecte o formulário ao endpoint
```

### Deixe o Claude entender primeiro:

```
analise o módulo de autenticação
```
Depois:
```
agora adicione suporte a login com Google
```

---

<!-- slide 19 -->
# Atalhos Úteis

| Atalho | Ação |
|---|---|
| `?` | Ver todos os atalhos |
| `Tab` | Autocompletar |
| `↑` | Histórico de comandos |
| `/` | Ver comandos e skills |
| `Ctrl+C` | Cancelar operação |
| `Ctrl+D` | Sair |

---

<!-- slide 20 -->
# Checklist de Entregáveis

- [ ] VS Code instalado
- [ ] WSL instalado e configurado
- [ ] Docker Desktop funcionando
- [ ] Claude Code instalado e autenticado
- [ ] Projeto To-Do List funcional
- [ ] Repositório Git com primeiro commit

---

<!-- slide 21 -->
# Fluxo Diário Resumido

```bash
cd ~/meu-projeto        # Navegar até o projeto
claude                   # Iniciar Claude Code
> o que mudou?           # Ver estado atual
> adicione feature X     # Trabalhar
> rode os testes         # Testar
> faça commit            # Salvar
> exit                   # Sair
```

---

<!-- slide 22 -->
# Recursos

- **Documentação**: [code.claude.com/docs](https://code.claude.com/docs)
- **Discord**: [anthropic.com/discord](https://www.anthropic.com/discord)
- **Ajuda**: `/help` dentro do Claude Code

---

<!-- slide 23 -->
# Próximo Encontro

## Aula 02 — Stack Completa de um Projeto

- Análise detalhada da arquitetura
- Vocabulário técnico essencial
- Frontend, Backend, Banco de Dados
- Prompts por camada da aplicação

**Até lá, pratique! Use o Claude Code para explorar e melhorar o projeto.**

---

<!-- slide 24 -->
# Obrigado!

**Pandô APPs**

Dúvidas? Abra o Claude Code e pergunte!

```
/help
```
