/**
*  Module
*
* Description
* Traduce las categorias de lugares a buscar 
*/
angular.module('hereMapa')
.factory('categorias', function ($log) {
	
	var categoriasPlaces = {};
	categoriasPlaces.traslateEspanolIngles = function (palabra) {
		switch(palabra){
			case 'Transportes':
			return 'transport';
			break;case 'Sanitarios':
			return 'toilet-rest-area';
			break;case 'Shopping':
			return 'shopping';
			break;case 'Lugares de interes turìstico':
			return 'sights-museums';
			break;case 'Comida rapida y refigerios':
			return 'snacks-fast-food';
			break;case 'Restaurantes':
			return 'restaurant';
			break;case 'Gasolineras':
			return 'petrol-station';
			break;case 'areas naturales':
			return 'natural-geographical';
			break;case 'ocio exterior':
			return 'leisure-outdoor';
			break;case 'Holpitales':
			return 'hospital-health-care-facility';
			break;case 'Salir':
			return 'going-out';
			break;case 'Bebidas y comidas':
			return 'eat-drink';
			break;case 'Café-té':
			return 'coffee-tea';
			break;case 'Atm-bank-exchange':
			return 'atm-bank-exchange';
			break;case 'Aeropuerto':
			return 'airport';
			break;case 'Administrativo-áreas-edificios':
			return 'administrative-areas-buildings';
			break;case 'Alojamiento':
			return 'accommodation';
			break;case 'Seleccionar':
			return 'Seleccionar';
			break;
			default:
				$log.error("ninguna opcion seleccionada");
			break;

		}
	}
	categoriasPlaces.traslateInglesEspanol= function (palabra) {
		switch(palabra){
			case 'transport':
			return 'Transportes';
			break;case 'toilet-rest-area':
			return 'Sanitarios';
			break;case 'shopping':
			return 'Shopping';
			break;case 'sights-museums':
			return 'Lugares de interes turìstico';
			break;case 'snacks-fast-food':
			return 'Comida rapida y refigerios';
			break;case 'restaurant':
			return 'Restaurantes';
			break;case 'petrol-station':
			return 'Gasolineras';
			break;case 'natural-geographical':
			return 'areas naturales';
			break;case 'leisure-outdoor':
			return 'ocio exterior';
			break;case 'hospital-health-care-facility':
			return 'Holpitales';
			break;case 'going-out':
			return 'Salir';
			break;case 'eat-drink':
			return 'Bebidas y comidas';
			break;case 'coffee-tea':
			return 'Café-té';
			break;case 'atm-bank-exchange':
			return 'Atm-bank-exchange';
			break;case 'airport':
			return 'Aeropuerto';
			break;case 'administrative-areas-buildings':
			return 'Administrativo-áreas-edificios';
			break;case 'accommodation':
			return 'Alojamiento';
			break;case 'Seleccionar':
			return 'Seleccionar';
			break;
			default:
				$log.error("ninguna opcion seleccionada");
			break;
		}
	}
	return categoriasPlaces;


});
