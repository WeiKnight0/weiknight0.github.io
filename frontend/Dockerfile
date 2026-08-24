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

COPY nginx/wkn-personal-site.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

EXPOSE 80
