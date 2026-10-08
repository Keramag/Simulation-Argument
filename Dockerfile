FROM nginxinc/nginx-unprivileged:alpine
COPY index.html style.css content.js visuals.js app.js /usr/share/nginx/html/
EXPOSE 8080
