# DASH1

Ce dépôt contient un exemple de tableau de bord de voyage minimal en HTML et JavaScript.

Les fichiers sont désormais séparés :
* `style.css` pour les styles
* `script.js` pour la logique
* `events.json` pour les données d'événements

La fonction de gestion de dossier local utilise l'API File System Access. Si elle n'est pas disponible, un message s'affiche et l'import de fichiers est désactivé.
Un bouton **Créer un dossier** permet de sélectionner un emplacement (par exemple votre bureau) et d'y créer un dossier nommé par vos soins pour y copier tous les fichiers importés.

Un service worker (`sw.js`) met en cache les ressources principales afin de permettre un affichage basique hors ligne.
Un commutateur permet d'activer un **mode sombre** et l'état de connexion est affiché.

La section **Voyage** permet maintenant d'importer des billets (avion, bus ou bateau)
au format PDF avec date et heure de départ. Les fichiers sont copiés dans le
dossier `documents` choisi via la gestion de fichiers.

Pour exécuter les tests unitaires :

```bash
npm test
```

Ouvrez `index.html` dans votre navigateur pour visualiser la page.
