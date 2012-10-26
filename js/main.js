(function() {
	// Set up the dimensions
	var margin = { top: 20, right: 60, bottom: 60, left: 100 },
		width = benefits.clientWidth - margin.left - margin.right,
		height = benefits.clientHeight - margin.top - margin.bottom;

	// Groups for the different charts
	var svg = d3.select('#benefits')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		

	var data = [];

	// Layout for the balloon svg
	var x = d3.scale.linear().range([0, width]),
		y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom'),
		yAxis = d3.svg.axis().scale(y).orient('left');

	d3.selectAll('select').on('change', invalidate);

	invalidate();

	function invalidate(e) {
		data = INCENTIVES.filter(function (el) {
			return ((gender.value === 'both' || el.gender === gender.value) &&
				(attainment.value === 'both' || el.attainment === attainment.value));
		});

		x.domain([0, d3.max(data, function (d) { return Math.abs(d.private_costs); })]);
		xAxis.tickValues(data.map(function (d) { return Math.abs(d.private_costs); }));

		y.domain([0, d3.max(data, function (d) { return d.private_benefits; })]);
		yAxis.tickValues(data.map(function (d) { return d.private_benefits; }));

		var circles = svg.selectAll('circle')
			.data(data, function (d) { return d.country + d.gender + d.attainment; });

		circles.enter().append('circle')
			.attr('r', 5)
			.attr('class', function (d) { return d.attainment + '_' + d.gender; })
			.on('mouseover', function (d) {
				circles.filter(function (c) { return d.country !== c.country; })
					.transition().duration(750)
					.attr('opacity', 0.2);
				console.log(d.country + ' ' + d.private_npv);
			})
			.on('mouseout', function (d) { circles.transition().duration(750).attr('opacity', 1); });

		circles.transition().duration(500)
			.attr('cx', function (d) { return x(Math.abs(d.private_costs)); })
			.attr('cy', function (d) { return y(d.private_benefits); });

		circles.exit()
			.transition().duration(750)
			.attr('r', 0)
			.remove();

		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis);

		svg.append('g')
			.attr('class', 'y axis')
			.call(yAxis);

		svg.selectAll('.x text')
			.style('display', function (d) { return (d === x.domain()[1]) ? null : 'none'; });

		svg.selectAll('.y text')
			.style('display', function (d) { return (d === y.domain()[1]) ? null : 'none'; });
	}
})();
