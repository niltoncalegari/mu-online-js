FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Expose the necessary port
EXPOSE 55901

# Set the default command to run the GameServer
CMD ["yarn", "start"]

