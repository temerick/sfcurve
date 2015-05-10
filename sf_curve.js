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
      width = 500,
      height = 500,
      powerOfTwo = 5,
      size = Math.pow(2, powerOfTwo),
      points = lattice(size),
      currPos = [0, 0],
      direction = 1,
      selectedRangeSizes = [],
      coordList = listFromString(buildHilbertCurve(points.length), currPos, direction),
      lineList = _.map(_.range(coordList.length-1), function(i) { return [coordList[i], coordList[i+1]] });
      xscale = d3.scale.linear().domain([0, size]).range([5, width-5]),
      yscale = d3.scale.linear().domain([0, size]).range([5, height-5]),
      dragger = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("drag", dragging),
        //.on("dragend", dragend),
      svg = d3.select("#sfcurve")
        .append("svg")
        .attr('width', width)
        .attr('height', height)
        .append("g")
        .classed("graph", true),
      rect = svg.append("rect")
        .attr({ 
          "width": "100%",
          "height": "100%",
          "opacity": 0.0 
        })
        //.on("click", click)
        .on("mouseout", mouseout)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mousedown", mousedown)
        .on("mouseup", mouseup)
        /*.call(dragger)*/,
      clickPt = {'x': 0, 'y': 0},
      selRect = svg.append("rect")
        .attr({
          "stroke": "blue",
          "fill": "blue",
          "stroke-width": 1,
          "opacity": 0.0,
          "pointer-events": "none"
        }),
      lines = [],
      done = false,
      line = d3.svg.line()
        .x(function(d) { return xscale(d[0]); })
        .y(function(d) { return yscale(d[1]); }),
      svg_lines = svg.append('path')
        .datum(lines)
        .attr({
          'class': 'line',
          'd': line,
          'pointer-events': 'none'
        }),   
      points = svg.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr({
          'cx': function(d) { return xscale(d[0]); },
          'cy': function(d) { return yscale(d[1]); },
          'r': 2,
          'pointer-events': 'none'
        }),
      focusLineX = svg.append("line")
        .attr({ 
          "id": "focusLineX", 
          "stroke": "blue", 
          "stroke-width": 1, 
          "opacity": 0.5,
          "y1": 0, 
          "y2": height,
          "pointer-events": "none"
        }),
      focusLineY = svg.append("line")
        .attr({ 
          "id": "focusLineY", 
          "stroke": "blue", 
          "stroke-width": 1, 
          "opacity": 0.5, 
          "x1": 0,
          "x2": width,
          "pointer-events": "none"
        }),
      i = 0;
  
  function mousemove() {
    var m = d3.mouse(this);
    d3.select("#focusLineX")
      .attr({"x1": m[0], "x2": m[0]});
    d3.select("#focusLineY")
      .attr({"y1": m[1], "y2": m[1]});
  }
  function mousemovealt(m) {
    d3.select("#focusLineX")
      .attr({"x1": m[0], "x2": m[0]});
    d3.select("#focusLineY")
      .attr({"y1": m[1], "y2": m[1]});
  }
  function mouseover() {
    d3.select("#focusLineX").attr("opacity", 0.5);
    d3.select("#focusLineY").attr("opacity", 0.5);
  }
  function mouseout() {
    d3.select("#focusLineX").attr("opacity", 0.0);
    d3.select("#focusLineY").attr("opacity", 0.0);
  }
  function mousemovedraw() {
    var m = d3.mouse(this),
        rectMinX = Math.min(m[0], clickPt[0]),
        rectWidth =  Math.abs(m[0] - clickPt[0]),
        rectMinY = Math.min(m[1], clickPt[1]),
        rectHeight = Math.abs(m[1] - clickPt[1]);
    selRect.attr({
      "x": rectMinX,
      "width": rectWidth,
      "y": rectMinY,
      "height": rectHeight 
    });
    function inRect(d) {
      var dx = xscale(d[0]),
          dy = yscale(d[1]);
      return dx > rectMinX && 
             dx < rectMinX + rectWidth && 
             dy > rectMinY && 
             dy < rectMinY + rectHeight;
    }
    d3.selectAll('circle')
      .attr({
        'fill': function(d) {
          return (inRect(d)) ? 'blue' : 'black';
        },
        'r': function(d) {
          return (inRect(d)) ? 4 : 2;
        } 
    });
    d3.selectAll('.selectedline')
      .attr('opacity', function(d) {
          console.log('a');
          return (inRect(d[0]) && inRect(d[1])) ? 1 : 0;
      });
    var currRangeSize = 0,
        rangeSizes = [],
        inRange = false;
    for(var i = 0; i < coordList.length; i++) {
      if(inRange && inRect(coordList[i])) currRangeSize += 1;
      else if(inRange) { // not in rect, end of current range.
        rangeSizes.push(currRangeSize);
        inRange = false;
        currRangeSize = 0;
      } else if(inRect(coordList[i])) {
        inRange = true;
        currRangeSize += 1;
      }
    }
    selectedRangeSizes = rangeSizes;
    showText();
  }
  function mouseup() {
    rect.on("mousemove", mousemove);
  }
  function mousedown() {
    var point = d3.mouse(this);
    clickPt = point;
    selRect.attr("opacity", 0.5);
    rect.on("mousemove", mousemovedraw);
  }
  function dragging(d, i) {
    selRect.attr({
      "x":      Math.min(d.dx+d.x, d.x),
      "width":  Math.abs(d.dx),
      "y":      Math.min(d.dy+d.y, d.y),
      "height": Math.abs(d.dy)
    });
  }
  function showText() {
    d3.select('#text')
      .data([selectedRangeSizes])
      .text(function(d) { return "There are "+d.length+" ranges with a mean length of "+(d.reduce(function(a, b) { return a+b; })/d.length)+"."; });
  }
  function listFromString(s, startPos, startDir) {
    var result = [startPos],
        currDir = startDir,
        currPos = startPos;
    for(var i = 0; i < s.length; i++) {
      var currChar = s[i];
      if(currChar=='F') {
        var newPos = 
          (currDir < 2) ? 
            [currPos[0]+(currDir%2), currPos[1]+((currDir+1)%2)] : 
            [currPos[0]-(currDir%2), currPos[1]-((currDir+1)%2)];
        result.push(newPos);
        currPos = newPos;
      } else if(currChar=='+') {
        currDir = (currDir + 1) % 4;
      } else if(currChar=='-') {
        currDir = (currDir + 3) % 4;
      }
    }
    return result;
  }
   
  function tick() {
    if(i < coordList.length) {
      lines.push(coordList[i]);
      i += 1;
      svg_lines
        .attr('d', line)
        .attr('transform', null)
        .transition()
        .duration(Math.round(125/(speed*powerOfTwo)))
        .ease("linear")
        .each("end", tick);
    }
  }
  tick();
  svg.selectAll('.selectedline')
    .data(lineList)
    .enter()
    .append('line')
    .classed('selectedline', true)
    .attr({
      'x1': function(d) { return xscale(d[0][0]); },
      'x2': function(d) { return xscale(d[1][0]); },
      'y1': function(d) { return yscale(d[0][1]); },
      'y2': function(d) { return yscale(d[1][1]); },
      'stroke': 'blue',
      'stroke-width': 3,
      'opacity': 0
    });
}
