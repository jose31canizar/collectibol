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
- **React Native** con TypeScript
- **@react-three/fiber** - Renderizado 3D
- **@react-three/drei** - Utilidades para R3F
- **@react-spring/three** - Animaciones
- **Zustand** - Manejo de estado
- **AsyncStorage** - Persistencia de estado
- **r3f-native-orbitcontrols** - Controles de cámara
- **Cannon** - Motor de física

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

1. **Crear Objetos**: Toca el botón "Create Object" para generar un nuevo objeto 3D procedural
2. **Seleccionar**: Toca cualquier objeto en la escena para seleccionarlo y ver sus parámetros en la consola
3. **Navegar**: Usa gestos táctiles para rotar, hacer zoom y pan en la escena 3D
4. **Limpiar**: Toca "🗑️ Clear All" para eliminar todos los objetos
5. **Mover Objeto** Hacer "long press" en un objeto y moverlo encima del base para jugar con el detección de colisión


Shaders
1. Efecto bloom con vértices animados
2. Textura de patrón