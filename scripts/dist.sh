#!/usr/bin/env bash
red='\e[0;31m'
green='\e[0;32m'
NC='\e[0m' # No Color
echo -e "${green}****************************************************"
echo -e "Clean"
echo -e "****************************************************${NC}"
rm -rf dist/*
echo -e "${green}****************************************************"
echo -e "Running build"
echo -e "****************************************************${NC}"
gulp
STATUS=$?
    if [ $STATUS -eq 0 ]; then
    echo -e "${green}****************************************************"
    echo -e "Build ok, processing openshift deployment"
    echo -e "****************************************************${NC}"
    surge dist www.qaobee.com
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

