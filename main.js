require.config({
    baseUrl: '/scripts/lib',
    paths: {
        app: '../app'
    }
});

require(['jquery', 'lodash', 'd3', 'topojson'],
    function ($, _, d3, topojson) {
        var width = 960,
            height = 500,
            active = d3.select(null);

        var projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);
        var svg = d3.select('#map').insert('svg')
            .attr('width', width)
            .attr('height', height);

        svg.append('rect')
            .attr('class', 'background')
            .attr('width', width)
            .attr('height', height)
            .on('click', reset);

        var g = svg.append('g')
            .style('stroke-width', '1.5px');
       
      var zoom =  svg.call(d3.zoom().on('zoom', zoomed));

        d3.json('data/us.json', function (error, us) {
            if (error) throw error;

            g.selectAll('path')
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append('path')
                .attr('d', path)
                .attr('class', 'feature')
                .on('click', clicked);

            g.append('path')
                .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
                .attr('class', 'mesh')
                .attr('d', path);
        });

        function zoomed() {
            this.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }

        function clicked(d) {
            if (active.node() === this) return reset();
            active.classed('active', false);
            active = d3.select(this).classed('active', true);
            d3.selectAll('.feature').filter(':not(.active)')
                .transition().duration(750).style('opacity', '.5');
            if (d.id === 39) {
                d3.json('data/ohio.json', showLocations);
            }

            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2;
            var scale = .9 / Math.max(dx / width, dy / height);
            var translate = [width / 2 - scale * x, height / 2 - scale * y];
            
            var transform = d3.zoomIdentity.translate(width / 2 - scale * x, height / 2 - scale * y).scale(scale);

            g.transition()
                .duration(750)
                .attr('transform',transform);
        }

        function reset() {
            active.classed("active", false);
            active = d3.select(null);

            g.transition()
                .duration(750)
                .attr('transform','')
                .selectAll('.feature').classed('inactive', false);

            // g.transition()
            //     .duration(750)
            //     .style('stroke-width', '1.5px')
            //     .attr('transform', '')
            //     .selectAll('.cities')
            //     .attr('d', path.pointRadius(6));
        }

        function listLocations(d) {

        }

        function showLocations(error, locations) {
            g.selectAll('.cities')
                .data(locations.features)
                .enter()
                .append('path')
                .attr('class', 'cities')
                .attr('d', path.pointRadius(6 / d3.event.scale));

            locations.features.map(function (location) { $('#locations').append(location.properties.NAME); });
        }
    });