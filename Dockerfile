FROM node:latest

COPY . .

RUN npm ci && npm link

ENTRYPOINT ["/entrypoint.sh"]
