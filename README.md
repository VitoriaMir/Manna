# 📚 Manna - Plataforma de Leitura e Publicação de Manhwas

![Manna Logo](https://img.shields.io/badge/Manna-Webtoon%20Platform-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Auth0](https://img.shields.io/badge/Auth0-Authentication-orange?style=for-the-badge&logo=auth0)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

> **Leia, publique e descubra manhwas em um só universo.**

Manna é uma plataforma moderna e completa para leitura e publicação de manhwas (webtoons), oferecendo uma experiência de leitura contínua no formato vertical, ferramentas profissionais para criadores e um sistema avançado de descoberta de conteúdo.

## 🌟 Funcionalidades Principais

### 📖 **Sistema de Leitura Webtoon**
- ✅ **Scroll Vertical Contínuo**: Experiência de leitura otimizada para webtoons
- ✅ **Navegação Entre Capítulos**: Controles intuitivos para próximo/anterior
- ✅ **Modo Escuro/Claro**: Interface adaptável para melhor experiência de leitura
- ✅ **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- ✅ **Lazy Loading**: Carregamento otimizado de imagens

### 🔍 **Sistema de Busca e Descoberta**
- ✅ **Busca em Tempo Real**: Pesquisa instantânea por título, autor e descrição
- ✅ **Filtros Avançados**: Por gênero, status, avaliação e data
- ✅ **Ordenação Inteligente**: Mais visualizados, melhor avaliados, alfabética, recentes
- ✅ **Sistema de Tags**: Categorização detalhada do conteúdo
- ✅ **Badges de Status**: Visual claro do status de cada série

### 🎨 **Creator Studio (CMS)**
- ✅ **Upload de Conteúdo**: Sistema drag & drop para upload de páginas
- ✅ **Gerenciamento de Séries**: CRUD completo para manhwas e capítulos
- ✅ **Sistema de Status**: Draft → Review → Published workflow
- ✅ **Processamento de Imagens**: Otimização automática (original, WebP, thumbnails)
- ✅ **Preview System**: Visualização antes da publicação
- ✅ **Dashboard Analytics**: Estatísticas de visualização e engagement

### 🔐 **Sistema de Autenticação (Auth0)**
- ✅ **Login Social**: Integração completa com Auth0
- ✅ **Roles e Permissões**: Creator, Reader, Admin, Moderator
- ✅ **Proteção de Rotas**: Acesso baseado em roles
- ✅ **Perfis de Usuário**: Informações personalizadas e estatísticas
- ✅ **Gerenciamento de Sessão**: Controle seguro de autenticação

### ⚖️ **Sistema de Moderação**
- ✅ **Workflow de Aprovação**: Controle de qualidade do conteúdo
- ✅ **Ações de Moderação**: Approve, Reject, Request Changes
- ✅ **Histórico Completo**: Log de todas as ações de moderação
- ✅ **Sistema de Notificações**: Feedback automático para creators

## 🛠️ Stack Tecnológica

### **Frontend**
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface do usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes
- **Zustand** - Gerenciamento de estado
- **next-themes** - Suporte a tema escuro/claro

### **Backend**
- **Next.js API Routes** - Endpoints serverless
- **MongoDB** - Banco de dados NoSQL
- **Auth0** - Autenticação e autorização
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens
- **UUID** - Geração de IDs únicos

### **Infraestrutura**
- **Docker** - Containerização
- **Supervisor** - Gerenciamento de processos
- **Nginx** - Proxy reverso (configuração padrão)
- **Node.js 20** - Runtime JavaScript

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ 
- MongoDB 5+
- Conta Auth0
- Yarn ou npm

### **1. Clone o Repositório**
```bash
git clone <repository-url>
cd manna-platform
```

### **2. Instale as Dependências**
```bash
yarn install
# ou
npm install
```

### **3. Configure as Variáveis de Ambiente**
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=manna_db

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*

# Auth0 Configuration
AUTH0_SECRET=seu-auth0-secret-aqui
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://seu-dominio.auth0.com
AUTH0_CLIENT_ID=seu-client-id-auth0
AUTH0_CLIENT_SECRET=seu-client-secret-auth0
```

### **4. Configure o Auth0**

1. **Criar Aplicação no Auth0:**
   - Tipo: "Regular Web Application"
   - Nome: "Manna Platform"

2. **URLs de Callback:**
   ```
   http://localhost:3000/api/auth/callback
   ```

3. **URLs de Logout:**
   ```
   http://localhost:3000
   ```

4. **Criar Roles:**
   - `creator` - Para criadores de conteúdo
   - `reader` - Para leitores
   - `admin` - Para administradores
   - `moderator` - Para moderadores

5. **Rule para Adicionar Roles ao Token:**
   ```javascript
   function(user, context, callback) {
     const namespace = 'https://manna-app.com';
     
     if (context.authorization && context.authorization.roles) {
       const assignedRoles = context.authorization.roles;
       
       if (context.idToken) {
         context.idToken[`${namespace}/roles`] = assignedRoles;
       }
       
       if (context.accessToken) {
         context.accessToken[`${namespace}/roles`] = assignedRoles;
       }
     }
     
     callback(null, user, context);
   }
   ```

### **5. Inicie o MongoDB**
```bash
# MongoDB local
mongod --dbpath ./data/db

# Ou usando Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### **6. Execute a Aplicação**
```bash
# Desenvolvimento
yarn dev

# Produção
yarn build
yarn start
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
manna-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...auth0]/      # Auth0 routes
│   │   ├── content/              # Content management API
│   │   ├── upload/               # File upload API
│   │   └── manhwas/              # Manhwa API
│   ├── globals.css               # Estilos globais
│   ├── layout.js                 # Layout principal
│   └── page.js                   # Página principal
├── components/                   # Componentes React
│   ├── auth/                     # Componentes de autenticação
│   ├── cms/                      # Componentes do CMS
│   ├── ui/                       # Componentes shadcn/ui
│   └── providers/                # Providers (Auth, Theme)
├── lib/                          # Utilities e configurações
├── public/                       # Arquivos estáticos
│   └── uploads/                  # Uploads de usuários
├── .env                          # Variáveis de ambiente
├── tailwind.config.js           # Configuração Tailwind
├── package.json                 # Dependências do projeto
└── README.md                    # Este arquivo
```

## 🎯 Guia de Uso

### **Para Leitores**
1. **Navegue pela Home** para ver manhwas em destaque
2. **Use a Busca** para encontrar conteúdo específico
3. **Aplique Filtros** por gênero, status e avaliação
4. **Clique em uma série** para começar a ler
5. **Desfrute da leitura** com scroll vertical contínuo

### **Para Criadores**
1. **Faça Login** com sua conta Auth0
2. **Acesse o Creator Studio** via perfil do usuário
3. **Crie uma Nova Série** com título, descrição e capa
4. **Faça Upload das Páginas** usando drag & drop
5. **Organize os Capítulos** na ordem desejada
6. **Publique o Conteúdo** ou envie para revisão

### **Para Moderadores/Admins**
1. **Acesse o Painel de Moderação**
2. **Revise o Conteúdo** na fila de aprovação
3. **Aprove ou Rejeite** com comentários
4. **Monitore as Estatísticas** da plataforma

## 📊 API Endpoints

### **Autenticação**
- `GET /api/auth/login` - Iniciar login Auth0
- `GET /api/auth/logout` - Logout
- `GET /api/auth/callback` - Callback Auth0
- `GET /api/auth/me` - Dados do usuário atual

### **Manhwas**
- `GET /api/manhwas` - Listar todos os manhwas
- `GET /api/manhwas/search` - Buscar manhwas
- `GET /api/manhwas/genres` - Listar gêneros disponíveis
- `GET /api/manhwas/:id` - Obter manhwa específico
- `POST /api/manhwas` - Criar novo manhwa

### **Gerenciamento de Conteúdo**
- `GET /api/content` - Listar conteúdo (autenticado)
- `POST /api/content` - Criar conteúdo (creator)
- `PUT /api/content` - Atualizar conteúdo (creator/admin)
- `DELETE /api/content` - Deletar conteúdo (creator/admin)
- `POST /api/content/:id/approve` - Moderar conteúdo (admin/moderator)

### **Upload de Arquivos**
- `POST /api/upload` - Upload de imagens (creator)

## 🧪 Testes

### **Backend Testing**
```bash
# Execute os testes do backend
python backend_test.py
```

### **Frontend Testing**
Os testes frontend são realizados via Playwright e incluem:
- Navegação entre páginas
- Funcionalidades de busca
- Upload de conteúdo
- Sistema de autenticação

## 🔒 Segurança

### **Autenticação e Autorização**
- ✅ **Auth0 Integration**: Autenticação segura via OAuth
- ✅ **Role-Based Access**: Controle de acesso baseado em roles
- ✅ **JWT Tokens**: Tokens seguros para API access
- ✅ **CORS Configuration**: Headers apropriados para produção

### **Validação de Dados**
- ✅ **Input Sanitization**: Sanitização de todos os inputs
- ✅ **File Type Validation**: Apenas imagens aceitas para upload
- ✅ **Size Limits**: Controle de tamanho de arquivos (10MB max)
- ✅ **MongoDB Injection Protection**: Queries seguras

### **Controle de Arquivos**
- ✅ **Upload Security**: Validação de tipo MIME
- ✅ **Image Processing**: Sharp para processamento seguro
- ✅ **File Organization**: Estrutura organizada de pastas
- ✅ **Access Control**: Acesso baseado em permissões

## 🚀 Deploy em Produção

### **Variáveis de Ambiente de Produção**
```env
MONGO_URL=sua-mongodb-connection-string
AUTH0_BASE_URL=https://seu-dominio.com
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com
```

### **Build de Produção**
```bash
# Build otimizado
yarn build

# Iniciar em produção
yarn start
```

### **Docker (Opcional)**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📝 Roadmap

### **Próximas Funcionalidades**
- [ ] **Sistema de Pagamentos** (Stripe integration)
- [ ] **Funcionalidades Sociais** (comentários, likes, follows)
- [ ] **Notificações Push** para novos capítulos
- [ ] **Analytics Avançados** para creators
- [ ] **API Mobile** para aplicativo nativo
- [ ] **Sistema de Assinatura Premium**
- [ ] **Modo Offline** para leitura
- [ ] **Internacionalização** (i18n)

### **Melhorias Técnicas**
- [ ] **Cache Redis** para performance
- [ ] **CDN Integration** para imagens
- [ ] **Search Engine** (Elasticsearch)
- [ ] **Real-time Notifications** (WebSocket)
- [ ] **Image Optimization** avançada
- [ ] **Progressive Web App** (PWA)

## 🐛 Problemas Conhecidos

### **Ambiente de Produção**
- ⚠️ **Auth0 502 Error**: Problema de infraestrutura em alguns ambientes
- **Solução**: Funciona perfeitamente em localhost e a maioria dos hosts

### **Limitações Atuais**
- Upload limitado a 10MB por arquivo
- Processamento de imagem em tempo real (pode ser lento para arquivos grandes)
- Busca básica (implementação Elasticsearch planejada)

## 📞 Suporte

### **Documentação**
- [Auth0 Documentation](https://auth0.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

### **Contato**
- 🐛 **Bugs**: Abra uma issue no GitHub
- 💡 **Feature Requests**: Discussões no GitHub
- 📧 **Suporte**: Entre em contato via GitHub

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Manna** - Transformando a experiência de leitura de manhwas, um scroll por vez. 📚✨

*Desenvolvido com ❤️ usando Next.js, Auth0 e MongoDB*