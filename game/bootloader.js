requirejs(['runner', 'rb'],
    function (Runner, ReynoldsBoids) {
        new Runner({'game': ReynoldsBoids});
});