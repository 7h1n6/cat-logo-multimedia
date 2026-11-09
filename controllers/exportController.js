const Item = require('../models/Item');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

// Escapa caracteres peligrosos para evitar XSS al inyectar contenido en HTML
const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

// Serializa a JSON seguro para incrustarlo en el HTML generado
// (impide que "</script>" cierre el tag antes de tiempo)
const safeJSON = (data) =>
    JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

exports.exportCatalog = async (req, res) => {
    try {
        const { categoria, subcategoria } = req.query;

        if (!categoria || !subcategoria) {
            req.flash('error', 'Debes seleccionar una categoría y subcategoría');
            return res.redirect('/items');
        }

        // 1. Buscamos todos los ítems que coincidan
        const items = await Item.find({ categoria, subcategoria });

        if (items.length === 0) {
            req.flash('error', 'No hay ítems para exportar en esta subcategoría');
            return res.redirect('/items');
        }

        // 2. Generamos el código HTML completo como un String
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Catálogo de ${escapeHtml(subcategoria)}</title>
            <style>
                /* CSS incrustado para que funcione sin internet */
                body { font-family: Arial, sans-serif; background: #f4f4f9; margin: 0; padding: 20px; }
                h1 { text-align: center; color: #333; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
                .card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s; }
                .card:hover { transform: scale(1.05); }
                .card img { width: 100%; height: 300px; object-fit: cover; }
                .card-info { padding: 15px; text-align: center; }
                .card-info h3 { margin: 0; font-size: 1.1em; color: #333; }
                .card-info p { margin: 5px 0 0; color: #777; font-size: 0.9em; }

                /* Estilos del Modal */
                .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { background: white; padding: 20px; border-radius: 10px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; }
                .close-btn { position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer; color: #333; font-weight: bold; }
                .modal-content img { width: 100%; border-radius: 10px; margin-bottom: 15px; }
                .modal-content h2 { margin-top: 0; }
                .detail-list { list-style: none; padding: 0; }
                .detail-list li { margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                .detail-list strong { color: #555; text-transform: capitalize; }
            </style>
        </head>
        <body>
            <h1>Catálogo de ${escapeHtml(subcategoria)}</h1>
            <div class="grid">
        `;

        // 3. Inyectamos cada ítem en el HTML (todo el contenido de usuario escapado)
        items.forEach(item => {
            const id = escapeHtml(item._id.toString());
            const img = encodeURIComponent(item.imagen);

            htmlContent += `
                <div class="card" data-item-id="${id}">
                    <img src="imagenes/${img}" alt="${escapeHtml(item.titulo)}">
                    <div class="card-info">
                        <h3>${escapeHtml(item.titulo)}</h3>
                        <p>${escapeHtml(item.genero || '')}</p>
                    </div>
                </div>
            `;
        });

        // 4. Cerramos el HTML, incrustamos los datos de los ítems como JSON seguro
        //    y agregamos el JavaScript del Modal (el contenido se escapa en cliente)
        htmlContent += `
            </div>

            <!-- Datos de los ítems (JSON seguro, sin riesgo de inyección) -->
            <script type="application/json" id="catalogo-data">${safeJSON(items.map(item => ({
                id: item._id.toString(),
                titulo: item.titulo,
                categoria: item.categoria,
                subcategoria: item.subcategoria,
                genero: item.genero,
                imagen: item.imagen,
                detalles: item.detalles || {}
            })))}</script>

            <!-- Modal -->
            <div id="modal" class="modal">
                <div class="modal-content">
                    <span class="close-btn" onclick="cerrarModal()">&times;</span>
                    <div id="modal-body"></div>
                </div>
            </div>

            <script>
                // JS incrustado para manejar el modal sin frameworks
                function escapeHtml(value) {
                    return String(value)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;');
                }

                const CATALOGO_ITEMS = JSON.parse(document.getElementById('catalogo-data').textContent);
                const itemsById = {};
                CATALOGO_ITEMS.forEach(function(item) { itemsById[item.id] = item; });

                function mostrarDetalle(itemId) {
                    const item = itemsById[itemId];
                    if (!item) return;

                    const modalBody = document.getElementById('modal-body');

                    let detallesHTML = '';
                    for (const [key, value] of Object.entries(item.detalles)) {
                        if (value) {
                            detallesHTML += \`<li><strong>\${escapeHtml(key)}:</strong> \${escapeHtml(value)}</li>\`;
                        }
                    }

                    modalBody.innerHTML = \`
                        <img src="imagenes/\${encodeURIComponent(item.imagen)}" alt="\${escapeHtml(item.titulo)}">
                        <h2>\${escapeHtml(item.titulo)}</h2>
                        <p><strong>Categoría:</strong> \${escapeHtml(item.categoria)} > \${escapeHtml(item.subcategoria)}</p>
                        <p><strong>Género:</strong> \${escapeHtml(item.genero || 'N/A')}</p>
                        <ul class="detail-list">
                            \${detallesHTML}
                        </ul>
                    \`;

                    document.getElementById('modal').style.display = 'flex';
                }

                function cerrarModal() {
                    document.getElementById('modal').style.display = 'none';
                }

                // Cerrar si se hace clic fuera del contenido
                window.onclick = function(event) {
                    const modal = document.getElementById('modal');
                    if (event.target == modal) {
                        cerrarModal();
                    }
                }

                // Abrir el modal al hacer clic en una tarjeta
                document.querySelectorAll('.card[data-item-id]').forEach(function(card) {
                    card.addEventListener('click', function() {
                        mostrarDetalle(card.dataset.itemId);
                    });
                });
            </script>
        </body>
        </html>
        `;

        // 5. Configurar el archivo ZIP
        // Le decimos al navegador que va a descargar un archivo ZIP
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=catalogo_${encodeURIComponent(categoria)}_${encodeURIComponent(subcategoria)}.zip`);

        const archive = archiver('zip', { zlib: { level: 9 } }); // Nivel máximo de compresión

        // Si hay un error en el ZIP, lo mostramos en consola
        archive.on('error', (err) => { throw err; });

        // Conectamos el ZIP a la respuesta HTTP
        archive.pipe(res);

        // 6. Agregar el archivo HTML al ZIP
        archive.append(htmlContent, { name: 'catalogo.html' });

        // 7. Agregar las imágenes al ZIP
        items.forEach(item => {
            if (item.imagen && item.imagen !== 'default.jpg') {
                const imgPath = path.join(__dirname, '../public/uploads', item.imagen);
                if (fs.existsSync(imgPath)) {
                    // Las guardamos dentro de una carpeta llamada 'imagenes' en el ZIP
                    archive.file(imgPath, { name: `imagenes/${item.imagen}` });
                }
            }
        });

        // 8. Finalizamos el proceso (esto dispara la descarga)
        await archive.finalize();

    } catch (error) {
        console.error('Error al exportar:', error);
        req.flash('error', 'Hubo un error al generar el catálogo');
        res.redirect('/items');
    }
};
