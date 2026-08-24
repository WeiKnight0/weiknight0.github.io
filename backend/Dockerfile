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

RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=backend-builder /app/target/*.jar app.jar

EXPOSE 8080

# The Compose memory limit is 512 MiB. A 50% heap cap leaves room for
# metaspace, thread stacks, direct buffers, and the operating system.
ENV JAVA_TOOL_OPTIONS="-XX:InitialRAMPercentage=25 -XX:MaxRAMPercentage=50 -XX:+UseSerialGC"

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
