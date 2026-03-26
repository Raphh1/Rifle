FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install expo-cli globally
RUN npm install -g expo-cli@latest
RUN npm install -g @expo/ngrok@^4.1.0

# Copy package.json and lock file
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose Expo ports (default: 19000, 19001, 19002)
EXPOSE 19000 19001 19002

# Start Expo in development mode
CMD ["npx", "expo", "start", "--tunnel", "--clear"]