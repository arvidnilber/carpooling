var g_city_from;

var g_city_to;

// Retur från DirectionsService
var g_directions_result;
var g_directions_status;

/**
 * Hämtar reseinformation. Skriver ut karta med resväg och information.
 * @param location_from Objekt av typ maps.google.LatLng
 * @param location_to Objekt av typ maps.google.LatLng
 * @param num_people Antal personer
 * @param consumption Fordonets förbrukning per mil
 * @param price_fuel Literpris för bränslet
 */

function get_path_and_info(location_from, location_to, num_people, consumption, price_fuel) {
	// Se efter om gamla koordinaterna inte är samma som de inmatade
	if (!(g_city_from == location_from && g_city_to == location_to)) {
		g_city_from = location_from;
		g_city_to = location_to;
		
		// Baserade på http://code.google.com/apis/maps/documentation/javascript/reference.html#DirectionsRequest
		var options = {
			destination : g_city_to,
			optimizeWaypoints : false,
			origin: g_city_from,
			travelMode : google.maps.DirectionsTravelMode.DRIVING,
			unitSystem : google.maps.DirectionsUnitSystem.METRIC
		}
		
		directions = new google.maps.DirectionsService();
		directions.route(options, function(DirectionsResult, DirectionsStatus)
		{
			g_directions_result = DirectionsResult;
			g_directions_status = DirectionsStatus;
			render_directions();
			print_travelinfo(num_people, consumption, price_fuel);
		});
	}
	else
	{
		render_directions();
		print_travelinfo(num_people, consumption, price_fuel);
	}
	
	print_map();
}

/**
 * Beräknar resekostnader med information utifrån det globala objektet.
 * Funktionen förutsätter att det senaste Google Maps-objektet är laddat.
 * @param num_people Antal personer som ska resa
 * @param consumption Bilens bränsleförbrukning per mil
 * @param price_fuel Bränslepriset uttryckt i SEK per mil.
 * @return JSON-objekt med reslängd, tid, total kostnad, kostnad per person.
 */

function get_calculated_travelinfo(num_people, consumption, price_fuel)
{
	// Total sträcka
	var travel_distance = 0;
	// Total tid
	var travel_time = 0;
	
	for (i = 0; i < g_directions_result.routes[0].legs.length; i++)
	{
		travel_distance += g_directions_result.routes[0].legs[i].distance.value;
		travel_time += g_directions_result.routes[0].legs[i].duration.value;
	}
	
	
	var calculated_travelinfo = {
		"distance" : {
			"kilometers" : Math.round(travel_distance/100)/10,
			"meters" : travel_distance
		},
		"time" : 
		{
			"hours" : Math.floor(travel_time / 3600),
			"minutes" : Math.floor(travel_time / 60) % 60,
			"seconds" : travel_time % 60
		},
		"cost_total" : Math.round(consumption*travel_distance/10000*price_fuel*100)/100,
		"cost_per_person" : Math.round((consumption*travel_distance/10000*price_fuel)/num_people*100)/100
	};
	
	return calculated_travelinfo;
}

/**
 * Skriver ut karta
 */
function print_map()
{
	options_map = {
		// Centrerar på Stockholm, Sverige, som default
		center : new google.maps.LatLng(60.128161, 18.643501),
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		zoom : 4,
		scrollwheel: false
	}

	g_map = new google.maps.Map(document.getElementById("map_canvas"), options_map);
}

/**
 * Skriver ut resväg på kartan
 */
function render_directions()
{
	var options_renderer =
	{
		hiteRouteList : true
	}
	renderer = new google.maps.DirectionsRenderer(options_renderer);
	renderer.setDirections(g_directions_result);
	renderer.setMap(g_map);
}
/**
 * Skriver ut beräknad reseinformation
 * @param num_people Antal personer som ska resa
 * @param consumption Bilens bränsleförbrukning per mil
 * @param price_fuel Bränslepriset uttryckt i SEK per mil.
 */

function print_travelinfo(num_people, consumption, price_fuel)
{
	var travel_info = get_calculated_travelinfo(num_people, consumption, price_fuel);
	$("#form_information").html("Total resväg för sträckan är <b>"+travel_info["distance"]["kilometers"]+" km</b>. Körtiden beräknas till <b>"+ travel_info["time"]["hours"] + " timmar och " + travel_info["time"]["minutes"] +" minuter</b>. Baserat på en förbrukning av "+consumption+" liter/mil och ett bränslepris på "+price_fuel+" kr/liter landar kostnaden på <b>"+travel_info["cost_per_person"]+" kr</b> per person. Total kostnad är <b>"+travel_info["cost_total"]+" kr</b>.");
	$("#form_information").slideDown();
}