(function($) {
	// Set up the dimensions
	var width = $('svg').width(),
		height = $(window).height() - $('svg').offset().top;

	$('svg').height(height);

	// Groups for the different charts
	var svg = d3.select('svg .content');

	var maxR = 50,
			area = d3.scale.linear().range([0, Math.PI * maxR * maxR]);

	var npv = bubble(),
			publicScatter = scatter(),
			sorted = multiples().colWidth(maxR * 2);

	var chart = npv;
	var data = [];

	npv.margin = { top: 100, right: 18, bottom: 10, left: 18 };
	sorted.margin = { top: 5, right: 5, bottom: 5, left: 5 };
	publicScatter.margin = { top: 5, right: 5, bottom: 50, left: 100 };

	$(window).resize(invalidateSize);
	$('.chzn-select').change(updateFilter).chosen();

	invalidateSize();

	$('nav a').click(function (e) {
		var id = e.target.getAttribute('href'),
			articles = $('article');

		articles.filter(function (i) { return this.getAttribute('id') !== id; })
			.css('display', 'none');

		$(id).css('display', 'block');

		var url = '';

		chart.stop();

		if (id === '#costs') {
			data.forEach(function (d) {
				function r(a) { return Math.sqrt(a / Math.PI); }

				if (!isNaN(d.value['private']['income tax effect'])) {
					d.radius = r(area(Math.abs(d.value['private']['income tax effect'])));
				}
			});

			chart = publicScatter;
		} else if (id === '#benefits') {
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

		$('svg').attr('class', id.slice(1));
		invalidateSize();

		return false;
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

		var demographic = svg.select('.data').selectAll('.demographic')
				.data(data, function (d) { return d.key; });

		demographic.enter().append('g')
				.attr('class', function (d) {
					return 'demographic ' + d.key;
				});

		demographic.call(chart);

		d3.selectAll('.axis').call(chart.axes);
	});

	function invalidateSize() {
		var $svg = $('svg'),
			width = $svg.width() - chart.margin.left - chart.margin.right,
			height = Math.max(660, $(window).height() - $svg.offset().top);

		$svg.height(height);

		height -= chart.margin.top + chart.margin.bottom;

		svg.attr('transform',
			'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

		chart.size([width, height]);
		svg.selectAll('.demographic').call(chart);
		svg.selectAll('.axis').call(chart.axes);
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
