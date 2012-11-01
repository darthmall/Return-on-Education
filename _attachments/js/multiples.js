function multiples(container) {
    function chart(data) {
      var maxR = Math.sqrt(_area.range()[1] / Math.PI),
        w = maxR * 2,
        h = w + 18,
        cols = Math.floor(_size[0] / w);

      _cacheHeight = $('svg').height();
      $('svg').height(h * Math.ceil(data.length / cols));

      _area.domain([0, d3.max(data, function (d) {
        return d.value['private'];
      })]);

      data = data.sort(function (a, b) {
        return b.value['private'] - a.value['private'];
      });

      data.forEach(function (d, i) {
        d.x = maxR + Math.floor(i % cols) * w;
        d.y = maxR + Math.floor(i / cols) * h;
        d.radius = Math.sqrt(_area(d.value['private']) / Math.PI);
      });

      var circle = container.selectAll('circle').data(data, function (d) { return d.key; });

      circle.enter().append('circle')
        .attr('class', function (d) { return d.key; })
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });

      circle.transition().duration(750)
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', function (d) { return d.radius; });

      circle.exit().transition().duration(750)
        .attr('r', 0)
        .remove();

      var label = container.selectAll('.label')
          .data(data, function (d) { return d.key; });

      label.transition().duration(750)
        .attr('x', function (d) { return d.x; })
        .attr('y', function (d) { return d.y + d.radius + 16; });

      label.enter().append('text')
        .attr('class', 'label')
        .attr('x', function (d) { return d.x; })
        .attr('y', function (d) { return d.y + maxR + 16; })
        .transition().duration(750)
        .style('opacity', 1);

      label.text(function (d) { return d.key.split(' ').slice(0, -2).join(' '); });

      label.exit().transition().duration(750)
        .style('opacity', 0)
        .remove();
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
      container.selectAll('.label')
        .transition().duration(750)
        .style('opacity', 0)
        .remove();

      $('svg').height(_cacheHeight);

      return chart;
    };

    // Private methods

    // Private variables
    var _size = [1, 1],
      _area = d3.scale.linear().range([5, Math.PI * 50 * 50]),
      _cacheHeight = 0;

    return chart;
}