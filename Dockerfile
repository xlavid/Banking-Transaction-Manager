# Build stage
FROM node:20.11.1-alpine3.19 as build

# Add error handling for npm
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific npm version
RUN npm install -g npm@10.2.4 && \
    npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:1.25.4-alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add error handling for nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 