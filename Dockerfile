FROM node:latest

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json .

# RUN npm i webuntis 

# RUN npm i prisma 

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the working directory contents into the container at /usr/src/app
COPY . .

# RUN npx prisma migrate dev --schema ./prisma/schema.prisma --name init

RUN npx prisma generate

# Compile TypeScript into JavaScript
RUN npm run build


# Run the app when the container launches
CMD sh -c 'npx prisma migrate deploy --name init && node .'