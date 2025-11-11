# Multi-stage build for Spring Boot - builds JAR in container
# Stage 1: Build the application
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY gradle.properties .

# Convert line endings and make gradlew executable (for Windows compatibility)
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix gradlew && \
    chmod +x gradlew && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

# Install curl and MySQL client for healthcheck and startup script
RUN apt-get update && \
    apt-get install -y curl default-mysql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the built JAR from builder stage
COPY --from=builder /app/build/libs/ecom-proj-0.0.1-SNAPSHOT.jar app.jar

# Copy and prepare startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Expose port
EXPOSE 8080

# Use startup script instead of direct java command
ENTRYPOINT ["/app/startup.sh"]
