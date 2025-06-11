# DASH1

Ce dépôt contient un exemple de tableau de bord de voyage minimal en HTML et JavaScript.

Les fichiers sont désormais séparés :
* `style.css` pour les styles
* `script.js` pour la logique
* `events.json` pour les données d'événements

La fonction de gestion de dossier local utilise l'API File System Access. Si elle n'est pas disponible, un message s'affiche et l'import de fichiers est désactivé.

Un service worker (`sw.js`) met en cache les ressources principales afin de permettre un affichage basique hors ligne.

Pour exécuter les tests unitaires :

```bash
npm test
```

Ouvrez `index.html` dans votre navigateur pour visualiser la page.
