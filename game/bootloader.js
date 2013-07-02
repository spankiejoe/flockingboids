requirejs(['components/runner', 'fb'],
    function (Runner, FlockingBoids) {
        new Runner({'game': FlockingBoids});
});