# Premium Artifacts Catalog

Este es un catálogo web completo desarrollado con **Next.js 15+** (App Router), **Tailwind CSS v4** y **Prisma (SQLite)**.

El proyecto fue construido siguiendo el diseño de interfaz **"Dark Commerce Product Feed"**, implementando un diseño minimalista oscuro, efectos de glassmorfismo y acentos elegantes.

## Características Implementadas

### Frontend (Catálogo Público)
* **Diseño Premium**: Paleta de colores oscuros (True Black, Onyx Gray), fuentes Noto Serif para titulares y Manrope para texto.
* **Catálogo Dinámico**: Listado de productos recuperados directamente de la base de datos SQLite.
* **Búsqueda Funcional**: Filtro de texto por nombre y descripción de los artefactos.
* **Filtros por Categoría**: Los clientes pueden filtrar los productos mediante categorías extraídas dinámicamente de la base de datos.
* **Componentes Modernos**: Efectos de glassmorfismo (vidrio esmerilado) en las barras de navegación y tarjetas, e interacciones suaves (hover effects).

### Panel de Administración (Backend/Admin)
* **Autenticación Segura**: Sistema de inicio de sesión utilizando `jose` (JWT) y cookies HTTP-only, además de contraseñas hasheadas con `bcryptjs`.
* **Protección de Rutas**: Un Next.js Middleware (Proxy) protege tanto el acceso a las vistas bajo `/admin` como las solicitudes destructivas (POST, DELETE) en `/api/products`.
* **Gestión de Productos**: El administrador puede:
  * Visualizar un panel con la cuenta y listado de todos los artefactos.
  * Crear nuevos productos a través de un formulario adaptado al diseño (nombre, descripción, precio, categoría y URL de imagen).
  * Eliminar productos del registro.
* **Cierre de Sesión**: Endpoint y botón funcional para limpiar las cookies de sesión.

## Stack Tecnológico

* **Framework:** Next.js (React)
* **Estilos:** Tailwind CSS v4 (con configuraciones temáticas en variables CSS)
* **Base de Datos & ORM:** SQLite gestionado a través de Prisma (`@prisma/client`)
* **Seguridad:** `jose` para JSON Web Tokens, `bcryptjs` para hashes.

## Instalación y Ejecución Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura e inicializa la base de datos:
   La base de datos SQLite y su esquema ya están definidos. Si necesitas recrearla:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. (Opcional) Puebla la base de datos con datos de prueba:
   ```bash
   npm run prisma:seed
   ```
   *Credenciales de prueba del administrador:*
   - **Correo:** `admin@catalog.com`
   - **Contraseña:** `admin123`

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el catálogo y [http://localhost:3000/login](http://localhost:3000/login) para ingresar al panel de administración.