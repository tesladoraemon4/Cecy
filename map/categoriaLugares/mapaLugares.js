/**
* hereMapa Module
*
* Description
* Es el nùcleo del componente mapa lugares
*/
angular.module('hereMapa',['ngGeolocation'])
.component('mapaHere',{
	templateUrl:'map/categoriaLugares/mapaPlaces.html',
	controller : function(categorias,mapaProvider,$scope,$log,$geolocation/*es provisional*/){
		$scope.categorias = [];
		$scope.consultados = [];
		$scope.coordsUser = {};
		
		//sacar geolocalizacion*****************************************************************+
		//VERSION NAVIGATOR
		var geolocalitation = {};
		var markerObject=null;
		 geolocalitation.errorGeo=false;
		var initGeolocalizacion = function(){
			navigator.geolocation.watchPosition(function (data) {
				var coords = {lat:data.coords.latitude,lng:data.coords.longitude};
				$scope.coordsUser = coords;
				mapaProvider.coordUser = coords;
				geolocalitation.errorGeo = false;
			},
			function (error) {
			    Geolocation.clearWatch();
			    geolocalitation.errorGeo=true;
			},
			{
		       enableHighAccuracy: true
		    });
		}
		//refresca la vista del mapa 
		var refreshMapMarker = 
			setInterval(function () {
			$log.log("refreshMapMarker Error geo "+geolocalitation.errorGeo);

			if(geolocalitation.errorGeo){
				var coor =$scope.coordsUser;
				var aux = markerObject;
				mapaProvider.map.removeObject(markerObject);
				markerObject = aux;
				markerObject.setPosition(coor);
				markerObject.type=3;
				mapaProvider.map.addObject(markerObject);
			}else{
				clearTimeout(refreshMapMarker);

			}
			//$log.log("refreshMapMarker end");
		},3000);
		mapaProvider.cargarMapa();
		initGeolocalizacion();
		setTimeout(function fijarPosInicial() {
			if(!geolocalitation.errorGeo){
				mapaProvider.map.setCenter($scope.coordsUser);
				mapaProvider.map.setZoom(10);
				markerObject=new H.map.Marker($scope.coordsUser);
				mapaProvider.map.addObject(markerObject);
			}
			else{
				mapaProvider.map.setCenter({lat:19.432608,lng:-99.133208});
				mapaProvider.map.setZoom(10);
				mapaProvider.map.addObject(new H.map.Marker({lat:19.432608,lng:-99.133208}));
				$log.error("Ocurrio un error en la geolocalizacion");
			}
		},3000);





		//sacar geolocalizacion*****************************************************************+

		$scope.quitarMarcadores = function (cat) {
			$scope.consultados=$scope.consultados.filter(function (element) {
				return  cat != element;
			});
			cat = categorias.traslateEspanolIngles(cat);
			mapaProvider.quitarMarcadores(cat);
		};
		getCategorias();
		function getCategorias() {
			var cat=['accommodation',
			'administrative-areas-buildings'
			,'airport','atm-bank-exchange',
			'coffee-tea','eat-drink','going-out','hospital-health-care-facility',
			'leisure-outdoor','natural-geographical','petrol-station','restaurant',
			'snacks-fast-food','sights-museums','shopping','toilet-rest-area','transport'];
			for (var i = 0; i<cat.length;i++) 
				$scope.categorias.push(categorias.traslateInglesEspanol(cat[i]));
		}
		$scope.anadir = function () {//agregar varios filtros +
			$scope.consultados.push($scope.cat);
			mapaProvider.lugares(categorias.traslateEspanolIngles($scope.cat),$scope.coordsUser);
		}

		$scope.eliminarBurbujas = mapaProvider.eliminarBurbujas;

		$scope.marcarRuta = mapaProvider.marcarRuta;

	}
});




