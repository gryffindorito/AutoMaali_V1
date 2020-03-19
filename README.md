# AutoMaali_V1
An application of home automation where the end user can water his/her plant and review the live feed from a remote web page.

Dependancies:
1. Flask
2. OpenCV
3. pyHS100
4. Knowledge of Python, HTML, CSS, JavaScript.

Hardware:
1. TP-Link HS100 Wi-Fi Smart Plug.
2. An irigation pump to water your plant.

Setup:
1. Connect the irrigation pump to the Hs100 plug, and connect the plug into the wall outlet.
2. Connect the HS100 Plug to the Wi-Fi network on which your current device is using the Kasa app.
3. Run Plugtest.py.
4. Copy the IP Address of the plug to controls.py.
5. Run bot.py.
6. View the livestream on 0.0.0.0:5050/
7. Run controls.py.
8. View the webpage on 0.0.0.0:6060/

Usage: 
1. View livestream on 0.0.0.0:5050/
2. View controls on 0.0.0.0:6060/
3. Press the Irrigate button to turn on the plug.
4. Press it again to turn it off.

Work in progress:

1. MainCandC.py, which puts both webpages onto a single webpage.
