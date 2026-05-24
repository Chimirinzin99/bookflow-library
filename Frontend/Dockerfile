FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port (Render requires 10000)
EXPOSE 10000

# Start Next.js
CMD ["npx", "next", "start", "-p", "10000"]