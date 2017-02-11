
/**
*  Module
*
* Description
*/
var eliminarRutaBtn = "<br><button onClick='eliminarRutas(";
var eliminarRutaBtn2=")' class='btn btn-primary'>EliminarRuta</button>";
angular.module('hereMapa')
.factory('routingMaps', function (mapaProvider) {
	var routing={};
	var ui=mapaProvider.ui;
	var map=mapaProvider.map;
	routing.marcarRuta = marcarRuta;
	return routing;
});
	
	var id=1;
	//marca la ruta de varios puntos 
	var marcarRuta =function(configObj) {
		console.log("marca algo la ruta");
	  	id = configObj.id;	
	  if(configObj.mode_scope==1){//si es de una sola ruta elimina las rutas consultadas antes
	    eliminarRutas();
	    hayRutas=true;
	  }else{
	    if(hayRutas)
	  		eliminarRutas(id);
	  	hayRutas=true;
	  }
	  	var transport = getTransport();
	    configObj.rutaRequestParams.mode=transport;
		//configurando la plataforma
		rutaInstructionsContainer = document.getElementById('panel');
		var platform = new H.service.Platform({
			'app_id': 'EJiiwcESc8a3fX3YDAhK',
			'app_code': 'lbdJ16arthEPwrA7nhmluA',
			useCIT: true,
			useHTTPS: true
		});

		var rutar = platform.getRoutingService();
		console.log("Config de ruta ");
		console.log(configObj.rutaRequestParams);
		console.log(configObj.rutaRequestParams);
		rutar.calculateRoute(
		  configObj.rutaRequestParams,
		  onSuccess,
		  onError
		);
	}
	var onSuccess=function (result) {

		if(result.type !="ApplicationError"){
			cerrarTodasBurbujas();//infoBusbugar
			console.log(result);
			var ruta = result.response.route[0];
			marcarRutaAlMapa(ruta);
			AgregarManiobrasAlMapa(ruta);
			AgregarCurvasAlMapa(ruta.waypoint);
			AgregarInstruccionesAlPanel(ruta);
			AgregarResumenAlPanel(ruta.summary);
		}else {
			console.log("Ocurrio algun error");
			console.log(result);
		}

		
	}
	/*
	RUTASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
	*/
	function eliminarRutas(x) {
		console.log("funcionas");
		if(typeof(x)=="undefined")
			eliminarRutas1();//elimina todas las rutas
		else 
			eliminarRuta(x);//elimina un id de las rutas
		cerrarTodasBurbujas();
	}
	//elimina una ruta con un id en especifico
	var eliminarRuta=function (id) {
		console.log("id ruta es "+id);
		var array = map.getObjects();
		console.log("eliminando ruta...............");
		for (var i = array.length - 1; i >= 0; i--)
			if(array[i].id==id &&array[i].eliminar==true)
				array[i].dispose();
			
		hayRutas=false;
	}

	var eliminarRutas1=function () {
		var array = map.getObjects();
		console.log("eliminando rutas...............");
		for (var i = array.length - 1; i >= 0; i--)
			if(array[i].ruta==1 && array[i].eliminar==true)
				array[i].dispose();
			
		hayRutas=false;
	}

	/*
	RUTASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
	*/
	/*
	BURBUJAAAAAAAASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
	*/
	function cerrarTodasBurbujas() {
		var array = ui.getBubbles();
		for (var i = array.length - 1; i >= 0; i--) 
			array[i].close();
		
	}	
	function noCerrarBurbuja(id){
		var array = ui.getBubbles();
		for (var i = array.length - 1; i >= 0; i--)
			if(id!=array[i].id)
				array[i].close();
	}
	function borrarBubles() {
		var array = ui.getBubbles();
		for (var i = array.length - 1; i >= 0; i--) 
			if(array[i].eliminar)
				array[i].dispose();
	}
	var algunError= function(result){
		if(typeof(result)=='ns2:RoutingServiceErrorType'){
			alert("No pudimos encontrar una ruta"+result.details);
			return true;
		}
		return false;
	}

	var onError=function (error) {
	  alert('Algo fallo');
	}


	var getTransport0=function () {
		return sessionStorage.getItem("transport");
	}


	var getTransport=function () {
		return sessionStorage.getItem("transport");
	}
	var hayRutas=false;




	var rutaInstructionsContainer=null;


	var bubble;

	var openBubble=function (position, text){
	 if(!bubble){//no hay burbuja 
	    bubble =  new H.ui.InfoBubble(
	      position,
	      {
	      	content: text+"<br>"+eliminarRutaBtn+id+eliminarRutaBtn2
	      }
	      );
	    bubble.eliminar=true;
	    ui.addBubble(bubble);
	  } else {//si hay burbuja
	    bubble.setPosition(position);
	    bubble.setContent(text+"<br>"+eliminarRutaBtn+id+eliminarRutaBtn2);
	    bubble.open();
	  }
	}

	/*
		Anades las rutas y las formas al mapa
	*/
	var marcarRutaAlMapa=function (ruta){
		console.log("anadiendo lineas al mapa.....");
		var strip = new H.geo.Strip(),
	  	rutaShape = ruta.shape,
	  	polyline;

		rutaShape.forEach(function(point) {
		  	var parts = point.split(',');
		  	strip.pushLatLngAlt(parts[0], parts[1]);
		});

		polyline = new H.map.Polyline(strip, {
		  	style: {
		    	lineWidth: 4,
		    	strokeColor: 'rgba(0, 128, 255, 0.7)'
		  	}
		});
		//ATRIBUTOS 
		polyline.id=id;
		polyline.ruta =1;
		polyline.eliminar = true;

		map.addObject(polyline);
		map.setViewBounds(polyline.getBounds(), true);
		console.log("anadiendo lineas al mapa FINALIZADO");
	}


	/*
		Agregas maniobras al mapa
	*/
	var AgregarManiobrasAlMapa=function (ruta){
		console.log("Anadiendo maniobras al mapa....");
		var icon = '<svg width="18" height="18" ' +
		'xmlns="http://www.w3.org/2000/svg">' +
		'<circle cx="8" cy="8" r="8" ' +
		'fill="#1b468d" stroke="white" stroke-width="1"  />' +
		'</svg>'
		,
		dotIcon = new H.map.Icon(icon, {anchor: {x:8, y:8}}),
		group = new  H.map.Group(),
		i,
		j;

		//anadiendo marcadores en cada maniobra
		for (i = 0;  i < ruta.leg.length; i += 1) {
			for (j = 0;  j < ruta.leg[i].maneuver.length; j += 1) {
				maneuver = ruta.leg[i].maneuver[j];
				var marker =  new H.map.Marker(
					{lat: maneuver.position.latitude,
					lng: maneuver.position.longitude} ,
					{icon: dotIcon}
				);
				marker.setData(maneuver.instruction);
				//atributos añadidos
				marker.ruta = 1;
				marker.id = id;
				marker.eliminar = true;
				
				group.addObject(marker);
			}
		}
		//anades eventos a cada maniobra
		group.addEventListener('tap', function (evt) {
			map.setCenter(evt.target.getPosition());
			openBubble(evt.target.getPosition(), evt.target.getData());
		}, false);
		map.addObject(group);
	  console.log("Anadiendo maniobras al mapa FINALIZADO");
	}

	//agregas curvas al mapa
	var AgregarCurvasAlMapa=function (waypoints){
		var nodeH3 = document.createElement('h3'),
		waypointLabels = [],
		i;
		for (i = 0;i<waypoints.length; i++) 
			waypointLabels.push(waypoints[i].label)
		nodeH3.textContent = waypointLabels.join(' - ');
		rutaInstructionsContainer.innerHTML = '';
		rutaInstructionsContainer.appendChild(nodeH3);
	}
	var AgregarResumenAlPanel=function (resumen){
		console.log(resumen);
		var summaryDiv = document.createElement('div'),content = '';
		content += '<b>Distancia</b>: ' + resumen.distance  + 'm. <br/>';
		content += '<b>Tiempo de viaje</b>: ' + resumen.travelTime.toMMSS() + ' (en el trafico actual)';


		summaryDiv.style.fontSize = 'small';
		summaryDiv.style.marginLeft ='5%';
		summaryDiv.style.marginRight ='5%';
		summaryDiv.innerHTML = content;
		rutaInstructionsContainer.appendChild(summaryDiv);
		
	}

	var AgregarInstruccionesAlPanel=function (ruta){
		var nodeOL = document.createElement('ol'),i,j;

		nodeOL.style.fontSize = 'small';
		nodeOL.style.marginLeft ='5%';
		nodeOL.style.marginRight ='5%';
		nodeOL.className = 'directions';
		//agregamos las maniobras 
		for (i = 0;  i < ruta.leg.length; i += 1) {
			for (j = 0;  j < ruta.leg[i].maneuver.length; j += 1) {
				maneuver = ruta.leg[i].maneuver[j];

				var li = document.createElement('li'),
				spanArrow = document.createElement('span'),
				spanInstruction = document.createElement('span');

				spanArrow.className = 'arrow '  + maneuver.action;
				spanInstruction.innerHTML = maneuver.instruction;
				li.appendChild(spanArrow);
				li.appendChild(spanInstruction);

				nodeOL.appendChild(li);
			}
		}

		rutaInstructionsContainer.appendChild(nodeOL);
	}


	Number.prototype.toMMSS = function () {
	  return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
	}




	var cambio = function (element) {
		sessionStorage.setItem("transport",element.value);
	}



/*
	function createIrBuble(objJson){
		var div = document.createElement('div');
		div.setAttribute("id","contenedorBubble");
		var radios = [],radio1;
		for (var i= 0;i<3;i++){
			radio1 = document.createElement('input');
			radio1.name="radio";
			radio1.type="radio";
			radio1.id="radio1"+i+1;
			radios.push(radio1);
		} 
		radios[0].value="fastest;publicTransport";
		radios[1].value="fastest;car";
		radios[2].value="shortest;pedestrian";


		//var col;
		for (var i= 0;i<3;i++){
			div.appendChild(radios[i]);
			//col = (i==3)?"Transporte Publico":;
			div.appendChild(document.createElement("br"));
		}

		
		var btn = document.createElement('button');
		btn.type="button";
		btn.onClick=marcarRuta(JSON.stringify(objJson));
		btn.innerHTML = "IR";

		div.appendChild(btn);


		return div;
	}
	*/

/*
	"<div id='contenedorBubble'>"+
	"<h5><small></small></h5>"+
	"<small>direccion</small>"+
	"<input checked name='transporte' value='fastest;publicTransport' type='radio' id='radio1'>Trasporte publico<br>"+
	"<input name='transporte' value='fastest;car' type='radio' id='radio2'>Coche<br>"+
	"<input name='transporte' value='shortest;pedestrian' type='radio' id='radio3'>A pie<br>"+
	"<button type='button' onClick='marcarRuta("+JSON.stringify(objJson)+")'>IR</button>"+
	"</div>"


	*/