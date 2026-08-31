# Deploying to a VPS

Camino-Hub ships as a Docker image (`Dockerfile`) and runs on a VPS as three containers —
`app`, `db` (Postgres 16), `caddy` (reverse proxy + automatic HTTPS) — via `docker-compose.yml`.
GitHub Actions builds and pushes the image on every push to `main`, then deploys it over SSH.

This is a one-time setup. After it's done, deploys are just `git push`.

## 1. Provision the VPS

Any VPS running Ubuntu 22.04 or 24.04 works — this isn't tied to a specific provider. You'll
need root or sudo access and a domain name.

Point the domain's DNS **A record** at the VPS's public IP before continuing (Caddy needs this
to succeed at the Let's Encrypt handshake in step 4).

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out/in for this to take effect
```

## 3. Firewall

Only SSH, HTTP, and HTTPS need to be reachable — the app and database are never exposed
directly, only through Caddy.

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 4. Set up the deploy directory

```bash
sudo mkdir -p /opt/caminos-hub
sudo chown $USER:$USER /opt/caminos-hub
cd /opt/caminos-hub
```

Copy `docker-compose.yml` and `Caddyfile` from this repo onto the VPS (scp, or a shallow
`git clone` — the compose file only pulls a prebuilt image, it doesn't need the rest of the
source):

```bash
curl -O https://raw.githubusercontent.com/Nakan4u/caminos-hub/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/Nakan4u/caminos-hub/main/Caddyfile
```

Create `.env` from the template (`.env.production.example` in this repo) and fill in real
values:

```bash
curl -o .env https://raw.githubusercontent.com/Nakan4u/caminos-hub/main/.env.production.example
openssl rand -base64 32   # → AUTH_SECRET
nano .env                 # fill in DOMAIN, POSTGRES_*, DATABASE_URL, AUTH_SECRET, AUTH_URL,
                           # AUTH_GOOGLE_ID/SECRET
```

For Google sign-in, add `https://<your-domain>/api/auth/callback/google` as an authorized
redirect URI on the OAuth client (see the README's "Google sign-in setup").

## 5. First launch

```bash
docker compose pull
docker compose up -d
```

The `app` container runs `prisma migrate deploy` automatically on every start (see
`docker-entrypoint.sh`), so the schema is created on this first boot. Load the route data once:

```bash
docker compose exec app npx prisma db seed
```

Watch `docker compose logs -f caddy` on first boot to confirm the Let's Encrypt certificate
issues successfully, then visit `https://<your-domain>`.

## 6. Wire up automatic deploys

Generate a dedicated SSH keypair for GitHub Actions to deploy with:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/caminos_hub_deploy -N ""
cat ~/.ssh/caminos_hub_deploy.pub >> ~/.ssh/authorized_keys
```

In the GitHub repo (**Settings → Secrets and variables → Actions**), add:

| Secret | Value |
| --- | --- |
| `DEPLOY_SSH_HOST` | VPS IP or hostname |
| `DEPLOY_SSH_USER` | the user set up above |
| `DEPLOY_SSH_KEY` | contents of `~/.ssh/caminos_hub_deploy` (the private key) |

The `.github/workflows/deploy.yml` workflow builds, tests, pushes the image to
`ghcr.io/nakan4u/caminos-hub`, and deploys on every push to `main`.

The first time the workflow pushes an image, make its GHCR package public
(**Package settings → Change visibility**) — the VPS pulls it without registry credentials, so
it needs to be public (nothing sensitive lives in the image; secrets live only in `.env` on the
VPS).

## Redeploying manually

```bash
cd /opt/caminos-hub
docker compose pull
docker compose up -d --remove-orphans
```

## Re-seeding after a schema change that touches route/stage data

Same as local dev (see README "Migrate DB to prod"), run inside the `app` container:

```bash
docker compose exec app npx prisma db seed
```
