// Variables globales
let selectedFile = null;
let processedData = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkApiHealth();
});

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    // Gestion du drag & drop
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    uploadZone.addEventListener('click', () => fileInput.click());

    // Gestion de la sélection de fichier
    fileInput.addEventListener('change', handleFileSelect);
}

// Vérification de la santé de l'API
async function checkApiHealth() {
    try {
        const response = await fetch('/health');
        if (response.ok) {
            console.log('API opérationnelle');
        }
    } catch (error) {
        console.warn('API non disponible, utilisation du mode local');
    }
}

// Gestion du drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

// Gestion du drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

// Gestion du drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Gestion de la sélection de fichier
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Traitement du fichier sélectionné
function handleFile(file) {
    // Vérification du type de fichier
    const allowedTypes = ['text/csv', 'application/json', 'text/xml', 'application/xml'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['csv', 'json', 'xml'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        showError('Type de fichier non supporté. Veuillez sélectionner un fichier CSV, JSON ou XML.');
        return;
    }

    // Vérification de la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('Le fichier est trop volumineux. Taille maximale autorisée : 10MB.');
        return;
    }

    selectedFile = file;
    displayFileInfo(file);
    enableProcessButton();
    hideError();
}

// Affichage des informations du fichier
function displayFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileDetails = document.getElementById('fileDetails');
    
    fileName.textContent = file.name;
    fileDetails.textContent = `${formatFileSize(file.size)} • ${getFileType(file.name)}`;
    
    fileInfo.classList.remove('d-none');
}

// Formatage de la taille du fichier
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Détermination du type de fichier
function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'csv': return 'Fichier CSV';
        case 'json': return 'Fichier JSON';
        case 'xml': return 'Fichier XML';
        default: return 'Fichier inconnu';
    }
}

// Activation du bouton de traitement
function enableProcessButton() {
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = false;
}

// Effacement du fichier sélectionné
function clearFile() {
    selectedFile = null;
    document.getElementById('fileInfo').classList.add('d-none');
    document.getElementById('fileInput').value = '';
    document.getElementById('processBtn').disabled = true;
    hideResults();
    hideError();
}

// Traitement du fichier
async function processFile() {
    if (!selectedFile) {
        showError('Aucun fichier sélectionné.');
        return;
    }

    showLoading();
    hideResults();
    hideError();

    try {
        const fileContent = await readFileContent(selectedFile);
        const fileType = selectedFile.name.split('.').pop().toLowerCase();
        
        const requestData = {
            fileName: selectedFile.name,
            fileType: fileType,
            data: fileContent
        };

        const response = await fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        
        if (result.success) {
            processedData = result.processedData;
            displayResults(result);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Erreur lors du traitement:', error);
        showError('Erreur lors du traitement du fichier. Veuillez réessayer.');
    } finally {
        hideLoading();
    }
}

// Lecture du contenu du fichier
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
    });
}

// Affichage du chargement
function showLoading() {
    document.getElementById('loadingZone').classList.remove('d-none');
}

// Masquage du chargement
function hideLoading() {
    document.getElementById('loadingZone').classList.add('d-none');
}

// Affichage des résultats
function displayResults(result) {
    const resultsZone = document.getElementById('resultsZone');
    
    // Affichage des statistiques
    displayStatistics(result.statistics);
    
    // Affichage du tableau de données
    displayDataTable(result.processedData);
    
    resultsZone.classList.remove('d-none');
}

// Affichage des statistiques
function displayStatistics(stats) {
    const statisticsCards = document.getElementById('statisticsCards');
    
    const statisticsData = [
        {
            value: stats.totalRows,
            label: 'Lignes traitées',
            icon: 'fas fa-table',
            color: 'primary'
        },
        {
            value: stats.missingValuesHandled,
            label: 'Valeurs manquantes',
            icon: 'fas fa-search',
            color: 'warning'
        },
        {
            value: stats.outliersTreated,
            label: 'Valeurs aberrantes',
            icon: 'fas fa-exclamation-circle',
            color: 'danger'
        },
        {
            value: stats.duplicatesRemoved,
            label: 'Doublons supprimés',
            icon: 'fas fa-copy',
            color: 'info'
        },
        {
            value: stats.normalizedColumns,
            label: 'Colonnes normalisées',
            icon: 'fas fa-balance-scale',
            color: 'success'
        }
    ];

    statisticsCards.innerHTML = statisticsData.map(stat => `
        <div class="col-md-2 col-sm-4 col-6">
            <div class="stats-card">
                <i class="${stat.icon} text-${stat.color}" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <div class="stats-number text-${stat.color}">${stat.value}</div>
                <div class="stats-label">${stat.label}</div>
            </div>
        </div>
    `).join('');
}

// Affichage du tableau de données
function displayDataTable(csvData) {
    const dataTable = document.getElementById('dataTable');
    
    if (!csvData) {
        dataTable.innerHTML = '<tr><td colspan="100%">Aucune donnée à afficher</td></tr>';
        return;
    }

    const lines = csvData.trim().split('\n');
    if (lines.length === 0) {
        dataTable.innerHTML = '<tr><td colspan="100%">Aucune donnée à afficher</td></tr>';
        return;
    }

    // Parsing du CSV
    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    // Limitation à 100 lignes pour l'affichage
    const displayRows = rows.slice(0, 100);
    const hasMoreRows = rows.length > 100;

    // Génération du tableau
    let tableHTML = '<thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${escapeHtml(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    displayRows.forEach(row => {
        tableHTML += '<tr>';
        headers.forEach((header, index) => {
            const value = row[index] || '';
            tableHTML += `<td>${escapeHtml(value)}</td>`;
        });
        tableHTML += '</tr>';
    });

    if (hasMoreRows) {
        tableHTML += `<tr><td colspan="${headers.length}" class="text-center text-muted">
            <i class="fas fa-ellipsis-h me-2"></i>
            ${rows.length - 100} lignes supplémentaires (téléchargez le fichier complet)
        </td></tr>`;
    }

    tableHTML += '</tbody>';
    dataTable.innerHTML = tableHTML;
}

// Parsing d'une ligne CSV simple
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Échappement HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Masquage des résultats
function hideResults() {
    document.getElementById('resultsZone').classList.add('d-none');
}

// Affichage d'une erreur
function showError(message) {
    const errorZone = document.getElementById('errorZone');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorZone.classList.remove('d-none');
}

// Masquage de l'erreur
function hideError() {
    document.getElementById('errorZone').classList.add('d-none');
}

// Téléchargement des données traitées
function downloadProcessedData() {
    if (!processedData) {
        showError('Aucune donnée traitée disponible pour le téléchargement.');
        return;
    }

    const blob = new Blob([processedData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `donnees_traitees_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        showError('Le téléchargement n\'est pas supporté par votre navigateur.');
    }
}

// Utilitaires pour les animations
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Gestion des erreurs de promesses non capturées
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesse rejetée:', e.reason);
});

// Fonction pour afficher des notifications toast (optionnel)
function showToast(message, type = 'info') {
    // Implémentation simple d'une notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-info-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Suppression automatique après 5 secondes
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

