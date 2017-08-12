var activeTextFeat = 'country'
var activeAreaFeat = 'country'

var countryIsSetup = false
var culIsSetup = false
var relIsSetup = false
var relGenIsSetup = false

var map = new mapboxgl.Map({
    container: 'map',
    renderWorldCopies: false,
    style: {
        "version": 8,
        "sources": {
            "watercolor": {
                "type": "raster",
                // point to our third-party tiles. Note that some examples
                // show a "url" property. This only applies to tilesets with
                // corresponding TileJSON (such as mapbox tiles).
                "tiles": [
                    // "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    // "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    "http://tile.stamen.com/watercolor/{z}/{x}/{y}.png"
                ],
                "tileSize": 256,
            }
        },
        "glyphs": "fonts/{fontstack}/{range}.pbf",
        "layers": [{
            "id": "watercolor",
            "type": "raster",
            "source": "watercolor",
            "minzoom": 0,
            "maxzoom": 22
        }]
    },
    center: [0, 20], // starting position
    zoom: 2 // starting zoom
});

var rulStops = [],
    relStops = []

map.on('load', function () {

    map.addSource('provinces', {
            'type': 'geojson',
            'data': provinceCollection
    });

    map.addSource('realm-lines', {
        'type': 'geojson',
        'data': provinceCollection
    });




    var rulKeys = Object.keys(rulPlus)
    for (var i=0; i < rulKeys.length; i++) {
        rulStops.push([rulKeys[i], rulPlus[rulKeys[i]][1]])
    }

    var relKeys = Object.keys(relPlus)
    for (var i=0; i < relKeys.length; i++) {
        relStops.push([relKeys[i], relPlus[relKeys[i]][1]])
    }

    var layers = []; //bucket to hold our data layers.  We'll fill this in next.

    layers.push({
        id: 'ruler',
        type: 'fill',
        source: 'provinces',
        paint: {
            'fill-color': {
                'property': 'r',
                'type': 'categorical',
                'stops': rulStops,
                'default': "rgba(1,1,1,0.3)"
            },
            'fill-opacity': 0.6,
            'fill-outline-color': 'rgba(0,0,0,.2)'
        }
    })

    layers.push({
        id: 'ruler-hover',
        type: 'fill',
        source: 'provinces',
        paint: {
            'fill-color': {
                'property': 'r',
                'type': 'categorical',
                'stops': rulStops,
                'default': "rgba(1,1,1,0.3)"
            },
            'fill-opacity': 0.9,
            'fill-outline-color': 'rgba(0,0,0,.2)'
        },
        "filter": ["==", "r", ""]
    })



    layers.push({
        "id": "realm-lines",
        "type": "line",
        "source": "realm-lines",
        "paint": {
            'line-color': {
                'property': 'n',
                'type': 'categorical',
                'stops': rulStops,
                'default': "rgba(1,1,1,0.3)"
            },
            'line-width': 6,
            'line-opacity': .6,
            'line-blur': 6,
            // 'fill-outline-color': 'rgba(0,0,0,.2)'
        }
    })


    layers.push({
        id: 'religion',
        type: 'fill',
        source: 'provinces',
        paint: {
            'fill-color': {
                'property': 'e',
                'type': 'categorical',
                'stops': relStops,
                'default': "rgba(1,1,1,0.3)"
            },
            'fill-opacity': 0.6,
            'fill-outline-color': 'rgba(0,0,0,.2)'
        }
    })

    for (var p = 0; p < layers.length; p++) {
        map.addLayer(layers[p]);
    }

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // When a click event occurs on a feature in the states layer, open a popup at the
    // location of the click, with description HTML from its properties.
    map.on('click', 'ruler', function (e) {
    });

    var delay=100, setTimeoutConst, isActive=false;

    map.on("mousemove", "ruler", function(e) {
        if (!isActive) {
            isActive = true;
            map.setFilter("ruler-hover", ["==", "r", (activeYear[e.features[0].properties.name] || [])[0]]);
            setTimeout(function(){
                isActive = false;
            }, delay);

        }
    });

    // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
    map.on("mouseleave", "ruler", function() {
        map.setFilter("ruler-hover", ["==", "r", ""]);
    });


    simulateYearChange()
    simulateDimChange()
    simulateDimChange()
});

function simulateDimChange(){
    console.debug("changing dim")
    if (map.getLayoutProperty('ruler', 'visibility') !== 'none'){
        activeTextFeat = 'country'
        map.setLayoutProperty('religion', 'visibility', 'visible');
        map.setLayoutProperty('ruler', 'visibility', 'none');
    } else {
        activeTextFeat = 'religion'
        addTextFeat("country")
        map.setLayoutProperty('ruler', 'visibility', 'visible');
        map.setLayoutProperty('religion', 'visibility', 'none');
    }
}

function simulateYearChange(){
    console.debug("changing year")
    var features = provinceCollection.features
    for (var i=0; i < features.length; i++) {
        provinceCollection.features[i].properties.r = (activeYear[features[i].properties.name] || [])[0]
        provinceCollection.features[i].properties.e = (activeYear[features[i].properties.name] || [])[2]
    }
    map.getSource('provinces').setData(provinceCollection)

}
