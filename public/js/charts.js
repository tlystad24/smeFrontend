/**
 * Charts
 */

// List of all possible tags, with the size of the data
// This variable is used also in sockets.js
var tags = {Gyroscope: 3,
			Accelerometer: 3,
			Magnetic: 3,
			Humidity: 1,
			TemperatureHumidity: 1,
			Pressure: 1,
			TemperaturePressure: 1,
			Light: 1,
			Proximity: 1,
			GPS: "GPS"};

// Definition of the graphs to use. Each series refers to a tag and a index
// Graphs and tags can be non-coincident
var graphs = {
		Gyroscope:      {series: [["Gyroscope", 0],
					              ["Gyroscope", 1],
					              ["Gyroscope", 2]],
					     min:     -32000,
					     max:     32000},
					     
		Accelerometer:  {series: [["Accelerometer", 0],
					              ["Accelerometer", 1],
					              ["Accelerometer", 2]],
					     min:     -2000,
						 max:     2000},
						 
		Magnetic:       {series: [["Magnetic", 0],
		                          ["Magnetic", 1],
		                          ["Magnetic", 2]],
                         min:     -255,
 						 max:     255},
 						 
		Humidity:       {series: [["Humidity", 0]],
						 min:     0,
						 max:     100},
		
		Pressure:       {series: [["Pressure", 0]],
						 min:     800,
						 max:     1200},
						 
		Temperature:    {series: [["TemperatureHumidity", 0],
		                          ["TemperaturePressure", 0]],
                         min:     0,
 						 max:     100},
						 
		Light:          {series: [["Light", 0]],
						 min:     0,
						 max:     8},
		
		Proximity:      {series: [["Proximity",0]],
						 min:     0,
						 max:     255}
}

// Storage of sensor values
var chartData = {};
var prepareSeries;

$(function() {
	// Initialize chartData structure
	chartData.totalPoints = 300;
	
	for (var t in tags) {
		
		// TODO Ignoring whats happening on the GPS for now
		if (tags[t]!= "GPS") { 
			chartData[t] = Array(tags[t]);
			for (var i=0; i<tags[t]; i++) {
				chartData[t][i] = Array(chartData.totalPoints);
				
				// Initialize Arrays to zero ( [x,y] values )
				for (var k=0; k<chartData.totalPoints; k++) {
					chartData[t][i][k]=[k,0];
				}
			}
		}
	}
	
	console.log(chartData);
	
});

function updateCharts(data) {
	
	// Shift all chartData to the left, push the new one to the right
	for (var t in tags) {
		// TODO Ignoring whats happening on the GPS for now
		// Only shift the data if the sensor is active
		if (tags[t]!= "GPS" && data.hasOwnProperty(t)) {
			// For each sensor channel
			for (var i=0; i<tags[t]; i++) {
				// Shift data
				for (var k=0; k<chartData.totalPoints-1; k++) {
					chartData[t][i][k] = [k, (chartData[t][i][k+1]||[0,0])[1] ];
				}
				
				// Workaround: If the sensor is a single number, pack it into an array
				// so we can use the general method
				if (typeof(data[t]) == "number") {
					data[t] = [data[t]];
				}
				
				// Push data
				// Only for light sensor, we take LOGARITHMIC VALUES
				if (t=="Light") {
					chartData[t][i][chartData.totalPoints-1] = 
						[chartData.totalPoints-1, Math.log10(data[t][i])];
				} else {
					chartData[t][i][chartData.totalPoints-1] = 
						[chartData.totalPoints-1, data[t][i]];
				}
			}
		}
	}
	
	// Draw the actual graphs
	for (var g in graphs) {
		// Pack series as described for each graph
		prepareSeries = Array(graphs[g].series.length);
		for (k=0; k<graphs[g].series.length; k++) {
			prepareSeries[k] = chartData[graphs[g].series[k][0]][graphs[g].series[k][1]];
		}

		// Call flot
		$.plot("#flot-" + g, prepareSeries, {
			series: {
				shadowSize: 0	// Drawing is faster without shadows
			},
			yaxis: {
				min: graphs[g].min,
				max: graphs[g].max
			},
			xaxis: {
				show: false
			}
		});
	}
}