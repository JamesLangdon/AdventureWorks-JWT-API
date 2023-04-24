FROM mcr.microsoft.com/devcontainers/typescript-node:0-18

WORKDIR /app

# Copy the current directory contents into the container at /app
COPY ./build /app

# Install dependencies
RUN npm install

# Expose the port for the server
EXPOSE 1337

# Run the server.js file
CMD ["node", "build", "server.js"]
