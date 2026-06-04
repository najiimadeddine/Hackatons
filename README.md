# Hackatons

Monorepo d'applications de hackathon utilisant `pnpm` et `TypeScript`.

## Structure

- `artifacts/mockup-sandbox/` - Application sandbox de mockups
- `artifacts/hack-flow/` - Application Hack Flow
- `artifacts/api-server/` - Serveur API
- `lib/db/` - Bibliothèque de base de données
- `lib/integrations-anthropic-ai/` - Intégration Anthropic AI
- `lib/api-spec/` - Spécification OpenAPI
- `lib/api-client-react/` - Client API React
- `lib/api-zod/` - Schémas Zod pour l'API

## Scripts disponibles

| Commande                  | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `pnpm install`            | Installe toutes les dépendances                  |
| `pnpm run build`          | Vérifie les types et build tous les packages     |
| `pnpm run typecheck`      | Vérifie les types dans toutes les libs/projets   |

## Technologies

- Gestionnaire de paquets : `pnpm`
- Langage : `TypeScript`
- Monorepo : `pnpm-workspace`

## License

MIT
