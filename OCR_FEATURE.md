# 📸 Funcionalidad OCR - Análisis Automático de Cupones

## ¿Qué es?

La función OCR (Optical Character Recognition) permite subir una captura de pantalla de tu cupón de apuesta (betslip) para que la aplicación extraiga automáticamente los datos y rellene el formulario.

## ¿Cómo funciona?

### 1. **Abrir el análisis OCR**
   - Clickea en el botón **"+" (Añadir apuesta)** en la parte inferior de la pantalla
   - Se abrirá el modal "Añadir Apuesta"
   - Clickea en el botón **"📸 Usar Cupón"**

### 2. **Subir la imagen**
   - **Opción A - Haz clic:** Clickea en el área de carga
   - **Opción B - Arrastra:** Arrastra la imagen directamente al área
   - La imagen debe ser una captura clara del cupón (JPG o PNG)
   - Tamaño máximo: 5MB

### 3. **Vista previa**
   - Verás una previsualización de la imagen
   - La app está analizando automáticamente el cupón

### 4. **Resultados extraídos**
   Una vez procesada, verás los datos encontrados:
   - **Casa de Apuestas**: Detectada automáticamente (ej: Bet365, Betfair, etc.)
   - **Cuota**: La cuota de la apuesta extraída
   - **Importe**: El dinero apostado (stake)
   - **Evento/Mercado**: Del cupón
   - **Nivel de confianza**: 
     - 🟢 **Alta**: Los datos se detectaron correctamente
     - 🟡 **Baja**: Revisa antes de usar
     - ⚪ **Manual**: Completa manualmente

### 5. **Usar los datos**
   - Clickea **"Usar Datos"** para rellenar automáticamente el formulario de apuesta
   - Podrás revisar y corregir cualquier dato antes de guardar
   - Completa los campos que no se detectaron (Deporte, Mercado, etc.)

### 6. **Privacidad**
   - ✅ La imagen se elimina automáticamente después del análisis
   - ✅ No se guarda en el servidor
   - ✅ Solo procesa el texto extraído

## 📋 Formato recomendado

Para mejores resultados:
- ✅ Imagen clara y bien enfocada
- ✅ Incluir toda la información del cupón
- ✅ Luz adecuada (no borrada ni muy oscura)
- ✅ Sin reflejos ni sombras

## 🏠 Casas de apuestas soportadas

La app detecta automáticamente:
- Bet365 / Betfair / Betway / 888sport
- William Hill / Codere / Bwin
- Sportium / Marathonbet / 1xBet
- Kirolbet / Pariplay
- Otras (completar manualmente)

## ⚙️ Cómo mejorar la precisión

Si los datos no se detectan correctamente:

1. **Casa de Apuestas**: Asegúrate de que aparezca el logo o nombre del operador
2. **Cuota**: Busca números entre 1.01 y 1000 claramente visibles
3. **Importe**: El símbolo € o la palabra "apuesta" debe ser visible
4. **Evento**: El nombre del partido/evento debe ser legible

## 💡 Tips

- Si el OCR no detecta bien, prueba con una imagen más clara
- Puedes editar el texto extraído directamente en el modal
- Los datos nunca se guardan en el servidor (100% privado)
- Funciona completamente offline después del primer load

## 🐛 Solución de problemas

| Problema | Solución |
|----------|-----------|
| "Archivo muy grande" | Usa una imagen más pequeña (<5MB) |
| Datos no detectados | Asegúrate de que la imagen sea clara y esté bien enfocada |
| La app no abre | Recarga la página y vuelve a intentar |
| Error de OCR | Intenta con otra foto más clara del cupón |
