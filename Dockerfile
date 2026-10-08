FROM nginxinc/nginx-unprivileged:alpine
COPY index.html style.css app.js /usr/share/nginx/html/
EXPOSE 8080
