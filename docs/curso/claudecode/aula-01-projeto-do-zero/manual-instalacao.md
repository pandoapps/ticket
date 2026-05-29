# Aula 1 — Preparando o Ambiente de Desenvolvimento

Antes de rodar o Converseiro, você precisa instalar algumas ferramentas no seu computador. Siga o guia do seu sistema operacional.

---

## Qual é o seu sistema operacional?

- **Windows** → siga a Parte A (WSL2) e depois a Parte B
- **Linux / macOS** → pule direto para a Parte B

---

## Parte A — Somente Windows: Instalar o WSL2

No Windows, todo o desenvolvimento acontece **dentro do WSL2** (Windows Subsystem for Linux). Isso garante compatibilidade total com Docker, scripts shell e as ferramentas do projeto.

### 1. Ativar o WSL2

Abra o **PowerShell como Administrador** e execute:

```powershell
wsl --install
```

Aguarde o download e instalação. Quando terminar, **reinicie o computador**.

Após reiniciar, o Ubuntu será configurado automaticamente. Crie seu usuário e senha Linux quando solicitado.

> **Dica:** se já tiver o WSL instalado mas na versão 1, atualize com:
> ```powershell
> wsl --set-default-version 2
> ```

### 2. Abrir o terminal Linux

Abra o **PowerShell** e digite:

```powershell
wsl
```

Você entrará diretamente no terminal Linux. Todas as etapas da Parte B serão executadas **dentro deste terminal**.

---

## Parte B — Instalação das Ferramentas (Linux, macOS e WSL2)

### 1. Git

O Git é necessário para clonar e versionar o projeto.

**Ubuntu / Debian / WSL2:**
```bash
sudo apt update && sudo apt install -y git
```

**macOS:**
```bash
# Se já tiver o Homebrew instalado:
brew install git

# Se não tiver o Homebrew, instale primeiro:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verifique a instalação:
```bash
git --version
# Esperado: git version 2.x.x
```

Configure seu nome e e-mail:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

### 2. Docker

O Docker é o coração do projeto — ele sobe o banco de dados, a API, o Nginx e a Evolution API sem que você precise instalar nada disso manualmente.

#### Windows (WSL2) e Linux (Ubuntu/Debian)

```bash
# Adiciona a chave oficial do Docker
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Adiciona o repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instala o Docker Engine + Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Permite usar o Docker sem `sudo`:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

Inicia o serviço:
```bash
sudo service docker start
```

> **No WSL2:** adicione essa linha ao final do `~/.bashrc` para iniciar o Docker automaticamente ao abrir o terminal:
> ```bash
> echo 'sudo service docker start > /dev/null 2>&1' >> ~/.bashrc
> ```

#### macOS

Baixe e instale o **Docker Desktop para Mac** pelo site oficial:
`https://www.docker.com/products/docker-desktop/`

Após instalar, abra o Docker Desktop e aguarde o ícone da baleia aparecer na barra de menu — isso indica que o Docker está rodando.

#### Verificar instalação

```bash
docker --version
# Esperado: Docker version 27.x.x

docker compose version
# Esperado: Docker Compose version v2.x.x
```

---

### 3. Node.js 20 (via NVM)

O Node.js é necessário para instalar dependências JavaScript e fazer o build do frontend.

A forma recomendada é via **NVM** (gerenciador de versões do Node), que permite trocar de versão facilmente.

**Instalar o NVM:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Feche e reabra o terminal (ou execute `source ~/.bashrc`), então instale o Node 20:

```bash
nvm install 20
nvm use 20
nvm alias default 20
```

Verifique a instalação:
```bash
node --version
# Esperado: v20.x.x

npm --version
# Esperado: 10.x.x
```

---

### 4. VS Code (recomendado)

O VS Code é o editor recomendado para o projeto.

#### Windows

Baixe e instale pelo site oficial: `https://code.visualstudio.com/`

Acesse terminal >> novo terminal e digite wsl para rodar seus próximos comandos dentro do ambiente linux

#### macOS

```bash
brew install --cask visual-studio-code
```

Ou baixe pelo site: `https://code.visualstudio.com/`

#### Linux

```bash
sudo snap install code --classic
```



---

## Verificação Final

Execute os comandos abaixo para confirmar que tudo está instalado corretamente:

```bash
git --version       # git version 2.x.x
docker --version    # Docker version 27.x.x
docker compose version  # Docker Compose version v2.x.x
node --version      # v20.x.x
npm --version       # 10.x.x
```

Se todos os comandos retornarem a versão esperada, seu ambiente está pronto.

---
