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

        d3.json('data/us.json', function (error, us) {
            if (error) throw error;

            g.selectAll('path')
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append('path')
                .attr('d', path)
                .attr('class', 'feature')
                .on('click', clicked)
                .on('zoom', zoomed);

            g.append('path')
                .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
                .attr('class', 'mesh')
                .attr('d', path);
        });
        
        function zoomed(d)
        {

        }

        function clicked(d) {
            if (active.node() === this) return reset();
            active.classed('active', false);
            d3.selectAll('path')
            .attr('class','feature zoom inactive');
            active = d3.select(this).classed('active', true);
            

            if (d.id === 39) {
                d3.queue()
                    .defer(d3.json, 'data/ohio.json')
                    .await(showLocations);
            }

            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];
         
             

            g.transition()
                .duration(750)
                .style('stroke-width', 1.5 / scale + 'px')                
                .attr('transform', 'translate(' + translate + ')scale(' + scale + ')')
                .selectAll('.cities')
                .attr('d', path.pointRadius(2));
        }

        function reset() {
            active.classed('active', false);
            active = d3.select(null);

            g.transition()
                .duration(750)
                .style('stroke-width', '1.5px')
                .attr('transform', '');
        }

        function listLocations(d) {

        }

        function showLocations(error, locations) {
            g.selectAll('.cities')
                .data(locations.features)
                .enter()
                .append('path')             
                .attr('class', 'cities');

            locations.features.map(function (location) { $('#locations').append(location.properties.NAME); });
        }
    });