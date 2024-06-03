# Docker Compose Setup

## Components

- Caddy as reverse proxy
- MongoDB as database
- Parse Server with Dashboard and Frontend served from `public` directory

## Volumes

This setup creates two volumes: one for the MongoDB data and one for the Parse Server files.

## Backups

Both the db and files volume are backed up to the `./backups` directory. It is up to you to move them off the instance.

## Things to check before deploying

- [ ] .env file is present
- [ ] Variables are set according to your needs
- [ ] Caddyfile contains correct domain
