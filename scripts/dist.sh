#!/usr/bin/env bash
red='\e[0;31m'
green='\e[0;32m'
NC='\e[0m' # No Color
echo -e "${green}****************************************************"
echo -e "Clean"
echo -e "****************************************************${NC}"
semver init
semver inc patch
tag=$(semver tag)
rm -rf dist/*
echo -e "${green}****************************************************"
echo -e "Running build"
echo -e "****************************************************${NC}"
npm install
bower install
gulp
STATUS=$?
    if [ $STATUS -eq 0 ]; then
    echo -e "${green}****************************************************"
    echo -e "Build ok, processing deployment"
    echo -e "****************************************************${NC}"
    mkdir -p dist/bower_components
    cp -R bower_components/angular-i18n dist/bower_components/.
    cp -R bower_components/momentjs dist/bower_components/.
    surge dist www.qaobee.com
    echo -e "${green}****************************************************"
    echo -e "Deployment ok, processing docker : $tag"
    echo -e "****************************************************${NC}"
    git tag -a $tag -m "$tag"
    git push origin --tags
    docker build -t qaobee-web:$tag .
    docker tag -f qaobee-web:$tag tutum.co/giwi/qaobee-web:$tag
    docker push tutum.co/giwi/qaobee-web:$tag
    echo -e "${green}****************************************************"
    echo -e "Collecting GIT stats"
    echo -e "****************************************************${NC}"
    git_stats generate -o docs/git
    echo -e "${green}****************************************************"
    echo -e "Deploy doc"
    echo -e "****************************************************${NC}"
    gulp plato
    gulp jsdoc
    lftp ftp://heber_15054748:zaza666@ftp.hebergratuit.net -e "mirror -e -R --parallel=20 --only-newer --verbose docs /htdocs/qswarm-web/docs; quit"
 else
    echo -e "${red}****************************************************"
    echo -e "Build Failed"
    echo -e "****************************************************${NC}"
fi

