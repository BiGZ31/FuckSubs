@echo off
echo ========================================
echo  REINITIALISATION DU SITE
echo ========================================
echo.
echo Ce script va :
echo - Ouvrir la page de deconnexion
echo - Effacer votre session
echo - Relancer le site
echo.
pause

echo.
echo Ouverture de la page de deconnexion...
start logout.html

echo.
echo Attente de 4 secondes...
timeout /t 4 /nobreak > nul

echo.
echo Ouverture du site...
start login.html

echo.
echo Termine !
pause
