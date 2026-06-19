# RNV24 — single-service image (API + static frontend)
FROM node:20-bookworm-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

RUN npm ci

COPY . .

# Empty VITE_API_URL = same-origin (backend serves frontend/dist)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json /app/version.json ./
COPY --from=build /app/frontend/package.json ./frontend/
COPY --from=build /app/backend/package.json ./backend/
COPY --from=build /app/shared/package.json ./shared/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 3001

CMD ["npm", "start"]
