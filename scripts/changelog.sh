#!/usr/bin/env bash
# Generates changelog tag by tag
NEXT=$(date +%F)
echo "# CHANGELOG"
echo "---"

git tag | sort -u -r | head -n 20 | while read TAG ; do
    if [ -z ${LAST_TAG+x} ];
        then
            TAG_QUERY="...$TAG";
        else
            TAG_QUERY="$TAG...$LAST_TAG";
        fi
        echo
        echo '## '$TAG
        git log --date=iso --format="> +  ts%ct  | %s %N (*par [%cN](%ce) [view commit](https://gitlab.com/qaobee/QSwarm/commit/%H)*)" ${TAG_QUERY} | while read LOG; do
            BEGIN=$(echo $LOG | sed -rn 's/(^.*)\ ts[0-9]{10}\ .*$/\1/p')
            TIMESTAMP=@$(echo $LOG | sed -rn 's/^.*\ ts([0-9]{10})\ .*$/\1/p')
            TIME=$(date -d $TIMESTAMP +'%x %H:%M')
            END=$(echo $LOG | sed -rn 's/^.*\ ts[0-9]{10}\ (.*)$/\1/p')
            JIRA=$(echo $END | sed -rn 's/(QHBWEB-[0-9]+)/[\1](https:\/\/qaobee.atlassian.net\/browse\/\1)/p')
            if [ -n "$JIRA" ]; then
                echo "$BEGIN $TIME $JIRA";
            else
                echo "$BEGIN $TIME $END";
            fi
        done
    LAST_TAG=$TAG
done