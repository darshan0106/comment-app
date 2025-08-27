# Stage 1: Build the Next.js application
FROM node:20 AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the API URL from a build argument
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js application
RUN npm run build

# Stage 2: Create the final production image
FROM node:20

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the Next.js app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]