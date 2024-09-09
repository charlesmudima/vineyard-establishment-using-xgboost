// Need to add authentication to the script

var ee = require('@google/earthengine');

// Set study region
var wc_extent = ee.FeatureCollection('users/charlesmudima/Western_cape_extent');
var image = ee.ImageCollection('LANDSAT/LC08/C02/T1_RT_TOA')
            .filterDate("2018-01-01","2022-12-31")
            .filterBounds(wc_extent);
            // .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',10));


// Make a median composite and clip to study region
var imageClip = image.median().clipToCollection(wc_extent);
print('The Landsat8 bands are:', imageClip);

Map.addLayer(imageClip, {
  min:400,
  max: [4000,3000,3000],
  bands: 'B4,B5,B2'
},"WC Landsat");

Map.addLayer(wc_extent,{}, 'WC extent');
Map.centerObject(wc_extent);

// Create a normalized difference vegetation index = (nir-red)/(nir+red)
var nir = imageClip.select('B5');
var red = imageClip.select('B4');
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
print(ndvi, 'NDVI WC Landsat 8');

// Add ndvi layer to the map
var ndviParams = {min: -1, max: 1, palette: ['blue', 'yellow', 'green']};
Map.addLayer(ndvi,ndviParams, 'NDVI L8 WC');

// extract/save ndvi layer
// default res is at 1000m
print("exporting image to drive");
Export.image.toDrive({
                    image: ndvi,
                    description: 'western_cape_ndvi',
                     fileNamePrefix:'wc_ndvi',
                     maxPixels: 1e13
                     });