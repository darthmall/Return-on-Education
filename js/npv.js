function npv(container) {
  function chart(data) {
    _x.domain(d3.extent(data, function (d) { return d['net present value']; }));
    _y.domain(d3.extent(data, function (d) { return d['total costs']; }));
    _area.domain([0, _x.domain()[1]]);
    _color.domain(_y.domain());

    // Initialize the x, y, and radii of the circles
    data.forEach(function (d) {
      if (Math.random() <= 0.5) {
        d.x = _x(d['net present value']);
      } else {
        d.x = _size[0] - _x(d['net present value']);
      }

      d.y = _y(d['total costs']);
      d.radius = Math.sqrt(_area(d['net present value']));
    });

    var circle = container.selectAll('circle').data(data, function (d) { return d.id; });

    circle.transition().duration(750)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });

    circle.enter().append('circle')
      .attr('class', function (d) {
        return 'q' + (_color(d['total costs']) + 1) + '-5';
      })
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .on('mouseover', _showTooltip)
      .on('mouseout', _hideTooltip);

    circle.transition().duration(750)
      .attr('r', function (d) { return d.radius; });

    circle.exit()
      .transition().duration(750)
      .attr('r', 0)
      .remove();

    _force.nodes(data)
      .on('tick', function (e) {
        var q = d3.geom.quadtree(data),
          i = 0,
          n = data.length;

        while (++i < n) {
          q.visit(collide(data[i]));
        }

        container.selectAll('circle')
          // .each(buoancy(e.alpha))
          .attr('cx', function (d) { return d.x; })
          .attr('cy', function (d) { return d.y; });
      });

    _force.start();
  }

  chart.tooltip = function(show, hide) {
      if (arguments.length < 1) {
          return [_showTooltip, _hideTooltip];
      }

      _showTooltip = show;
      _hideTooltip = (arguments.length > 1) ? hide : show;
  
      return chart;
  };

  // Public methods
  chart.size = function(dimensions) {
    if (arguments.length < 1) {
      return _size;
    }


    _size = dimensions;

    _x.range([0, _size[0] * 0.5]);
    _y.range([_size[1], 0]);

    _force.size(_size);

    return chart;
  };

  // Private methods.
  function charge(d) {
    return (d['net present value'] < 0) ? 0 : -Math.pow(d.radius, 2) / 8;
  }

  function buoancy(alpha) {
    var that = this;

    return function (d) {
      var center = _size[1] / 2;
      var targetY = center - (_color(d['total costs']) - 2) / 2 * center;

      d.y = d.y + (targetY - d.y) * (_force.gravity() + 0.02) * Math.pow(alpha, 3) * 100;
    };
  }

  function collide(d) {
    var r = d.radius + 16,
      nx1 = d.x - r,
      ny1 = d.y - r,
      nx2 = d.x + r,
      ny2 = d.y + r;

    return function (quad, x1, y1, x2, y2) {
      if (quad.point && quad.point !== d) {
        var x = d.x - quad.point.x,
          y = d.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + quad.point.radius;

        if (l < r) {
          l = (l - r) / l * 0.5;

          d.x -= x *= l;
          d.y -= y *= l;

          quad.point.x += x;
          quad.point.y += y;
        }

        return x1 > nx2 ||
          x2 < nx1 ||
          y1 > ny2 ||
          y2 < ny1;
      }
    };
  }

  // Private member variables.
  var _force = d3.layout.force().charge(charge),
    _area = d3.scale.linear().range([0, Math.PI * 30 * 30]),
    _x = d3.scale.linear(),
    _y = d3.scale.linear(),
    _color = d3.scale.quantile().range([3, 2, 1, 0]),
    _size = [900, 500],
    _showTooltip, _hideTooltip;

  return chart;
}