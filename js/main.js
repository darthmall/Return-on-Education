(function($) {
	// Set up the dimensions
	var margin = { top: 10, right: 10, bottom: 10, left: 10 },
		padding = {top: 5, right: 5, bottom: 15, left: 5},
		width = benefits.clientWidth - margin.left - margin.right,
		height = benefits.clientHeight - margin.top - margin.bottom;

	// Groups for the different charts
	var svg = d3.select('#benefits')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var bubble = npv(svg).tooltip(showTooltip, hideTooltip),
		publicScatter = null;

	var chart = bubble.size([width, height]);

	$('.navbutton').click(function (e) {
		var id = e.target.getAttribute('data-article'),
			articles = $('article');

		console.log(id);
		articles.filter(function (i) { return this.getAttribute('id') !== id; })
			.css('display', 'none');

		$('#' + id).css('display', 'block');

	});

	d3.csv('data/incentives.csv', function (csv) {
		// Convert the properties we're using to numbers.
		csv.forEach(function (d) {
			for (var k in d) {
				if (d.hasOwnProperty(k)) {
					var v = +d[k];

					if (!isNaN(v)) {
						d[k] = v;
					}
				}
			}

			d.id = [d.country, d.attainment, d.gender].join('-').replace(/\s+/g, '_');
		});

		$('.filter').change(invalidateData);

		$(window).resize(invalidateSize);

		invalidateData();

		function invalidateSize() {
			var width = benefits.clientWidth - margin.left - margin.right,
				height = benefits.clientHeight - margin.top - margin.bottom;

			chart.size([width, height]);
			chart(data);
		}

		function invalidateData() {
			// Filter out only the rows we want
			data = csv.filter(function (d) {

				// Does this row match our filter criteria?
				var include = (d.sector === 'private' &&
					(attainment.value === 'both' || d.attainment === attainment.value) &&
					(gender.value === 'both' || d.gender === gender.value));

				return include && !isNaN(d['net present value']) && !isNaN(d['total costs']);
			});


			data.sort(function (a, b) { return a['net present value'] - b['net present value']; });

			chart(data);
		}
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
			left: offset.left + d.x - tooltip.outerWidth() * 0.5,
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

	function dollars(x) {
		var format = d3.format(',.0f');

		return '$' + format(x);
	}

})(jQuery);
