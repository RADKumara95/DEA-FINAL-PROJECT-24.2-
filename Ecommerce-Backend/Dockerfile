# Simple Dockerfile for Spring Boot - uses pre-built JAR
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the pre-built JAR from local build
COPY build/libs/ecom-proj-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
