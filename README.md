**Battle4Tetris**
=============================

Bienvenue sur mon jeu Battle4Tetris. Celui-ci mélange les règles du puissance4, 
du tétris et du duel afin de réaliser un jeu unique et stratégique!

**Pré-requis**
==========================
- PHP supportant Symfony3
- Une base de données
- Un serveur Node.js(pour le multijoueur)

**Installation**
==========================
Il existe deux branches , master et develop. La première est une version 
fonctionnelle, la seconde la version en cours de développement.
Pour installer Battle4Tetris :

- Ouvrir un cmd et pointer l'endroit où vous souhaitez l'installer
- Git clone "https://github.com/Devonia/battle4tetris.git" votre_nom_de_dossier
- cd votre_nom_de_dossier
- Git branch master|develop
- git checkout master|develop
- git pull origin master|develop
- composer install
- php bin/console doctrine:schema:update --force

**Etat du projet**
============================

En construction et non fonctionnelle.

**Reste à faire**
=============================

- Finir le multijoueur coté node.js
- Finir les cartes et leurs effets
- Finir la reprise d'une partie en cours
- BugFixes et meilleurs animations
- Un peu(beaucoup) de design
- Remettre un code propre
