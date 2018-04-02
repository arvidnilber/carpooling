$(document).ready(function()
{
	g_geocoder = new google.maps.Geocoder();
	g_bounds = new google.maps.LatLngBounds();
	g_markers = new Array();
		
	$("#form_information").hide();
	$(".window").hide();
});

function validate_form()
{
	$("#form_consumption").val($("#form_consumption").val().replace(',', '.'));
	$("#form_price_fuel").val($("#form_price_fuel").val().replace(',', '.'));
	
	return ($('#form_num_people').val().length > 0 && is_numeric($('#form_num_people').val()) &&
		$('#form_consumption').val().length > 0 && is_numeric($('#form_consumption').val()) &&
		$('#form_price_fuel').val().length > 0 && is_numeric($('#form_price_fuel').val()));
}

function is_numeric(str)
{
	if(!/\D/.test(str)) return true;
	else if(/^\d+\.\d+$/.test(str)) return true;
	else return false;
}

/**
 * Updates the map and the result alculation
 * This runs when the form is posted
 * @return void
 */

function update_route()
{
	if (!validate_form())
	{
		return;
	}
	
	clear_errors();
	
	$("#form_information").empty().slideUp();

	from = $('#form_location_from').val();
	to = $('#form_location_to').val();
	
	g_run_calculation = true;

	if (g_last_from != from)
	{
		g_from_location = null;
		geocode('from', from);
	}

	if (g_last_to != to)
	{
		g_to_location = null;
		geocode('to', to);
	}

	if (g_from_location != null && g_to_location != null)
	{
		get_path_and_info(g_from_location, g_to_location, $("#form_num_people").val(), $("#form_consumption").val(), $("#form_price_fuel").val());
	}
}

