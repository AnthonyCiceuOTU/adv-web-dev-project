# frontend/Dockerfile

# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Inside Docker network, backend is reachable at http://backend:8000
ENV VITE_API_URL=http://backend:8000

RUN npm run build

# --- Run stage (nginx) ---
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
