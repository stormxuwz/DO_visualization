var DO_data;
var map;
var overlay;
var initialTime;
var station_ts;
var year
var myData;


// Tooltip code is modified from http://bl.ocks.org/biovisualize/1016860
var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "20")
	.style("visibility", "hidden")
	.text("a simple tooltip")
	.style("stroke","red");


function init(){
	// Create Map
	var station_position;

	d3.json("./queryStation/2014", function(error, json) {
  		if (error) return console.warn(error);
  		station_position = json;
  		station_entries=d3.entries(station_position);
	});
	

	map = new google.maps.Map(d3.select("#map").node(), {
		zoom: 8,
		center: new google.maps.LatLng(42.054393, -81.386539),  
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		streetViewControl: false,
		panControl: false,
	});
	
	overlay = new google.maps.OverlayView();

	overlay.onAdd = function() {
		layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
	        .attr("class", "stations");

	    overlay.draw = function() {
		     var projection = this.getProjection(),
		          padding =20;

		     var marker = layer.selectAll("svg")
		          .data(station_entries)
		          .each(transform) // update existing markers
		          .enter().append("svg:svg")
		          .each(transform)
		          .attr("class", "marker")
		         
		     marker.append("svg:circle")
		          .attr("r", 10)
		          .attr("cx", padding)
		          .attr("cy", padding)
		          
		          .on("click", function(d,i){ // Function to show the time series
					d3.select(this).style("stroke","red").style("stroke-width","3px");
					d3.select("#stationName").text("logger_"+station_entries[i].key);
					showTimeSeries(station_entries[i].key);
				});

		      marker.append("svg:text")
		          .attr("x", padding + 15)
		          .attr("y", padding)
		          .attr("dy", ".31em")
		          .text(function(d) {return "logger_"+d.key; });
	          
		      function transform(d) {
		        d = new google.maps.LatLng(d.value[1], d.value[0]);
		        d = projection.fromLatLngToDivPixel(d);
		        // console.log(d.y);
		        return d3.select(this)
		            .style("left", (d.x - padding) + "px")
		            .style("top", (d.y - padding) + "px");
		      }
	   	};
	}


	overlay.setMap(map);
	console.log("map finished");

	// Create Time series template

	var margin = {top: 20, right: 20, bottom: 30, left: 50};
	var width=$("#timeSeriesSVG").width();
	var height=450;
	var padding = 40;

	var x=d3.time.scale()
    	.range([padding, width-padding*2]);

	var y = d3.scale.linear()
    	.range([height-2*padding, padding]);

	var xAxis = d3.svg.axis()
    	.scale(x)
    	.ticks(5)
    	.orient("bottom");

	var yAxis = d3.svg.axis()
    	.scale(y)
    	.ticks(5)
    	.orient("left");

	var svg = d3.select("#timeSeries")
    	.attr("width", width)
    	.attr("height", height)
  		.append("g")
  		.attr("id","ts_plot")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	svg.append("g") // x axis
	  .attr("id","xaxis")
	  .attr("class", "axis")
	  .attr("transform", "translate(0," + (height-padding) + ")")
	  .call(xAxis)

	  .append("text")
	  .text("Time");

  	svg.append("g") // y axis
  	  .attr("id","yaxis")
      .attr("class", "axis")
      .call(yAxis)
    	.append("text")
      	.attr("transform", "rotate(-90)")
      	.attr("y", 6)
      	.attr("dy", ".71em")
      	.style("text-anchor", "end")
      	.text("DO (mg/L)");

}

function changeColor(data){
	var scale = chroma.scale(['red', 'yellow', 'blue']).domain([0, 12]);

	if($('#variance').prop('checked')){
		var scale = chroma.scale(['red', 'yellow', 'blue']).domain([0, 2]);
	}

	if($('#temporal_relative').prop('checked')){
		var scale = chroma.scale(['red', 'yellow', 'blue']).domain([0, 1]);
	}

	var circles=d3.select(overlay.getPanes().overlayMouseTarget).selectAll("circle");

	circles.data(data,function())
		.transition()
		.duration(transtion_time)
		.style("fill",function(d) {return scale(d).toString()});

	d3.select(overlay.getPanes().overlayMouseTarget)
	.selectAll("text")
	.data(data)
	.text(function(d) {return String(d.toFixed(2))});


	circles
	.on("mouseover", function(d){
		return tooltip.text(String(d.toFixed(2))).style("visibility", "visible");
	})
	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	.on("mouseout", function(){return tooltip.style("visibility", "hidden");})
	
	.on("click", function(d,i){
		// Function to show the time series
		circles.style("stroke","black").style("stroke-width","1.5px");
		d3.select(this).style("stroke","red").style("stroke-width","3px");
		station_ts=station_entries[i].key;
		d3.select("#stationName").text("logger_"+station_ts);
		showTimeSeries(station_entries[i].key);
	});
}


function changeData(time,transtion_time) {
	var timeRange = {"startTime":time.getTime()-1000*60*5+1,"endTime":time.getTime()+1000*60*5-1};
	$.ajax({
            url: '/queryDO',
            data: JSON.stringify(timeRange, null, '\t'),
            type: 'POST',
            contentType: 'application/json;charset=UTF-8',
            success: function(response) {
            	myData=jQuery.parseJSON(response);
            	changeColor(myData)
            },
            error: function(error) {
                console.log(error);
            }
    });	
}


function showTimeSeries(stationName){
	
	var start_time=new Date($("#start_time").val());
	var end_time=new Date($("#end_time").val());

	var margin = {top: 20, right: 20, bottom: 30, left: 50};
	var width=$("#timeSeriesSVG").width();
	var height=450;
	var padding = 40;

	var start_diffTime=start_time-initialTime;
	var end_diffTime=end_time-initialTime;

	var start_row_index=start_diffTime/(60*10*1000);
	var end_row_index=end_diffTime/(60*10*1000);

	if(end_row_index>DO_data.Index.length-1){
		end_row_index=DO_data.Index.length-1;
	}

	var x=d3.time.scale()
    	.range([padding, width-padding*2]);

	var y = d3.scale.linear()
    	.range([height-2*padding, padding]);

	var xAxis = d3.svg.axis()
    	.scale(x)
    	.ticks(5)
    	.orient("bottom");

	var yAxis = d3.svg.axis()
    	.scale(y)
    	.ticks(5)
    	.orient("left");

	var line = d3.svg.line()
    	.x(function(d) {  
        	return x(d.time);  
    	})

    	.y(function(d) { 
        	return y(d.DO);  
      	});

    var showDate = d3.time.format("%m/%d/%y %H:%M");

    var DO=[];

    // console.log([start_row_index,end_row_index]);
	
	for(var i=start_row_index;i<end_row_index+1;i++){
		DO.push({"time":new Date(DO_data.Time[i]*1000),"DO":DO_data["logger_"+stationName][i]});
	}	
	// console.log(DO);

	var svg = d3.select("#timeSeries").select("#ts_plot");
	
   	x.domain(d3.extent(DO, function(d) { return d.time; }));
  	y.domain(d3.extent(DO, function(d) { return d.DO; }));
    
	svg.select("#xaxis") // x axis
	  .attr("class", "axis")
	  .attr("transform", "translate(0," + (height-padding) + ")")
	  .call(xAxis)
	  .append("text")
	  .text("Time");

  	
  	svg.select("#yaxis")// y axis
      .attr("class", "axis")
      .call(yAxis)
    	.append("text")
      	.attr("transform", "rotate(-90)")
      	.attr("y", 6)
      	.attr("dy", ".71em")
      	.style("text-anchor", "end")
      	.text("DO (mg/L)");

    d3.selectAll("path.line").remove();


    var circle=svg.selectAll("circle").data(DO)
    	circle.enter()
    	.append("circle");

    circle
    	.attr("cx",function(d){return x(d.time)})
    	.attr("cy",function(d){return y(d.DO)})
    	.attr("r",function(d){return 3})

    	.on("mouseover", function(d){
			return tooltip.text(String(d.DO.toFixed(2))+" at "+showDate(d.time))
							.style("visibility", "visible");
		})
		.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
		.on("mouseout", function(){return tooltip.style("visibility", "hidden");});

	circle.exit().remove()

    svg.append("path")
      	.datum(DO)
      	.attr("class", "line")
      	.attr("d", line);


	console.log(stationName);
}



$(document).ready(function(){
	d3.json("static/test.json",function(data){
		DO_data=data;
		initialTime=new Date(DO_data["Time"][0]*1000);
		init();
	});
});
