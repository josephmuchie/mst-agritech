FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV SERVER_PORT=8081
EXPOSE 8081
# Railway sets PORT at runtime; CloudEnvironmentPostProcessor maps PORT -> SERVER_PORT
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD sh -c 'curl -f http://localhost:${SERVER_PORT:-${PORT:-8081}}/actuator/health || exit 1'
ENTRYPOINT ["java", "-jar", "app.jar"]
