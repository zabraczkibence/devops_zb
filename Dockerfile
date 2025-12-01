# Step 1: build
FROM node:lts-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
# npm ci
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build

# Step 2: host
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
