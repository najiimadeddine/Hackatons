# Guide de démarrage

## Pré-requis

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

## Installation

Installer les dépendances du monorepo :

```bash
pnpm install
```

## Vérification des types

```bash
pnpm run typecheck
```

## Build

```bash
pnpm run build
```

## Lancement des applications

### Hack Flow

```bash
cd artifacts/hack-flow
pnpm install
pnpm run dev
```

### Mockup Sandbox

```bash
cd artifacts/mockup-sandbox
pnpm install
pnpm run dev
```

### API Server

```bash
cd artifacts/api-server
pnpm install
pnpm run dev
```
