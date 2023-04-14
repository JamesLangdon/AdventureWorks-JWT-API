FROM node:18.15.0

# Working Directory
WORKDIR /usr/src/app

# Copy Package.json files
COPY package*.json ./

# Install Prettier (For our package's build function)
RUN npm install Prettier -g

# Install files
RUN npm install

# Copy source files into the container
COPY . .

# Build
RUN npm run build

# Expose the API port
EXPOSE 1337

CMD [ "build", "build/server.js" ]



