# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (Dùng Nginx siêu nhẹ)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy cấu hình SPA routing cho Nginx nếu cần (mặc định nginx:alpine cũng đủ chạy)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
