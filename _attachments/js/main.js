(function($) {
	// Set up the dimensions
	var margin = { top: 30, right: 30, bottom: 30, left: 100 },
		padding = {top: 5, right: 5, bottom: 15, left: 5},
		width = $('svg').width() - margin.left - margin.right,
		height = $(window).height() - $('svg').offset().top;

	$('svg').height(height);

	// Groups for the different charts
	var svg = d3.select('svg .content')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var maxR = 50,
			area = d3.scale.linear().range([0, Math.PI * maxR * maxR]);

	var npv = bubble().size([width, height - margin.top - margin.bottom]),
			publicScatter = scatter().size([width, height - margin.top - margin.bottom]),
			sorted = multiples().size([width, height - margin.top - margin.bottom])
					.colWidth(maxR * 2);

	var chart = npv;
	var data = [];

	$(window).resize(invalidateSize);
	$('.chzn-select').change(updateFilter).chosen();

	$('.navbutton').click(function (e) {
		var id = e.target.getAttribute('data-article'),
			articles = $('article');

		articles.filter(function (i) { return this.getAttribute('id') !== id; })
			.css('display', 'none');

		$('#' + id).css('display', 'block');

		chart.stop();

		var url = '';

		if (id === 'costs') {
			data.forEach(function (d) {
				function r(a) { return Math.sqrt(a / Math.PI); }

				if (!isNaN(d.value['private']['income tax effect'])) {
					d.radius = r(area(Math.abs(d.value['private']['income tax effect'])));
				}
			});

			chart = publicScatter;
		} else if (id === 'benefits') {
			data.forEach(function (d) {
				function r(a) { return Math.sqrt(a / Math.PI); }

				if (!isNaN(d.value['private']['total benefits'])) {
					d.radius = r(area(d.value['private']['total benefits']));
				}
			});
			chart = sorted;
		} else {
			data.forEach(function (d) {
				function r(a) { return Math.sqrt(a / Math.PI); }

				if (!isNaN(d.value['private']['net present value'])) {
					d.radius = r(area(d.value['private']['net present value']));
				}
			});
			chart = npv;
		}

		chart.size([width, height - margin.top - margin.bottom]);
		svg.attr('class', 'content ' + id)
				.selectAll('.demographic').call(chart);
		svg.selectAll('.axis').call(chart.axes);
	});

	d3.json('_list/public_v_private/incentives?reduce=false', function (json) {
		data = json;
		area.domain([0, d3.max(data, function (d) {
			return Math.max(d.value['private']['total benefits'], d.value['public']['total benefits']) || 0;
		})]);

		data.forEach(function (d) {
			function r(a) { return Math.sqrt(a / Math.PI); }

			if (!isNaN(d.value['private']['net present value'])) {
				d.radius = r(area(d.value['private']['net present value']));
			}
		});

		var demographic = svg.selectAll('.demographic')
				.data(data, function (d) { return d.key; });

		demographic.enter().append('g')
				.attr('class', function (d) {
					return 'demographic ' + d.key;
				});

		demographic.call(chart);

		d3.selectAll('.axis').call(chart.axes);
	});

	function invalidateSize() {
		var width = benefits.clientWidth - margin.left - margin.right,
			height = $(window).height() - $('#benefits').offset().top;

		$('#benefits').height(height);

		chart.size([width, height - margin.top - margin.bottom]);
		svg.selectAll('.demographic').call(chart);
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

	function updateFilter(e, o) {
		var selected = $(this).val();

		if (!selected) {
			d3.selectAll('.demographic').classed('hidden', false).call(chart);
		} else {
			d3.selectAll('.demographic').classed('hidden', function (d) {
				return (selected.indexOf(d.value['private'].country) < 0);
			}).call(chart);
		}
	}
})(jQuery);
