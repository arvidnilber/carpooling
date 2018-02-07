// google.maps.Geocoder
var g_geocoder;
// Används för att zooma kartan rätt när markörer lagts till. Typ: google.maps.LatLngBounds
var g_bounds;
// Array med de markörer som för tillfället är på kartan.
var g_markers;

// Aktuella koordinater för till- och frånplats
var g_from_location;
var g_to_location;

// Senast sökta koordinater
var g_last_from;
var g_last_to;

// True om resultatet ska räknas om
var g_run_calculation = false;

/**
 * Söker efter koordinaterna till given adress.
 * Om flera koordinater matchar adressen körs funktionen handle_multiple_results()
 * @param type "from" (=platsen man åker ifrån) eller "to" (=platsen man ska till)
 * @param address
 * @return void
 */
function geocode(type, address)
{
	clear_errors();
	if (g_geocoder)
	{
		g_geocoder.geocode({'address': address}, function(results, status)
		{
			switch(status)
			{
				case google.maps.GeocoderStatus.OK:
					if (results.length > 1)
					{
						handle_multiple_results(type, results);
					}
					else
					{
						var result = results[0];
						if (type == 'from')
						{
							g_from_location = result.geometry.location;
							$('#form_location_from').val(build_address(result));
						}
						else
						{
							g_to_location = result.geometry.location;
							$('#form_location_to').val(build_address(result));
						}
						
						if (g_from_location != null && g_to_location != null && g_run_calculation)
						{
							g_run_calculation = false;
							get_path_and_info(g_from_location, g_to_location, $("#form_num_people").val(), $("#form_consumption").val(), $("#form_price_fuel").val());
						}
					}
					break;
				
				case google.maps.GeocoderStatus.ZERO_RESULTS:
					show_error(type, 'Adressen/platsen du sökte på kunde tyvärr inte hittas.');
					break;
				
				case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
					show_error(type, 'Easy on the trigger, baby!');
					break;
				
				case google.maps.GeocoderStatus.INVALID_REQUEST:
					break;
					
				default:
					show_error(type, 'Ett fel uppstod, var god kontakta administratören. Status: ' + status);
					break;
			}
		});
	}
}

/**
 * Visa de platser som matchade en given adress.
 * Platserna visas både som markörer på kartan och i en lista i popupruta.
 *
 * @param type "from" eller "to"
 * @param results Array med resultat, given från google.maps.Geocoder.geocode()
 * @return void
 */

function handle_multiple_results(type, results)
{
	clear_markers();
	
	$('#result_list').empty();
	for (i = 0; i < results.length; i++)
	{
		add_result(type, results[i], i);
	}
	
	if (type == 'from')
	{
		var offset = $('#form_location_from').offset();
	}
	else
	{
		var offset = $('#form_location_to').offset();
	}
	;
	$('#multiple_results').css('left', offset.left -= 300).css('top', offset.top += 50).show();
	g_map.fitBounds(g_bounds);
}

/**
 * Lägger till ett alternativ till listan av möjliga platser,
 * och skapar markör på kartan.
 *
 * @param type "from" eller "to"
 * @param result Det resultat som läggs till
 * @param number Det nummer i ordningen som resultatet skrivs ut i
 * @return void
 */
function add_result(type, result, number)
{
	var address = build_address(result);
	$('#result_list').append('<li><a href="#" id="multiple_result' + number + '">' + address + '</a></li>');
	
	var marker = add_marker(result.geometry.location);
	
	$('#multiple_result' + number).click(function()
		{
		if (type == 'from')
		{
			g_from_location = result.geometry.location;
			g_last_from = g_from_location;
			$('#form_location_from').val(address);
			$('#form_location_to').focus();
		}
		else
		{
			g_to_location = result.geometry.location;
			g_last_to = g_to_location;
			$('#form_location_to').val(address);
			$('#form_consumption').focus();
		}
		clear_markers();
		$('#multiple_results').hide();
	});
	
	google.maps.event.addListener(marker, 'mouseover', function()
	{
		$('#multiple_result' + number).addClass('hover');
	});

	google.maps.event.addListener(marker, 'mouseout', function()
	{
		$('#multiple_result' + number).removeClass('hover');
	});
	
	google.maps.event.addListener(marker, 'click', function()
	{
		$('#multiple_result' + number).click();
		scroll(0, 0);
	});
}

/**
 * Bygger upp en detaljerad, läslig adress till en angiven plats
 * @param result Den plats vars adress som ska byggas upp
 * @return void
 */

function build_address(result)
{
	var street, street_number, postal_code, city, county, country;
	var sublocalities = new Array();
	$.each(result.address_components, function(key, component)
	{
		if ($.inArray('route', component.types) != -1)
		{
			street = component.long_name;
		}
		
		if ($.inArray('street_number', component.types) != -1)
		{
			street_number = component.long_name;
		}

		if ($.inArray('postal_code', component.types) != -1 && postal_code == null)
		{
			postal_code = component.long_name;
		}
		
		if ($.inArray('sublocality', component.types) != -1)
		{
			sublocalities[sublocalities.length] = component.long_name;
		}
		
		if ($.inArray('locality', component.types) != -1 || $.inArray('postal_town', component.types) != -1)
		{
			city = component.long_name;
		}

		if ($.inArray('administrative_area_level_1', component.types) != -1)
		{
			county = component.long_name;
		}
		
		if ($.inArray('country', component.types) != -1)
		{
			country = component.long_name;
		}
	});
	var address = '';
	
	if (street != null)
	{
		address += street;
	}

	if (street_number != null)
	{
		address += ' ' + street_number;
	}
	
	if (address.length > 0)
	{
		address += ', ';
	}
	
	if (postal_code != null)
	{
		address += postal_code + ', ';
	}
	
	if (sublocalities.length > 0)
	{
		$.each(sublocalities, function(key, sub)
		{
			address += sub + ', ';
		});
	}
	
	if (city != null)
	{
		address += city + ', ';
	}
	
	if (county != null)
	{
		address += county + ', ';
	}
	
	address += country;
	
	return address;
}

/**
 * Raderar alla markörer från kartan
 * @return void
 */
function clear_markers()
{
	$.each(g_markers, function(key, marker)
	{
		marker.setMap(null);
	});
	g_markers = new Array();
	g_bounds = new google.maps.LatLngBounds();
}


/**
 * Lägger till en markör på angivna koordinater
 * @param position
 * @return void
 */
function add_marker(position)
{
	var marker = new google.maps.Marker({
		map: g_map,
		position: position
	});
	g_bounds.extend(position);
	g_markers[g_markers.length] = marker;
	
	return marker;
}