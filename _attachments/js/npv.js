function bubble() {
  // Private member variables.
  var _force = d3.layout.force().charge(charge).gravity(0)
      .linkDistance(function (l) { return l.source.radius + l.target.radius; }),
    _size = [900, 500],
    _gravity = 0.1,
    _arc = d3.svg.arc().startAngle(0).endAngle(2 * Math.PI)
        .innerRadius(0).outerRadius(function (d) { return d.radius; });

  function chart(g) {
    var nodes = d3.map({}),
        links = [];

      var path = g.selectAll('path')
          .data(function (d) { return [d]; },
            function (d) { return d.key + ' net present value'; });

      path.enter().append('path');

      path.attr('d', _arc)
          .attr('class', 'net-present-value');

      path.exit().remove();

      g.selectAll('.label').remove();
      
      g.data().forEach(function (d) {
        nodes.set(d.key, d);

        var linkKey = d.key;

        if (linkKey.indexOf('female') >= 0) {
          linkKey.replace('female', 'male');
        } else {
          linkKey.replace('male', 'female');
        }

        if (nodes.has(linkKey)) {
          links.push({
            'source': d,
            'target': nodes.get(linkKey)
          });
        }
      });

    g.transition().duration(750)
        .attr('transform', function (d) {
          if (!d.x) {
            d.x = Math.random() * 1000;
          }

          if (!d.y) {
            d.y = Math.random() * 1000;
          }

          return 'translate(' + d.x + ',' + d.y + ')';
        });

    _force.nodes(nodes.values()).links(links).on('tick', function (e) {
      var targetY = _size[1] * 0.5,
        nodeList = nodes.values();

      for (var i = 0; i < nodeList.length; i++) {
        var d = nodeList[i],
          targetX = _size[0] * ((d.key.indexOf('tertiary') >= 0) ? 0.3 : 0.6);

        d.x += (targetX - d.x) * _gravity * e.alpha;
        d.y += (targetY - d.y) * _gravity * e.alpha;
      }

      g.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    }).start();
  }

  chart.axes = function (g) {
    var titles = g.selectAll('.title')
      .data(['Tertiary', 'Post-Secondary']);

    titles.transition().duration(750)
        .attr('transform', titleTransform);

    titles.enter().append('text')
        .attr('class', 'title')
        .attr('transform', titleTransform)
        .style('opacity', 0)
      .transition().duration(750)
        .style('opacity', 1);

    titles.text(String);
    
    titles.exit()
      .transition().duration(750)
        .style('opacity', 0)
      .remove();
  };

  chart.gravity = function(gravity) {
      if (arguments.length < 1) {
          return _gravity;
      }

      _gravity = gravity;
  
      return chart;
  };

  // Public methods
  chart.size = function(dimensions) {
    if (arguments.length < 1) {
      return _size;
    }

    _size = dimensions;

    _force.size(_size);

    return chart;
  };

  chart.stop = function() {
    // Stop the force layout
    _force.nodes([])
        .links([])
        .stop();

    return chart;
  };

  // Private methods.
  function charge(d) {
    return isNaN(d.radius) ? 0 : -Math.pow(d.radius, 2) / 8;
  }

  function dollars(x) {
    var format = d3.format(',.0f');

    return '$' + format(x);
  }

  function showTooltip (data) {
    return function (d) {
      var translate = $(container[0][0]).offset(),
        country = d.value['private'].country,
        id = d.key.replace(/\s+/g, '_'),
        $tooltip = $('<div class="tooltip"><h3></h3><img class="flag" /></div>')
            .attr('id', id).appendTo('body'),
        svg = d3.select('#' + id).append('svg').attr('height', _maxR * 2 + 18);

      var filtered = data.filter(function (d) {
        return d.value['private'].country === country;
      }).sort(function (a, b) {
        return b.value['private']['net present value'] - a.value['private']['net present value'];
      });

      var g = svg.selectAll('g').data(filtered)
        .enter().append('g')
        .attr('transform', function (d, i) {
          return 'translate(' + (i * 2 * _maxR) + ',0)';
        });

      g.append('circle')
        .attr('class', function (d) { return d.key; })
        .attr('cx', _maxR)
        .attr('cy', function (d) { return 2 * _maxR - d.radius; })
        .attr('r', function (d) { return d.radius; });

      g.append('text')
        .attr('class', 'label')
        .attr('x', _maxR)
        .attr('y', 2 * _maxR + 16)
        .text(function (d) {
          var f = d3.format(',.0f');
          return '$' + f(d.value['private']['net present value']);
        });

      $tooltip.children('h3').text(country);
      $tooltip.children('.flag')
        .attr('src', 'img/flags/' + country.toLowerCase() + '.png');

      $tooltip.css({
        'min-width': filtered.length * 2 * _maxR,
        'left': Math.max(0, translate.left + d.x - $tooltip.outerWidth() * 0.5),
        'top': Math.max(0, translate.top + d.y - $tooltip.outerHeight() - d.radius)
      });
    };
  }

  function hideTooltip(d) {
    $('#' + d.key.replace(/\s+/g, '_')).hide().remove();
  }

  function titleTransform(d, i) {
    var x = 0,
      y = _size[1] / 2,
      theta = -90;
    if (i > 0) {
      x = _size[0] - 18;
      theta = 90;
    }

    return 'translate(' + x + ',' + y + ') rotate(' + theta + ')';
  }

  
  return chart;
}