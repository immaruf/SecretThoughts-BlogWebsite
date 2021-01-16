## Secret Thought Blog Website Using `MongoDB`, `express`, `Nodejs`, `EJS`
* NodeJS- For rendering the Server side handling of GET and POST requests and connecting to DB
* MongoDB- The User data are saved in a Mongo Database deployed on AWS via MongoDB
* ExpressJS- For passing the data from user to DB and vice versa.
* EJS- For rendering the data from user to DB and vice versa on the webpages.
* NPM Packages- Various other NPM packages like Body-Parser etc
* Communication between browser and server is established.

[Live Site- Click Here!](https://secretthoughts.herokuapp.com/)

### RUN
#### Running locally
```
$ git clone https://github.com/immaruf/SecretThoughts-BlogWebsite.git
$ cd SecretThoughts-BlogWebsite
$ npm install
$ mongod  
    # if you don't have mongodb installed, use $ apt-get install mongodb
$ node app.js
```
now you can use this app via [http://localhost:3000/](http://localhost:3000/)