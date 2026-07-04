# Stage 1: Build the React application
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# We need the build-time env variable for the API URL, but in a true Dockerized 
# deployment, you often inject variables at runtime. With Vite, env variables 
# starting with VITE_ are statically replaced during build.
# A common workaround is to build it with a placeholder and replace it at container start,
# but for simplicity, we'll assume the default VITE_PUBLIC_API_URL or it will be passed 
# as an ARG.
ARG VITE_PUBLIC_API_URL
ENV VITE_PUBLIC_API_URL=${VITE_PUBLIC_API_URL}

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the custom Nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
