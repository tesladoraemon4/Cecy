CAMBIAR VISTAS DEL MODULO itinerario
Nombre del componente a llamar
	                            <mapa-itinerario></mapa-itinerario>



1.- cambiar icono de el resultado de la busqueda de un lugar
	itinerario.js
		irLugar
			configurarMarcador(url_imagen,);

2.- cambiar el cuadro de dialogo
	itinerario.js
		configurarMarcador
			variable html (esta comentado lo que no puedes modificar)
				en la parte de value necesitas el modo de transporte 
					https://developer.here.com/rest-apis/documentation/routing/topics/resource-param-type-routing-mode.html

3.- para cambiar el marcador con el cual se representara al usuario en el mapa
	Entrara a 
	positioning.js
	y cambiar variable positioning.markerUser ="img url"
4.- cambiar el boton de eliminar ruta en el globo de busqueda
	routing maps.js
	var eliminarRutaBtn


QUE NECESITO PARA MANDAR A BUSCAR LAS RUTAS ES



Lo que necesito con los lugares cecy 
las coordenadas con que se van a consultar a la db
el transporte que utilizara para ir de lugar1 a lugar2,
 los transporetes que puede usar estan aca :
https://developer.here.com/rest-apis/documentation/routing/topics/resource-param-type-routing-mode.html
En la primera posicion del arreglo metes el primer elemento de la lista dragable y asi sucesivamente

	[{
		lugar1:lat+","+long,
		lugar2:lat+","+long,
		transporte:"transporte"
	}]



















obj.ruta=10;//es para objetos de una sola 










objJSON = {
	rutaRequestParams = {
		language:'es-es',
		departure:'now',
		mode: transport,
		representation: 'display',
		routeattributes : 'waypoints,summary,shape,legs',
		maneuverattributes: 'direction,action',
		waypoint0: coordUser.lat+","+coordUser.lng, // Brandenburg Gate
		waypoint1: lat+","+long  // Friedrichstraße Railway Station
	},
	mode_scope:2,//modo donde se va a hacer la ruta 1 single route 2 varias rutas,
	id://id del objeto
}


















function marcarRuta(objJSON);







categoria de objetos añadidos al mapa es 











Funciones donde se manupulan objetos del mapa 
itinerario.js (no añadieron categorias 9 feb)
	
	function configurarMarcador(iconUrl,coordsO,objJson)  //icon url lo tiene por defecto
	configurarJsonRuta //solo he marcado el origen y el destino por que las localizaciones son dinamicas 




//antes de dormir marca undefined cuando busco una ruta 
//falta el sosicionamiento en tiempo real 
//necesito imagenes para los iconos 
//preguntar que medio de transporte usaran las personas(cecy)
//JWT








