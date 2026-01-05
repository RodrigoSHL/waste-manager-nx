# Flujo de Releases con Semantic Release

## 📋 Resumen

Este proyecto usa **semantic-release** con control manual para generar releases. Los releases NO se crean automáticamente con cada merge a main, sino que se ejecutan manualmente cuando el equipo lo decide (ej: al final del sprint).

## 🎯 Para Desarrolladores

### Trabajando en tu PR

**Commits individuales: formato libre**. No hay validación local:

```bash
git commit -m "trabajando en el feature"
git commit -m "fix typo"
git commit -m "agregando tests"
```

### Al crear el PR

**El título del PR DEBE seguir Conventional Commits con scope** (GitHub Actions lo valida automáticamente):

#### Formato:
```
<tipo>(<scope>): <descripción> - WST-###
```

#### Tipos válidos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `perf`: Mejora de rendimiento
- `refactor`: Refactorización de código
- `docs`: Cambios en documentación
- `chore`: Tareas de mantenimiento

#### Scopes válidos:
- `waste-api`: Para cambios en el backend/API
- `manager-web`: Para cambios en el frontend
- `deps`: Para actualizaciones de dependencias
- `ci`: Para cambios en CI/CD

#### Ejemplos de títulos de PR válidos:
```
feat(waste-api): Add market prices endpoint - WST-123
fix(manager-web): Correct dashboard calculation - WST-456
perf(waste-api): Optimize database queries - WST-789
refactor(manager-web): Reorganize components structure - WST-321
chore(deps): Update dependencies
```

**Importante:** 
- El scope es **obligatorio**
- El número de ticket (WST-###) es opcional
- La descripción debe comenzar con mayúscula

### Al hacer Merge

Cuando mergees tu PR a `main`:
- **Usa "Squash and merge"** 
- GitHub automáticamente usa el título del PR como mensaje de commit
- Como el título ya fue validado por GitHub Actions, el commit en main seguirá el formato correcto
- **Solo este commit aparecerá en el CHANGELOG**, no los commits individuales

## 🚀 Para el Release Manager

### Cuándo hacer un Release

Típicamente al final de cada sprint (cada 2 semanas), o cuando decidas que es momento de publicar los cambios acumulados.

### Cómo hacer un Release

#### Desde GitHub (Recomendado)

1. Ve a **Actions** en GitHub
2. Selecciona el workflow **"Manual Release"**
3. Click en **"Run workflow"**
4. Elige la rama `main`
5. Opcionalmente marca "Dry run" si quieres ver qué pasaría sin crear el release
6. Click en **"Run workflow"**

### Qué hace el Release automáticamente

1. **Analiza todos los commits** desde el último release (solo los de merge/squash)
2. **Determina la nueva versión** basándose en los tipos de commits:
   - `feat(scope):` → versión MINOR (1.0.0 → 1.1.0)
   - `fix(scope):`, `perf(scope):`, `refactor(scope):` → versión PATCH (1.0.0 → 1.0.1)
   - `feat(scope)!:` o `BREAKING CHANGE:` → versión MAJOR (1.0.0 → 2.0.0)
3. **Genera el CHANGELOG.md** agrupado por scope y tipo
4. **Actualiza el package.json** con la nueva versión
5. **Crea un Git tag** (ej: v1.2.0)
6. **Crea un GitHub Release** con las notas de la versión
7. **Commitea los cambios** del CHANGELOG y package.json

## 📝 Ejemplo de CHANGELOG Generado

```markdown
## 1.1.0 (2026-01-05)

### ✨ Features

#### waste-api
- Add market prices endpoint - WST-123
- Implement CRUD for disposers - WST-125

#### manager-web
- Add reports dashboard - WST-124
- Implement bulk upload feature - WST-126

### 🐛 Bug Fixes

#### manager-web
- Correct dashboard calculation - WST-456
- Fix navigation menu - WST-457

#### waste-api
- Optimize database queries - WST-789
```

## ❓ FAQ

**P: ¿Qué pasa si olvidé agregar el scope en el título del PR?**  
R: GitHub Actions te lo marcará como error y no podrás mergear hasta corregirlo.

**P: ¿Debo poner el número de ticket siempre?**  
R: No es obligatorio, pero es altamente recomendado para trazabilidad.

**P: ¿Puedo agregar más scopes?**  
R: Sí, edita el archivo `.github/workflows/pr-title-check.yml` y agrega los scopes necesarios.

**P: ¿Los commits individuales aparecen en el CHANGELOG?**  
R: No, solo aparecen los mensajes de los commits de squash merge (los títulos de los PRs).
