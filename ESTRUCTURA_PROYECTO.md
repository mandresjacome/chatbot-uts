# 📁 Estructura del Proyecto - ChatBot UTS

## 🗂️ Organización General

```
chatbot-uts/
├── 📁 backups/                    # Archivos de respaldo y versiones anteriores
│   ├── backup-test.db             # Base de datos de respaldo
│   └── package.json.backup        # Configuración anterior de dependencias
├── 📁 cache/                      # Cache de datos web scrapeados
├── 📁 config/                     # Configuraciones del sistema
├── 📁 docs/                       # Documentación del proyecto
├── 📁 logs/                       # Logs de la aplicación
├── 📁 public/                     # Archivos públicos del frontend
│   ├── 📁 assets/                 # 🎨 ASSETS ORGANIZADOS
│   │   ├── 📁 animations/         # GIFs y animaciones
│   │   │   ├── ChatbotAzulEstudiante.gif
│   │   │   ├── ChatbotGrisTodos.gif
│   │   │   ├── ChatbotNaranjaDocente.gif
│   │   │   ├── ChatbotVerdeAspirante.gif
│   │   │   └── ChatbotVerdeUTS.gif
│   │   ├── 📁 images/             # Imágenes estáticas
│   │   └── 📁 logos/              # Logos y marcas
│   │       └── logoUTS.webp
│   ├── 📁 admin/                  # Panel de administración
│   ├── 📁 chat/                   # 💬 INTERFAZ PRINCIPAL DE CHAT
│   │   ├── 📁 css/                # 🎨 ESTILOS ORGANIZADOS
│   │   │   ├── 📁 components/     # Estilos de componentes específicos
│   │   │   │   ├── malla-curricular.css    # Malla curricular completa
│   │   │   │   ├── malla-connections.css   # Conexiones de prerrequisitos
│   │   │   │   └── modal-user.css          # Modal de selección de usuario
│   │   │   └── 📁 layouts/        # Estilos de layout general
│   │   │       └── chat.css       # Interfaz principal del chat
│   │   ├── 📁 js/                 # 📜 JAVASCRIPT ORGANIZADO
│   │   │   ├── 📁 components/     # Componentes reutilizables
│   │   │   │   ├── malla-modal.js          # Modal de malla curricular
│   │   │   │   ├── modal-user.js           # Modal de selección de perfil
│   │   │   │   └── widget.js               # Widgets auxiliares
│   │   │   ├── 📁 modules/        # Módulos principales
│   │   │   │   ├── chat.js                 # Lógica principal del chat
│   │   │   │   └── malla-navigator.js      # Navegador de malla curricular
│   │   │   └── 📁 utils/          # Utilidades y helpers
│   │   │       └── simple-malla.js        # Utilidades de malla simple
│   │   ├── 📁 themes/             # Temas visuales por perfil
│   │   │   ├── aspirante.css
│   │   │   ├── docente.css
│   │   │   ├── estudiante.css
│   │   │   └── visitante.css
│   │   └── index.html             # Página principal del chat
│   └── index.html                 # Landing page del proyecto
├── 📁 scrapers/                   # Scripts de web scraping
├── 📁 scripts/                    # Scripts de automatización
├── 📁 src/                        # Código fuente del backend
│   ├── 📁 ai/                     # Integración con IA (Gemini)
│   ├── 📁 data/                   # Datos y base de conocimientos
│   ├── 📁 db/                     # Base de datos
│   ├── 📁 middlewares/            # Middlewares de Express
│   ├── 📁 nlp/                    # Procesamiento de lenguaje natural
│   ├── 📁 routes/                 # Rutas del API
│   ├── 📁 utils/                  # Utilidades del backend
│   └── server.js                  # Servidor principal
└── 📁 tests/                      # Pruebas automatizadas
```

## 🔧 Cambios Realizados en la Reorganización

### ✅ 1. Assets Visuales Reorganizados
- **Antes**: Archivos dispersos en `/public/`
- **Ahora**: Organizados en `/public/assets/` por categorías
- **Beneficios**: Fácil mantenimiento y escalabilidad

### ✅ 2. CSS Modularizado
- **Antes**: Archivos CSS mezclados en `/public/chat/`
- **Ahora**: 
  - `/css/components/` → Estilos específicos de componentes
  - `/css/layouts/` → Estilos de diseño general
  - `/themes/` → Se mantiene para temas de usuario
- **Beneficios**: Separación de responsabilidades, mejor mantenibilidad

### ✅ 3. JavaScript Estructurado
- **Antes**: Scripts mezclados en `/public/chat/`
- **Ahora**:
  - `/js/components/` → Componentes reutilizables (modales, widgets)
  - `/js/modules/` → Módulos principales (chat, navegación)
  - `/js/utils/` → Utilidades y helpers
- **Beneficios**: Código más modular y fácil de mantener

### ✅ 4. Respaldos Organizados
- **Antes**: Archivos `.backup` dispersos
- **Ahora**: Consolidados en `/backups/`
- **Beneficios**: Limpieza del directorio raíz

## 🔗 Referencias Actualizadas

### HTML Principal (`/public/chat/index.html`)
```html
<!-- CSS actualizado -->
<link rel="stylesheet" href="./css/layouts/chat.css" />
<link rel="stylesheet" href="./css/components/modal-user.css" />

<!-- Assets actualizados -->
<img src="/assets/animations/ChatbotVerdeUTS.gif" alt="Chatbot UTS" />

<!-- JavaScript actualizado -->
<script type="module" src="./js/components/modal-user.js"></script>
<script src="./js/components/malla-modal.js"></script>
<script type="module" src="./js/modules/chat.js"></script>
```

### Referencias JavaScript Actualizadas
- `malla-curricular.css` → `/chat/css/components/malla-curricular.css`
- `malla-connections.css` → `/chat/css/components/malla-connections.css`
- `malla-navigator.js` → `/chat/js/modules/malla-navigator.js`

## 🎯 Beneficios de la Nueva Estructura

1. **🧹 Organización Clara**: Cada tipo de archivo tiene su lugar específico
2. **🔧 Mantenibilidad**: Fácil localización y edición de componentes
3. **📈 Escalabilidad**: Estructura preparada para crecimiento futuro
4. **🚀 Performance**: Carga optimizada de recursos según necesidad
5. **👥 Colaboración**: Estructura estándar fácil de entender por nuevos desarrolladores

## 🚨 Notas Importantes

- ✅ **Compatibilidad**: Todas las rutas han sido actualizadas
- ✅ **Funcionalidad**: Sistema de prerrequisitos y conexiones preservado
- ✅ **Rendimiento**: CSS limpio sin duplicaciones
- ✅ **Responsivo**: Diseño adaptable mantenido

---

📅 **Fecha de reorganización**: Septiembre 2025  
🔄 **Estado**: Completado y funcional  
📝 **Próximos pasos**: Documentar componentes individuales