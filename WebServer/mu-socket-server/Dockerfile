FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --prod

# Copy the rest of the application files (excluding node_modules via .dockerignore)
COPY . .

# Expose the necessary port
EXPOSE 44404

# Set the default command to run the SocketServer
CMD ["yarn", "start"]
