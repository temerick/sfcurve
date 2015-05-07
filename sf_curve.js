function cartesianProductOf() {
    return _.reduce(arguments, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
};

function lattice(n, m) {
  return cartesianProductOf(_.range(n), _.range(m));
}
function lattice(n) {
  return cartesianProductOf(_.range(n), _.range(n));
}

function buildHilbertCurve(size) {
  var result = 'A';
  while((result.match(/F/g) || []).length < size-1) {
    result = _.map(result, function(char) {
      if(char == 'A') {
        return '-BF+AFA+FB-';
      } else if(char == 'B') {
        return '+AF-BFB-FA+';
      } else {
        return char;
      }
    }).join("").replace(/\+\-/g, "").replace(/\-\+/g, "");
  }
  return result;
}

function buildMooreCurve(size) {
  var result = "AFA+F+AFA";
  while((result.match(/F/g) || []).length < size-1) {
    result = _.map(result, function(char) {
      if(char == 'A') {
        return '-BF+AFA+FB-';
      } else if(char == 'B') {
        return '+AF-BFB-FA+';
      } else {
        return char;
      }
    }).join("").replace(/\+\-/g, "").replace(/\-\+/g, "");
  }
  return result;
}

function drawSfCurve() {
  var speed = 8,
      powerOfTwo = 6,
      size = Math.pow(2, powerOfTwo),
      points = lattice(size),
      directions = buildHilbertCurve(points.length),
      xscale = d3.scale.linear().domain([0, size]).range([5, 495]),
      yscale = xscale,
      svg = d3.select("#sfcurve")
        .append("svg")
        .attr('width',500)
        .attr('height',500)
        .append("g")
        .classed("graph", true),
      points = svg.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr({
          'cx': function(d) { return xscale(d[0]); },
          'cy': function(d) { return yscale(d[1]); },
          'r': 2
        }),
      currPos = [0, 0],
      direction = 1,
      lines = [currPos],
      done = false,
      line = d3.svg.line()
        .x(function(d) { return xscale(d[0]); })
        .y(function(d) { return yscale(d[1]); }),
      svg_lines = svg.append('path')
        .datum(lines)
        .attr('class', 'line')
        .attr('d', line),
      i = 0;
  
  function tick() {
    if(i < directions.length) {
      var currDir = directions[i];
      i += 1;
      if(currDir=='F') {
        var newPos = [];
        if(direction < 2) {
          newPos = [currPos[0]+(direction%2), currPos[1]+((direction+1)%2)];
        } else {
          newPos = [currPos[0]-(direction%2), currPos[1]-((direction+1)%2)];
        }
        lines.push(newPos);
        currPos = newPos;
        svg_lines
          .attr('d', line)
          .attr('transform', null)
          .transition()
          .duration(Math.round(125/(speed*powerOfTwo)))
          .ease("linear")
          .each("end", tick);
      } else {
        if(currDir=='+') {
          direction = (direction + 1) % 4;
        } else if(currDir=='-') {
          direction = (direction + 3) % 4;
        }
        tick();
      }
    }
  }
  tick();
}
