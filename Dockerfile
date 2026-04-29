# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY ./web/package*.json ./
RUN npm install
COPY ./web/ ./
RUN npm run build

# Stage 2: Build the Ktor Backend
FROM gradle:8-jdk17 AS build
WORKDIR /home/gradle/project
COPY --chmod=755 gradlew .
COPY gradle gradle
COPY settings.gradle.kts .
COPY gradle.properties .
COPY app app
# Copy the built frontend into resources BEFORE running Gradle
COPY --from=frontend-build /frontend/dist /home/gradle/project/app/src/main/resources/static
# Skip the buildWeb task since we manually copied the files
ENV SKIP_WEB_BUILD=true
RUN ./gradlew :app:installDist --no-daemon

# Stage 3: Create the runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /home/gradle/project/app/build/install/app /app
EXPOSE 8080
ENTRYPOINT ["/app/bin/app"]
