FROM nginx:alpine

# Install openssl for cert generation
RUN apk add --no-cache openssl

# Copy Angular build output (assumes you build outside Docker)
COPY dist/library-waitlist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Generate self-signed certs at build time if not present
RUN mkdir -p /etc/nginx/ssl && \
    if [ ! -f /etc/nginx/ssl/localhost.crt ]; then \
      openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/localhost.key \
        -out /etc/nginx/ssl/localhost.crt \
        -subj "/CN=localhost"; \
    fi

EXPOSE 443