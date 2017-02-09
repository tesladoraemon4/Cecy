/**
* hereMapa Module
*
* Description
* Es el nùcleo del componente mapa lugares
*/
angular.module('hereMapa',['ngGeolocation'])
.component('mapaHere',{
	templateUrl:'map/categoriaLugares/mapaPlaces.html',
	controller : function(categorias,mapaProvider,$scope,$log,positioning,$geolocation/*es provisional*/){
		$scope.categorias = [];
		$scope.consultados = [];
		$scope.coordsUser = {};
		mapaProvider.cargarMapa();
		//sacar geolocalizacion*****************************************************************+


		//inicializo la geolocalizacion
		$geolocation.getCurrentPosition({
		           enableHighAccuracy: true
		       });
		//inicializamos el mapa en las coordenadas iniciales
		setTimeout(function inicializaCoordenadas() {
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
		setInterval(function actualizaCoordenadas() {
			//$log.log("Refrescando coordenadas");
			var coor = 
			{lat:$geolocation.position.coords.latitude,
			lng:$geolocation.position.coords.longitude}
			$scope.coordsUser=positioning.coords = mapaProvider.coordUser = coor;
		},3500);
		
		setInterval(function () {
			positioning.refreshMapMarker(mapaProvider.map);
		},3500);

		


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




