export const materialContent: Record<number, string> = {
  1: `# Material Complementar — Aula 1
## Projeto Exemplo do Zero

Bem-vindo ao seu guia completo da primeira aula! Aqui você encontra uma explicação aprofundada de cada slide, cada conceito e cada ferramenta que foi apresentada. Esse material foi escrito pensando em quem está começando agora — sem jargões desnecessários, com muitos exemplos do mundo real.

Leia com calma. Você pode voltar aqui sempre que tiver dúvidas.

---

## O que é este curso, afinal?

Antes de entrar nos slides, é importante entender o que você está aprendendo — e por quê.

**Este não é um curso tradicional de programação.** Você não vai decorar sintaxe de código. Não vai aprender que \`for i in range(10)\` significa "repita 10 vezes". Você não vai virar um programador no sentido clássico da palavra.

**O que você vai aprender:** Como usar Inteligência Artificial para criar softwares reais, funcionais e publicados na internet — descrevendo o que quer em português, sem escrever código manualmente.

Isso tem um nome: **Vibe Coding**. É uma forma de programar onde você define a intenção, a IA executa, e você revisa o resultado. O papel do programador mudou: de "quem escreve código" para "quem sabe o que pedir e como avaliar o resultado".

---

## As 4 formas de usar Inteligência Artificial

Você já usa IA no dia a dia, provavelmente sem perceber. Mas há diferentes maneiras de interagir com ela — cada uma com um nível de poder e complexidade diferente.

### 💬 1. Conversacional

**O que é:** Você digita uma pergunta ou pedido e a IA responde em texto. É o modelo que a maioria das pessoas já conhece.

**Exemplos:** ChatGPT, Claude (pelo site claude.ai), Gemini, Copilot do Microsoft 365.

**O que você pode fazer:** Tirar dúvidas, rascunhar textos, pedir explicações, gerar ideias, resumir documentos, traduzir textos.

**O que não pode fazer:** A IA apenas *responde* — ela não age no seu computador. Ela não pode criar arquivos, instalar programas ou acessar a internet por conta própria (a menos que tenha essa funcionalidade específica habilitada).

**Analogia:** É como mandar uma mensagem no WhatsApp para um especialista muito inteligente. Ele responde com a melhor orientação possível, mas quem vai executar é você.

---

### 🤝 2. Co-work

**O que é:** A IA fica incorporada dentro do seu editor de código e acompanha o que você está fazendo em tempo real.

**Exemplos:** GitHub Copilot (usado dentro do VS Code), Cursor (editor de código com IA integrada), Windsurf.

**O que você pode fazer:** Escrever uma linha e a IA completa o resto. Selecionar um bloco de código e pedir pra ela explicar. Descrever o que quer e ela gera o código no lugar certo.

**O que não pode fazer:** Ela não executa ações fora do editor. Não instala pacotes, não sobe servidores, não cria bancos de dados.

**Analogia:** É como ter um colega desenvolvedor sentado do seu lado que olha para o mesmo monitor que você e vai sugerindo enquanto você digita.

---

### ⌨️ 3. CLI — Linha de Comando

**O que é:** A IA roda no terminal do seu computador e executa ações reais — não apenas sugere.

**Exemplo:** **Claude Code** — que é a ferramenta principal deste curso.

**O que você pode fazer:** Criar arquivos inteiros, instalar dependências, rodar testes, modificar banco de dados, publicar em produção. Tudo isso descrevendo em linguagem natural o que quer.

**Por que isso é mais poderoso:** A IA não apenas fala o que fazer — ela *faz*. Você aprova cada ação antes de ser executada, mas quem executa é ela.

**Analogia:** É como contratar um desenvolvedor sênior que mora na sua empresa. Você descreve a tarefa, ele vai lá e faz — e te mostra o resultado para você aprovar.

> **O que é o terminal?** É a tela de texto que programadores usam para interagir com o computador através de comandos digitados. Parece intimidadora no começo, mas é simplesmente uma outra forma de "conversar com o computador" — mais direta e poderosa do que clicar em botões.

> **O que é CLI?** Vem de *Command Line Interface* (Interface de Linha de Comando). É qualquer ferramenta que você usa pelo terminal digitando comandos de texto.

> ⭐ **É dessa forma que trabalharemos durante todo o curso.** O Claude Code roda no terminal e executa ações reais no seu projeto — criar arquivos, instalar pacotes, rodar migrações, publicar em produção. Você descreve o que quer em português, ele executa e aguarda sua aprovação.

---

### 🔌 4. API

**O que é:** Você integra a IA diretamente dentro do seu próprio produto, usando código.

**Exemplos:** Um chatbot de atendimento que usa a API da Anthropic, um sistema que gera descrições de produtos automaticamente, uma ferramenta de análise de contratos com IA.

**Quando usar:** Quando você quer que *seus clientes* usem a IA dentro do produto que você criou — sem precisar saber que é IA por baixo.

**Analogia:** Em vez de ir ao restaurante (usar o ChatGPT), você compra os ingredientes e cozinha na sua cozinha (usa a API). Você tem controle total de como servir, com quais temperos, em qual quantidade.

> **Nota:** Usar APIs requer conhecimento de programação. Isso não é o foco desta aula, mas você vai entender isso melhor nas aulas seguintes.

---

## Parte 01 — Quando Criar um Projeto

Esta foi uma das seções mais importantes da aula — e provavelmente a menos técnica. Mas é onde a maioria das pessoas falha.

**Criar um software é fácil.** Com Claude Code, em horas você tem algo funcionando. O problema é saber *o que* criar e *por que*.

A lição do slide foi: antes de abrir o computador, responda honestamente a estas 5 perguntas:

---

### ✅ 1. Você consegue descrever o projeto em uma frase?

Se você precisa de 3 parágrafos para explicar o que o projeto faz, ele ainda não está maduro o suficiente. Projetos bem definidos têm uma frase clara:

- ✅ *"Uma plataforma para pequenos produtores de eventos venderem ingressos online"*
- ✅ *"Um sistema para gestão de agendamentos de barbearia com pagamento integrado"*
- ❌ *"Uma plataforma completa que conecta pessoas, empresas, freelancers, tem IA, marketplace, comunidade e blog..."*

O último exemplo é o que chamamos de **projeto frankenstein** — cresce em todas as direções e nunca fica pronto.

---

### ✅ 2. Existe uma oportunidade real e validada?

Ter uma ideia é diferente de ter um problema que pessoas reais querem resolver e estão dispostas a pagar.

**Como validar:**
- Converse com 10 possíveis usuários antes de construir qualquer coisa
- Pergunte se eles têm esse problema
- Pergunte como resolvem hoje
- Pergunte se pagariam por uma solução melhor

Se a resposta for "sim" para a maioria — você tem uma oportunidade. Se for "talvez" ou "não sei" — talvez o problema não seja tão urgente assim.

**Regra de ouro:** Dinheiro resolve dúvida. Se alguém pagou antes de você construir, a oportunidade é real.

---

### ✅ 3. É financeiramente inteligente fazer isso?

Construir software consome tempo. Tempo é dinheiro. Faça as contas:

- Quanto tempo vai levar para construir?
- Quanto vai custar (servidor, domínio, ferramentas)?
- Quantos clientes precisa para pagar o custo?
- Em quanto tempo consegue esses clientes?

Se os números não fecham, talvez seja melhor vender um serviço primeiro e automatizá-lo depois.

---

### ✅ 4. Você sabe quem vai usar e como?

Um software sem usuário claro não existe de fato. Defina:

- **Quem:** Idade, profissão, contexto. Não "todo mundo" — seja específico.
- **O que fazem:** Quais ações realizam no sistema?
- **Por que usariam:** Qual problema resolve para eles?

**Exemplo ruim:** "Meu sistema é para todo mundo que quiser usar"

**Exemplo bom:** "Meu sistema é para donos de barbearia com até 3 funcionários, que hoje usam caderno ou WhatsApp para agendar, e perdem clientes porque não conseguem organizar a agenda"

---

### ✅ 5. (A MAIS IMPORTANTE) Você sabe como distribuir?

Esse é o ponto onde 90% dos projetos falham. Você pode construir o melhor software do mundo — se ninguém souber que ele existe, ele é inútil.

**Distribuição é:** Como as pessoas vão descobrir seu produto?

- SEO (Google)?
- Anúncios pagos?
- Instagram / TikTok?
- Indicação boca a boca?
- Parceria com outras empresas?
- Comunidades online?

Se você não tem uma resposta clara para essa pergunta, pare de criar e pense primeiro em distribuição.

---

### Os exemplos de projetos ruins dos slides

**"Odeio Mercado Livre, vou criar um marketplace com taxa 0"**

O problema não é a ideia de um marketplace melhor. O problema é que marketplaces dependem de massa crítica: vendedores só entram se tiver compradores, compradores só entram se tiver vendedores. Para romper esse ciclo, você precisa de investimento massivo em marketing e subsídios iniciais. Sem capital, a ideia morre na largada. Além disso, taxa 0 significa sem receita — como você vai pagar os custos?

---

**"Vou criar automação para lâmpadas de natal dos esquimós"**

Alguém te pediu isso? Não?! Então pare de tomar as dores que você inventou e nem sabe se são verdadeiras.

O público é inexistente. Esquimós vivem em regiões com inverno extremo e sem infraestrutura elétrica adequada para lâmpadas decorativas. Mesmo que fosse tecnicamente possível, o mercado é zero. Nenhuma validação de mercado teria aprovado essa ideia.

---

**"Nenhum sistema serve para minha padaria, vou criar o meu"**

Este é o mais perigoso — porque parece razoável. A realidade: criar um sistema de gestão do zero é 100x mais caro e demorado do que contratar um sistema pronto (como Nuvemshop, Bling, ou sistemas específicos para padaria). Na maioria dos casos, o problema real é que o dono não dedicou tempo suficiente para aprender a usar as ferramentas existentes.

---

## Parte 02 — Escopando um Projeto

Depois de validar a ideia, vem o escopo — definir exatamente o que o projeto vai incluir e o que vai ficar de fora.

### Por que escopar?

Porque software cresce. Sempre. Alguém vai sugerir uma nova funcionalidade. O cliente vai pedir "só mais isso". Você mesmo vai ter ideias novas. Sem um escopo claro, o projeto nunca termina.

Em inglês, esse problema tem nome: **scope creep** — o escopo vai crescendo (*creeping*) até o projeto virar um monstro incontrolável.

---

### O Business Model Canvas

O slide mostrou um **Business Model Canvas** (Tela de Modelo de Negócio) — uma ferramenta visual criada por Alexander Osterwalder que permite mapear todo um negócio em uma única página.

É dividido em 9 blocos:

| Bloco | Pergunta que responde |
|-------|-----------------------|
| **Proposta de Valor** | O que você oferece que é especial? Por que alguém escolheria você? |
| **Segmentos de Clientes** | Para quem exatamente você está construindo isso? |
| **Canais** | Como você entrega valor e alcança seus clientes? |
| **Relacionamento com Clientes** | Como você interage com eles — suporte, comunidade, autoatendimento? |
| **Fontes de Receita** | Como você ganha dinheiro? Assinatura, por uso, comissão? |
| **Recursos-Chave** | O que você precisa ter para funcionar? (tecnologia, equipe, capital) |
| **Atividades-Chave** | O que você precisa *fazer* para funcionar? (desenvolver, vender, suportar) |
| **Parceiros-Chave** | Quem te ajuda a operar? (fornecedores, parceiros, APIs) |
| **Estrutura de Custos** | Quais são seus principais gastos? |

**Por que isso importa para o desenvolvimento?** Porque responder essas perguntas ajuda a definir as funcionalidades do sistema. Cada resposta vira uma tela ou uma regra de negócio.

---

### Os Estudos de Caso

Fizemos dois exercícios práticos com o mesmo template de perguntas:

1. **Qual o nome da plataforma?**
2. **Qual o problema que resolve?**
3. **Qual o público-alvo?**
4. **Como ganhar audiência com esse público?**

**Vó Sônia:** Um perfil de avó compartilhando receitas — o problema era alcançar pessoas que querem receitas tradicionais caseiras. O público é nostalgia + culinária. A audiência viria do Instagram e YouTube.

**Mancha Verde (Palmeiras):** Plataforma para torcedores organizados. O problema era organização de eventos, venda de produtos e comunicação. O público é específico e apaixonado — excelente para nicho. A audiência viria organicamente da própria torcida.

A lição: **públicos específicos são mais fáceis de alcançar do que públicos genéricos.** "Qualquer pessoa" não é um público. "Torcedores do Palmeiras na faixa de 18 a 35 anos que frequentam o estádio" é um público.

---

## Parte 03 — Criando as Interfaces

Antes de escrever uma linha de código, é muito mais inteligente criar **protótipos visuais** — rascunhos de como o sistema vai parecer.

### Por que prototipar primeiro?

- **Custo zero:** Mudar um protótipo leva segundos. Mudar código pode levar horas.
- **Validação rápida:** Você pode mostrar para usuários reais e ver se faz sentido.
- **Descoberta de problemas:** Você percebe que a navegação não faz sentido antes de construir.

### O que são atores do sistema?

Em qualquer sistema, existem diferentes tipos de usuário — cada um com permissões e funcionalidades diferentes. Chamamos esses tipos de **atores**.

**Exemplo da Ticketeira:**

| Ator | O que pode fazer |
|------|-----------------|
| **Admin** | Ver tudo, moderar produtores, configurar taxas, auditar o sistema |
| **Produtor** | Criar eventos, vender ingressos, ver relatórios de vendas |
| **Cliente** | Comprar ingressos, ver histórico, baixar ingresso com QR code |

Cada ator tem uma **jornada** — a sequência lógica de telas e ações que ele percorre para atingir seu objetivo.

**Jornada do cliente:**
1. Acessa a landing page
2. Busca por eventos
3. Clica num evento
4. Escolhe quantidade de ingressos
5. Preenche dados pessoais
6. Paga
7. Recebe ingresso digital no e-mail / WhatsApp

Definir essas jornadas antes de construir garante que você não vai esquecer nenhuma tela importante.

---

### Google AI Studio

O [Google AI Studio](https://aistudio.google.com/apps) é uma ferramenta do Google que, dado um prompt de texto bem estruturado, consegue gerar protótipos visuais funcionais de aplicações web.

Na aula, o fluxo foi:
1. Usar o **Gerador de Prompt de Telas** para criar um prompt estruturado
2. Enviar esse prompt para o Claude.ai para ele refinar
3. Enviar a resposta para o Google AI Studio para gerar as telas
4. Explorar as telas geradas e iterar

### O Gerador de Prompt de Telas

Preenchemos um formulário com:
- **Nome da plataforma:** Como vai se chamar
- **Objetivo:** O que ela faz em uma frase
- **Cores principais:** Paleta de cores do projeto
- **Atores e ações:** Quem usa e o que cada um faz

O prompt gerado automaticamente instrui a IA a criar um protótipo com:
- **Glass design** — efeito visual moderno de transparência e desfoque, como vidro
- **Responsive** — que funciona em celular, tablet e computador
- **Landing page** com botão de login
- **Painel administrativo** acessível pelo canto superior direito
- **Cards de acesso rápido** no formulário de login (para facilitar testes)

> **Glass design:** Estilo visual popularizado por apps modernos. Os elementos parecem feitos de vidro — com transparência, reflexos e desfoque do fundo. O iOS e o Windows 11 usam muito esse estilo.

---

### O Desafio Copa do Mundo (Figurinhas)

Antes da tarefa principal, fizemos um exercício com figurinhas da Copa do Mundo — para praticar o fluxo completo de criação usando o Google AI Studio. Foi uma forma descontraída de praticar sem a pressão de um projeto real.

> 🛠️
>
> Acesse o [Google AI Studio](https://aistudio.google.com/apps), clique em **Build → Apps** e descreva o seguinte projeto para a IA gerar as telas:
>
> *"Crie uma plataforma de compra e venda de figurinhas.*
>
> *Atores: Gestor - Pode gerenciar tudo que acontece na plataforma, configurar ASAAS, configurar FRENET e visualizar relatórios de faturamento da plataforma. Colecionador - Pode gerenciar seus anúncios e visualizar as compras e os pagamentos que já fez. Visitante - Pode visualizar todas as figurinhas que estão à venda e criar conta. Ao visualizar uma figurinha que ele manifesta interesse em comprar é convidado a criar conta e transforma-se em um colecionador.*
>
> *Crie uma landing page com os anúncios em destaque e uma breve explicação da plataforma. Crie um botão 'Ver todos' para que seja possível visualizar todas as figurinhas que estão sendo anunciadas.*
>
> *Os pagamentos serão feitos sempre via PIX. As cores principais serão azul metálico e amarelo. Use glass design nas telas."*
>
> Explore as telas geradas, navegue entre elas e observe como a IA interpretou o pedido. Se quiser, refine a descrição e gere novamente — perceba como pequenas mudanças no texto mudam bastante o resultado.

---

## Parte 04 — Instalação e Configuração do Ambiente

Para que o Claude Code funcione, precisamos preparar o computador com um conjunto de ferramentas. Veja o que cada uma faz na prática:

---

### 💻 VS Code — Visual Studio Code

**O que é:** O editor de código mais usado no mundo. Criado pela Microsoft e totalmente gratuito.

**Por que usamos:** Suporta todas as linguagens que usamos (JavaScript, TypeScript, PHP), tem terminal embutido e conta com milhares de extensões para facilitar o desenvolvimento.

**Analogia:** Pense no VS Code como o Microsoft Word dos programadores. Você escreve (código, não texto), formata, vê erros em tempo real, e tem ferramentas específicas para o que você está fazendo.

> 🛠️
>
> Acesse [code.visualstudio.com](https://code.visualstudio.com/download), baixe e instale o VS Code.

---

### 🐧 WSL — Windows Subsystem for Linux

**O que é:** Uma tecnologia da Microsoft que permite rodar o Linux *dentro* do Windows. Você não precisa formatar o computador, não precisa de dual-boot (dois sistemas no mesmo HD). O Linux roda numa janela, dentro do Windows.

**Por que precisamos:** Claude Code e a maioria das ferramentas de desenvolvimento funcionam melhor no Linux. O ambiente Linux tem gerenciadores de pacotes melhores, mais compatibilidade com servidores (que também rodam Linux) e convenções mais padronizadas.

**O que é o Linux:** É um sistema operacional gratuito e de código aberto. Enquanto o Windows e o macOS são fechados (criados e controlados por Microsoft e Apple, respectivamente), o Linux é mantido pela comunidade global. A grande maioria dos servidores de internet roda Linux — porque é estável, seguro e gratuito.

> 🛠️
>
> Abra o **PowerShell** como administrador (botão direito no ícone → "Executar como administrador") e rode:
>
> \`\`\`bash
> wsl --install
> \`\`\`
>
> Reinicie o computador. Depois de reiniciar, abra o VS Code, abra o terminal integrado (menu **Terminal → Novo Terminal**), digite \`wsl\` e pressione Enter. **Tudo daqui em diante é feito dentro do WSL.**

---

### 🐳 Docker (instalado dentro do WSL)

**O que é:** Uma ferramenta que cria **containers** — ambientes completamente isolados e portáteis onde partes da sua aplicação rodam.

**Por que usamos:**
- Sem Docker, instalar um banco de dados MySQL envolve configurar serviços, portas, permissões — complexo e propenso a erros.
- Com Docker, você roda \`docker run mysql\` e em segundos tem um banco funcionando, isolado, que não interfere em nada mais no seu computador.
- Quando você publicar o projeto no servidor, o Docker garante que vai rodar *exatamente igual* ao que rodava na sua máquina.

**Container vs. Máquina Virtual:** Uma máquina virtual simula um computador inteiro (com seu próprio sistema operacional). Um container é mais leve — compartilha o sistema operacional do host, mas isola o processo. É como a diferença entre uma casa inteira (VM) e um apartamento em condomínio (container): você tem seu espaço isolado, mas compartilha a estrutura do prédio.

**Analogia:** Containers são como tigelas com tampas herméticas: cada prato fica no seu espaço, não mistura com os outros, e você pode servir ou guardar cada um independentemente.

> 🛠️
>
> Com o terminal WSL aberto no VS Code, rode os comandos abaixo um a um:
>
> **1. Atualiza a lista de pacotes**
>
> \`\`\`bash
> sudo apt update
> \`\`\`
>
> **2. Instala dependências necessárias**
>
> \`\`\`bash
> sudo apt install -y ca-certificates curl gnupg lsb-release
> \`\`\`
>
> **3. Adiciona a chave oficial do Docker**
>
> \`\`\`bash
> sudo install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && sudo chmod a+r /etc/apt/keyrings/docker.gpg
> \`\`\`
>
> **4. Adiciona o repositório do Docker**
>
> \`\`\`bash
> echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
> \`\`\`
>
> **5. Instala o Docker**
>
> \`\`\`bash
> sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
> \`\`\`
>
> **6. Permite usar Docker sem precisar de sudo**
>
> \`\`\`bash
> sudo usermod -aG docker $USER && newgrp docker
> \`\`\`
>
> **7. Inicia o serviço do Docker**
>
> \`\`\`bash
> sudo service docker start
> \`\`\`
>
> **8. Confirma que instalou corretamente**
>
> \`\`\`bash
> docker --version
> \`\`\`

---

### 🤖 Claude Code

**O que é:** A ferramenta principal do curso. É a interface de linha de comando (CLI) da Anthropic que roda no terminal WSL e interage diretamente com o sistema de arquivos do seu computador.

**Como é diferente do Claude.ai:** No claude.ai (o site), a IA responde com texto. No Claude Code (terminal), a IA *executa ações reais*: cria arquivos, edita código, roda comandos, instala dependências.

**Custo:** Claude Code está disponível nos planos Pro e Max do Claude. No plano Max, o uso é mais generoso para projetos grandes.

> 🛠️
>
> Com o terminal WSL aberto, instale o Node.js via nvm e depois o Claude Code:
>
> **1. Baixa e instala o nvm (gerenciador de versões do Node.js)**
>
> \`\`\`bash
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
> \`\`\`
>
> **2. Recarrega o terminal para reconhecer o nvm**
>
> \`\`\`bash
> source ~/.bashrc
> \`\`\`
>
> **3. Instala a versão LTS do Node.js**
>
> \`\`\`bash
> nvm install --lts
> \`\`\`
>
> **4. Instala o Claude Code globalmente**
>
> \`\`\`bash
> npm install -g @anthropic-ai/claude-code
> \`\`\`
>
> **5. Inicia o Claude Code e faça login com sua conta Anthropic**
>
> \`\`\`bash
> claude
> \`\`\`

---

### 🛠️ Make — O Makefile

**O que é:** Uma ferramenta de automação que existe há décadas no mundo Unix/Linux. Permite criar atalhos para comandos complexos.

**Como funciona:** Você cria um arquivo chamado \`Makefile\` na raiz do projeto e define receitas com nomes curtos:

\`\`\`makefile
up:
    docker compose up -d

down:
    docker compose down

migrate:
    docker exec app php artisan migrate

deploy:
    git pull && docker compose build && docker exec app php artisan migrate --force
\`\`\`

Em vez de lembrar e digitar esses comandos longos, você simplesmente digita \`make up\`, \`make migrate\`, \`make deploy\`.

**Por que isso é valioso:**
- Padroniza comandos entre todos da equipe
- Reduz erros de digitação
- Claude Code usa o Makefile para entender como interagir com o projeto

> 🛠️
>
> Instale o Make dentro do WSL:
>
> \`\`\`bash
> sudo apt update
> \`\`\`
> \`\`\`bash
> sudo apt install make -y
> \`\`\`
> \`\`\`bash
> make --version
> \`\`\`

---

## Parte 05 — Construção do Projeto do Zero ao Fim

A frase central desta seção foi:

> **"Você não precisa saber escrever o código. Você precisa saber descrever o que quer."**

Essa é a mudança de mentalidade fundamental do Vibe Coding. Programadores tradicionais passam anos memorizando sintaxe de linguagens. Com IA, o que importa é saber articular o que você quer com clareza e precisão.

### Os 4 passos da construção

**1. Definir**

Antes de abrir o Claude Code, responda:
- O que o projeto faz?
- Quem vai usar?
- Quais dados ele precisa guardar?
- Quais as telas principais?
- Quais as regras de negócio? (ex: "só produtores aprovados podem criar eventos")

Quanto mais claro você for aqui, menos retrabalho terá depois.

---

**2. Estruturar**

Liste as funcionalidades, as telas de cada ator e os dados a serem armazenados. Este é o momento de *pensar* — antes de *construir*.

Uma boa estrutura inclui:
- Lista de telas por ator (mapa do sistema)
- Lista de dados que cada tabela do banco vai guardar
- Regras de acesso (quem pode ver/fazer o quê)
- Integrações necessárias (pagamento, e-mail, WhatsApp)

---

**3. Construir**

Aqui entra o Claude Code. O processo é iterativo:

1. Você descreve o que quer
2. Claude planeja e executa
3. Você testa no navegador
4. Encontrou problema? Volta ao Claude e descreve o que está errado
5. Repita até estar satisfeito

**Regra de ouro:** Um pedido por vez. Não tente construir o sistema inteiro em um único prompt. Comece pela estrutura básica (autenticação, banco), depois adicione funcionalidades uma a uma.

**Use \`/clear\` ao finalizar cada tarefa.** O Claude acumula todo o histórico da conversa como contexto. Quando você termina uma funcionalidade e começa outra, esse histórico vira ruído — a IA pode misturar informações antigas com o contexto atual. Ao digitar \`/clear\`, você reinicia a conversa com o Claude em branco, mantendo apenas o que está nos arquivos do projeto. Faça disso um hábito: terminou, testou, aprovou — \`/clear\` e próxima tarefa.

---

**4. Revisar**

Cada funcionalidade construída precisa ser testada:
- O fluxo funciona como esperado?
- As mensagens de erro são claras?
- O sistema funciona no celular (responsivo)?
- O que acontece quando o usuário faz algo errado?

A revisão não é apenas testar o "caminho feliz" (quando tudo vai certo). É tentar quebrar o sistema de propósito para encontrar os problemas antes que o usuário encontre.

---

## Parte 06 — Primeiros Comandos e Fluxo de Trabalho

### Iniciando uma sessão com Claude Code

Abra o terminal (WSL no Windows), navegue até a pasta do projeto e rode:

\`\`\`bash
claude
\`\`\`

O Claude vai exibir uma mensagem de boas-vindas e ler automaticamente o arquivo CLAUDE.md do projeto (se existir). Esse arquivo contém as regras e contexto do projeto — é como o Claude "aprende" sobre o projeto antes de começar.

---

### Os comandos essenciais dentro do Claude Code

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| \`/login\` | Autentica com sua conta Anthropic | Na primeira vez ou quando a sessão expirar |
| \`/clear\` | Limpa o histórico da conversa | Quando mudar de assunto ou contexto |
| \`/plan\` | Mostra o plano antes de executar | Para ações grandes que afetam muitos arquivos |
| \`/help\` | Lista todos os comandos disponíveis | Quando estiver perdido |
| \`/exit\` | Encerra a sessão | Para sair |

---

### Por que /clear é tão importante?

O Claude Code guarda todo o histórico da conversa como contexto. Isso é ótimo quando você está trabalhando em uma funcionalidade específica — ele lembra o que você discutiu, os arquivos que tocou, os problemas que encontrou.

Mas quando você termina uma tarefa e começa uma completamente diferente, esse histórico vira um problema: a IA pode confundir informações antigas com o contexto atual.

Use \`/clear\` quando:
- Terminar uma funcionalidade e começar outra
- Mudar de parte do sistema (ex: saindo do backend e indo para o frontend)
- A conversa está longa e você percebe que a IA está se confundindo

---

### O fluxo de trabalho do dia-a-dia

\`\`\`
1. Abrir o terminal e rodar: wsl
2. Navegar até a pasta do projeto
3. Rodar: claude
4. Descrever o que quer construir
5. Claude planeja e pede aprovação para executar
6. Você aprova (ou ajusta o plano)
7. Claude executa
8. Você testa no navegador
9. Se precisar ajustar: descreve o ajuste
10. Repita até estar satisfeito
11. /clear para o próximo tema
\`\`\`

---

### Revisando o código: a responsabilidade que não some

Mesmo com IA, você precisa revisar o que foi gerado. Não porque a IA erra muito — ela erra pouco. Mas porque:

- **Segurança:** Você precisa garantir que nenhuma informação sensível foi exposta
- **Lógica de negócio:** A IA pode gerar código tecnicamente correto, mas errado para o seu negócio específico
- **Aprendizado:** Entender o que foi gerado é parte fundamental do processo

Você não precisa entender cada linha. Mas use o próprio Claude para perguntar: *"Pode me explicar o que esse arquivo faz em linguagem simples?"*

---

## Parte 07 — Boas Práticas de Prompt para Desenvolvimento

Escrever prompts bons é uma habilidade que se desenvolve com prática. Veja os princípios e exemplos concretos:

---

### ✅ 1. Seja específico — diga O QUE quer, não o que não quer

**Ruim:**
> "Crie o login do sistema"

**Bom:**
> "Crie uma tela de login com os campos e-mail e senha. Quando o usuário errar a senha, mostre a mensagem 'E-mail ou senha incorretos' em vermelho abaixo do formulário. Adicione um link 'Esqueci minha senha' abaixo do botão. A tela deve funcionar bem no celular."

**Ainda melhor — especifique também as tecnologias:**
> "Crie o login usando Clerk para autenticação e faça o controle de sessão com Laravel Sanctum no backend. O frontend deve redirecionar para o painel do produtor após o login bem-sucedido."

Quanto mais você especifica — comportamento, tecnologia, fluxo e destino — menos a IA precisa adivinhar. Adivinhação gera retrabalho.

---

### ✅ 2. Forneça contexto completo

Claude não sabe nada sobre o seu projeto a não ser o que você diz (e o CLAUDE.md). Sempre que for pedir algo novo, diga:

- Qual é o projeto e o que ele faz
- Quem é o usuário dessa funcionalidade
- Quais tecnologias o projeto usa
- Qual parte do sistema você está tocando

**Exemplo:**
> "Estou construindo uma plataforma de venda de ingressos chamada Ticketeira. O backend é em Laravel e o frontend em React com TypeScript. Estou trabalhando na área do produtor. Preciso criar a funcionalidade de [...]"

---

### ✅ 3. Um pedido por vez — não misture funcionalidades

**Ruim:**
> "Crie o login, o cadastro, o esqueci-a-senha, o painel do produtor, a lista de eventos e o formulário de criação de evento"

**Por que é ruim:** Se algo der errado, você não sabe qual parte falhou. O Claude vai fazer tudo de uma vez e pode cometer erros em qualquer parte.

**Bom:**
> "Crie apenas a tela de login com validação de campos"
> *[testa, aprova, /clear]*
> "Agora crie a tela de cadastro de usuário"
> *[testa, aprova, /clear]*
> "Agora crie o fluxo de recuperação de senha"

Incremento por incremento. Cada pedaço validado antes de ir para o próximo.

---

### ✅ 4. Use /plan antes de grandes mudanças

Quando você vai fazer algo que pode afetar muitos arquivos — como reestruturar o banco de dados, refatorar um módulo inteiro, ou integrar um novo serviço — peça para o Claude mostrar o plano antes de executar:

\`\`\`
/plan Quero integrar o gateway de pagamento Abacate Pay no checkout. O que você precisa criar e modificar?
\`\`\`

Claude vai listar todos os arquivos que vai criar/modificar. Você revisa, e só aprova quando estiver confortável.

---

### ✅ 5. O CLAUDE.md — as regras permanentes do projeto

O CLAUDE.md é um arquivo especial na raiz do projeto. Claude Code o lê automaticamente no início de cada sessão. É onde você define as regras que valem para o projeto inteiro:

\`\`\`markdown
# Regras do Projeto

## Stack
- Backend: Laravel 11, PHP 8.4
- Frontend: React 19, TypeScript 5, Vite, Tailwind CSS
- Banco: MySQL 8
- Deploy: Docker + Nginx

## Regras importantes
- Nunca faça commit automático. Commits só via \`make send\`
- Todo feedback de erro ao usuário deve ser em português
- Senhas e chaves de API nunca no código — sempre no .env
- Componentes React sempre funcionais, nunca classes
\`\`\`

Qualquer regra que você quer que Claude respeite *sempre* — coloque no CLAUDE.md. Não precisa repetir em cada prompt.

---

### ✅ 6. Releia o código gerado — entender é parte do processo

A IA não vai roubar seu emprego se você entender o que ela faz. O diferencial do Vibe Coder não é saber escrever código — é saber:

- Avaliar se o código faz o que você pediu
- Identificar se existe algum problema de segurança ou lógica
- Decidir quando está bom o suficiente para ir para produção

Use o Claude para aprender: *"Pode explicar o que esse bloco de código faz? Por que você escolheu essa abordagem?"*

---

## Parte 08 — Gerando o Documento de Requisitos

**Requisitos funcionais** são a lista completa de tudo que o sistema precisa fazer. É o documento que descreve o produto — sem código, sem tecnologia, sem jargões técnicos. Só funcionalidades.

### Por que isso importa?

Com o documento de requisitos você pode:
- Mostrar para o cliente e confirmar que entendeu o que ele quer
- Dar para qualquer desenvolvedor (ou IA) e ele consegue construir
- Calcular o tamanho do projeto e estimar prazos
- Definir quais funcionalidades vão para a versão 1 e quais ficam para depois

### Como geramos o documento

**Fluxo:**
1. Você criou as telas no Google AI Studio usando um prompt estruturado
2. Esse prompt descreve o sistema visualmente
3. Enviamos esse mesmo prompt para o Claude.ai pedindo para ele gerar os requisitos funcionais
4. Claude analisa o prompt e lista todas as funcionalidades com nome e descrição

**O resultado** é um documento como este (exemplo simplificado):

---

*Requisitos Funcionais — Plataforma de Ingressos*

**Módulo de Autenticação**
- RF01: O sistema deve permitir cadastro com e-mail e senha
- RF02: O sistema deve exibir mensagem de erro quando as credenciais estiverem incorretas
- RF03: O usuário deve poder recuperar a senha por e-mail

**Módulo do Produtor**
- RF04: O produtor deve poder criar um evento com título, descrição, data, local e imagem
- RF05: O produtor deve poder definir tipos de ingresso com nome, preço e quantidade
- RF06: O produtor deve ver um painel com total de vendas e ingressos restantes

*[...e assim por diante para cada módulo]*

---

Esse documento se torna a "bíblia" do projeto. Toda decisão técnica parte daqui.

---

## Parte 09 — Gerando o Prompt para o Claude Code

Com o documento de requisitos em mãos, você tem tudo que precisa. O último prompt da aula combina três elementos em um único bloco:

### 1. O Padrão Oficial da Empresa

Define toda a stack tecnológica, estrutura de pastas, convenções de código, comandos obrigatórios do Makefile e checklist de produção. Isso garante que todos os projetos saem com a mesma qualidade e estrutura — independentemente de quem pediu ou quando.

**Tecnologias definidas:**
- **Backend:** Laravel 11+ com PHP 8.4+, MySQL 8, Sanctum para autenticação
- **Frontend:** React 19, TypeScript 5+, Vite, Tailwind CSS, React Router
- **Infra:** Docker + Docker Compose, Nginx como proxy reverso

### 2. Os Requisitos do Projeto

O documento de requisitos gerado na Parte 08. Claude vai implementar exatamente o que está listado lá.

### 3. O Link do Repositório Visual

O link do repositório do Google AI Studio com as telas criadas. Claude vai copiar a interface visual (cores, layout, estilo) mas vai refazer a estrutura do código seguindo os padrões da empresa.

---

### O que acontece depois que você envia?

Claude Code vai:

1. **Clonar o repositório** com as telas visuais
2. **Criar a estrutura do projeto** (pastas, arquivos de configuração, Docker, Makefile)
3. **Inicializar o Laravel** com as configurações corretas
4. **Inicializar o React** com TypeScript, Vite e Tailwind
5. **Criar o banco de dados** com todas as tabelas necessárias
6. **Implementar a autenticação** (login, cadastro, recuperação de senha)
7. **Implementar cada módulo** listado nos requisitos
8. **Gerar o CLAUDE.md** com as regras do projeto

Tudo isso acontece de forma incremental, com Claude pedindo aprovação antes de cada grande mudança.

---

## Entregáveis desta Aula

Ao final da Aula 1, você deveria ter concluído:

- ✅ **Ambiente completo configurado** — VS Code, WSL, Docker, Claude Code e Make instalados e funcionando
- ✅ **Projeto exemplo funcional** — um sistema completo construído do zero durante o encontro, acessível pelo navegador
- ✅ **Repositório no GitHub** — o código do projeto versionado e acessível online
- ✅ **Guia de referência** — anotações dos comandos mais usados e o fluxo de trabalho

---

## Glossário Completo da Aula 1

| Termo | Significado simples |
|-------|---------------------|
| **Vibe Coding** | Programar descrevendo intenções em linguagem natural, com IA executando |
| **IA** | Inteligência Artificial — sistemas que aprendem padrões e tomam decisões |
| **CLI** | Interface de Linha de Comando — ferramenta usada pelo terminal |
| **API** | Interface de comunicação entre sistemas de software |
| **Terminal** | Janela de texto para comandos diretos ao computador |
| **Prompt** | Instrução em linguagem natural enviada para a IA |
| **VS Code** | Editor de código gratuito da Microsoft |
| **WSL** | Windows Subsystem for Linux — Linux rodando dentro do Windows |
| **Linux** | Sistema operacional gratuito preferido por servidores e devs |
| **Docker** | Ferramenta que cria containers para rodar aplicações isoladas |
| **Container** | Ambiente isolado e portátil com tudo que a app precisa |
| **Make / Makefile** | Ferramenta de automação com atalhos para comandos complexos |
| **Claude Code** | CLI da Anthropic — IA que executa ações reais no seu computador |
| **CLAUDE.md** | Arquivo com regras permanentes do projeto que Claude lê |
| **Deploy** | Publicar a aplicação em produção para usuários acessarem |
| **Repositório** | Pasta do projeto versionada no GitHub |
| **Git** | Sistema de controle de versão de código |
| **Commit** | Ponto salvo na história do projeto (como checkpoint) |
| **GitHub** | Plataforma para hospedar repositórios Git online |
| **Requisitos Funcionais** | Lista do que o sistema precisa fazer |
| **Mockup / Protótipo** | Rascunho visual de telas do sistema |
| **Ator** | Tipo de usuário com permissões específicas no sistema |
| **Jornada** | Sequência de ações de um ator para atingir seu objetivo |
| **Escopo** | O que está dentro e fora do projeto |
| **Scope Creep** | Crescimento descontrolado do escopo de um projeto |
| **Business Model Canvas** | Ferramenta visual para mapear um modelo de negócio inteiro |
| **Glass Design** | Estilo visual com transparência e efeito de vidro |
| **Responsivo** | Interface que se adapta a qualquer tamanho de tela |
| **Node.js** | Ambiente JavaScript para rodar código fora do navegador |
| **npm** | Gerenciador de pacotes do Node.js |
| **sudo** | Prefixo para executar comandos com permissão de administrador |
| **apt** | Gerenciador de pacotes (instalador) do Ubuntu/Debian |
`,

  2: `# Material Complementar — Aula 2
## Stack Completa de um Projeto

Nesta aula mergulhamos fundo na arquitetura de um projeto real. Se na Aula 1 você aprendeu a *criar* um projeto, aqui você vai entender *como ele funciona por dentro* — e por que cada peça existe.

Esse conhecimento é o que separa quem usa IA de quem **entende** IA. Com ele, você consegue:
- Tomar decisões técnicas informadas
- Conversar com desenvolvedores sem se perder
- Identificar problemas quando algo dá errado
- Escalar o projeto quando precisar

---

## O vídeo de abertura

A aula começou com um vídeo — um momento para reflexão antes de mergulhar no conteúdo técnico. É uma lembrança de que a tecnologia é um meio, não um fim. O que importa é o impacto que você gera com ela.

---

## Parte 01 — Estrutura de um Projeto

Todo software cresce ao longo do tempo. Um projeto que começa simples vai ganhando complexidade conforme novos requisitos aparecem. Mostramos 4 estágios evolutivos de arquitetura:

---

### Estágio 1: SPA — Single Page Application

**O que é:** Uma aplicação que roda *completamente* no navegador do usuário. Não tem servidor dedicado, não tem banco de dados, não processa nada "no servidor". Todo o código JavaScript é baixado pelo navegador uma vez, e a partir daí, a navegação entre páginas acontece sem recarregar.

**Tecnologia:** React + Vite

**Como funciona na prática:**
1. O usuário acessa a URL (ex: meuprojeto.com)
2. O servidor entrega os arquivos HTML, CSS e JavaScript
3. O navegador baixa tudo e executa
4. Toda interação acontece no próprio navegador — sem ir ao servidor

**Onde hospedar:** Sites estáticos podem ser hospedados em serviços gratuitos como Netlify, Vercel, GitHub Pages. Extremamente barato.

**Exemplos do mundo real:** Portfólios pessoais, calculadoras, jogos simples no browser, landing pages estáticas.

**Limitações críticas:**
- ❌ Não consegue guardar dados permanentemente (sem banco de dados)
- ❌ Não consegue fazer login real com sessão persistente
- ❌ Não consegue processar pagamentos
- ❌ Não consegue enviar e-mails
- ❌ Qualquer dado inserido some ao fechar o navegador

**Analogia:** Um folheto impresso. Bonito, útil para comunicar — mas não reage ao que o leitor faz e não guarda informação.

---

### Estágio 2: Aplicação Web Completa

Adiciona um **backend** e um **banco de dados** ao frontend. Agora o sistema consegue:

- Criar contas e fazer login persistente
- Guardar dados que não somem
- Processar pagamentos
- Enviar e-mails e notificações
- Aplicar regras de negócio com segurança

**Arquitetura:**

\`\`\`
Usuário (navegador)
       ↕  HTTP
  Frontend (React)
       ↕  HTTP / JSON (API)
  Backend (Laravel)
       ↕  SQL
  Banco de Dados (MySQL)
\`\`\`

**Frontend (React):** Roda no navegador. Exibe a interface, captura inputs do usuário, faz requisições para o backend e renderiza as respostas. Nunca deve conter lógica de negócio crítica ou dados sensíveis — porque o usuário pode inspecionar o código JavaScript no navegador.

**Backend (Laravel):** Roda no servidor. Recebe as requisições do frontend, valida dados, aplica regras de negócio, consulta o banco de dados e retorna respostas em JSON. Aqui ficam as coisas que precisam de segurança: validação de permissões, cálculos financeiros, chaves de API.

**Banco de Dados (MySQL):** Armazena todos os dados de forma permanente e organizada em tabelas relacionadas entre si.

**Analogia perfeita — o restaurante:**
- **Frontend = salão:** O que o cliente vê. Mesas, cardápio, decoração, garçom. A experiência.
- **Backend = cozinha:** Onde as coisas acontecem. Receitas executadas, pedidos processados, qualidade controlada. O cliente não acessa.
- **Banco de dados = despensa:** Onde os ingredientes ficam armazenados. A cozinha busca o que precisa quando prepara cada prato.

---

### Estágio 3: Com Integrações Internas

Quando o sistema precisa de funcionalidades especializadas, você adiciona **serviços internos** — aplicações que rodam na mesma infraestrutura da empresa e que o backend consome.

**Exemplos de integrações internas:**

- **Evolution API:** Para enviar e receber mensagens WhatsApp de forma programática
- **Remotion:** Para gerar vídeos automaticamente com código
- **Serviço de PDF:** Para gerar documentos, contratos, ingressos em PDF
- **Serviço de imagem:** Para redimensionar e otimizar fotos enviadas por usuários

**Por que separar em serviços diferentes?** Porque cada um tem características distintas:
- Processar vídeos consome muita CPU — seria impraticável no mesmo servidor do backend
- Enviar WhatsApp requer manter uma conexão persistente aberta — diferente de responder requisições HTTP
- Separar permite escalar cada serviço independentemente

---

### Estágio 4: Com Integrações Externas

Serviços de terceiros que você consome via API — empresas especializadas que já resolveram problemas complexos.

**Exemplos:**

| Serviço | O que faz | Por que usar em vez de construir |
|---------|-----------|----------------------------------|
| **Melhor Envio** | Calcula fretes de múltiplas transportadoras | Criar isso do zero exigiria integrar com Correios, Jadlog, Total Express, etc. |
| **PagSeguro / Abacate Pay** | Processa pagamentos | Certificações bancárias, antifraude, integração com BACEN — anos de trabalho |
| **SendGrid / Resend** | Envia e-mails em escala | Reputação de domínio, gerenciamento de bounces, compliance — extremamente complexo |
| **Twilio** | SMS e ligações | Acordos com operadoras em dezenas de países |

**A regra:** Se uma funcionalidade não é o core do seu negócio e existe um serviço maduro que a resolve bem, use-o. Reserve sua energia para o que é único no seu produto.

---

## Parte 02 — As Camadas da Aplicação em Produção

Quando a aplicação vai ao ar, ela é empacotada em camadas. Entender essas camadas é fundamental para saber o que acontece quando algo quebra.

---

### O Servidor Linux

**O que é:** Um computador físico (ou virtual) que fica ligado 24 horas por dia, 7 dias por semana, conectado à internet. É lá que sua aplicação roda quando não está no seu computador local.

**Por que Linux?** O Linux é gratuito, extremamente estável, tem excelente suporte a programação e é o sistema operacional de mais de 96% dos servidores do mundo. A Microsoft, a Google e a Amazon também usam Linux em seus servidores.

**Como você obtém:** Alugando de empresas de cloud (nuvem):
- **DigitalOcean** — popular entre desenvolvedores, boa relação custo/benefício
- **Contabo** — muito barato, servidores na Europa
- **Amazon AWS** — líder de mercado, mais complexo
- **Hetzner** — excelente custo/benefício, servidores na Europa
- **Hostinger VPS** — opção popular no Brasil

Você paga mensalmente pelo acesso a esse computador remoto. Planos básicos começam em torno de R$ 20-50/mês.

---

### Docker e os Containers

Docker é a tecnologia que tornou o desenvolvimento moderno possível. Antes do Docker, colocar uma aplicação em produção era um pesadelo: configurações diferentes entre máquinas, versões incompatíveis, conflitos de dependências.

**O problema que Docker resolve:**

> *"Mas funciona na minha máquina!"*

Essa frase famosa descreve o pesadelo pré-Docker. O código funcionava perfeitamente no computador do desenvolvedor, mas falhava no servidor de produção porque:
- A versão do Node.js era diferente
- O banco de dados tinha configuração diferente
- Uma dependência estava instalada na máquina do dev mas não no servidor
- O sistema operacional era diferente

**A solução:** Empacotar a aplicação com tudo que ela precisa — código, runtime, dependências, configurações — dentro de um container. Agora o container roda igual em qualquer lugar onde o Docker estiver instalado.

---

**Conceitos essenciais do Docker:**

**Imagem:** O "molde" para criar um container. É como uma receita de bolo — define tudo que o container vai ter. Imagens são baixadas do Docker Hub (como uma App Store de imagens).

\`\`\`bash
docker pull node:20        # baixa a imagem oficial do Node.js versão 20
docker pull mysql:8        # baixa a imagem oficial do MySQL versão 8
docker pull nginx:alpine   # baixa a imagem do Nginx (servidor web)
\`\`\`

**Container:** Uma instância rodando de uma imagem. Você cria um container a partir de uma imagem, e ele roda de forma isolada.

**Docker Compose:** Ferramenta que permite definir e gerenciar múltiplos containers ao mesmo tempo num único arquivo \`docker-compose.yml\`.

\`\`\`yaml
# Exemplo simplificado de docker-compose.yml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: minha_app
      MYSQL_ROOT_PASSWORD: senha_secreta

  app:
    build: ./backend
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
\`\`\`

Com isso, \`make up\` (que roda \`docker compose up -d\`) sobe os 3 containers de uma vez.

**Analogia para containers:**

Pense num **trem de carga**. Cada vagão (container) carrega uma carga específica, isolada das outras. O conteúdo de um vagão não interfere no outro. Se um vagão der problema, você para só aquele — o trem continua. E você pode adicionar ou remover vagões sem parar o trem inteiro.

---

### Deployment em Servidores Separados

O segundo slide de deployment mostrou uma arquitetura mais madura: **servidores dedicados**.

**Por que separar?**

Num projeto pequeno, tudo roda num servidor só. Mas conforme o projeto cresce:

- O banco de dados precisa de I/O (leitura/escrita em disco) muito alto → precisa de hardware específico para isso
- O banco de dados é um ponto crítico de falha → deve ficar isolado para não ser afetado por problemas na aplicação
- Backups e segurança do banco são diferentes da aplicação → administração separada

**Arquitetura separada:**

\`\`\`
GitHub (código-fonte)
       ↓
Servidor de Aplicação
├── Docker
│   ├── Backend (Laravel)
│   └── Frontend (React + Nginx)

Servidor de Banco de Dados
└── MySQL (sem Docker, nativo)

Servidor de Arquivos
└── Fotos, vídeos, documentos dos usuários
\`\`\`

O GitHub aparece como ponto de partida porque é de lá que vem o código. O \`make deploy\` faz um \`git pull\` do repositório e reconstrói os containers.

---

### Nginx — O Porteiro da Aplicação

**O que é:** Um servidor web de altíssima performance que atua como **proxy reverso** — recebe as requisições da internet e direciona para o serviço correto.

**Por que precisamos dele:**

- O usuário digita \`meuprojeto.com\` e a requisição chega ao servidor
- O Nginx recebe a requisição
- Se for para \`meuprojeto.com/api/*\` → redireciona para o backend (Laravel)
- Se for para qualquer outra rota → serve o frontend (React compilado)

\`\`\`nginx
# Exemplo de configuração Nginx
server {
    listen 80;
    server_name meuprojeto.com;

    # Frontend: qualquer rota não-API serve o index.html
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend: rotas da API vão para o Laravel
    location /api/ {
        proxy_pass http://backend:8000;
    }
}
\`\`\`

---

## Parte 03 — Na Prática: O Projeto Figurex

Fizemos um clone de um projeto real para explorar a estrutura de arquivos. A instrução foi:

1. Clonar o repositório: \`git clone https://github.com/pandoapps/Figurex\`
2. Ler o README para entender o projeto
3. Explorar os arquivos fundamentais

---

### O arquivo .env — O cofre das configurações

O arquivo **.env** (abreviação de *environment*, ambiente em inglês) é onde ficam todas as configurações que:
- Mudam entre ambientes (desenvolvimento vs. produção)
- São sensíveis e não devem ser expostas

\`\`\`bash
# Configurações do banco de dados
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=figurex
DB_USERNAME=root
DB_PASSWORD=senha_super_secreta_aqui

# Configuração da aplicação
APP_NAME=Figurex
APP_ENV=production
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxx=
APP_DEBUG=false
APP_URL=https://figurex.com.br

# Chave de API do gateway de pagamento
ABACATE_PAY_API_KEY=sk_live_xxxxxxxxxxxxxxxx
ABACATE_PAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# Configurações de e-mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxxxxxxxxxxxxx
\`\`\`

**Por que esses dados ficam no .env e não no código?**

Imagine que você colocou a senha do banco de dados diretamente no código:

\`\`\`php
// ❌ NUNCA faça isso!
$pdo = new PDO('mysql:host=localhost', 'root', 'minha_senha_secreta');
\`\`\`

Agora essa senha está no repositório do GitHub. Qualquer pessoa que tiver acesso ao repositório — incluindo ex-colaboradores — tem a senha do banco de dados de produção. Isso é uma **vulnerabilidade crítica de segurança**.

Com o .env, você mantém o código seguro no repositório e as credenciais separadas, protegidas, configuradas diretamente no servidor.

**As 3 versões do .env:**

| Arquivo | Vai pro GitHub? | Descrição |
|---------|----------------|-----------|
| **.env** | ❌ Nunca | Contém as credenciais reais (locais) |
| **.env.production** | ❌ Nunca | Contém as credenciais reais (produção) |
| **.env.example** | ✅ Sempre | Template com os nomes das variáveis, sem valores |

O \`.env.example\` funciona como documentação: lista quais variáveis o projeto precisa, para que novos colaboradores saibam o que configurar.

---

### O Makefile — A central de comandos

O Makefile do nosso projeto padrão tem os seguintes comandos (todos internamente rodados com Docker):

| Comando | O que faz |
|---------|-----------|
| \`make up\` | Sobe todos os containers em modo desenvolvimento |
| \`make up-prod\` | Sobe em modo produção (build otimizado) |
| \`make down\` | Para todos os containers |
| \`make install\` | Instala dependências (composer + npm) |
| \`make migrate\` | Roda as migrations (cria/atualiza tabelas) |
| \`make seed\` | Roda os seeders (popula o banco com dados iniciais) |
| \`make fresh\` | Drop + migrate + seed (banco do zero) |
| \`make db\` | Abre shell do MySQL para consultas diretas |
| \`make thinker\` | Abre o Laravel Tinker (playground PHP interativo) |
| \`make shell\` | Abre shell dentro do container do app |
| \`make deploy\` | Pull + build + migrate em produção |
| \`make send\` | Pede mensagem de commit, faz lint e commita |

**Por que nunca usar php artisan diretamente?**

O PHP e o Laravel estão instalados *dentro do container Docker*, não na sua máquina. Se você rodar \`php artisan migrate\` na sua máquina, vai dar erro porque o PHP não está instalado localmente. O \`make migrate\` internamente roda o comando dentro do container correto.

---

### O docker-compose.yml — A orquestra dos containers

\`\`\`yaml
# Versão simplificada do nosso docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    volumes:
      - ./backend:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: \${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx:/etc/nginx/conf.d
    depends_on:
      - app

  node:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    command: npm run dev

volumes:
  db_data:
\`\`\`

Cada bloco em \`services\` define um container. O \`depends_on\` garante que o banco sobe antes do backend. Os \`volumes\` sincronizam arquivos entre sua máquina e o container (essencial para editar código com VS Code enquanto o container roda).

---

## Parte 04 — Vocabulário Técnico Essencial

Esta foi a parte dos flashcards. Vamos aprofundar cada um com exemplos concretos:

---

### 🖥️ Frontend

**Definição:** A parte da aplicação que roda no navegador do usuário — tudo que ele vê e clica.

**Nossa stack de frontend:**

**React** (criado pelo Facebook em 2013): Biblioteca JavaScript para criar interfaces. A ideia central é dividir a interface em **componentes** — blocos reutilizáveis. Um botão é um componente. Uma lista de eventos é um componente. A página inteira é uma composição de componentes.

\`\`\`jsx
// Exemplo de componente React simples
function BotaoComprar({ preco, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-6 py-3 rounded-full"
    >
      Comprar por R$ {preco}
    </button>
  );
}
\`\`\`

**Vite**: Ferramenta de build que transforma o código React (JSX, TypeScript) em JavaScript puro que o navegador entende. Durante desenvolvimento, serve o código com hot reload — qualquer mudança aparece no navegador em milissegundos.

**TypeScript**: Versão do JavaScript com **tipagem estática**. Em vez de:
\`\`\`javascript
function calcularTotal(preco, quantidade) { // o que é preco? número? string?
  return preco * quantidade;
}
\`\`\`

Você escreve:
\`\`\`typescript
function calcularTotal(preco: number, quantidade: number): number {
  return preco * quantidade; // explícito, sem ambiguidade
}
\`\`\`

O TypeScript encontra erros antes de você rodar o código — como um revisor ortográfico, mas para lógica.

**Tailwind CSS**: Em vez de escrever um arquivo .css separado, você aplica classes diretamente no HTML:
\`\`\`html
<div class="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-md">
  <!-- flex: flexbox | items-center: centralizado | gap-4: espaçamento -->
\`\`\`

Parece poluído no começo, mas é extremamente produtivo depois que você aprende as classes.

---

### ⚡ Backend

**Definição:** A camada que processa lógica de negócio, valida dados, controla acesso e se comunica com o banco de dados. Roda no servidor, nunca no navegador.

**Nossa stack de backend:**

**Laravel** (framework PHP criado por Taylor Otwell em 2011): O framework mais popular do mundo para desenvolvimento web em PHP. "Batteries included" — já vem com tudo que você precisa: roteamento, autenticação, ORM para banco de dados, envio de e-mails, filas de tarefas, agendamento de jobs.

**Arquitetura MVC — Model, View, Controller:**

\`\`\`
Requisição HTTP chega
        ↓
    Controller
    (processa, valida, decide)
        ↓
    Model
    (busca/salva no banco)
        ↓
  API Resource
  (formata a resposta)
        ↓
Resposta JSON enviada
\`\`\`

- **Controller:** Recebe a requisição, valida a entrada, chama os serviços necessários e retorna resposta
- **Model:** Representa uma tabela do banco de dados. \`Event::find(1)\` busca o evento de ID 1 no banco
- **Service:** Contém a lógica de negócio complexa (ex: \`PaymentService\` que processa cobranças)
- **FormRequest:** Valida os dados antes de chegar no controller (ex: campo obrigatório, e-mail válido)
- **API Resource:** Formata a resposta JSON de forma padronizada

---

### 🗄️ Banco de Dados

**Definição:** Onde todos os dados da aplicação ficam armazenados de forma permanente, organizada e consultável.

**Nossa stack:** MySQL 8

**Bancos relacionais vs. não-relacionais:**
- **Relacional (MySQL, PostgreSQL):** Dados em tabelas com linhas e colunas, relacionadas entre si via chaves. Ideal para dados estruturados com relacionamentos claros.
- **Não-relacional (MongoDB, Redis):** Dados em documentos, chave-valor ou outros formatos. Mais flexível para dados não estruturados.

**Como funciona o MySQL:**

\`\`\`sql
-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP,
    deleted_at TIMESTAMP  -- soft delete
);

-- Tabela de eventos
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producer_id INT,  -- referência ao usuário produtor
    title VARCHAR(255),
    date DATETIME,
    FOREIGN KEY (producer_id) REFERENCES users(id)
);
\`\`\`

**Migrations no Laravel:** Em vez de escrever SQL diretamente, o Laravel usa migrations — arquivos PHP que descrevem as mudanças no banco. Isso permite versionar o banco junto com o código.

\`\`\`php
// database/migrations/2024_05_09_000000_create_events_table.php
public function up(): void
{
    Schema::create('events', function (Blueprint $table) {
        $table->id();
        $table->foreignId('producer_id')->constrained('users');
        $table->string('title');
        $table->dateTime('date');
        $table->timestamps();
        $table->softDeletes();
    });
}
\`\`\`

**Soft Delete:** Em vez de apagar fisicamente um registro do banco, o soft delete apenas marca o campo \`deleted_at\` com a data da exclusão. O registro continua no banco, mas é invisível para consultas normais. Útil para auditoria e recuperação de dados.

---

### 🔌 API e JSON

**API (Application Programming Interface):** É um conjunto de regras que define como dois sistemas se comunicam. É como um cardápio de restaurante — lista o que você pode pedir, como pedir e o que vai receber.

**Como funciona uma requisição de API:**

\`\`\`
REQUISIÇÃO (frontend → backend):
  Método: POST
  URL: https://api.ticketeira.com.br/api/orders
  Headers: Authorization: Bearer token123
  Body: {
    "event_id": 42,
    "quantity": 2,
    "customer_name": "João Silva",
    "customer_email": "joao@email.com"
  }

RESPOSTA (backend → frontend):
  Status: 201 Created
  Body: {
    "data": {
      "id": 891,
      "status": "pending",
      "total": 150.00,
      "pix_code": "00020126...",
      "expires_at": "2026-05-16T14:30:00Z"
    }
  }
\`\`\`

**JSON (JavaScript Object Notation):** Formato de texto para troca de dados. Fácil de ler por humanos e máquinas. É o formato padrão da internet moderna.

**Métodos HTTP:**

| Método | Uso | Exemplo |
|--------|-----|---------|
| **GET** | Buscar dados | Listar eventos |
| **POST** | Criar dados | Criar um pedido |
| **PUT/PATCH** | Atualizar dados | Editar um evento |
| **DELETE** | Apagar dados | Cancelar um pedido |

**Códigos de status HTTP:**

| Código | Significado |
|--------|-------------|
| **200** | OK — tudo certo |
| **201** | Created — recurso criado |
| **401** | Unauthorized — precisa fazer login |
| **403** | Forbidden — sem permissão |
| **404** | Not Found — recurso não existe |
| **422** | Unprocessable — dados inválidos |
| **500** | Server Error — erro no servidor |

---

## Parte 05 — Evolution API: Enviando Mensagens

O **Evolution API** é uma aplicação open-source que permite controlar o WhatsApp Web programaticamente. Você conecta um número de telefone via QR Code e passa a poder enviar/receber mensagens pelo seu código.

**Como funciona:**

1. Você hospeda o Evolution API no seu servidor
2. Conecta um número de WhatsApp via QR Code (como você faz no WhatsApp Web)
3. Sua aplicação faz requisições HTTP para o Evolution API
4. O Evolution API envia a mensagem pelo WhatsApp conectado

\`\`\`javascript
// Exemplo: enviando mensagem com Evolution API
await fetch('https://evolution.seuservidor.com/message/sendText/instance1', {
  method: 'POST',
  headers: {
    'apikey': 'sua-chave-api',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    number: '5511999999999',
    text: 'Seu ingresso foi confirmado! 🎉\\n\\nEvento: Show do Coldplay\\nData: 15/06/2026\\nSeu QR Code está em anexo.',
  }),
});
\`\`\`

**Casos de uso práticos:**
- Confirmação de compra de ingresso
- Lembrete de evento 24h antes
- Suporte ao cliente automatizado
- Envio de atualizações de pedido

---

## Parte 06 — API + WebHook: O Coração do Pagamento

Esta foi a parte mais impactante da aula em termos técnicos. Entender esse fluxo te desbloqueia para construir qualquer sistema de cobrança.

---

### O Problema: Como processar um pagamento com segurança?

Parece simples: cliente clica em "pagar", você cobra. Mas na prática:

- Como você sabe se o banco autorizou?
- Como você sabe se o Pix foi pago?
- O que acontece se o cliente fechar o navegador durante o pagamento?
- Como você confirma sem o cliente estar presente?

A resposta é: **WebHooks**.

---

### O Fluxo Completo do Pagamento

\`\`\`
 Cliente        Aplicação         Asaas/Abacate        BACEN
    │               │                  │                   │
    │  1. Comprar   │                  │                   │
    │──────────────►│                  │                   │
    │               │  2. Criar        │                   │
    │               │  cobrança        │                   │
    │               │─────────────────►│                   │
    │               │                  │   3. Autorizar    │
    │               │                  │──────────────────►│
    │               │                  │◄──────────────────│
    │               │  4. QR Code /    │                   │
    │               │  código Pix      │                   │
    │               │◄─────────────────│                   │
    │  5. Mostra Pix│                  │                   │
    │◄──────────────│                  │                   │
    │               │                  │                   │
    │  6. Paga      │                  │                   │
    │──────────────────────────────────────────────────────│
    │               │                  │  7. Confirma      │
    │               │                  │◄──────────────────│
    │               │  8. WebHook      │                   │
    │               │◄─────────────────│                   │
    │               │                  │                   │
    │               │ (atualiza pedido)│                   │
    │               │                  │                   │
    │  9. Confirmação                  │                   │
    │◄──────────────│                  │                   │
\`\`\`

**Passo a passo:**

1. **Cliente** clica em "Comprar" e preenche os dados
2. **Aplicação** faz uma chamada de API para o gateway criando uma cobrança
3. **Gateway** se comunica com o Banco Central (BACEN) para autorizar
4. **Gateway** retorna o QR Code do Pix (ou link de boleto/cartão)
5. **Aplicação** exibe o QR Code para o cliente
6. **Cliente** abre o app do banco e paga o Pix
7. **BACEN** confirma o recebimento para o gateway
8. **Gateway** envia um WebHook para a URL do seu servidor avisando que foi pago
9. **Aplicação** atualiza o pedido para "pago" e notifica o cliente

---

### O que é um WebHook (explicação detalhada)

**WebHook é uma notificação HTTP automática** que um sistema envia para outro quando um evento específico ocorre.

**A diferença entre Polling e WebHook:**

**Polling (você fica perguntando):**
\`\`\`
Você: "Já foi pago?"      Gateway: "Não"
[5 segundos depois]
Você: "Já foi pago?"      Gateway: "Não"
[5 segundos depois]
Você: "Já foi pago?"      Gateway: "Sim!"
\`\`\`
Ineficiente. Gasta recursos. Atraso desnecessário.

**WebHook (ele te avisa quando acontece):**
\`\`\`
[15 minutos depois que o cliente pagou]
Gateway: "Ei, o pedido 891 foi pago. Aqui estão os detalhes: {...}"
Você: [atualiza o banco de dados]
\`\`\`
Eficiente. Imediato. Não gasta recursos esperando.

**Analogia:** Polling é ficar ligando no correio toda hora perguntando se chegou sua encomenda. WebHook é quando o entregador toca a campainha quando chegar.

**Como configurar um WebHook:**

Você precisa expor uma URL pública no seu servidor que o gateway possa acessar:

\`\`\`
URL do WebHook: https://ticketeira.com.br/api/webhooks/payment
\`\`\`

O gateway vai fazer um POST para essa URL com os dados do evento:

\`\`\`json
{
  "event": "payment.paid",
  "data": {
    "id": "pay_xxxxxxxxxx",
    "order_id": "891",
    "amount": 15000,
    "paid_at": "2026-05-16T14:27:33Z",
    "method": "pix"
  }
}
\`\`\`

**Verificação de assinatura:** Para garantir que o WebHook veio mesmo do gateway (e não de alguém tentando falsificar um pagamento), o gateway assina o payload com um segredo compartilhado. Seu servidor verifica essa assinatura antes de processar.

\`\`\`php
// Verificação de assinatura no Laravel
public function handlePaymentWebhook(Request $request): JsonResponse
{
    $signature = $request->header('X-Webhook-Signature');
    $payload = $request->getContent();
    $secret = config('services.abacate_pay.webhook_secret');

    // Verifica se a assinatura é válida
    if (!hash_equals(hash_hmac('sha256', $payload, $secret), $signature)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    // Seguro — processa o evento
    $event = $request->json('event');
    if ($event === 'payment.paid') {
        $orderId = $request->json('data.order_id');
        Order::find($orderId)->update(['status' => 'paid']);
        // Envia confirmação para o cliente...
    }

    return response()->json(['ok' => true]);
}
\`\`\`

---

### Estados do Pagamento

| Status | O que significa | O que fazer |
|--------|----------------|-------------|
| **pending** | Aguardando pagamento | Mostrar QR Code. Aguardar WebHook. |
| **paid** | Pagamento confirmado | Liberar o produto/serviço. Notificar cliente. |
| **cancelled** | Pagamento cancelado | Liberar o estoque. Notificar cliente. |
| **expired** | Prazo de pagamento vencido | Fechar o pedido. Oferecer nova cobrança. |

---

## Parte 07 — Tarefa: Implementando um Gateway de Pagamento

A tarefa prática foi criar um projeto simples do zero — a "Minha Figurinha" — que cobre o ciclo completo de uma venda digital.

**O que o sistema precisa fazer:**

1. **Landing page:** Exibe a figurinha do dono com botão "Comprar por R$ 5,00"
2. **Checkout:** Formulário com nome e telefone do comprador
3. **Pagamento:** Integração com gateway para gerar cobrança Pix
4. **Banco de dados:** Salva o pedido com status "pending"
5. **WebHook:** Quando o pagamento for confirmado, atualiza para "paid"
6. **Entrega:** Envia a figurinha para o WhatsApp do cliente via Evolution API

**Por que essa tarefa é poderosa:**

Ela cobre **todo o fluxo** de uma venda digital real:

\`\`\`
Frontend → Backend → Gateway → BACEN → WebHook → Banco → WhatsApp
\`\`\`

Quando você entender cada pedaço desse fluxo, você consegue construir qualquer e-commerce, plataforma de assinaturas, marketplace ou serviço de venda online.

---

## Entregáveis desta Aula

- ✅ **Mapa visual da stack** — diagrama da arquitetura com anotações pessoais
- ✅ **Glossário coletivo** — termos explicados com as palavras do grupo
- ✅ **Documentação da arquitetura** — o que cada arquivo do projeto Figurex faz
- ✅ **Prompts catalogados** — prompts eficazes para frontend, backend e integrações

---

## Glossário Completo da Aula 2

| Termo | Significado simples |
|-------|---------------------|
| **SPA** | Single Page Application — app que roda só no navegador, sem servidor |
| **Frontend** | Camada visual que o usuário vê e interage (roda no navegador) |
| **Backend** | Camada de processamento e regras de negócio (roda no servidor) |
| **Banco de Dados** | Armazenamento permanente e organizado de dados |
| **Container** | Ambiente isolado e portátil para rodar partes da aplicação |
| **Docker** | Ferramenta que cria e gerencia containers |
| **Docker Compose** | Orquestrador de múltiplos containers em um único arquivo |
| **Imagem Docker** | Molde para criar um container (receita de bolo) |
| **Docker Hub** | Repositório online de imagens Docker prontas |
| **Nginx** | Servidor web e proxy reverso — porteiro que direciona as requisições |
| **Proxy Reverso** | Serviço que recebe requisições e direciona ao serviço correto |
| **Deploy** | Publicar a aplicação em produção para usuários acessarem |
| **Servidor** | Computador remoto ligado 24h que hospeda a aplicação |
| **Linux** | Sistema operacional gratuito preferido para servidores |
| **Cloud** | Serviços de computação alugados via internet (AWS, DigitalOcean) |
| **GitHub** | Plataforma para hospedar e versionar código-fonte |
| **Git** | Sistema de controle de versão de código |
| **Repositório** | Projeto hospedado no GitHub |
| **Commit** | Ponto salvo na história do projeto |
| **Branch** | Linha paralela de desenvolvimento |
| **Pull Request** | Pedido de revisão e integração de código |
| **Merge** | Unir o trabalho de duas branches em uma só |
| **React** | Biblioteca JavaScript para interfaces interativas (Facebook) |
| **Vite** | Ferramenta de build super rápida para projetos modernos |
| **TypeScript** | JavaScript com tipagem estática — encontra erros antes de rodar |
| **Tailwind CSS** | Biblioteca de classes CSS utilitárias |
| **Componente** | Bloco reutilizável de interface no React |
| **Laravel** | Framework PHP para desenvolvimento web |
| **PHP** | Linguagem de programação server-side |
| **Framework** | Estrutura base com soluções prontas para problemas comuns |
| **MVC** | Model-View-Controller — padrão de organização de código |
| **Migration** | Arquivo que descreve mudanças no banco (versionamento) |
| **Seeder** | Script que popula o banco com dados iniciais para testes |
| **ORM** | Ferramenta que conecta código a banco de dados sem escrever SQL |
| **MySQL** | Banco de dados relacional — dados em tabelas relacionadas |
| **Tabela** | Estrutura de armazenamento (como uma aba de planilha) |
| **Soft Delete** | Marcar como excluído sem apagar fisicamente do banco |
| **Foreign Key** | Referência entre tabelas (ex: pedido referencia usuário) |
| **API** | Interface de comunicação entre sistemas via HTTP/JSON |
| **JSON** | Formato de texto para troca de dados entre sistemas |
| **HTTP** | Protocolo de comunicação da internet |
| **GET/POST/PUT/DELETE** | Métodos HTTP para buscar/criar/atualizar/apagar dados |
| **Status Code** | Código numérico indicando resultado de uma requisição |
| **WebHook** | Notificação automática enviada quando um evento ocorre |
| **Polling** | Ficar perguntando repetidamente o status de algo |
| **Gateway de Pagamento** | Intermediário que processa cobranças e integra com bancos |
| **BACEN** | Banco Central do Brasil — autoriza transações financeiras |
| **Pix** | Sistema de pagamento instantâneo do Banco Central |
| **Assinatura HMAC** | Técnica criptográfica para verificar autenticidade de WebHooks |
| **.env** | Arquivo com configurações sensíveis (nunca vai pro GitHub) |
| **.gitignore** | Lista de arquivos que o Git deve ignorar |
| **Makefile** | Arquivo com atalhos de comandos do projeto |
| **Evolution API** | Ferramenta para enviar/receber mensagens via WhatsApp |
| **Open Source** | Software com código aberto disponível para qualquer um usar |
| **Hot Reload** | Atualização automática do navegador quando o código muda |
| **Build** | Processo de compilar/empacotar o código para produção |
| **Dependency** | Biblioteca externa que o projeto usa |
| **npm** | Gerenciador de pacotes do Node.js |
| **Composer** | Gerenciador de pacotes do PHP/Laravel |
`,
};
