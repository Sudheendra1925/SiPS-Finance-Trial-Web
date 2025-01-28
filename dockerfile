# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR app.js

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define the environment variable file (if applicable)
# ENV NODE_ENV=production

# Command to start the application
CMD ["node", "app.js"]
