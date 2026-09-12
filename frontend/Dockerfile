FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* are baked at build time and run in the browser, so they must point
# at host-reachable URLs (localhost), not docker service names.
ARG NEXT_PUBLIC_DATA_SERVICE_URL=http://localhost:8000
ARG NEXT_PUBLIC_DECISION_ENGINE_URL=http://localhost:8001
ARG NEXT_PUBLIC_NLP_URL=http://localhost:8002
ENV NEXT_PUBLIC_DATA_SERVICE_URL=$NEXT_PUBLIC_DATA_SERVICE_URL \
    NEXT_PUBLIC_DECISION_ENGINE_URL=$NEXT_PUBLIC_DECISION_ENGINE_URL \
    NEXT_PUBLIC_NLP_URL=$NEXT_PUBLIC_NLP_URL
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
