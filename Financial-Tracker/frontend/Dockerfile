# Frontend Dockerfile - React app
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

# So dev server is reachable from host when running in Docker
ENV HOST=0.0.0.0
CMD ["npm", "start"]
