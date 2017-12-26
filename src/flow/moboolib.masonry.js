/**
 * Created by Colr on 2017/5/2.
 */
var MobooLib = MobooLib || {};

MobooLib.Masonry = function (config, initItems, renderFunction) {
    //
    this.config = config || {};
    this.container = this.config.itemsContainer;
    //
    this.items = initItems || [];
    //
    this.renderFunction = renderFunction;
};

MobooLib.Masonry.prototype = {
    //
    constructor: MobooLib.Masonry,
    //
    init: function () {
        this.containerColumns = [];

        //
        for (var columnIdx = 0; columnIdx < this.config.columnSize; columnIdx++) {
            //
            this.containerColumns[columnIdx] = document.createElement("ul");
            this.containerColumns[columnIdx].setAttribute("class", "left-episode");

            //
            this.container.appendChild(this.containerColumns[columnIdx]);
        }

        //
        this.appendItemsToContainer(this.items);
    },
    appendItemsToContainer: function (appendItems) {
        //
        if (this.renderFunction) {
            for (var i = 0; i < appendItems.length; i++) {
                var itemWrapper = document.createElement("li");

                this.renderFunction.render(itemWrapper, appendItems[i]);

                //
                var selectedColumnIdx = 0;
                var selectedColumnHeight = this.containerColumns[0].clientHeight;

                for (var columnIdx = 1; columnIdx < this.config.columnSize; columnIdx++) {
                    if (selectedColumnHeight - this.containerColumns[columnIdx].clientHeight) {
                        selectedColumnIdx = columnIdx;
                    }
                }

                //
                this.containerColumns[selectedColumnHeight].appendChild(itemWrapper);
            }
        }
    }
};