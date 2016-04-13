module.exports = function (io, mysql, conndb) {
  'use strict';
  
  var cyclesChart=0;
  var cyclesReport=0;
  var gluematic={};
  var pendentWrite = null;
  
  /**
   * Comunicacio automata S7
   * */

  var s7 = require('../plc/siemens_s7.js');
  
	io.on('connection', function (socket) {

		var interval;
		
		socket.on('hi', function(){
			socket.emit("ack");
		});
		
		s7.plcRead("DB3Constants", function(data, err) {
			gluematic.DB3Constants = data;
			socket.emit(gluematic);
		});
		
		interval = setInterval( tickRefresh , 1000);
		
		// Aquesta rutina s'executa cada segon.
		function tickRefresh() {
			//console.log(gluematic);
			
			// Llegir DB2 automata 
			s7.plcRead("DB2Variables", function(v, err) {
				if (!err) {
					gluematic.DB2Variables = v;
					io.sockets.emit('refresh',gluematic);
					
					if (pendentWrite != null) {
						
						s7.plcWrite(pendentWrite, function (w, err) {
							if (!err) {
								socket.emit('plcWrite', w);
								console.log("plcWrite Res: ");
								console.log(w);
								pendentWrite=null;
							} else {
								console.log("PLC Write error");
							}
						});
					}
					
				} else {
					gluematic.DB2Variables = null;
					console.log('PLC Read error.');
					io.sockets.emit('refresh',gluematic);
				}
		    });
			
			if (cyclesChart >= 14) {
				cyclesChart = 0;
				// TODO Gravar dades de l'automata a la SQL
			} else {
				cyclesChart++;
			}
			
			if (cyclesReport >= 59) {
				cyclesReport = 0;
				// TODO Gravar dades de l'automata a la SQL
			} else {
				cyclesReport++;
			}	
		}
		
		// History: enviar llista de dies amb preparacions fetes
		socket.on("history-highlight", function() {
			var q = "SELECT DISTINCT(LEFT(NumPrep,6)), LEFT(NumPrep,6) FROM grafiques";
			
			// Passar de 100424 -> 24/04/2010
			function formatDate(d) {
				var s = "" + d[4] + d[5] + "/" + d[2] + d[3] + "/";
				if (d[0] == '9') s+="19"; else s+="20"; // 199x - 2000
				s+= ""+d[0]+d[1];
				return s;
			}
			
	  	  	conndb.query(q, function(err, rows, fields) {
	  	      if (err) throw err;
	  	      var list = new Array(rows.length);
	  	      for (var i=0; i<rows.length; i++) {
	  	    	  list[i]=(formatDate(rows[i]['(LEFT(NumPrep,6))']));
	  	      }
	  	      socket.emit('history-highlight', list);
	  	    });
		});
		
		// History: mostrar llista de preparacions al clicar en un dia.
		socket.on("history-list", function(date) {
			//var q = 'SELECT * FROM grafiques WHERE LEFT(NumPrep,6) = \'' + date + '\' GROUP BY NumPrep;';
			var q = 'SELECT *, (SELECT f.Descripcio FROM formules as f WHERE f.idFormula=i.Dosificat) as Formula FROM informes as i WHERE EstatSistema=34'+
			        ' AND LEFT(NumPrep,6)=\'' + date + '\';';
			
			console.log(q);
			
			conndb.query(q, function(err, rows, fields) {
	  	      if (err) throw err;
	  	      var list = new Array(rows.length);
	  	      for (var i=0; i<rows.length; i++) {
	  	    	  list[i]={
	  	    			  href: rows[i].NumPrep,
	  	    	  		  text: "" + rows[i].NumPrep[6] + rows[i].NumPrep[7] + " - " + rows[i].Formula,
	  	    	  		  time: rows[i].Temps.getHours() + ":" +
	  	    	  		  		rows[i].Temps.getMinutes() + ":" +
	  	    	  		        rows[i].Temps.getSeconds()
	  	    	  };
	  	    	  //console.log(rows[i]);
	  	      }
	  	      socket.emit('history-list', list);
	  	    });
			
		});
		
		// Enviar el grafic d'una preparacio
		socket.on("chart-load", function(numprep){
			var q = 'SELECT Temperatura,Viscositat,Temps FROM grafiques WHERE NumPrep=\'' + numprep + '\' ORDER BY Temps;';
			
			conndb.query(q, function(err, rows, fields) {
	  	      if (err) {
	  	    	  //funciologger(err);
	  	      } else {
	  	    	socket.emit('chart-load', rows);
	  	      }
	  	    });
			
		});
		
		// Enviar el report d'una preparacio
		socket.on("report-load", function(numprep){
			var q = 'SELECT * FROM informes WHERE NumPrep=\'' + numprep + '\' ORDER BY Temps;';
			
			conndb.query(q, function(err, rows, fields) {
	  	      if (err) {
	  	    	  //funciologger(err);
	  	      } else {
	  	    	socket.emit('report-load', rows);
	  	      }
	  	    });
			
		});
		
		socket.on("plcWrite", function (v) {
			console.log("plcWrite Req: ");
			console.log(v);
			pendentWrite = v;
		});
	    	    	    	    	    
  }); //tanca io.on
  
};  //tanca module exports