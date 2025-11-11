#!/bin/bash

# Startup Health Check Script for Backend
# This script waits for MySQL to be ready before starting the application

set -e

echo "=========================================="
echo "Backend Startup Health Check"
echo "=========================================="

# Database connection parameters
DB_HOST="${SPRING_DATASOURCE_URL#*//}"
DB_HOST="${DB_HOST%%/*}"
DB_HOST="${DB_HOST%%:*}"
DB_PORT="3306"

if [[ $SPRING_DATASOURCE_URL =~ :([0-9]+)/ ]]; then
    DB_PORT="${BASH_REMATCH[1]}"
fi

echo "Database host: $DB_HOST"
echo "Database port: $DB_PORT"

# Wait for MySQL to be ready
max_retries=30
retry_count=0

echo "Waiting for MySQL to be ready..."

while [ $retry_count -lt $max_retries ]; do
    if mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"${SPRING_DATASOURCE_USERNAME}" -p"${SPRING_DATASOURCE_PASSWORD}" --silent 2>/dev/null; then
        echo "✓ MySQL is ready!"
        break
    fi
    
    retry_count=$((retry_count + 1))
    echo "MySQL not ready yet. Attempt $retry_count of $max_retries..."
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    echo "✗ ERROR: MySQL failed to become ready after $max_retries attempts"
    exit 1
fi

# Check database exists
echo "Checking if database exists..."
DB_NAME=$(echo $SPRING_DATASOURCE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
echo "Database name: $DB_NAME"

if mysql -h"$DB_HOST" -P"$DB_PORT" -u"${SPRING_DATASOURCE_USERNAME}" -p"${SPRING_DATASOURCE_PASSWORD}" -e "USE $DB_NAME" 2>/dev/null; then
    echo "✓ Database '$DB_NAME' exists and is accessible"
else
    echo "⚠ Warning: Database '$DB_NAME' may not exist yet. Spring Boot will create it."
fi

echo "=========================================="
echo "Starting Spring Boot Application..."
echo "=========================================="

# Start the application
exec java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar
