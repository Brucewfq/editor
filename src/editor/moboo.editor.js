var Moboo = Moboo || {};

Moboo.Editor = function () {
    //the UI data
    this.popupSwitches = {
        imagePopup: false,
        textPopup: false,
        addElementPopup: false,
        sectionMovePopup: false,
        thumbSectionMovePopup: false,
        fontPropertyContainer: false
    };
    //
    this.sectionOperationOptions = {
        sectionMoveUpBtnIsVisible: false,
        sectionMoveDownBtnIsVisible: false
    };
    //
    this.draftIsPublish = false;
    //
    this.editorCookie = null;
    this.noviceBootStepNum = 0;
    //
    this.popupLocation = 0;
    //
    this.loadingStatus = false;
    //
    this.assetTextIsEditStatus = false;

    //
    this.propertyComponentType = null;
    this.propertyAssetText = new Moboo.DraftNodeOfAssetText({});

    //
    this.currentOpsCode = null;

    this.currentSectionIdx = -1;
    this.currentBgMusicIdx = -1;

    this.currentSectionComponentIdx = -1;
    this.currentSectionAudioIdx = -1;

    this.currentComponentAssetIdx = -1;
    this.currentComponentActionIdx = -1;

    //try iframe signon
    this.tryIframeSignonTimes = 0;
    this.isTryIframeSignon = false;

    //the content data.
    this.draft = new Moboo.Draft({});
};

Moboo.Editor.prototype = {
    //
    constructor: Moboo.Editor,
    //
    initDraft: function (draftJson) {
        this.draft.initDraft(draftJson);
    },
    getDraft: function () {
        return this.draft;
    },
    setCurrerntIdxes: function () {

    },
    showImagePopup: function () {
        //
        this.popupSwitches.imagePopup = true;
        //
        this.popupSwitches.textPopup = false;
        this.popupSwitches.addElementPopup = false;
        this.popupSwitches.sectionMovePopup = false;
        this.popupSwitches.thumbSectionMovePopup = false;
        this.popupSwitches.fontPropertyContainer = false;
    },
    showTextPopup: function () {
        //
        this.popupSwitches.textPopup = true;
        //
        this.popupSwitches.imagePopup = false;
        this.popupSwitches.addElementPopup = false;
        this.popupSwitches.sectionMovePopup = false;
        this.popupSwitches.thumbSectionMovePopup = false;
        this.popupSwitches.fontPropertyContainer = false;
    },
    showAddElementPopup: function () {
        //
        this.popupSwitches.addElementPopup = true;
        //
        this.popupSwitches.imagePopup = false;
        this.popupSwitches.textPopup = false;
        this.popupSwitches.sectionMovePopup = false;
        this.popupSwitches.thumbSectionMovePopup = false;
        this.popupSwitches.fontPropertyContainer = false;
    },
    showSectionMovePopup: function () {
        //
        this.popupSwitches.sectionMovePopup = true;
        //
        this.popupSwitches.imagePopup = false;
        this.popupSwitches.textPopup = false;
        this.popupSwitches.addElementPopup = false;
        this.popupSwitches.thumbSectionMovePopup = false;
        this.popupSwitches.fontPropertyContainer = false;
    },
    showThumbSectionMovePopup: function () {
        //
        this.popupSwitches.thumbSectionMovePopup = true;
        //
        this.popupSwitches.imagePopup = false;
        this.popupSwitches.textPopup = false;
        this.popupSwitches.addElementPopup = false;
        this.popupSwitches.sectionMovePopup = false;
        this.popupSwitches.fontPropertyContainer = false;
    },
    showFontPropertyContainer: function () {
        //
        this.popupSwitches.fontPropertyContainer = true;
        //
        this.popupSwitches.imagePopup = false;
        this.popupSwitches.textPopup = false;
        this.popupSwitches.addElementPopup = false;
        this.popupSwitches.sectionMovePopup = false;
        this.popupSwitches.thumbSectionMovePopup = false;
    },
    hideAllPopup: function () {
        //
        this.popupSwitches.imagePopup = false;
        this.popupSwitches.textPopup = false;
        this.popupSwitches.addElementPopup = false;
        this.popupSwitches.sectionMovePopup = false;
        this.popupSwitches.thumbSectionMovePopup = false;
        this.popupSwitches.fontPropertyContainer = false;
    },
    setSelectNodeIndex: function (sectionIdx, componentIdx) {
        if (sectionIdx != undefined) {
            this.currentSectionIdx = sectionIdx;
        }
        if (componentIdx != undefined) {
            this.currentSectionComponentIdx = componentIdx;
        }
    },
    setPropertyAssetText: function (componentType, obj) {

        this.propertyComponentType = componentType;

        this.propertyAssetText.clear();
        this.propertyAssetText.parse(obj);
    },
    setCookie: function (cookieData) {
        if (cookieData) {
            this.editorCookie = cookieData
        }
    },
    getCookie: function () {
        return this.editorCookie;
    }
};