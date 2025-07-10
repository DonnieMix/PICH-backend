# Stage 1: Development Environment
FROM node:lts AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .

FROM development AS build

RUN yarn build

FROM node:lts-slim AS production

ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE
ARG DB_SYNCHRONIZE
ARG DB_LOGGING
ARG PRIVY_API_KEY
ARG PRIVY_APP_ID
ARG PORT
ARG FRONTEND_URL

ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_USERNAME=${DB_USERNAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_DATABASE=${DB_DATABASE}
ENV DB_SYNCHRONIZE=${DB_SYNCHRONIZE}
ENV DB_LOGGING=${DB_LOGGING}
ENV PRIVY_API_KEY=${PRIVY_API_KEY}
ENV PRIVY_APP_ID=${PRIVY_APP_ID}
ENV PORT=${PORT}
ENV FRONTEND_URL=${FRONTEND_URL}
ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/package.json ./package.json
COPY --from=development /usr/src/app/yarn.lock ./yarn.lock

RUN yarn install --immutable --production

EXPOSE 3003

CMD ["node", "dist/main.js"]