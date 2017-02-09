/**
* hereMapa Module
*
* Description
* es el nùcleo del modulo
*/

angular.module('hereMapa', ['ngGeolocation'])
.component('mapaItinerario',{
	templateUrl:'map/itinerario/mapaItinerario.html',
	controller : function($scope,mapaProvider,positioning,$http,$timeout,$log,$geolocation,routingMaps){
		$scope.sugerencias=[];
		$scope.results = [];
		$scope.cargando = false;
		// Autocompletado Busqueda 
		var timer = null;
		mapaProvider.cargarMapa();
		
		//sacar geolocalizacion*******************************
		/*
		//inicializo la geolocalizacion
		$geolocation.watchPosition({
		           enableHighAccuracy: true
		       });
		//inicializamos el mapa en las coordenadas iniciales
		setTimeout(function () {
			//$log.log("inicializando geolocalizacion");
			if(typeof($geolocation.position.coords) != "undefined" ){
				var coor = 
				{lat:$geolocation.position.coords.latitude,
				lng:$geolocation.position.coords.longitude}
				//$log.log(coor);
				$scope.coordsUser=positioning.coords = mapaProvider.coordUser = coor;
				positioning.moveMap();
			}else{
				positioning.moveMapToMexico();
			}
		},3000);

		
		//refrescamos las coordenadas cada x tiempo
		setInterval(function () {
			//$log.log("Refrescando coordenadas");
			var coor = 
			{lat:$geolocation.position.coords.latitude,
			lng:$geolocation.position.coords.longitude}
			$scope.coordsUser=positioning.coords = mapaProvider.coordUser = coor;
			$geolocation.clearWatch();
		},3500);
		
		setInterval(function () {
			positioning.refreshMapMarker(mapaProvider.map);
		},3500);

		*/
		//sacargeolocalizacion*********************************************
		
		function configurarMapa(coords) {
			mapaProvider.map.setCenter(coords);
			mapaProvider.map.setZoom(8);
		}
		function configurarJsonRuta(coordsO,coordsD) {
			return {
				rutaRequestParams :{
					language:'es-es',
					departure:'now',
					mode: null,
					representation: 'display',
					routeattributes : 'waypoints,summary,shape,legs',
					maneuverattributes: 'direction,action',
					waypoint0: coordsO.lat+","+coordsO.lng, 
					waypoint1: coordsD.lat+","+coordsD.lng 
				},
				mode_scope:2,//modo donde se va a hacer la ruta 1 single route 2 varias rutas,
				distancia: null,
				id:coordsO.lat*45
			};
		}
		function getCoordenadas(element) {
			return ($scope.isId)?
			{
				lat:element.lugar.location.displayPosition.latitude,
				lng:element.lugar.location.displayPosition.longitude
			}
			:
			{
				lat:element.lugar.Location.DisplayPosition.latitude,
				lng:element.lugar.Location.DisplayPosition.longitude
			};
		}
		function configurarMarcador(iconUrl,coordsO,objJson) {
			$log.info("configurando marcador");
			//var icon = new H.map.Icon(iconUrl);
			var marcador = new H.map.Marker(coordsO/*,
			{ icon: icon }*/);

			var html = 
			"<div id='contenedorBubble"+objJson.id+"'>"+
			"<h5><small></small></h5>"+
			"<small>direccion</small>"+
			"<input checked name='transporte' value='fastest;publicTransport' type='radio' id='radio1'>Trasporte publico<br>"+
			"<input name='transporte' value='fastest;car' type='radio' id='radio2'>Coche<br>"+
			"<input name='transporte' value='shortest;pedestrian' type='radio' id='radio3'>A pie<br>"+
			"<button type='button' onClick='marcarRuta("+JSON.stringify(objJson)+")'>IR</button>"+
			"</div>";
			marcador.setData(html);
			marcador.ruta=0;

			$log.info("configurando marcador ANADIENDO EVENTOS");
			marcador.addEventListener('tap', function (evt) {
			  var bubble =  new H.ui.InfoBubble(evt.target.getPosition(), {
			    content: evt.target.getData()
			  });
			  var control = new H.ui.Control();
			  mapaProvider.ui.addBubble(bubble);
			}, false);

			$log.info("configurando marcador ANADIENDO OBJETO");

			mapaProvider.map.addObject(marcador);
			var zIndex=1;
			mapaProvider.map.addEventListener('tap', function (evt) {
				if (evt.target instanceof mapsjs.map.Marker) {
					evt.target.setZIndex(zIndex++);
				}
			}); 
			$log.info("configurando marcador TERMINADO");
		}
		//mover la camara del mapa a la posicion indicada 
		$scope.irLugar = function (element) {
			var coords = getCoordenadas(element);
			configurarMapa(coords);
			var objJson = configurarJsonRuta({lat:19.432608,lng:-99.133208},coords);
			configurarMarcador("map/manzana.png",coords,objJson);
			routingMaps.marcarRuta(objJson);


		}




		$scope.buscar = function(val){
		  if(timer) $timeout.cancel(timer);
		  timer = $timeout(exc, 800); //800 milisegundos de retardo
		  function exc(){
		    console.log('buscando...');
		    $scope.getSugerencias(val);
		  }
		}
		//Borrar al final 
		mapaProvider.map.setCenter({lat:19.432608,lng:-99.133208});
		mapaProvider.map.setZoom(10);
		mapaProvider.map.addObject(new H.map.Marker({lat:19.432608,lng:-99.133208}));
		var prim=true;
		$scope.getSugerencias = function (searchtext) {
			$scope.cargando=true;
			searchtext=searchtext.split(' ').join('%20');

			$scope.coordsUser = {lat:19.432608,lng:-99.133208};

			var url = "http://autocomplete.geocoder.cit.api.here.com/6.2/suggest.json"+
			"?app_id=EJiiwcESc8a3fX3YDAhK"+
			"&app_code=lbdJ16arthEPwrA7nhmluA"+
			"&at="+$scope.coordsUser.lat+","+$scope.coordsUser.lng+"&"+
			"&query='"+searchtext+"'";


			$log.log(url);
			$http.get(url)
			.then(function (data) {

				$log.log(data);
				if(!prim)
					anadirSugerencia(data.data.suggestions);
				else{
					prim = false;
					for (var i = data.data.suggestions.length - 1; i >= 0; i--)
						$scope.sugerencias.push(data.data.suggestions[i]);
				}

				$scope.cargando=false;
			}).catch(function (error) {
				console.log(error);
				$scope.cargando = false;
			});
		}
		//buscamos los contenidos de los datos
		$scope.buscarContenidos =function () {
			//buscamos si el texto salio de las sugerencias o fue escrito por el usuario
			$scope.isId=false;//los textos de las sugerencias se buscan con id
			var id;
			for (var i=0;i<$scope.sugerencias.length;i++) 
				if($scope.sugerencias[i].label==$scope.textoBusqueda){
					$scope.isId=true;
					id = $scope.sugerencias[i].locationId;
					break;
				}
			$log.log("es id "+$scope.isId);
			setTimeout(function(){
				if($scope.isId)
					peticionesId(id);
				else
					peticiones($scope.textoBusqueda);
			}, 100*6);
		}

		$scope.ma = ",";
		//busca el contenido de un input text 
		var peticiones = function (searchtext) {
			var url = "https://geocoder.cit.api.here.com/6.2/geocode.json?searchtext='"+searchtext+"'&Country=MEX&mapview=42.3902%2C-71.1293%3B42.3312%2C-71.0228&gen=100&app_id=EJiiwcESc8a3fX3YDAhK&app_code=lbdJ16arthEPwrA7nhmluA";
			$http.get(url)
			.then(function (data) {
				//array de lugares que coinciden 
				$log.info("peticiones ");
				$log.info(data);
				var response = data.data.Response.View;

				$scope.lugares = (response.length==0)?response.Result:response[0].Result;

				$log.log($scope.lugares);
			},function (error) {
				$log.error("Error peticion");
				$log.error(error);
			});
		}
		//busca el contenido del input text siempre y cuando se aya seleccionado de una sugerencia
		var peticionesId = function (idSearch) {
			$log.log(idSearch);

			var url = "http://geocoder.cit.api.here.com/6.2/geocode.json"+
					"?locationid="+idSearch+
					"&jsonattributes=1"+
					"&gen=9"+
					"&app_id=EJiiwcESc8a3fX3YDAhK"+
					"&app_code=lbdJ16arthEPwrA7nhmluA";
			$log.log(url);
			$http.get(url)
			.then(function (data) {
				//array de lugares que coinciden 
				$log.info("peticiones sug");
				$log.info(data);
				var response = data.data.response.view[0].result;
				$scope.lugares = response;

				$log.log($scope.lugares);
			},function (error) {
				$log.error("Error peticion");
				$log.error(error);
			});
		}
		//buscamos que no esten repetidos
		var anadirSugerencia = function (array){
			var val;
			for (var x = array.length - 1; x >= 0; x--) {
				val=array[x];
				for (var i = $scope.sugerencias.length - 1; i >= 0; i--) {
					if(val.locationId == $scope.sugerencias[i].locationId)//siencontro uno igual no lo agrego
						break;
					if(i==0)
						$scope.sugerencias.push(val);
					
				}
			}
		}

		$scope.anadirItinerario = function (elemento) {
			sessionStorage.setItem("Agenda",elemento.value);
		}


	}
})
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});

