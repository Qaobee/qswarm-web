FROM nginx:1.11.5-alpine
MAINTAINER Xavier MARIN <marin.xavier@gmail.com>
RUN apk add --update bash && rm -rf /var/cache/apk/*
COPY dist/ /data/www
COPY bower_components/angular-i18n /data/www/bower_components/angular-i18n
COPY bower_components/momentjs /data/www/bower_components/momentjs
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY scripts/entrypoint.sh /home/nginx/entrypoint.sh
RUN chmod +x /home/nginx/entrypoint.sh
WORKDIR /data/www
EXPOSE 80
CMD ["/home/nginx/entrypoint.sh"]