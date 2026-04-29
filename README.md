# Catálogo Premium Aura

Catálogo web completo desarrollado con **Next.js 15+** (App Router), **Tailwind CSS v4** y **Prisma (SQLite)**.

## Características

- **Catálogo Público**: Listado de productos con diseño minimalista oscuro, glassmorfismo y efectos hover.
- **Panel de Administración**: Gestión completa de productos (crear, listar, eliminar).
- **Autenticación Segura**: JWT con cookies HTTP-only y contraseñas hasheadas con bcryptjs.
- **100% Responsive**: Diseño adaptado perfectamente para móvil, tablet y escritorio.
- **Totalmente en Español**: Toda la interfaz y mensajes están en español.

## Stack Tecnológico

- **Framework:** Next.js 16+ (React)
- **Estilos:** Tailwind CSS v4
- **Base de Datos:** SQLite con Prisma
- **Seguridad:** jose (JWT), bcryptjs (hashing)

## Instalación y Uso

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Inicializar la base de datos:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. Poblar la base de datos con datos de prueba:
   ```bash
   npx tsx prisma/seed.ts
   ```

4. Iniciar el servidor:
   ```bash
   npm run dev
   ```

## Credenciales de Administrador

- **Correo:** `admin@catalogo.com`
- **Contraseña:** `Catalogo2026!Seguro`

> ⚠️ **Importante:** Cambia las credenciales en el archivo `.env` antes de desplegar en producción.

## Estructura del Proyecto

```
catalogo/
├── src/
│   ├── app/           # Rutas y páginas (App Router)
│   ├── lib/           # Utilidades (auth, prisma)
│   └── middleware.ts  # Protección de rutas admin
├── prisma/
│   ├── schema.prisma  # Esquema de la base de datos
│   └── seed.ts        # Datos de prueba
└── .env               # Variables de entorno
```

## Seguridad

- `JWT_SECRET` generado aleatoriamente y seguro.
- Cookies HTTP-only para la sesión.
- Middleware protegiendo rutas `/admin` y operaciones de API.
- Contraseñas hasheadas con bcryptjs (salt rounds: 10).

---

© 2026 Aura Collective. Todos los derechos reservados.
