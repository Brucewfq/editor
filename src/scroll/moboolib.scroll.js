/**
 * Created by FaqunWan on 2017/6/9.
 */
var MobooLib = MobooLib || {};
MobooLib.Scroll = function (container, config) {
    this.scrollContainer = container;
    //
    this.onScrollingListener = null;
    this.onScrollEndListener = null;
    //
    this.firstX = 0;
    this.firstY = 0;
    this.preX = 0;
    this.preY = 0;
    this.lastX = 0;
    this.lastY = 0;
    //
    this.firstT = 0;
    this.preT = 0;
    this.lastT = 0;

    this.init();
};
MobooLib.Scroll.prototype = {
    constructor: MobooLib.Scroll,
    setOnScrollingListener: function (listener) {
        this.onScrollingListener = listener;
    },
    setOnScrollEndListener: function (listener) {
        this.onScrollEndListener = listener;
    },
    init: function () {

        var that = this;
        var startFun = this.bindAsEventListener(that, that.start);
        var moveFun = this.bindAsEventListener(that, that.move);
        var endFun = this.bindAsEventListener(that, that.end);

        this.scrollContainer.addEventListener("touchstart", startFun, false);
        this.scrollContainer.addEventListener("touchmove", moveFun, false);
        this.scrollContainer.addEventListener("touchend", endFun, false);

    },
    bindAsEventListener: function (object, fun) {
        return function (event) {
            return fun.call(object, (event || window.event));
        }
    },
    start: function (event) {
        event.preventDefault();

        this.preX = event.touches[0].pageX;
        this.preY = event.touches[0].pageY;
        this.preT = new Date().getTime();

        //
        this.firstX = this.preX;
        this.firstY = this.preY;
        this.firstT = this.preT;
        //
        this.lastX = this.preX;
        this.lastY = this.preY;
    },
    move: function (event) {
        event.preventDefault();

        if (event.touches.length == 1) {
            this.lastX = event.touches[0].pageX;
            this.lastY = event.touches[0].pageY;
            this.lastT = new Date().getTime();

            var deltaX = this.lastX - this.preX;
            var deltaY = this.lastY - this.preY;
            var deltaT = this.lastT - this.preT;

            this.preX = this.lastX;
            this.preY = this.lastY;
            this.preT = this.lastT;

            if (this.onScrollingListener) {
                this.onScrollingListener(deltaY, deltaT);
            }
        }


    },
    end: function (event) {
        event.preventDefault();

        if (this.onScrollEndListener) {
            this.onScrollEndListener((this.preY - this.firstY), (this.preT - this.firstT));
        }
    }
};