/**
 *
 * Render treemap of large datasest using D3, with ability to search and display search results.
 *
 * @author David Spears
 */
var // w = 1280 - 80,
  margin = m = 0,
  h = window.innerHeight - margin*2, //(900 - 180),
  w = window.innerWidth - margin*2,  // Math.floor(h*1.618),
  wM = w + margin * 2,
  hM = h + margin * 2,
  x = d3.scale.linear().range([0, w]),
  y = d3.scale.linear().range([0, h]),
  color = d3.scale.category20c(),
  root,
  active = d3.select(null),
  node;


var zoomBehavior = d3.behavior.zoom()
  .translate([0, 0])
  .scale(1)
  .scaleExtent([1, 20])
  .size(wM,hM)
  .on("zoom", zoomed)

var treemap = d3.layout.treemap()
  .round(false)
  .size([w, h])
  .sticky(true)
  .value(function(d) {
    // console.log(d);
    return d.row.numDescendantLeaves==0 ? 5 : d.row.numDescendantLeaves; });

var svg = d3.select("#body").append("div")
  .attr("class", "chart")
  .style("width", wM + "px")
  .style("height", hM + "px")
  .append("svg:svg")
  .attr("width", wM)
  .attr("height", hM);


// Define the gradient
var gradient = svg.append("svg:defs")
  .append("svg:linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%") // 0%
  .attr("y1", "0%")
  .attr("x2", "50%") // 100%
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

// Define the gradient colors
gradient.append("svg:stop")
  .attr("offset", "0%")
  .attr("stop-color", "#d9d9d9")
  .attr("stop-opacity", 1);

gradient.append("svg:stop")
  .attr("offset", "100%")
  .attr("stop-color", "#efefef")
  .attr("stop-opacity", 1);

zoomBehavior(svg);

svg = svg
  .append("svg:g")
  .attr("transform", "translate("+margin+","+margin+")");


d3.json("../query.php?t=tree", function(data) {
  node = root = data;


  var nodes;
  var nodes = treemap.nodes(root);

  nodes = nodes.filter(function(d) { return !d.children; });

  var nodeMap = {};
  for (i=0; i<nodes.length; i++) {
    nodeMap[nodes[i].row.treepath] = i;
    var numTiles = parseInt(nodes[i].row.numLeaves,10);
    nodes[i].numTiles = numTiles;
    if (numTiles > 0) {
      // Calculate size of square to hold the number of tiles
      var side = Math.ceil(Math.sqrt(numTiles));
      nodes[i].tilesPerSide = side;
      nodes[i].numTileCells = side*side;
      // Calculate width of each tile.  This will be a float.
      nodes[i].tileWidth = nodes[i].dx / side;
      // Ditto with height.
     nodes[i].tileHeight = nodes[i].dy / side;
      /* Given these caclulations, we can now look at the query results and given the rank of each
         result, we need to figure out where it's tile is actually located.  We'll have a map of
         the spiral that we can index into to get the xTileNumber and yTileNumber.  We then
         compute the offset as:
             xTileOffset = xTileNumber * tileWidth + parent node's x.
             yTileOffset = yTileNumber * tileHeight + parent node's y.
             can also get the center by adding half a tile width and have a tile height to these.
         So next step is:  create the spiral tile map.
       */
    }
  }

  /**   21 22 23 24  25
   *    20  7  8  9  10
   *    19  6  1  2  11
   *    18  5  4  3  12
   *    17 16 15 14  13
   *
   * @param rank
   */
  function rankToTileXY(rank) {
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
  window.rankToTileXY = rankToTileXY;


  window.nodeMap = nodeMap;



  var cell = svg.selectAll("g")
    .data(nodes)
    .enter().append("svg:g")
    .attr("class", "cell")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  cell.append("svg:rect")
    .attr("width", function(d) { return d.dx - 1; })
    .attr("height", function(d) { return d.dy - 1; })
    .style("fill", function(d) { return "url(#gradient)"; });  // color(d.parent.row.nodeName);

  cell.append("svg:text")
    .attr("x", function(d) { return d.dx-5; })
    .attr("y", function(d) { return 5; })
    .attr("dy", ".55em")
    .attr("text-anchor", "end")
    .text(function(d) { return d.row.nodeName; })
    .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

  // After structure tree is rendered, perform query for set of results.
  // Use the nodeMap to find out where each result should be anchored on the page
  // based upon it's treepath value.

  var nodeWidth = 72;
  var nodeHeight = 16;
  var rCenterX = nodeWidth / 2;
  var rCenterY = nodeHeight / 2;
  var fontSize = 14;

  var grid = orderedGrid(d3);

  var layout = grid()
    .width(w)
    .height(h)
    .radius(110)
    .align(0)
    .cellWidth(nodeWidth)
    .cellHeight(nodeHeight)
    .ease('back', 2);

  d3.json("../query.php?t=top100", function(data) {
    updateResults(data);

  });

  var tileWidth = 3;
  var tileHeight = 2;

  function updateResults(data) {

    var gnodes = svg
      .selectAll('.gnode')

    layout.on('tick', function() {
      gnodes
        .attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    });

    for (ix=0; ix<data.length; ix++) {
      var homePx = homePixel(data[ix]);
      data[ix].hx = homePx.x;
      data[ix].hy = homePx.y;
    }
    gdata = data;
    window.gdata = gdata;

    var tiles = svg.selectAll('.tile')
      .data(data, function(d){ return d.url; });

    tiles.enter()
      .append('rect')
      .classed('tile',true)
      .attr('x', function(d) { return d.hx })
      .attr('y', function(d) { return d.hy })
      .attr('width',tileWidth)
      .attr('height',tileHeight)
      .attr('fill','red');

    tiles.exit()
      .remove();

    layout.reset();
    layout.add(gdata);

    gnodes = gnodes.data(layout.nodes(),function(d){ return d.url; });

    gnodes.exit()
      .remove();

    ggroups = gnodes.enter()
      //.append('rect')
      .append("svg:g")
      .classed('gnode', true)
      .attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; });


    ggroups.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .style('fill', '#3F9AE5') //'#a1a5ae')
      .style('stroke', '#3F9AE5')
      .style('stroke-width', '1px');

    ggroups.append("svg:text")
      .attr("x", rCenterX) // function(d) { return d.dx / 2; })
      .attr("y", rCenterY) // function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("color",'white')
      .text(function(d) { return d.site; })
      .style("font-size", function(d) { return Math.min(fontSize,((nodeWidth - 4) / this.getComputedTextLength() * 10)) + "px"; })


    /** END OF ORDERED GRID STUFF **/

    var useForce = false;
    if (useForce) {
      var force = d3.layout.force()
        .nodes(data)
        .links([])
        .gravity(0)
        .charge(0)
        .size([w, h])
        .on("tick", tick)
        .start();

      window.theForce = force;

      var platforms = svg.selectAll('.plat');


      var plat = platforms.data(data)
        .enter().append("svg:g")
          .attr('class','plat')
          .attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      plat.append("rect")
          .attr('x', 0) // function(d) { return d.x; })// Set center of circle to the x,y computed by the force layout.
          .attr('y', 0) // function(d) { return d.y; })
          .attr('height', nodeHeight)
          .attr('width', nodeWidth)
          .style('fill','#81858e')
          .attr('title',function(d,i) {return i+':'+d.url+', '+ d.treepath;})
          .style('stroke','#333333')
          .call(force.drag);

      plat.append("svg:text")
        .attr("x", rCenterX) // function(d) { return d.dx / 2; })
        .attr("y", rCenterY) // function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.site; })
        .style("font-size", function(d) { return Math.min(10,((nodeWidth - 4) / this.getComputedTextLength() * 10)) + "px"; })

    }


    function tick(e) {
      var k = .1 * e.alpha;
      var useHomePixel = true;

      // Push nodes toward their designated focus.
      data.forEach(function(o, i) {
        var n=nodes[nodeMap[o.treepath]];
        if (o.treepath === 'root.country-code.hk') {
          //console.log('hk', o, n);
        }
        if (useHomePixel) {
          var home = homePixel(o);
          var xTarget = home.x;
          var yTarget = home.y;
        } else {
          var xTarget = n.x + n.dx/2;
          var yTarget = n.y + n.dy/2;
        }
        o.y += (yTarget - o.y) * k; // (foci[o.id].y - o.y) * k;
        o.x += (xTarget - o.x) * k; // (foci[o.id].x - o.x) * k;
      });

      svg.selectAll('.plat')
        .each(collide(0.5))
        .attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    }

    var resultWidth = 50;
    var resultHeight = 14;

    var xpadding = 12;
    var ypadding = 4;
    var padding = 4;
    var clusterPadding = 6;
    var resultWidthWithPad = resultWidth + xpadding;
    var resultHeightWithPad = resultHeight + ypadding;
    var resultWidthOver2 = resultWidthWithPad / 2;
    var resultHeightOver2 = resultHeightWithPad / 2;
    var maxRadius = resultWidth/2;

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(data);
      return function(d) {
        var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
          nx1 = d.x, // r ,
          nx2 = d.x + resultWidthWithPad, // r,
          ny1 = d.y, // r,
          ny2 = d.y + resultHeightWithPad; // r
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var     x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = 125; // d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
            var xMax = d.x+resultWidthWithPad;
            var yMax = d.y+resultHeightWithPad;

            if (    ((d.x  < quad.point.x+resultWidthWithPad  && d.x > quad.point.x-xpadding )
              || (xMax < quad.point.x+resultWidthWithPad  && xMax > quad.point.x-xpadding))
              &&   ((d.y  < quad.point.y+resultHeightWithPad && d.y > quad.point.y )
              || (yMax < quad.point.y+resultHeightWithPad && yMax > quad.point.y))
              ) {

              //if (x < resultWidthWithPad && y < resultHeightWithPad) {
              //if (l < r) {
              l = (l - r) / l * alpha * 0.02;
              deltaX = (quad.point.x - d.x)/resultWidthWithPad * alpha;
              deltaY = (quad.point.y - d.y)/resultHeightWithPad * alpha;
              deltaX = deltaY = l;
              d.x -= x *= deltaX;
              d.y -= y *= deltaY;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

  };

  function homePixel(o) {
    var n=nodes[nodeMap[o.treepath]];
    // Spiral layout
    var tileXY = rankToTileXY(o.localRank);
    tileXY.x = n.x+n.tileWidth*(n.tilesPerSide/2+tileXY.x);
    tileXY.y = n.y+ n.tileHeight*(n.tilesPerSide/2+tileXY.y);
    return tileXY;

  }

  d3.select("select").on("change", function() {
    treemap.value(this.value == "size" ? size : count).nodes(root);
    zoom(node);
    theForce.resume();
  });


  $('#go').on('click',function() {
    var s = $('#searchstring').val();
    console.log("Search for "+s);
    // TODO: Need to encode s for handling special chars like: &
    d3.json("../query.php?t=q&s="+s, function(data) {
      updateResults(data);
    });
    return false;
  });


});

function size(d) {
  //return d.size;
  return d.row.numDescendantLeaves;
}

function count(d) {
  return 1;
}

function endall(transition, callback) {
  var n = 0;
  transition
    .each(function() { ++n; })
    .each("end", function() { if (!--n) callback.apply(this, arguments); });
}




function zoom(d) {
  var kx = w / d.dx, ky = h / d.dy;
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, d.y + d.dy]);

  var t = svg.selectAll("g.cell").transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });


  t.select("rect")
    .attr("width", function(d) { return kx * d.dx - 1; })
    .attr("height", function(d) { return ky * d.dy - 1; });


  t.select("text")
    .attr("x", function(d) { return kx * d.dx / 2; })
    .attr("y", function(d) { return ky * d.dy / 2; })
    .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });


  node = d;
  d3.event.stopPropagation();

}

/** New zooming **/

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var dx = d.dx,
    dy = d.dy,
    x = d.x,
    y = d.y,
    scale = .9 / Math.max(dx / width, dy / height),
    translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
    .duration(750)
    .call(zoom.translate(translate).scale(scale).event);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
    .duration(750)
    .call(zoom.translate([0, 0]).scale(1).event);
}

var lastScale = -1;
var translations = [];


function zoomed() {
  console.log(d3.event.translate,d3.event.scale,'lastScale: ',lastScale);
  if (d3.event.scale !== lastScale) {
    var xLate = d3.event.translate;


    if (d3.event.scale < 1.05) {
      xLate = m+","+m;
      var t= zoomBehavior.translate();
      console.log("Doing translate 0,0.  behavior value:",t);
    }
    svg
      .transition()
      .duration(1000)
      .attr("transform", "translate(" + xLate + ")scale(" + d3.event.scale + ")")
      .each("end", (function(scale) {
        return function() {
          console.log('zoom transition ended');
          if (scale < 1.05) {
            console.log('setting behavior translate to 0,0.  scale is:',scale);
            zoomBehavior.translate([m,m]);
          }
          if (scale > 16) {
            console.log('show tiles');
            /*
              We need to know which parent nodes are visible in the viewport.
              Then we need to know which parts of the parent nodes are visible.
              Then we need to know which tiles should be visible.
              Need to query the server for the detailed information on those tiles.
                This should be cached locally for later reuse.
                We could query a larger region in case the user pans.
              Then we render those tiles, adding them to the svg.
             */
          } else {
            console.log('hide tiles');
          }
        } })(d3.event.scale) );
    lastScale = d3.event.scale;
  } else {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}


