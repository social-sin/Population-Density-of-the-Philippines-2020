geoJson = await FileAttachment("philippines-region.json").json()

ph_map = {
  const svg = d3
    .create('svg')
    .attr('width', renderData.width)
    .attr('height', renderData.height);
  
  svg.append("g")
  .attr("class", "legend_auto")
  .style('font-size', 12)
  .style('font-family', 'sans-serif')
  .attr("transform", "translate(10,20)")
  .call(legend_svg)
  
  svg.selectAll('.label')
      .attr("transform", "translate(20, 13)")
  
  const circle = d3.symbol().type(d3Legend.symbolCircle);
  const symbolScale =  d3.scaleOrdinal()
    .domain(['SM Supermall',])
    .range([ circle] );
  
  
  const margin_top_legend = 70;
  const margin_right_legend = 250;
  svg.select(".legend_auto")
     .attr("transform", `translate(${width-margin_right_legend},${margin_top_legend})`)

  const clippedWidth = renderData.width - renderData.margin * 2;
  const clippedHeight = renderData.height - renderData.margin * 2;

  const geoMercator = d3
    .geoMercator()
    // the center uses longtitude and latitude
    // get Long/Lat data from google maps
    .center([128, 36])
    .fitSize([clippedWidth, clippedHeight], geoJson);

  const pathGen = d3.geoPath(geoMercator);
  const stage = svg
    .append('g')
    .attr('transform', `translate(${renderData.margin},${renderData.margin})`);

  const textX = 10;
  const textY = 10;
  const infoText = stage
    .append('g')
    .attr('transform', `translate(${textX},${textY})`)
    .append('text')
    .style("font", "20px sans-serif");
  infoText.text('no data');

  const onMouseHover = d => {
    stage
      .selectAll('.geopath')
      .filter(td => td.properties.ADM1_EN === d.properties.ADM1_EN)
      .transition()
      .duration(250)
      .attr('fill',  "rgba(255,69,0,0.5)")
      .style('transform-origin', "center center")
      .style('transform', "scale(1.02)")
      .style("mix-blend-mode", "darken");
    infoText.text(d.properties.ADM1_EN);
    tooltip.html(`<div> <strong>Region: </strong>${d.properties.ADM1_EN}</div>
                <div> <strong>Population: </strong>${population_format(d.properties.population)}</div>`)
            .style('visibility', 'visible');
  };
  
  const onMouseMove = d => {
    tooltip
            .style('top', d3.event.pageY - 10 + 'px')
            .style('left', d3.event.pageX + 10 + 'px');
  }

  const onMouseLeave = d => {
    stage
      .selectAll('.geopath')
      .filter(td => td.properties.ADM1_EN === d.properties.ADM1_EN)
      .transition()
      .duration(250)
      .attr('fill',  td => colorScale(td.properties.population))
      .style('transform-origin', "center center")
      .style('transform', "scale(1)")
      .attr('stroke-width' , 1);
    infoText.text('Hover on a region');
    tooltip.html(``).style('visibility', 'hidden');
  };

  const tEnter = enter =>
    enter
      .append('path')
      .attr('d', pathGen)
      .attr('stroke', 'white')
      .attr('fill', td => colorScale(td.properties.population))
      .classed('geopath', true)
      .on('mouseenter', onMouseHover)
      .on('mousemove', onMouseMove)
      .on('mouseleave', onMouseLeave);
  const tUpdate = null;
  const tExit = null;
  stage
    .selectAll('.geopath')
    .data(geoJson.features)
    .join(tEnter, tUpdate, tExit);

  return svg.node();
}

loaded_data = {
  const text = await FileAttachment("philippine_region_population-4.csv").text();
  return d3.csvParse(text, ({Location, Population}) => ({
    location: Location,
    population: +Population
  }));
}

{
  var country_population_dict = {};
  loaded_data.map((e,i) => { country_population_dict[e.location]=e.population});
  //console.log(country_population_dict["Region I"]);
  for (var property in geoJson.features) {
  if (geoJson.features.hasOwnProperty(property)) {
    geoJson.features[property].properties.population = country_population_dict[geoJson.features[property].properties.ADM1_EN];
     //console.log(geoJson.features[property].properties);
  }
}
}

legend_svg = {
  const svg = d3.select(DOM.svg(500, 500))
            
   const scale = d3.scaleOrdinal()
  .domain(["Bike", "Run", "Walk"])
  .range(["#8242a8", "#ff1493", "#FFCE1E"]);
 
  var sequentialScale = d3.scaleSequential(d3.interpolateYlOrRd)
  .domain([0,d3.max(loaded_data, d => d.population)]);

svg.append("g")
  .attr("class", "legendSequential")
  .attr("transform", "translate(20,20)");

var legendSequential = d3Legend.legendColor()
    .shapeHeight(15)
    .shapePadding(20)
    .orient("vertical")
    .labelOffset(20)
    .cells(10)
    .labelFormat(population_format)
    .scale(sequentialScale) 
  
  /**
  svg.append("g")
  .attr("class", "legend_auto")
  .style('font-size', 12)
  .style('font-family', 'sans-serif')
  .attr("transform", "translate(10,20)")
  .call(legendSequential)
  
  console.log(svg.selectAll('.label'))
  svg.selectAll('.label')
      .attr("transform", "translate(20, 13)")
  **/
  return legendSequential
}

d3 = require("d3@v5")

d3Legend = require("d3-svg-legend")

colorScale = d3.scaleSequential([0, d3.max(loaded_data, d => d.population)],  d3.interpolateYlOrRd)

height = 500;

topojson = require("topojson-server@3", "topojson-client@3", "topojson-simplify@3")

color = '#69b3a2'

population_format = d3.format(".2s")

renderData = ({
  width: 750,
  height: 1000,
  margin: 50,
})

tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('padding', '10px')
    .style('background-color', 'rgba(255,255,255,0.90)')
    .style('border-radius', '10px')
    .style('-webkit-border-radius', '10px')
    .style('box-shadow', '0 0 2px 0px white inset, 0 0 1px 0px black')
    .style('color', "rgba(200, 69, 0, 1)")
    .style('font-family','sans-serif')
    .text('a simple tooltip');
