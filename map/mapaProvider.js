/**
*  Module
*
* Description:
* Crea mapas en la vista y prove de metodos con los cuales se puedes configurar mapas y añadir 
* caracteristicas
*/
var map;
var ui;
angular.module('hereMapa')
.factory('mapaProvider',function ($http,$log,$timeout,positioning,$geolocation) {
  
  var mapaProvider={};
  mapaProvider.coords = {};
  mapaProvider.coordUser = {};
  mapaProvider.catConsultadas = [];
  mapaProvider.hayObj = false;
  mapaProvider.ui=null;
  mapaProvider.platform = new H.service.Platform({
    'app_id': 'EJiiwcESc8a3fX3YDAhK',
    'app_code': 'lbdJ16arthEPwrA7nhmluA',
    useCIT: true,
    useHTTPS: true
  });
  mapaProvider.map;
  //la funcion carga el mapa (FALTA IMPLEMENTAR DESDE LAS COORDENADAS DE LA PERSONA)
  mapaProvider.cargarMapa = function () {
    var defaultLayers = mapaProvider.platform.createDefaultLayers();
    mapaProvider.map = new H.Map(document.getElementById('mapContainer'),
      defaultLayers.normal.map,{
      zoom: 14
    });
    positioning.map = mapaProvider.map;
    map = mapaProvider.map;
    //Añadimos eventos al mapa 
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapaProvider.map));




    /***MODULOS DE ARRASTRE DEL MAPA ***/
    mapaProvider.map.addEventListener('dragend', function(evt) {//cuando termina el arrastre del mapa
      //fijamos un retardo entre el arrastre y las consultas
      var timer = null;
      if(timer) $timeout.cancel(timer);
      timer = $timeout(exc, 800); //800 milisegundos de retardo

      function exc(){
        var coord = mapaProvider.map.getCenter();

        $log.info(mapaProvider.catConsultadas);

        if(mapaProvider.catConsultadas.length!=0)
          for (var i = mapaProvider.catConsultadas.length - 1; i >= 0; i--)  
            lugaresEvent(mapaProvider.catConsultadas[i],coord);
      }



    });
    
    //Creamos los botones por defauld
    mapaProvider.ui = H.ui.UI.createDefault(mapaProvider.map, defaultLayers);
    ui=mapaProvider.ui;

  }


  //crea un nuevo mapa explorar los lugares por categoria
  var lugaresEvent = function (cat,coord) {
    $log.info("Consultando..");
    mapaProvider.anadirMarcadoresAlMapa(mapaProvider.map,cat,coord);
  }


  //crea un nuevo mapa explorar los lugares por categoria
  mapaProvider.lugares = function (cat,coord) {
    //consultamos si ya consultaron esa categoria
    if(!yaConsultado(cat)){
      mapaProvider.hayObj = true;
      $log.info("Consultando..");
      mapaProvider.anadirMarcadoresAlMapa(mapaProvider.map,cat,coord);
      mapaProvider.catConsultadas.push(cat);
    }else{
      $log.info("ya consultado");
    }
  }
  mapaProvider.probando=function () {
    $log.info("jskdhfsjdklfsdjkflh");
  }
  mapaProvider.anadirMarcadoresAlMapa = function(map,categoria,coord){
    var radio=3500;
    //consultamos las categorias de direcciones cercanas
    var url ="https://places.demo.api.here.com/places/v1/discover/explore?"+
    "&cat="+categoria+
    "&in="+coord.lat+","+coord.lng+";r="+radio+
    "&app_id=EJiiwcESc8a3fX3YDAhK"+
    "&app_code=lbdJ16arthEPwrA7nhmluA";

    $log.info("URL lugares cercanos \n"+url);

    //creamos un grupo*************************
    

    var group = new H.map.Group();

    mapaProvider.map.addObject(group);

    // add 'tap' event listener, that opens info bubble, to the group
    group.addEventListener('tap', function (evt) {
      // event target is the marker itself, group is a parent event target
      // for all objects that it contains

      $log.info(evt.target);
      var bubble =  new H.ui.InfoBubble(evt.target.getPosition(), {
        content: evt.target.getData()
      });
      bubble.categoria = categoria;



      var control = new H.ui.Control();



      mapaProvider.ui.addBubble(bubble);


    }, false);
    //creamos un grupo*************************

    $http.get(url)
    .then(function(data){
      var items = data.data.results.items;
      $log.info("consultando datos marcadores ...");
      for (var i = items.length - 1; i >= 0; i--) {//agregando caracteristicas a los marcadores
        
        //añades carateristicas al marcador
        var iconUrl =items[i].icon,
        coords = {lat:items[i].position[0],long:items[i].position[1]},
        icon = new H.map.Icon(iconUrl);
        var marcador = new H.map.Marker({ lat:coords.lat, lng:coords.long},
        { icon: icon });

        items[i].distance;
        items[i].vicinity;

        var html = 
        "<div id='contenedorBubble"+items[i].distance+"'>"+
			"<h5>"+items[i].title+"<small>"+items[i].distance+"</small></h5>"+
			"<small>direccion</small>"+
			"<input checked name='transporte' value='fastest;publicTransport' type='radio' id='radio1'>Trasporte publico<br>"+
			"<input name='transporte' value='fastest;car' type='radio' id='radio2'>Coche<br>"+
			"<input name='transporte' value='shortest;pedestrian' type='radio' id='radio3'>A pie<br>"+
			"<button type='button' onClick='marcarRuta("+items[i].position[0]+","+items[i].position[1]+","
          +JSON.stringify(mapaProvider.coordUser)+","+items[i].distance+")'>IR</button>"+
		"</div>";

		/*
          '<div ><h5>'+items[i].title+'</h5></div>'+"<div>Direccion: "+items[i].vicinity+"</div>"
          +"<div><button onclick='marcarRuta("+items[i].position[0]+","+items[i].position[1]+","
          +JSON.stringify(mapaProvider.coordUser)+")'>IR</button></div>";
		*/

        marcador.setData(html);
        marcador.categoria=categoria;
        marcador.ruta=0;
        group.addObject(marcador);

        //funcionalidad para sobreponer marcador 
        var zIndex=1;
        mapaProvider.map.addEventListener('tap', function (evt) {
          if (evt.target instanceof mapsjs.map.Marker) {
            evt.target.setZIndex(zIndex++);
          }
        }); 
        //sobreponer marcador fin
      }
    },function (error) {
      $log.error("Ocurrio algun error anadirMarcadoresAlMapa.js en funcion anadirMarcadoresAlMapa \n "+error);
    });
  }

  mapaProvider.quitarMarcadores = function (categoria) {
    $log.info(mapaProvider.catConsultadas);
    if(mapaProvider.hayObj){//si hay objetos en el mapa los consultas
      mapaProvider.eliminarBurbujas(categoria);
      $log.info("quitando marcadores...");
      var objs = mapaProvider.map.getObjects(),i;

      for (var i = objs.length - 1; i >= 0; i--) 
        if(objs[i].categoria == categoria)
          objs[i].dispose();
      

      mapaProvider.catConsultadas=mapaProvider.catConsultadas.filter(function (elemento) {
        return categoria!=elemento;
      });

      $log.info("Marcadores eliminados");
    }
  }
  //elimina burbujas 
  mapaProvider.eliminarBurbujas = function (categoria) {
    $log.info("Eliminando burbujas .....");
    var burbujas = mapaProvider.ui.getBubbles();
    for (var i = burbujas.length - 1; i >= 0; i--) 
      if(burbujas[i].categoria==categoria)
        burbujas[i].close();
    $log.info("Burbujas eliminadas");
  }
  


  var yaConsultado = function (cat) {
    for (var i = mapaProvider.catConsultadas.length - 1; i >= 0; i--) 
      if (mapaProvider.catConsultadas[i] == cat)
        return true;
    return false;
  }


  return mapaProvider;
});





function getTransport(id) {
	//Obtenemos los contenidos
	var div = document.getElementById('contenedorBubble'+id),
	arrayTrans=div.getElementsByTagName('input'),
	i;
	for (i = arrayTrans.length - 1; i >= 0; i--)
		if(arrayTrans[i].checked)
			break;

	return arrayTrans[i].value;
}
var hayRutas=false;

function eliminarRutas() {
	var array = map.getObjects();
	console.log("eliminando rutas...............");
	for (var i = array.length - 1; i >= 0; i--)
		if(array[i].ruta==1)
			array[i].dispose();
		
	hayRutas=false;
}

var rutaInstructionsContainer=null;
function marcarRuta(lat,long,coordUser,id) {

	if(hayRutas)
		eliminarRutas();

	hayRutas=true;
	var transport = getTransport(id);


	//configurando la plataforma
	rutaInstructionsContainer = document.getElementById('panel');
	var platform = new H.service.Platform({
		'app_id': 'EJiiwcESc8a3fX3YDAhK',
		'app_code': 'lbdJ16arthEPwrA7nhmluA',
		useCIT: true,
		useHTTPS: true
	});
	var rutar = platform.getRoutingService(),
	  rutaRequestParams = {
	  	language:'es-es',
	  	departure:'now',
	    mode: transport,
	    representation: 'display',
	    routeattributes : 'waypoints,summary,shape,legs',
	    maneuverattributes: 'direction,action',
	    waypoint0: coordUser.lat+","+coordUser.lng, // Brandenburg Gate
	    waypoint1: lat+","+long  // Friedrichstraße Railway Station
	  };
	rutar.calculateRoute(
	  rutaRequestParams,
	  onSuccess,
	  onError
	);
}
function onSuccess(result) {
	console.log(result);
	var ruta = result.response.route[0];
	marcarRutaAlMapa(ruta);
	AgregarManiobrasAlMapa(ruta);
	AgregarCurvasAlMapa(ruta.waypoint);
	AgregarInstruccionesAlPanel(ruta);
	AgregarResumenAlPanel(ruta.summary);
	
}

function onError(error) {
  alert('Algo fallo');
}

var bubble;

function openBubble(position, text){
 if(!bubble){
    bubble =  new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

/*
	Anades las rutas y las formas al mapa
*/
function marcarRutaAlMapa(ruta){
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
	polyline.ruta=1;
	map.addObject(polyline);
	map.setViewBounds(polyline.getBounds(), true);
	console.log("anadiendo lineas al mapa FINALIZADO");
}


/*
	Agregas maniobras al mapa
*/
function AgregarManiobrasAlMapa(ruta){
	console.log("Anadiendo maniobras al mapa....");
	var icon = '<svg width="18" height="18" ' +
	'xmlns="http://www.w3.org/2000/svg">' +
	'<circle cx="8" cy="8" r="8" ' +
	'fill="#1b468d" stroke="white" stroke-width="1"  />' +
	'</svg>',
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
			marker.instruction = maneuver.instruction;
			marker.ruta = 1;
			group.addObject(marker);
		}
	}
	//anades eventos a cada maniobra
	group.addEventListener('tap', function (evt) {
		map.setCenter(evt.target.getPosition());
		openBubble(
		evt.target.getPosition(), evt.target.instruction);
	}, false);
	map.addObject(group);
  console.log("Anadiendo maniobras al mapa FINALIZADO");
}

//agregas curvas al mapa
function AgregarCurvasAlMapa(waypoints){
	var nodeH3 = document.createElement('h3'),
	waypointLabels = [],
	i;
	for (i = 0;i<waypoints.length; i++) 
		waypointLabels.push(waypoints[i].label)
	nodeH3.textContent = waypointLabels.join(' - ');
	rutaInstructionsContainer.innerHTML = '';
	rutaInstructionsContainer.appendChild(nodeH3);
}
function AgregarResumenAlPanel(resumen){
	console.log(resumen);
	var summaryDiv = document.createElement('div'),content = '';
	content += '<b>Distancia</b>: ' + resumen.distance  + 'm. <br/>';
	content += '<b>Tiempo de viaje</b>: ' + resumen.travelTime.toMMSS() + ' (en el trafico actual';


	summaryDiv.style.fontSize = 'small';
	summaryDiv.style.marginLeft ='5%';
	summaryDiv.style.marginRight ='5%';
	summaryDiv.innerHTML = content;
	rutaInstructionsContainer.appendChild(summaryDiv);
	
}

function AgregarInstruccionesAlPanel(ruta){
	console.log(ruta);
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

