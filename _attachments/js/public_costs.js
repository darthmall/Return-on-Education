function scatter() {
  // Private variables
  var _size = [900, 600],
    _x = d3.scale.linear().range([0, _size[0]]),
    _y = d3.scale.linear().range([_size[1], 0]),
    _arc = d3.svg.arc().startAngle(0).endAngle(2 * Math.PI)
        .innerRadius(0).outerRadius(function (d) { return d.radius; }),
    _xaxis = d3.svg.axis().orient('bottom'),
    _yaxis = d3.svg.axis().orient('left'),
    _hover = null;

    function chart(g) {
      var data = g.data();

      _x.domain([0, d3.max(data, function (d) {
        return Math.abs(d.value['private']['total costs']);
      })]);
      _y.domain([0, d3.max(data, function (d) {
        return Math.abs(d.value['public']['total costs']);
      })]);

      _xaxis.scale(_x);
      _yaxis.scale(_y);

      // if (container.selectAll('.axis').empty()) {
      //   container.append('g')
      //       .attr('class', 'x axis')
      //       .attr('transform', 'translate(0,' + _size[1] + ')')
      //     .append('text')
      //       .attr('class', 'title')
      //       .attr('transform', 'translate(' + (_size[0]/2) + ',20)')
      //       .text('Private Costs');

      //   container.append('g').attr('class', 'y axis')
      //     .append('text')
      //       .attr('class', 'title')
      //       .attr('transform', 'translate(-20,' + (_size[1]/2) + ') rotate(-90)')
      //       .text('Public Costs');
      // }

      // var t = d3.transition().duration(750);

      // t.select('.x.axis')
      //   .attr('transform', 'translate(0,' + _size[1] + ')')
      //   .style('opacity', 1)
      //   .call(_xaxis);

      // container.selectAll('.x text')
      //   .classed('hidden', function (d) {
      //     return !(d3.select(this).classed('title')) && d !== _x.domain()[1];
      //   });

      // t.select('.y.axis')
      //   .style('opacity', 1)
      //   .call(_yaxis);

      // container.selectAll('.y text')
      //   .classed('hidden', function (d) {
      //     return !(d3.select(this).classed('title')) && d !== _y.domain()[1];
      //   });

      // var line = container.selectAll('.private_costs')
      //     .data([Math.min(_x.domain()[1], _y.domain()[1])]);

      // line.enter().insert('path', ':first-child')
      //     .attr('class', 'private_costs')
      //   .transition().duration(750)
      //     .style('opacity', 1);

      // line.attr('d', function (d) {
      //   return 'M' + _x(0) + ' ' + _y(0) +
      //       'L' + _x(d) + ' ' + _y(d) +
      //       'L' + _size[0] + ' ' + _y(d) +
      //       'L' + _size[0] + ' ' + _y(0) + 'z';
      // });

      var path = g.selectAll('path').data(function (d) {
        return [{
          'key': d.key + ' income tax effect',
          'value': d.value['private']['income tax effect'],
          'radius': d.radius
        }];
      }, function (d) { return d.key; });

      path.enter().append('path');

      path.attr('class', 'income-tax-effect')
        .attr('d', _arc);

      path.exit().remove();

      g.sort(function (a, b) {
        return (Math.abs(b.value['private']['income tax effect']) || 0) - (Math.abs(a.value['private']['income tax effect']) || 0);
      })
          .on('mouseover', onMouseover)
          .on('mouseout', onMouseout)
        .transition().duration(750)
          .attr('transform', function (d) {
            d.x = _x(Math.abs(d.value['private']['total costs']));
            d.y = _y(Math.abs(d.value['public']['total costs']));

            return 'translate(' + d.x + ',' + d.y + ')';
          });
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
      // container.selectAll('.private_costs')
      //   .transition().duration(750)
      //     .style('opacity', 0)
      //   .remove();

      // container.selectAll('.axis')
      //   .transition().duration(750)
      //     .style('opacity', 0)
      //   .remove();

      return chart;
    };

    // Private methods
    function onMouseover(d) {
      _hover = d;

      // container.selectAll('.x text')
      //   .classed('hidden', function (t) {
      //     return Math.abs(d.value['private']['total costs']) !== t;
      //   });

      // container.selectAll('.y text')
      //   .classed('hidden', function (t) {
      //     return Math.abs(d.value['public']['total costs']) !== t;
      //   });
    }

    function onMouseout(d) {
      // if (d === _hover) {
      //   container.selectAll('.x text')
      //     .classed('hidden', function (t) {
      //       return !(d3.select(this).classed('title')) && t !== _x.domain()[1];
      //     });

      //   container.selectAll('.y text')
      //     .classed('hidden', function (t) {
      //       return !(d3.select(this).classed('title')) && t !== _y.domain()[1];
      //     });

      //   _hover = null;
      // }
    }

    return chart;
}