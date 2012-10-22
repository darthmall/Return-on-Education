(function() {
	function gender(d) {
		return d.gender;
	}

	function r(d) {
		return Math.sqrt(a(d.private_benefits) / Math.PI);
	}

	function onTick(e) {
		var q = d3.geom.quadtree(all),
			i = 0,
			n = all.length;

		while (++i < n) {
			q.visit(collide(all[i]));
		}

		svg.selectAll("circle")
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

		return false;
	}

	function collide(node) {
		var r = node.radius + 16,
			nx1 = node.x - r,
			nx2 = node.x + r,
			ny1 = node.y - r,
			ny2 = node.y + r;

		return function(quad, x1, y1, x2, y2) {
			if (quad.point && (quad.point !== node)) {
				var _x = node.x - quad.point.x,
					_y = node.y - quad.point.y,
					l = Math.sqrt(_x * _x + _y * _y),
					r = node.radius + quad.point.radius;

				if (l < r) {
					l = (l - r) / l * 0.5;
					node.x -= _x *= l;
					node.y -= _y *= l;
					node.x = Math.min(Math.max(node.x, node.radius), w - node.radius);
					node.y = Math.min(Math.max(node.y, node.radius), h - node.radius);
					node.y += (y(node.benefit_ratio) - node.y) * 0.1;

					quad.point.x += _x;
					quad.point.y += _y;
					quad.point.x = Math.min(Math.max(quad.point.x, quad.point.radius), w - quad.point.radius);
					quad.point.y = Math.min(Math.max(quad.point.y, quad.point.radius), h - quad.point.radius);
					quad.point.y += (y(quad.point.benefit_ratio) - quad.point.y) * 0.1;
				}
			}

			return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		};
	}

	var w = 900, h = 600,
		svg = d3.select('#benefits').attr('width', w).attr('height', h),
		post_secondary = svg.append('g').attr('class', 'post_secondary'),
		tertiary = svg.append('g').attr('class', 'tertiary'),
		all = POST_SECONDARY.concat(TERTIARY).filter(function(el) { return el.benefit_ratio !== null; }),
		benefit_range = d3.extent(all, function (d) { return d.benefit_ratio; }),
		y = d3.scale.log().range([h-30, 30])
			.domain(benefit_range),
		a = d3.scale.linear().range([Math.PI * 25, Math.PI * 1000])
			.domain(d3.extent(all, function (d) { return d.private_benefits; }));

		all.forEach(function (el, arr, idx) {
			el.x = Math.random() * (w - 100) + 50;
			el.y = y(el.benefit_ratio);
			el.radius = r(el);
		});

		post_secondary.selectAll('circle').data(POST_SECONDARY.filter(function(el) { return el.benefit_ratio !== null; }))
			.enter()
			.append('circle')
			.attr('cx', function (d) { return d.x; })
			.attr('cy', function (d) { return d.y; })
			.attr('r', function (d) { return d.radius; })
			.attr('class', gender);

		tertiary.selectAll('circle').data(TERTIARY.filter(function(el) { return el.benefit_ratio !== null; }))
			.enter()
			.append('circle')
			.attr('cx', function (d) { return d.x; })
			.attr('cy', function (d) { return d.y; })
			.attr('r', function (d) { return d.radius; })
			.attr('class', gender);

		svg.selectAll('line').data([1, 2])
			.enter()
			.append('line')
			.attr('x1', 0)
			.attr('y1', y)
			.attr('x2', w)
			.attr('y2', y)
			.attr('stroke', function (d) { return (d === 1) ? '#333333' : '#aaaaaa'; });

		svg.selectAll('circle')
			.on('mouseover', function (d) { console.log(d.country + ': ' + d.benefit_ratio); });
		d3.timer(onTick);
})();
