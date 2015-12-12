# QSwarm

## Description
Il s'agit du serveur principal offrant l'ensemble des services pour : 
* l'IHM AngularJS
* Les applications mobile
 
## Prérequis

- docker (déploiements uniquement) 
    - [https://docs.docker.com/installation/mac/](OSX) 
    - [https://docs.docker.com/installation/ubuntulinux/](Ubuntu) 
    - [https://docs.docker.com/engine/installation/windows/](Windows)
- nodeJs 
    - [https://nodejs.org/en/download/package-manager/](Ubuntu/OSX) 
    - [https://nodejs.org/en/download/](Windows)


    sudo apt-get install git_stats lftp gem
    sudo gem install semver
    sudo npm install -g gulp plato jsdoc surge

## Après le clonage du dépôt

    npm install
    bower install

## Lancer le serveur en local

    gulp serve

## Déploiement
    
    ./scripts/dist.sh

## Docker

    gulp
    docker build -t qaobee-web .
    docker run --name qswarm-web -ti -p 80:80 -e HIVE_URL=http://hive.qaobee.com -d qaobee-web
    docker stop qswarm-web
    