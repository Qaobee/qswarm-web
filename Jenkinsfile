#!/usr/bin/env groovy
import hudson.model.*

node {
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
        sh "./gradlew updateRancherImage -PdockerVersion=$version"
    }


    stage("Doc $version") {
        sh 'gulp jsdoc'
        sh 'git_stats generate -o build/docs/git'
        sh './gradlew gitChangelogTask'
        publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'build/docs/jsdoc',
                reportFiles: 'index.html',
                reportName: "JSdoc"
        ])
        publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'build/docs/git',
                reportFiles: 'index.html',
                reportName: "GitStats"
        ])
        publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'build/docs/changelog',
                reportFiles: 'index.html',
                reportName: "Changelog"
        ])
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