# Production stage only - dist is pre-built in CI with secrets
FROM nginx:stable-alpine

# Copy pre-built assets from CI
COPY dist/ /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.inc /etc/nginx/conf.d/security-headers.inc

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
