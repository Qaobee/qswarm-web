#!/usr/bin/env bash
echo $HIVE_URL
sed -i 's,%hive_url,'"$HIVE_URL"',g' /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"