(function() {
	var WIDTH = 960, HEIGHT = 900, MARGIN = 75, RADIUS_EXTENT = [5, 40],
		svg = d3.select('#benefits').attr('width', WIDTH).attr('height', HEIGHT),
		data = [],
		force = d3.layout.force().links([]).gravity(0).friction(0.7).charge(0).size([WIDTH, HEIGHT]),
		x = d3.scale.linear().range([MARGIN + RADIUS_EXTENT[1],
			WIDTH - MARGIN - RADIUS_EXTENT[1]]),
		y = d3.scale.log().range([HEIGHT - RADIUS_EXTENT[1],
			RADIUS_EXTENT[1]]),
		a = d3.scale.linear().range([Math.PI * RADIUS_EXTENT[0] * RADIUS_EXTENT[0],
			Math.PI * RADIUS_EXTENT[1] * RADIUS_EXTENT[1]]);

		force.on('tick', onTick);

		d3.selectAll('select').on('change', invalidate);

		invalidate();

		function invalidate(e) {
			data = INCENTIVES.filter(function (el) {
				return ((gender.value === 'both' || el.gender === gender.value) &&
					(attainment.value === 'both' || el.attainment === attainment.value));
			});

			x.domain(d3.extent(data, getAbsoluteValue));
			y.domain(d3.extent(data, getValue));
			a.domain(d3.extent(data, function (d) { return Math.abs(d.private_costs); }));

			data.forEach(function (el) {
				el.radius = r(el);

				if (!el.y) {
					el.y = y(getValue(el));
				}

				if (!el.x) {
					el.x = Math.random() * (WIDTH - 2 * MARGIN) + MARGIN;
				}
			});

			force.stop();
			force.nodes(data);

			var circles = svg.selectAll('circle')
				.data(data, function (d) { return d.country + d.gender + d.attainment; });

			circles.enter()
				.append('circle')
				.attr('cx', function (d) { return d.x; })
				.attr('cy', function (d) { return d.y; })
				.attr('class', function (d) { return d.attainment + '_' + d.gender; })
				.transition().duration(750)
				.attr('r', function (d) { return d.radius; });

			circles.transition().duration(750)
				.attr('r', function (d) { return d.radius; });
			circles.call(force.drag);

			circles.exit()
				.transition().duration(750)
				.attr('r', 0)
				.remove();

			force.start();
		}

		function getAbsoluteValue(d) {
			if (display.value === 'benefits') {
				return mode.value === 'public' ? d.public_benefits : d.private_benefits;
			}

			return mode.value === 'public' ? d.public_costs : d.private_costs;
		}

		function getValue(d) {
			var v = null;

			switch (mode.value) {
				case 'private':
					v = display.value === 'benefits' ? d.private_benefits : d.private_costs;
					break;

				case 'public':
					v = display.value === 'benefits' ? d.public_benefits : d.public_costs;
					break;

				default:
					v = display.value === 'benefits' ? d.benefit_ratio : d.cost_ratio;
					break;
			}

			return v;
		}

		function getGender(d) {
			return d.gender;
		}

		function r(d) {
			return Math.sqrt(a(Math.abs(d.private_costs)) / Math.PI);
		}

		function onTick(e) {
			var q = d3.geom.quadtree(data),
				i = 0,
				n = data.length,
				k = 0.1 * e.alpha;

			while (++i < n) {
				q.visit(collide(e, data[i]));
				data[i].y += (y(getValue(data[i])) - data[i].y) * k;
				data[i].x = Math.min(Math.max(data[i].x, data[i].radius), WIDTH - data[i].radius);
				data[i].y = Math.min(Math.max(data[i].y, data[i].radius), HEIGHT - data[i].radius);
			}


			svg.selectAll("circle")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });

			return false;
		}

		function collide(e, node) {
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

						quad.point.x += _x;
						quad.point.y += _y;
					}
				}

				return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			};
		}
})();
