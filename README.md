# IMPORTANT

As JS code is architectured using modules for the sake of clarity, Frontend must be served through a HTTP server :
```
~/FrontEnd > python2 -m SimpleHTTPServer 80
~/FrontEnd > firefox http://localhost 80
```

Backend must be launched before launching FrontEnd :
```
~/BackEnd > yarn start
```
