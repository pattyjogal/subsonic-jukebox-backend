# Stage 1: Build everything
FROM gradle:8-jdk17 AS build
WORKDIR /home/gradle/project

# Install Node.js (needed for buildWeb task)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy sources
COPY --chmod=755 gradlew .
COPY gradle gradle
COPY settings.gradle.kts .
COPY gradle.properties .
COPY web web
COPY app app

# Build the application (this will trigger buildWeb task automatically)
RUN ./gradlew :app:installDist --no-daemon

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the build artifacts
COPY --from=build /home/gradle/project/app/build/install/app /app

EXPOSE 8080

ENTRYPOINT ["/app/bin/app"]
