FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
        git \
        curl \
        zip \
        unzip \
        bash \
        icu-dev \
        oniguruma-dev \
        libzip-dev \
        mysql-client \
        autoconf \
        build-base \
        linux-headers \
    && docker-php-ext-install pdo pdo_mysql mbstring intl bcmath zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf build-base linux-headers

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

ARG UID=1000
ARG GID=1000
RUN addgroup -g ${GID} laravel && adduser -G laravel -g laravel -s /bin/sh -D -u ${UID} laravel

USER laravel

EXPOSE 9000
CMD ["php-fpm"]
