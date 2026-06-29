# NYU Library — Style Guide

## Color Palette

### Primary Colors

| Nombre      | Hex       | Preview |
|-------------|-----------|---------|
| NYU Violeta | `#57068C` | 🟣      |
| Negro       | `#000000` | ⬛      |
| Blanco      | `#FFFFFF` | ⬜      |

### Secondary Violets

| Nombre              | Hex       |
|---------------------|-----------|
| Violeta Ultra       | `#702B9D` |
| Violeta Profundo    | `#330662` |
| Violeta Medio       | `#702B9D` |
| Violeta Claro 1     | `#7B5AA6` |
| Violeta Claro 2     | `#AB82C5` |
| Violeta Claro 3     | `#EEE6F3` |

### Neutral Grays

| Nombre          | Hex       |
|-----------------|-----------|
| Gris Oscuro     | `#404040` |
| Gris Medio 1    | `#6D6D6D` |
| Gris Medio 2    | `#B8B8B8` |
| Gris Claro      | `#D6D6D6` |

### Accent Colors

| Nombre   | Hex       |
|----------|-----------|
| Verde    | `#009B8A` |
| Magenta  | `#FB0F78` |
| Celeste  | `#59B2D1` |
| Amarillo | `#F4EC51` |

---

## Typography

### Montserrat — Primary Font (Sans-serif)

Importar desde Google Fonts: `Montserrat` weights 400, 500, 700.

#### Bold (700)

| Uso                  | Tamaño |
|----------------------|--------|
| Títulos principales  | 48px   |
| Títulos de sección   | 32px   |
| Subtítulos destacados| 24px   |

#### Medium (500)

| Uso                        | Tamaño |
|----------------------------|--------|
| Encabezados secundarios    | 24px   |
| Títulos de tarjetas/modales| 18px   |
| Labels y navegación        | 14px   |

#### Regular (400)

| Uso                              | Tamaño |
|----------------------------------|--------|
| Cuerpo de texto, párrafos        | 18px   |
| Texto secundario, labels de UI   | 14px   |
| Captions, notas al pie, metadata | 12px   |

---

### Frank Ruhl Libre — Secondary Font (Serif)

Importar desde Google Fonts: `Frank Ruhl Libre` weights 400, 700.

| Uso                                        | Tamaño |
|--------------------------------------------|--------|
| Encabezados elegantes y pull quotes        | 32px   |
| Subencabezados y texto destacado           | 24px   |
| Cuerpo editorial y lectura de largo aliento| 18px   |
| Texto serif secundario y anotaciones       | 14px   |

---

## UI Components

### Buttons

#### Variantes

| Variante  | Estilo                                                                 |
|-----------|------------------------------------------------------------------------|
| Primary   | Fondo `#57068C`, texto blanco, sin borde                               |
| Secondary | Fondo gris claro / neutro, texto oscuro                                |
| Outline   | Fondo transparente, borde `#57068C`, texto `#57068C`                   |
| Ghost     | Sin fondo ni borde visible, texto con color sutil                      |
| Delete    | Fondo `#FB0F78` (Magenta), texto blanco                                |

#### Tamaños

| Tamaño   | Descripción                        |
|----------|------------------------------------|
| Pequeño  | Padding reducido, fuente 12–13px   |
| Mediano  | Padding estándar, fuente 14px      |
| Grande   | Padding amplio, fuente 16px        |

---

### Input Fields

- **Input estándar:** borde gris claro, placeholder en `#6D6D6D`, label en Montserrat Medium 14px.
- **Input activo/focus:** borde `#57068C`.
- **Input con error:** borde `#FB0F78`, mensaje de error en rojo/magenta debajo del campo (Montserrat Regular 12px).
- **Search input:** icono de lupa a la izquierda, fondo `#EEE6F3` o gris claro, texto placeholder en `#6D6D6D`.

Ejemplos de campos:
- Email Address: `student@nyu.edu`
- Password con validación: "Password must be at least 8 characters"
- Search: "Search books, journals, articles..."

---

### Cards

Contenedores con bordes redondeados y sombra suave para mostrar información agrupada.

#### Book Card
- Thumbnail/ícono del libro a la izquierda (fondo `#EEE6F3`)
- Título en Montserrat Bold 14–16px
- Autor en Montserrat Regular 14px, color gris
- Badge de disponibilidad (ver Badges)
- Año de publicación en gris

#### Notification Card
- Ícono circular de acento (Teal `#009B8A` para recordatorios)
- Título en Montserrat Bold 14px
- Mensaje en Montserrat Regular 14px
- Timestamp en Montserrat Regular 12px, color gris

---

### Badges & Tags

Indicadores de estado para libros y disponibilidad.

| Badge        | Color de fondo | Color de texto | Descripción                   |
|--------------|----------------|----------------|-------------------------------|
| Available    | `#EEE6F3`      | `#57068C`      | Libro disponible              |
| Returned     | Cyan claro     | Cyan oscuro    | Libro devuelto                |
| Overdue      | Rosa/magenta   | `#FB0F78`      | Libro con entrega vencida     |
| Reserved     | Violeta outline| `#57068C`      | Reservado por el usuario      |
| Checked Out  | `#000000`      | `#FFFFFF`      | Libro prestado actualmente    |

---

### Navigation

#### Top Navigation Bar
- Fondo: `#330662` (Deep Violet)
- Logo/nombre "NYU Library" en blanco, Montserrat Bold
- Links: Home, Catalog, My Books, Reserves, Help — Montserrat Regular 14px, color blanco
- Iconos de búsqueda y notificación a la derecha
- Avatar/iniciales del usuario (círculo violeta con iniciales en blanco)

---

### Alerts & Toasts

Mensajes de feedback para acciones del usuario y notificaciones del sistema.

| Tipo    | Color de fondo | Ícono / borde izquierdo | Uso                                        |
|---------|----------------|-------------------------|--------------------------------------------|
| Éxito   | Verde claro    | `#009B8A`               | Acción completada exitosamente             |
| Error   | Rosa claro     | `#FB0F78`               | Error o recurso no disponible              |
| Info    | Celeste claro  | `#59B2D1`               | Información general o avisos del sistema   |

Ejemplos:
- **Success:** "Book successfully reserved! You can pick it up at Bobst Library."
- **Error:** "This book is currently unavailable. Please try again later or check alternate copies."
- **Info:** "Library hours are extended during finals week: open until midnight, Mon-Fri."

---

## Resumen de tokens CSS recomendados

```css
/* Primary */
--color-violet:        #57068C;
--color-black:         #000000;
--color-white:         #FFFFFF;

/* Secondary Violets */
--color-ultra-violet:  #702B9D;
--color-deep-violet:   #330662;
--color-light-violet-1:#7B5AA6;
--color-light-violet-2:#AB82C5;
--color-light-violet-3:#EEE6F3;

/* Neutral Grays */
--color-gray-dark:     #404040;
--color-gray-mid-1:    #6D6D6D;
--color-gray-mid-2:    #B8B8B8;
--color-gray-light:    #D6D6D6;

/* Accents */
--color-teal:          #009B8A;
--color-magenta:       #FB0F78;
--color-cyan:          #59B2D1;
--color-yellow:        #F4EC51;

/* Typography */
--font-primary:   'Montserrat', sans-serif;
--font-secondary: 'Frank Ruhl Libre', serif;
```
