// D3 line chart to show a teams own DF during the season.
// Relies on localstorage being present and filled.

let data 	= [] ;

// set the dimensions and margins of the graph
let margin 	=	{
					'top': 10, 
					'right': 5, 
					'bottom': 5, 
					'left': 10
				};

let barwidth 	= parseInt( 800 - ( margin.left + margin.right  ) ) ;
let barheight 	= parseInt( 225 - ( margin.top  + margin.bottom ) ) ;

let svgwidth 	= parseInt( barwidth  + margin.left + margin.right  ) ;
let svgheight 	= parseInt( barheight + margin.top  + margin.bottom ) ;


hasBarChartStore = ()=>{
	return (localStorage.tmdfbarchart.length > 0 );
}


makeChart = ()=>{

	if( localStorage.tmdfbarchart.length > 0  ){

		data = JSON.parse( localStorage.tmdfbarchart ) ;
		console.log("data len = ", data.length );
		d3.select(".activeBarChartTeamSvg").remove();

		// append the svg object to the body of the page
		let svg	= 	d3.select("#activeBarChartTeam").append("svg")
						.attr("class", "activeBarChartTeamSvg")
						.attr("width", svgwidth )
						.attr("height", svgheight )
						// .attr("style", "z-index:2")
						
		svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;

		( data )=> {

			// Add X axis 
			let x 	=	d3.scaleLinear()
							.domain( [ 1, 38 ] )
							.range([ 0, barwidth ])
						;

			svg.append("g")
				.attr("transform", "translate(0," + barheight + ")" )
				.call( d3.axisBottom(x) )
			;

			// Add Y axis
			let y	= 	d3.scaleLinear()
							.domain( [ 1, 5 ] )
							.range([ barheight, 0 ])
						;

			svg.append("g")
				.call(d3.axisLeft(y))
			;

			// Add the line
			svg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-width", 1.5)
				.attr("d", d3.line()
					.x(function(d) { return x(d.gw) })
					.y(function(d) { return y(d.df) })
				)
			;
		}

	}else{ 
		console.log("No Barchart data in localStorage", localStorage.tmdfbarchart.length ) ;
	}

}

makeChart();
