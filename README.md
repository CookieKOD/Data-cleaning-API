# API de Traitement de Données

Une API complète développée en Scala avec Akka HTTP pour automatiser le traitement et le nettoyage de données. L'application inclut une interface web moderne pour faciliter l'utilisation.

## 🎯 Objectifs

L'objectif de ce projet est de mettre en place une API qui automatise la partie Data Processing (Nettoyage des données) en utilisant le langage Scala et ses technologies.

## 🚀 Fonctionnalités

L'API automatise les tâches suivantes :

1. **Détection et traitement des valeurs manquantes** - Identification automatique et remplacement par des valeurs appropriées
2. **Détection et traitement des valeurs aberrantes** - Suppression des outliers statistiques
3. **Suppression des doublons** - Élimination des enregistrements dupliqués
4. **Normalisation des données** - Normalisation des colonnes numériques entre 0 et 1

## 📁 Structure du Projet

```
data-processing-api/
├── backend/                    # Backend Scala avec Akka HTTP
│   ├── src/
│   │   ├── main/scala/com/dataprocessing/
│   │   │   ├── models/         # Modèles de données
│   │   │   ├── services/       # Services de traitement
│   │   │   ├── routes/         # Routes API
│   │   │   └── Main.scala      # Point d'entrée
│   │   └── test/scala/         # Tests unitaires
│   ├── build.sbt              # Configuration SBT
│   └── project/               # Configuration du projet
├── frontend/                  # Interface web
│   ├── index.html            # Page principale
│   ├── styles.css            # Styles CSS
│   └── script.js             # Logique JavaScript
└── README.md                 # Documentation
```

## 🛠️ Technologies Utilisées

### Backend
- **Scala 2.13** - Langage de programmation principal
- **Akka HTTP** - Framework web pour les APIs REST
- **Spray JSON** - Sérialisation/désérialisation JSON
- **Scala CSV** - Traitement des fichiers CSV
- **JSON4S** - Traitement des fichiers JSON
- **Scala XML** - Traitement des fichiers XML
- **ScalaTest** - Framework de tests

### Frontend
- **HTML5** - Structure de l'interface
- **CSS3** - Styles et animations
- **JavaScript ES6** - Logique côté client
- **Bootstrap 5** - Framework CSS responsive
- **Font Awesome** - Icônes

## 📋 Prérequis

- **Java 11 ou supérieur**
- **SBT (Scala Build Tool)**
- **Navigateur web moderne**

## 🚀 Installation et Démarrage

### 1. Installation des dépendances

#### Sur Ubuntu/Debian :
```bash
# Installation de Java
sudo apt update
sudo apt install -y openjdk-11-jdk

# Installation de Coursier (gestionnaire de packages Scala)
curl -fL https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-linux.gz | gzip -d > cs
chmod +x cs
sudo mv cs /usr/local/bin/cs

# Installation de Scala et SBT
cs setup -y
source ~/.profile
```

#### Sur macOS :
```bash
# Avec Homebrew
brew install openjdk@11 sbt
```

#### Sur Windows :
- Télécharger et installer Java 11 depuis [AdoptOpenJDK](https://adoptopenjdk.net/)
- Télécharger et installer SBT depuis [scala-sbt.org](https://www.scala-sbt.org/download.html)

### 2. Démarrage de l'application

```bash
# Naviguer vers le dossier backend
cd data-processing-api/backend

# Compiler le projet
sbt compile

# Démarrer le serveur
sbt run
```

Le serveur démarre sur `http://localhost:8080`

### 3. Accès à l'interface web

Ouvrir un navigateur et aller à : `http://localhost:8080`

## 📖 Utilisation

### Interface Web

1. **Upload de fichier** : Glissez-déposez ou sélectionnez un fichier CSV, JSON ou XML
2. **Traitement** : Cliquez sur "Traiter les données"
3. **Résultats** : Visualisez les statistiques et les données nettoyées
4. **Téléchargement** : Téléchargez le fichier CSV traité

### API REST

#### Endpoint de santé
```
GET /health
```

#### Traitement de données
```
POST /process
Content-Type: application/json

{
  "fileName": "data.csv",
  "fileType": "csv",
  "data": "nom,age,salaire\\nJohn,25,50000\\nJane,,60000"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Données traitées avec succès",
  "processedData": "nom,age,salaire\\nJohn,25,0.0000\\nJane,27.5,1.0000",
  "statistics": {
    "totalRows": 2,
    "missingValuesHandled": 1,
    "outliersTreated": 0,
    "duplicatesRemoved": 0,
    "normalizedColumns": 2
  }
}
```

## 🧪 Tests

### Exécution des tests unitaires
```bash
cd backend
sbt test
```

### Tests d'intégration
Les tests couvrent :
- Traitement des fichiers CSV, JSON et XML
- Gestion des erreurs
- Validation des données
- Logique de nettoyage

## 📊 Algorithmes de Traitement

### Valeurs Manquantes
- **Numériques** : Remplacement par la moyenne
- **Textuelles** : Remplacement par la valeur la plus fréquente

### Valeurs Aberrantes
- Détection par la méthode IQR (Interquartile Range)
- Suppression des valeurs en dehors de [Q1 - 1.5×IQR, Q3 + 1.5×IQR]

### Normalisation
- Normalisation Min-Max : (valeur - min) / (max - min)
- Application uniquement aux colonnes numériques

## 🔧 Configuration

### Modification du port
Éditer `src/main/scala/com/dataprocessing/Main.scala` :
```scala
val futureBinding = Http().newServerAt("0.0.0.0", 9000).bind(routes)
```

### Configuration Akka
Modifier `src/main/resources/application.conf` pour ajuster les paramètres Akka.

## 🐛 Dépannage

### Erreur "java: command not found"
- Vérifier l'installation de Java : `java -version`
- Ajouter Java au PATH

### Erreur de compilation SBT
- Nettoyer le projet : `sbt clean`
- Recompiler : `sbt compile`

### Port déjà utilisé
- Changer le port dans Main.scala
- Ou arrêter le processus utilisant le port 8080

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- **Équipe de développement** - Développement initial

## 🙏 Remerciements

- Communauté Scala pour les excellentes bibliothèques
- Akka team pour le framework HTTP
- Bootstrap team pour le framework CSS

