//the draft root node.
Moboo.DraftNodeOfEpisode = function (jsonData) {
    //
    this.version = 1;

    //
    this.uniqueId = null;

    //
    this.themeCode = null;
    this.narrateTypeCode = null;

    //
    this.bgColor = null;
    this.sectionBgColor = null;

    //
    this.fontFamily = null;
    this.fontWeight = null;
    this.fontColor = null;
    this.fontStyle = null;
    this.fontSize = null;

    //
    this.align = null;
    this.verticalAlign = null;

    //
    this.sections = [];
    this.bgMusics = [];

    this.childNodeNos = [];

    this.resources = null;

    //local sttributes
    this.syncStatus = null;

    //
    this.parse(jsonData || {});
};

Moboo.DraftNodeOfEpisode.prototype = {
    //
    constructor: Moboo.DraftNodeOfEpisode,
    clear: function () {
        this.version = 1;

        //
        this.uniqueId = null;

        //
        this.themeCode = null;
        this.narrateTypeCode = null;

        //
        this.bgColor = null;
        this.sectionBgColor = null;

        //
        this.fontFamily = null;
        this.fontWeight = null;
        this.fontColor = null;
        this.fontStyle = null;
        this.fontSize = null;

        //
        this.align = null;
        this.verticalAlign = null;

        //
        this.sections = [];
        this.bgMusics = [];

        this.childNodeNos = [];

        this.resources = null;

        //local sttributes
        this.syncStatus = null;
    },
    //
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.version = jsonData.version != undefined ? jsonData.version : this.version;
        this.uniqueId = jsonData.uniqueId != undefined ? jsonData.uniqueId : this.uniqueId;

        this.themeCode = jsonData.themeCode != undefined ? jsonData.themeCode : this.themeCode;
        this.narrateTypeCode = jsonData.narrateTypeCode != undefined ? jsonData.narrateTypeCode : this.narrateTypeCode;

        this.bgColor = jsonData.bgColor != undefined ? jsonData.bgColor : this.bgColor;
        this.sectionBgColor = jsonData.sectionBgColor != undefined ? jsonData.sectionBgColor : this.sectionBgColor;

        this.fontFamily = jsonData.fontFamily != undefined ? jsonData.fontFamily : this.fontFamily;
        this.fontWeight = jsonData.fontWeight != undefined ? jsonData.fontWeight : this.fontWeight;
        this.fontColor = jsonData.fontColor != undefined ? jsonData.fontColor : this.fontColor;
        this.fontStyle = jsonData.fontStyle != undefined ? jsonData.fontStyle : this.fontStyle;
        this.fontSize = jsonData.fontSize != undefined ? jsonData.fontSize : this.fontSize;

        this.align = jsonData.align != undefined ? jsonData.align : this.align;
        this.verticalAlign = jsonData.verticalAlign != undefined ? jsonData.verticalAlign : this.verticalAlign;

        //parse sections
        if (jsonData.sections) {
            for (var i = 0; i < jsonData.sections.length; i++) {
                //
                var section = jsonData.sections[i];

                //
                if (section) {
                    if (section.type === Moboo.DraftConstants.SECTION_TYPE.COVER) {
                        this.sections.push(new Moboo.DraftNodeOfSectionCover(section));
                    } else {
                        this.sections.push(new Moboo.DraftNodeOfSectionContent(section));
                    }
                }
            }
        }

        //parse bgms
        if (jsonData.bgMusics) {
            for (var i = 0; i < jsonData.bgMusics.length; i++) {
                //
                var bgMusic = jsonData.bgMusics[i];

                //
                if (bgMusic) {
                    this.bgMusics.push(new Moboo.DraftNodeOfBgMusic(bgMusic));
                }
            }
        }

        //
        this.childNodeNos = jsonData.childNodeNos ? jsonData.childNodeNos : this.childNodeNos;

        //
        this.resources = null;

        //
        this.syncStatus = jsonData.syncStatus != undefined ? jsonData.syncStatus : this.syncStatus;
    },
    toJson: function () {
        //this -> string
        var returnValue = {};

        //
        returnValue.version = this.version;
        returnValue.uniqueId = this.uniqueId;

        returnValue.type = this.type;
        returnValue.themeCode = this.themeCode;
        returnValue.narrateTypeCode = this.narrateTypeCode;

        returnValue.bgColor = this.bgColor;
        returnValue.sectionBgColor = this.sectionBgColor;

        returnValue.fontFamily = this.fontFamily;
        returnValue.fontWeight = this.fontWeight;
        returnValue.fontColor = this.fontColor;
        returnValue.fontStyle = this.fontStyle;
        returnValue.fontSize = this.fontSize;

        returnValue.align = this.align;
        returnValue.verticalAlign = this.verticalAlign;

        //
        returnValue.sections = [];
        if (this.sections && this.sections.length > 0) {
            for (var i = 0; i < this.sections.length; i++) {
                //
                var section = this.sections[i];

                //
                if (section) {
                    returnValue.sections.push(section.toJson());
                }
            }
        }

        //
        returnValue.bgMusics = [];
        if (this.bgMusics && this.bgMusics.length > 0) {
            for (var i = 0; i < this.bgMusics.length; i++) {
                //
                var bgMusic = this.bgMusics[i];

                //
                if (bgMusic) {
                    returnValue.bgMusics.push(bgMusic.toJson());
                }
            }
        }

        //
        if (this.childNodeNos) {
            returnValue.childNodeNos = this.childNodeNos;
        } else {
            returnValue.childNodeNos = [];
        }

        //
        returnValue.resources = this.resources;

        //
        returnValue.sync = this.sync;

        //
        return returnValue;
    }
};

///////////////////////////////
// section nodes
///////////////////////////////
//the draft section node.
Moboo.DraftNodeOfSection = function (type) {
    //
    this.uniqueId = null;
    this.type = type;
    this.title = null;

    //the children
    this.components = [];
    this.audios = [];
};

Moboo.DraftNodeOfSection.prototype = {
    //
    constructor: Moboo.DraftNodeOfSection,
    clear: function () {
        this.uniqueId = null;
        this.type = this.type;
        this.title = null;

        //the children
        this.components = [];
        this.audios = [];
    },
    //
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.uniqueId = jsonData.uniqueId || this.uniqueId;
        this.type = jsonData.type != undefined ? jsonData.type : this.type;

        //
        if (jsonData.title) {
            this.title = new Moboo.DraftNodeOfAssetText(jsonData.title);
        }
        //
        if (jsonData.components) {
            for (var i = 0; i < jsonData.components.length; i++) {
                var component = jsonData.components[i];
                if (component) {
                    if (component.type === Moboo.DraftConstants.COMPONENT_TYPE.COVER) {
                        this.components.push(new Moboo.DraftNodeOfComponentCover(component))
                    } else if (component.type === Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN || component.type === Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH) {
                        this.components.push(new Moboo.DraftNodeOfComponentImage(component))
                    } else if (component.type === Moboo.DraftConstants.COMPONENT_TYPE.TEXT_FULLSCREEN || component.type === Moboo.DraftConstants.COMPONENT_TYPE.TEXT_FULLWIDTH) {
                        this.components.push(new Moboo.DraftNodeOfComponentText(component))
                    } else if (component.type === Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN || component.type === Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH) {
                        this.components.push(new Moboo.DraftNodeOfComponentVideo(component))
                    }
                }
            }
        }

        //
        if (jsonData.audios) {
            if (jsonData.audios && jsonData.audios.length > 0) {
                for (var i = 0; i < jsonData.audios.length; i++) {
                    var audio = jsonData.audios[i];
                    if (audio) {
                        this.audios.push(new Moboo.DraftNodeOfAssetAudio(audio));
                    }
                }
            }
        }
    },
    toJson: function () {
        //this - string
        var jsonObject = {};

        //
        jsonObject.version = this.version;
        jsonObject.uniqueId = this.uniqueId;

        jsonObject.type = this.type;

        if (this.title) {
            if (this.title instanceof Moboo.DraftNodeOfAssetText) {
                jsonObject.title = this.title.toJson();
            }
        }
        //
        jsonObject.components = [];
        if (this.components && this.components.length > 0) {
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                if (component) {
                    jsonObject.components.push(component.toJson());
                }
            }
        }

        //
        jsonObject.audios = [];
        if (this.audios && this.audios.length > 0) {
            for (var i = 0; i < this.audios.length; i++) {
                var audio = this.audios[i];
                if (audio) {
                    jsonObject.audios.push(audio.toJson());
                }
            }
        }

        //
        return jsonObject;
    }
}
;

Moboo.DraftNodeOfSectionCover = function (jsonData) {
    //
    Moboo.DraftNodeOfSection.call(this, Moboo.DraftConstants.SECTION_TYPE.COVER);

    //
    this.parse(jsonData);
};

Moboo.DraftNodeOfSectionCover.prototype = Object.create(Moboo.DraftNodeOfSection.prototype);
Moboo.DraftNodeOfSectionCover.prototype.constructor = Moboo.DraftNodeOfSectionCover;

//
Moboo.DraftNodeOfSectionContent = function (jsonData) {
    //
    Moboo.DraftNodeOfSection.call(this, Moboo.DraftConstants.SECTION_TYPE.CONTENT);

    //
    this.parse(jsonData);
};

Moboo.DraftNodeOfSectionContent.prototype = Object.create(Moboo.DraftNodeOfSection.prototype);
Moboo.DraftNodeOfSectionContent.prototype.constructor = Moboo.DraftNodeOfSectionContent;

///////////////////////////////
// bg music nodes
///////////////////////////////
//the draft bg music node.
Moboo.DraftNodeOfBgMusic = function (bgMusicJson) {
    //
    this.uniqueId = null;

    //
    this.startIndex = -1;
    this.endIndex = -1;

    //
    this.cover = null;
    this.audio = null;

    this.parse(bgMusicJson);
};

Moboo.DraftNodeOfBgMusic.prototype = {
    //
    constructor: Moboo.DraftNodeOfBgMusic,
    clear: function () {
        //
        this.uniqueId = null;

        //
        this.startIndex = -1;
        this.endIndex = -1;

        //
        this.cover = null;
        this.audio = null;
    },
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.uniqueId = jsonData.uniqueId != undefined ? jsonData.uniqueId : this.uniqueId;

        this.startIndex = jsonData.startIndex != undefined ? jsonData.startIndex : this.startIndex;
        this.endIndex = jsonData.endIndex != undefined ? jsonData.endIndex : this.endIndex;

        //
        if (jsonData.cover) {
            this.cover = new Moboo.DraftNodeOfAssetImage(jsonData.cover);
        }

        if (jsonData.audio) {
            this.audio = new Moboo.DraftNodeOfAssetAudio(jsonData.audio);
        }
    },
    toJson: function () {
        //this - string
        var returnValue = {};

        //
        returnValue.uniqueId = this.uniqueId;

        //
        returnValue.startIndex = this.startIndex;
        returnValue.endIndex = this.endIndex;

        //
        if (this.cover && this.cover instanceof Moboo.DraftNodeOfAssetImage) {
            returnValue.cover = this.cover.toJson();
        }

        //
        if (this.audio && this.audio instanceof Moboo.DraftNodeOfAssetAudio) {
            returnValue.audio = this.audio.toJson();
        }

        //
        return returnValue;
    }
};

///////////////////////////////
// component nodes
///////////////////////////////
//the draft component node.
Moboo.DraftNodeOfComponent = function (obj) {
    this.uniqueId = null;

    //
    this.type = null;
    this.moPic = false;

    //
    this.positionX = 0;
    this.positionY = 0;

    this.scaleX = 1.0;
    this.scaleY = 1.0;

    this.rotateDegree = 0;

    //
    this.assets = [];
    this.actions = [];

    this.parse(obj || {});
};

Moboo.DraftNodeOfComponent.prototype = {
    //
    constructor: Moboo.DraftNodeOfComponent,
    clear: function () {
    },
    //
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.uniqueId = jsonData.uniqueId || this.uniqueId;
        this.type = jsonData.type != undefined ? jsonData.type : this.type;

        this.moPic = jsonData.moPic === undefined ? this.moPic : jsonData.moPic;

        //
        this.positionX = jsonData.positionX === undefined ? this.positionX : jsonData.positionX;
        this.positionY = jsonData.positionY === undefined ? this.positionY : jsonData.positionY;
        this.scaleX = jsonData.scaleX === undefined ? this.scaleX : jsonData.scaleX;
        this.scaleY = jsonData.scaleY === undefined ? this.scaleY : jsonData.scaleY;
        this.rotateDegree = jsonData.rotateDegree === undefined ? this.rotateDegree : jsonData.rotateDegree;

        //
        if (jsonData.assets) {
            this.assets = [];

            for (var i = 0; i < jsonData.assets.length; i++) {
                var asset = jsonData.assets[i];
                if (asset) {
                    if (asset.type == Moboo.DraftConstants.ASSET_TYPE.IMAGE) {
                        this.assets.push(new Moboo.DraftNodeOfAssetImage(asset));
                    } else if (asset.type == Moboo.DraftConstants.ASSET_TYPE.TEXT) {
                        this.assets.push(new Moboo.DraftNodeOfAssetText(asset));
                    } else if (asset.type == Moboo.DraftConstants.ASSET_TYPE.VIDEO) {
                        this.assets.push(new Moboo.DraftNodeOfAssetVideo(asset));
                    } else if (asset.type == Moboo.DraftConstants.ASSET_TYPE.AUDIO) {
                        this.assets.push(new Moboo.DraftNodeOfAssetAudio(asset));
                    }
                }
            }
        }

        //
        if (jsonData.actions) {
            this.actions = [];

            for (var i = 0; i < jsonData.actions.length; i++) {
                var action = jsonData.actions[i];
                if (action) {
                    if (action.type == Moboo.DraftConstants.ACTION_TYPE.PLAY_AUDIO) {
                        this.actions.push(new Moboo.DraftNodeOfActionPlayAudio(action));
                    }
                }
            }
        }
    },
    toJson: function () {
        //this - string
        var returnValue = {};

        returnValue.uniqueId = this.uniqueId;
        returnValue.type = this.type;

        returnValue.moPic = this.moPic;

        //
        returnValue.positionX = this.positionX;
        returnValue.positionY = this.positionY;
        returnValue.scaleX = this.scaleX;
        returnValue.scaleY = this.scaleY;
        returnValue.rotateDegree = this.rotateDegree;

        returnValue.assets = [];
        if (this.assets && this.assets.length > 0) {
            for (var i = 0; i < this.assets.length; i++) {
                var asset = this.assets[i];
                if (asset) {
                    returnValue.assets.push(asset.toJson());
                }
            }
        }
        //
        returnValue.actions = [];
        if (this.actions && this.actions.length > 0) {
            for (var i = 0; i < this.actions.length; i++) {
                var action = this.actions[i];
                if (action) {
                    returnValue.actions.push(action.toJson());
                }
            }
        }
        return returnValue;
    }
};

//the cover component.
Moboo.DraftNodeOfComponentCover = function (jsonData) {
    Moboo.DraftNodeOfComponent.call(this, jsonData);
};

Moboo.DraftNodeOfComponentCover.prototype = Object.create(Moboo.DraftNodeOfComponent.prototype);
Moboo.DraftNodeOfComponentCover.prototype.constructor = Moboo.DraftNodeOfComponentCover;

//the image component.
Moboo.DraftNodeOfComponentImage = function (jsonData) {
    Moboo.DraftNodeOfComponent.call(this, jsonData);
};

Moboo.DraftNodeOfComponentImage.prototype = Object.create(Moboo.DraftNodeOfComponent.prototype);
Moboo.DraftNodeOfComponentImage.prototype.constructor = Moboo.DraftNodeOfComponentImage;

//the text component.
Moboo.DraftNodeOfComponentText = function (jsonData) {
    Moboo.DraftNodeOfComponent.call(this, jsonData);
};

Moboo.DraftNodeOfComponentText.prototype = Object.create(Moboo.DraftNodeOfComponent.prototype);
Moboo.DraftNodeOfComponentText.prototype.constructor = Moboo.DraftNodeOfComponentText;

//the video component.
Moboo.DraftNodeOfComponentVideo = function (jsonData) {

    Moboo.DraftNodeOfComponent.call(this, jsonData);
};

Moboo.DraftNodeOfComponentVideo.prototype = Object.create(Moboo.DraftNodeOfComponent.prototype);
Moboo.DraftNodeOfComponentVideo.prototype.constructor = Moboo.DraftNodeOfComponentVideo;

///////////////////////////////
// asset nodes
///////////////////////////////
Moboo.DraftNodeOfAction = function (type) {
    //
    this.type = type;
};

Moboo.DraftNodeOfAction.prototype = {
    //
    constructor: Moboo.DraftNodeOfAction
};

//the draft action play audio node.
Moboo.DraftNodeOfActionPlayAudio = function (jsonData) {
    Moboo.DraftNodeOfAction.call(this, Moboo.DraftConstants.ACTION_TYPE.PLAY_AUDIO);

    this.audio = new Moboo.DraftNodeOfAssetAudio({});

    this.init(jsonData);
};

Moboo.DraftNodeOfActionPlayAudio.prototype = Object.create(Moboo.DraftNodeOfAction.prototype);
Moboo.DraftNodeOfActionPlayAudio.prototype = {
    constructor: Moboo.DraftNodeOfActionPlayAudio,
    init: function (jsonData) {
        if (jsonData) {
            this.parse(jsonData);
        }
    },
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.type = jsonData.type != undefined ? jsonData.type : this.type;
        if (jsonData.audio) {
            if (this.audio) {
                this.audio.parse(jsonData.audio);
            } else {
                this.audio = new Moboo.DraftNodeOfAssetAudio(jsonData.audio);
            }
        }
    },
    toJson: function () {
        //this - string
        var returnValue = {};

        returnValue.type = this.type;

        //
        if (this.audio && this.audio instanceof Moboo.DraftNodeOfAssetAudio) {
            returnValue.audio = this.audio.toJson();
        }

        //
        return returnValue;
    }
};

//the draft action blur node.
Moboo.DraftNodeOfActionBlur = function () {
    Moboo.DraftNodeOfAction.call(this, Moboo.DraftConstants.ACTION_TYPE.BLUR);
};

Moboo.DraftNodeOfActionBlur.prototype = Object.create(Moboo.DraftNodeOfAction.prototype);
Moboo.DraftNodeOfActionBlur.prototype = {
    constructor: Moboo.DraftNodeOfActionBlur,
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};
    },
    toJson: function () {
        //this - string
        var returnValue = {};

        //
        return returnValue;
    }
};


///////////////////////////////
// asset nodes
///////////////////////////////
Moboo.DraftNodeOfAsset = function (type, jsonData) {
    //
    this.uniqueId = jsonData.uniqueId;
    this.type = type;
};

Moboo.DraftNodeOfAsset.prototype = {
    //
    constructor: Moboo.DraftNodeOfAsset
};

// the draft asset text node.
Moboo.DraftNodeOfAssetText = function (jsonData) {
    Moboo.DraftNodeOfAsset.call(this, Moboo.DraftConstants.ASSET_TYPE.TEXT, jsonData);

    //
    this.positionX = 0;
    this.positionY = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.rotateDegree = 0.0;

    this.width = 0;
    this.height = 0;

    //
    this.content = null;
    this.bgColor = null;
    this.fontFamily = "微软雅黑";
    this.fontWeight = "normal";
    this.fontStyle = "normal";
    this.fontColor = "#ffffff";
    this.fontSize = 18;

    //
    this.align = "center";
    this.verticalAlign = "middle";

    this.parse(jsonData);
};

Moboo.DraftNodeOfAssetText.prototype = Object.create(Moboo.DraftNodeOfAsset.prototype);
Moboo.DraftNodeOfAssetText.prototype = {
    constructor: Moboo.DraftNodeOfAssetText,
    clear: function () {
        this.positionX = 0;
        this.positionY = 0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.rotateDegree = 0.0;

        this.width = 0;
        this.height = 0;

        //
        this.content = null;
        this.bgColor = null;
        this.fontFamily = "微软雅黑";
        this.fontWeight = "normal";
        this.fontStyle = "normal";
        this.fontColor = "#ffffff";
        this.fontSize = 18;

        //
        this.align = "center";
        this.verticalAlign = null;
    },
    //
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.uniqueId = jsonData.uniqueId || this.uniqueId;
        this.type = jsonData.type != undefined ? jsonData.type : this.type;

        //
        this.positionX = jsonData.positionX != undefined ? jsonData.positionX : this.positionX;
        this.positionY = jsonData.positionY != undefined ? jsonData.positionY : this.positionY;
        this.scaleX = jsonData.scaleX != undefined ? jsonData.scaleX : this.scaleX;
        this.scaleY = jsonData.scaleY != undefined ? jsonData.scaleY : this.scaleY;
        this.rotateDegree = jsonData.rotateDegree != undefined ? jsonData.rotateDegree : this.rotateDegree;

        //
        this.width = jsonData.width != undefined ? jsonData.width : this.width;
        this.height = jsonData.height != undefined ? jsonData.height : this.height;

        //
        this.content = jsonData.content != undefined ? jsonData.content : this.content;
        this.bgColor = jsonData.bgColor != undefined ? jsonData.bgColor : this.bgColor;
        this.fontFamily = jsonData.fontFamily != undefined ? jsonData.fontFamily : this.fontFamily;
        this.fontWeight = jsonData.fontWeight != undefined ? jsonData.fontWeight : this.fontWeight;
        this.fontStyle = jsonData.fontStyle != undefined ? jsonData.fontStyle : this.fontStyle;
        this.fontColor = jsonData.fontColor != undefined ? jsonData.fontColor : this.fontColor;
        this.fontSize = jsonData.fontSize != undefined ? jsonData.fontSize : this.fontSize;

        //
        this.align = jsonData.align != undefined ? jsonData.align : this.align;
        this.verticalAlign = jsonData.verticalAlign != undefined ? jsonData.verticalAlign : this.verticalAlign;
    },
    toJson: function () {
        var returnValue = {};

        returnValue.uniqueId = this.uniqueId;
        returnValue.type = this.type;

        //
        returnValue.positionX = this.positionX;
        returnValue.positionY = this.positionY;
        returnValue.scaleX = this.scaleX;
        returnValue.scaleY = this.scaleY;
        returnValue.rotateDegree = this.rotateDegree;

        //
        returnValue.width = this.width;
        returnValue.height = this.height;

        //
        returnValue.content = this.content;
        returnValue.bgColor = this.bgColor;
        returnValue.fontFamily = this.fontFamily;
        returnValue.fontWeight = this.fontWeight;
        returnValue.fontStyle = this.fontStyle;
        returnValue.fontColor = this.fontColor;
        returnValue.fontSize = this.fontSize;

        //
        returnValue.align = this.align;
        returnValue.verticalAlign = this.verticalAlign;

        return returnValue;
    }
};

// the draft asset image node.
Moboo.DraftNodeOfAssetImage = function (jsonData) {
    Moboo.DraftNodeOfAsset.call(this, Moboo.DraftConstants.ASSET_TYPE.IMAGE, jsonData);

    //
    this.name = null;

    //
    this.providerCode = "qiniu";
    this.bucketCode = null;

    //
    this.positionX = 0;
    this.positionY = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.rotateDegree = 0.0;

    //
    this.width = 0;
    this.height = 0;
    this.ave = null;

    this.caption = null;
    this.subCaption = null;

    this.description = null;

    this.originalUniqueId = null;
    this.originalProviderCode = null;
    this.originalBucketCode = null;

    this.editParam = null;
    this.syncStatus = "valid";

    //
    this.tagId = 0;

    this.parse(jsonData);
};

Moboo.DraftNodeOfAssetImage.prototype = Object.create(Moboo.DraftNodeOfAsset.prototype);
Moboo.DraftNodeOfAssetImage.prototype = {
    constructor: Moboo.DraftNodeOfAssetImage,
    clear: function () {
        //
        this.name = null;

        //
        this.providerCode = "qiniu";
        this.bucketCode = null;

        //
        this.positionX = 0;
        this.positionY = 0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.rotateDegree = 0.0;

        //
        this.width = 0;
        this.height = 0;
        this.ave = null;

        this.caption = null;
        this.subCaption = null;

        this.description = null;

        this.originalUniqueId = null;
        this.originalProviderCode = null;
        this.originalBucketCode = null;

        //valid invalid processed
        this.editParam = null;
        this.syncStatus = "valid";

        //
        this.tagId = 0;
    },
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.uniqueId = jsonData.uniqueId != undefined ? jsonData.uniqueId : this.uniqueId;
        this.type = jsonData.type != undefined ? jsonData.type : this.type;

        this.name = jsonData.name != undefined ? jsonData.name : this.name;

        //
        this.providerCode = jsonData.providerCode != undefined ? jsonData.providerCode : this.providerCode;
        this.bucketCode = jsonData.bucketCode != undefined ? jsonData.bucketCode : this.bucketCode;

        //
        this.positionX = jsonData.positionX != undefined ? jsonData.positionX : this.positionX;
        this.positionY = jsonData.positionY != undefined ? jsonData.positionY : this.positionY;
        this.scaleX = jsonData.scaleX != undefined ? jsonData.scaleX : this.scaleX;
        this.scaleY = jsonData.scaleY != undefined ? jsonData.scaleY : this.scaleY;
        this.rotateDegree = jsonData.rotateDegree != undefined ? jsonData.rotateDegree : this.rotateDegree;

        //
        this.width = jsonData.width != undefined ? jsonData.width : this.width;
        this.height = jsonData.height != undefined ? jsonData.height : this.height;
        this.ave = jsonData.ave != undefined ? jsonData.ave : this.ave;

        //
        if (jsonData.caption) {
            this.caption = new Moboo.DraftNodeOfAssetText(jsonData.caption);
        }

        if (jsonData.subCaption) {
            this.subCaption = new Moboo.DraftNodeOfAssetText(jsonData.subCaption);
        }
        //
        if (jsonData.description) {
            this.description = new Moboo.DraftNodeOfAssetText(jsonData.description);
        }

        //
        this.originalUniqueId = jsonData.originalUniqueId != undefined ? jsonData.originalUniqueId : this.originalUniqueId;
        this.originalProviderCode = jsonData.originalProviderCode != undefined ? jsonData.originalProviderCode : this.originalProviderCode;
        this.originalBucketCode = jsonData.originalBucketCode != undefined ? jsonData.originalBucketCode : this.originalBucketCode;

        //
        if (jsonData.editParam) {
            this.editParam = new Moboo.ImageEditParam(jsonData.editParam);
        }
        this.syncStatus = jsonData.syncStatus != undefined ? jsonData.syncStatus : this.syncStatus;

        this.tagId = jsonData.tagId != undefined ? jsonData.tagId : this.tagId;
    },
    toJson: function () {
        var returnValue = {};

        returnValue.uniqueId = this.uniqueId;
        returnValue.type = this.type;

        returnValue.name = this.name;

        //
        returnValue.providerCode = this.providerCode;
        returnValue.bucketCode = this.bucketCode;

        //
        returnValue.positionX = this.positionX;
        returnValue.positionY = this.positionY;
        returnValue.scaleX = this.scaleX;
        returnValue.scaleY = this.scaleY;
        returnValue.rotateDegree = this.rotateDegree;

        //
        returnValue.width = this.width;
        returnValue.height = this.height;
        returnValue.ave = this.ave;

        //
        if (this.caption && this.caption instanceof Moboo.DraftNodeOfAssetText) {
            returnValue.caption = this.caption.toJson();
        }
        //
        if (this.description && this.description instanceof Moboo.DraftNodeOfAssetText) {
            returnValue.description = this.description.toJson();
        }

        returnValue.originalUniqueId = this.originalUniqueId;
        returnValue.originalProviderCode = this.originalProviderCode;
        returnValue.originalBucketCode = this.originalBucketCode;
        returnValue.originalDuration = this.originalDuration;

        if (this.editParam && this.editParam instanceof Moboo.ImageEditParam) {
            returnValue.editParam = this.editParam.toJson();
        }
        returnValue.syncStatus = this.syncStatus;

        returnValue.tagId = this.tagId;

        return returnValue;
    }
};

Moboo.ImageEditParam = function (jsonData) {
    this.cropStartTime = 0.0;

    //
    this.parse(jsonData || {});
};

Moboo.ImageEditParam.prototype = {
    constructor: Moboo.ImageEditParam,
    parse: function (jsonData) {
        this.cropStartTime = jsonData.cropStartTime;
    },
    toJson: function () {
        var jsonObject = {};
        jsonObject.cropStartTime = this.cropStartTime;
        return jsonObject;
    }
};

///////////////////////////////
//the draft asset audio node.
Moboo.DraftNodeOfAssetAudio = function (jsonData) {
    Moboo.DraftNodeOfAsset.call(this, Moboo.DraftConstants.ASSET_TYPE.AUDIO, jsonData);

    this.name = null;

    //
    this.providerCode = "qiniu";
    this.bucketCode = null;

    //
    this.duration = null;
    this.volume = 1;
    this.fileSize = -1;

    this.originalUniqueId = null;
    this.originalProviderCode = null;
    this.originalBucketCode = null;
    this.originalDuration = -1;

    this.editParam = {};
    this.syncStatus = "valid";

    //
    this.tagId = 0;

    //
    this.parse(jsonData);
};

Moboo.DraftNodeOfAssetAudio.prototype = Object.create(Moboo.DraftNodeOfAsset.prototype);
Moboo.DraftNodeOfAssetAudio.prototype = {
    constructor: Moboo.DraftNodeOfAssetAudio,
    clear: function () {
        this.name = null;

        //
        this.providerCode = "qiniu";
        this.bucketCode = null;

        //
        this.duration = null;
        this.volume = 1;
        this.fileSize = -1;

        this.originalUniqueId = null;
        this.originalProviderCode = null;
        this.originalBucketCode = null;
        this.originalDuration = -1;

        this.editParam = {};
        this.syncStatus = "valid";

        this.tagId = 0;
    },
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.uniqueId = jsonData.uniqueId != undefined ? jsonData.uniqueId : this.uniqueId;
        this.type = jsonData.type != undefined ? jsonData.type : this.type;

        this.name = jsonData.name != undefined ? jsonData.name : this.name;

        //
        this.providerCode = jsonData.providerCode != undefined ? jsonData.providerCode : this.providerCode;
        this.bucketCode = jsonData.bucketCode != undefined ? jsonData.bucketCode : this.bucketCode;

        //
        this.duration = jsonData.duration != undefined ? jsonData.duration : this.duration;
        this.volume = jsonData.volume != undefined ? jsonData.volume : this.volume;
        this.fileSize = jsonData.fileSize != undefined ? jsonData.fileSize : this.fileSize;

        //
        this.originalUniqueId = jsonData.originalUniqueId != undefined ? jsonData.originalUniqueId : this.originalUniqueId;
        this.originalProviderCode = jsonData.originalProviderCode != undefined ? jsonData.originalProviderCode : this.originalProviderCode;
        this.originalBucketCode = jsonData.originalBucketCode != undefined ? jsonData.originalBucketCode : this.originalBucketCode;
        this.originalDuration = jsonData.originalDuration != undefined ? jsonData.originalDuration : this.originalDuration;

        //
        if (jsonData.editParam) {
            this.editParam = new Moboo.AudioEditParam(jsonData.editParam);
        }
        this.syncStatus = jsonData.syncStatus != undefined ? jsonData.syncStatus : this.syncStatus;

        this.tagId = jsonData.tagId != undefined ? jsonData.tagId : this.tagId;
    },
    toJson: function () {
        var returnValue = {};

        returnValue.uniqueId = this.uniqueId;
        returnValue.type = this.type;

        returnValue.name = this.name;

        //
        returnValue.providerCode = this.providerCode;
        returnValue.bucketCode = this.bucketCode;

        //
        returnValue.duration = this.duration;
        returnValue.volume = this.volume;
        returnValue.fileSize = this.fileSize;

        returnValue.originalUniqueId = this.originalUniqueId;
        returnValue.originalProviderCode = this.originalProviderCode;
        returnValue.originalBucketCode = this.originalBucketCode;
        returnValue.originalDuration = this.originalDuration;

        if (this.editParam && this.editParam instanceof Moboo.AudioEditParam) {
            returnValue.editParam = this.editParam.toJson();
        }
        returnValue.syncStatus = this.syncStatus;

        returnValue.tagId = this.tagId;
        return returnValue;
    }
};

Moboo.AudioEditParam = function (jsonData) {
    this.cropStartTime = 0.0;

    //
    this.parse(jsonData);
};

Moboo.AudioEditParam.prototype = {
    constructor: Moboo.AudioEditParam,
    clear: function () {
    },
    parse: function (jsonData) {
        this.cropStartTime = jsonData.cropStartTime;
    },
    toJson: function () {
        var jsonObject = {};
        jsonObject.cropStartTime = this.cropStartTime;
        return jsonObject;
    }
};

//the draft asset video node.
Moboo.DraftNodeOfAssetVideo = function (jsonData) {
    //
    Moboo.DraftNodeOfAsset.call(this, Moboo.DraftConstants.ASSET_TYPE.VIDEO, jsonData);

    //
    this.name = null;

    //
    this.providerCode = "qiniu";
    this.bucketCode = null;

    //
    this.duration = null;
    this.fileSize = -1;
    this.volume = -1;

    this.width = -1;
    this.height = -1;

    this.description = null;

    //
    this.originalUniqueId = null;
    this.originalProviderCode = null;
    this.originalBucketCode = null;

    this.editParam = null;
    //valid invalid processed
    this.syncStatus = "valid";

    this.tagId = 0;

    this.parse(jsonData);
};

Moboo.DraftNodeOfAssetVideo.prototype = Object.create(Moboo.DraftNodeOfAsset.prototype);
Moboo.DraftNodeOfAssetVideo.prototype = {
    constructor: Moboo.DraftNodeOfAssetVideo,
    clear: function () {
        //
        this.name = null;

        //
        this.providerCode = "qiniu";
        this.bucketCode = null;

        //
        this.duration = null;
        this.fileSize = -1;
        this.volume = -1;

        this.width = -1;
        this.height = -1;

        this.originalUniqueId = null;
        this.originalProviderCode = null;
        this.originalBucketCode = null;
        //
        this.description = null;

        this.editParam = null;
        this.syncStatus = "valid";

        this.tagId = 0;
    },
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.uniqueId = jsonData.uniqueId != undefined ? jsonData.uniqueId : this.uniqueId;
        this.type = jsonData.type != undefined ? jsonData.type : this.type;

        this.name = jsonData.name != undefined ? jsonData.name : this.name;

        //
        this.providerCode = jsonData.providerCode != undefined ? jsonData.providerCode : this.providerCode;
        this.bucketCode = jsonData.bucketCode != undefined ? jsonData.bucketCode : this.bucketCode;

        //
        this.duration = jsonData.duration != undefined ? jsonData.duration : this.duration;
        this.volume = jsonData.volume != undefined ? jsonData.volume : this.volume;
        this.fileSize = jsonData.fileSize != undefined ? jsonData.fileSize : this.fileSize;

        //
        this.width = jsonData.width != undefined ? jsonData.width : this.width;
        this.height = jsonData.height != undefined ? jsonData.height : this.height;

        //
        this.originalUniqueId = jsonData.originalUniqueId != undefined ? jsonData.originalUniqueId : this.originalUniqueId;
        this.originalProviderCode = jsonData.originalProviderCode != undefined ? jsonData.originalProviderCode : this.originalProviderCode;
        this.originalBucketCode = jsonData.originalBucketCode != undefined ? jsonData.originalBucketCode : this.originalBucketCode;

        //
        if (jsonData.description) {
            this.description = new Moboo.DraftNodeOfAssetText(jsonData.description);
        }
        //
        if (jsonData.editParam) {
            this.editParam = new Moboo.AudioEditParam(jsonData.editParam);
        }
        this.syncStatus = jsonData.syncStatus != undefined ? jsonData.syncStatus : this.syncStatus;

        this.tagId = jsonData.tagId != undefined ? jsonData.tagId : this.tagId;
    },
    toJson: function () {
        var returnValue = {};

        returnValue.uniqueId = this.uniqueId;
        returnValue.type = this.type;

        returnValue.name = this.name;

        //
        returnValue.providerCode = this.providerCode;
        returnValue.bucketCode = this.bucketCode;

        //
        returnValue.duration = this.duration;
        returnValue.volume = this.volume;
        returnValue.fileSize = this.fileSize;

        returnValue.width = this.width;
        returnValue.height = this.height;
        //
        if (this.description && this.description instanceof Moboo.DraftNodeOfAssetText) {
            returnValue.description = this.description.toJson();
        }

        returnValue.originalUniqueId = this.originalUniqueId;
        returnValue.originalProviderCode = this.originalProviderCode;
        returnValue.originalBucketCode = this.originalBucketCode;
        returnValue.originalDuration = this.originalDuration;
        //
        if (this.editParam && this.editParam instanceof Moboo.VideoEditParam) {
            returnValue.editParam = this.editParam.toJson();
        }
        returnValue.syncStatus = this.syncStatus;

        returnValue.tagId = this.tagId;
        return returnValue;
    }
};

Moboo.VideoEditParam = function (jsonData) {
    //
    this.parse(jsonData || {});
};

Moboo.VideoEditParam.prototype = {
    constructor: Moboo.VideoEditParam,
    clear: function () {
    },
    parse: function (jsonData) {
        //
        jsonData = jsonData || {};
    },
    toJson: function () {
        var jsonObject = {};

        return jsonObject;
    }
};

