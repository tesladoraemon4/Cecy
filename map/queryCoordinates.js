//Obtine las distancias de nodos desde nodo a hasta el nodo b
//saca las distancias minimas entre cada nodo
angular.module("hereMapa").
service('queryCoordinates',function ($http,mapaProvider,$q,$log) {
	var queryCoordinates={};
    //credenciales para peticiones here maps
	queryCoordinates.platform = new H.service.Platform({
	  'app_id': 'EJiiwcESc8a3fX3YDAhK',
	  'app_code': 'lbdJ16arthEPwrA7nhmluA'
	});

	//obtiene la promesa de alguna cordenada 
	function getPromiseCoord(searchstext) {
        var defered = $q.defer();
		var geocoder = queryCoordinates.platform.getGeocodingService(),
		  geocodingParameters = {
		    searchText: searchstext,
		    jsonattributes : 1,
		    xs:1
		  };
		geocoder.geocode(
		  geocodingParameters,
		  function (result) {
		  		defered.resolve(result);
		  	},
		  function (error) {
                defered.reject(error)
		  }
		);

        return defered.promise;
    }



    //esta funcion guarda en un array las coordenadas de la  consulta de lat y long
    //OJO GUARDA EL ARREGLO EN LOCAL STORANGE
    function funcionRecursiva
    (promesa,tamArray,arrayCoord,searchstexts){
		promesa
		.then(function(result){//guardamos los resultados de las coordenadas
			var json = getLatLong(result);
			json.nombre = searchstexts[tamArray];
			arrayCoord.push(json);
			if(tamArray==0){
				//guardamos las coordenadas
				sessionStorage.setItem("coordenadasLugares",JSON.stringify(arrayCoord));

				//sacamos la parejas 
				var parejas = getCombinaciones();
				sacarDistanciaMinParejas(null,parejas,parejas.length-1);

				return;
			}
	    	var promesa1 = getPromiseCoord(searchstexts[tamArray-1]);
	    	funcionRecursiva(promesa1,tamArray-1,arrayCoord,searchstexts);
		})
		.catch(function(error){
			console.log("error funcion recursiva "+error)
		});
    }


    //obtenemos un obj JSON con lat long apartir del resultado
    function getLatLong(result){
		var locations = result.response.view[0].result,position;
		for (i = 0;  i < locations.length; i += 1) {
		  position = {
		    lat: locations[i].location.displayPosition.latitude,
		    long: locations[i].location.displayPosition.longitude,
		    nombre:null
		  };
		  break;
		}
		return position;
    }


    //saca la promesa para obtener distancias
    function getDistancePromise(latA,latB,longA,longB) {
        var defered = $q.defer();
    	var router = queryCoordinates.platform.getRoutingService(),
    	  routeRequestParams = {
    	    mode: 'fastest;car',
    	    representation: 'display',
    	    routeattributes : 'summary',
    	    maneuverattributes: 'direction,action',
    	    waypoint0: latA+","+longA, // Brandenburg Gate
    	    waypoint1: latB+","+longB  // Friedrichstraße Railway Station
    	  };
    	router.calculateRoute(
    	  routeRequestParams,
    	  function (result) {
    	  	defered.resolve(result);
    	  },
    	  function (error) {
    	  	$log.error(error);
    	  	defered.reject(error)
    	  }
    	);
    	return defered.promise;
    }
    //obtenemos un arreglo con las parejas de posibles caminos que se pueden tomar
    // arreglo de la forma nodo1 nodo2 distancia
    function getCombinaciones(){
    	var arrayLugares = JSON.parse(sessionStorage.getItem("coordenadasLugares"));
    	var arrayDistancia=[];
    	for (var x=1;x<arrayLugares.length;x++) //el nodo final del arreglo  es el nodo inicial
    		arrayDistancia[x-1]={
    			nodo1:arrayLugares[arrayLugares.length-1],
    			nodo2:arrayLugares[x-1],
    			distancia:null
    		};
    	return arrayDistancia;
    }
    //obtenemos la distancia minima de un arreglo de parejas para saber el camino minimo a 
    //seguir
    function getMinDistancia(parejas){
    	$log.info(parejas);
    	var objMin={//objeto que tiene el camino minimo
    		distancia:0,
    		nodo1:null,
    		nodo2:null
    	};
    	for (var i=0;i<parejas.length;i++){
    		if(i==0){
    			objMin.distancia = parejas[i].distancia;
    			objMin.nodo1 = parejas[i].nodo1;
    			objMin.nodo2 = parejas[i].nodo2;
    		}
    		else if(parejas[i].distancia<objMin.distancia){
    			objMin.distancia = parejas[i].distancia;
    			objMin.nodo1 = parejas[i].nodo1;
    			objMin.nodo2 = parejas[i].nodo2;
    		}
    	}
    	
    	return objMin;
    }


    //Para usar null parejas parejas.length saca la distancia minima de las parejas
    function sacarDistanciaMinParejas(promesa,parejas,tamArray){

    	if(promesa==null)
    		promesa=getDistancePromise(
    			parejas[tamArray].nodo1.lat,
    			parejas[tamArray].nodo2.lat,
    			parejas[tamArray].nodo1.long,
    			parejas[tamArray].nodo2.long
    			);
    	

		promesa
		.then(function(result){//guardamos los resultados de las coordenadas
			parejas[tamArray].distancia = result.response.route[0].summary.distance;
			if(tamArray==0){//cuando sacamos las distancias de las parejas
				
				

				var objMin = getMinDistancia(parejas);
				//añadimos el objeto a la lista de caminos
				addObjMin(objMin);
				//quita el nodo del inicio del viaje y los acomoda
				quitarNodoInicioViaje(objMin);
				if(seAcabaronNodos()){
                    verCiudadesOrdenadas();
					return;
                }

				parejas = getCombinaciones();
				sacarDistanciaMinParejas(null,parejas,parejas.length-1);
				return;
			}

			var tam = tamArray-1;
			var parejaSig = parejas[tam];
			var promesa1 = 
			getDistancePromise(
				parejaSig.nodo1.lat,
				parejaSig.nodo2.lat,
				parejaSig.nodo1.long,
				parejaSig.nodo2.long
				);

			sacarDistanciaMinParejas(promesa1,parejas,tam);
		},
		function(error){
			console.log("Error buscando la ruta "+error);
		})
		.catch(function(error){
			console.log("error funcion recursiva distancias de parejas"+error)
		});
    }

    //añade un objeto al arreglo del storange
    function addObjMin(objMin) {
        if(sessionStorage.getItem('objsMin')){//si ya esta
            var array = JSON.parse(sessionStorage.getItem("objsMin"));
            array.push(objMin);
            sessionStorage.setItem('objsMin',JSON.stringify(array));
        }
        else{//si no existe 
    	    var array=[];
    		array.push(objMin);
    		sessionStorage.setItem("objsMin",JSON.stringify(array));
    	}
    }
    function seAcabaronNodos() {
    	var array = JSON.parse(sessionStorage.getItem("coordenadasLugares"));
    	return (array.length==1)?true:false;
    }

    //guarda en el local storange el arreglo de lugares que consultamos 
    function quitarNodoInicioViaje(objMin) {

    	//sacamos el nodo final osea el nodo donde inicia el viaje 
    	var array = JSON.parse(sessionStorage.getItem("coordenadasLugares"));
    	array.pop();
    	
    	//$log.warn("sacamos el primer elemento del array");
    	//$log.warn(array);
    	//filtramos el arreglo 
    	array = array.filter(function (elemento) {
    		return objMin.nodo2.nombre != elemento.nombre;
    	});


    	array.push(objMin.nodo2); //mete un valor al arreglo en su posicion inicial


    	sessionStorage.setItem("coordenadasLugares",JSON.stringify(array));

    }
    function verCiudadesOrdenadas() {
        var array = JSON.parse(sessionStorage.getItem("objsMin"));    
        for (var i = array.length - 1; i >= 0; i--) {
            console.log(array[i]);
        }
    }


    function vaciarSessionStorange() {
        sessionStorage.setItem("coordenadasLugares","");
        sessionStorage.setItem("objsMin","");
    }


    //Obtenemos las cordenadas de lugares
    //el punto inicial debe ser el primer elemento del arreglo
	queryCoordinates.getCordenadasLugares = function () {
        vaciarSessionStorange();
		//hacer consulta y regresar array de strings del server
		var searchstexts = ['Mexico df','Ricardo flores magon','popotla'];
		

		var promesa = getPromiseCoord(searchstexts[searchstexts.length-1]);
		funcionRecursiva(promesa,searchstexts.length-1,[],searchstexts);
	}
	return queryCoordinates;
});