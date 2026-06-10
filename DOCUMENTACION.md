# Documentación Técnica — Snackiverse

> Sistema de gestión de cafetería escolar. Permite registrar ventas, recargas, pagos y generar informes por estudiante. Desarrollado con Next.js 15 App Router, Prisma ORM y PostgreSQL.

---

## Tabla de contenidos

1. [Convenciones del proyecto](#1-convenciones-del-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura general](#3-arquitectura-general)
4. [Base de datos](#4-base-de-datos)
5. [Autenticación y autorización](#5-autenticación-y-autorización)
6. [Módulos y API](#6-módulos-y-api)
7. [Pruebas unitarias (Vitest)](#7-pruebas-unitarias-vitest)
8. [Pruebas de rendimiento (k6)](#8-pruebas-de-rendimiento-k6)
9. [Casos de prueba](#9-casos-de-prueba)
10. [Scripts disponibles](#10-scripts-disponibles)

---

## 1. Convenciones del proyecto

### Convención monetaria
Todos los valores de dinero se almacenan como **enteros en pesos colombianos (COP)**, sin decimales.

```
2500 = $2.500 COP
20000 = $20.000 COP
```

El formateador compartido vive en `src/lib/currency.ts`. Nunca se usan floats para dinero.

### Tipos de estudiantes

| Tipo       | Descripción                                              | Manejo de saldo  |
|------------|----------------------------------------------------------|------------------|
| `prepaid`  | Paga por adelantado. Tiene saldo recargable.             | Se descuenta en cada venta. Puede quedar negativo (sistema de deuda). |
| `weekly`   | Paga semana a semana al vendedor.                        | Sin descuento automático de saldo. |
| `monthly`  | Paga mensualmente.                                       | Sin descuento automático de saldo. |
| `biweekly` | Paga cada quince días.                                   | Sin descuento automático de saldo. |

### Sistema de deuda (prepago)
El saldo de un estudiante prepago **puede quedar negativo**. Esto es comportamiento esperado: el vendedor atiende al estudiante anotando lo que debe, y luego se ajusta con la siguiente recarga. El sistema muestra la deuda como "saldo en rojo" en el dashboard.

---

## 2. Stack tecnológico

| Capa              | Tecnología                         |
|-------------------|------------------------------------|
| Framework         | Next.js 15 (App Router)            |
| UI                | React 19 + MUI (Material UI) v9   |
| Estado del servidor | TanStack React Query v5           |
| Formularios       | React Hook Form + Zod              |
| ORM               | Prisma v6                          |
| Base de datos     | PostgreSQL                         |
| Autenticación     | JWT con `jose` + cookies HTTP-only |
| Hash de contraseñas | `bcrypt`                         |
| Testing unitario  | Vitest                             |
| Testing de rendimiento | k6                            |
| Exportación de imágenes | `html-to-image`             |
| Estilos globales  | Emotion (requerido por MUI)        |

---

## 3. Arquitectura general

```
snackiverse/
├── app/                        # Rutas y páginas (Next.js App Router)
│   ├── api/                    # API Routes (endpoints REST)
│   │   ├── auth/               # login, logout, register
│   │   ├── categories/         # CRUD categorías
│   │   ├── payments/           # pagos
│   │   ├── products/           # CRUD productos
│   │   ├── recharges/          # recargas de saldo
│   │   ├── reports/            # reportes (morosos, paz-y-salvo, ventas, pendientes)
│   │   ├── sales/              # registro de ventas
│   │   ├── students/           # CRUD estudiantes
│   │   ├── tags/               # CRUD etiquetas
│   │   └── users/              # gestión de usuarios/vendedores
│   ├── dashboard/              # Página principal (admin)
│   ├── sales/                  # Registro de ventas (vendor)
│   ├── students/               # Gestión de estudiantes
│   ├── products/               # Gestión de productos
│   ├── reports/                # Comprobante por estudiante
│   ├── reports-center/         # Reportes generales
│   ├── recharges/              # Recargas de saldo
│   ├── payments/               # Pagos
│   ├── users/                  # Gestión de vendedores
│   └── catalog/                # Catálogo de productos y categorías
│
├── src/
│   ├── lib/                    # Utilidades compartidas
│   │   ├── prisma.ts           # Instancia singleton de PrismaClient
│   │   ├── api-auth.ts         # authorizeAdmin(), isPrismaNotFoundError()
│   │   └── currency.ts         # Formateador COP
│   └── modules/                # Módulos de negocio
│       ├── auth/               # Autenticación
│       ├── dashboard/          # Dashboard y métricas
│       ├── students/           # Estudiantes
│       ├── products/           # Productos y categorías
│       ├── sales/              # Ventas
│       ├── recharges/          # Recargas
│       ├── payments/           # Pagos
│       ├── reports/            # Comprobante individual
│       ├── reports-center/     # Centro de reportes
│       ├── catalog/            # Catálogo visual
│       ├── tags/               # Etiquetas de restricción
│       ├── vendors/            # Vendedores
│       └── users/              # Administración de usuarios
│
├── prisma/
│   ├── schema.prisma           # Modelos de la BD
│   ├── seed.ts                 # Datos iniciales (admin por defecto)
│   └── seed-students-test.ts   # 100 estudiantes de prueba para tests de carga
│
├── tests/
│   └── performance/            # Scripts de k6
│       ├── concurrency-sale.js # Prueba de concurrencia (5 VUs, 1 estudiante)
│       ├── load-sales.js       # Prueba de carga (7 VUs, 30s)
│       ├── reports-speed.js    # Velocidad de reportes (1 VU, 10 iter.)
│       └── stress-sales.js     # Prueba de estrés (5→30 VUs escalonado)
│
├── middleware.ts               # Protección de rutas por rol
└── AGENTS.md                   # Instrucciones para agentes IA
```

### Patrón de módulos

Cada módulo dentro de `src/modules/` sigue esta estructura:

```
módulo/
├── components/     # Componentes React del módulo
├── schemas/        # Esquemas Zod de validación
└── services/
    ├── *.service.ts            # Lógica de negocio (acceso a BD)
    └── __tests__/              # Tests unitarios con Vitest
```

---

## 4. Base de datos

### Modelos principales

#### `User` — Usuarios del sistema
```
id, name, email (único), password (bcrypt), role (admin|vendor), createdAt
```
Relaciones: `Sale[]` (ventas registradas por este usuario)

#### `Student` — Estudiantes de la cafetería
```
id, name, grade, type (prepaid|weekly|monthly|biweekly),
balance (Int, COP), isActive, guardianWhatsapp?, tiqueteraExpiresAt?,
createdAt
```
Relaciones: `StudentRestriction[]`, `Sale[]`, `Recharge[]`, `Payment[]`

#### `Product` — Productos de la cafetería
```
id, name, icon?, price (Int, COP), categoryId?, isActive, createdAt, updatedAt
```
Relaciones: `Category?`, `ComboItem[]` (si es combo), `ProductTag[]`, `SaleItem[]`

#### `Category` — Categorías de productos
```
id, name, slug (único), icon?, createdAt
```

#### `Tag` — Etiquetas de restricción alimentaria
```
id, name (único)
```
Permite marcar productos con etiquetas (ej. "maní", "lactosa") y restringir estudiantes para que no puedan comprar productos con esas etiquetas.

#### `ProductTag` — Relación producto ↔ etiqueta (tabla pivote)
```
productId, tagId  (clave compuesta)
```

#### `StudentRestriction` — Restricciones del estudiante (tabla pivote)
```
studentId, tagId  (clave compuesta)
```

#### `ComboItem` — Ítems de un producto combo
```
id, comboId (→ Product), itemId (→ Product)
```

#### `Sale` — Registro de ventas
```
id, studentId? (nulo si es venta sin estudiante), vendorId, total (Int, COP), createdAt
```
Relaciones: `Student?`, `User` (vendor), `SaleItem[]`

#### `SaleItem` — Ítem de una venta
```
id, saleId, productId, quantity, unitPrice (Int), subtotal (Int)
```

#### `Recharge` — Recargas de saldo
```
id, studentId, amount (Int, COP), note?, createdAt
```

#### `Payment` — Pagos a vendedores (weekly/monthly/biweekly)
```
id, studentId, amount (Int, COP), note?, createdAt
```
El campo `note` puede codificar el método de pago con el formato `"método|nota"` (ej. `"Efectivo|Pago semanal"`).

### Migraciones

Las migraciones se encuentran en `prisma/migrations/`. El historial refleja la evolución del sistema:

1. `20260524225508` — Modelos de negocio base
2. `20260525170000` — Campo `guardianWhatsapp` en Student
3. `20260525201446` — Categorías de productos
4. `20260526195640` — Campos de combo en productos
5. `20260526232559` — Tags de restricción por producto
6. `20260526233222` — Eliminación de stock de productos
7. `20260527000000` — Corrección typo enum `biweekly`
8. `20260527000001` — Tabla `combo_items`
9. `20260527004113` — Reemplazo de restriction tags por `isRestricted`
10. `20260527182328` — Tags y restricciones de estudiantes
11. `20260528002753` — Ventas, recargas y pagos
12. `20260528004147` — Icono en categorías
13. `20260602181352` — Campo `tiqueteraExpiresAt` en Student

---

## 5. Autenticación y autorización

### Flujo de autenticación

1. El usuario envía `email` + `password` a `POST /api/auth/login`.
2. El servidor valida las credenciales con bcrypt y firma un JWT con `jose`.
3. El JWT se guarda en una cookie HTTP-only llamada `token` con 7 días de expiración.
4. Cada request siguiente incluye la cookie automáticamente; el middleware la verifica.

### JWT payload
```json
{
  "userId": "cuid...",
  "role": "admin" | "vendor",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Protección de rutas — `middleware.ts`

El middleware intercepta todas las rutas y aplica estas reglas:

| Rutas                        | Acceso           |
|------------------------------|------------------|
| `/login`                     | Público          |
| `/api/auth/*`                | Público          |
| `/api/reports/morosos`, `/api/reports/paz-y-salvo`, `/api/reports/pendientes`, `/api/reports/sales`, `/api/categories/*`, `/api/tags/*`, `/api/users/*`, `/api/recharges` (GET) | Solo admin |
| Todo lo demás                | Cualquier usuario autenticado |

Las rutas de admin usan el helper `authorizeAdmin()` de `src/lib/api-auth.ts`:

```typescript
export async function authorizeAdmin(): Promise<NextResponse | null>
```

Retorna un `NextResponse` con error 401/403 si el usuario no cumple, o `null` si está autorizado.

---

## 6. Módulos y API

### Auth (`/api/auth/`)

| Método | Endpoint               | Descripción                          |
|--------|------------------------|--------------------------------------|
| POST   | `/api/auth/login`      | Inicia sesión. Crea cookie JWT.      |
| POST   | `/api/auth/logout`     | Cierra sesión. Borra cookie.         |
| POST   | `/api/auth/register`   | Registra un nuevo usuario (admin).   |

### Students (`/api/students/`)

| Método | Endpoint                  | Acceso | Descripción               |
|--------|---------------------------|--------|---------------------------|
| GET    | `/api/students`           | Auth   | Lista todos los estudiantes |
| POST   | `/api/students`           | Auth   | Crea un estudiante        |
| GET    | `/api/students/[id]`      | Auth   | Obtiene un estudiante     |
| PUT    | `/api/students/[id]`      | Auth   | Actualiza un estudiante   |
| DELETE | `/api/students/[id]`      | Auth   | Elimina un estudiante     |

### Products (`/api/products/`)

| Método | Endpoint               | Acceso | Descripción             |
|--------|------------------------|--------|-------------------------|
| GET    | `/api/products`        | Auth   | Lista productos activos |
| POST   | `/api/products`        | Auth   | Crea un producto        |
| PUT    | `/api/products/[id]`   | Auth   | Actualiza un producto   |
| DELETE | `/api/products/[id]`   | Auth   | Desactiva un producto   |

### Categories (`/api/categories/`)

| Método | Endpoint                  | Acceso | Descripción           |
|--------|---------------------------|--------|-----------------------|
| GET    | `/api/categories`         | Auth   | Lista categorías      |
| POST   | `/api/categories`         | Admin  | Crea una categoría    |
| PUT    | `/api/categories/[id]`    | Admin  | Actualiza categoría   |
| DELETE | `/api/categories/[id]`    | Admin  | Elimina categoría     |

### Tags (`/api/tags/`)

| Método | Endpoint            | Acceso | Descripción         |
|--------|---------------------|--------|---------------------|
| GET    | `/api/tags`         | Auth   | Lista etiquetas     |
| POST   | `/api/tags`         | Admin  | Crea una etiqueta   |
| PUT    | `/api/tags/[id]`    | Admin  | Actualiza etiqueta  |
| DELETE | `/api/tags/[id]`    | Admin  | Elimina etiqueta    |

### Sales (`/api/sales/`)

| Método | Endpoint      | Acceso | Descripción                            |
|--------|---------------|--------|----------------------------------------|
| POST   | `/api/sales`  | Auth   | Registra una venta                     |

**Lógica de `createSale` (sale.service.ts):**
1. Obtiene los precios reales de la BD (nunca confía en el cliente).
2. Calcula subtotales y total.
3. Abre una transacción Prisma (callback form):
   - Si el estudiante es `prepaid`, descuenta el total de su saldo (puede quedar negativo).
   - Crea la venta con sus `SaleItem`.
4. Retorna el DTO de la venta.

### Recharges (`/api/recharges/`)

| Método | Endpoint          | Acceso | Descripción                    |
|--------|-------------------|--------|--------------------------------|
| GET    | `/api/recharges`  | Admin  | Lista recargas recientes       |
| POST   | `/api/recharges`  | Admin  | Registra una recarga           |

**Lógica de `createRecharge` (recharge.service.ts):**
1. Verifica que el estudiante exista y esté activo.
2. Abre una transacción Prisma (array form):
   - Crea el registro `Recharge`.
   - Incrementa `balance` del estudiante.
3. Retorna el DTO con `balanceAfter`.

> Las recargas aplican a **cualquier tipo de estudiante**, no solo prepago.

### Payments (`/api/payments/`)

| Método | Endpoint          | Acceso | Descripción               |
|--------|-------------------|--------|---------------------------|
| GET    | `/api/payments`   | Auth   | Lista pagos recientes     |
| POST   | `/api/payments`   | Auth   | Registra un pago          |

El método de pago se codifica en el campo `note` con el formato `"método|nota_adicional"` (ej. `"Efectivo|Pago semanal de Camila"`).

### Users (`/api/users/`)

| Método | Endpoint            | Acceso | Descripción              |
|--------|---------------------|--------|--------------------------|
| GET    | `/api/users`        | Admin  | Lista usuarios/vendedores |
| POST   | `/api/users`        | Admin  | Crea un vendedor         |
| DELETE | `/api/users/[id]`   | Admin  | Elimina un vendedor      |

### Reports — Comprobante individual (`/api/reports/`)

| Método | Endpoint                            | Acceso | Descripción                                  |
|--------|-------------------------------------|--------|----------------------------------------------|
| GET    | `/api/reports?studentId=&from=&to=` | Admin  | Comprobante de un estudiante en un período   |

Retorna: datos del estudiante, ventas detalladas (con ítems), recargas, totales consumido y recargado.

El comprobante muestra la **fecha de cada recarga** para todos los tipos de estudiante.

### Reports — Centro de reportes (`/api/reports/`)

| Método | Endpoint                                      | Acceso | Descripción                                        |
|--------|-----------------------------------------------|--------|----------------------------------------------------|
| GET    | `/api/reports/morosos`                        | Admin  | Estudiantes prepago con saldo negativo             |
| GET    | `/api/reports/paz-y-salvo`                    | Admin  | Estudiantes prepago con saldo ≥ 0                  |
| GET    | `/api/reports/pendientes?from=&to=&type=`     | Admin  | Estudiantes con pagos pendientes (weekly/monthly)  |
| GET    | `/api/reports/sales?from=&to=`                | Admin  | Resumen de ventas en un período                    |

### Dashboard (`/app/dashboard/`)

Página principal del admin. Muestra mediante `dashboard.service.ts`:
- Total de ventas del día
- Número de ventas del día
- Estudiantes morosos (prepago con balance < 0)
- Estudiantes con bajo saldo (prepago con balance < umbral)
- Tiqueteras próximas a vencer (`tiqueteraExpiresAt` en los próximos 7 días)

---

## 7. Pruebas unitarias (Vitest)

### Configuración

`vitest.config.ts` — ambiente `node`, alias `@` → `./src`, cobertura con v8.

Comandos:
```bash
npm test               # ejecución única
npm run test:watch     # modo watch
npm run test:coverage  # con reporte de cobertura
```

### Suite de tests — 37 tests en total

#### `src/lib/__tests__/currency.test.ts`
Tests del formateador de moneda COP.

#### `src/modules/products/services/__tests__/product.service.test.ts`
Tests del servicio de productos.

#### `src/modules/students/services/__tests__/student.service.test.ts`
Tests del servicio de estudiantes.

#### `src/modules/sales/services/__tests__/sale.service.test.ts` — 10 tests

Cubre los casos: CP-05, CP-06, CP-07, CP-17, CP-18, CP-20.

**Patrón de mock** — `$transaction` usa la forma callback:
```typescript
vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => any) => {
  const tx = {
    student: { findUnique: vi.fn(), update: vi.fn() },
    sale: { create: vi.fn() },
  };
  return fn(tx);
});
```

| Test | Caso | Descripción |
|------|------|-------------|
| 1 | CP-05 | Venta exitosa con saldo positivo — retorna DTO correcto |
| 2 | CP-05 | Decrementa saldo del estudiante prepago |
| 3 | CP-06 | Permite venta con saldo en 0 (genera deuda) |
| 4 | CP-06 | Llama a decrement aunque el saldo sea 0 |
| 5 | CP-07 | Permite venta con saldo negativo (deuda se acumula) |
| 6 | CP-17 | Estudiante activo puede comprar normalmente |
| 7 | CP-18 | Estudiante inactivo no puede comprar |
| 8 | CP-18 | No crea la venta si el estudiante está inactivo |
| 9 | CP-20 | Inactividad tiene precedencia sobre saldo positivo |
| 10 | Error | Lanza error si el producto no existe o está inactivo |

#### `src/modules/recharges/services/__tests__/recharge.service.test.ts` — 5 tests

Cubre el caso CP-09.

**Patrón de mock** — `$transaction` usa la forma array (diferente a ventas):
```typescript
vi.mocked(prisma.$transaction).mockImplementation((ops: any) => Promise.all(ops));
```

Esta diferencia es crítica: `createRecharge` pasa un array de promesas a `$transaction`, mientras que `createSale` pasa una función callback.

| Test | Descripción |
|------|-------------|
| 1 | Saldo pasa de -10.000 a -4.000 tras recarga de 6.000 |
| 2 | No resetea el saldo a 0 si la recarga es menor que la deuda |
| 3 | Llama a `student.update` con `increment` del monto correcto |
| 4 | Lanza error si el estudiante no existe |
| 5 | Lanza error si el estudiante está inactivo |

---

## 8. Pruebas de rendimiento (k6)

Requiere k6 instalado: `winget install k6`

Ejecutar cualquier prueba:
```bash
k6 run tests/performance/<archivo>.js
```

### Prueba de concurrencia — `concurrency-sale.js`

**Objetivo:** Verificar que las transacciones Prisma son seguras bajo concurrencia (varios vendedores atendiendo al mismo estudiante simultáneamente).

| Parámetro | Valor |
|-----------|-------|
| VUs       | 5     |
| Duración  | 15s   |
| Umbral    | p(95) < 1000ms |

**Escenario:** 5 usuarios virtuales lanzan ventas al mismo estudiante prepago de forma simultánea. El saldo puede quedar muy negativo — esto es esperado por el sistema de deuda.

**Resultado observado:** Sin errores 500. El saldo refleja la acumulación de deuda correctamente. La cafetería opera con un máximo de ~4 vendedores simultáneos en la práctica, por lo que este escenario cubre el caso de uso real.

### Prueba de velocidad de reportes — `reports-speed.js`

**Objetivo:** Medir el tiempo de respuesta de los 4 endpoints de reporte.

| Parámetro  | Valor   |
|------------|---------|
| VUs        | 1       |
| Iteraciones | 10     |
| Umbral     | p(95) < 500ms por endpoint |

**Endpoints probados:** `/api/reports/morosos`, `/api/reports/pendientes`, `/api/reports/paz-y-salvo`, `/api/reports/sales`

> Nota: `pendientes` y `sales` requieren parámetros `from`, `to` y `type`. Sin ellos retornan 400. Los endpoints responden en ~96-226ms bajo condiciones normales.

### Prueba de carga — `load-sales.js`

**Objetivo:** Simular 7 vendedores registrando ventas simultáneamente durante 30 segundos.

| Parámetro | Valor |
|-----------|-------|
| VUs       | 7     |
| Duración  | 30s   |
| Umbrales  | p(95) < 2000ms, checks > 95% |

**Estrategia:** Usa `setup()` para obtener los IDs de estudiantes activos desde la API antes de iniciar. Cada VU elige un estudiante diferente del pool para simular la distribución real de la cafetería.

### Prueba de estrés — `stress-sales.js`

**Objetivo:** Encontrar el punto donde el sistema empieza a degradarse.

| Etapa | VUs | Duración |
|-------|-----|----------|
| 1     | 5   | 30s      |
| 2     | 10  | 30s      |
| 3     | 20  | 30s      |
| 4     | 30  | 30s      |
| Bajada | 0  | 15s      |

**Umbrales:** p(95) < 3000ms, tasa de errores < 5%.

**Resultado observado:** El sistema soportó hasta 30 VUs sin errores internos (HTTP 500). Todos los checks pasaron.

---

## 9. Casos de prueba

Casos de prueba documentados en `casos_prueba_snackiverse.xlsx`.

### Leyenda

- ✅ Automatizado (Vitest)
- 🔧 Manual
- ➖ N/A

### Módulo: Ventas

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-01 | Venta con múltiples productos distintos                  | 🔧     |
| CP-02 | Registro de venta sin estudiante asignado                | 🔧     |
| CP-03 | Venta con producto combo                                 | 🔧     |
| CP-04 | Intento de venta con producto inactivo                   | 🔧     |
| CP-05 | Venta exitosa con saldo positivo                         | ✅     |
| CP-06 | Venta con saldo en 0 queda en deuda                      | ✅     |
| CP-07 | Venta con saldo negativo acumula deuda                   | ✅     |
| CP-08 | Confirmación de venta con saldo en rojo                  | 🔧 ✓  |

### Módulo: Recargas

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-09 | Pago parcial de deuda actualiza saldo correctamente      | ✅     |
| CP-10 | Recarga a estudiante sin deuda                           | ➖     |

### Módulo: Reportes

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-11 | Reporte de morosos lista estudiantes con saldo negativo  | 🔧     |
| CP-12 | Reporte paz-y-salvo lista estudiantes sin deuda          | 🔧     |
| CP-13 | Comprobante individual muestra ventas del período        | 🔧     |
| CP-14 | Comprobante muestra recargas con fecha                   | 🔧     |
| CP-15 | Reporte de pendientes filtra por tipo de estudiante      | 🔧     |

### Módulo: Estudiantes

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-16 | Crear estudiante con datos válidos                       | 🔧     |
| CP-17 | Estudiante activo puede comprar normalmente              | ✅     |
| CP-18 | Estudiante inactivo no puede comprar                     | ✅     |
| CP-19 | Actualizar tipo de estudiante                            | 🔧     |
| CP-20 | Estudiante inactivo prepago: inactividad tiene precedencia | ✅   |

### Módulo: Productos

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-21 | Crear producto con precio y categoría                    | 🔧     |
| CP-22 | Desactivar producto no lo elimina de ventas históricas   | 🔧     |
| CP-23 | Producto con etiqueta de restricción no aparece para estudiante restringido | 🔧 |

### Módulo: Autenticación

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-24 | Login con credenciales válidas                           | 🔧     |
| CP-25 | Login con credenciales inválidas muestra error           | 🔧     |
| CP-26 | Ruta de admin inaccesible para vendor                    | 🔧     |
| CP-27 | Logout borra la sesión                                   | 🔧     |

### Módulo: Pagos

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-28 | Registrar pago con método de pago                        | 🔧     |
| CP-29 | Pago aparece en historial del estudiante                 | 🔧     |

### Módulo: Dashboard

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-30 | Dashboard muestra total de ventas del día correctamente  | 🔧     |
| CP-31 | Morosos en dashboard coinciden con reporte de morosos    | 🔧     |

### Módulo: Rendimiento

| ID    | Descripción                                              | Estado |
|-------|----------------------------------------------------------|--------|
| CP-32 | Sistema soporta 7 vendedores simultáneos sin errores     | ✅ k6  |
| CP-33 | Sistema soporta 30 VUs en prueba de estrés sin HTTP 500  | ✅ k6  |

---

## 10. Scripts disponibles

```bash
# Desarrollo
npm run dev              # Inicia el servidor de desarrollo (localhost:3000)
npm run build            # Build de producción
npm run start            # Inicia el servidor en modo producción
npm run lint             # Linting con ESLint

# Base de datos
npm run db:seed          # Seed inicial (crea admin por defecto)
npx tsx prisma/seed-students-test.ts  # Crea 100 estudiantes de prueba

# Tests unitarios
npm test                 # Vitest una sola vez
npm run test:watch       # Vitest en modo watch
npm run test:coverage    # Vitest con reporte de cobertura

# Tests de rendimiento (requiere k6)
k6 run tests/performance/concurrency-sale.js   # Concurrencia
k6 run tests/performance/load-sales.js         # Carga
k6 run tests/performance/stress-sales.js       # Estrés
k6 run tests/performance/reports-speed.js      # Velocidad de reportes

# Prisma
npx prisma migrate dev   # Aplica migraciones en desarrollo
npx prisma studio        # UI visual de la BD
npx prisma generate      # Regenera el cliente de Prisma
```

---

*Documentación generada el 2026-06-09.*
