// Watchdog variables
var timeoutRefresh;
var timeoutActive;
var timeoutD=new Date;

// Create Socket.IO connection
var socket = io.connect('localhost:3000');

// On connection to the server
socket.on('connect', function(){
	
	// Announce new client
	socket.emit('hi', {});
	
	// Set listener for SIGFOX send button
	$("#sme-SIGFOX-send").click(function() {
		socket.emit("command", {"SigfoxSend": $("#sme-SIGFOX-message").val().toString() });
	});
	
	// Set listener for port change
	$("#sme-port").change(function(){
		socket.emit('port', this.value);
	});
	
	// Set listeners for enable/disable sensor checkboxes
	$(".sme-enable").click(function () {
		// Send enable/disable sensor command
		if(this.checked) {
			socket.emit('command', 'enable' + $(this).data('field'));			
		} else {
			socket.emit('command', 'disable' + $(this).data('field'));
		};
		
		// Disable checkbox until receiving command acknowledgement
		this.disabled = true;
	});
	
});

// Connection/disconnection (watchdog) indicator
socket.on('ack', function() {
	$("#conn-indicator").show();
	$("#disconn-indicator").hide();
});

// Everytime a packet is received
socket.on('refresh', function (data) {

	// Indicador d'activitat
	window.clearTimeout(timeoutActive);
	$("#act-indicator").show();
	timeoutActive = window.setTimeout(function() {
		$("#act-indicator").hide();
	},100);
	
	// Socket connection watchdog
	window.clearTimeout(timeoutRefresh);
	timeoutRefresh = window.setTimeout(function () {
		$("#conn-indicator").hide();
		$("#disconn-indicator").show();
		socket.emit('hi', {}); // Are U there server??
	},5000);
	
	// Command received indicator
	if (data==null) {
		// If data is corrupted, it means there has been a colission
		// in the serial port.
		$("#ok-indicator").text("COMMAND FAILED. PLEASE RETRY");
		$("#ok-indicator").show();
		data={Error: true};
	} else {
		if (data.hasOwnProperty("CommandOK")) {
			$("#ok-indicator").text("CommandOK: " + data["CommandOK"]);
			$("#ok-indicator").show();
		} else {
			$("#ok-indicator").hide();
		}
	}
	
	// Set textboxes with current sensor value
	// If sensor is disabled, put "--"
	for (var key in tags) {
		if (data.hasOwnProperty(key)) {
			$("#sme-" + key).val(JSON.stringify(data[key]));
		} else {
			$("#sme-" + key).val("--");			
		}
	}
	
	// Count milliseconds between each packet
	var nDate = new Date;
	var dateDiff = nDate-timeoutD;
	timeoutD = nDate;
	$("#ms-indicator").text( dateDiff );
	
	// Enable all checkboxes
	// Set their value accordingly to the activated sensors
	$(".sme-enable").each(function() {	
		this.disabled = false;
		if (data.hasOwnProperty($(this).data('field'))) {
			this.checked=true;
		} else {
			this.checked=false;
		}	
	});
	
	// TODO Show or hide graphs accordingly to activated sensors
	$(".sme-grafic").each(function() {	
		if ( $(this).attr('id') == "flot-Temperature" ) {
			
		} else {
			
		}
	});
	
	// Update charts
	updateCharts(data);
	
});

// Initial styles for indicators
$(function() {
	$("#conn-indicator").hide();
	$("#disconn-indicator").show();
	$("#act-indicator").hide();
	$("#ok-indicator").hide();
});

