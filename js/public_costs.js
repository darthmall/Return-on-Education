function scatter(container) {
    function chart(data) {
      var filtered = data.filter(function (d) {
        return d.value.hasOwnProperty('public') &&
          d.value.hasOwnProperty('private') &&
          !isNaN(d.value['public']['direct cost']) &&
          !isNaN(d.value['private']['income tax effect']);
      });

      _x.domain([0, d3.max(filtered, function (d) { return Math.abs(d.value['public']['direct cost']); })]);
      _y.domain([0, d3.max(filtered, function (d) { return Math.abs(d.value['private']['income tax effect']); })]);

      var xticks = [], yticks = [];

      filtered.forEach(function (d) {
        d.x = _x(Math.abs(d.value['public']['direct cost']));
        d.y = _y(Math.abs(d.value['private']['income tax effect']));

        xticks.push(Math.abs(d.value['public']['direct cost']));
        yticks.push(Math.abs(d.value['private']['net present value']));
      });

      _xaxis.scale(_x).tickValues(xticks);
      _yaxis.scale(_y).tickValues(yticks);

      container.selectAll('.axis').style('display', null);

      var t = d3.transition().duration(750);

      t.select('.x.axis')
        .attr('transform', 'translate(0,' + _size[1] + ')')
        .call(_xaxis)
        .selectAll('text')
        .style('display', function (d) { return (d === 0 || d === _x.domain()[1]) ? null : 'none'; });

      t.select('.y.axis')
        .call(_yaxis)
        .selectAll('text')
        .style('display', function (d) { return (d === 0 || d === _y.domain()[1]) ? null : 'none'; });

      var circle = container.selectAll('circle').data(filtered, function (d) { return d.key; });

      circle.enter().append('circle')
        .attr('class', _color || null)
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });

      circle.transition().duration(750)
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 5);

      circle.exit()
        .transition().duration(750)
        .attr('r', 0)
        .remove();
    }

    // Public methods
    chart.color = function(color) {
        if (arguments.length < 1) {
            return _color;
        }
    
        _color = color;
    
        return chart;
    };
    chart.size = function(dimensions) {
        if (arguments.length < 1) {
            return _size;
        }
    
        _size = dimensions;

        _x.range([0, _size[0]]);
        _y.range([_size[1], 0]);
    
        return chart;
    };

    chart.stop = function() {
      container.selectAll('.axis').style('display', 'none');

      return chart;
    };

    // Private methods

    // Private variables
    var _nest = d3.nest().key(function (d) { return d.id; })
      .rollup(function (d) {
        var x = Number.NaN, y = Number.NaN;

        for (var i = 0; i < d.length; i++) {
          if (d[i].sector === 'public') {
            x = Math.abs(d[i]['direct cost']);
          } else {
            y = d[i]['net present value'];
          }
        }

        return { 'x': x, 'y': y };
      }),
      _x = d3.scale.linear(),
      _y = d3.scale.linear(),
      _xaxis = d3.svg.axis().orient('bottom'),
      _yaxis = d3.svg.axis().orient('left'),
      _size = [900, 600],
      _color = null;

    container.append('g').attr('class', 'x axis');
    container.append('g').attr('class', 'y axis');

    return chart;
}