function npv(container) {
  function chart(data) {
    var filtered = data.filter(function (d) {
      return d.value.hasOwnProperty('private') &&
        !isNaN(d.value['private']['net present value']) &&
        !isNaN(d.value['private']['total costs']);
    });

    _x.domain(d3.extent(filtered, function (d) { return d.value['private']['net present value']; }));
    _y.domain(d3.extent(filtered, function (d) { return d.value['private']['total costs']; }));
    _area.domain([0, _x.domain()[1]]);

    // Initialize the x, y, and radii of the circles
    filtered.forEach(function (d) {
      if (!d.hasOwnProperty('x')) {
        if (Math.random() <= 0.5) {
          d.x = _x(d.value['private']['net present value']);
        } else {
          d.x = _size[0] - _x(d.value['private']['net present value']);
        }
      }

      if (!d.hasOwnProperty('radius')) {
        d.radius = Math.sqrt(_area(d.value['private']['net present value']));
      }

      if (!d.hasOwnProperty('y')) {
        d.y = _y(d.value['private']['total costs']);
        _boundingRadius = Math.max(_boundingRadius, Math.abs(d.y - (_size[1] / 2)) + d.radius);
      }


    });

    var circle = container.selectAll('circle').data(filtered, function (d) { return d.key; });

    circle.transition().duration(750)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });

    circle.enter().append('circle')
      .attr('class', _color || null)
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

    _force.nodes(filtered)
      .on('tick', function (e) {
        var q = d3.geom.quadtree(filtered),
          i = 0,
          n = filtered.length;

        while (++i < n) {
          q.visit(collide(filtered[i]));
        }

        container.selectAll('circle')
          .each(buoancy(e.alpha))
          .attr('cx', function (d) { return d.x; })
          .attr('cy', function (d) { return d.y; });
      });

    _force.start();
  }

  chart.color = function(color) {
      if (arguments.length < 1) {
          return _color;
      }
  
      _color = color;
  
      return chart;
  };

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

  chart.stop = function() {
    _force.nodes([]).stop();

    return chart;
  };

  // Private methods.
  function charge(d) {
    return (d['net present value'] < 0) ? 0 : -Math.pow(d.radius, 2) / 8;
  }

  function buoancy(alpha) {
    var that = this;

    return function (d) {
      var center = _size[1] / 2,
        costCategory = 0;

      switch (_color(d)) {
        case 'q0-4':
          costCategory = -2;
          break;

        case 'q1-4':
          costCategory = -1;
          break;

        case 'q2-4':
          costCategory = 1;
          break;

        case 'q3-4':
          costCategory = 2;
          break;
      }

      var targetY = center - (costCategory - 2) / 2 * _boundingRadius;

      d.y += (targetY - d.y) * _force.gravity() * Math.pow(alpha, 3) * 10;
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
  var _force = d3.layout.force().charge(charge).gravity(0.1).friction(0.9),
    _area = d3.scale.linear().range([0, Math.PI * 30 * 30]),
    _x = d3.scale.linear(),
    _y = d3.scale.linear(),
    _size = [900, 500],
    _boundingRadius = 0;
    _showTooltip = null,
    _hideTooltip = null,
    _color = null;

  return chart;
}