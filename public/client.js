(function() {
    var socket = io.connect("https://arduino.hakon.io" + ':' + 443);

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('SI7021', function(data) {
        document.getElementById("temperature").innerText = data.celsius;
        document.getElementById("humidity").innerText = data.humidity;
    });
}());
