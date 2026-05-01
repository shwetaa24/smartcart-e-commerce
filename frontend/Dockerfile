# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Accept build-time API URL (Now defaults to standard port 80)
ARG VITE_API_URL=http://65.1.92.101
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Use custom Nginx config to proxy /api/ to the backend container
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
