# Target Recon
Aluno: Pedro Henrique Stanzani de Freitas

## Descrição
Target Recon é uma ferramenta de reconhecimento de alvos com uma interface amigável e funcionalidades poderosas de análise de segurança. O frontend foi desenvolvido em React.js e um backend com FastAPI.

## Tecnologias Utilizadas

### Frontend
- React.js com TypeScript
- Vite como bundler
- shadcn/ui e TailwindCSS
- Interface moderna e responsiva

### Backend
- Python (FastAPI)
- Módulos de ferramentas especializadas para diferentes tipos de análise

## Ferramentas Disponíveis

O servidor inclui várias ferramentas especializadas para análise de alvos:

1. **SubdomainScanner**
   - Scanner de subdomínios para descoberta de infraestrutura

2. **DNS**
   - Análise de registros DNS
   - Consultas de resolução de nomes

3. **WHOIS**
   - Consulta de informações WHOIS
   - Análise de registros de domínio

4. **Wappalyzer**
   - Detecção de tecnologias web
   - Identificação de frameworks e bibliotecas

5. **PortScanner**
   - Scanner de portas
   - Análise de serviços em execução

## Estrutura do Projeto

```
.
├── client
│   ├── README.md
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── App.tsx
│   │   ├── assets
│   │   ├── components
│   │   ├── index.css
│   │   ├── lib
│   │   ├── main.tsx
│   │   ├── pages
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── server
    ├── __init__.py
    ├── main.py
    ├── models.py
    ├── requirements.txt
    └── tools
        ├── DNS.py
        ├── PortScanner.py
        ├── SubdomainScanner.py
        ├── WHOIS.py
        ├── Wappalyzer.py
        └── __init__.py
```

## Como Executar

### Pré-requisitos
- Node.js (para o frontend)
- Python 3.x (para o backend)
- pip (gerenciador de pacotes Python)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/pedrostanzani/target-recon
cd target-recon
```

2. Configure o ambiente virtual Python:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows
```

3. Instale as dependências do backend:
```bash
cd server
pip install -r requirements.txt
```

4. Instale as dependências do frontend:
```bash
cd ../client
npm install
```

### Executando o Projeto

1. Inicie o servidor backend:
```bash
cd server
uvicorn main:app --reload
```
O backend estará disponível em: http://localhost:8000

2. Em outro terminal, inicie o frontend:
```bash
cd client
npm run dev
```
O frontend estará disponível em: http://localhost:5173

### Acessando a Aplicação
Após iniciar tanto o backend quanto o frontend, você pode acessar a interface web através do navegador em:
http://localhost:5173
