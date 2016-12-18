#!/usr/bin/env groovy
import hudson.model.*

node {
    def rancherCli = 'v0.8.6'
    def version = ''
    stage('Checkout') {
        git credentialsId: 'b74a476d-7464-429c-ab8e-7ebbe03bcd1f', url: 'git@gitlab.com:qaobee/qswarm-web.git'
        sh 'git fetch --tags'
        version = this.version()
        echo("Building $version")
    }

    stage("Build $version") {
        sh 'rm -fr node_modules'
        sh 'rm -fr bower_components'
        sh 'npm cache clean'
        sh 'bower cache clean'
        sh 'npm install'
        sh 'bower install'
        sh 'gulp docker'
        sh 'mkdir -p dist/bower_components'
        sh 'cp -R bower_components/angular-i18n dist/bower_components/.'
        sh 'cp -R bower_components/momentjs dist/bower_components/.'
    }

    stage("Doc $version") {
        sh 'gulp jsdoc'
        sh 'git_stats generate -o docs/git'
    }

    stage("Quality $version") {
        sh "./gradlew sonarqube -Dsonar.projectVersion=$version -Dsonar.login=marin.xavier -Dsonar.password=zaza66629!"
    }

    stage("Docker $version") {
        timeout(time: 30, unit: 'DAYS') {
            input 'Build docker ?'
        }
        sh "docker build -t registry.gitlab.com/qaobee/qswarm-web:$version ."
        sh "docker tag registry.gitlab.com/qaobee/qswarm-web:$version registry.gitlab.com/qaobee/qswarm-web"
        sh "docker push registry.gitlab.com/qaobee/qswarm-web:$version"
        sh "docker push registry.gitlab.com/qaobee/qswarm-web"
        sh "docker rmi registry.gitlab.com/qaobee/qswarm-web:$version"
        sh "git tag -a $version -m \"$version\""
        sh "git push origin --tags"
    }

    stage("Deploy $version in REC") {
        sh "wget https://github.com/rancher/rancher-compose/releases/download/$rancherCli/rancher-compose-linux-amd64-$rancherCli" + ".tar.gz"
        sh "tar -zxf rancher-compose-linux-amd64-$rancherCli" + ".tar.gz"
        sh "rm -f rancher-compose-linux-amd64-$rancherCli" + ".tar.gz"
        sh "cat > docker-compose.yml <<EOC\n" +
                "qswarmweb:\n" +
                "  environment:\n" +
                "    HIVE_URL: http://hive:8080\n" +
                "  log_driver: ''\n" +
                "  labels:\n" +
                "    io.rancher.container.pull_image: always\n" +
                "    io.rancher.scheduler.affinity:host_label: tag=web\n" +
                "    io.rancher.container.dns: 'true'\n" +
                "  image: registry.gitlab.com/qaobee/qswarm-web:$version\n" +
                "  links:\n" +
                "  - qaobee-hive:hive\n" +
                "  net: host\n" +
                "EOC"
        sh "./rancher-compose-$rancherCli/rancher-compose \\\n" +
                "--url http://vps234741.ovh.net:8080 \\\n" +
                "--access-key 854D77F36BD20C5D89FE \\\n" +
                "--secret-key p8ktQVdpEdGp4rwfJCfFoq5abCL2eYTXSHwee3ot  \\\n" +
                "--project-name Qaobee-Recette \\\n" +
                "up -d --force-upgrade qswarmweb\n" +
                "./rancher-compose-$rancherCli/rancher-compose \\\n" +
                "--url http://vps234741.ovh.net:8080 \\\n" +
                "--access-key 854D77F36BD20C5D89FE \\\n" +
                "--secret-key p8ktQVdpEdGp4rwfJCfFoq5abCL2eYTXSHwee3ot  \\\n" +
                "--project-name Qaobee-Recette \\\n" +
                "up -d --upgrade --confirm-upgrade"
        sh "rm -f docker-compose.yml"
        sh "rm -fr rancher-compose-$rancherCli"
        sh 'rm -fr node_modules'
        sh 'rm -fr dist'
        sh 'rm -fr docs'
    }
}

def version() {
    def v = sh(returnStdout: true, script: 'git describe --abbrev=0 --tags').trim().substring(1).tokenize('.').toArray()
    def gitVersion = [
            major: v[0].toInteger(),
            minor: v[1].toInteger(),
            patch: v[2].toInteger() + 1
    ]
    return 'v' + gitVersion.values().join('.')
}