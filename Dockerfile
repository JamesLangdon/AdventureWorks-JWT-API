FROM node:18.15.0

# Working Directory
WORKDIR /usr/src/app

# Copy Package.json files
COPY package*.json ./

RUN npm install typescript -g
RUN npm install prettier -g

# Install files
RUN npm install

# Copy source files into the container
COPY . .

# Build
RUN npm run build

# Expose the API port
EXPOSE 1337

CMD [ "node", "build/server.js" ]



