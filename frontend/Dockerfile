# Use Node.js LTS version
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps
RUN npx expo install react-dom react-native-web

# Copy source code
COPY . .

# Expose Expo Web port
EXPOSE 8081

# Start Expo Web
CMD ["npx", "expo", "start", "--web"]
