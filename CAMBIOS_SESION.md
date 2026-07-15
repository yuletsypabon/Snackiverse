# Snackiverse — Bitácora de cambios de la sesión

Documento explicativo de todo lo que se trabajó, con el **qué**, el **cómo** y el **porqué** de cada cambio. Ordenado por temas.

---

## 1. Pipeline de CI/CD y despliegue

Todo esto fue para que el lanzamiento a producción (Azure + Neon) funcionara de forma segura y automática.

### 1.1 Pipeline secuencial (tests antes de desplegar)

**Qué:** Se unificó el flujo en un solo `ci.yml` con dos jobs: `test` y `deploy`. El `deploy` tiene `needs: test` y `if: github.ref == 'refs/heads/main'`.

**Cómo:** En GitHub Actions, `needs` obliga a que el job de deploy espere a que `test` termine en verde. El `if` restringe el deploy solo a la rama `main`.

**Por qué:** Antes, CI y CD corrían en paralelo, así que el deploy podía llegar a Azure **antes** de que los tests terminaran — si un test fallaba después, quedaba código roto en producción. Ahora es imposible desplegar sin que los tests pasen primero. Además, así los push a `develop` corren tests pero **no** despliegan.

### 1.2 Migraciones de base de datos en el pipeline

**Qué:** Se agregó un paso `npx prisma migrate deploy` en el job `test`, solo en `main`.

**Por qué:** El pipeline compilaba y desplegaba, pero nunca aplicaba las migraciones de Prisma a la base de producción. Sin esto, un cambio de esquema nunca llegaba a la base y la app tronaba. `migrate deploy` (no `migrate dev`) es la variante para producción: aplica lo que ya existe, sin prompts ni riesgo de resetear.

### 1.3 Baseline de la migración `init`

**Qué:** Se corrió una sola vez `npx prisma migrate resolve --applied 20260511220915_init` contra Neon.

**Cómo:** `migrate resolve --applied` marca una migración como aplicada en la tabla de control `_prisma_migrations`, **sin ejecutar su SQL**.

**Por qué:** La base ya tenía las tablas creadas, pero Prisma no tenía registrada la migración `init`. Si se corría `migrate deploy` sin esto, Prisma intentaba crear tablas que ya existían y fallaba. El baseline sincroniza el historial sin tocar datos.

### 1.4 Bundle "standalone" y el bug que rompía el login (el más importante)

**Qué:** El `next.config` usa `output: "standalone"`, que empaqueta un servidor Node mínimo. Se ajustó el pipeline para copiar `.next/static`, `public` y **Prisma** dentro del bundle, y para incluir archivos ocultos en el artifact.

**Cómo y por qué, paso a paso** (así se diagnosticó):

1. Al desplegar, la página cargaba pero el login daba "Network error". Ese mensaje aparecía porque el servidor devolvía un error no-JSON, así que `response.json()` explotaba en el cliente.
2. El log de Azure mostró el error real: `Cannot find module '.prisma/client/default'`. Es decir, el **cliente generado de Prisma** no viajaba en el bundle standalone (Next no lo rastrea automáticamente).
3. Primer arreglo: copiar Prisma al bundle en el pipeline (`cp -r node_modules/.prisma ...`). Seguía fallando.
4. La pista de oro: `@prisma` (sin punto) sí llegaba a Azure, pero `.prisma` (con punto) no. La única diferencia era el punto inicial.
5. Causa raíz: `actions/upload-artifact@v4` **excluye archivos/carpetas ocultos por defecto**. La carpeta `.prisma` se descartaba en silencio al subir el artifact.
6. Arreglo final: `include-hidden-files: true` en el paso de subir el artifact.

**La lección:** funcionaba en local (donde `.prisma` está en `node_modules`) pero no en producción, porque el problema era del empaquetado, no del código.

### 1.5 Configuración de Azure

**Qué:** Comando de inicio `node server.js` y variables de entorno `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.

**Por qué:** El build standalone se arranca con `node server.js` (no con `next start`, que no funciona con standalone). Y las variables de entorno no viajan en el deploy, hay que configurarlas en el portal de Azure; sin `DATABASE_URL`, Prisma no conecta.

---

## 2. Responsivo y visual

### 2.1 Modal de estudiante en móvil

**Qué:** Se quitó `overflow: "visible"` del modal de crear/editar estudiante y se agregó `fullScreen` en móvil (`useMediaQuery(theme.breakpoints.down("sm"))`).

**Por qué:** El `overflow: visible` mataba el scroll interno del modal. En un iPhone, el formulario era más alto que la pantalla y los campos de abajo (WhatsApp, botón Guardar) quedaban cortados e inalcanzables. Con `fullScreen` en móvil, el modal ocupa toda la pantalla y hace scroll normal; en tablet/PC se ve igual que antes.

### 2.2 Orden numérico del filtro de grados

**Qué:** El filtro de grados pasó de `localeCompare(b, "es")` a `localeCompare(b, "es", { numeric: true })`.

**Por qué:** Antes ordenaba como texto, así que "10°" quedaba antes de "2°". Con `numeric: true` ordena por valor numérico real (2°, 3°, 4°, 10°...) y deja los grados con texto ("Docente") al final.

### 2.3 Login en iPad (punto de quiebre)

**Qué:** En `login-form.tsx` se bajaron 6 puntos de quiebre de `lg` (1200px) a `sm` (600px).

**Por qué:** El login cambiaba a la vista de escritorio (dos columnas) recién a los 1200px. El iPad mide 768–1024px, así que quedaba por debajo y recibía la vista móvil. Con `sm` (600px), cualquier pantalla de tablet o más recibe la vista de PC.

### 2.4 Nombre del usuario logueado en el shell

**Qué:** `getSessionUser()` ahora consulta el nombre en la base con el `userId` del token, y el `AdminShell` lo muestra (en el sidebar en escritorio, en la barra superior en móvil).

**Cómo:** Se eligió consultar la base en vez de meter el nombre al JWT, para que funcione de inmediato con las sesiones ya abiertas sin obligar a re-loguearse. Las 10 páginas que usan el shell pasan `userName={session?.name}`.

**Por qué:** Antes el chip decía "Administrador" hardcodeado; ahora identificas de un vistazo quién entró y con qué rol.

---

## 3. Comprobante (recibo)

### 3.1 Logo embebido

**Qué:** El logo se pasó a base64 (data URL) incrustado en el código, en vez de `<img src="/logo/sv1.jpeg">`.

**Por qué:** La librería `html-to-image` (que convierte el comprobante en imagen) no lograba incrustar la imagen raster del logo — problema clásico de timing/CORS. Con base64 no depende de ninguna carga externa, así que siempre aparece. Además se aplicó la orientación EXIF (con `ImageOps.exif_transpose`) porque el logo salía girado: el JPEG traía metadata de orientación que el navegador respeta pero que al redimensionar se perdía.

### 3.2 Estado "Pago + tipo de tiquetera"

**Qué:** El estado "Pago al cierre" ahora muestra "Pago " + el tipo (ej. "Pago Semanal", "Pago Mensual").

**Por qué:** Es más informativo mostrar el tipo de tiquetera del estudiante que un texto genérico.

### 3.3 Renombrar "Prepago" → "Pago anticipado"

**Qué:** Solo la etiqueta visible (`studentTypeLabels.prepaid`). El valor interno sigue siendo `prepaid`.

**Por qué:** Cambio puramente cosmético; toda la lógica de saldos queda intacta porque el identificador interno no cambió.

### 3.4 Mensaje al compartir

**Qué:** El texto al compartir el comprobante pasó a "Te envío el comprobante de esta semana/quincena/mes/período del consumo de [nombre]", según el tipo de reporte.

**Por qué:** Un mensaje claro y contextual en vez de "Comprobante [nombre]".

---

## 4. Funcionalidad nueva (toca dinero — hecho con cuidado)

### 4.1 Eliminar una venta (solo admin) con reversión de saldo

**Qué:** Un `deleteSale(saleId)` en el servicio, una ruta `DELETE /api/sales/[id]` protegida con `authorizeAdmin`, y en Ventas Detalladas un menú de 3 puntos → confirmación → eliminar.

**Cómo:** En una transacción atómica: si la venta era de un estudiante de pago anticipado, se le **devuelve** el total al saldo (lo inverso del descuento que se hizo al crearla); los ítems se borran en cascada. Para otros tipos no se toca saldo.

**Por qué:** No basta con borrar la fila; hay que revertir su efecto en el saldo o los números quedan mal. Es solo admin y con confirmación por ser una acción sensible sobre dinero.

### 4.2 Fix de zona horaria en los filtros de fecha

**Qué:** En 3 rutas de reportes se cambió el cálculo del rango de fechas para interpretarlo en zona horaria de Colombia (`-05:00`).

**Cómo:** Antes se hacía `new Date(from)` (que se interpreta como UTC) y luego `setHours(23,59,59)` (que opera en local). Mezclar UTC y local dejaba una ventana equivocada. Ahora se construyen los límites con el sufijo `-05:00` (medianoche y fin de día en hora Colombia).

**Por qué:** Las ventas del mismo día no aparecían en el filtro (una venta de las 10:53 a.m. quedaba fuera del rango). Colombia es UTC-5 sin horario de verano, así que fijar `-05:00` deja el rango correcto sin importar si el servidor es local o Azure (UTC). También se dejó el filtro cargando por defecto los últimos 7 días.

### 4.3 Pagos para cualquier estudiante + abono a la deuda

**Qué:** El filtro de Pagos ahora muestra cualquier estudiante activo (antes solo tiquetera). Y para estudiantes de pago anticipado con deuda (saldo negativo), cada pago **reduce la deuda**, tope en 0.

**Cómo:** `Math.min(0, balance + amount)` cuando el saldo es negativo. No pasa de 0 hacia positivo (para agregar crédito se usan las Recargas).

**Por qué:** Hay personas que pagan a diario. Cada abono baja la deuda (ej. debe 8.000 → paga 5.000 → queda −3.000 → paga 3.000 → queda 0). El historial de consumo (las ventas) **nunca se toca**, solo cambia el número del saldo.

### 4.4 Buscador de productos

**Qué:** En la página de Productos (gestión) se agregó un buscador por nombre, en vivo, en la misma fila que el botón "Nuevo Producto".

**Por qué:** Registrar Venta ya tenía buscador; la página de gestión no. Facilita encontrar un producto entre muchos.

---

## 5. Grid de emojis para productos

**Qué:** El selector de iconos de productos pasó de iconos MUI (monocromáticos, de línea) a un **grid de emojis a color** agrupados por tipo (Comidas, Bebidas, Dulces, Snacks, Frutas, Saludables). Aplica solo a productos, no a categorías.

**Cómo:** Se guarda el emoji (carácter) directamente en el campo `icon` (que ya era un `String`), así que **no hubo migración de base**. Se agregó un `resolveProductEmoji()` con un mapeo de los ids de iconos viejos → emoji equivalente, para que los productos existentes no queden en blanco. Se actualizaron los puntos donde se muestra el icono (tabla de productos, Registrar Venta).

**Por qué:** Los iconos de línea todos se parecían y no calzaban con el producto. Los emojis son reconocibles al instante (🍕 pizza, 🍔 hamburguesa, 🧃 jugo), a color, sin librerías ni imágenes. Se eligió un grid curado de comida en vez del selector completo del teléfono para evitar una librería pesada y ruido de emojis irrelevantes.

---

## 6. Creación de un admin desde la base de datos

**Qué:** Se creó un segundo admin (Maribel Quiroga) con un `INSERT` en el SQL Editor de Neon.

**Cómo:** La contraseña se guardó como **hash bcrypt** (no texto plano), porque el login usa `bcrypt.compare`. El `id` se generó con `gen_random_uuid()::text` y el rol se insertó como `'admin'`.

**Por qué:** La interfaz de usuarios solo crea vendedores (por diseño). Un admin extra se crea por script o SQL. Nota: un admin "oculto" conviene anotarlo fuera (gestor de contraseñas) para no perderle el rastro.

---

## 7. Flujo de Git (develop → main)

**Qué:** Se adoptó trabajar en `develop` y solo pasar a `main` para desplegar. Los cambios se agruparon en 4 commits por feature, en inglés.

**Por qué:** El pipeline despliega solo desde `main`. Pushear cada cambio directo a `main` desplegaba a producción constantemente, lo cual no es limpio. Con `develop`: push a develop → corre CI (valida) sin desplegar; merge develop → main → despliega. Historial más ordenado.

---

## Nota recurrente: el bug de truncamiento del editor

Durante la sesión, varias veces el editor de archivos cortó el final de archivos grandes (a veces con bytes nulos). Se detectó siempre con el chequeo de tipos (`tsc`) y se reparó reconstruyendo el archivo desde la versión buena de git y re-aplicando los cambios con scripts, en vez de parchar la cola. Por eso, la recomendación constante fue: **antes de commitear, correr `npm run build` local y revisar el `git diff`**.

---

## Verificación aplicada en cada cambio

En cada paso se verificó con: chequeo de tipos (`tsc --noEmit`), los 46 tests (`vitest`), y revisión de integridad de los archivos. Los cambios que tocaban dinero (eliminar venta, abono de deuda) se marcaron para prueba manual explícita en local antes de desplegar.

---

## 8. Búsqueda sin tildes (estudiantes y productos)

**Qué:** Los buscadores ahora ignoran los acentos. "jose" encuentra "José", "platano" encuentra "plátano". Aplica a la búsqueda de estudiantes (nombre y grado) y de productos, en todas las pantallas: lista de estudiantes, pagos, recargas, reportes, registrar venta y tabla de productos.

**Cómo:** Se creó un helper `normalizeText()` en `src/lib/text.ts` que "aplana" el texto para comparar:
- `.toLowerCase()` — ignora mayúsculas/minúsculas.
- `.normalize("NFD")` — descompone cada letra acentuada en letra base + marca de acento ("é" → "e" + "´").
- `.replace(/[̀-ͯ]/g, "")` — borra esas marcas de acento (ese rango Unicode son los acentos combinados). Así "é" queda en "e".

Luego se aplicó `normalizeText` en **ambos lados** de cada comparación de búsqueda (lo que se escribe y el nombre contra el que se compara), en cada componente que busca.

**Por qué:** Las tildes obligaban a escribir el acento exacto para encontrar a alguien; era incómodo y poco confiable para el uso diario.

**Archivos:** `src/lib/text.ts` (nuevo), y los buscadores en student-manager, payments-manager, recharge-manager, reports-manager, productTable y sale-register.

---

## 9. Bloqueo del saldo al editar un estudiante

**Qué:** Al editar un estudiante con saldo negativo (deuda), no dejaba guardar los cambios. La corrección: al editar, el campo de saldo queda deshabilitado y **no se envía**, así el saldo no se toca (ni deuda ni a favor), pero sí se pueden guardar el tipo de tiquetera y las restricciones.

**Cómo:** Dos cambios en `student-manager.tsx`: (1) en el `payload` del formulario, incluir `balance` solo al crear, no al editar (`...(isEditing ? {} : { balance: form.balance })`); (2) poner `disabled={Boolean(editingId)}` en el campo de saldo. El servicio ya solo actualiza el saldo `if (input.balance !== undefined)`, así que al no enviarlo, lo deja igual.

**Por qué:** El formulario reenviaba siempre el saldo, y la validación del esquema rechaza saldos negativos (`.min(0)`). Entonces un estudiante endeudado quedaba "bloqueado": no se podía editar nada porque el saldo negativo hacía fallar la validación. El saldo debe ajustarse solo con Recargas y Pagos, no a mano al editar.

---

## 10. Incidente del entorno: dos chats en paralelo

**Qué pasó:** Tener dos chats trabajando sobre la misma carpeta al mismo tiempo corrompió el índice de git (`.git/index`, con firma de bytes nulos) y truncó el final de algunos archivos (`student-manager.tsx`, `sale-register.tsx`).

**Cómo se recuperó:** Restaurando los archivos truncados desde la versión commiteada de git (`git show HEAD:archivo > archivo`, que lee del historial y no del índice corrupto), reconstruyendo el índice (`rm -f .git/index && git reset`) y dejando **una sola sesión activa**.

**Por qué / lección:** El código commiteado nunca se perdió — el daño fue solo en cambios sin guardar y en el índice. Regla práctica: trabajar con un solo chat por proyecto a la vez, y commitear seguido para que ningún cambio quede solo "en el aire".

---

# 📌 PENDIENTE — Continuar mañana

## Feature en curso: "Ingresar valor del consumo" (solo para UN vendedor específico)

**Qué quiere el usuario:** En Registrar Venta, además de armar la venta con productos, un vendedor específico debe poder elegir un estudiante y **escribir directamente un monto** (el consumo del día), sin detallar productos. Selector: "Venta (productos)" / "Ingresar consumo (monto)".

**Decisiones ya tomadas:**
- **Alcance:** SOLO un vendedor específico (no todos). Se gatea con una marca por usuario.
- **Comportamiento del monto:** igual que una venta normal → baja el saldo del estudiante de pago anticipado; a los de tiquetera solo se registra; aparece en reportes y comprobantes.

**Plan por etapas (verificar cada una por lo inestable del entorno):**
1. **Migración DB:** agregar campo booleano al modelo `User`, ej. `canEnterConsumption Boolean @default(false)`. Es aditiva y segura. Generar el archivo de migración y aplicar con `migrate deploy` — **NO** `migrate dev` (el `DATABASE_URL` apunta a producción y puede resetear).
2. **Activar la marca** para ese vendedor. **DECISIÓN PENDIENTE:** por SQL en Neon (rápido, como Maribel) o con un interruptor en la pantalla de Vendedores (autogestionable, más trabajo).
3. **`getSessionUser`** debe incluir la marca, para que Registrar Venta sepa si mostrar la opción.
4. **Backend:** crear una "venta de consumo" (monto directo, sin ítems), reutilizando la lógica de saldo de `createSale` (prepago decrementa; tiquetera solo registra).
5. **UI en Registrar Venta:** selector de modo; el modo "consumo" solo aparece si el vendedor tiene la marca.

## Estado del repo / deploy (fin de la sesión)
- **`develop`** (pusheado, NO en `main` todavía): búsqueda sin tildes, bloqueo de saldo al editar (formulario + refuerzo en schema/service), grupo de emojis "Paquetes y papas".
- **Falta para desplegar:** abrir PR `develop` → `main` y mergear (eso dispara el deploy). Título/descripción del PR ya redactados en el chat.
- `CAMBIOS_SESION.md` está sin trackear (opcional subirlo).

## Recordatorios de entorno (importante)
- **Trabajar con UN SOLO chat por proyecto a la vez.** Dos chats en paralelo corrompieron el índice de git y truncaron archivos.
- Recuperación si se corrompe: `git show HEAD:archivo > archivo` para archivos, y `rm -f .git/index.lock .git/index && git reset` para el índice.
- Al editar archivos, verificar siempre: bytes nulos, cierre del archivo, y `npx tsc --noEmit`.
