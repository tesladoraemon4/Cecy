/**
* hereMapa Module
*
* Description
* Obtiene las coordenadas geograficas del usuario que ingreso a la aplicacion y actualiza el marcador del usuario
* Para empezar a usarla debes de fijar el mapa 
*/
angular.module('hereMapa')
.factory('positioning', function ($window,$log,$geolocation) {
	var positioning = {};
	//contiene el html del icono que se 
	//va a usar para representar la posicion actual del usuario
	positioning.markerUser = "";
	positioning.map;//contiene el mapa donde se agregara el icono
	positioning.coords={};//coordenadas del usuario
	var markerObject=null;


	positioning.moveMap = function () {
    	positioning.map.setCenter(positioning.coords);
	}




	
	//refresca la vista del mapa 
	positioning.refreshMapMarker = function (map) {
		//$log.log("refreshMapMarker .....");
		var coor = 
		{lat:$geolocation.position.coords.latitude,
		lng:$geolocation.position.coords.longitude};
		//$log.log("refresca el mapa");
		//$log.log($geolocation);
		if(markerObject==null){
			markerObject = new H.map.Marker(coor);
			markerObject.type=3;
			map.addObject(markerObject);
		}else{//si no actualizamos el marcador
			var aux = markerObject;
			map.removeObject(markerObject);
			markerObject = aux;
			markerObject.setPosition(coor);
			markerObject.type=3;
			map.addObject(markerObject);
		}

		//$log.log("refreshMapMarker end");
	}
	positioning.moveMapToMexico = function() {
    	positioning.map.setCenter({lat:19.432608,lng:-99.133208});
    	positioning.map.setZoom(10);
	}
	function positionError(error) {
	    switch(error.code) {
	        case error.PERMISSION_DENIED:
	        	moveMapToMexico();
	            break;
	        case error.POSITION_UNAVAILABLE:
	        	alert("No pudimos obtener tu localizacion =(");
        		moveMapToMexico();
	            break;
	        case error.TIMEOUT:
	        	alert("TIMEOUT para cargar tu localizacion =(");
        		moveMapToMexico();
	            break;
	        case error.UNKNOWN_ERROR:
	        	alert("Ocurrio un error inesperado=(");
        		moveMapToMexico();
	            break;
	    }
	}
	positioning.setMarkerUser = function (markerUser) {
		positioning.markerUser = markerUser;
	}
	return positioning;

});