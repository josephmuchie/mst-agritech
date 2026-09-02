FROM node:20-alpine AS build
WORKDIR /app
ARG CORE_API_PORT=8081
ARG VITE_API_BASE_URL=http://localhost:${CORE_API_PORT}/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# Same default as above — override both at build time if core-api's port ever changes.
ENV CORE_API_PORT=8081
COPY --from=build /app/dist /usr/share/nginx/html
# nginx's entrypoint envsubst's *.template into conf.d on container start, so
# CORE_API_PORT can still be overridden at `docker run`/compose time, not just at build time.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
