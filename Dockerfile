# Stage 1: Build the application
FROM gradle:8-jdk17 AS build
WORKDIR /home/gradle/project

# Copy only gradle files first to leverage Docker cache
COPY --chmod=755 gradlew .
COPY gradle gradle
COPY settings.gradle.kts .
COPY gradle.properties .

# Copy the app source
COPY app app

# Build the application
# We use installDist which creates a ready-to-run directory structure
RUN ./gradlew :app:installDist --no-daemon

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the build artifacts from the build stage
COPY --from=build /home/gradle/project/app/build/install/app /app

# The application runs on port 8080 by default
EXPOSE 8080

# Run the application
ENTRYPOINT ["/app/bin/app"]
