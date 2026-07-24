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

## Opción A — Docker en el NASync DX2800 (recomendada)

1. **Copia esta carpeta** `nas-receiver/` a una carpeta compartida del NAS (p. ej. `/volume1/docker/retailmax/`).
2. Abre **UGOS Pro → Docker → Proyecto (Compose)** y crea un proyecto apuntando a `docker-compose.yml`
   (o usa Portainer si lo tienes instalado). Alternativamente por SSH:
   ```bash
   cd /volume1/docker/retailmax/nas-receiver
   docker compose up -d --build
   ```
3. El servicio queda en **`http://IP_DEL_NAS:8080`**. Los envíos se guardan en `./data`
   (mapeado como volumen; cámbialo a la carpeta compartida que prefieras en `docker-compose.yml`).
4. Abre `http://IP_DEL_NAS:8080` en el navegador del docente para ver el tablero.

> Si tu NAS ya usa el puerto 8080, cambia el mapeo en `docker-compose.yml` (p. ej. `- "8085:8080"`)
> y usa ese puerto en el PWA.

## Opción B — sin Docker (Node directo)

En cualquier PC/servidor de la misma red del aula:
```bash
cd nas-receiver
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
