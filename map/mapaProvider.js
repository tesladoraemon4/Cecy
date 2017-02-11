/**
*  Module
*
* Description:
* Crea mapas en la vista y prove de metodos con los cuales se puedes configurar mapas y añadir 
* caracteristicas
*/


var ui;
var map;
angular.module('hereMapa')
.factory('mapaProvider',function ($http,$log,positioning,$timeout,$geolocation) {
  
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

    /***MODULOS DE ARRASTRE DEL MAPA  (SIRVE PARA refrescar datos)***/
    mapaProvider.map.addEventListener('dragend', function(evt) {//cuando termina el arrastre del mapa
      //fijamos un retardo entre el arrastre y las consultas
      var timer = null;
      if(timer) $timeout.cancel(timer);
      timer = $timeout(exc, 800); //800 milisegundos de retardo

      function exc(){
        var coord = mapaProvider.map.getCenter();

        $log.info("Haciendo consultas a la api ");

        if(mapaProvider.catConsultadas.length!=0)
          for (var i = mapaProvider.catConsultadas.length - 1; i >= 0; i--)  
            actualizaConArrastre(mapaProvider.catConsultadas[i],coord);
      }
    });//fi event listener
    
    //Creamos los botones por defauld
    mapaProvider.ui = H.ui.UI.createDefault(mapaProvider.map, defaultLayers);
    ui=mapaProvider.ui;
  }


  //crea un nuevo mapa explorar los lugares por categoria
  var actualizaConArrastre = function (cat,coord) {
    $log.info("Consultando..");
    mapaProvider.anadirMarcadoresAlMapa(mapaProvider.map,cat,coord);
  }


  //crea un nuevo mapa explorar los lugares por categoria
    //consultamos si ya consultaron esa categoria
  mapaProvider.lugares = function (cat,coord) {
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
  var bubble;
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
    group.addEventListener('tap', function (evt) {
      $log.info(evt.target);
      bubble =  new H.ui.InfoBubble(evt.target.getPosition(), {
        content: evt.target.getData()
      });
      bubble.categoria = categoria;
      bubble.eliminar=false;
      mapaProvider.ui.addBubble(bubble);
    }, false);
    //creamos un grupo*************************

    $http.get(url)
    .then(function(data){
      var items = data.data.results.items;
      var objJson = {
        rutaRequestParams:{
          language:'es-es',
          departure:'now',
          representation: 'display',
          routeattributes : 'waypoints,summary,shape,legs',
          maneuverattributes: 'direction,action'
        },
        mode_scope:1,
        panelRemove:true
      }


      $log.warn(items);
      $log.info("consultando datos marcadores ...");
      for (var i = items.length - 1; i >= 0; i--) {//agregando caracteristicas a los marcadores
        
        //añades carateristicas al marcador
        var iconUrl =items[i].icon,
        coords = {lat:items[i].position[0],long:items[i].position[1]},
        icon = new H.map.Icon(iconUrl);
        var marcador = new H.map.Marker({ lat:coords.lat, lng:coords.long},
        { icon: icon });

        
        objJson.id = Math.random() * (100 - i) + i;
        objJson.rutaRequestParams.waypoint0=mapaProvider.coordUser.lat+","+mapaProvider.coordUser.lng;
        objJson.rutaRequestParams.waypoint1=items[i].position[0]+","+items[i].position[1];
        objJson.distancia=items[i].distance;

        var html = 
        "<div id='contenedorBubble"+items[i].distance+"'>"+
			"<h5>"+items[i].title+"<small>"+items[i].distance+"</small></h5>"+
			"<small>direccion</small>"+
			"<input onClick='cambio(this)' checked name='transporte' value='fastest;publicTransport' type='radio' id='radio1'>Trasporte publico<br>"+
      "<input onClick='cambio(this)' name='transporte' value='fastest;car' type='radio' id='radio2'>Coche<br>"+
      "<input onClick='cambio(this)' name='transporte' value='shortest;pedestrian' type='radio' id='radio3'>A pie<br>"+
      "<button type='button' onClick='marcarRuta("+JSON.stringify(objJson)+")'>IR</button>"+
      "</div>";



        marcador.setData(html);
        marcador.categoria=categoria;
        marcador.ruta=0;
        marcador.eliminar=true;
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
