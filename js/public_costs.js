function scatter(container) {
    function chart(data) {
      var filtered = data.filter(function (d) {
        return d.value.hasOwnProperty('public') &&
          d.value.hasOwnProperty('private') &&
          !isNaN(d.value['public']['direct cost']) &&
          !isNaN(d.value['public']['net present value']);
      });

      _x.domain([0, d3.max(filtered, function (d) {
        return Math.abs(d.value['private']['total costs']);
      })]);
      _y.domain([0, d3.max(filtered, function (d) {
        return Math.abs(d.value['public']['total costs']);
      })]);

      var xticks = [], yticks = [];

      filtered.forEach(function (d) {
        var priv = Math.abs(d.value['private']['total costs']);
        var pub = Math.abs(d.value['public']['total costs']);

        d.x = _x(priv);
        d.y = _y(pub);

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

      var line = container.selectAll('.reference')
          .data([Math.min(_x.domain()[1], _y.domain()[1])]);

      line.enter().append('line')
          .attr('class', 'reference')
          .attr('x1', _x(0))
          .attr('y1', _y(0));

      line.transition().duration(750)
          .attr('x1', _x(0))
          .attr('y1', _y(0))
          .attr('x2', _x)
          .attr('y2', _y);

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
      container.selectAll('.reference')
        .transition().duration(750)
          .attr('x2', _x(0))
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
      _xaxis = d3.svg.axis().orient('bottom'),
      _yaxis = d3.svg.axis().orient('left'),
      _size = [900, 600],
      _color = null;


    return chart;
}