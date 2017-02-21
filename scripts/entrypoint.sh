#!/usr/bin/env bash
echo $HIVE_URL
IFS=','
# Hive params
array=( $HIVE_URL )
hiveUrl=""
for i in "${!array[@]}"; do
    echo "$i=>${array[i]}"
    hiveUrl+="server ${array[i]};\n    "
done
export http_proxy=http://b3605:zaza1601@proxy.gicm.net:3128
export https_proxy=http://b3605:zaza1601@proxy.gicm.net:3128
sed -i 's,%hive_url,'"$hiveUrl"',g' /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"