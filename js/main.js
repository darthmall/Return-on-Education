(function($) {
	// Set up the dimensions
	var margin = { top: 10, right: 10, bottom: 100, left: 100 },
		padding = {top: 5, right: 5, bottom: 15, left: 5},
		width = benefits.clientWidth - margin.left - margin.right,
		height = benefits.clientHeight - margin.top - margin.bottom,
		QUANTILES = 4;

	// Create a scale for the area of the triangle based on the width of the SVG
	var area = d3.scale.linear().range([0, Math.PI * Math.pow(30, 2)]),
		color = d3.scale.quantile().range(d3.range(QUANTILES)),
		x = d3.scale.linear().range([0, width / 2]),
		y = d3.scale.linear().range([height, 0]);

	// Groups for the different charts
	var svg = d3.select('#benefits')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var force = d3.layout.force()
		.charge(function (d) {
			return (d['net present value'] < 0) ? 0 : -Math.pow(d.radius, 2) / 8;
		})
		.size([width, height]);

	d3.csv('data/incentives.csv', function (csv) {

		// Filter out only the rows we want
		var data = csv.filter(function (d) {

			// Does this row match our filter criteria?
			var include = (d.sector === sector.value &&
				(attainment.value === 'both' || d.attainment === attainment.value) &&
				(gender.value === 'both' || d.gender === gender.value));

			return include && !isNaN(d['net present value']) && !isNaN(d['total costs']);
		});

		// Set up domains for NPV and total costs
		area.domain([0, d3.max(data, function (d) { return +d['net present value']; })]);
		color.domain(d3.extent(data, function (d) { return +d['total costs']; }));
		x.domain(d3.extent(data, function (d) { return +d['net present value']; }));
		y.domain(d3.extent(data, function (d) { return Math.abs(+d['total costs']); }));

		var medianNPV = d3.median(data, function (d) { return +d['net present value']; });

		// Convert the properties we're using to numbers.
		data.forEach(function (d) {
			for (var k in d) {
				if (d.hasOwnProperty(k)) {
					var v = +d[k];

					if (!isNaN(v)) {
						d[k] = v;
					}
				}
			}

			if (Math.random() <= 0.5) {
				d.x = x(d['net present value']);
			} else {
				d.x = width - x(d['net present value']);
			}

			d.y = y(Math.abs(d['total costs']));
			d.radius = Math.sqrt(area(d['net present value']));
			d.id = [d.country, d.attainment, d.gender].join('-').replace(/\s+/g, '_');
		});

		data.sort(function (a, b) { return a['net present valeu'] - b['net present value']; });

		var circle = svg.selectAll('circle').data(data);
		circle.enter().append('circle')
			.attr('class', function (d) {
				return 'q' + (color(d['total costs']) + 1) + '-' + (QUANTILES + 1);
			})
			.attr('cx', function (d) { return d.x; })
			.attr('cy', function (d) { return d.y; })
			.on('mouseover', showTooltip)
			.on('mouseout', hideTooltip);

		circle.transition().duration(750)
			.attr('cx', function (d) { return d.x; })
			.attr('cy', function (d) { return d.y; })
			.attr('r', function (d) { return d.radius; });

		force.nodes(data)
			.on('tick', function (e) {
				var q = d3.geom.quadtree(data),
					i = 0,
					n = data.length;

				while (++i < n) {
					q.visit(collide(data[i]));
				}

				svg.selectAll('circle')
					.each(buoancy(e.alpha))
					.attr('cx', function (d) { return d.x; })
					.attr('cy', function (d) { return d.y; });
			});

			force.start();
	});

	function showTooltip(d) {
		var offset = $('svg').offset();

		var tooltip = $('<div></div>', {
			'id': d.id,
			'class': 'tooltip'
		});

		$('<h3>' + d.country + '</h3>', {'class': 'country'}).appendTo(tooltip);
		$('<table><tr /><tr /><tr /></table>').appendTo(tooltip);

		tooltip.find('tr').append(function (index, html) {
			switch (index) {
				case 0:
					return '<td class="attainment">' + d.attainment + '</td>' +
						'<td class="gender">' + d.gender + '</td>';

				case 1:
					return '<td>Net Present Value</td><td class="npv">' +
						dollars(d['net present value']) + '</td>';

				case 2:
					return '<td>Total Costs</td><td class="costs">' +
						dollars(d['total costs']) + '</td>';

				default:
					return '';
			}
		});

		tooltip.appendTo('body');
		tooltip.offset({
			left: offset.left + d.x,
			top: offset.top + d.y - tooltip.outerHeight() - d.radius * 0.6
		});

	}

	function hideTooltip(d) {
		$('#' + d.id).remove();
	}

	function sortCost(alpha) {
		var that = this;

		return function (d) {
			d.y = d.y + (d.targetY - d.y) * (force.gravity() + 0.02) * alpha;
		};
	}

	function buoancy(alpha) {
		var that = this;

		return function (d) {
			var center = height / 2;
			var targetY = center - (color(d['total costs']) - QUANTILES / 2) / (QUANTILES / 2) * center;

			d.y = d.y + (targetY - d.y) * (force.gravity() + 0.02) * Math.pow(alpha, 3) * 100;
		};
	}

	function collide(d) {
		var r = d.radius + 16,
			nx1 = d.x - r,
			ny1 = d.y - r,
			nx2 = d.x + r,
			ny2 = d.y + r;

		return function (quad, x1, y1, x2, y2) {
			if (quad.point && quad.point !== d) {
				var x = d.x - quad.point.x,
					y = d.y - quad.point.y,
					l = Math.sqrt(x * x + y * y),
					r = d.radius + quad.point.radius;

				if (l < r) {
					l = (l - r) / l * 0.5;

					d.x -= x *= l;
					d.y -= y *= l;

					quad.point.x += x;
					quad.point.y += y;
				}

				return x1 > nx2 ||
					x2 < nx1 ||
					y1 > ny2 ||
					y2 < ny1;
			}
		};
	}

	function dollars(x) {
		var format = d3.format(',.0f');

		return '$' + format(x);
	}

})(jQuery);
