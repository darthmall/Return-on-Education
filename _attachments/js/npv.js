function npv(container) {
  function chart(data) {
    _area.domain([0, d3.max(data, function (d) { return d.value['private']; })]);

    // Initialize the x, y, and radii of the circles
    data.forEach(function (d) {
      if (!d.hasOwnProperty('x')) {
        d.x = Math.random() * 1000;
      }

      d.radius = Math.sqrt(_area([d.value['private']]) / Math.PI);

      if (!d.hasOwnProperty('y')) {
        d.y = Math.random() * 1000;
      }
    });

    var circle = container.selectAll('circle').data(data,
      function (d) { return d.key; });

    circle.transition().duration(750)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });

    circle.enter().append('circle')
      .attr('class', function (d) {
        return d.key;
      })
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip);

    circle.transition().duration(750)
      .attr('r', function (d) { return d.radius; });

    circle.exit()
      .transition().duration(750)
      .attr('r', 0)
      .remove();

    _force.nodes(data).on('tick', function (e) {
      var targetY = _size[1] * 0.5;

      for (var i = 0; i < data.length; i++) {
        var d = data[i],
          targetX = _size[0] * ((d.key.indexOf('tertiary') >= 0) ? 0.3 : 0.6);

        d.x += (targetX - d.x) * _gravity * e.alpha;
        d.y += (targetY - d.y) * _gravity * e.alpha;
      }

      circle.attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });

    }).start();
  }

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
    _force.nodes([]).stop();

    // Unhook the event listeners
    container.selectAll('circle')
      .on('mouseover', null)
      .on('mouseout', null);

    return chart;
  };

  // Private methods.
  function charge(d) {
    var c = -Math.pow(d.radius, 2) / 8;
    return c;
  }

  function dollars(x) {
    var format = d3.format(',.0f');

    return '$' + format(x);
  }

  function showTooltip(d) {
    var translate = $(container[0][0]).offset(),
      id = d.key.split(' '),
      $tooltip = $('.tooltip').attr('id', id.join('_'));

    // Clear out any old content.
    $tooltip.children('.body').children().remove();

    $tooltip.children('h3').text(id[0]);
    $tooltip.children('.attainment').text(id[1]);
    $tooltip.children('.gender').text(id[2]);

    $('<table><tr /></table>').appendTo($tooltip.children('.body'));

    $tooltip.find('tr').append(function (index, html) {
      return '<td>Net Present Value</td><td class="npv">' +
        dollars(d.value['private']) + '</td>';
    });

    $tooltip.css({
      left: translate.left + d.x - $tooltip.outerWidth() * 0.5,
      top: translate.top + d.y - $tooltip.outerHeight() - d.radius * 0.6
    }).stop().fadeIn(750);
  }

  function hideTooltip(d) {
    $('#' + d.key.replace(/\s+/g, '_')).stop().fadeOut(750).remove('.body > *').attr('id', null);
  }

  // Private member variables.
  var _force = d3.layout.force().charge(charge).gravity(0),
    _area = d3.scale.linear().range([0, Math.PI * Math.pow(50, 2)]),
    _size = [900, 500],
    _gravity = 0.1,
    _forces = null;

  return chart;
}