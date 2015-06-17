# Contribute

+ sudo apt-get remove nodejs nodejs-legacy npm
+ curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
+ sudo apt-get install -y nodejs npm
+ sudo npm install -g yo gulp bower surge generator-gulp-angular --unsafe-perm
+ sudo npm install -g 
+ npm install 
+ bower install 

# Run local 

+ gulp serve

# Deploy into production

+ First test in local env :
    + gulp serve:dist
+ if fine deploy
    + gulp 
    + cd dist
    + surge
