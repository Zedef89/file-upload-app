# Usa un'immagine con Node.js
FROM node:18

# Installa il client PostgreSQL per poter usare pg_isready
RUN apt-get update && apt-get install -y postgresql-client

# Imposta la cartella di lavoro dentro il container
WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il codice dentro il container
COPY . .

# Costruisce l'app (opzionale, se usi `npm run build`)
RUN npm run build

# Esponi la porta del server SvelteKit
EXPOSE 5173

# Comando per avviare il server SvelteKit
CMD ["npm", "run", "dev"]