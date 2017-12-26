var MobooLib = MobooLib || {};
MobooLib.DragBar = function (config) {
    this.container = config.container;
    //
    this.config = {
        mxLeft: config.mxLeft || 20,
        mxRight: config.mxRight || 280,
        dragBarWidth: config.dragBarWidth || 280,
        dragBarHeight: config.dragBarHeight || 30,
        dragHandleWidth: config.dragHandleWidth || 30,
        dragHandleHeight: config.dragHandleHeight || 30
    };

    this.startX = 0;

    //
    this.moveFun = null;
    this.endFun = null;

    //listener
    this.startListener = null;
    this.moveListener = null;
    this.endListener = null;
    //
    this.init();
};

MobooLib.DragBar.prototype = {
    constructor: MobooLib.DragBar,
    init: function () {
        if (this.container) {
            this.generateElement();
        }
    },
    load: function (container, config) {
        this.container = container;

        if (config) {
            //todo
            this.extend(this.config, config)
        }

        this.generateElement();
    },
    generateElement: function () {
        this.rangeContent = document.createElement("div");
        //this.rangeContent.className = "range-content";
        this.rangeContent.style.cssText = " width: " + (this.config.dragBarWidth + this.config.dragHandleWidth) + "px;height: " + this.config.dragBarHeight + "px;position: absolute;top:50%;transform:translateY(-50%);-webkit-transform:translateY(-50%)";

        this.rangeBar = document.createElement("div");
        //this.rangeBar.className = "range-bar";
        this.rangeBar.style.cssText = " width: " + (this.config.dragBarWidth + this.config.dragHandleWidth) + "px;height: 6px;background-color: #535353;position: absolute;top: 50%;transform: translateY(-50%);-webkit-transform: translateY(-50%);";

        this.dragHandle = document.createElement("div");
        //this.dragHandle.className = "drag-handle";
        this.dragHandle.style.cssText = " width: " + this.config.dragHandleWidth + "px;height: " + this.config.dragHandleHeight + "px;background-color: #fff;border-radius: 100%;box-shadow: 0 0 6px 0 rgba(0, 0, 0, .3);position: absolute;top: 0;left: 0;cursor: pointer;";

        //
        this.container.appendChild(this.rangeContent);
        this.rangeContent.appendChild(this.rangeBar);
        this.rangeContent.appendChild(this.dragHandle);
        //bind event;
        var that = this;
        this.moveFun = this.bindAsEventListener(this, that.move);
        this.endFun = this.bindAsEventListener(this, that.end);
        this.dragHandle.addEventListener("mousedown", function (event) {
            that.start(event);

        }, false);
        //

        this.rangeBar.addEventListener("click", function (event) {
            var offsetLeft = that.container.getBoundingClientRect().left;
            var leftMargin = 0;

            if ((event.pageX - offsetLeft) <= that.config.mxLeft) {
                leftMargin = that.config.mxLeft;
            } else {
                leftMargin = event.pageX - offsetLeft;
            }
            var percent = leftMargin / (that.config.dragBarWidth);

            that.setCurrentPos(percent);

            if (that.moveListener) {

                that.moveListener(percent);
            }
        });

    },
    setCurrentPos: function (posX) {
        if (posX >= 0 && this.container && this.dragHandle) {

            var offsetLeft = this.config.mxRight * posX;
            this.dragHandle.style.left = Number(offsetLeft).toFixed(0) + "px";
        }
    },
    start: function (event) {
        this.startX = event.pageX;
        this.originX = this.dragHandle.offsetLeft;
        //
        document.addEventListener("mousemove", this.moveFun, false);
        document.addEventListener("mouseup", this.endFun, false);
        window.addEventListener("blur", this.endFun, false);

        if (this.startListener) {
            this.startListener();
        }

    },
    move: function (event) {
        var moveX = event.pageX;
        var disX = this.originX + moveX - this.startX;

        if (disX < this.config.mxLeft) {
            disX = this.config.mxLeft;
        } else if (disX > this.config.mxRight) {
            disX = this.config.mxRight;
        }

        this.dragHandle.style.left = disX + "px";
        if (this.moveListener) {
            var handlePos = disX / this.config.mxRight;

            this.moveListener(handlePos);
        }

        //
        event.preventDefault();

    },
    end: function () {
        if (this.endListener) {
            this.endListener();
        }

        document.removeEventListener("mousemove", this.moveFun, false);
        document.removeEventListener("mouseup", this.endFun, false);
        window.removeEventListener("blur", this.endFun, false);
    },
    destroy: function () {
        this.container.innerHTML = "";
    },
    bindAsEventListener: function (object, fun) {
        return function (event) {
            return fun.call(object, (event || window.event));
        }
    },
    extend: function (destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }

    },
    onStartListener: function (startListener) {
        this.startListener = startListener;
    },
    onMoveListener: function (moveListener) {
        this.moveListener = moveListener;
    },
    onEndListener: function (endListener) {
        this.endListener = endListener;
    }
};

MobooLib.createRange = function (config) {
    return new MobooLib.DragBar(config);
};