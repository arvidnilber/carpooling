var g_city_from;
var g_city_to;
var g_directions_result;
var g_directions_status;

function get_path_and_info(location_from, location_to, num_people, consumption, price_fuel) {
    if (!(g_city_from == location_from && g_city_to == location_to)) {
        g_city_from = location_from;
        g_city_to = location_to;
        var options = {
            destination: g_city_to,
            optimizeWaypoints: !1,
            origin: g_city_from,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            unitSystem: google.maps.DirectionsUnitSystem.METRIC
        }
        directions = new google.maps.DirectionsService();
        directions.route(options, function(DirectionsResult, DirectionsStatus) {
            g_directions_result = DirectionsResult;
            g_directions_status = DirectionsStatus;
            render_directions();
            print_travelinfo(num_people, consumption, price_fuel)
        })
    } else {
        render_directions();
        print_travelinfo(num_people, consumption, price_fuel)
    }
    print_map()
}

function get_calculated_travelinfo(num_people, consumption, price_fuel) {
    var travel_distance = 0;
    var travel_time = 0;
    for (i = 0; i < g_directions_result.routes[0].legs.length; i++) {
        travel_distance += g_directions_result.routes[0].legs[i].distance.value;
        travel_time += g_directions_result.routes[0].legs[i].duration.value
    }
    var calculated_travelinfo = {
        "distance": {
            "kilometers": Math.round(travel_distance / 100) / 10,
            "meters": travel_distance
        },
        "time": {
            "hours": Math.floor(travel_time / 3600),
            "minutes": Math.floor(travel_time / 60) % 60,
            "seconds": travel_time % 60
        },
        "cost_total": Math.round(consumption * travel_distance / 10000 * price_fuel * 100) / 100,
        "rounded_trip": (Math.round(consumption * travel_distance / 10000 * price_fuel * 100) / 100)*2,
        "cost_per_person": Math.round((consumption * travel_distance / 10000 * price_fuel) / num_people * 100) / 100
    };
    return calculated_travelinfo
}

function print_map() {
    options_map = {
        center: new google.maps.LatLng(57.70887, 11.974559999999997),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 4,
        scrollwheel: !1
    }
    g_map = new google.maps.Map(document.getElementById("map_canvas"), options_map)
}

function render_directions() {
    var options_renderer = {
        hiteRouteList: !0
    }
    renderer = new google.maps.DirectionsRenderer(options_renderer);
    renderer.setDirections(g_directions_result);
    renderer.setMap(g_map)
}

function print_travelinfo(num_people, consumption, price_fuel) {
    var travel_info = get_calculated_travelinfo(num_people, consumption, price_fuel);
    $("#form_information").html("Den totala resvägen för sträckan är <b>" + travel_info.distance.kilometers + " km</b>. Körtiden beräknas till <b>" + travel_info.time.hours + " timmar och " + travel_info.time.minutes + " minuter</b>. Baserat på en förbrukning av " + consumption + " liter/mil och ett bränslepris på " + price_fuel + " kr/liter landar kostnaden på <b>" + travel_info.cost_per_person + " kr</b> per person. Total kostnad är <b>" + travel_info.cost_total + " kr</b>. Tur och retur kostar <b>" + travel_info.rounded_trip + "kr. </b> ");
    $("#form_information").slideDown()
}