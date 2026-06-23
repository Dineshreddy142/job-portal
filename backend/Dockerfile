# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
# This is done first so that dependencies are cached by Docker unless pom.xml changes
COPY pom.xml .

# Copy the source code and build the application
COPY src src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create a non-root user for security and set up uploads directory
RUN groupadd -r spring && useradd -r -g spring spring \
    && mkdir -p /app/uploads/resumes \
    && chown -R spring:spring /app

USER spring:spring

# Copy the built jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 10000

# Run the jar file
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
