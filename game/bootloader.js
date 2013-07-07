requirejs.config({
	urlArgs: "bust=" +  (new Date()).getTime(),
    shim: {
        'components/gui': {
            exports: 'dat.gui.GUI'
        }
    }
});

requirejs(['components/runner', 'fb'],
    function (Runner, FlockingBoids) {
        new Runner(FlockingBoids, {});
});