function multiples() {
  // Private variables
  var _size = [1, 1],
    _colWidth = 50,
    _padding = 5,
    _pie = d3.layout.pie().sort(function (a, b) {
          var order = ['net-present-value', 'direct-cost', 'foregone-earnings',
              'income-tax-effect', 'social-contribution', 'transfers-effect'];

          return order.indexOf(a.className) - order.indexOf(b.className);
        })
        .value(function (d) {
          return d.value;
        }),
    _arc = d3.svg.arc().innerRadius(0)
        .outerRadius(function (d) { return d.data.radius; });

    function chart(g) {
      var selection = g.filter(isValid);

      var data = selection.data(),
          w =  _colWidth + _padding * 2,
          h = w + 36,
          cols = Math.floor(_size[0] / w);

      $('svg').height(h * Math.ceil(data.length / cols) + (_colWidth / 2));

      g.filter(isInvalid)
        .transition().duration(750)
          .style('opacity', 0);

      // Clear out any old text
      g.selectAll('text').remove();

      selection.sort(function (a, b) {
        return b.value['private']['net present value'] - a.value['private']['net present value'];
      });

      var path = selection.selectAll('path')
          .data(function (d) {
            var key = d.key,
              r = d.radius,
              entries = d3.entries(d.value['private'])
                .filter(function (d) {
                  return (d.key === 'net present value' || d.value < 0) &&
                      !isNaN(d.value) &&
                      d.key !== 'total costs';
                });

              entries.forEach(function (d) {
                d.className = d.key.replace(/\s+/g, '-');
                d.key = key + ' ' + d.key;
                d.radius = r;
                d.value = Math.abs(d.value);
              });

              return _pie(entries);
            });

      path.enter().append('path');
        
      path.attr('class', function (d) { return d.data.className; })
          .attr('d', function (d) { return _arc(d); });

      path.exit().remove();

      var label = selection.selectAll('.label')
          .data(function (d) {
            return [{'country': d.value['private'].country,
              'npv': d.value['private']['net present value']}];
          });

      var labelEnter = label.enter().append('g')
          .attr('class', 'label')
          .style('opacity', 0);

      labelEnter.transition().duration(750)
          .style('opacity', 1);

      labelEnter.append('text')
          .attr('class', 'country')
          .attr('y', 16);

      labelEnter.append('text')
          .attr('class', 'npv')
          .attr('y', 34);

      label.attr('transform', 'translate(0,' + (_colWidth / 2) + ')')
          .selectAll('.country').text(function (d) { return d.country; });

      label.selectAll('.npv')
          .text(function (d) {
            var f = d3.format(',.0f');
            return '$' + f(d.npv);
          });

      label.exit().transition().duration(750)
        .style('opacity', 0)
        .remove();

      selection.transition().duration(750)
          .attr('transform', function (d, i) {
            d.x = _padding + (_colWidth / 2) + Math.floor(i % cols) * w;
            d.y = _padding + (_colWidth / 2) + Math.floor(i / cols) * h;

            return 'translate(' + d.x + ',' + d.y + ')';
          })
          .style('opacity', 1);
    }

    // Public methods
    chart.axes = function (g) {
      g.each(function () {
        d3.selectAll(this.childNodes)
            .transition().duration(750)
            .style('opacity', 0)
            .remove();
      });
    };

    chart.colWidth = function(colWidth) {
        if (arguments.length < 1) {
            return _colWidth;
        }
    
        _colWidth = colWidth;
    
        return chart;
    };
    chart.size = function(size) {
        if (arguments.length < 1) {
          return _size;
        }
    
        _size = size;
    
        return chart;
    };

    chart.stop = function() {
      return chart;
    };

    // Private methods
    function isValid(d) {
      return !d3.select(this).classed('hidden') &&
          !isNaN(d.value['private']['net present value']) &&
          d.value['private']['net present value'] > 0 &&
          !isNaN(d.value['private']['total benefits']);
    }

    function isInvalid(d) {
      return !isValid.call(this, d);
    }

    return chart;
}