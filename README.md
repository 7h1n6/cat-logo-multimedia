# Generador de Catálogos Multimedia 🎮🎬

Aplicación web full-stack desarrollada bajo el patrón MVC para crear catalogos de contenido multimedia (Juegos, Series, Películas, etc.).

## Funcionalidades
- Registro y login con JWT (Roles: user y admin).
- CRUD completo para ítems (Juegos, Series, Películas, etc.).
- Panel de administración para crear/editar Categorías, Subcategorías y Géneros dinámicamente.
- Subida de imágenes de portada con Multer.
- **Generador de Catálogos:** Exporta un archivo ZIP con el HTML del catálogo y las imágenes incrustadas para visualización offline.

## Tecnologías
- Node.js & Express
- MongoDB & Mongoose
- EJS (Motor de plantillas)
- JWT & bcryptjs
- Multer, Helmet, connect-flash, archiver.

## Instalación Local
1. Clonar el repositorio: `git clone ...`
2. Instalar dependencias: `npm install`
3. Crear un archivo `.env` con:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://user:password@cmnode.nzonsqo.mongodb.net/
   JWT_SECRET=El_secreto_de_Node_2026