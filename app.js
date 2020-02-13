'use strict';

const Raspi = require('raspi-io').RaspiIO;
const five = require("johnny-five");

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const board = new five.Board();

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html')
});

board.on("ready", function() {
  const multiSI7021 = new five.Multi({
    controller: "SI7021",
    freq: 1000
  });
  const multiMPL3115A2 = new five.Multi({
    controller: "MPL3115A2",
    elevation: 38,
    freq: 1000
  });
  const fiveALSPT19 = new five.Light({
	controller: "ALSPT19",
	pin: "A1",
	freq: 1000
  });

  console.log('Temperature app is ready.');
  // Listen to the web socket connection
  io.on('connection', function(client) {
    client.on('join', function(handshake) {
      console.log(handshake);
    });

      fiveALSPT19.on("data", () => {
	  	var data = {level: fiveALSPT19.level}
	    client.emit('ALSPT19', data);
	  });

	  multiSI7021.on("data", () => {
	  	var data = {
			celsius: multiSI7021.thermometer.celsius,
			fahrenheit: multiSI7021.thermometer.fahrenheit, 
	  		kelvin: multiSI7021.thermometer.kelvin,
	  		humidity: multiSI7021.hygrometer.relativeHumidity
	  	}
	    client.emit('SI7021', data);
	  });

	  multiMPL3115A2.on("data", () => {
	  	var data = {
	  		celsius: multiMPL3115A2.thermometer.celsius, 
	  		fahrenheit: multiMPL3115A2.thermometer.fahrenheit, 
	  		kelvin: multiMPL3115A2.thermometer.kelvin,
	  		pressure: multiMPL3115A2.barometer.pressure,
	  		feet: multiMPL3115A2.altimeter.feet,
	  		meters: multiMPL3115A2.altimeter.meters
	  	}
	    client.emit('MPL3115A2', data);
	  });
  });

});


const port = process.env.PORT || 80;

server.listen(port, "0.0.0.0");
console.log(`Server listening on http://0.0.0.0:${port}`);