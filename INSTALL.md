# Guide d'Installation - API de Traitement de Données

Ce guide vous accompagne pas à pas pour installer et démarrer l'API de traitement de données.

## 📋 Prérequis Système

### Minimum Requis
- **Système d'exploitation :** Linux, macOS, ou Windows 10+
- **Mémoire RAM :** 4 GB minimum, 8 GB recommandé
- **Espace disque :** 2 GB d'espace libre
- **Connexion internet :** Requise pour le téléchargement des dépendances

### Logiciels Requis
- **Java :** Version 11 ou supérieure
- **SBT :** Scala Build Tool
- **Navigateur web :** Chrome, Firefox, Safari, ou Edge (version récente)

## 🚀 Installation par Plateforme

### Ubuntu/Debian Linux

#### 1. Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Installation de Java 11
```bash
# Installation d'OpenJDK 11
sudo apt install -y openjdk-11-jdk

# Vérification de l'installation
java -version
javac -version
```

#### 3. Installation de Coursier (gestionnaire Scala)
```bash
# Téléchargement et installation de Coursier
curl -fL https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-linux.gz | gzip -d > cs
chmod +x cs
sudo mv cs /usr/local/bin/cs
```

#### 4. Installation de Scala et SBT
```bash
# Installation via Coursier
cs setup -y

# Rechargement du profil
source ~/.profile

# Vérification des installations
scala -version
sbt --version
```

### macOS

#### 1. Installation avec Homebrew
```bash
# Installation de Homebrew si nécessaire
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installation de Java et SBT
brew install openjdk@11 sbt

# Configuration du JAVA_HOME
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@11"' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 2. Vérification
```bash
java -version
sbt --version
```

### Windows

#### 1. Installation de Java
1. Télécharger OpenJDK 11 depuis [Adoptium](https://adoptium.net/)
2. Exécuter l'installateur et suivre les instructions
3. Ajouter Java au PATH système

#### 2. Installation de SBT
1. Télécharger SBT depuis [scala-sbt.org](https://www.scala-sbt.org/download.html)
2. Exécuter l'installateur MSI
3. Redémarrer l'invite de commande

#### 3. Vérification
```cmd
java -version
sbt --version
```

## 📦 Déploiement de l'Application

### 1. Extraction du Projet
```bash
# Si vous avez le fichier ZIP
unzip data-processing-api.zip
cd data-processing-api

# Ou clonage depuis Git (si applicable)
git clone <repository-url>
cd data-processing-api
```

### 2. Vérification de la Structure
```bash
# La structure doit ressembler à :
data-processing-api/
├── backend/
│   ├── src/
│   ├── build.sbt
│   └── project/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── README.md
└── INSTALL.md
```

### 3. Compilation du Backend
```bash
# Navigation vers le dossier backend
cd backend

# Première compilation (peut prendre du temps)
sbt compile

# En cas d'erreur, nettoyer et recompiler
sbt clean compile
```

### 4. Exécution des Tests
```bash
# Exécution des tests unitaires
sbt test

# Vérification que tous les tests passent
```

### 5. Démarrage de l'Application
```bash
# Démarrage du serveur
sbt run

# Le serveur démarre sur http://localhost:8080
# Appuyer sur Ctrl+C pour arrêter
```

## 🌐 Accès à l'Application

### Interface Web
1. Ouvrir un navigateur web
2. Aller à l'adresse : `http://localhost:8080`
3. L'interface de traitement de données s'affiche

### Test de l'API
```bash
# Test de l'endpoint de santé
curl http://localhost:8080/health

# Réponse attendue : "API de traitement de données opérationnelle"
```

## 🔧 Configuration Avancée

### Modification du Port

**Fichier :** `backend/src/main/scala/com/dataprocessing/Main.scala`

```scala
// Changer le port de 8080 à 9000
val futureBinding = Http().newServerAt("0.0.0.0", 9000).bind(routes)
```

### Configuration de la Mémoire JVM

**Pour les gros fichiers :**
```bash
# Augmenter la mémoire heap
export SBT_OPTS="-Xmx2G -Xms1G"
sbt run
```

### Configuration Akka

**Fichier :** `backend/src/main/resources/application.conf`

```hocon
akka {
  loglevel = "DEBUG"  # Pour plus de logs
  
  http {
    server {
      request-timeout = 120s  # Timeout plus long
      bind-timeout = 20s
    }
  }
}
```

## 🐛 Résolution des Problèmes

### Problème : "java: command not found"

**Solution :**
```bash
# Vérifier l'installation de Java
which java

# Si absent, réinstaller Java
sudo apt install openjdk-11-jdk  # Ubuntu/Debian
brew install openjdk@11          # macOS

# Ajouter au PATH si nécessaire
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64  # Ubuntu
export PATH=$JAVA_HOME/bin:$PATH
```

### Problème : "sbt: command not found"

**Solution :**
```bash
# Réinstaller SBT via Coursier
cs install sbt

# Ou télécharger directement
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt update
sudo apt install sbt
```

### Problème : Port 8080 déjà utilisé

**Solutions :**
```bash
# Option 1 : Trouver et arrêter le processus
sudo lsof -i :8080
sudo kill -9 <PID>

# Option 2 : Changer le port dans Main.scala
# Modifier le port de 8080 à 8081 ou autre

# Option 3 : Utiliser un port différent temporairement
# Modifier temporairement le code
```

### Problème : Erreurs de compilation

**Solutions :**
```bash
# Nettoyer le projet
sbt clean

# Supprimer le cache SBT
rm -rf ~/.sbt/1.0/
rm -rf target/

# Recompiler
sbt compile
```

### Problème : Mémoire insuffisante

**Solutions :**
```bash
# Augmenter la mémoire JVM
export SBT_OPTS="-Xmx4G -Xms2G"

# Ou créer un fichier .sbtopts
echo "-Xmx4G" > .sbtopts
echo "-Xms2G" >> .sbtopts
```

### Problème : Dépendances non téléchargées

**Solutions :**
```bash
# Forcer le téléchargement des dépendances
sbt update

# Nettoyer le cache Ivy
rm -rf ~/.ivy2/cache/

# Utiliser un miroir différent (si problème réseau)
# Ajouter dans build.sbt :
# resolvers += "Maven Central" at "https://repo1.maven.org/maven2/"
```

## 📊 Tests de Performance

### Test de Charge Simple
```bash
# Installer Apache Bench (si disponible)
sudo apt install apache2-utils  # Ubuntu
brew install httpie             # macOS

# Test de l'endpoint de santé
ab -n 100 -c 10 http://localhost:8080/health
```

### Test avec Fichier de Données
```bash
# Créer un fichier de test
echo "nom,age,salaire
John,25,50000
Jane,30,60000
Bob,,45000" > test.csv

# Test via curl
curl -X POST http://localhost:8080/process \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.csv",
    "fileType": "csv",
    "data": "nom,age,salaire\nJohn,25,50000\nJane,30,60000\nBob,,45000"
  }'
```

## 🔒 Sécurité

### Configuration de Production

**Désactiver CORS permissif :**
```scala
// Dans ApiRoutes.scala, remplacer :
`Access-Control-Allow-Origin`.*

// Par :
`Access-Control-Allow-Origin`(HttpOrigin("https://votre-domaine.com"))
```

**Ajouter HTTPS :**
```scala
// Configuration SSL dans application.conf
akka.http.server {
  ssl-config {
    keystore = "path/to/keystore.jks"
    password = "your-password"
  }
}
```

## 📈 Monitoring

### Logs de l'Application
```bash
# Logs en temps réel
tail -f backend/server.log

# Recherche dans les logs
grep "ERROR" backend/server.log
```

### Métriques Système
```bash
# Utilisation CPU et mémoire
top -p $(pgrep -f "sbt")

# Connexions réseau
netstat -tulpn | grep :8080
```

## 🚀 Déploiement en Production

### Création d'un JAR Exécutable
```bash
# Dans le dossier backend
sbt assembly

# Le JAR sera créé dans target/scala-2.13/
java -jar target/scala-2.13/data-processing-api-assembly-0.1.0-SNAPSHOT.jar
```

### Service Systemd (Linux)
```bash
# Créer un fichier service
sudo nano /etc/systemd/system/data-processing-api.service

# Contenu du fichier :
[Unit]
Description=Data Processing API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/data-processing-api/backend
ExecStart=/usr/bin/java -jar target/scala-2.13/data-processing-api-assembly-0.1.0-SNAPSHOT.jar
Restart=always

[Install]
WantedBy=multi-user.target

# Activer le service
sudo systemctl enable data-processing-api
sudo systemctl start data-processing-api
```

## 📞 Support

En cas de problème persistant :

1. Vérifier les logs d'erreur
2. Consulter la documentation Scala/Akka
3. Vérifier les issues GitHub du projet
4. Contacter l'équipe de développement

## 📚 Ressources Supplémentaires

- [Documentation Scala](https://docs.scala-lang.org/)
- [Documentation Akka HTTP](https://doc.akka.io/docs/akka-http/current/)
- [Guide SBT](https://www.scala-sbt.org/1.x/docs/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

