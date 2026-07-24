# Receptor de respuestas · NASync DX2800

Microservicio que **recibe los envíos del PWA** (UTP · Data-Driven · RetailMax) y muestra un
**tablero del docente** que consolida a todos los equipos en tiempo real. Sin dependencias
externas: sólo Node nativo. Pensado para correr en el **UGREEN NASync DX2800** (UGOS Pro · Docker),
pero funciona en cualquier host con Node 18+ o Docker.

```
PWA (navegador del alumno)  ──POST/PUT JSON──►  Receptor (NAS :8080)  ──►  /data (carpeta del NAS)
                                                        │
Docente ──abre http://IP_DEL_NAS:8080──►  Tablero consolidado (auto-refresco cada 12 s)
```

## Qué expone

| Ruta | Método | Uso |
|------|--------|-----|
| `/` | GET | Tablero del docente (HTML, auto-refresco) |
| `/ingest` (o cualquier ruta) | POST | Recibe un envío del PWA (modo *Webhook · POST*) |
| `/<archivo>.json` | PUT | Recibe un envío (modo *WebDAV · PUT*) |
| `/` | HEAD | Prueba de conexión (botón "Probar conexión" del PWA) |
| `/api/submissions` | GET | Agregado por equipo (JSON) |
| `/api/raw` | GET | Todos los envíos crudos (JSON) |
| `/export.csv` | GET | Exporta el consolidado a CSV |
| `/health` | GET | Healthcheck |

Cada envío se guarda como un archivo `.json` en `DATA_DIR`. El tablero muestra el **último envío por
equipo** y cuenta cuántas veces sincronizó cada uno. Persiste aunque se reinicie el contenedor
(si `DATA_DIR` está en un volumen del NAS).

## Opción A — Docker Compose SIN build (recomendada para el NAS)

El `docker-compose.yml` incluido **no construye imagen** (no necesita `buildx`): usa la imagen
oficial `node:20-alpine` y monta `server.js`. Así se evitan los dos errores típicos del NAS:
`buildx plugin ... not installed` y `lstat /volume1/docker/Dockerfile: no such file or directory`.

1. Sube **`docker-compose.yml` y `server.js` a la MISMA carpeta** del NAS
   (p. ej. `/volume1/docker/retailmax/`). No hace falta el `Dockerfile`.
2. En **UGOS Pro → Docker → Proyecto (Compose)** crea el proyecto apuntando a **esa carpeta**
   (la que contiene `docker-compose.yml`). O por SSH:
   ```bash
   cd /volume1/docker/retailmax
   docker compose up -d
   ```
3. Queda en **`http://IP_DEL_NAS:8080`**. Los envíos se guardan en `./data` (junto al compose).
4. Abre `http://IP_DEL_NAS:8080` en el navegador del docente.

> Si el puerto 8080 está ocupado, cambia el mapeo a `- "8085:8080"` y usa `:8085` en el PWA.

## Opción B — `docker run` (a prueba de todo, sin compose)

Si el gestor de proyectos da problemas, por SSH en el NAS (ajusta la ruta a donde subiste `server.js`):
```bash
docker run -d --name retailmax-receiver --restart unless-stopped \
  -p 8080:8080 -e PORT=8080 -e DATA_DIR=/data -w /app \
  -v /volume1/docker/retailmax/server.js:/app/server.js:ro \
  -v /volume1/docker/retailmax/data:/data \
  node:20-alpine node server.js
```

## Opción C — con build (solo si tu NAS SÍ tiene buildx)

El `Dockerfile` sigue incluido. Si tienes `buildx`, puedes construir una imagen propia:
`docker compose up -d --build` (con un compose que use `build: .` en la carpeta de la app).

## Opción D — sin Docker (Node directo)

En cualquier PC/servidor de la misma red del aula:
```bash
DATA_DIR=./data PORT=8080 node server.js
```

## Cómo conectarlo desde el PWA

1. En el PWA abre **🛰️ Monitor** (botón flotante).
2. En **Endpoint del NASync DX2800** escribe:
   - Modo **Webhook · POST**: `http://IP_DEL_NAS:8080/ingest`
   - Modo **WebDAV · PUT**:   `http://IP_DEL_NAS:8080/` (el PWA añade el nombre de archivo)
3. Pulsa **Probar conexión** y luego **Sincronizar con NAS**. En el tablero del docente
   aparecerá el equipo en segundos.

> Cada equipo sincroniza desde su propio dispositivo; el tablero del docente los **consolida a todos**.

## Seguridad (opcional, para el aula)

- Por defecto acepta cualquier origen de la LAN (CORS abierto) para facilitar la clase.
- Para exigir un **token compartido**, define `INGEST_TOKEN` (en `docker-compose.yml`). El PWA debe
  enviarlo como `?token=...` en la URL del endpoint o en la cabecera `X-Token`
  (ej.: `http://IP_DEL_NAS:8080/ingest?token=retailmax2025`).
- Mantén el servicio **sólo en la red interna** del aula; no lo expongas a Internet.

## Notas técnicas

- **CORS**: responde `Access-Control-Allow-Origin: *` y atiende el *preflight* `OPTIONS`, por lo que
  el `fetch` del PWA funciona incluso abriendo el HTML como archivo local (`origin: null`).
- **Contenido mixto**: si sirves el PWA por **HTTPS**, el navegador bloqueará llamadas a un NAS por
  **HTTP**. En ese caso sirve el PWA por HTTP en la LAN, o configura HTTPS en el NAS.
- Límite de payload: 5 MB por envío.
- Verificado de extremo a extremo: el PWA sincroniza (HTTP 201) y el tablero consolida los equipos.

## Solución de problemas

| Mensaje | Causa | Solución |
|---------|-------|----------|
| `Docker Compose requires buildx plugin to be installed` | El compose intentaba **construir** una imagen y el NAS no tiene `buildx`. | Usa el `docker-compose.yml` **sin build** de este repo (Opción A) o el `docker run` (Opción B). Ya no se construye nada. |
| `unable to evaluate symlinks in Dockerfile path: lstat /volume1/docker/Dockerfile: no such file or directory` | El proyecto usaba `build: .` y buscaba el `Dockerfile` en la carpeta raíz del proyecto (`/volume1/docker`), donde no estaba. | Con la Opción A no hay `build` ni `Dockerfile`. Solo asegúrate de que **`docker-compose.yml` y `server.js` estén juntos** en la carpeta del proyecto. |
| El contenedor arranca y se detiene | `server.js` no está montado (ruta incorrecta del volumen). | Verifica que `./server.js` (compose) o la ruta absoluta (`docker run`) apunte al archivo real. Revisa logs: `docker logs retailmax-receiver`. |
| El PWA dice "Conexión bloqueada (CORS/red)" | El PWA se sirve por HTTPS y el NAS por HTTP (contenido mixto), o IP/puerto errados. | Sirve el PWA por HTTP en la LAN o pon HTTPS en el NAS; confirma `http://IP_DEL_NAS:8080/health` desde el navegador. |
