var eag = eag || {};

eag.bubble = function () {
  // Private member variables.
  var _force = d3.layout.force().charge(charge).gravity(0)
      .linkDistance(function (l) { return l.source.radius + l.target.radius; }),
    _size = [900, 500],
    _gravity = 0.1,
    _padding = 5,
    _colWidth = 100,
    _arc = d3.svg.arc().startAngle(0).endAngle(2 * Math.PI)
        .innerRadius(0).outerRadius(function (d) { return d.radius; }),
    _hover = null;

  function chart(g) {
    var selection = g.filter(isValid),
      countries = selection.filter(function (d) {
        return d.value['private'].type === 'country';
      }),
      average = selection.filter(function (d) {
        return d.value['private'].type === 'average';
      });

    var nodes = d3.map({}),
        links = [];

    // Fade out all invalid entries
    g.filter(isInvalid)
      .transition().duration(750)
        .style('opacity', 0);

    var path = selection.selectAll('path')
        .data(function (d) { return [d]; },
          function (d) { return d.key + ' net present value'; });

    path.enter().append('path');

    path.attr('d', _arc)
        .attr('class', 'net-present-value');
    countries.selectAll('path')
        .on('mouseover.bubble', showTooltip)
        .on('mouseout.bubble', hideTooltip);

    path.exit().remove();

    selection.selectAll('.label').remove();

    countries.data().forEach(function (d) {
      nodes.set(d.key, d);

      var linkKey = d.key;

      if (linkKey.indexOf('female') >= 0) {
        linkKey.replace('female', 'male');
      } else {
        linkKey.replace('male', 'female');
      }

      if (nodes.has(linkKey)) {
        links.push({
          'source': d,
          'target': nodes.get(linkKey)
        });
      }
    });

    countries.transition().duration(750)
        .attr('transform', function (d) {
          if (!d.x) {
            d.x = Math.random() * 1000;
          }

          if (!d.y) {
            d.y = Math.random() * 1000;
          }

          return 'translate(' + d.x + ',' + d.y + ')';
        })
        .style('opacity', 1);

    average.transition().duration(750)
        .attr('transform', function (d) {

          switch(d.key) {
          case 'OECD average tertiary male':
            d.x = _size[0] * 0.25 - _colWidth * 1.5;
            break;

          case 'OECD average tertiary female':
            d.x = _size[0] * 0.25 - _colWidth * 0.5;
            break;

          case 'EU21 average tertiary male':
            d.x = _size[0] * 0.25 + _colWidth * 0.5;
            break;

          case 'EU21 average tertiary female':
            d.x = _size[0] * 0.25 + _colWidth * 1.5;
            break;

          case 'OECD average post-secondary male':
            d.x = _size[0] * 0.75 - _colWidth * 1.5;
            break;

          case 'OECD average post-secondary female':
            d.x = _size[0] * 0.75 - _colWidth * 0.5;
            break;

          case 'EU21 average post-secondary male':
            d.x = _size[0] * 0.75 + _colWidth * 0.5;
            break;

          case 'EU21 average post-secondary female':
            d.x = _size[0] * 0.75 + _colWidth * 1.5;
            break;

          default:
            d.x = 0;
            break;
          }

          return 'translate(' + d.x + ',' + (-_colWidth / 2) + ')';
        })
        .style('opacity', 1);

    average.selectAll('.label').data(function (d) {
        return [d.value['private']['gender']];
      })
      .enter().append('text')
        .attr('class', 'label')
        .attr('dy', function (d) {
          var fs = Number(d3.select(this).style('font-size').slice(0, -2));
          return (fs * 0.25) + 'px';
        })
        .text(function (d) { return d; });

    average.filter(function (d) { return d.key.indexOf('female') < 0; })
        .selectAll('.title').data(function (d) { return [d.value['private']['country']]; })
      .enter().append('text')
        .attr('class', 'title')
        .attr('y', _colWidth * 0.5)
        .attr('x', _colWidth * 0.5)
        .text(String);

    _force.nodes(nodes.values()).links(links).on('tick', function (e) {
      var targetY = _size[1] * 0.5,
        nodeList = nodes.values();

      for (var i = 0; i < nodeList.length; i++) {
        var d = nodeList[i],
          targetX = _size[0] * ((d.key.indexOf('tertiary') >= 0) ? 0.3 : 0.7);

        d.x += (targetX - d.x) * _gravity * e.alpha;
        d.y += (targetY - d.y) * _gravity * e.alpha;

        d.x = Math.min(_size[0] - d.radius, Math.max(d.x, d.radius));
        d.y = Math.min(_size[1] - d.radius, Math.max(d.y, d.radius));
      }

      countries.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    }).start();
  }

  chart.axes = function (g) {
    g.each(function (d) {
      var that = d3.select(this);

      d3.selectAll(this.childNodes).remove();

      that.attr('transform', function() {
        if (that.classed('x')) {
          return 'translate(0,' + (_size[1]/2) + ')rotate(-90)';
        }

        return 'translate(' + _size[0] + ',' + (_size[1]/2) + ')rotate(90)';
      }).append('text')
          .attr('class', 'title')
          .text(function () {
            return that.classed('x') ? 'Tertiary' : 'Post-Secondary';
          });
    });
  };

  chart.colWidth = function(colWidth) {
      if (arguments.length < 1) {
          return _colWidth;
      }
  
      _colWidth = colWidth;
  
      return chart;
  };

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
    _hover = null;

    d3.selectAll('.demographic path')
        .on('mouseover.bubble', null)
        .on('mouseout.bubble', null);
    
    // Stop the force layout
    _force.nodes([])
        .links([])
        .stop();

    return chart;
  };

  // Private methods.
  function charge(d) {
    return isNaN(d.radius) ? 0 : -Math.pow(d.radius, 2) / 8;
  }

  function showTooltip (d) {
    var translate = $(this).offset(),
      country = d.value['private'].country,
      id = d.key.replace(/\s+/g, '_'),
      $tooltip = $('<div class="tooltip"><h3></h3><img class="flag" /><div class="clearfix" /></div>')
          .attr('id', id).appendTo('body'),
      $bars = $('<div class="bars"></div>').appendTo($tooltip),
      width = d3.scale.linear().range([0, $tooltip.width()])
          .domain(eag.area.domain());

    d3.selectAll('.demographic').filter(function (d) {
      return d.value['private'].country === country &&
        !isNaN(d.value['private']['net present value']) &&
        d.value['private']['net present value'] !== 0;
    }).sort(function (a, b) {
      return b.value['private']['net present value'] - a.value['private']['net present value'];
    }).data().forEach(function (el) {
      var $bar = $('<div class="bar" />')
          .addClass(el.key)
          .text(eag.dollars(el.value['private']['net present value']))
          .appendTo($bars);
      $('<div class="fill net-present-value" />')
            .width(width(el.value['private']['net present value']))
            .appendTo($bar);
    });

    $tooltip.children('h3').text(country);
    $tooltip.children('.flag')
      .attr('src', 'img/flags/' + country.toLowerCase() + '.png');

    $tooltip.css({
        'left': Math.max(0, translate.left + d.radius - $tooltip.outerWidth() * 0.5),
        'top': Math.max(0, translate.top - $tooltip.outerHeight() - 5)
      });

    _hover = d;
    d3.selectAll('.demographic').classed('unfocused', function (d) {
      return d.value['private'].type !== 'average' &&
        d.value['private'].country !== _hover.value['private'].country;
    });
  }

  function hideTooltip(d) {
    $('#' + d.key.replace(/\s+/g, '_')).hide().remove();
    if (d === _hover) {
      _hover = null;
      d3.selectAll('.demographic').classed('unfocused', false);
    }
  }

  function isValid(d) {
    return !d3.select(this).classed('hidden') &&
      !isNaN(d.value['private']['net present value']);
  }

  function isInvalid(d) {
    return !isValid.call(this, d);
  }

  function titleTransform(d, i) {
    var x = 0,
      y = _size[1] / 2,
      theta = -90;
    if (i > 0) {
      x = _size[0] - 18;
      theta = 90;
    }

    return 'translate(' + x + ',' + y + ') rotate(' + theta + ')';
  }

  
  return chart;
};