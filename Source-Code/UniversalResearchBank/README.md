# Actualizador Bibliográfico Universal (Universal Research Bank)

Herramienta **single-file** (`index.html`, sin backend) para construir, codificar y analizar un
**banco de información bibliográfico** de cualquier investigación. Todo se procesa en el navegador:
ningún dato sale de tu equipo.

## Idea central

La herramienta es **agnóstica al tema**: no trae ninguna clasificación fija. Todo el esquema
(categorías, enfoques, contexto objetivo, señales de inferencia, banco previo) se define en una
**configuración JSON** que puedes:

1. Escribir tú mismo (botón *Plantilla de configuración*).
2. Generar con un LLM / **deep research** (botón *Superprompt deep-research*: pide al modelo la
   configuración + un banco inicial de referencias reales).
3. Probar con la **DEMO** incluida (ejemplo del proyecto MPI-DUAE, solo demostrativo).

## Esquema universal de 19 campos

```
id, autores, anio, titulo, revista, doi, categoria, subcategoria, enfoque,
rol, ipd, pais, seminal, instrumento, variable_rol, diseno_estudio,
muestra, hallazgo_principal, relevancia_tema
```

## Flujo de trabajo

| Paso | Sección | Qué hace |
|------|---------|----------|
| 1 | **Configurar** | Aplica el JSON de tu investigación (catálogos cerrados + banco previo opcional). Se guarda en `localStorage`. |
| 2 | **Importar** | XML bibliográfico (Mendeley/Zotero/EndNote, `b:Sources`), tablas de Word (`w:tbl`), CSV, XLSX o JSON de 19 campos. Las refs que coinciden con el banco previo (DOI/título) **heredan** su codificación. |
| 3 | **Verificar** | Editor fila a fila con nivel de confianza, inferencia heurística dirigida por tus señales, y ciclo opcional de clasificación con LLM (validación estricta contra tus catálogos). |
| 4 | **Exportar** | `dashboard.html` autónomo (KPIs, matriz Categoría×Enfoque, gráficos Chart.js, tabla filtrable), banco CSV/JSON, XML corregido, libro XLSX con proyección de vacíos y superprompt de dashboard. |

## Regla de integridad

Nunca se inventan datos: las referencias sin categoría/enfoque válidos quedan marcadas como
pendientes, se cuentan como *Desconocido* y quedan fuera del análisis temático hasta que las
revises. La *proyección de vacíos* se declara siempre como META, separada de los datos reales.

## Uso

Abre `index.html` en el navegador (Chart.js y SheetJS se cargan por CDN solo cuando se necesitan;
sin conexión, la herramienta sigue funcionando salvo XLSX y los gráficos del dashboard).
