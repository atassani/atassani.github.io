---
title: My page
permalink: map/
---
# Creating a map

Following Mike Bostock's article Command-Line Cartography, [Part 1](https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c#.ywe1d9jwj), [Part 2](https://medium.com/@mbostock/command-line-cartography-part-2-c3a82c5c0f3#.3fpxtkjgx)

```bash
curl 'http://www2.census.gov/geo/tiger/GENZ2014/shp/cb_2014_06_tract_500k.zip' -o cb_2014_06_tract_500k.zip
unzip -o cb_2014_06_tract_500k.zip
```

Drag `.shp` file to [mapshaper.org](http://mapshaper.org). Ok, we can see the map in the browser.

Get Mike's `shp2json`:

```bash
npm install -g shapefile
```

And convert `.shp` to GeoJSON:

```bash
shp2json cb_2014_06_tract_500k.shp -o ca.json
```

We apply a geographic projection to avoid expensive trigonometric operations.
We apply the projection named 'California Albers', but we could try 'd3-stateplane' or search (spatialreference.org)[http://spatialreference.org]

```bash
npm install -g d3-geo-projection

geoproject 'd3.geoConicEqualArea().parallels([34, 40.5]).rotate([120, 0]).fitSize([960, 960], d)' < ca.json > ca-albers.json
```

To preview the projected geometry in SVG:

```bash
geo2svg -w 960 -h 960 < ca-albers.json > ca-albers.svg
```

To manipulate the json and convert to newline-delimited JSON (NDJSON):

```bash
npm install -g ndjson-cli

ndjson-split 'd.features' \
  < ca-albers.json \
  > ca-albers.ndjson

  ndjson-map 'd.id = d.properties.GEOID.slice(2), d' \
    < ca-albers.ndjson \
    > ca-albers-id.ndjson  
```

Get population estimates from Census Bureau:

```bash
curl 'http://api.census.gov/data/2014/acs5?get=B01003_001E&for=tract:*&in=state:06' -o cb_2014_06_tract_B01003.json
```

Transform:

```bash
ndjson-cat cb_2014_06_tract_B01003.json \
  | ndjson-split 'd.slice(1)' \
  | ndjson-map '{id: d[2] + d[3], B01003: +d[0]}' \
  > cb_2014_06_tract_B01003.ndjson
```

And join population data to geometry:

```bash
ndjson-join 'd.id' \
  ca-albers-id.ndjson \
  cb_2014_06_tract_B01003.ndjson \
  > ca-albers-join.ndjson
```

Compute popoulation density and remove additional properties:

```bash
ndjson-map 'd[0].properties = {density: Math.floor(d[1].B01003 / d[0].properties.ALAND * 2589975.2356)}, d[0]' \
  < ca-albers-join.ndjson \
  > ca-albers-density.ndjson
```

Convert back to GeoJSON:

```bash
ndjson-reduce \
  < ca-albers-density.ndjson \
  | ndjson-map '{type: "FeatureCollection", features: d}' \
  > ca-albers-density.json
```
or

```bash
ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' \
  < ca-albers-density.ndjson \
  > ca-albers-density.json
```

Install D3 and create a choropleth and to SVG.

```bash
npm install -g d3

ndjson-map -r d3 \
  '(d.properties.fill = d3.scaleSequential(d3.interpolateViridis).domain([0, 4000])(d.properties.density), d)' \
  < ca-albers-density.ndjson \
  > ca-albers-color.ndjson

geo2svg -n --stroke none -p 1 -w 960 -h 960 \
    < ca-albers-color.ndjson \
    > ca-albers-color.svg  
```

---

To reduce the size of the file we will install TopoJSON CLI:

```bash
npm install -g topojson
```

To convert to TopoJSON and simplify:

```bash
geo2topo -n \
  tracts=ca-albers-density.ndjson \
  > ca-tracts-topo.json

toposimplify -p 1 -f \
    < ca-tracts-topo.json \
    > ca-simple-topo.json  

topoquantize 1e5 \
      < ca-simple-topo.json \
      > ca-quantized-topo.json    
```

We can use `topomerge` to get county geometry:

```bash
topomerge -k 'd.id.slice(0, 3)' counties=tracts \
  < ca-quantized-topo.json \
  > ca-merge-topo.json
```

```bash
topomerge --mesh -f 'a !== b' counties=counties \
  < ca-merge-topo.json \
  > ca-topo.json
```

```bash
topo2geo tracts=- \
  < ca-topo.json \
  | ndjson-map -r d3 'z = d3.scaleSequential(d3.interpolateViridis).domain([0, 4000]), d.features.forEach(f => f.properties.fill = z(f.properties.density)), d' \
  | ndjson-split 'd.features' \
  | geo2svg -n --stroke none -p 1 -w 960 -h 960 \
  > ca-tracts-color.svg

topo2geo tracts=- \
    < ca-topo.json \
    | ndjson-map -r d3 'z = d3.scaleSequential(d3.interpolateViridis).domain([0, 100]), d.features.forEach(f => f.properties.fill = z(Math.sqrt(f.properties.density))), d' \
    | ndjson-split 'd.features' \
    | geo2svg -n --stroke none -p 1 -w 960 -h 960 \
    > ca-tracts-sqrt.svg  
```

Install the discrete color schemes from Cynthia A. Brewer.

```bash
npm install -g d3-scale-chromatic
```

Add borders:

```bash
(topo2geo tracts=- \
    < ca-topo.json \
    | ndjson-map -r d3 -r d3=d3-scale-chromatic 'z = d3.scaleThreshold().domain([1, 10, 50, 200, 500, 1000, 2000, 4000]).range(d3.schemeOrRd[9]), d.features.forEach(f => f.properties.fill = z(f.properties.density)), d' \
    | ndjson-split 'd.features'; \
topo2geo counties=- \
    < ca-topo.json \
    | ndjson-map 'd.properties = {"stroke": "#000", "stroke-opacity": 0.3}, d')\
  | geo2svg -n --stroke none -p 1 -w 960 -h 960 \
  > ca.svg
```


This is the final result of the [map without colors](/d3project/map/ca-albers.svg) and the [map with data](/d3project/map/ca-albers-color.svg).
