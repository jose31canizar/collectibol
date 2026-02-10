# Node.js Version Requirement

## Problema

Expo SDK 54 requiere Node.js 20 o superior porque usa métodos de JavaScript modernos como `toReversed()` que fueron introducidos en ES2023.

Si estás usando Node.js 18, verás el error:
```
TypeError: configs.toReversed is not a function
```

## Solución Recomendada: Actualizar Node.js

### Usando nvm (Node Version Manager)

```bash
# Instalar Node.js 20
nvm install 20

# Usar Node.js 20 en este proyecto
nvm use 20

# Hacer Node.js 20 la versión por defecto (opcional)
nvm alias default 20
```

### Verificar la versión

```bash
node --version
# Debería mostrar v20.x.x o superior
```

## Solución Temporal: Polyfill

Si no puedes actualizar Node.js inmediatamente, se ha agregado un polyfill en `index.ts` que debería funcionar como solución temporal. Sin embargo, se recomienda actualizar a Node.js 20+ para evitar otros problemas de compatibilidad.

## Referencias

- [Issue de Expo sobre este problema](https://github.com/expo/expo/issues/42058)
- [Documentación de Expo Router](https://docs.expo.dev/router/reference/troubleshooting)
