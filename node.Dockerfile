FROM node:20.5.1
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# local in development, ci in github actions
ARG RUN_ENV=local 
RUN if [ "$RUN_ENV" = "ci" ]; then npm ci --only=production; else npm ci; fi

# Copy source code last (changes most frequently)
COPY . .

CMD ["npm", "run", "dev"]
