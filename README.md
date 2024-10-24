Schnell zusammengehackt

Benutzt wird Typescript mit Express und EJS

Codequalität und Ausrede:
- Spagetti und viel Hardcoded (was halt so in 2 Stunden machbar ist)
- Alle sind herzlich eingeladen mitzuwirken und daraus ein tolles Projekt zu machen

Todo:
- Interfaces, etc. stammen aus einem codegenerator, der nicht öffentlich ist. Diese Dateien sollten umgebaut werden.
- Spagetti aufdröseln
- Templates verschönern
- Hardcodes auflösen und konfigurierbar machen
- Dockern
- Admin-Webinterface


Benötigt wird:
- IMAP Postfach
- SMTP Zugang
- MySQL / MariaDB Datenbank
- Zertifikate


Konfigurationsdatei:
Kopiere die config.example.ini zu config.production.ini und nehme Anpassungen vor

SSL:
Benutze fertige Zertifikate oder generiere neue.
>>> openssl req -x509 -newkey rsa:2048 -keyout certs/devkey.pem -out certs/devcert.pem -days 3650
Trage Pfade und Passwort in der Ini ein.


Postfach:
Es müssen die Ordner existieren:
- INBOX.processed
- INBOX.error
- INBOX.invalid 

Es wird jede halbe Stunde nachgeschaut, ob es neue Mails gibt.
Mails die nicht aussehen wie Vouchermails werden nach INBOX.invalid geschoben
Wenn ein Voucher nicht eingetragen werden kann, landet er in INBOX.error


Datenbank:
Das Schema befindet sich in freshDatabase.sql



WARNUNG
Es ist noch sehr viel Hard-Coded, wie z.B. URLs, Timings, etc.


Ablauf:
Der Dienst sucht bei jedem "Tick" (1 Minute) ein Voucher der frei ist. Wenn einer frei ist, wird ein Kanidat gesucht der den Voucher erhalten soll. Dabei wird drauf geachtet, dass jemand der schon viele Timeouts gesammelt wird, weiter hinten in der Liste landet. Für die Verteilung gibt es einen Wert (distributionround), der angibt in wecher Verteilrunde der Kanidat sitzt. So kann z.B. gesteuert werden, dass Personen, die beim Aufbau einer Assembly eine wichtige Rolle spielen zuerst an der Reihe sind, oder auch Regionsfremde zuletzt an der Reihe sind. Bei der Verteilung wird gefragt, ob der Voucher wirklich noch benötigt wird; falls nein, wird der Voucher wieder als frei markiert. Wenn innerhalb von 6 Stunden der Voucher nicht abgerufen wird, wird der Code wieder als frei markiert.
Jede halbe Stunde wird das Postfach nach neuen Vouchercodes durchsucht; wird einer gefunden, wird er in die Datenbank als frei eingetragen.