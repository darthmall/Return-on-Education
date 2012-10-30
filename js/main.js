(function($) {
	// Set up the dimensions
	var margin = { top: 30, right: 30, bottom: 30, left: 100 },
		padding = {top: 5, right: 5, bottom: 15, left: 5},
		width = benefits.clientWidth - margin.left - margin.right,
		height = $(window).height() - $('#benefits').offset().top;

	$('#benefits').height(height);

	// Groups for the different charts
	var svg = d3.select('#benefits')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var bubble = npv(svg).tooltip(showTooltip, hideTooltip).size([width, height - margin.top - margin.bottom]),
		publicScatter = scatter(svg).size([width, height - margin.top - margin.bottom]);

	var chart = bubble;

	var nest = d3.nest()
		.key(function (d) {
			return [d.country, d.attainment, d.gender].join('-').replace(/\s+/g, '_');
		})
		.key(function (d) { return d.sector; })
		.rollup(function (d) { return d[0]; });

	d3.csv('data/incentives.csv', function (csv) {
		function color(d) {
			var c = d3.scale.quantile()
				.range(['q3-4', 'q2-4', 'q1-4', 'q0-4'])
				.domain(d3.extent(csv.filter(function (d) {
					return d.sector === 'private';
				}), function (d) { return d['total costs']; }));

			return c(d.value['private']['total costs']);
		}
		var data = [];

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

		bubble.color(color);
		publicScatter.color(color);

		$('.filter').change(invalidateData);
		$(window).resize(invalidateSize);

		invalidateData();

		function invalidateSize() {
			var width = benefits.clientWidth - margin.left - margin.right,
				height = $(window).height() - $('#benefits').offset().top;

			$('#benefits').height(height);

			chart.size([width, height - margin.top - margin.bottom]);
			chart(data);
		}

		function invalidateData() {
			// Filter out only the rows we want
			data = d3.entries(nest.map(csv.filter(function (d) {

				// Does this row match our filter criteria?
				var include = ((attainment.value === 'both' || d.attainment === attainment.value) &&
					(gender.value === 'both' || d.gender === gender.value));

				return include;
			})));

			chart(data);
		}

		$('.navbutton').click(function (e) {
			var id = e.target.getAttribute('data-article'),
				articles = $('article');

			articles.filter(function (i) { return this.getAttribute('id') !== id; })
				.css('display', 'none');

			$('#' + id).css('display', 'block');

			chart.stop();

			if (id === 'cba') {
				chart = publicScatter;
			} else {
				chart = bubble;
			}

			chart(data);
		});
	});

	function showTooltip(d) {
		var offset = $('svg').offset();

		var tooltip = $('<div></div>', {
			'id': d.key,
			'class': 'tooltip'
		});

		$('<h3>' + d.value['private'].country + '</h3>', {'class': 'country'}).appendTo(tooltip);
		$('<table><tr /><tr /><tr /></table>').appendTo(tooltip);

		tooltip.find('tr').append(function (index, html) {
			switch (index) {
				case 0:
					return '<td class="attainment">' + d.value['private'].attainment + '</td>' +
						'<td class="gender">' + d.value['private'].gender + '</td>';

				case 1:
					return '<td>Net Present Value</td><td class="npv">' +
						dollars(d.value['private']['net present value']) + '</td>';

				case 2:
					return '<td>Total Costs</td><td class="costs">' +
						dollars(d.value['private']['total costs']) + '</td>';

				default:
					return '';
			}
		});

		tooltip.appendTo('body');
		tooltip.offset({
			left: offset.left + d.x + margin.left - tooltip.outerWidth() * 0.5,
			top: offset.top + d.y + margin.top - tooltip.outerHeight() - d.radius * 0.6
		});
	}

	function hideTooltip(d) {
		$('#' + d.key).remove();
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
