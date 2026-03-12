#!/bin/bash

# Script para generar los iconos de la extensión a partir de un icono principal
# Requisito: ImageMagick debe estar instalado (brew install imagemagick)

MAIN_ICON="images/icon-extension.png"  # Usa el icono base actualizado
SIZES=(16 32 48 128 192)

echo "Generando iconos para la extensión desde icon-extension.png..."

for size in "${SIZES[@]}"; do
    echo "Generando icon-${size}.png..."
    convert "$MAIN_ICON" -resize "${size}x${size}" "images/icon-${size}.png"
done

echo "✅ Iconos generados correctamente en la carpeta images/"
