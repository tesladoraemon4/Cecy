/**
* hereMapa Module
*
* Description
* Es el nùcleo del componente mapa lugares
*/
angular.module('hereMapa',[])
.component('mapaHere',{
	templateUrl:'map/mapaPlaces.html',
	controller : function(categoriasPlaces,mapaProvider,$scope,$log){
		$scope.categorias = [];
		$scope.consultados = [];
		$scope.coordsUser = {};
		mapaProvider.cargarMapa();
		//sacar geolocalizacion
		navigator.geolocation.getCurrentPosition(function (data) {
			$scope.coordsUser = {lat:data.coords.latitude,lng:data.coords.longitude};
			mapaProvider.map.setCenter({lat:data.coords.latitude,lng:data.coords.longitude});
			mapaProvider.coordUser =$scope.coordsUser;
		},
		function (errorCallback) {
			$log.error("Algo se chingo");
		});
		//sacargeolocalizacion

		$scope.quitarMarcadores = function (cat) {
			$scope.consultados=$scope.consultados.filter(function (element) {
				return  cat != element;
			});
			cat = categoriasPlaces.traslateEspanolIngles(cat);
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
				$scope.categorias.push(categoriasPlaces.traslateInglesEspanol(cat[i]));
		}
		$scope.anadir = function () {//agregar varios filtros +
			$scope.consultados.push($scope.cat);
			mapaProvider.lugares(categoriasPlaces.traslateEspanolIngles($scope.cat),$scope.coordsUser);
		}

		$scope.eliminarBurbujas = mapaProvider.eliminarBurbujas;

		$scope.marcarRuta = mapaProvider.marcarRuta;

	}
});




