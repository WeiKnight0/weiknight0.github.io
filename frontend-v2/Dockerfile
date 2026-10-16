FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY frontend-v2/package.json frontend-v2/package-lock.json ./
RUN npm ci

COPY frontend-v2/astro.config.mjs frontend-v2/tailwind.config.js frontend-v2/tsconfig.json ./
COPY frontend-v2/src ./src
COPY frontend-v2/public ./public
COPY frontend-v2/scripts ./scripts

ARG SITE_URL=http://localhost
ARG ICP_RECORD_NUMBER
ENV SITE_URL=${SITE_URL}
ENV ICP_RECORD_NUMBER=${ICP_RECORD_NUMBER}
ENV VITE_ICP_RECORD_NUMBER=${ICP_RECORD_NUMBER}
RUN npm run build

WORKDIR /notes-reader
COPY notes/reader/package.json notes/reader/package-lock.json ./
RUN npm ci
COPY notes/reader ./
RUN npm run build

WORKDIR /algorithm-templates
COPY notes/algorithm-templates/package.json notes/algorithm-templates/package-lock.json ./
RUN npm ci
COPY notes/algorithm-templates ./
RUN npm run build

FROM nginx:1.27-alpine

RUN sed -i 's/^nginx:x:101:101:/nginx:x:1000:1000:/' /etc/passwd \
    && sed -i 's/^nginx:x:101:/nginx:x:1000:/' /etc/group \
    && mkdir -p /tmp/nginx \
    && chown -R 1000:1000 /tmp/nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=1000:1000 nginx/wkn-personal-site.conf /etc/nginx/conf.d/default.conf
COPY --chown=1000:1000 nginx/certs /etc/nginx/certs
COPY --chown=1000:1000 --from=frontend-builder /app/dist /usr/share/nginx/html
COPY --chown=1000:1000 --from=frontend-builder /notes-reader/dist /usr/share/nginx/html/notes-reader
COPY --chown=1000:1000 --from=frontend-builder /algorithm-templates/dist /usr/share/nginx/html/notes/algorithm-templates

USER 1000:1000

EXPOSE 8080 8443
