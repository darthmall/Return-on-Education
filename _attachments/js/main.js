var eag = eag || {};

eag.maxR = 50;
eag.area = d3.scale.linear().range([0, Math.PI * eag.maxR * eag.maxR]);

eag.dollars = function (x) {
	var format = d3.format(',.0f');

	return '$' + format(x);
};

eag.grossIncome = function (d) {
	return (d.value['private']['gross earnings benefits'] || 0) +
					(d.value['private']['unemployment effect'] || 0) +
					(d.value['private']['grants effect'] || 0);
};

eag.radius = function (v) { return Math.sqrt(eag.area(v) / Math.PI); };

(function($) {
	// Set up the dimensions
	var width = $('svg').width(),
		height = $(window).height() - $('svg').offset().top;

	$('svg').height(height);

	// Groups for the different charts
	var svg = d3.select('svg .content');

	var npv = eag.bubble(),
			publicScatter = eag.scatter(),
			sorted = eag.multiples().colWidth(eag.maxR * 2);

	var chart = npv;
	var data = [];

	npv.margin = { top: 100, right: 18, bottom: 10, left: 18 };
	sorted.margin = { top: 5, right: 5, bottom: 5, left: 5 };
	publicScatter.margin = { top: 5, right: 5, bottom: 50, left: 100 };

	$(window).resize(invalidateSize);
	$('.chzn-select').chosen().change(updateFilter);

	invalidateSize();

	$('#clear').click(function (e) {
		$('#country-filter').val([]).change().chosen().trigger('liszt:updated');
	});

	$('nav a').click(function (e) {
		var id = e.target.getAttribute('href'),
			articles = $('article');

		articles.filter(function (i) { return this.getAttribute('id') !== id; })
			.css('display', 'none');

		$(id).css('display', 'block');

		var url = '';

		chart.stop();

		if (id === '#costs') {
			data.forEach(function (d) { d.radius = 2; });
			chart = publicScatter;
		} else if (id === '#benefits') {
			data.forEach(function (d) {
				d.radius = eag.radius(eag.grossIncome(d));
			});
			chart = sorted;
		} else {
			data.forEach(function (d) {
				if (!isNaN(d.value['private']['net present value'])) {
					d.radius = eag.radius(d.value['private']['net present value']);
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
		eag.area.domain([0, d3.max(data, function (d) {
			return eag.grossIncome(d);
		})]);

		data.forEach(function (d) {
			if (!isNaN(d.value['private']['net present value'])) {
				d.radius = eag.radius(d.value['private']['net present value']);
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

	function updateFilter(e, o) {
		var selected = $(this).val(),
			empty = !(selected && selected.length > 0);

		$('#clear').attr('disabled', empty);

		if (empty) {
			d3.selectAll('.demographic').classed('hidden', false).call(chart);
		} else {
			d3.selectAll('.demographic').classed('hidden', function (d) {
				return (selected.indexOf(d.value['private'].country) < 0);
			}).call(chart);
		}
	}
})(jQuery);
