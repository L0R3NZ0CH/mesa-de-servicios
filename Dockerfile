FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]