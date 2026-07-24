# Receptor de respuestas · UTP Data-Driven RetailMax
# Imagen mínima; sin dependencias externas (sólo Node nativo).
FROM node:20-alpine

WORKDIR /app
COPY server.js ./

ENV PORT=8080
ENV DATA_DIR=/data

# Carpeta persistente (monta aquí un volumen del NAS)
VOLUME ["/data"]

EXPOSE 8080

# Healthcheck para el gestor de Docker del NASync
HEALTHCHECK --interval=30s --timeout=4s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["node", "server.js"]
