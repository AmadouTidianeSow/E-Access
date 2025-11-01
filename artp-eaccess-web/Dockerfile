# Étape 1 : Construire l'application Angular
FROM node:18.20.2-slim AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Angular
RUN npm install
RUN npm install webpack@5.76.1
# Copier le code source de l'application Angular
COPY . .

# Compiler l'application Angular en mode production
RUN npm run build -- --base-href=/ --configuration=production
# RUN npm run build -- --configuration=devs
# Étape 2 : Préparer l'image Nginx
FROM nginx:alpine

# Copier le fichier de configuration personnalisé de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compilés depuis la première étape
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
