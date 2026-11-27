<div align="center">

<img src="./public/cronia-logo.png" alt="Cronia Logo" width="120" height="120" />

# Cronia

**Aplicación de escritorio moderna, privada y offline-first para la gestión integral de productividad personal.**

[![Release](https://img.shields.io/badge/version-1.0.0-emerald.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri 2](https://img.shields.io/badge/Tauri-2.0-24c8db.svg)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://sqlite.org/)

[Características](#características-principales) •
[Instalación](#instalación) •
[Tecnologías](#stack-tecnológico) •
[Desarrollo](#desarrollo-local) •
[Privacidad](#privacidad)

---

</div>

## Acerca de Cronia

**Cronia** es un centro de control personal diseñado para organizar tareas, proyectos, bloques de enfoque y calendarios en una experiencia de usuario rápida, fluida y sin distracciones. 

A diferencia de las herramientas en la nube tradicionales, Cronia opera **100% de forma local**: los datos se guardan exclusivamente en el equipo del usuario, garantizando velocidad, disponibilidad continua sin conexión a internet y privacidad de la información.

---

## Características Principales

### Gestión de Tareas
- Vistas alternables en **Lista** y tablero **Kanban**.
- Subtareas con seguimiento de progreso, etiquetas (`#tags`), estimación de tiempos y fechas límite.
- Tareas recurrentes configurables (diarias, semanales, mensuales).
- Filtros por estado, prioridad, categoría y búsqueda en tiempo real.

### Proyectos y Objetivos
- Vista dedicada por proyecto con métricas automáticas de progreso.
- Vinculación directa con tareas y sesiones de enfoque.
- Opciones de archivado y restauración de proyectos.

### Zen Studio (Temporizador de Enfoque)
- Ciclos de enfoque configurables (25m / 5m / 15m) y duraciones personalizadas persistentes.
- Cinco tonos de alerta generados mediante sintetizador Web Audio nativo.
- Registro histórico de sesiones vinculadas a actividades específicas.

### Calendario y Agenda Integrada
- Vistas por Mes, Semana y Día.
- Visualización combinada de eventos programados y tareas con vencimiento.

### Recordatorios y Notificaciones Nativas
- Alertas programadas con avisos anticipados.
- Integración completa con las notificaciones nativas de Windows Toast.

### Panel de Analíticas
- Métricas calculadas en vivo desde SQLite: tiempo enfocado, tasa de finalización y distribución por prioridad.
- Gráficos de ritmo semanal de productividad.

### Respaldos y Recuperación SQLite
- Generación de copias completas de la base de datos (`VACUUM INTO`).
- Restauración instantánea y eliminación individual de respaldos.
- Detección automática y rotación de copias diarias.

### Internacionalización (i18n)
- Soporte completo y cambio en caliente entre **Español** e **Inglés** (textos, estados y formateo de fechas locales).

### Diseño y Accesibilidad
- Temas **Warm Carbon (Oscuro)** y **Paper Swiss (Claro)**.
- Paleta de acentos visuales personalizables (Esmeralda, Azul, Violeta, Naranja, Cian, Rojo).
- Animaciones fluidas desarrolladas sobre Motion.

---

## Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Núcleo de Escritorio** | Tauri 2 (Rust 1.90+, Edition 2024) |
| **Base de Datos** | SQLite con motor embebido `rusqlite` y migraciones versionadas |
| **Frontend** | React 19, TypeScript |
| **Estilos e Interfaz** | Tailwind CSS 4, Radix UI, Lucide Icons |
| **Animaciones** | Motion |
| **Herramientas de Compilación** | Vite 8, pnpm |

---

## Desarrollo Local

### Prerrequisitos

1. **Node.js**: Versión 20 o superior.
2. **pnpm**: Gestor de paquetes (`npm install -g pnpm`).
3. **Rust y Build Tools**: Entorno Rust (`rustup`) y herramientas de compilación C++ para Windows (Visual Studio Build Tools).

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/Cronia.git
   cd Cronia
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Ejecutar en entorno de desarrollo:**
   ```bash
   pnpm tauri dev
   ```

4. **Ejecutar pruebas unitarias:**
   ```bash
   # Pruebas del frontend
   pnpm test

   # Pruebas del backend en Rust
   cd src-tauri
   cargo test
   cd ..
   ```

5. **Generar instalador de producción (.exe / .msi):**
   ```bash
   pnpm tauri build
   ```
   Los instaladores compilados se generarán en `src-tauri/target/release/bundle/`.

---

## Privacidad

Cronia ha sido diseñada bajo el principio de **privacidad por diseño**:
- Cero recolección de datos personales o telemetría invasiva.
- Funcionamiento sin cuentas obligatorias ni servicios externos en la nube.
- Toda la base de datos se almacena localmente en `%LOCALAPPDATA%\com.cronia.desktop\cronia.db`.

Para más información, consulte el documento [PRIVACY.md](PRIVACY.md).

---

## Licencia

Distribuido bajo la Licencia **MIT**. Consulte el archivo `LICENSE` para más información.
