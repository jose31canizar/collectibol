# Collectibol - Procedural 3D Objects App

Una aplicación React Native con Expo que permite crear y visualizar objetos 3D generados proceduralmente usando React Three Fiber.

## 🚀 Características

- **Generación Procedural**: Crea objetos 3D con variaciones aleatorias en color, tamaño, posición, rotación y animación
- **Interacción 3D**: Toca objetos para seleccionarlos y ver sus parámetros en consola
- **Animaciones Suaves**: Usa `@react-spring/three` para animaciones fluidas de selección y entrada
- **Persistencia**: El estado se guarda automáticamente usando AsyncStorage
- **Múltiples Formas**: Soporta Box, Sphere, Torus, Cone y Cylinder
- **Controles de Cámara**: OrbitControls para navegar la escena 3D

## 📦 Tecnologías

- **Expo** (SDK 54)
- **Expo Router** - Navegación basada en archivos
- **React Native** con TypeScript
- **@react-three/fiber** - Renderizado 3D
- **@react-three/drei** - Utilidades para R3F
- **@react-spring/three** - Animaciones
- **Zustand** - Manejo de estado
- **AsyncStorage** - Persistencia de estado
- **r3f-native-orbitcontrols** - Controles de cámara

## 🛠️ Instalación

```bash
npm install
```

## ▶️ Ejecutar

```bash
# Iniciar el servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en Web
npm run web
```

## 📱 Uso

1. **Crear Objetos**: Toca el botón "✨ Create Object" para generar un nuevo objeto 3D procedural
2. **Seleccionar**: Toca cualquier objeto en la escena para seleccionarlo y ver sus parámetros en la consola
3. **Navegar**: Usa gestos táctiles para rotar, hacer zoom y pan en la escena 3D
4. **Limpiar**: Toca "🗑️ Clear All" para eliminar todos los objetos

## 🎨 Generación Procedural

Cada objeto generado tiene las siguientes variaciones:

- **Tipo de Forma**: Seleccionado aleatoriamente entre Box, Sphere, Torus, Cone, Cylinder
- **Color**: 15 colores predefinidos
- **Tamaño**: Entre 0.3 y 1.2 unidades
- **Escala**: Entre 0.8x y 1.5x
- **Posición**: Dentro de un área controlada (-3 a 3 en X y Z, -2 a 2 en Y)
- **Rotación**: Rotación inicial aleatoria en los 3 ejes
- **Velocidad de Animación**: Entre 0.5x y 2.0x

## 📂 Estructura del Proyecto

```
collectibol/
├── app/                    # Expo Router (páginas)
│   ├── _layout.tsx        # Layout raíz
│   └── index.tsx          # Pantalla principal
├── components/            # Componentes React
│   ├── Scene3D.tsx       # Escena 3D principal
│   ├── ProceduralObject.tsx  # Componente de objeto 3D
│   ├── ButtonCreate.tsx  # Botón para crear objetos
│   ├── ButtonClear.tsx   # Botón para limpiar
│   └── InfoPanel.tsx     # Panel de información
├── store/                 # Estado global (Zustand)
│   └── useStore.ts       # Store con persistencia
└── utils/                 # Utilidades
    └── proceduralGeneration.ts  # Lógica de generación procedural
```

## 🔧 Configuración

El estado se persiste automáticamente usando AsyncStorage. Los objetos creados se guardan y se restauran al reabrir la app.

## 📝 Notas

- Los objetos seleccionados se resaltan con una animación de escala y cambio de opacidad
- Todos los objetos rotan continuamente con velocidades variables
- Los parámetros de cada objeto se muestran en la consola al seleccionarlos
- El panel de información muestra el conteo de objetos y detalles del objeto seleccionado

## 🎯 Requisitos Cumplidos

✅ Set-up 3D básico con cámara y luces  
✅ UI con CTA para crear instancias  
✅ Variación procedural (color, tamaño, posición, rotación, animación)  
✅ Interacciones (tap para seleccionar, mostrar parámetros)  
✅ Estado gestionado con Zustand  
✅ Tipado completo en TypeScript  
✅ Persistencia con AsyncStorage  
✅ Botón para limpiar todas las instancias  

## 📄 Licencia

Este proyecto fue creado como prueba técnica.
