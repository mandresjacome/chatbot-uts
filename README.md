# Chatbot UTS v1.2.0 🤖

Chatbot inteligente para las Unidades Tecnológicas de Santander (UTS) desarrollado con Node.js, Express, SQLite y integración con Google Gemini AI.

## 🚀 Características

- **Chat inteligente** con procesamiento de lenguaje natural
- **Base de conocimientos** específica de la UTS
- **Búsqueda difusa** con Fuse.js para mejores resultados
- **Integración con Gemini AI** para respuestas contextuales
- **Persistencia de datos** con SQLite
- **Panel de administración** con métricas en tiempo real
- **Sistema de feedback** para mejorar la calidad
- **API REST** completa y documentada

## 🛠️ Tecnologías

- **Backend**: Node.js + Express.js
- **Base de datos**: SQLite3
- **IA**: Google Generative AI (Gemini 2.5-flash)
- **NLP**: Fuse.js + compromise
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Testing**: Jest + Supertest

## 📁 Estructura del proyecto

```
chatbot-uts/
├── src/
│   ├── server.js           # Servidor principal
│   ├── routes/
│   │   ├── chat.js         # Endpoint del chatbot
│   │   ├── feedback.js     # Sistema de feedback
│   │   └── admin.js        # Panel de administración
│   ├── nlp/
│   │   └── retriever.js    # Búsqueda en base de conocimientos
│   ├── ai/
│   │   └── geminiClient.js # Cliente de Gemini AI
│   ├── db/
│   │   ├── index.js        # Conexión a SQLite
│   │   └── repositories.js # Repositorios de datos
│   ├── utils/
│   │   ├── normalize.js    # Normalización de texto
│   │   └── id.js          # Generación de IDs
│   └── data/
│       └── knowledge.json  # Base de conocimientos UTS
├── public/
│   └── admin/              # Panel de administración web
│       ├── index.html
│       ├── admin.css
│       └── admin.js
├── tests/
│   └── chat.test.js        # Tests del sistema
└── package.json
```

## ⚡ Instalación rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/chatbot-uts.git
cd chatbot-uts
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tu API key de Google Gemini
```

4. **Iniciar en desarrollo**
```bash
npm run dev
```

5. **Acceder a la aplicación**
- Chat API: http://localhost:3001/api/chat/message
- Panel Admin: http://localhost:3001/admin
- Health Check: http://localhost:3001/api/health

## 🔧 Variables de entorno

```env
# API Key de Google Gemini (requerida)
GEMINI_API_KEY=tu_api_key_aqui

# Configuración del servidor
PORT=3001
NODE_ENV=development

# Configuración de IA
USE_LLM=true
```

## 📡 API Endpoints

### Chat
```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "¿Cuáles son los programas de ingeniería?",
  "sessionId": "session-123",
  "tipoUsuario": "estudiante"
}
```

### Feedback
```http
POST /api/feedback
Content-Type: application/json

{
  "sessionId": "session-123",
  "conversationId": 1,
  "rating": 5,
  "comment": "Muy útil"
}
```

### Métricas (Admin)
```http
GET /api/admin/metrics
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## 🚀 Despliegue

### Producción
```bash
# Instalar dependencias de producción
npm ci --only=production

# Iniciar servidor
npm start
```

### Con PM2
```bash
npm install -g pm2
pm2 start src/server.js --name "chatbot-uts"
pm2 startup
pm2 save
```

## 📊 Panel de administración

Accede a `/admin` para ver:
- 📈 Métricas en tiempo real
- 💬 Últimas conversaciones
- ⭐ Índice de satisfacción
- 🔧 Estado del sistema

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

ISC License - ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Mario Andrés Jácome Mantilla**  
Unidades Tecnológicas de Santander

---

<div align="center">
  <p>Hecho con ❤️ para la comunidad UTS</p>
</div>
