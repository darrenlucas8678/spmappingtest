requirejs.config({
    paths: {
        app:  'scripts/app',
        d3 :  'lib/d3',
        jquery: 'lib/jquery',
        lodash:  'lib/lodash'
    }
});

requirejs( ['jquery','lodash', 'd3'],
    function ($, _, d3) {
        console.log(d3)
    });