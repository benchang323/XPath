# Use the official Node.js image as a base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present) to install dependencies
COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Expose the port where your React backend runs
EXPOSE 3000

# Command to run your React application
CMD ["pnpm", "dev", "--host"]