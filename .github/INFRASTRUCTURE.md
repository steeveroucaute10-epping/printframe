# CI/CD Pipeline — GitHub Actions

## Workflows
- `ci-cd.yml` — Test → Lint → Build → Docker → Deploy
- `deploy.yml` — Manual deployment trigger
- `docker-compose.yml` — Local/remote deployment stack

## Infrastructure (IaC)
- Docker Compose stack: Next.js app, PostgreSQL, Redis
- Zero-cost hosting on existing Mac Mini
- Automated backups and health checks
