function multiples() {
  // Private variables
  var _size = [1, 1],
    _cacheHeight = 0,
    _pie = d3.layout.pie().sort(null)
        .value(function (d) {
          return d.value;
        }),
    _arc = d3.svg.arc().innerRadius(0)
        .outerRadius(function (d) { return d.data.radius; });

    function chart(g) {
      var data = g.data(),
        maxR = d3.max(data, function (d) { return d.radius; }),
        w =  maxR * 2,
        h = w + 36,
        cols = Math.floor(_size[0] / w);

      _cacheHeight = $('svg').height();
      $('svg').height(h * Math.ceil(data.length / cols));

      g.sort(function (a, b) {
        return b.value['private']['net present value'] - a.value['private']['net present value'];
      });

      var path = g.selectAll('path')
          .data(function (d) {
            var key = d.key,
              r = d.radius,
              entries = d3.entries(d.value['private'])
                .filter(function (d) {
                  return (d.key === 'net present value' || d.value < 0) && !isNaN(d.value);
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

      var label = g.selectAll('.label')
          .data(function (d) {
            return [{'country': d.value['private'].country,
              'npv': d.value['private']['net present value']}];
          });

      var labelEnter = label.enter().append('g')
          .attr('class', 'label')
          .attr('transform', 'translate(0,' + maxR + ')')
          .style('opacity', 0);

      labelEnter.transition().duration(750)
          .style('opacity', 1);

      labelEnter.append('text')
          .attr('class', 'country')
          .attr('y', 16);

      labelEnter.append('text')
          .attr('class', 'npv')
          .attr('y', 34);

      label.selectAll('.country').text(function (d) { return d.country; });

      label.selectAll('.npv')
          .text(function (d) {
            var f = d3.format(',.0f');
            return '$' + f(d.npv);
          });

      label.exit().transition().duration(750)
        .style('opacity', 0)
        .remove();

      g.transition().duration(750)
          .attr('transform', function (d, i) {
            d.x = maxR + Math.floor(i % cols) * w;
            d.y = maxR + Math.floor(i / cols) * h;

            return 'translate(' + d.x + ',' + d.y + ')';
          });

    }

    // Public methods
    chart.size = function(size) {
        if (arguments.length < 1) {
            return _size;
        }
    
        _size = size;
    
        return chart;
    };

    chart.stop = function() {
      $('svg').height(_cacheHeight);

      return chart;
    };

    // Private methods

    return chart;
}