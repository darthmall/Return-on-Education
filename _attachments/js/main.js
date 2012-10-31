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

	var bubble = npv(svg)
			.tooltip(showTooltip, hideTooltip).size([width, height - margin.top - margin.bottom]),
		publicScatter = scatter(svg).size([width, height - margin.top - margin.bottom]);

	var chart = bubble;
	var data = [];

	$(window).resize(invalidateSize);

	$('.navbutton').click(function (e) {
		var id = e.target.getAttribute('data-article'),
			articles = $('article');

		articles.filter(function (i) { return this.getAttribute('id') !== id; })
			.css('display', 'none');

		$('#' + id).css('display', 'block');

		chart.stop();

		var url = '';

		if (id === 'cba') {
			chart = publicScatter;
			url = '_list/public_v_private/costs?reduce=false';
		} else {
			chart = bubble;
			url = '_list/public_v_private/npv?reduce=false';
		}

		d3.json(url, function (json) {
			data = json;
			chart.size([width, height - margin.top - margin.bottom]);
			chart(data);
		});
	});

	d3.json('_list/public_v_private/npv?reduce=false', function (json) {
		data = json;
		chart(data);
	});

	function invalidateSize() {
		var width = benefits.clientWidth - margin.left - margin.right,
			height = $(window).height() - $('#benefits').offset().top;

		$('#benefits').height(height);

		chart.size([width, height - margin.top - margin.bottom]);
		chart(data);
	}

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
