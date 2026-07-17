"""Empaqueta el catálogo de botones como un EPUB3 'scripted' de prueba.

El capítulo es el propio catalogo-botones.html con una única modificación:
la ruta del script de Anime.js pasa del CDN a la copia empaquetada dentro
del EPUB (js/anime.min.js), que es como debe distribuirse un EPUB real
(los lectores abren los libros sin conexión).
"""
import zipfile

with open('catalogo-botones.html', encoding='utf-8') as f:
    chapter = f.read()

chapter = chapter.replace(
    'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js',
    'js/anime.min.js',
)

with open('vendor/anime.min.js', 'rb') as f:
    anime_js = f.read()

container_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
'''

content_opf = '''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">catalogo-botones-interactivos</dc:identifier>
    <dc:title>Catalogo de Botones Interactivos</dc:title>
    <dc:language>es</dc:language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="catalogo" href="catalogo-botones.html" media-type="application/xhtml+xml" properties="scripted"/>
    <item id="animejs" href="js/anime.min.js" media-type="text/javascript"/>
  </manifest>
  <spine>
    <itemref idref="catalogo"/>
  </spine>
</package>
'''

nav_xhtml = '''<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Indice</title></head>
<body>
  <nav epub:type="toc">
    <ol>
      <li><a href="catalogo-botones.html">Catalogo de Botones</a></li>
    </ol>
  </nav>
</body>
</html>
'''

with zipfile.ZipFile('catalogo-botones.epub', 'w') as z:
    z.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
    z.writestr('META-INF/container.xml', container_xml)
    z.writestr('OEBPS/content.opf', content_opf)
    z.writestr('OEBPS/nav.xhtml', nav_xhtml)
    z.writestr('OEBPS/catalogo-botones.html', chapter)
    z.writestr('OEBPS/js/anime.min.js', anime_js)

print('OK: catalogo-botones.epub creado')
