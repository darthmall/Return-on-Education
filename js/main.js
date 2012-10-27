(function() {
	// Set up the dimensions
	var margin = { top: 10, right: 10, bottom: 100, left: 100 },
		padding = {top: 5, right: 5, bottom: 15, left: 5},
		width = benefits.clientWidth - margin.left - margin.right,
		height = benefits.clientHeight - margin.top - margin.bottom;

	// Create a scale for the area of the triangle based on the width of the SVG
	var colWidth = width/4 - padding.left - padding.right;
	var area = d3.scale.linear().range([0, Math.pow(colWidth, 2) * Math.sqrt(3) / 4]);

	// Groups for the different charts
	var svg = d3.select('#benefits')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var nest = d3.nest()
		.key(function (d) { return d.country; });

	var properties = ['total costs', 'total benefits', 'net present value'];

	d3.csv('data/incentives.csv', function (csv) {

		// Filter out only the rows we want
		var data = csv.filter(function (d) {

			// Does this row match our filter criteria?
			var include = (d.sector === sector.value &&
				(attainment.value === 'both' || d.attainment === attainment.value) &&
				(gender.value === 'both' || d.gender === gender.value));

			// Does this row have values for each property we're using?
			var i = 0;
			while (include && i < properties.length) {
				include = !isNaN(d[properties[i]]);
				i++;
			}

			return include;
		});

		// Convert the properties we're using to numbers.
		data.forEach(function (d) {
			for (var i = 0; i < properties.length; i++) {
				var p = properties[i];
				d[p] = +d[p];
			}
		});

		// Find the maximum total benefits
		area.domain([0, d3.max(data, function (d) { return d['total benefits']; })]);
		
		// Nest the data by country.
		data = nest.entries(data);

		height = margin.top + margin.bottom + (colWidth + padding.top + padding.bottom) * (data.length);
		d3.select('#benefits').attr('height', height);

		var incentive = svg.selectAll('.incentive').data(data, function (d) { return d.key; })
			.enter().append('g')
				.attr('class', 'incentive')
				.attr('transform', function (d, i) {
					var h = colWidth + padding.top + padding.bottom;
					var y = h + i * h;

					return 'translate(0,' + y + ')';
				});

		incentive.selectAll('.country')
			.data(function (d) { return d.key.split(' '); })
			.enter().append('text')
			.attr('class', 'country')
			.attr('y', -colWidth/4)
			.attr('dy', function (d, i) {
				return i*14;
			})
			.text(String);

		var iceberg = incentive.selectAll('.iceberg')
			.data(function (d) {
				return d.values;
			},
				function (d) { return [d.country, d.attainment, d.gender].join('|'); })
			.enter().append('g')
			.attr('transform', function (d, i) {
				var x = padding.left + i * (colWidth + padding.left + padding.right);
				return 'translate(' + x + ',0)';
			});

		iceberg.append('path')
			.attr('class', 'total_benefits')
			.attr('d', totalBenefits);

		iceberg.append('text')
			.attr('class', 'npv')
			.attr('x', function (d) {
				var s = Math.floor(side(area(d['net present value']))),
					h = triangleHeight(s),
					y = h/2,
					x = 6 + colWidth/2 + (y/Math.tan(Math.PI / 3));

				return x;
			})
			.attr('y', function (d) {
				var s = Math.floor(side(area(d['net present value']))),
					h = triangleHeight(s);
					y = h/2;

					return -y;
			})
			.text(function (d) { return dollars(d['net present value']); });

		iceberg.append('path')
			.attr('class', 'npv')
			.attr('d', netPresentValue)
			.on('mouseover', function (d) {
				console.log([d.country, d.attainment, d.gender].join(' '));
			});

		iceberg.append('text')
			.attr('class', 'total-costs')
			.attr('x', colWidth / 2)
			.attr('y', function (d) {
				var npv_s = side(area(d['net present value'])),
					npv_h = triangleHeight(npv_s),
					total_s = side(area(d['total benefits'])),
					total_h = triangleHeight(total_s);

				return (total_h - npv_h) + 14;
			})
			.text(function (d) { return dollars(d['total costs']); });

			iceberg.append('text')
				.attr('class', 'total-benefits')
				.attr('x', colWidth / 2)
				.attr('y', function (d) {
					var npv_s = side(area(d['net present value'])),
						npv_h = triangleHeight(npv_s);

					return -npv_h - 4;
				}).text(function (d) { return dollars(d['total benefits']); });
	});

	function netPresentValue(d) {
		var s = Math.round(side(area(d['net present value'])));
		var h = -triangleHeight(s);
		var x = Math.round((colWidth - s) / 2);
		var f = d3.format('d');

		return 'M' + f(x) + ' 0h'  + f(s) + 'l' + f(Math.round(-s/2)) + ' ' + f(h) + 'z';
	}

	function totalBenefits(d) {
		var s = Math.round(side(area(d['total benefits'])));
		var h = triangleHeight(s);
		var npv_s = Math.round(side(area(d['net present value'])));
		var npv_h = triangleHeight(npv_s);
		var x = Math.round((colWidth - npv_s) / 2) + Math.round(npv_s / 2);
		var f = d3.format('d');

		return 'M' + f(x) + ' ' + f(-npv_h) + 'l' +
			f(Math.round(-s/2)) + ' ' + f(h) + 'h' + f(s) + 'z';
	}

	function side(a) {
		var s = Math.sqrt(4 * a / Math.sqrt(3));

		return s;
	}

	function triangleHeight(s) {
		return Math.round(s*Math.sqrt(3)/2);
	}

	function dollars(x) {
		var format = d3.format(',.0f');

		return '$' + format(x);
	}
})();
