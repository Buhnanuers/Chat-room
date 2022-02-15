@ECHO OFF
cd C:/Users/chris/desktop/test/chat
git add .
start /wait git commit -m "batch changes"
git push heroku master
heroku open
PAUSE
