var eag = eag || {};

eag.multiples = function () {
  // Private variables
  var _size = [1, 1],
    _colWidth = 50,
    _padding = 5,
    _fields = ['net present value', 'direct cost', 'foregone earnings', 'income tax effect', 'social contribution effect', 'transfers effect'],
    _pie = d3.layout.pie().sort(function (a, b) {
          var order = ['net-present-value', 'direct-cost', 'foregone-earnings', 'income-tax-effect', 'social-contribution-effect', 'transfers-effect'];

          return order.indexOf(a.className) - order.indexOf(b.className);
        })
        .value(function (d) {
          return d.value;
        }),
    _arc = d3.svg.arc().innerRadius(0)
        .outerRadius(function (d) { return d.data.radius; }),
    _cache = null;

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
      g.selectAll('text.title, text.label').remove();

      selection.sort(function (a, b) {
        return b['net present value'] - a['net present value'];
      });

      var path = selection.selectAll('path')
          .data(function (d) {
            var key = d.key,
              r = d.radius,
              entries = d3.entries(d)
                .filter(function (d) {
                  return (_fields.indexOf(d.key) >= 0) && !isNaN(d.value);
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
            return [{'country': d.country,
              'npv': d['net present value']}];
          });

      var labelEnter = label.enter().append('g')
          .attr('class', 'label')
          .style('opacity', 0);

      labelEnter.transition().duration(750)
          .style('opacity', 1);

      labelEnter.append('text')
          .attr('class', 'country');

      labelEnter.append('text')
          .attr('class', 'npv');

      label.attr('transform', 'translate(0,' + (_colWidth / 2) + ')')
          .selectAll('.country')
          .attr('y', 16)
          .text(function (d) { return d.country; });

      label.selectAll('.npv')
          .attr('y', 34)
          .text(function (d) { return eag.dollars(d.npv); });

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

      selection.append('circle')
          .attr('class', 'hover-target')
          .attr('r', function (d) { return d.radius; })
          .on('mouseover.multiples', onMouseover)
          .on('mouseout.multiples', onMouseout);
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

    chart.cache = function(data) {
        if (arguments.length < 1) {
            return _cache;
        }
    
        _cache = data;
    
        return chart;
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
      d3.selectAll('.demographic .hover-target').remove();

      return chart;
    };

    // Private methods
    function isValid(d) {
      return !d3.select(this).classed('hidden') &&
          !isNaN(d['net present value']) &&
          d['net present value'] > 0 &&
          !isNaN(d['total benefits']);
    }

    function isInvalid(d) {
      return !isValid.call(this, d);
    }

    function onMouseover(d) {
      var translate = $(this).offset(),
        country = d.country,
        id = d.key.replace(/\s+/g, '_'),
        $tip = $('<div class="tooltip benefits"><h3></h3><img class="flag" /></div>')
            .attr('id', id).appendTo('body'),
        $table = $('<table><tr><th>Total Benefits</th><td class="total-benefits" /></tr></table>')
            .appendTo($tip);

        $tip.children('h3').text(country);
        $tip.children('.flag')
            .attr('src', 'img/flags/' + country.toLowerCase() + '.png');

        $table.find('.total-benefits').text(eag.dollars((d['gross earnings benefits'] || 0) +
          (d['unemployment effect'] || 0) +
          (d['grants effect'] || 0)));

        _fields.forEach(function (field) {
          var v = d[field];
          if (field !== 'net present value' && !isNaN(v) && v !== 0) {
            $('<tr><th>' + field + '</th><td>' + eag.dollars(v) + '</td></tr>')
                .appendTo($table);
          }
        });
        
        $('<tr><th>Net Present Value</th><td>' + eag.dollars(d['net present value']) + '</td></tr>')
            .appendTo($table);

        $tip.css({
          'left': Math.max(0, translate.left + d.radius - $tip.width() * 0.5),
          'top': Math.max(0, translate.top - $tip.height() - d.radius)
        });

        _hover = d;
    }

    function onMouseout(d) {
      $('#' + d.key.replace(/\s+/g, '_')).hide().remove();

      if (d === _hover) {
        _hover = null;
      }
    }

    return chart;
};