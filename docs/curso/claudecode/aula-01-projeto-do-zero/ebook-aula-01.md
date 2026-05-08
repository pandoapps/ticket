# Aula 01 — Projeto Exemplo do Zero

## Curso de Claude Code — Pandô APPs

---

## Sumário

1. [Introdução](#1-introdução)
2. [Pré-requisitos e Downloads](#2-pré-requisitos-e-downloads)
3. [Instalação do Visual Studio Code](#3-instalação-do-visual-studio-code)
4. [Instalação do WSL (Windows Subsystem for Linux)](#4-instalação-do-wsl-windows-subsystem-for-linux)
5. [Instalação do Docker Desktop](#5-instalação-do-docker-desktop)
6. [Instalação do Claude Code](#6-instalação-do-claude-code)
7. [Primeiros Comandos e Fluxo de Desenvolvimento](#7-primeiros-comandos-e-fluxo-de-desenvolvimento)
8. [Construção Guiada do Projeto Exemplo](#8-construção-guiada-do-projeto-exemplo)
9. [Boas Práticas Iniciais de Prompt](#9-boas-práticas-iniciais-de-prompt)
10. [Guia de Referência Rápida](#10-guia-de-referência-rápida)
11. [Checklist de Entregáveis](#11-checklist-de-entregáveis)

---

## 1. Introdução

Bem-vindo ao primeiro encontro do curso de Claude Code! Nesta aula, você vai instalar todas as ferramentas necessárias, entender o ciclo de trabalho com IA e construir um projeto completo do zero usando o Claude Code.

Ao final desta aula, você terá:
- Ambiente completamente configurado
- Um projeto funcional criado com auxílio de IA
- Familiaridade com os comandos essenciais

---

## 2. Pré-requisitos e Downloads

Antes de começar, faça o download de todas as ferramentas necessárias. Recomendamos que todos baixem os instaladores **antes** da aula para economizar tempo.

### Ferramentas Necessárias

| Ferramenta | Link de Download | Finalidade |
|---|---|---|
| **Visual Studio Code** | [https://visualstudio.microsoft.com/pt-br/downloads/](https://visualstudio.microsoft.com/pt-br/downloads/) | Editor de código principal |
| **WSL (Windows Subsystem for Linux)** | [https://learn.microsoft.com/pt-br/windows/wsl/install](https://learn.microsoft.com/pt-br/windows/wsl/install) | Ambiente Linux dentro do Windows |
| **Docker Desktop** | [https://www.docker.com/get-started/](https://www.docker.com/get-started/) | Containerização de aplicações |
| **Claude Code** | [https://code.claude.com/docs/en/quickstart](https://code.claude.com/docs/en/quickstart) | Assistente de IA para desenvolvimento |

### Requisitos de Sistema

- **Sistema Operacional**: Windows 10 versão 2004+ ou Windows 11
- **RAM**: Mínimo 8 GB (recomendado 16 GB)
- **Espaço em disco**: Pelo menos 20 GB livres
- **Conexão com a internet**: Necessária para instalação e uso do Claude Code
- **Conta Claude**: Assinatura Pro, Max, Team ou Enterprise ([claude.com/pricing](https://claude.com/pricing))

---

## 3. Instalação do Visual Studio Code

O Visual Studio Code (VS Code) será nosso editor de código principal durante todo o curso.

### Passo a Passo

1. Acesse [https://visualstudio.microsoft.com/pt-br/downloads/](https://visualstudio.microsoft.com/pt-br/downloads/)
2. Clique em **"Download gratuito"** na seção do Visual Studio Code
3. Execute o instalador baixado
4. Durante a instalação, marque as opções:
   - "Adicionar ao PATH" (importante!)
   - "Registrar Code como editor para tipos de arquivo suportados"
   - "Adicionar ação 'Abrir com Code' ao menu de contexto de arquivo"
   - "Adicionar ação 'Abrir com Code' ao menu de contexto de diretório"
5. Conclua a instalação e abra o VS Code

### Extensões Recomendadas

Após instalar o VS Code, instale estas extensões:

- **WSL** (Microsoft) — permite trabalhar com o WSL de dentro do VS Code
- **Claude Code** (Anthropic) — integração do Claude Code ao VS Code
- **Portuguese (Brazil) Language Pack** — interface em português

Para instalar extensões: clique no ícone de extensões na barra lateral (ou `Ctrl+Shift+X`) e pesquise pelo nome.

---

## 4. Instalação do WSL (Windows Subsystem for Linux)

O WSL permite rodar um ambiente Linux diretamente no Windows, o que é essencial para desenvolvimento moderno.

### Passo a Passo

1. Acesse a documentação oficial: [https://learn.microsoft.com/pt-br/windows/wsl/install](https://learn.microsoft.com/pt-br/windows/wsl/install)

2. **Abra o PowerShell como Administrador** (clique direito no menu Iniciar > "Terminal (Admin)")

3. Execute o comando:
   ```powershell
   wsl --install
   ```

4. **Reinicie o computador** quando solicitado

5. Após reiniciar, o Ubuntu será instalado automaticamente. Uma janela pedirá para criar um **usuário e senha** para o Linux. Anote essas credenciais!

6. Para verificar a instalação, abra o PowerShell e execute:
   ```powershell
   wsl --list --verbose
   ```

### Configuração do VS Code com WSL

1. Abra o VS Code
2. Pressione `Ctrl+Shift+P` e digite "WSL: Connect to WSL"
3. O VS Code vai se conectar ao ambiente Linux
4. Agora você pode usar o terminal Linux diretamente no VS Code

### Dica Importante

Sempre que for trabalhar em projetos, prefira armazenar os arquivos dentro do WSL (em `/home/seu-usuario/`) ao invés da pasta do Windows. Isso garante melhor performance.

---

## 5. Instalação do Docker Desktop

O Docker permite criar e gerenciar containers, facilitando a configuração de ambientes de desenvolvimento e produção.

### Passo a Passo

1. Acesse [https://www.docker.com/get-started/](https://www.docker.com/get-started/)
2. Clique em **"Download Docker Desktop"** para Windows
3. Execute o instalador
4. Durante a instalação, certifique-se de que a opção **"Use WSL 2 instead of Hyper-V"** esteja marcada
5. Conclua a instalação e reinicie o computador se necessário
6. Abra o Docker Desktop e aceite os termos de uso

### Verificação

Abra o terminal (WSL ou PowerShell) e execute:
```bash
docker --version
docker run hello-world
```

Se você vir a mensagem "Hello from Docker!", a instalação está correta.

### Integração com WSL

O Docker Desktop se integra automaticamente com o WSL. Para confirmar:
1. Abra as configurações do Docker Desktop
2. Vá em **Resources > WSL Integration**
3. Certifique-se de que a distribuição Ubuntu está habilitada

---

## 6. Instalação do Claude Code

O Claude Code é a ferramenta principal do nosso curso — um assistente de IA que vive no seu terminal e ajuda a escrever, entender e manter código.

### Passo a Passo — Instalação no Windows

**Via PowerShell:**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**Via CMD:**
```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

> **Importante**: A instalação no Windows requer o [Git for Windows](https://git-scm.com/downloads/win). Instale-o antes se não tiver.

### Passo a Passo — Instalação no WSL/Linux

Dentro do terminal WSL, execute:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Primeiro Login

1. Abra o terminal e execute:
   ```bash
   claude
   ```

2. Na primeira execução, você será solicitado a fazer login
3. Siga as instruções na tela para autenticar com sua conta Claude
4. Após o login, suas credenciais ficam salvas e você não precisará logar novamente

### Verificação

Se tudo estiver correto, ao digitar `claude` no terminal, você verá a tela de boas-vindas do Claude Code com informações da sessão.

---

## 7. Primeiros Comandos e Fluxo de Desenvolvimento

Agora que tudo está instalado, vamos entender como o Claude Code funciona na prática.

### Comandos Essenciais

| Comando | O que faz | Exemplo |
|---|---|---|
| `claude` | Inicia o modo interativo | `claude` |
| `claude "tarefa"` | Executa uma tarefa pontual | `claude "corrija o erro de build"` |
| `claude -p "pergunta"` | Faz uma consulta e sai | `claude -p "explique essa função"` |
| `claude -c` | Continua a conversa mais recente | `claude -c` |
| `claude -r` | Retoma uma conversa anterior | `claude -r` |
| `/clear` | Limpa o histórico da conversa | `/clear` |
| `/help` | Mostra comandos disponíveis | `/help` |
| `exit` ou `Ctrl+D` | Sai do Claude Code | `exit` |

### Ciclo de Trabalho

O fluxo de desenvolvimento com Claude Code segue este ciclo:

```
1. DESCREVA → Diga ao Claude o que você quer fazer (em linguagem natural)
2. ANALISE  → O Claude lê seus arquivos e entende o contexto
3. PROPONHA → O Claude sugere mudanças no código
4. APROVE   → Você revisa e aprova (ou pede ajustes)
5. EXECUTE  → O Claude aplica as mudanças
6. VALIDE   → Teste o resultado e itere se necessário
```

### Primeira Interação

Abra o Claude Code no diretório do seu projeto e tente:

```
o que este projeto faz?
```

O Claude vai analisar seus arquivos e dar um resumo. Experimente também:

```
quais tecnologias este projeto usa?
```

```
explique a estrutura de pastas
```

---

## 8. Construção Guiada do Projeto Exemplo

Vamos construir juntos um projeto completo: uma **aplicação web de lista de tarefas (To-Do List)** com frontend, backend e banco de dados.

### Passo 1: Criar a estrutura do projeto

Abra o terminal WSL e execute:

```bash
mkdir ~/meu-projeto-todo
cd ~/meu-projeto-todo
claude
```

Dentro do Claude Code, diga:

```
crie um projeto de lista de tarefas (to-do list) com as seguintes características:
1. Backend em Node.js com Express
2. Frontend em HTML, CSS e JavaScript puro
3. Banco de dados SQLite
4. API REST com endpoints para criar, listar, atualizar e deletar tarefas
5. Interface limpa e responsiva
6. Arquivo docker-compose.yml para rodar o projeto
```

### Passo 2: Entender o que foi gerado

Após o Claude gerar o código, peça explicações:

```
explique a estrutura de arquivos que você criou
```

```
como o frontend se comunica com o backend?
```

### Passo 3: Testar o projeto

Peça ao Claude para ajudar a rodar:

```
como faço para rodar este projeto localmente?
```

Se estiver usando Docker:
```bash
docker-compose up
```

Se estiver rodando diretamente:
```bash
npm install
npm start
```

### Passo 4: Fazer melhorias

Agora que o projeto básico funciona, peça melhorias:

```
adicione a funcionalidade de marcar tarefas como concluídas
```

```
adicione validação para não permitir tarefas com texto vazio
```

```
melhore o visual da interface com cores mais modernas
```

### Passo 5: Usar Git para versionar

```
inicialize um repositório git e faça o primeiro commit
```

---

## 9. Boas Práticas Iniciais de Prompt

A qualidade das suas instruções (prompts) determina a qualidade do código gerado. Aqui estão as práticas mais importantes:

### Seja Específico

| Ruim | Bom |
|---|---|
| "arrume o bug" | "corrija o bug na tela de login onde o usuário vê uma tela branca após digitar credenciais erradas" |
| "faça o site" | "crie uma página HTML com um formulário de cadastro contendo campos nome, email e senha" |
| "melhore o código" | "refatore a função calcularTotal() para usar async/await em vez de callbacks" |

### Use Instruções Passo a Passo

Para tarefas complexas, quebre em etapas:

```
1. crie uma tabela de usuários no banco de dados com campos: id, nome, email, criado_em
2. crie um endpoint POST /api/usuarios para cadastrar novos usuários
3. crie um formulário HTML para cadastrar usuários
4. conecte o formulário ao endpoint da API
```

### Deixe o Claude Explorar Primeiro

Antes de pedir mudanças, peça ao Claude para entender o código:

```
analise o módulo de autenticação e me diga como ele funciona
```

Depois:

```
agora adicione suporte a login com Google OAuth
```

### Peça Explicações

Sempre que não entender algo:

```
explique o que essa função faz, linha por linha
```

```
por que você escolheu essa abordagem?
```

### Itere

Não espere que o primeiro resultado seja perfeito. Itere:

```
bom, mas o botão deveria ficar à direita e o texto mais centralizado
```

---

## 10. Guia de Referência Rápida

### Atalhos de Teclado no Claude Code

| Atalho | Ação |
|---|---|
| `?` | Ver todos os atalhos disponíveis |
| `Tab` | Autocompletar comandos |
| `↑` | Histórico de comandos |
| `/` | Ver todos os comandos e skills |
| `Ctrl+D` | Sair do Claude Code |
| `Ctrl+C` | Cancelar operação atual |

### Comandos Slash Mais Usados

| Comando | Descrição |
|---|---|
| `/help` | Ajuda e comandos disponíveis |
| `/clear` | Limpa o contexto da conversa |
| `/login` | Fazer login ou trocar de conta |
| `/resume` | Retomar conversa anterior |
| `/commit` | Criar commit das mudanças |

### Fluxo Diário Resumido

```bash
# 1. Navegar até o projeto
cd ~/meu-projeto

# 2. Iniciar o Claude Code
claude

# 3. Pedir para entender o estado atual
> o que mudou desde o último commit?

# 4. Trabalhar nas tarefas
> adicione a feature X...

# 5. Testar
> rode os testes

# 6. Commitar
> faça commit das minhas mudanças com uma mensagem descritiva

# 7. Sair
> exit
```

---

## 11. Checklist de Entregáveis

Ao final desta aula, confirme que você completou todos os itens:

- [ ] **Visual Studio Code** instalado e funcionando
- [ ] **WSL** instalado com Ubuntu configurado
- [ ] **Docker Desktop** instalado e integrado ao WSL
- [ ] **Claude Code** instalado e autenticado
- [ ] **Extensão WSL** instalada no VS Code
- [ ] **Projeto exemplo** (To-Do List) criado e funcional
- [ ] **Repositório Git** inicializado com primeiro commit
- [ ] Consegue iniciar o Claude Code e fazer perguntas
- [ ] Entende o ciclo: descrever → analisar → propor → aprovar → executar

---

## Recursos Adicionais

- **Documentação do Claude Code**: [code.claude.com/docs](https://code.claude.com/docs)
- **Comunidade Discord**: [anthropic.com/discord](https://www.anthropic.com/discord)
- **Dentro do Claude Code**: Digite `/help` a qualquer momento

---

> **Próxima Aula**: No Encontro 2, vamos mergulhar na stack completa do projeto, entender a arquitetura gerada e construir nosso vocabulário técnico.
