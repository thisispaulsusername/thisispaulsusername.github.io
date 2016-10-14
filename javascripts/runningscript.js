// http://stackoverflow.com/questions/7124778/how-to-match-anything-up-until-this-sequence-of-characters-in-a-regular-expres
// data.pace = +/.+?(?=:)/.exec(row.Pace)[0];
// data.pace = row.Pace.match(/.+:/);

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 
});

var runs = [];

var margins = {'top' : 20, 'right' : 20, 'bottom' : 50, 'left' : 70};
var height = 500;
var width = 960;
var plotHeight = height - margins.top - margins.bottom;
var plotWidth = width - margins.right - margins.left;

var x = d3.scaleLinear()
	.domain([0,365])
	.range([margins.left, plotWidth]);

var y = d3.scaleLinear()
	.domain([3,7])
	.range([plotHeight,margins.top]);

var r = d3.scaleSqrt()
	.domain([0,10])
	.range([1,10]);

var monthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
var monthAbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var months = [];

for (var i = 0; i < monthDays.length; i++) {
	months.push({"val" : monthDays[i].toString(), "key" : monthNames[i]})
}


var m = d3.scaleOrdinal()
	.domain(months.map(function(d) { return d.value}))
	.range(months.map(function(d) { return d.key}))
// 	.range(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
	// .rangePoints(monthDays);

months.map(function(d) { return d})

// var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
    // yAxis = d3.svg.axis().scale(yScale).orient("left");

/**
 * Draws the chart using svg.
 * @param {Object[]} data - running data
 */

function draw(data) {

	runs = getRuns(data);

	var svg = d3.select('.svg').attr('width',width).attr('height',height);

	// title
	// svg.append("text")
 //        .attr("x", (width / 2))             
 //        .attr("y", 0 + (margins.top))
 //        .attr("text-anchor", "middle")  
 //        .style("font-size", "1ipx") 
 //        .style("text-decoration", "underline")  
 //        .text("Running Log");

	// x-axis
	svg.append('g').attr('transform', 'translate(0,' + plotHeight + ')').call(d3.axisBottom(x).tickValues(monthDays).tickFormat(function(d,i){ return monthAbr[i]}));

	// y-axis
	svg.append('g').attr('transform', 'translate(' + margins.left + ',0)').call(d3.axisLeft(y).tickFormat(function(d) { 
		var min = Math.floor(d / 1);
		var sec = d % 1 * 60;
		var filler = sec < 10 ? ':0' : ':';
		return min + filler + sec;
	}));

	svg.append('text')
		.attr('transform', 'translate(' + (plotWidth/2 + margins.left) + ' ,' + (height - margins.top) + ')')
		.style('text-anchor', 'middle')
		.text('Date');

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", margins.left / 3)
		.attr("x",0 - (plotHeight / 2))
		.style("text-anchor", "middle")
		.text("Pace (min/km)"); 



	// plot the data (an array) with the longest runs first (so that smaller circles (short runs) are drawn on top of larger ones) if it only contains the running data 
	// plot the data (an object) in chronological order if there is aggregate yearly data
	if(Array.isArray(runs)) {
		var years = [];
		for (var run in runs) {
			var thisYear = runs[run].date.getFullYear();
			if (!years.includes(thisYear)) {
				years.push(thisYear);
			}
		}
		years.sort();
		plotAll(svg, runs, years);
	}
	else {
		runs.years.forEach(function(year) {
			plotYear(svg, runs, year);
		});
	}


	$("svg circle").tooltip({
        'container': 'body',
        'placement': 'bottom'
    });

    $("svg polygon").tooltip({
        'container': 'body',
        'placement': 'bottom'
    });
}

d3.csv("./data/all.csv", draw);

/**
 * Transforms the running data into an object that will be used to plot the data
 * @param {Object[]} data - running data
 * @return {Object} sortedRuns - contains runs sorted by year and info for each year
 */

function getRuns(data) {

	var runs = [];
	var colonIndex = 0;

	data.forEach(function(row) {

		// if I ran that day, grab the relevant info
		if (row.Dist && row.Date) {
			var data = {};
			var timeString = !row["Start Time"] ? '' : ' ' + row["Start Time"];
			data.date = new Date(row.Date + timeString);
			data.dist = +row.Dist;
			data.duration = +row.Duration;
			colonIndex = row.Pace.indexOf(':');
			data.pace = +row.Pace.slice(0, colonIndex) + +row.Pace.slice(colonIndex + 1) / 60;		
			data.speed = +row.Speed;
			data.race = row.Race
			data.temp = +row.Temp
			runs.push(data);
		}
	});

	var sortedRuns = runs.sort(
		function(a, b) {
			return b.dist - a.dist;
		}
	);

	// var sortedRuns = sortRuns(runs);

	return sortedRuns;
}

/**
 * Separates the runs into groups for each year
 * @param {Object[]} runs - running data with only certain fields
 * @return {Object} sortedRuns - contains runs sorted by year and info for each year
 */

function sortRuns(runs) {

	var numRuns = runs.length;
	var sortedRuns = {'years' : [], 'avgTemp' : {} };
	var thisYear = '0';
	var year;
	var temp = 0
	var tempCount = 0;

	for (var i = 0; i < numRuns; i++) {
		year = runs[i].date.getFullYear();
		if (year !== thisYear) {
			if (runs[i].temp) {
				temp += runs[i].temp;
				tempCount++;
				sortedRuns.avgTemp[thisYear] = temp/tempCount;
			}
			temp = 0;
			tempCount = 0;
			thisYear = year;
			sortedRuns.years.push(thisYear);
			sortedRuns[thisYear] = [];
		}

		sortedRuns[thisYear].push(runs[i]);
		
		if (runs[i].temp) {
			temp += runs[i].temp;
			tempCount++;
		}
	}

	// add last year's temperature
	sortedRuns.avgTemp[thisYear] = temp/tempCount;

	return sortedRuns;
}

/**
 * Plots runs from all years starting with the smallest run
 * @param {???} svg - the svg element to which data is appended
 * @param {Object} runs - running data for all years
 * @param {number[]} years - the years for which there is running data
 */

function plotAll(svg, runs, years) {

	runs.forEach(function(row) {
		var day = row.date.getDate();
		var month = row.date.getMonth();
		var year = row.date.getFullYear();
		var leap = year % 4 === 0 && month > 1 ? 1 : 0;
		var daysIntoYear = monthDays[month] + day + leap;

		// string representation of data for tooltips
		var dateString = monthNames[row.date.getMonth()] + ' ' + row.date.getDate() + ' ' + row.date.getFullYear();
		var minuteString = Math.floor(row.pace / 1).toString();
		var secondString = Math.round(row.pace % 1 * 60).toString();
		secondString = secondString.length === 1 ? '0' + secondString : secondString;
		var paceString = minuteString + ':' + secondString + ' min/km';

		if (!row.race) {
			svg.append('circle')
				.attr('class', year)
				.attr('r', r(row.dist))
				.attr('fill', getColor(year, years, 0.3))
				.attr('stroke','rgba(0,0,0,0.3)')
				.attr('cx', x(daysIntoYear))
				.attr('cy', y(row.pace))
				.attr('title', 'Date: ' + dateString + '\nPace: ' + paceString + '\nDist ' + row.dist + ' km');
		}
		if (row.race) {
			var cX = x(daysIntoYear);
			var cY = y(row.pace);
			var rS = r(row.dist);
			var side = rS * Math.cos(18/180*Math.PI); 
			var pentBisectRad = rS * Math.sin(18/180*Math.PI);
			var pentCornRad = pentBisectRad / Math.cos(36/180*Math.PI);
			var star = [{'x':cX, 'y':cY - rS},
						{'x':cX + pentCornRad * Math.sin(36/180*Math.PI), 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)},
						{'x':cX + side, 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)},
						{'x':cX + pentCornRad * Math.cos(18/180*Math.PI), 'y':cY + pentCornRad * Math.sin(18/180*Math.PI)},
						{'x':cX + rS * Math.sin(36/180*Math.PI), 'y':cY + rS * Math.cos(36/180*Math.PI)},
						{'x':cX, 'y':cY + pentCornRad},
						{'x':cX - rS * Math.sin(36/180*Math.PI), 'y':cY + rS * Math.cos(36/180*Math.PI)},
						{'x':cX - pentCornRad * Math.cos(18/180*Math.PI), 'y':cY + pentCornRad * Math.sin(18/180*Math.PI)},
						{'x':cX - side, 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)},
						{'x':cX - pentCornRad * Math.sin(36/180*Math.PI), 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)}];

			var starString = star.map(function(p) {
				return [p.x,p.y].join(',');
			}).join(', ');

			svg.append('polygon')
				.attr('class', year)
				.attr('points', starString)
				.attr('fill', getColor(year, years, 0.3))
				.attr('stroke','rgba(0,0,0,0.9)')
				.attr('title', 'Date: ' + dateString + '\nPace: ' + paceString + '\nDist: ' + row.dist + ' km' + '\n' + row.race + ' ' + year);
		}		
	});	

	for (var index in years) {
		var year = years[index];
		$('.options').append('<div class="checkbox-inline ' + 'checkbox-' + year + '" style="color:' + getColor(year, years, 1.0) + '"><label><input type="checkbox" name="'+year+'" value="one" checked>'+year+'</label></div>');
		$('input[type=checkbox]').change(function() {
			var yearData = '.' + this.name;
			var checkbox = '.checkbox-' + this.name;
			if (this.checked) {
				($(yearData)).show();
				$(checkbox).css('color', getColor(this.name, years, 1.0));
			}
			else {
				($(yearData)).hide();
				$(checkbox).css('color', '#999');
			}
		});
	}
}

/**
 * Plots a given year
 * @param {???} svg - the svg element to which data is appended
 * @param {Object} runs - running data for all years
 * @param {number} year - the year that is being plotted
 */

function plotYear(svg, runs, year) {

	var yearRuns = runs[year];
	yearRuns.forEach(function(row) {
		var day = row.date.getDate();
		var month = row.date.getMonth();
		var leap = year % 4 === 0 && month > 1 ? 1 : 0;
		var daysIntoYear = monthDays[month] + day + leap;

		// string representation of data for tooltips
		var dateString = monthNames[row.date.getMonth()] + ' ' + row.date.getDate() + ' ' + row.date.getFullYear();
		var minuteString = Math.floor(row.pace / 1).toString();
		var secondString = Math.round(row.pace % 1 * 60).toString();
		secondString = secondString.length === 1 ? '0' + secondString : secondString;
		var paceString = minuteString + ':' + secondString + ' min/km';

		if (!row.race) {
			svg.append('circle')
				.attr('class', year)
				.attr('r', r(row.dist))
				.attr('fill', getColorRelative(runs.years.indexOf(year), runs.avgTemp[year], row.temp))
				.attr('stroke','rgba(0,0,0,0.3)')
				.attr('cx', x(daysIntoYear))
				.attr('cy', y(row.pace))
				.attr('title', 'Date: ' + dateString + '\nPace: ' + paceString + '\nDist ' + row.dist + ' km');
		}
		if (row.race) {
			var cX = x(daysIntoYear);
			var cY = y(row.pace);
			var rS = r(row.dist);
			var side = rS * Math.cos(18/180*Math.PI); 
			var pentBisectRad = rS * Math.sin(18/180*Math.PI);
			var pentCornRad = pentBisectRad / Math.cos(36/180*Math.PI);
			var star = [{'x':cX, 'y':cY - rS},
						{'x':cX + pentCornRad * Math.sin(36/180*Math.PI), 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)},
						{'x':cX + side, 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)},
						{'x':cX + pentCornRad * Math.cos(18/180*Math.PI), 'y':cY + pentCornRad * Math.sin(18/180*Math.PI)},
						{'x':cX + rS * Math.sin(36/180*Math.PI), 'y':cY + rS * Math.cos(36/180*Math.PI)},
						{'x':cX, 'y':cY + pentCornRad},
						{'x':cX - rS * Math.sin(36/180*Math.PI), 'y':cY + rS * Math.cos(36/180*Math.PI)},
						{'x':cX - pentCornRad * Math.cos(18/180*Math.PI), 'y':cY + pentCornRad * Math.sin(18/180*Math.PI)},
						{'x':cX - side, 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)},
						{'x':cX - pentCornRad * Math.sin(36/180*Math.PI), 'y':cY - pentCornRad * Math.cos(36/180*Math.PI)}];

			var starString = star.map(function(p) {
				return [p.x,p.y].join(',');
			}).join(', ');

			svg.append('polygon')
				.attr('class', year)
				.attr('points', starString)
				.attr('fill', getColorRelative(runs.years.indexOf(year), runs.avgTemp[year], 0))
				.attr('stroke','rgba(0,0,0,0.9)')
				.attr('title', 'Date: ' + dateString + '\nPace: ' + paceString + '\nDist: ' + row.dist + ' km' + '\n' + row.race + ' ' + year);
		}		
	});	

	$('.options').append('<div class="checkbox-inline ' + 'checkbox-' + year + '" style="color:' + getColor(year, years, 1.0) + '"><label><input type="checkbox" name="'+year+'" value="one" checked>'+year+'</label></div>');
	$('input[type=checkbox]').change(function() {
		var year = '.' + this.name;
		var checkbox = '.checkbox-' + this.name;
		if (this.checked) {
			($(year)).show();
			$(checkbox).css('color', getColor(year, years, 1.0));
		}
		else {
			($(year)).hide();
			$(checkbox).css('color', '#999');
		}
	});
}

/**
 * not yet implemented
 * Assigns a color based on the year of the run
 * @param {number} year - the year of the run
 * @param {number[]} year - the years for which there is running data
 * @param {number} opacity - the desired opacity of the color
 * @return {string} color
 */

function getColor(year, years, opacity) {
	var firstYear = years[0]; // since years are sorted in ascending order
	var yearIndex = year - firstYear;
	// console.log(year);
	var colorValues = [[256, 0, 0], [0, 256, 0], [0, 0, 256], [256, 256, 0], [256, 0, 256], [0, 256, 256], [256, 256, 256]];
	// var yearColor = colorValues[yearIndex];
	// for (var hue in yearColor) {
	// 	if (yearColor[hue]) {
	// 		// yearColor[hue] += increment;
	// 	}
	// }
	// console.log(yearIndex);
	var colorString = 'rgba(' + colorValues[yearIndex].join() + ',' + opacity + ')';
	return colorString;
}

/**
 * not yet implemented
 * Modifies the color based on how much the run's temperature deviated from the yearly average 
 * @param {number} yearIndex - a number corresponding to the current year with 0 representing the earliest year
 * @param {number} avgTemp - the average temperature for all runs that year (in degrees Celsius)
 * @param {number} temp - the temperature during the given run (in degrees Celsius)
 * @return {string} color
 */

function getColorRelative(yearIndex, avgTemp, temp) {
	var increment = Math.round(temp);
	var colorValues = [[256, 0, 0], [0, 256, 0], [0, 0, 256], [256, 256, 0], [256, 0, 256], [0, 256, 256], [256, 256, 256]];
	// var yearColor = colorValues[yearIndex];
	// for (var hue in yearColor) {
	// 	if (yearColor[hue]) {
	// 		// yearColor[hue] += increment;
	// 	}
	// }
	var colorString = 'rgba(' + colorValues[yearIndex].join() + ',0.3)';
	return colorString;
}