# Step 1: Build the application using Node.js
FROM node:18 AS builder

WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies
RUN npm install

# Build the project for production
RUN npm run build

# Step 2: Serve the static files using Nginx
FROM nginx:alpine

# Copy built files from builder to Nginx web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
