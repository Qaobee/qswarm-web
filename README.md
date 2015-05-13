# QSwarm

## Description
Il s'agit du serveur principal offrant l'ensemble des services pour : 
* l'IHM AngularJS
* Les applications mobile
 
## Architecture
Il est hébergé chez OpenShift et est basé sur Vert.X.
> For more details about this cartridge please visit: <https://github.com/vert-x/openshift-cartridge>

Il utilise MongoDB.

## Après le clonage du dépôt
`./scripts/init.sh`

## Lancer le serveur en local
`mvn clean package vertx:runMod`

## Déploiement
`./scripts/dist.sh`

## Divers
### Vérifier les maj maven
`mvn versions:display-plugin-updates`

### Résoudre le conflit M2Eclipse/Exec-plugin
`cd ~/workspace`
`mvn archetype:generate -DgroupId=org.eclipse.m2e -DartifactId=lifecycle-mapping -Dversion=1.0.0 -DarchetypeArtifactId=maven-archetype-mojo`
`cd lifecycle-mapping`
`mvn install`

<settings>
        <servers>
        <server>
            <id>qaobeeFtp</id>
            <username>qaobee</username>
            <password>zaza66629</password>
        </server>
    </servers>
</settings>
