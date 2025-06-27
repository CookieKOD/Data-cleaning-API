# Architecture du Système

## Vue d'ensemble

L'API de traitement de données suit une architecture en couches avec séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface Web (Frontend)                 │
│                   HTML + CSS + JavaScript                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────┐
│                     API Layer (Routes)                      │
│                      Akka HTTP                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Service Layer                             │
│                DataProcessingService                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Model Layer                               │
│              Case Classes + JSON Protocol                   │
└─────────────────────────────────────────────────────────────┘
```

## Composants Principaux

### 1. Frontend (Interface Web)

**Localisation :** `/frontend/`

**Technologies :**
- HTML5 pour la structure
- CSS3 avec Bootstrap 5 pour le style
- JavaScript ES6 pour l'interactivité

**Responsabilités :**
- Interface utilisateur pour l'upload de fichiers
- Affichage des résultats de traitement
- Communication avec l'API backend via AJAX
- Gestion des erreurs côté client

**Fichiers principaux :**
- `index.html` : Page principale avec formulaire d'upload
- `styles.css` : Styles personnalisés et animations
- `script.js` : Logique JavaScript pour l'interaction

### 2. Backend (API Scala)

**Localisation :** `/backend/src/main/scala/com/dataprocessing/`

#### 2.1 Couche de Routage (`routes/`)

**Fichier :** `ApiRoutes.scala`

**Responsabilités :**
- Définition des endpoints REST
- Gestion des requêtes HTTP
- Configuration CORS
- Sérialisation/désérialisation JSON
- Gestion des erreurs HTTP

**Endpoints :**
- `GET /health` : Vérification de l'état de l'API
- `POST /process` : Traitement des données
- `GET /*` : Serveur de fichiers statiques

#### 2.2 Couche de Service (`services/`)

**Fichier :** `DataProcessingService.scala`

**Responsabilités :**
- Logique métier de traitement des données
- Parsing des différents formats (CSV, JSON, XML)
- Algorithmes de nettoyage et normalisation
- Génération des statistiques

**Méthodes principales :**
- `processData()` : Point d'entrée principal
- `parseData()` : Parsing selon le type de fichier
- `cleanAndNormalizeData()` : Nettoyage et normalisation
- `fillMissingValue()` : Traitement des valeurs manquantes
- `treatOutliers()` : Suppression des valeurs aberrantes
- `normalizeData()` : Normalisation des données numériques

#### 2.3 Couche de Modèle (`models/`)

**Fichier :** `DataModels.scala`

**Responsabilités :**
- Définition des structures de données
- Protocoles de sérialisation JSON
- Types de données métier

**Modèles principaux :**
- `ProcessingRequest` : Requête de traitement
- `ProcessingResponse` : Réponse avec résultats
- `ProcessingStatistics` : Statistiques de traitement
- `DataRow` : Ligne de données
- `ProcessedDataset` : Jeu de données traité

#### 2.4 Point d'Entrée (`Main.scala`)

**Responsabilités :**
- Initialisation du système Akka
- Configuration du serveur HTTP
- Démarrage de l'application

## Flux de Données

### 1. Upload et Traitement

```
1. Utilisateur sélectionne un fichier
   ↓
2. Frontend lit le contenu du fichier
   ↓
3. Envoi POST /process avec données JSON
   ↓
4. ApiRoutes reçoit et valide la requête
   ↓
5. DataProcessingService traite les données
   ↓
6. Retour de la réponse JSON
   ↓
7. Frontend affiche les résultats
```

### 2. Traitement des Données

```
1. Parsing selon le format (CSV/JSON/XML)
   ↓
2. Détection et traitement des valeurs manquantes
   ↓
3. Suppression des doublons
   ↓
4. Détection et suppression des valeurs aberrantes
   ↓
5. Normalisation des colonnes numériques
   ↓
6. Génération des statistiques
   ↓
7. Conversion en format CSV de sortie
```

## Algorithmes de Traitement

### Valeurs Manquantes

**Stratégie :**
- **Colonnes numériques :** Remplacement par la moyenne
- **Colonnes textuelles :** Remplacement par la valeur la plus fréquente

**Implémentation :**
```scala
def fillMissingValue(column: String, originalValue: String, allRows: List[DataRow]): String = {
  val columnValues = allRows.map(_.values.getOrElse(column, "")).filter(_.trim.nonEmpty)
  
  val numericValues = columnValues.flatMap(v => Try(v.toDouble).toOption)
  
  if (numericValues.nonEmpty) {
    val mean = numericValues.sum / numericValues.length
    f"$mean%.2f"
  } else {
    columnValues.groupBy(identity).maxBy(_._2.length)._1
  }
}
```

### Détection des Valeurs Aberrantes

**Méthode :** IQR (Interquartile Range)

**Formule :**
- Q1 = 25ème percentile
- Q3 = 75ème percentile
- IQR = Q3 - Q1
- Limites : [Q1 - 1.5×IQR, Q3 + 1.5×IQR]

### Normalisation

**Méthode :** Min-Max Scaling

**Formule :** `(valeur - min) / (max - min)`

**Résultat :** Valeurs entre 0 et 1

## Gestion des Erreurs

### Côté Backend

**Types d'erreurs gérées :**
- Format de fichier non supporté
- Données malformées
- Fichiers vides
- Erreurs de parsing JSON/XML

**Mécanisme :**
```scala
try {
  // Traitement des données
} catch {
  case ex: Exception =>
    ProcessingResponse(
      success = false,
      message = s"Erreur: ${ex.getMessage}"
    )
}
```

### Côté Frontend

**Gestion :**
- Validation des types de fichiers
- Limitation de taille (10MB)
- Affichage des messages d'erreur
- Retry automatique en cas d'échec réseau

## Configuration et Déploiement

### Configuration Akka

**Fichier :** `application.conf`

```hocon
akka {
  loglevel = "INFO"
  http {
    server {
      request-timeout = 60s
      bind-timeout = 10s
    }
  }
}
```

### Build Configuration

**Fichier :** `build.sbt`

**Dépendances principales :**
- Akka HTTP pour le serveur web
- Spray JSON pour la sérialisation
- Scala CSV pour le traitement CSV
- JSON4S pour le traitement JSON
- Scala XML pour le traitement XML

## Sécurité

### CORS

Configuration permissive pour le développement :
```scala
private val corsHeaders = List(
  `Access-Control-Allow-Origin`.*,
  `Access-Control-Allow-Methods`(GET, POST, PUT, DELETE, OPTIONS),
  `Access-Control-Allow-Headers`("Content-Type", "Authorization")
)
```

### Validation des Données

- Validation des types de fichiers
- Limitation de taille des uploads
- Sanitisation des données d'entrée

## Performance

### Optimisations

- Traitement en mémoire pour les fichiers de taille raisonnable
- Limitation d'affichage à 100 lignes dans l'interface
- Parsing efficace avec des bibliothèques spécialisées

### Limitations

- Taille maximale de fichier : 10MB
- Traitement synchrone (pas de streaming)
- Pas de persistance des données

## Extensibilité

### Ajout de Nouveaux Formats

1. Étendre `parseData()` dans `DataProcessingService`
2. Ajouter la logique de parsing spécifique
3. Mettre à jour la validation côté frontend

### Nouveaux Algorithmes

1. Ajouter des méthodes dans `DataProcessingService`
2. Intégrer dans le pipeline `cleanAndNormalizeData()`
3. Mettre à jour les statistiques

### API Extensions

1. Ajouter de nouvelles routes dans `ApiRoutes`
2. Créer de nouveaux modèles si nécessaire
3. Implémenter la logique métier correspondante

