/**
* hereMapa Module
*
* Description
* es el nùcleo del modulo
*/

angular.module('hereMapa', ['ngGeolocation'])
.component('mapaItinerario',{
	templateUrl:'map/mapaItinerario.html',
	controller : function($scope,mapaProvider,positioning,$http,$timeout,$log,$geolocation){
		$scope.sugerencias=[];
		$scope.results = [];
		$scope.cargando = false;
		// Autocompletado Busqueda 
		var timer = null;
		mapaProvider.cargarMapa();
		positioning.map.setCenter({lat:19.432608,lng:-99.133208});
		positioning.map.setZoom(10);
		
		//sacar geolocalizacion*******************************
		//inicializo la geolocalizacion
		
		$geolocation.watchPosition({
		           enableHighAccuracy: true
		       });
		//inicializamos el mapa en las coordenadas iniciales
		setTimeout(function () {
			//$log.log("inicializando geolocalizacion");
			if(typeof($geolocation.position) === "undefined" ){
				var coor = 
				{lat:$geolocation.position.coords.latitude,
				lng:$geolocation.position.coords.longitude}
				//$log.log(coor);
				$scope.coordsUser=positioning.coords = mapaProvider.coordUser = coor;
				positioning.moveMap();
			}else{
				positioning.moveMapToMexico();
			}
		},1500);

		
		//refrescamos las coordenadas cada x tiempo
		setInterval(function () {
			//$log.log("Refrescando coordenadas");
			var coor = 
			{lat:$geolocation.position.coords.latitude,
			lng:$geolocation.position.coords.longitude}
			$scope.coordsUser=positioning.coords = mapaProvider.coordUser = coor;
			$geolocation.clearWatch();
		},1500);
		
		setInterval(function () {
			positioning.refreshMapMarker(mapaProvider.map);
		},2500);

		
		//sacargeolocalizacion*********************************************
		

		$scope.anadir = function () {//agregar varios filtros 

			setTimeout(function () {
				// body...
				console.log($scope.cat);
				mapaProvider.lugares($scope.cat);
			},1000);

		}
		$scope.buscar = function(val){
		  if(timer) $timeout.cancel(timer);
		  timer = $timeout(exc, 800); //800 milisegundos de retardo
		  function exc(){
		    console.log('buscando...');
		    $scope.getSugerencias(val);
		  }
		}
		$scope.getSugerencias = function (searchtext) {
			$scope.cargando=true;
			searchtext=searchtext.split(' ').join('%20');
			var url = "http://autocomplete.geocoder.cit.api.here.com/6.2/suggest.json"+
			"?app_id=EJiiwcESc8a3fX3YDAhK"+
			"&app_code=lbdJ16arthEPwrA7nhmluA"+
			"&at="+$scope.coordsUser.lat+","+$scope.coordsUser.lng+"&"+
			"&query='"+searchtext+"'";


			$log.log(url);
			$http.get(url)
			.then(function (data) {
				$log.log(data);

				for (var i = data.data.suggestions.length - 1; i >= 0; i--) 
					$scope.sugerencias.push(data.data.suggestions[i]);
				

				$scope.cargando=false;
			}).catch(function (error) {
				console.log(error);
			});
		}
		$scope.peticionEvt =function () {//sacar los datos despues de 2 segundos
			//buscamos si el texto salio de las sugerencias o fue escrito por el usuario
			var elemento = mapaProvider.map.clearContent();
			console.log(elemento);
			$scope.isId=false;
			var id;
			for (var i=0;i<$scope.sugerencias.length;i++) 
				if($scope.sugerencias[i].label==$scope.textoBusqueda){
					$scope.isId=true;
					id = $scope.sugerencias[i].locationId;
					break;
				}
			setTimeout(function(){
				if($scope.isId)
					peticionesSug(id);
				else
					peticiones($scope.textoBusqueda);
			}, 100*6);
		}

		$scope.anadirAgenda = function (elemento) {
			sessionStorage.setItem("Agenda",elemento.value);
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
			},function (error) {
				$log.error("Error peticion");
				$log.error(error);
			});
		}
		//busca el contenido del input text siempre y cuando se aya seleccionado de una sugerencia
		var peticionesSug = function (idSearch) {
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
			},function (error) {
				$log.error("Error peticion");
				$log.error(error);
			});
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

