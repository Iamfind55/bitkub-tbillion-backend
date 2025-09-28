# Use an official Node.js LTS (Long Term Support) version as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build TypeScript code
RUN npm run build 

# Set the working directory in the container
WORKDIR /usr/src/app 
# Expose the port the app runs on
EXPOSE 3000
# Command to run the application
CMD ["node", "./build/server.js"]
