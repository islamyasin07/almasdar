# Build Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build production (CSR) assets
RUN npm run build

# Serve with Nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
# Copy built static files
COPY --from=build /app/dist/frontend/browser ./
# Replace default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
