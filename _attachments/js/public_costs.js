var eag = eag || {};

eag.scatter = function () {
  // Private variables
  var _size = [900, 600],
    _x = d3.scale.linear().range([0, _size[0]]),
    _y = d3.scale.linear().range([_size[1], 0]),
    _arc = d3.svg.arc().startAngle(0).endAngle(2 * Math.PI)
        .innerRadius(0).outerRadius(function (d) { return d.radius; }),
    _xaxis = d3.svg.axis().orient('bottom'),
    _yaxis = d3.svg.axis().orient('left'),
    _hover = null,
    _cache = null;

    function chart(g) {
      var selection = g.filter(isValid);

      var data = g.data();

      _x.domain([0, d3.max(data, function (d) {
        return d.value['private']['net present value'];
      }) * 1.05]);
      _y.domain([0, d3.max(data, function (d) {
        return d.value['public']['net present value'];
      }) * 1.05]);

      _xaxis.scale(_x);
      _yaxis.scale(_y);

      // Clear out old text
      g.selectAll('text').remove();

      g.filter(isInvalid)
        .transition().duration(750)
          .style('opacity', 0);

      var path = selection.selectAll('path').data(function (d) {
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

      selection.selectAll('.label').remove();

      selection.sort(function (a, b) {
        return (Math.abs(b.value['private']['income tax effect']) || 0) - (Math.abs(a.value['private']['income tax effect']) || 0);
      })
          .on('mouseover', onMouseover)
          .on('mouseout', onMouseout)
        .transition().duration(750)
          .attr('transform', function (d) {
            d.x = _x(eag.grossIncome(d));
            d.y = _y(d.value['private']['net present value']);

            return 'translate(' + d.x + ',' + d.y + ')';
          })
          .style('opacity', 1);
    }

    // Public methods
    chart.axes = function (g) {
      g.style('opacity', 0).each(function () {
        var axis = d3.select(this),
          fs = 18;

        d3.selectAll(this.childNodes).remove();

        var text = axis.append('text')
            .attr('class', 'title');

        fs = text.style('font-size').slice(0, -2);

        if (axis.classed('x')) {
          text.attr('transform', 'translate(' + (_size[0] / 2) + ',40)')
              .text('Private Net Present Value');
        } else {
          text.attr('dy', fs)
              .attr('transform', 'translate(-90,' + (_size[1] / 2) + ')rotate(-90)')
              .text('Public Net Present Value');
        }
      });

      g.filter(function () { return d3.select(this).classed('x'); })
        .attr('transform', 'translate(0,' + _size[1] + ')')
        .style('opacity', 1)
        .call(_xaxis);

      var line = g.filter(function () { return d3.select(this).classed('y'); })
        .attr('transform', null)
        .call(_yaxis).selectAll('.public-costs')
          .data([Math.min(_x.domain()[1], _y.domain()[1])]);

      line.enter().append('path')
          .attr('class', 'private-costs')
        .transition().duration(750)
          .style('opacity', 1);

      line.attr('d', function (d) {
        return 'M' + _x(0) + ' ' + _y(0) +
            'L' + _x(d) + ' ' + _y(d) +
            'L' + _size[0] + ' ' + _y(d) +
            'L' + _size[0] + ' ' + _y(0) + 'z';
      });

      g.transition().duration(750).style('opacity', 1);
    };

    chart.cache = function(data) {
        if (arguments.length < 1) {
            return _cache;
        }
    
        _cache = data;
    
        return chart;
    };
    
    chart.size = function (dimensions) {
        if (arguments.length < 1) {
            return _size;
        }
    
        _size = dimensions;

        _x.range([0, _size[0]]);
        _y.range([_size[1], 0]);
    
        return chart;
    };

    chart.stop = function () {
      return chart;
    };

    // Private methods
    function isValid(d) {
      return !d3.select(this).classed('hidden') &&
          !isNaN(d.value['private']['total costs']) &&
          !isNaN(d.value['public']['total costs']);
    }

    function isInvalid(d) {
      return !isValid.call(this, d);
    }

    function onMouseover(d) {
      _hover = d;
    }

    function onMouseout(d) {
    }

    return chart;
};