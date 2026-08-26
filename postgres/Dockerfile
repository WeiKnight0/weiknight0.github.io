FROM postgres:16-alpine

RUN sed -i 's/^postgres:x:70:70:/postgres:x:1000:1000:/' /etc/passwd \
    && sed -i 's/^postgres:x:70:/postgres:x:1000:/' /etc/group \
    && chown -R 1000:1000 /var/lib/postgresql /var/run/postgresql

USER 1000:1000
