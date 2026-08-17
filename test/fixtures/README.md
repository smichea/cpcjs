# Fixtures E2E

`hello.zip.b64` est l’encodage Base64 de
`caprice32/test/integrated/dsk/hello.zip`. Cette image DSK contient le programme
BASIC `HELLO.BAS`, qui affiche `Hello, World !`.

La fixture provient du dépôt Caprice32 et est distribuée sous GPL-2.0. Elle est
encodée en texte afin de rester vérifiable dans les revues de code; le test
Playwright la décode en mémoire avant de la charger par le sélecteur de fichier.
