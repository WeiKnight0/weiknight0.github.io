# Build static frontend files; this stage is not part of the runtime image.
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/astro.config.mjs frontend/tailwind.config.js frontend/tsconfig.json ./
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/scripts ./scripts

ARG SITE_URL=http://localhost
ENV SITE_URL=${SITE_URL}
RUN npm run build

# Nginx is the only frontend runtime process.
FROM nginx:1.27-alpine

RUN sed -i 's/^nginx:x:101:101:/nginx:x:1000:1000:/' /etc/passwd \
    && sed -i 's/^nginx:x:101:/nginx:x:1000:/' /etc/group \
    && mkdir -p /tmp/nginx \
    && chown -R 1000:1000 /tmp/nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=1000:1000 nginx/wkn-personal-site.conf /etc/nginx/conf.d/default.conf
COPY --chown=1000:1000 --from=frontend-builder /app/dist /usr/share/nginx/html

USER 1000:1000

EXPOSE 8080
