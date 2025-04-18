var aoi = ee.Geometry.Rectangle([-85.0, -17.0, -30.0, 11.0]);
Map.centerObject(aoi, 4);

// UI Panel
var panel = ui.Panel({style: {width: '300px'}});
ui.root.insert(0, panel);

// labels
panel.add(ui.Label('Select Baseline NDVI Period'));

// start date slider
var startSlider = ui.DateSlider({
  start: '2001-01-01',
  end: '2023-12-31',
  value: '2015-01-01',
  period: 1,
  style: {stretch: 'horizontal'}
});
panel.add(ui.Label('Baseline start date:'));
panel.add(startSlider);

// End Date Slider
var endSlider = ui.DateSlider({
  start: '2001-01-01',
  end: '2023-12-31',
  value: '2019-12-31',
  period: 1,
  style: {stretch: 'horizontal'}
});
panel.add(ui.Label('Baseline end date:'));
panel.add(endSlider);

// refresh Button
var button = ui.Button('Refresh', updateMap);
panel.add(button);

// main
function updateMap() {
  Map.layers().reset();

  var start = ee.Date(startSlider.getValue()[0]);
  var end = ee.Date(endSlider.getValue()[0]);

  var baseline = ee.ImageCollection('MODIS/006/MOD13Q1')
    .filterBounds(aoi)
    .filterDate(start, end)
    .select('NDVI')
    .mean();

  var recent = ee.ImageCollection('MODIS/006/MOD13Q1')
    .filterBounds(aoi)
    .filterDate('2023-01-01', '2023-12-31')
    .select('NDVI')
    .mean();

  var diff = baseline.subtract(recent); // drop in NDVI = possible deforestation

  Map.addLayer(diff.clip(aoi), {
    min: 0, max: 2000,
    palette: ['white', 'orange', 'red']
  }, 'NDVI Drop');
}

Map.onClick(function(coords) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  aoi = point.buffer(200000).bounds();  // 200 km buffer around click
  Map.centerObject(point, 6);
  updateMap();
});

updateMap();
