define(function () {

    return {
        'clone': (function () {
            return function (obj) {
                Clone.prototype = obj;
                return new Clone()
            };
            function Clone() {
            }
        }()),
        'adjust': function (value, istart, istop, ostart, ostop) {
            return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
        }
    };


});