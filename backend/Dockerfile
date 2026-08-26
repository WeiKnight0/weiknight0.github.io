# Maven exists only in the build stage and is excluded from the runtime image.
FROM maven:3.9.9-eclipse-temurin-17-alpine AS backend-builder

WORKDIR /app

COPY pom.xml ./
RUN mvn --batch-mode dependency:go-offline

COPY src ./src
RUN mvn --batch-mode package -DskipTests

# Alpine JRE keeps the Spring Boot runtime image small.
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -g 1000 -S app && adduser -u 1000 -S -D -H -G app app
COPY --chown=1000:1000 --from=backend-builder /app/target/*.jar app.jar

EXPOSE 8080

# The Compose memory limit is 512 MiB. A 50% heap cap leaves room for
# metaspace, thread stacks, direct buffers, and the operating system.
ENV JAVA_TOOL_OPTIONS="-XX:InitialRAMPercentage=25 -XX:MaxRAMPercentage=50 -XX:+UseSerialGC"

USER 1000:1000

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
