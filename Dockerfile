FROM node:18-alpine


WORKDIR /app
COPY web .
ENV HOST=https://beejek-shop-c3lxzvdmoq-uc.a.run.app
ENV SHOPIFY_API_KEY=00814d04aaf05d80cb3e4e77ac2ebb41
ENV SHOPIFY_API_SECRET=8baf752e142d8552b02a03fa5d296ec5
ENV SCOPES=read_orders
ENV PORT=8080
RUN npm install
RUN cd frontend && npm install && npm run build
CMD ["npm", "run", "serve"]
