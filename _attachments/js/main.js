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

	var bubble = npv(svg).size([width, height - margin.top - margin.bottom]),
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
