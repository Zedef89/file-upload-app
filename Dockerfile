# Usa l'immagine base di Node.js
FROM node:18

# Installa il client PostgreSQL
RUN apt-get update && apt-get install -y postgresql-client

# Imposta la directory di lavoro
WORKDIR /app

# Copia il package.json e installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia tutti i file del progetto
COPY . .

# 👉 Genera Prisma Client PRIMA del build di SvelteKit
RUN npx prisma generate

# 👉 Costruisce l'app SvelteKit
RUN npm run build

# Imposta la porta di esecuzione
EXPOSE 5173

# Comando di avvio
CMD ["npm", "run", "dev"]