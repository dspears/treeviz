//module.exports = orderedGrid

function orderedGrid(d3) {
  function layout(starters) {
    var grid = {}
      , event = d3.dispatch('tick')
      , idCounter = 0
      , nodes = []
      , index = {}
      , width = 1920
      , height = 1080
      , cellWidth = 52
      , cellHeight = 14
      , cellPad = [ 4, 4, 4, 4 ]
      , cellWidthPadded = cellWidth + cellPad[1] + cellPad[3]
      , cellHeightPadded = cellHeight + cellPad[0] + cellPad[2]
      , matrix = []
      , maxCellX = Math.floor(width / cellWidthPadded)
      , maxCellY = Math.floor(height / cellHeightPadded)
      , totalCells = maxCellX * maxCellY
      , ratio = width / height
      , diameter = 50
      , alpha = 0
      , speed = 0.02
      , ease = d3.ease('linear')
      , align = [0, 0]
      , localWidth
      , localHeight
      , sort
      , rows
      , cols;

    for (var i=0; i<maxCellX+10; i++) {
      matrix[i] = [];
    }

    function recalc() {
      cellWidthPadded = cellWidth + cellPad[1] + cellPad[3];
      cellHeightPadded = cellHeight + cellPad[0] + cellPad[2];
      maxCellX = Math.floor(width / cellWidthPadded);
      maxCellY = Math.floor(height / cellHeightPadded);
      totalCells = maxCellX * maxCellY
      ratio = width / height;
    }

    grid.reset = function() {
      recalc(); // shouldn't need thi but, just for good measure.
      for (var i=0; i<maxCellX+10; i++) {
        for (var j=0; j<maxCellY+10; j++) {
          matrix[i][j] = 0;
        }
      }
      nodes = [];
    }


    function allocCell(cellX,cellY) {
      // desired cellX,Y is passed in.  Using matrix determine how
      // close we can allocate and return new cellX,Y
      var goalCellX = cellX;
      var goalCellY = cellY;
      var found = false;
      var i = 1;
      do {
        if ((matrix[cellX] === undefined) || (matrix[cellX][cellY] === undefined) || (matrix[cellX][cellY] === 0)) {
          found = true;
          matrix[cellX][cellY] = 1;
        } else {
          do {
            xy = spiralXY(i);
            cellX = xy.x+goalCellX;
            cellY = xy.y+goalCellY;
            i++;
          } while (((cellX < 0) || (cellX >= maxCellX) || (cellY < 0) || (cellY >= maxCellY)) && (i<totalCells));
          // TODO: If we run out of cells, i will be equal to totalCells.  Handle this outcome better.
        }
      } while (!found);
      return {x:cellX, y:cellY};
    }

    function spiralXY(rank) {
      var sideLength = Math.ceil(Math.sqrt(rank));
      var lowerBound = (sideLength-1)*(sideLength-1)+1;
      var upperBound = sideLength*sideLength;
      var midValue = lowerBound+(upperBound-lowerBound)/2;
      var step = Math.floor(sideLength/2);
      rank = parseInt(rank,10);
      if (rank===1) {
        return { x:0, y:0 };
      }
      if ((sideLength % 2) == 0) {
        var xOffset, yOffset;
        if (rank < midValue) {
          xOffset = step;
          // in following line, probably this would work too:  rank - (midValue - step)
          yOffset = rank - (step + lowerBound - 1);
        } else if (rank > midValue) {
          yOffset = step;
          xOffset = (step + midValue) - rank;
        } else {
          xOffset = step;
          yOffset = step;
        }
      } else {
        var xOffset, yOffset;
        if (rank < midValue) {
          xOffset = -step;
          yOffset = (midValue-step) - rank;
        } else if (rank > midValue) {
          yOffset = -step;
          xOffset = rank - (step + midValue);
        } else {
          xOffset = -step;
          yOffset = -step;
        }
      }
      return { x: xOffset, y: yOffset };
    }

    grid.sort = function(fn) {
      if (!arguments.length) return sort;
      sort = fn; return grid;
    }

    // Alignment
    // [horizontal, vertical] or both with a single boolean
    // -1 is left
    //  0 is centered
    // +1 is right
    grid.align = function(c) {
      if (!arguments.length) return c;
      align = Array.isArray(c) ? c : [c, c];
      align[0] = align[0] * 0.5 + 0.5;
      align[1] = align[1] * 0.5 + 0.5;
      return grid;
    }

    grid.width = function(w) {
      if (!arguments.length) return width;
      width = w;
      recalc();
      return grid;
    }
    grid.height = function(h) {
      if (!arguments.length) return height;
      height = h;
      recalc();
      return grid;
    }

    grid.cellWidth = function(w) {
      if (!arguments.length) return cellWidth;
      cellWidth = w;
      recalc();
      return grid;
    }

    grid.cellHeight = function(h) {
      if (!arguments.length) return cellHeight;
      cellHeight = h;
      recalc();
      return grid;
    }

    grid.cellPad = function(p) {
      if (!arguments.length) return cellPad;
      if (Array.isArray(p)) {
        switch (p.length) {
          case 1:
            cellPad = [p[0], p[0], p[0], p[0]];
            break;
          case 2:
            cellPad = [p[0], p[1], p[0], p[1]];
            break;
          case 3:
            cellPad = [p[0], p[1], p[2], p[1]];
            break;
          default:
            cellPad = [p[0], p[1], p[2], p[3]];
        }
      } else {
        cellPad = [p, p, p, p];
      }
      recalc();
      return grid;
    }



    grid.rows = function() {
      return rows;
    }
    grid.cols = function() {
      return cols;
    }
    grid.size = function() {
      return [localWidth, localHeight];
    }

    // Speed of movement when rearranging
    // the node layout
    grid.speed = function(s) {
      if (!arguments.length) return speed;
      speed = s;
      return grid;
    }

    // The distance between nodes on the grid
    grid.radius = function(d) {
      if (!arguments.length) return diameter;
      diameter = d / 2;
      return grid;
    }

    // add multiple values to the grid
    grid.add = function(arr) {
      for (var i = 0, l = arr.length; i < l; i += 1) grid.push(arr[i], true)
      return grid.update()
    }

    // add a single value to the grid
    grid.push = function(node, _noLayout) {
      if (typeof node !== 'object') node = {
        id: node
      };

      node.id = String(node.id || idCounter++);

      if (index[node.id]) return

      node.x = node.x || width/2   // x-position
      node.y = node.y || height/2  // y-position
      node.sx = node.sx || width/2  // starting x-position (for animation)
      node.sy = node.sy || height/2 // starting y-position
      node.gx = node.gx || width/2  // goal x-position
      node.gy = node.gy || height/2 // goal y-position

      index[node.id] = node
      nodes.push(node)

      return _noLayout ? grid : grid.update()
    }

  // Update the arrangement of the nodes
  // to fit into a grid. Called automatically
  // after push/add
  grid.update = function() {
    var gridLength = nodes.length;

    rows = Math.max(Math.floor(Math.sqrt(gridLength * height / width)), 1);
    cols = Math.ceil(gridLength / rows);
    localWidth = 60 * cols; // Math.min(width, diameter * cols)
    localHeight = 22 * rows; // Math.min(height, diameter * rows)

    var offsetX = (width - localWidth) * align[0]
      , offsetY = (height - localHeight) * align[1]
      , i = 0
      , node;
    var cellX, cellY;

    if (sort) nodes.sort(sort)

    toploop:
      for (var x = 0.5; x < cols; x += 1)
        for (var y = 0.5; y < rows; y += 1, i += 1) {
          node = nodes[i];
          if (!node) break toploop;
          node.gx = offsetX + localWidth * x / cols;
          node.gy = offsetY + localHeight * y / rows;
          node.sx = node.x;
          node.sy = node.y;

          goalCellX = Math.floor(node.hx / cellWidthPadded);
          goalCellY = Math.floor(node.hy / cellHeightPadded);
          xy = allocCell(goalCellX,goalCellY);
          node.gx = xy.x * cellWidthPadded;
          node.gy = xy.y * cellHeightPadded;
          //node.gx = node.hx;
          //onode.gy = node.hy;
        }

    d3.timer(grid.tick);
    alpha = 1;

    return grid;
  }

  grid.nodes = function(arr) {
    if (!arguments.length) return nodes;
    nodes = arr;
    return grid;
  }

  grid.ease = function(fn) {
    if (!arguments.length) return fn;
    if (typeof fn == 'function') {
      ease = fn;
    } else {
      ease = d3.ease.apply(d3, Array.prototype.slice.call(arguments));
    }
    return grid;
  }

  grid.tick = function() {
    var i = nodes.length
      , node
      , scaled = ease(alpha * alpha);

    while (i--) {
      node = nodes[i];
      node.x = scaled * (node.sx - node.gx) + node.gx;
      node.y = scaled * (node.sy - node.gy) + node.gy;
      if (Math.abs(node.x) < 0.0001) node.x = 0;
      if (Math.abs(node.y) < 0.0001) node.y = 0;
    }

    event.tick({ type: 'tick' });

    if (alpha < 0) return true;
    alpha -= speed;
  }

  grid.add(starters || []);

  return d3.rebind(grid, event, "on");
}

return layout
}
