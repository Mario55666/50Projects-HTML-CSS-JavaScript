# Acceso remoto con Cloudflare Tunnel

Publica el **receptor** (`http://IP_DEL_NAS:8080`) en una **URL HTTPS pública** para que los alumnos
entren desde cualquier red, sin abrir puertos en el router ni pelear con la IP/firewall del NAS.

> Aclaración: `github.com/cloudflare/cloudflare-docs` es solo el **código de la documentación** de
> Cloudflare. No se "vincula" nada a ese repo. La herramienta que necesitas es **Cloudflare Tunnel
> (`cloudflared`)**. Docs oficiales: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

## Requisito previo
El receptor debe estar **corriendo** en el NAS y respondiendo en `http://localhost:8080/health`.

## Opción 1 — Quick Tunnel (rápido, sin cuenta, URL temporal)

Por SSH en el NAS:
```bash
docker run -d --name cf-tunnel --restart unless-stopped --network host \
  cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://localhost:8080

docker logs cf-tunnel        # busca una línea como: https://algo-azar.trycloudflare.com
```
O con el compose de esta carpeta: `docker compose up -d && docker logs cf-tunnel`.

Esa `https://XXXX.trycloudflare.com` es tu URL pública:
- Alumnos → `https://XXXX.trycloudflare.com/app/`
- Docente → `https://XXXX.trycloudflare.com/`

> La URL **cambia cada vez que reinicias** el contenedor. Ideal para una clase puntual.

## Opción 2 — Named Tunnel (URL fija con tu dominio)

Necesitas cuenta Cloudflare + un dominio en Cloudflare.
1. En **Cloudflare Zero Trust → Networks → Tunnels → Create tunnel** (tipo *Cloudflared*).
2. Copia el **TOKEN** y arráncalo:
   ```bash
   docker run -d --name cf-tunnel --restart unless-stopped \
     cloudflare/cloudflared:latest tunnel --no-autoupdate run --token PEGA_TU_TOKEN
   ```
3. En el panel del túnel, añade un **Public Hostname**:
   - Subdominio: `retailmax` (→ `retailmax.tudominio.com`)
   - Service: `http://localhost:8080` (si usas `--network host`) o `http://IP_DEL_NAS:8080`.

Ahora la URL fija es `https://retailmax.tudominio.com/app/` (alumnos) y `/` (docente).

## ⚠️ Seguridad — MUY importante al exponer a Internet

Al publicar, **cualquiera con el enlace** podría ver el tablero (`/`, `/api/...`) y enviar datos.
Como se manejan **nombres de estudiantes y respuestas**, protégelo:

1. **Activa el token de ingesta** en el receptor (`INGEST_TOKEN` en su compose) para que solo el PWA
   con el token pueda enviar: endpoint `…/ingest?token=TU_TOKEN`.
2. **Protege el tablero docente** con **Cloudflare Access** (Zero Trust → Access → Applications):
   exige login (tu correo) para las rutas `/`, `/api/*` y `/export.csv`, dejando `/app/` y `/ingest`
   abiertos para los alumnos. Así los alumnos usan la actividad pero solo tú ves el consolidado.
3. Si es una clase puntual, usa el **Quick Tunnel** y **apágalo al terminar** (`docker rm -f cf-tunnel`).
4. Para uso solo en el aula, **no necesitas Cloudflare**: basta la IP local del NAS (`http://IP:8080`).

## Nota sobre HTTPS y "contenido mixto"
Con el túnel la app se sirve por **HTTPS** desde el mismo origen, así que el PWA puede sincronizar
sin problemas de contenido mixto. En el PWA, como todo es el mismo origen, usa el endpoint relativo
**`/ingest`** (o `/ingest?token=...` si activaste el token).
