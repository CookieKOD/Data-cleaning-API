#!/bin/bash

# Script de démarrage pour l'API de traitement de données
# Usage: ./run.sh [port]

set -e

# Configuration par défaut
DEFAULT_PORT=8080
PORT=${1:-$DEFAULT_PORT}

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérification de Java
    if ! command -v java &> /dev/null; then
        log_error "Java n'est pas installé. Veuillez installer Java 11 ou supérieur."
        exit 1
    fi
    
    # Vérification de la version de Java
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 11 ]; then
        log_error "Java 11 ou supérieur est requis. Version actuelle: $JAVA_VERSION"
        exit 1
    fi
    
    # Vérification de SBT
    if ! command -v sbt &> /dev/null; then
        log_error "SBT n'est pas installé. Veuillez installer SBT."
        exit 1
    fi
    
    log_success "Tous les prérequis sont satisfaits"
}

# Vérification du port
check_port() {
    log_info "Vérification du port $PORT..."
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Le port $PORT est déjà utilisé"
        read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Arrêt du script"
            exit 0
        fi
    else
        log_success "Le port $PORT est disponible"
    fi
}

# Compilation du projet
compile_project() {
    log_info "Compilation du projet..."
    
    if sbt compile; then
        log_success "Compilation réussie"
    else
        log_error "Échec de la compilation"
        exit 1
    fi
}

# Exécution des tests
run_tests() {
    log_info "Exécution des tests..."
    
    if sbt test; then
        log_success "Tous les tests sont passés"
    else
        log_warning "Certains tests ont échoué, mais le serveur peut quand même démarrer"
        read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Arrêt du script"
            exit 0
        fi
    fi
}

# Démarrage du serveur
start_server() {
    log_info "Démarrage du serveur sur le port $PORT..."
    
    # Modification temporaire du port si nécessaire
    if [ "$PORT" != "$DEFAULT_PORT" ]; then
        log_info "Configuration du port $PORT..."
        # Ici, on pourrait modifier le fichier Main.scala temporairement
        # Pour simplifier, on utilise une variable d'environnement
        export SERVER_PORT=$PORT
    fi
    
    log_success "Serveur démarré avec succès!"
    log_info "Interface web disponible sur: http://localhost:$PORT"
    log_info "API disponible sur: http://localhost:$PORT/health"
    log_info ""
    log_info "Appuyez sur Ctrl+C pour arrêter le serveur"
    
    # Démarrage avec SBT
    sbt run
}

# Fonction de nettoyage
cleanup() {
    log_info "Nettoyage en cours..."
    # Restaurer les fichiers modifiés si nécessaire
    log_success "Nettoyage terminé"
}

# Gestionnaire de signal pour le nettoyage
trap cleanup EXIT

# Affichage de l'en-tête
echo "=================================================="
echo "    API de Traitement de Données - Scala"
echo "=================================================="
echo ""

# Vérification des arguments
if [ "$#" -gt 1 ]; then
    log_error "Usage: $0 [port]"
    exit 1
fi

# Vérification que nous sommes dans le bon répertoire
if [ ! -f "build.sbt" ]; then
    log_error "Ce script doit être exécuté depuis le répertoire backend"
    log_info "Usage: cd backend && ./run.sh"
    exit 1
fi

# Exécution des étapes
check_prerequisites
check_port
compile_project

# Demander si l'utilisateur veut exécuter les tests
read -p "Voulez-vous exécuter les tests avant le démarrage ? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    log_info "Tests ignorés"
else
    run_tests
fi

# Démarrage du serveur
start_server

