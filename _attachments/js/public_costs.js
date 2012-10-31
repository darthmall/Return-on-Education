function scatter(container) {
    function chart(data) {
      _x.domain([0, d3.max(data, function (d) {
        return Math.abs(d.value['private']);
      })]);
      _y.domain([0, d3.max(data, function (d) {
        return Math.abs(d.value['public']);
      })]);
      _area.domain([0, d3.max(data, function (d) {
        return Math.abs(d.value['income tax effect']);
      })]);

      var xticks = [], yticks = [];

      data.forEach(function (d) {
        var priv = Math.abs(d.value['private']);
        var pub = Math.abs(d.value['public']);
        var taxes = Math.abs(d.value['income tax effect']);

        d.x = _x(priv);
        d.y = _y(pub);
        d.radius = Math.sqrt(_area(taxes)/Math.PI);

        if (xticks.indexOf(priv) < 0) {
          xticks.push(priv);
        }

        if (yticks.indexOf(pub) < 0) {
          yticks.push(pub);
        }
      });

      _xaxis.scale(_x).tickValues(xticks);
      _yaxis.scale(_y).tickValues(yticks);

      if (container.selectAll('.axis').empty()) {
        container.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + _size[1] + ')')
          .append('text')
            .attr('class', 'title')
            .attr('transform', 'translate(' + (_size[0]/2) + ',20)')
            .text('Private Costs');

        container.append('g').attr('class', 'y axis')
          .append('text')
            .attr('class', 'title')
            .attr('transform', 'translate(-20,' + (_size[1]/2) + ') rotate(-90)')
            .text('Public Costs');
      }

      var t = d3.transition().duration(750);

      t.select('.x.axis')
        .attr('transform', 'translate(0,' + _size[1] + ')')
        .style('opacity', 1)
        .call(_xaxis)
      .selectAll('text').filter(function (d) {
        return !d3.select(this).classed('title');
      })
        .style('display', function (d, i) {
          return (d === 0 || d === _x.domain()[1]) ? null : 'none';
        });

      t.select('.y.axis')
        .style('opacity', 1)
        .call(_yaxis)
      .selectAll('text').filter(function (d) {
        return !d3.select(this).classed('title');
      })
        .style('display', function (d, i) {
          return (d === 0 || d === _y.domain()[1]) ? null : 'none';
        });

      var line = container.selectAll('.private_costs')
          .data([Math.min(_x.domain()[1], _y.domain()[1])]);

      line.enter().insert('path', ':first-child')
          .attr('class', 'private_costs')
        .transition().duration(750)
          .style('opacity', 1);

      line.attr('d', function (d) {
        return 'M' + _x(0) + ' ' + _y(0) +
            'L' + _x(d) + ' ' + _y(d) +
            'L' + _size[0] + ' ' + _y(d) +
            'L' + _size[0] + ' ' + _y(0) + 'z';
      });

      var circle = container.selectAll('circle').data(data,
        function (d) { return d.key; });

      circle.enter().append('circle')
        .attr('class', function (d) {
          return d.key;
        })
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });

      circle.sort(function (a, b) {
        return (b.value['income tax effect'] || 0) - (a.value['income tax effect'] || 0);
      })
        .transition().duration(750)
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', function (d) { return d.radius; });

      circle.exit()
        .transition().duration(750)
        .attr('r', 0)
        .remove();
    }

    // Public methods
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
      container.selectAll('.private_costs')
        .transition().duration(750)
          .style('opacity', 0)
        .remove();

      container.selectAll('.axis')
        .transition().duration(750)
          .style('opacity', 0)
        .remove();

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
      _area = d3.scale.linear().range([25, Math.PI * 30 * 30]),
      _xaxis = d3.svg.axis().orient('bottom'),
      _yaxis = d3.svg.axis().orient('left'),
      _size = [900, 600];

    return chart;
}