if (editorModule) {
    //root
    editorModule.controller(
        "rootController",
        [
            "$scope", "$interval", "$timeout", "$http", "editorService", "connectService", "EditorConstants", "editorFunctions", "publicFunctions", "editorParam", "publicPopup",
            function ($scope, $interval, $timeout, $http, editorService, connectService, EditorConstants, editorFunctions, publicFunctions, editorParam, publicPopup) {
                //bind the service data to the scope.
                $scope.editor = editorService.getEditor();
                //
                $scope.showEditorShadeLayer = true;
                $scope.maxTryTimes = 3;

                //需要在此初始化草稿的数据。
                connectService.getDraft().then(
                    function (data) {
                        console.log(data);
                        editorService.initDraft(data);

                        var cookieData = JSON.parse(JSON.parse(publicFunctions.getCookie("noviceGuide")));
                        console.log(cookieData)

                        editorService.getEditor().setCookie(cookieData, editorParam.noviceGuideCookieDomain);
                        $scope.loadUploadSetting();
                    },
                    function (data) {
                        $scope.showEditorShadeLayer = false;
                        publicPopup.ajaxExceptionProcess(data);
                        // console.log(data);
                    }, function (error) {
                        $scope.showEditorShadeLayer = false;
                        publicPopup.ajaxExceptionProcess(data);
                        console.log("error" + error);
                    }
                );

                $scope.flushUploadSetting = function () {
                    $interval(function () {
                            if (navigator.onLine) {
                                //
                                connectService.getUploadSetting(editorParam.imageUploadSetting.bucketCode, "image", editorParam.imageUploadSetting.storeFileNamePrefix).then(
                                    function (data) {
                                        editorParam.imageUploadSetting.expireSecs = data.expireSecs;
                                        editorParam.imageUploadSetting.uploadToken = data.uploadToken;
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );

                                //
                                connectService.getUploadSetting(editorParam.audioUploadSetting.bucketCode, "audio", editorParam.audioUploadSetting.storeFileNamePrefix).then(
                                    function (data) {
                                        editorParam.audioUploadSetting.expireSecs = data.expireSecs;
                                        editorParam.audioUploadSetting.uploadToken = data.uploadToken;
                                    },
                                    function (data) {
                                        console.log("getUploadSetting");
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );

                                //
                                connectService.getUploadSetting(editorParam.videoUploadSetting.bucketCode, "video", editorParam.videoUploadSetting.storeFileNamePrefix).then(
                                    function (data) {
                                        editorParam.videoUploadSetting.expireSecs = data.expireSecs;
                                        editorParam.videoUploadSetting.uploadToken = data.uploadToken;
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );

                                //
                                connectService.getUploadSetting(editorParam.coverImageUploadSetting.bucketCode, "image", editorParam.coverImageUploadSetting.storeFileNamePrefix).then(
                                    function (data) {
                                        editorParam.coverImageUploadSetting.expireSecs = data.expireSecs;
                                        editorParam.coverImageUploadSetting.uploadToken = data.uploadToken;
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );

                                //
                                connectService.getUploadSetting(editorParam.libAudioUploadSetting.bucketCode, "image", editorParam.libAudioUploadSetting.storeFileNamePrefix).then(
                                    function (data) {
                                        editorParam.libAudioUploadSetting.expireSecs = data.expireSecs;
                                        editorParam.libAudioUploadSetting.uploadToken = data.uploadToken;
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );
                            }
                        },
                        parseInt(editorParam.imageUploadSetting.expireSecs) * 1000 - 300000);
                };

                //flush token
                $scope.loadUploadSetting = function () {
                    if ($scope.editor.getDraft().fileNamePrefix) {
                        if (editorParam.imageUploadSetting && editorParam.audioUploadSetting && editorParam.videoUploadSetting && editorParam.coverImageUploadSetting && editorParam.libAudioUploadSetting) {
                            $scope.flushUploadSetting();

                            //
                            editorParam.imageUploadSetting.storeFileNamePrefix = $scope.editor.getDraft().fileNamePrefix.fileId;
                            editorParam.audioUploadSetting.storeFileNamePrefix = $scope.editor.getDraft().fileNamePrefix.fileId;
                            editorParam.videoUploadSetting.storeFileNamePrefix = $scope.editor.getDraft().fileNamePrefix.fileId;

                            $scope.$broadcast(EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE);

                            $timeout(function () {
                                $scope.showEditorShadeLayer = false;
                            }, 1000);
                        } else {
                            connectService.getUploadSetting("creative", "image", editorService.getDraft().fileNamePrefix.fileId).then(
                                function (data) {
                                    editorParam.imageUploadSetting = data;

                                    //
                                    if (editorParam.imageUploadSetting && editorParam.coverImageUploadSetting && editorParam.videoUploadSetting && editorParam.audioUploadSetting && editorParam.libAudioUploadSetting) {
                                        $scope.flushUploadSetting();
                                        $scope.$broadcast(EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE);
                                        $timeout(function () {
                                            $scope.showEditorShadeLayer = false;
                                        }, 1000);
                                    }
                                },
                                function (data) {
                                    console.log("getUploadSetting");
                                    publicPopup.ajaxExceptionProcess(data);
                                }, function (error) {
                                    publicPopup.ajaxExceptionProcess(error);
                                }
                            );

                            //
                            connectService.getUploadSetting("creative", "audio", editorService.getDraft().fileNamePrefix.fileId).then(
                                function (data) {
                                    editorParam.audioUploadSetting = data;

                                    //
                                    if (editorParam.imageUploadSetting && editorParam.coverImageUploadSetting && editorParam.videoUploadSetting && editorParam.audioUploadSetting && editorParam.libAudioUploadSetting) {
                                        $scope.flushUploadSetting();
                                        $scope.$broadcast(EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE);
                                        $timeout(function () {
                                            $scope.showEditorShadeLayer = false;
                                        }, 1000);
                                    }
                                },
                                function (data) {
                                    console.log("getUploadSetting");
                                    publicPopup.ajaxExceptionProcess(data);
                                }, function (error) {
                                    publicPopup.ajaxExceptionProcess(error);
                                }
                            );

                            //
                            connectService.getUploadSetting("creative", "video", editorService.getDraft().fileNamePrefix.fileId).then(
                                function (data) {
                                    editorParam.videoUploadSetting = data;

                                    //
                                    if (editorParam.imageUploadSetting && editorParam.coverImageUploadSetting && editorParam.videoUploadSetting && editorParam.audioUploadSetting && editorParam.libAudioUploadSetting) {
                                        $scope.flushUploadSetting();
                                        $scope.$broadcast(EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE);
                                        $timeout(function () {
                                            $scope.showEditorShadeLayer = false;
                                        }, 1000);
                                    }
                                },
                                function (data) {
                                    console.log("getUploadSetting");
                                    publicPopup.ajaxExceptionProcess(data);
                                }, function (error) {
                                    publicPopup.ajaxExceptionProcess(error);
                                }
                            );

                            //
                            connectService.getUploadSetting("default", "image", null).then(
                                function (data) {
                                    editorParam.coverImageUploadSetting = data;

                                    //
                                    if (editorParam.imageUploadSetting && editorParam.coverImageUploadSetting && editorParam.videoUploadSetting && editorParam.audioUploadSetting && editorParam.libAudioUploadSetting) {
                                        $scope.flushUploadSetting();
                                        $scope.$broadcast(EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE);
                                        $timeout(function () {
                                            $scope.showEditorShadeLayer = false;
                                        }, 1000);
                                    }
                                },
                                function (data) {
                                    console.log("getUploadSetting");
                                    publicPopup.ajaxExceptionProcess(data);
                                }, function (error) {
                                    publicPopup.ajaxExceptionProcess(error);
                                }
                            );

                            //
                            connectService.getUploadSetting("library", "audio", null).then(
                                function (data) {
                                    editorParam.libAudioUploadSetting = data;

                                    //
                                    if (editorParam.imageUploadSetting && editorParam.coverImageUploadSetting && editorParam.videoUploadSetting && editorParam.audioUploadSetting && editorParam.libAudioUploadSetting) {
                                        $scope.flushUploadSetting();
                                        $scope.$broadcast(EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE);
                                        $timeout(function () {
                                            $scope.showEditorShadeLayer = false;
                                        }, 1000);
                                    }
                                },
                                function (data) {
                                    console.log("getUploadSetting");
                                    publicPopup.ajaxExceptionProcess(data);
                                }, function (error) {
                                    publicPopup.ajaxExceptionProcess(error);
                                }
                            );
                        }
                    } else {
                        $scope.showEditorShadeLayer = false;
                    }
                };
                ////////////////////
                document.getElementById("editorMainWrap").onscroll = function () {
                    //
                    if (editorService.getEditor().currentOpsCode != EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET && editorService.getEditor().currentOpsCode != EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {
                        editorService.getEditor().hideAllPopup();
                        editorService.getEditor().currentOpsCode = null;
                        //
                        $scope.$apply();
                    }

                    //
                    $scope.updateSectionIndexLocation();
                };
                //
                window.onresize = function () {
                    $scope.updateSectionIndexLocation();
                };

                $scope.updateSectionIndexLocation = function (top) {
                    var sectionRoot = document.getElementsByClassName("editor-section-root");
                    var scrollTop = top || 92;

                    for (var i = 0; i < sectionRoot.length; i++) {
                        sectionRoot[i].getElementsByClassName("section-index")[0].setAttribute("class", "section-index");
                        sectionRoot[i].getElementsByClassName("section-index")[0].style.left = "-115px";

                        if (sectionRoot[i].getBoundingClientRect().top < scrollTop) {
                            if (i > 0) {
                                sectionRoot[i - 1].getElementsByClassName("section-index")[0].setAttribute("class", "section-index");
                                sectionRoot[i - 1].getElementsByClassName("section-index")[0].style.left = "-115px";
                            }

                            sectionRoot[i].getElementsByClassName("section-index")[0].setAttribute("class", "section-index active");
                            sectionRoot[i].getElementsByClassName("section-index")[0].style.left = (sectionRoot[i].getBoundingClientRect().left - 115) + "px";
                        }
                    }
                };
                //
                document.getElementById("editorMainWrap").onclick = function () {
                    //
                    editorService.getEditor().hideAllPopup();
                    editorService.getEditor().currentOpsCode = null;
                    //
                    var componentIndex = editorService.getEditor().currentSectionComponentIdx;
                    var sectionIndex = editorService.getEditor().currentSectionIdx;
                    var currentAssetText = document.getElementById("imageCaption" + sectionIndex + componentIndex + "");

                    if (currentAssetText && (currentAssetText.children[0].value == '' || currentAssetText.children[0].value == null || currentAssetText.children[0].value == undefined)) {

                        currentAssetText.style.cssText = "opacity:0";
                        editorService.getEditor().assetTextIsEditStatus = false;
                    }
                    //
                    var sectionTipsEl = document.getElementsByClassName("waring-message");

                    for (var i = 0, len = sectionTipsEl.length; i < len; i++) {
                        sectionTipsEl[i].style.display = "none";
                    }

                    //
                    $scope.$apply();
                };
                //
                window.onbeforeunload = function (e) {

                    if (!editorService.getEditor().draftIsPublish && (editorParam.userNo === "" || editorParam.userNo === undefined || editorParam.userNo === null)) {

                        e.returnValue = "是否保存对当前Moboo的修改";
                        return "是否保存对当前Moboo的修改";
                    }

                };
                ////////////////////////
                //the event listeners.
                $scope.$on(
                    "openModuleWindow",
                    function (event, data) {
                        //
                        $scope.$broadcast(EditorConstants.MODULE_WINDOW_OPS.OPEN + data.moduleWindowName, data);
                    }
                );

                $scope.$on(
                    "closeModuleWindow",
                    function (event, data) {
                        //
                        $scope.$broadcast(EditorConstants.MODULE_WINDOW_OPS.CLOSE + data.moduleWindowName, data);
                    }
                );

                //
                $scope.$on("modifyAssetTextFont", function (event, data) {
                    $scope.$broadcast('elastic:readjust');
                });

            }

        ]
    );

    //头部
    editorModule.controller(
        "headerController",
        [
            "$scope", "$http", "editorService", "EditorConstants", "editorFunctions", "publicFunctions", "publicPopup", "connectService", "editorParam",
            function ($scope, $http, editorService, EditorConstants, editorFunctions, publicFunctions, publicPopup, connectService, editorParam) {
                //bind the service data to the scope.
                $scope.editor = editorService.getEditor();

                /////////////////////////////
                //
                $scope.launchThemeSelector = function () {
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.THEME_SELECTOR
                        }
                    );
                };

                //
                $scope.launchBgmSelector = function () {
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.BGM_SELECTOR,
                            tagId: 0,
                            curPage: 1,
                            pageSize: 32
                        }
                    );
                };

                //
                $scope.launchMobooPreview = function (stepNum) {
                    //
                    $scope.select(stepNum);
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.MOBOO_PREVIEW
                        }
                    );
                };

                //
                $scope.launchMobooPublish = function (stepNum) {

                    editorService.getEditor().draftIsPublish = true;
                    //
                    $scope.select(stepNum);
                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.MOBOO_PUBBLISH
                        }
                    );
                };
                //
                $scope.checkPublishStatus = function () {
                    var allowPreview = true;

                    var episode = editorService.getEpisodeJson();

                    //
                    if (episode == null || episode.sections == undefined || episode.sections == null || episode.sections.length == 0) {
                        allowPreview = false;
                    }

                    //
                    if (allowPreview) {
                        var hasComponent = false;
                        var sections = [];
                        for (var i = 0; i < episode.sections.length; i++) {
                            //remove empty section
                            if (episode.sections[i].components != undefined && episode.sections[i].components != null && episode.sections[i].components.length > 0) {
                                sections.push(episode.sections[i]);

                                //
                                if (!hasComponent) {
                                    hasComponent = true;
                                }
                            }
                        }

                        //
                        episode.sections = sections;
                        allowPreview = hasComponent;
                    }

                    return allowPreview;
                };
                //
                $scope.showNoviceGuide = function (stepNum) {
                    var returnValue = false;

                    $scope.noviceGuide = editorService.getEditor().getCookie();

                    if (!$scope.noviceGuide || $scope.noviceGuide.completed || $scope.editor.draft.node.narrateTypeCode == 'dialogue') {
                        return returnValue;
                    }

                    //
                    returnValue = !$scope.noviceGuide.steps[stepNum];

                    //
                    if (returnValue) {
                        for (property in $scope.noviceGuide.steps) {
                            if (Math.floor(property / 10) < Math.floor(stepNum / 10)) {
                                if (!$scope.noviceGuide.steps[property]) {
                                    returnValue = false;

                                    break;
                                }
                            }
                        }
                    }

                    return returnValue;

                };
                //
                $scope.select = function (stepNum) {

                    if ($scope.editor.draft.node.narrateTypeCode == 'voiceover' && $scope.noviceGuide && $scope.noviceGuide.steps != null && !$scope.noviceGuide.steps[stepNum]) {
                        $scope.noviceGuide.steps[stepNum] = true;

                        publicFunctions.setCookie("noviceGuide", JSON.stringify(JSON.stringify($scope.noviceGuide)), null, editorParam.noviceGuideCookieDomain);

                        if (editorParam.userNo) {
                            //
                            connectService.saveCurrentStep(stepNum);
                        }
                    }
                };
            }
        ]
    );

    //左边 缩略栏
    editorModule.controller(
        "thumbController",
        [
            "$scope", "$http", "$timeout", "editorService", "EditorConstants", "editorFunctions", "editorParam",
            function ($scope, $http, $timeout, editorService, EditorConstants, editorFunctions, editorParam) {
                //
                $scope.viewImageUrlAndFilePrefix = null;
                $scope.viewAudioUrlAndFilePrefix = null;

                //bind the service data to the scope.
                $scope.editor = editorService.getEditor();
                //
                $scope.showMoveSectionOptions = function (sectionIndex, $event) {
                    var target = $event.srcElement || $event.target;
                    //
                    editorService.getEditor().setSelectNodeIndex(sectionIndex);

                    //
                    if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_OPTIONS) {
                        //
                        var sections = editorService.getEpisode().sections;

                        //
                        if (sections.length == 1) {
                            editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = false;
                            editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = false;
                        } else {
                            if (sectionIndex == sections.length - 1) {
                                editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = true;
                                editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = false;
                            } else if (sectionIndex == 0) {
                                editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = false;
                                editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = true;
                            } else {
                                editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = true;
                                editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = true;
                            }
                        }

                        //
                        editorService.getEditor().showThumbSectionMovePopup();
                        editorService.getEditor().popupLocation = $event.pageY;
                    }
                };
                //
                $scope.moveSectionSort = function ($event) {
                    var target = $event.srcElement || $event.target;
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx;

                    if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_UP) {
                        //
                        editorService.moveSectionUp(currentSectionIndex);
                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_DOWN) {
                        //
                        editorService.moveSectionDown(currentSectionIndex);
                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.DELETE) {
                        //
                        editorService.removeSection(currentSectionIndex);
                    }
                    //
                    $scope.updateSectionIndexLocation(50);
                    //
                    editorService.getEditor().hideAllPopup();
                };
                //
                $scope.dragControlListeners = {
                    containment: '#editorThumbWrap',
                    accept: function (sourceItemHandleScope, destSortableScope) {
                        var returnValue = true;

                        if (sourceItemHandleScope.$parent.$parent.$parent.$parent.sectionIndex == destSortableScope.$parent.sectionIndex) {
                            returnValue = true;
                        } else {
                            if (destSortableScope.$parent.section.components.length == EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                returnValue = false;
                            } else {
                                returnValue = true;
                            }
                        }

                        return returnValue;
                    },
                    orderChanged: function (scope) {
                        //
                        var video = document.getElementsByTagName("video");

                        $timeout(function () {
                            for (var i = 0; i < video.length; i++) {
                                video[i].pause();

                                var playPromise = video[i].play();

                                if (playPromise) {
                                    playPromise.catch(function (e) {
                                        //console.log(e);
                                    })
                                }
                            }
                        });

                        //
                        editorService.saveSection(scope.source.sortableScope.$parent.sectionIndex, scope.dest.sortableScope.$parent.sectionIndex)
                    },
                    itemMoved: function (scope) {
                        //
                        var video = document.getElementsByTagName("video");

                        $timeout(function () {
                            for (var i = 0; i < video.length; i++) {
                                video[i].pause();

                                var playPromise = video[i].play();

                                if (playPromise) {
                                    playPromise.catch(function (e) {
                                        //console.log(e);
                                    })
                                }
                            }
                        });

                        //
                        editorService.saveSection(scope.source.sortableScope.$parent.sectionIndex, scope.dest.sortableScope.$parent.sectionIndex)
                    }
                };
                //
                $scope.scrollToCurrentComponent = function (sectionIndex, componentIndex, $event) {

                    var component = document.getElementById("editorComponent" + sectionIndex + "" + componentIndex + "");
                    var editorMainWrap = document.getElementById("editorMainWrap");
                    var editorThumbAssetRoot = document.getElementsByClassName("editor-thumb-asset-root");
                    var editorThumbCoverImage = document.getElementsByClassName("editor-thumb-cover-image");

                    editorMainWrap.scrollTop = 0;
                    editorMainWrap.scrollTop = component.getBoundingClientRect().top - 90;

                    //
                    for (var i = 0, len = editorThumbAssetRoot.length; i < len; i++) {
                        editorThumbAssetRoot[i].setAttribute("class", "as-sortable-item-handle editor-thumb-asset-root");
                    }

                    editorThumbCoverImage[0].setAttribute("class", "editor-thumb-cover-image");
                    $event.currentTarget.setAttribute("class", "as-sortable-item-handle editor-thumb-asset-root active")
                };

                //
                $scope.scrollToCover = function ($event) {
                    var editorMainWrap = document.getElementById("editorMainWrap");
                    var editorThumbAssetRoot = document.getElementsByClassName("editor-thumb-asset-root");

                    editorMainWrap.scrollTop = 0;

                    //
                    for (var i = 0, len = editorThumbAssetRoot.length; i < len; i++) {
                        editorThumbAssetRoot[i].setAttribute("class", "as-sortable-item-handle editor-thumb-asset-root");
                    }

                    $event.currentTarget.setAttribute("class", "editor-thumb-cover-image active")
                };

                /////////////
                //the event listener
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewImageUrlAndFilePrefix = editorParam.imageUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                        $scope.viewVideoUrlAndFilePrefix = editorParam.videoUploadSetting.viewUrlPrefix + editorParam.videoUploadSetting.storeFileNamePrefix;
                    }
                );
            }
        ]
    );

    //工作区域
    editorModule.controller(
        "mainController",
        [
            "$scope", "$http", "$timeout", "editorService", "EditorConstants", "editorFunctions", "publicFunctions", "publicPopup", "uploadService", "ImagePanelObject", "editorParam", "connectService", "uploadPanelObject",
            function ($scope, $http, $timeout, editorService, EditorConstants, editorFunctions, publicFunctions, publicPopup, uploadService, ImagePanelObject, editorParam, connectService, uploadPanelObject) {
                //
                $scope.viewCoverImageUrlAndFilePrefix = null;
                $scope.viewImageUrlAndFilePrefix = null;
                $scope.viewAudioUrlAndFilePrefix = null;
                $scope.viewVideoUrlAndFilePrefix = null;

                //bind the service data to the scope.
                $scope.editor = editorService.getEditor();

                $scope.maxSectionsLength = EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS;
                $scope.maxComponentsLength = EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS;

                //novice boot, show=true
                $scope.showNoviceGuide = function (stepNum) {
                    var returnValue = false;

                    $scope.noviceGuide = editorService.getEditor().getCookie();

                    if (!$scope.noviceGuide || $scope.noviceGuide.completed || $scope.editor.draft.node.narrateTypeCode == 'dialogue') {
                        return returnValue;
                    }
                    //
                    returnValue = !$scope.noviceGuide.steps[stepNum];
                    //
                    if (returnValue) {
                        for (property in $scope.noviceGuide.steps) {
                            if (Math.floor(property / 10) < Math.floor(stepNum / 10)) {
                                if (!$scope.noviceGuide.steps[property]) {
                                    returnValue = false;

                                    break;
                                }
                            }
                        }
                    }

                    return returnValue;
                };
                //
                $scope.select = function (stepNum) {

                    if ($scope.editor.draft.node.narrateTypeCode == 'voiceover' && $scope.noviceGuide != null && $scope.noviceGuide.steps != null && !$scope.noviceGuide.steps[stepNum]) {
                        $scope.noviceGuide.steps[stepNum] = true;

                        publicFunctions.setCookie("noviceGuide", JSON.stringify(JSON.stringify($scope.noviceGuide)), null, editorParam.noviceGuideCookieDomain);

                        if (editorParam.userNo) {
                            //
                            connectService.saveCurrentStep(stepNum);
                        }
                    }
                };

                //
                $scope.launchAudioRecord = function (sectionIndex, userOps, $event, stepNum) {
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    if (userOps == EditorConstants.USER_OPS.ADD_SECTION) {
                        if (editorService.getDraft().node.sections.length == EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS) {
                            publicPopup.alert("当前章节数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS + "，已达到Moboo上限");

                            return
                        }
                    }

                    if (stepNum) {
                        //
                        $scope.select(stepNum);
                    }
                    //
                    editorService.getEditor().setSelectNodeIndex(sectionIndex);
                    editorService.getEditor().currentOpsCode = userOps;
                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.AUDIO_RECORD_CROP,
                            key: 'key', data: 'data'
                        }
                    );
                    //
                    editorService.getEditor().hideAllPopup();
                };

                //
                $scope.launchAudioCrop = function (sectionIndex, $event) {

                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    //
                    editorService.getEditor().setSelectNodeIndex(sectionIndex);
                    editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO;
                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.AUDIO_RECORD_CROP,
                            step: 1, data: 'data'
                        }
                    );
                    //
                    editorService.getEditor().hideAllPopup();
                };
                //
                $scope.launchImageUpload = function () {
                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                            step: 1, data: 'data'
                        }
                    );
                };
                //
                $scope.launchEvnMusic = function (sectionIndex, userOps, $event) {
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    editorService.getEditor().setSelectNodeIndex(sectionIndex);
                    editorService.getEditor().currentOpsCode = userOps;
                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.EVN_MUSIC_SELECTOR,
                            step: 1, data: 'data'
                        }
                    );
                };
                //
                $scope.launchEffectMusic = function (sectionIndex, componentIndex, userOps, $event) {
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    editorService.getEditor().setSelectNodeIndex(sectionIndex, componentIndex);
                    editorService.getEditor().currentOpsCode = userOps;
                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.EFFECT_MUSIC_SELECTOR,
                            step: 1, data: 'data'
                        }
                    );
                    //
                    editorService.getEditor().hideAllPopup();
                };
                //
                $scope.loadAudio = function () {
                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.AUDIO_RECORD_CROP,
                            key: 'key', data: 'data'
                        }
                    );
                };

                $scope.activeAudio = function (sectionIndex) {
                    editorService.getEditor().setSelectNodeIndex(sectionIndex);

                    //
                    $scope.$emit(
                        "openModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.AUDIO_RECORD_CROP,
                            key: sectionIndex, data: 'data'
                        }
                    );
                };
                //
                $scope.setIndex = function ($event, sectionIndex, componentIndex) {
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    editorService.getEditor().setSelectNodeIndex(sectionIndex, componentIndex);
                };
                //
                $scope.setUserOps = function (sectionIndex, userOps, $event) {

                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    editorService.getEditor().currentOpsCode = userOps;
                    //
                    editorService.getEditor().setSelectNodeIndex(sectionIndex);
                };
                //
                $scope.createBlankSection = function (sectionIndex, userOps, $event, stepNum) {
                    //
                    var section = new Moboo.DraftNodeOfSectionContent({});
                    section.uniqueId = editorFunctions.generateUniqueId();

                    editorService.addSection(sectionIndex, section);
                    //
                    $scope.setUserOps(sectionIndex, userOps, $event);
                    //
                    if (stepNum) {
                        //
                        $scope.select(stepNum);
                    }
                };
                //
                $scope.getCoverResolution = function (width, height, referSize) {
                    //
                    var resolution = editorFunctions.getElasticImageResolution(width, height, referSize);
                    //
                    return {
                        "width": resolution.w + 'px',
                        "height": resolution.h + 'px'
                    }
                };
                //
                $scope.getSectionDisplayHeight = function (sectionIndex, audioDuration) {
                    var sectionDisplayHeight = 0;

                    if (editorService.getDraft().node.narrateTypeCode == Moboo.DraftConstants.NARRATE_TYPE.VOICE_OVER && audioDuration != null && audioDuration != undefined && audioDuration != "") {
                        var sectionScreenHeight = editorFunctions.getSectionScreenPixel(audioDuration);
                        var currentSection = $scope.editor.draft.node.sections[sectionIndex];
                        sectionDisplayHeight = sectionScreenHeight + (currentSection.components.length + 1) * 40;
                    }
                    //
                    return sectionDisplayHeight;

                };
                //
                $scope.getAssetStyle = function (component, asset, limitWidth) {
                    var imageWidth, imageHeight, rate;

                    if (component.type == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN || component.type == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN) {
                        rate = Math.max(limitWidth / asset.width, (limitWidth * 16 / 9) / asset.height);
                        imageWidth = parseInt(asset.width * rate);
                        imageHeight = parseInt(asset.height * rate);

                        return {
                            "width": imageWidth + "px",
                            "height": imageHeight + "px",
                            "background-color": asset.ave,
                            "position": "relative",
                            "left": "50%",
                            "transform": "translateX(-50%)",
                            "-webkit-transform": "translateX(-50%)"
                        }

                    } else if (component.type == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH || component.type == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH) {
                        rate = limitWidth / asset.width;
                        imageHeight = parseInt(asset.height * rate);

                        return {
                            "width": limitWidth + "px",
                            "height": imageHeight + "px",
                            "background-color": asset.ave
                        }
                    }
                };
                //
                $scope.getImageSuffix = function (asset) {
                    if (asset.width > 1280 || asset.height > 1280) {

                        return "?imageView2/2/w/1280/interlace/1"
                    } else {
                        return "?imageView2/2/w/720/interlace/1";
                    }
                };
                //
                $scope.showSectionTipText = function ($event) {
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    //
                    var target = $event.srcElement || $event.target;
                    target.parentNode.children[1].style.display = "block";
                };
                //
                $scope.showHandleSectionOptions = function (sectionIndex, $event) {
                    var target = $event.srcElement || $event.target;
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    editorService.getEditor().setSelectNodeIndex(sectionIndex);
                    //
                    var editorMainWrap = document.getElementById("editorMainWrap");
                    editorService.getEditor().popupLocation = $event.clientY + editorMainWrap.scrollTop - 90;

                    //
                    if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_OPTIONS) {
                        //
                        var section = editorService.getEpisode().sections;

                        if (section.length == 1) {
                            editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = false;
                            editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = false;
                        } else {

                            if (sectionIndex == section.length - 1) {
                                editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = true;
                                editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = false;
                            } else if (sectionIndex == 0) {
                                editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = false;
                                editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = true;
                            } else {
                                editorService.getEditor().sectionOperationOptions.sectionMoveUpBtnIsVisible = true;
                                editorService.getEditor().sectionOperationOptions.sectionMoveDownBtnIsVisible = true;
                            }
                        }
                        //
                        editorService.getEditor().showSectionMovePopup();
                    }
                };
                //
                $scope.handleSection = function ($event) {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx;
                    var target = $event.srcElement || $event.target;
                    //
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    //
                    if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_UP) {
                        //
                        editorService.moveSectionUp(currentSectionIndex);

                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_DOWN) {
                        //
                        editorService.moveSectionDown(currentSectionIndex);

                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.DELETE) {
                        //
                        editorService.removeSection(currentSectionIndex);

                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.ADD_EVN_MUSIC) {
                        //
                        $scope.launchEvnMusic(currentSectionIndex, EditorConstants.USER_OPS.ADD_SECTION_AUDIO, $event);
                    }
                    //
                    $scope.updateSectionIndexLocation(50);
                    //
                    editorService.getEditor().hideAllPopup();
                };
                //
                $scope.handleComponent = function (sectionIndex, componentIndex, component, asset, $event, stepNum) {
                    var editorMainWrap = document.getElementById("editorMainWrap");
                    var componentElements = document.getElementsByClassName("editor-asset-root");
                    var currentElement = document.getElementById("editorComponent" + sectionIndex + "" + componentIndex + "");
                    var target = $event.srcElement || $event.target;
                    //
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    for (var i = 0, len = componentElements.length; i < len; i++) {
                        componentElements[i].style.borderColor = "transparent";
                    }

                    currentElement.children[0].style.borderColor = "rgb(235, 20, 175)";

                    if (stepNum) {
                        //
                        $scope.select(stepNum);
                    }
                    //
                    editorService.getEditor().setSelectNodeIndex(sectionIndex, componentIndex);
                    //
                    if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_UP || target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_DOWN) {
                        if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_UP) {
                            //
                            if (componentIndex == 0) {
                                if (editorService.getDraft().node.sections[sectionIndex - 1].components.length >= EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                    return;
                                }
                            }

                            //
                            editorService.moveComponentUp(sectionIndex, componentIndex);
                            $scope.videoPlayAgain();
                        } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MOVE_DOWN) {
                            //
                            if (componentIndex == (editorService.getDraft().node.sections[sectionIndex].components.length - 1)) {
                                if (editorService.getDraft().node.sections[sectionIndex + 1].components.length >= EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                    return;
                                }
                            }

                            //
                            editorService.moveComponentDown(sectionIndex, componentIndex);
                            $scope.videoPlayAgain();
                        }
                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.INSERT_ACTION || target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MODIFY_ACTION) {
                        if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.INSERT_ACTION) {
                            editorService.getEditor().setSelectNodeIndex(sectionIndex, componentIndex);
                            editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.ADD_ACTION_PLAY_AUDIO;

                            //
                            $scope.$emit(
                                "openModuleWindow",
                                {
                                    moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.AUDIO_RECORD_CROP,
                                    step: 1, data: 'data'
                                }
                            );
                        } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MODIFY_ACTION) {
                            //
                            editorService.getEditor().setSelectNodeIndex(sectionIndex, componentIndex);
                            editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.MODIFY_ACTION;
                            //
                            $scope.$emit(
                                "openModuleWindow",
                                {
                                    moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.AUDIO_RECORD_CROP,
                                    step: 1, data: 'data'
                                }
                            );
                        }
                    } else if (target.getAttribute('data-type') == EditorConstants.DATA_TYPE.MULTIMEDIA) {
                        //
                        if (component.moPic) {
                            editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.SELECTED_COMPONENT_MOPIC;
                        } else {
                            if (asset.type == Moboo.DraftConstants.ASSET_TYPE.IMAGE) {
                                editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.SELECTED_COMPONENT_IMAGE;
                            } else if (asset.type == Moboo.DraftConstants.ASSET_TYPE.VIDEO) {
                                editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.SELECTED_COMPONENT_VIDEO;
                            }
                        }

                        //
                        editorService.getEditor().showImagePopup();
                        editorService.getEditor().popupLocation = $event.clientY + editorMainWrap.scrollTop - 90;
                    } else if (target.getAttribute('data-type') == EditorConstants.DATA_TYPE.TEXT) {
                        //
                        editorService.getEditor().showTextPopup();
                        editorService.getEditor().popupLocation = $event.clientY + editorMainWrap.scrollTop - 90;
                    } else if (target.getAttribute('data-type') == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {
                        //
                        editorService.removeCaptionForImageAssert(sectionIndex, componentIndex, 0);

                    } else if (target.getAttribute('data-type') == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {
                        //第一次点击文本，光标移到最后面
                        if (!editorService.getEditor().assetTextIsEditStatus) {
                            $scope.cursorMoveEnd(target);
                            editorService.getEditor().assetTextIsEditStatus = true;
                        }
                        //
                        editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET;
                        $scope.setPropertyAssetText(sectionIndex, componentIndex);
                    }
                };
                //
                $scope.cursorMoveEnd = function (textTarget) {
                    var len = textTarget.value.length;

                    textTarget.focus();
                    //
                    if (document.selection) {
                        var sel = textTarget.createTextRange();
                        //
                        sel.moveStart('character', len);
                        sel.collapse();
                        sel.select();
                    } else if (typeof textTarget.selectionStart == 'number' && typeof textTarget.selectionEnd == 'number') {

                        textTarget.selectionStart = textTarget.selectionEnd = len;
                        textTarget.scrollTop = 9999;
                    }
                };

                //
                $scope.videoPlayAgain = function () {
                    var video = document.getElementsByTagName("video");

                    $timeout(function () {
                        for (var i = 0; i < video.length; i++) {
                            video[i].pause();
                            video[i].play();
                        }
                    });
                };
                //
                $scope.showAddElementPopup = function (sectionIndex, componentIndex, $event, stepNum) {
                    //
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    //
                    if (stepNum) {
                        $scope.select(stepNum);
                    }

                    //
                    editorService.getEditor().setSelectNodeIndex(sectionIndex, componentIndex + 1);
                    //
                    editorService.getEditor().showAddElementPopup();
                    //
                    var editorMainWrap = document.getElementById("editorMainWrap");
                    editorService.getEditor().popupLocation = $event.clientY + editorMainWrap.scrollTop - 90;
                };
                //
                $scope.addTextComponent = function () {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx;
                    var currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    //
                    var component = new Moboo.DraftNodeOfComponentText({});
                    component.uniqueId = editorFunctions.generateUniqueId();
                    component.type = Moboo.DraftConstants.COMPONENT_TYPE.TEXT_FULLWIDTH;
                    //
                    var asset = new Moboo.DraftNodeOfAssetText({});
                    asset.uniqueId = editorFunctions.generateUniqueId();
                    asset.fontColor = editorService.getDraft().node.fontColor;
                    //
                    component.assets.push(asset);
                    //
                    editorService.addComponent(currentSectionIndex, currentComponentIndex, component);
                    //
                    if (editorService.getDraft().node.sections[currentSectionIndex].components.length == EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {

                        publicPopup.alert("当前章节视觉元素数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS + "，已达到上限")
                    }
                };
                //
                $scope.switchComponentType = function ($event) {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx;
                    var currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    var currentComponent = editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex];
                    var target = $event.srcElement || $event.target;
                    //
                    if (target.getAttribute('data-action') == 'fullscreenComponent') {
                        if (currentComponent.assets[0].type == "image") {
                            editorService.modifyComponent(currentSectionIndex, currentComponentIndex, {type: Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN});
                        } else if (currentComponent.assets[0].type == "video") {
                            editorService.modifyComponent(currentSectionIndex, currentComponentIndex, {type: Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN});
                        } else if (currentComponent.assets[0].type == "text") {
                            editorService.modifyComponent(currentSectionIndex, currentComponentIndex, {type: Moboo.DraftConstants.COMPONENT_TYPE.TEXT_FULLSCREEN});
                        }
                    } else if (target.getAttribute('data-action') == 'fullwidthComponent') {
                        if (currentComponent.assets[0].type == "image") {
                            editorService.modifyComponent(currentSectionIndex, currentComponentIndex, {type: Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH});
                        } else if (currentComponent.assets[0].type == "video") {
                            editorService.modifyComponent(currentSectionIndex, currentComponentIndex, {type: Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH});
                        } else if (currentComponent.assets[0].type == "text") {
                            editorService.modifyComponent(currentSectionIndex, currentComponentIndex, {type: Moboo.DraftConstants.COMPONENT_TYPE.TEXT_FULLWIDTH});
                        }
                    } else if (target.getAttribute('data-action') == 'removeComponent') {
                        editorService.removeComponent(currentSectionIndex, currentComponentIndex);
                    } else if (target.getAttribute('data-action') == "addEffectMusic") {
                        $scope.launchEffectMusic(currentSectionIndex, currentComponentIndex, EditorConstants.USER_OPS.ADD_ACTION_PLAY_AUDIO, $event)
                    }
                };
                //
                $scope.setPropertyAssetText = function (sectionindex, componentIndex) {
                    var assetText;
                    //
                    editorService.getEditor().showFontPropertyContainer();
                    //
                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {
                        assetText = editorService.getDraft().node.sections[sectionindex].components[componentIndex].assets[0].caption;
                        //
                        if (!assetText) {
                            assetText = new Moboo.DraftNodeOfAssetText({});
                            assetText.uniqueId = editorFunctions.generateUniqueId();
                            assetText.fontColor = editorService.getDraft().node.fontColor;
                            //
                            editorService.addCaptionForImageAssert(sectionindex, componentIndex, 0, assetText);
                        }

                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {
                        //
                        assetText = editorService.getDraft().node.sections[sectionindex].components[componentIndex].assets[0];
                    }
                    //
                    editorService.getEditor().setPropertyAssetText(editorService.getDraft().node.sections[sectionindex].components[componentIndex].type, assetText);
                };
                //
                $scope.modifyTitle = function () {
                    var title = document.getElementById("mobooTitle");

                    if (title) {
                        title.addEventListener("input", function () {
                            var textContent;

                            if (( this.value != null && publicFunctions.stringUtil.trim(this.value) != "")) {

                                if (publicFunctions.stringUtil.lengthForUnicode(this.value) > EditorConstants.TEXT_LENGTH.TITLE) {

                                    textContent = publicFunctions.stringUtil.subForUnicode(this.value, EditorConstants.TEXT_LENGTH.TITLE);
                                } else {
                                    textContent = this.value;
                                }
                            }

                            //
                            $scope.editor.draft.title = publicFunctions.formatTextArea(textContent);

                            editorService.modifyTitle($scope.editor.draft.title);

                            $scope.$apply();
                        })
                    }
                };

                $scope.modifySectionTitle = function (sectionIndex, $event) {

                    var textContent,
                        target = $event.srcElement || $event.target,
                        value = publicFunctions.stringUtil.trim(target.value);

                    if (value != null && value != undefined && value != "" && publicFunctions.stringUtil.lengthForUnicode(value) > EditorConstants.TEXT_LENGTH.ASSET_TEXT_CONTENT) {

                        textContent = publicFunctions.stringUtil.subForUnicode(value, EditorConstants.TEXT_LENGTH.SECTION_TITLE);
                    } else {
                        textContent = value;
                    }

                    //
                    var titleData = {
                        content: publicFunctions.formatTextArea(textContent)
                    };

                    if ($scope.editor.draft.node.sections[sectionIndex].title && !$scope.editor.draft.node.sections[sectionIndex].title.uniqueId) {

                        titleData.uniqueId = editorFunctions.generateUniqueId();
                    }

                    editorService.modifySection(sectionIndex,
                        {title: new Moboo.DraftNodeOfAssetText(titleData)}
                    );
                };

                $scope.modifyAssetDescription = function (sectionIndex, componentIndex, assetIndex, $event) {
                    var textContent,
                        target = $event.srcElement || $event.target;

                    if (target.value != null && target.value != undefined && target.value != "" && publicFunctions.stringUtil.lengthForUnicode(publicFunctions.stringUtil.trim(target.value)) > EditorConstants.TEXT_LENGTH.ASSET_TEXT_CONTENT) {

                        textContent = publicFunctions.stringUtil.subForUnicode(publicFunctions.stringUtil.trim(target.value), EditorConstants.TEXT_LENGTH.ASSET_DESCRIPTION_CONTENT);
                    } else {
                        textContent = publicFunctions.stringUtil.trim(target.value);
                    }

                    target.value = textContent;
                    //
                    if (!$scope.editor.draft.node.sections[sectionIndex].components[componentIndex].assets[0].description || ($scope.editor.draft.node.sections[sectionIndex].components[componentIndex].assets[0].description && !$scope.editor.draft.node.sections[sectionIndex].components[componentIndex].assets[0].description.uniqueId)) {
                        var descriptionNode = new Moboo.DraftNodeOfAssetText({
                            uniqueId: editorFunctions.generateUniqueId(),
                            content: textContent
                        });

                        editorService.addDescriptionForImageAssertNode(sectionIndex, componentIndex, assetIndex, descriptionNode);

                    } else {

                        var descriptionData = {
                            content: textContent
                        };

                        editorService.modifyDescriptionForImageAssertNode(sectionIndex, componentIndex, assetIndex, descriptionData);
                    }
                };
                //
                $scope.modifyAssetText = function (sectionIndex, componentIndex, assetIndex, $event) {
                    var textContent,
                        target = $event.srcElement || $event.target,
                        height = target.parentNode.clientHeight;

                    if (target.value != null && target.value != undefined && target.value != "" && publicFunctions.stringUtil.lengthForUnicode(target.value) > EditorConstants.TEXT_LENGTH.ASSET_TEXT_CONTENT) {

                        textContent = publicFunctions.stringUtil.subForUnicode(target.value, EditorConstants.TEXT_LENGTH.ASSET_TEXT_CONTENT);
                    } else {
                        textContent = target.value;
                    }
                    //
                    $scope.editor.draft.node.sections[sectionIndex].components[componentIndex].assets[0].content = textContent;

                    //
                    editorService.modifyAsset(sectionIndex, componentIndex, assetIndex, {
                        "content": textContent,
                        "height": height
                    });
                };

                //
                $scope.subStringForText = function (type, $event) {
                    var textContent, maxUnicodeLength,
                        str = $event.target.value,
                        currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    //
                    if ((str != null && publicFunctions.stringUtil.trim(str) != "")) {
                        if (type == EditorConstants.TEXT_TYPE.TITLE) {
                            maxUnicodeLength = EditorConstants.TEXT_LENGTH.TITLE;
                        } else if (type == EditorConstants.TEXT_TYPE.SECTION_TITLE) {
                            maxUnicodeLength = EditorConstants.TEXT_LENGTH.SECTION_TITLE;
                        } else if (type == EditorConstants.TEXT_TYPE.ASSET_TEXT_CONTENT) {
                            maxUnicodeLength = EditorConstants.TEXT_LENGTH.ASSET_TEXT_CONTENT;
                        } else if (type == EditorConstants.TEXT_TYPE.ASSET_CAPTION_TITLE) {
                            maxUnicodeLength = EditorConstants.TEXT_LENGTH.ASSET_CAPTION_TITLE;
                        } else if (type == EditorConstants.TEXT_TYPE.ASSET_DESCRIPTION) {
                            maxUnicodeLength = EditorConstants.TEXT_LENGTH.ASSET_DESCRIPTION_CONTENT;
                        }

                        textContent = publicFunctions.stringUtil.subForUnicode(str, maxUnicodeLength);
                    } else {
                        textContent = str;
                    }
                    //
                    if (type == EditorConstants.TEXT_TYPE.TITLE) {
                        if ($scope.editor.draft.title) {
                            $scope.editor.draft.title = publicFunctions.formatTextArea(textContent);
                            editorService.modifyTitle(publicFunctions.formatTextArea(textContent));
                        }

                    } else if (type == EditorConstants.TEXT_TYPE.SUBTITLE) {
                        if ($scope.editor.draft.subtitle) {
                            $scope.editor.draft.subtitle = publicFunctions.formatTextArea(textContent);
                        }
                    } else if (type == EditorConstants.TEXT_TYPE.SECTION_TITLE) {
                        if ($scope.editor.draft.node.sections[currentSectionIndex].title) {
                            $scope.editor.draft.node.sections[currentSectionIndex].title.content = publicFunctions.formatTextArea(textContent);
                        }

                    } else if (type == EditorConstants.TEXT_TYPE.ASSET_TEXT_CONTENT) {

                        if ($scope.editor.draft.node.sections[currentSectionIndex].components[currentComponentIndex].assets[0].content) {
                            $scope.editor.draft.node.sections[currentSectionIndex].components[currentComponentIndex].assets[0].content = textContent;
                        }
                    } else if (type == EditorConstants.TEXT_TYPE.ASSET_CAPTION_TITLE) {

                        if ($scope.editor.draft.node.sections[currentSectionIndex].components[currentComponentIndex].assets[0].caption.content) {
                            $scope.editor.draft.node.sections[currentSectionIndex].components[currentComponentIndex].assets[0].caption.content = textContent;
                        }
                    } else if (type == EditorConstants.TEXT_TYPE.ASSET_DESCRIPTION) {
                        if ($scope.editor.draft.node.sections[currentSectionIndex].components[currentComponentIndex].assets[0].description) {
                            $scope.editor.draft.node.sections[currentSectionIndex].components[currentComponentIndex].assets[0].description.content = textContent;
                        }
                    }
                    //
                    $scope.$emit(
                        "modifyAssetTextFont",
                        {}
                    );
                };
                /////////
                //判断component的类型
                $scope.isMoPicComponent = function () {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;

                    if (editorService.getDraft().node.sections != undefined && editorService.getDraft().node.sections[currentSectionIndex] != undefined && editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex] != undefined) {

                        return editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex].moPic;
                    }
                };

                $scope.isVideoComponent = function () {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;

                    if (editorService.getDraft().node.sections != undefined && editorService.getDraft().node.sections[currentSectionIndex] != undefined && editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex] != undefined) {
                        var componentType = editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex].type;

                        return !editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex].moPic && (componentType == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN || componentType == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH);
                    }
                };

                $scope.isImageComponent = function () {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    if (editorService.getDraft().node.sections != undefined && editorService.getDraft().node.sections[currentSectionIndex] != undefined && editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex] != undefined) {

                        var componentType = editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex].type;
                        return !editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex].moPic && (componentType == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN || componentType == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH);
                    }

                };
                /////////
                // image caption
                $scope.initShowCaption = function (asset) {
                    if (asset.caption) {
                        return asset.caption.content != null && asset.caption.content != undefined && asset.caption.content != '';
                    }
                };
                //////////
                // 获取元素个数
                $scope.getDraftMoPicLength = function () {
                    var sections = editorService.getDraft().node.sections;
                    var moPics = [];

                    for (var i = 0; i < sections.length; i++) {
                        for (var j = 0; j < sections[i].components.length; j++) {
                            if (sections[i].components[j].moPic) {
                                moPics.push(sections[i].components[j]);
                            }
                        }
                    }
                    //
                    return moPics.length;
                };
                //
                $scope.getDraftVideoLength = function () {
                    var sections = editorService.getDraft().node.sections;
                    var videos = [];

                    for (var i = 0; i < sections.length; i++) {
                        for (var j = 0; j < sections[i].components.length; j++) {
                            if (!sections[i].components[j].moPic && (sections[i].components[j].type == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN || sections[i].components[j].type == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH)) {
                                videos.push(sections[i].components[j]);
                            }
                        }
                    }
                    //
                    return videos.length;
                };

                /**
                 * start upload image、audio、video
                 * **/
                //
                $scope.bindImageDummyUploader = function () {
                    uploadService.bindCoverImageFileUploader({
                        "pickId": $("#uploadImageDummyBtn"),
                        "multiple": false
                    });
                };
                //
                $scope.bindCoverImageFileUploader = function () {
                    //
                    uploadService.bindCoverImageFileUploader({
                        "pickId": "#coverImageUploadBtn",
                        "multiple": false,
                        "fileSingleSizeLimit": 10 * 1024 * 1024
                    }, {
                        fileQueuedBefore: function () {
                            //
                            editorService.getEditor().loadingStatus = true;
                            $scope.$apply();
                        },
                        success: function (uploadedFileInfo) {

                            var coverImage = document.getElementById("editorCoverImage");
                            if (coverImage) {
                                coverImage.setAttribute("src", "");
                            }

                            var cover = {
                                "providerCode": "qiniu",
                                "bucketCode": "default",
                                "fileId": uploadedFileInfo.id,
                                "origin": uploadedFileInfo.origin,
                                "ave": {"ave": uploadedFileInfo.ave},
                                "resolution": {
                                    "width": uploadedFileInfo.width,
                                    "height": uploadedFileInfo.height
                                }
                            };

                            editorService.modifyCover(cover);

                            //
                            editorService.getEditor().loadingStatus = false;
                            $scope.$apply();
                        },
                        uploadError: function (uploadErrorFile) {
                            //
                            publicPopup.alert("上传失败", function () {
                                //
                                editorService.getEditor().loadingStatus = false;
                                $scope.$apply();
                            });
                        },
                        error: function (message, file) {
                            var fileName;

                            if (file) {

                                if (publicFunctions.stringUtil.lengthForUnicode(file.name) > 14) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(file.name, 14) + "...";
                                } else {
                                    fileName = file.name
                                }
                            } else {
                                fileName = "";
                            }

                            if (typeof message == "string" && message == "文件过大") {
                                message = "文件过大，最大可上传10Mb的图片文件";
                            } else if (typeof message == "string" && message == "文件格式错误") {
                                message = "文件格式错误<br/>仅支持jpg、jpeg、png";
                            }
                            //
                            publicPopup.alert(fileName + message, function () {
                                //
                                editorService.getEditor().loadingStatus = false;
                                $scope.$apply();
                            });
                        }
                    });
                };
                //
                $scope.bindImageUploader = function () {
                    //
                    uploadService.bindImageFileUploader({
                        "pickId": ".upload-image-btn",
                        "thumbnailWidth": 114,
                        "thumbnailHeight": 114,
                        "fileSingleSizeLimit": 10 * 1024 * 1024
                    }, {
                        fileQueuedBefore: function (imageFileUploader, files) {
                            if ((files.length > 9 || (files.length + ImagePanelObject.getPanelFiles().length) > 9) && document.getElementById("limitImageTipText")) {
                                document.getElementById("limitImageTipText").style.display = "block";
                            }

                            if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION && editorService.getDraft().node.sections.length == EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS) {

                                imageFileUploader.removeFiles(files);
                                publicPopup.alert("当前章节数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS + "，已达到Moboo上限");

                                return;
                            }

                            $scope.$emit(
                                "openModuleWindow",
                                {
                                    moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                                    key: 'key', data: 'data'
                                }
                            );
                            //
                            editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.ADD_COMPONENT_IMAGES;
                            ImagePanelObject.uploadLoading = true;

                            $scope.$apply();
                        },
                        fileQueued: function (queuedFilesInfo) {

                            if (editorService.getEditor().currentOpsCode != EditorConstants.USER_OPS.ADD_SECTION || editorService.getDraft().node.sections.length < EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS) {

                                ImagePanelObject.showUploadImagePanel = true;
                                //
                                ImagePanelObject.fileNum = queuedFilesInfo.files.length;
                                if (queuedFilesInfo.fileNum > 0) {
                                    for (var i = 0; i < queuedFilesInfo.files.length; i++) {

                                        ImagePanelObject.pushFileInfo(queuedFilesInfo.files[i]);
                                    }
                                }
                            }
                            //
                            $scope.$apply();
                        },
                        thumb: function (themFilesInfo) {
                            if (editorService.getEditor().currentOpsCode != EditorConstants.USER_OPS.ADD_SECTION || editorService.getDraft().node.sections.length < EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS) {
                                ImagePanelObject.pushFileInfo($.extend(ImagePanelObject.getFile(themFilesInfo.fileId), themFilesInfo));
                            }
                            //
                            $scope.$apply();
                        },
                        progress: function (progressInfo) {
                            ImagePanelObject.pushFileInfo($.extend(ImagePanelObject.getFile(progressInfo.fileId), progressInfo));
                            //
                            $scope.$apply();
                        },
                        success: function (successFileInfo) {
                            ImagePanelObject.pushFileInfo($.extend(ImagePanelObject.getFile(successFileInfo.fileId), successFileInfo));
                            //
                            ImagePanelObject.checkImageIsQualify(successFileInfo, ImagePanelObject.files.length);
                            //
                            $scope.$apply();
                        },
                        finished: function () {
                            ImagePanelObject.uploadLoading = false;
                            //
                            $scope.$apply();
                        },
                        uploadError: function (uploadErrorFile) {
                            //
                            ImagePanelObject.handleUploadError(uploadErrorFile);

                            var data = {
                                title: uploadErrorFile.name,
                                text: "上传失败"
                            };

                            uploadPanelObject.pushErrorFile(data);
                        },
                        error: function (message, file) {
                            //
                            var fileName;

                            if (file) {

                                if (publicFunctions.stringUtil.lengthForUnicode(file.name) > 14) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(file.name, 14) + "...";
                                } else {
                                    fileName = file.name
                                }
                            } else {
                                fileName = "";
                            }

                            if (typeof message == "string" && message == "文件过大") {
                                message = "文件过大，最大可上传10Mb的图片文件";
                            } else if (typeof message == "string" && message == "文件格式错误") {
                                message = "文件格式错误<br/>仅支持jpg、jpeg、png";
                            }

                            var data = {
                                title: fileName,
                                text: message
                            };

                            uploadPanelObject.pushErrorFile(data);
                        }
                    });
                };
                //
                $scope.bindReplaceImageUploader = function () {
                    uploadService.bindImageFileUploader(
                        {
                            "pickId": ".replace-image-btn",
                            "multiple": false,
                            "fileSingleSizeLimit": 10 * 1024 * 1024
                        },
                        {
                            fileQueuedBefore: function () {

                                editorService.getEditor().loadingStatus = true;
                                $scope.$apply();
                            },
                            success: function (uploadedFileInfo) {
                                var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                                    currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                                //
                                document.getElementById("imageCaption" + currentSectionIndex + currentComponentIndex + "").nextSibling.nextElementSibling.src = "";
                                //
                                var asset = new Moboo.DraftNodeOfAssetImage({});

                                asset.bucketCode = "creative";
                                asset.name = uploadedFileInfo.fileName;
                                asset.uniqueId = uploadedFileInfo.uniqueId;
                                asset.width = uploadedFileInfo.width;
                                asset.height = uploadedFileInfo.height;
                                asset.ave = uploadedFileInfo.ave;
                                //
                                editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, asset);
                                //
                                $scope.$apply();
                            },
                            finished: function () {
                                //
                                editorService.getEditor().loadingStatus = false;
                                $scope.$apply();
                            },
                            uploadError: function (uploadErrorFile) {
                                //
                                publicPopup.alert("上传失败", function () {
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    $scope.$apply();
                                });
                            },
                            error: function (message, file) {
                                var fileName;

                                if (file) {

                                    if (publicFunctions.stringUtil.lengthForUnicode(file.name) > 14) {

                                        fileName = publicFunctions.stringUtil.subForUnicode(file.name, 14) + "...";
                                    } else {
                                        fileName = file.name
                                    }
                                } else {
                                    fileName = "";
                                }

                                if (typeof message == "string" && message == "文件过大") {
                                    message = "文件过大，最大可上传10Mb的图片文件";
                                } else if (typeof message == "string" && message == "文件格式错误") {
                                    message = "文件格式错误<br/>仅支持jpg、jpeg、png";
                                }
                                //
                                publicPopup.alert(fileName + message, function () {
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    $scope.$apply();
                                });
                            }

                        }
                    )
                };
                //
                $scope.bindMopicUploader = function () {
                    uploadService.bindMoPicFileUploader({
                        "pickId": ".upload-mopic-btn",
                        "multiple": true,
                        "imageFileSingleSizeLimit": 2 * 1024 * 1024,
                        "videoFileSingleSizeLimit": 2 * 1024 * 1024
                    }, {
                        fileQueuedBefore: function (flowPhotoFileUploader, files) {
                            var currentSection = editorService.getDraft().node.sections[editorService.getEditor().currentSectionIdx];

                            if ((files.length > 9 || (files.length + ImagePanelObject.getPanelFiles().length) > 9) && document.getElementById("limitMopicTipText")) {
                                document.getElementById("limitMopicTipText").style.display = "block";
                            }

                            if (currentSection.components.length < EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {

                                if ($scope.getDraftMoPicLength() == EditorConstants.ELEMENT_LIMIT_LENGTH.MOPICS) {
                                    flowPhotoFileUploader.removeFiles(files);
                                    //
                                    publicPopup.alert("动图数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.MOPICS + "，已达到Moboo上限", function () {

                                    });
                                } else if (($scope.getDraftMoPicLength() + files.length) > EditorConstants.ELEMENT_LIMIT_LENGTH.MOPICS) {
                                    var cancelUploadFiles = [];

                                    for (var i = Math.min((EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS - currentSection.components.length), (EditorConstants.ELEMENT_LIMIT_LENGTH.MOPICS - $scope.getDraftMoPicLength())); i < files.length; i++) {
                                        cancelUploadFiles.push(files[i]);
                                    }

                                    flowPhotoFileUploader.removeFiles(cancelUploadFiles);
                                    //
                                    if ((currentSection.components.length + files.length) > EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                        //
                                        publicPopup.alert("当前章节视觉元素数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS + "，已达上限", function () {

                                        });
                                    } else {
                                        //
                                        publicPopup.alert("动图数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.MOPICS + "，已达到Moboo上限", function () {

                                        });
                                    }
                                }

                            } else if (currentSection.components.length == EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                flowPhotoFileUploader.removeFiles(files);
                                //
                                publicPopup.alert("当前章节视觉元素数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS + "，已达上限", function () {

                                });
                            }
                            //
                            $scope.$emit(
                                "openModuleWindow",
                                {
                                    moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                                    key: 'key', data: 'data'
                                }
                            );
                            //
                            editorService.getEditor().currentOpsCode = EditorConstants.USER_OPS.ADD_COMPONENT_MOPICS;
                            ImagePanelObject.uploadLoading = true;

                            $scope.$apply();
                        },
                        thumb: function (themFilesInfo) {
                            if (editorService.getEditor().currentOpsCode != EditorConstants.USER_OPS.ADD_SECTION || editorService.getDraft().node.sections.length < EditorConstants.ELEMENT_LIMIT_LENGTH.SECTIONS) {
                                ImagePanelObject.pushFileInfo($.extend(ImagePanelObject.getFile(themFilesInfo.fileId), themFilesInfo));
                            }
                            //
                            $scope.$apply();
                        },
                        progress: function (progressInfo) {
                            ImagePanelObject.pushFileInfo($.extend(ImagePanelObject.getFile(progressInfo.fileId), progressInfo));
                            //
                            $scope.$apply();
                        },
                        success: function (uploadedFileInfo) {
                            var fileName;
                            if (publicFunctions.stringUtil.lengthForUnicode(uploadedFileInfo.fileName) > 14) {

                                fileName = publicFunctions.stringUtil.subForUnicode(uploadedFileInfo.fileName, 14) + "...";
                            } else {
                                fileName = uploadedFileInfo.fileName;
                            }
                            //
                            var data = {
                                title: fileName,
                                text: "上传成功"
                            };

                            uploadPanelObject.pushSuccessFile(data);

                            //
                            ImagePanelObject.pushFileInfo($.extend(ImagePanelObject.getFile(uploadedFileInfo.fileId), uploadedFileInfo));

                            //
                            var resolution,
                                currentSectionIndex = editorService.getEditor().currentSectionIdx,
                                currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;

                            if (uploadedFileInfo.mediaType == "video") {
                                //crop
                                var videoFileId = $scope.editor.draft.fileNamePrefix.fileId + uploadedFileInfo.uniqueId;
                                var cropVideoData = {
                                    "mediaTypeCode": "video",
                                    "providerCode": "qiniu",
                                    "bucketCode": "creative",
                                    "originalFileId": videoFileId,
                                    "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                    "transformFormats": ["mp4"],
                                    "userQueue": true
                                };
                                if (uploadedFileInfo.width > 640) {
                                    resolution = editorFunctions.getZoomResolution(uploadedFileInfo.width, uploadedFileInfo.height, 640);
                                    cropVideoData.width = resolution.width;
                                    cropVideoData.height = resolution.height;
                                }

                                connectService.cropResource(cropVideoData);

                                //gif
                                var cropGifData = {
                                    "mediaTypeCode": "video",
                                    "providerCode": "qiniu",
                                    "bucketCode": "creative",
                                    "originalFileId": videoFileId,
                                    "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                    "transformFormats": ["gif"],
                                    "userQueue": true
                                };
                                if (uploadedFileInfo.width > 320) {
                                    resolution = editorFunctions.getZoomResolution(uploadedFileInfo.width, uploadedFileInfo.height, 320);
                                    cropGifData.width = resolution.width;
                                    cropGifData.height = resolution.height;
                                }
                                if (uploadedFileInfo.duration > 9) {
                                    cropGifData.startTime = 0;
                                    cropGifData.endTime = 9;
                                }

                                connectService.cropResource(cropGifData);
                            }
                            //
                            $scope.$apply();
                        },
                        finished: function () {
                            ImagePanelObject.uploadLoading = false;

                            $scope.$apply();
                        },
                        uploadError: function (uploadErrorFile) {
                            //
                            var fileName;
                            if (uploadErrorFile) {

                                if (publicFunctions.stringUtil.lengthForUnicode(uploadErrorFile.name) > 14) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(uploadErrorFile.name, 14) + "...";
                                } else {
                                    fileName = uploadErrorFile.name
                                }
                            } else {
                                fileName = "";
                            }
                            var data = {
                                title: fileName,
                                text: "上传失败"
                            };

                            uploadPanelObject.pushErrorFile(data);
                        },
                        error: function (message, file) {
                            var fileName;

                            if (typeof message == "string" && message === "文件过大") {
                                message = "文件过大，最大可上传2Mb的动图文件";
                            } else if (typeof message == "string" && message === "文件格式错误") {
                                message = "文件格式错误,无法上传(仅支持MP4、ogg、mov、gif)";
                            }

                            if (file) {

                                if (publicFunctions.stringUtil.lengthForUnicode(file.name) > 10) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(file.name, 10) + "...";
                                } else {
                                    fileName = file.name
                                }
                            } else {
                                fileName = "";
                            }

                            var data = {
                                title: fileName,
                                text: message
                            };

                            uploadPanelObject.pushErrorFile(data);
                        }
                    });
                };
                //
                $scope.bindReplaceMopicUploader = function () {
                    uploadService.bindMoPicFileUploader(
                        {
                            "pickId": ".replace-mopic-btn",
                            "multiple": false,
                            "imageFileSingleSizeLimit": 2 * 1024 * 1024,
                            "videoFileSingleSizeLimit": 2 * 1024 * 1024
                        },
                        {
                            fileQueuedBefore: function () {

                                editorService.getEditor().loadingStatus = true;
                                $scope.$apply();
                            },
                            success: function (uploadedFileInfo) {
                                var component, asset, resolution,
                                    currentSectionIndex = editorService.getEditor().currentSectionIdx,
                                    currentComponentIndex = editorService.getEditor().currentSectionComponentIdx,
                                    currentComponent = editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex];
                                //
                                if (uploadedFileInfo.mediaType == "video") {
                                    component = new Moboo.DraftNodeOfComponentVideo({});
                                    component.parse(currentComponent);
                                    //
                                    if (currentComponent.type == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN || currentComponent.type == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN) {
                                        component.type = Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN;
                                    } else {
                                        component.type = Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH;
                                    }
                                    //
                                    asset = new Moboo.DraftNodeOfAssetVideo({});

                                    asset.bucketCode = "creative";
                                    asset.name = uploadedFileInfo.fileName;
                                    asset.uniqueId = uploadedFileInfo.uniqueId;
                                    asset.width = uploadedFileInfo.width;
                                    asset.height = uploadedFileInfo.height;
                                    asset.duration = uploadedFileInfo.duration;
                                    asset.fileSize = uploadedFileInfo.fileSize;
                                    //
                                    component.assets[0].parse(asset);

                                    //crop
                                    var videoFileId = $scope.editor.draft.fileNamePrefix.fileId + asset.uniqueId;
                                    var cropVideoData = {
                                        "mediaTypeCode": "video",
                                        "providerCode": "qiniu",
                                        "bucketCode": "creative",
                                        "originalFileId": videoFileId,
                                        "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                        "transformFormats": ["mp4"],
                                        "userQueue": true
                                    };
                                    if (asset.width > 640) {
                                        resolution = editorFunctions.getZoomResolution(asset.width, asset.height, 640);
                                        cropVideoData.width = resolution.width;
                                        cropVideoData.height = resolution.height;
                                    }

                                    connectService.cropResource(cropVideoData);

                                    //gif
                                    var cropGifData = {
                                        "mediaTypeCode": "video",
                                        "providerCode": "qiniu",
                                        "bucketCode": "creative",
                                        "originalFileId": videoFileId,
                                        "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                        "transformFormats": ["gif"],
                                        "userQueue": true
                                    };
                                    if (asset.width > 320) {
                                        resolution = editorFunctions.getZoomResolution(asset.width, asset.height, 320);
                                        cropGifData.width = resolution.width;
                                        cropGifData.height = resolution.height;
                                    }
                                    if (asset.duration > 9) {
                                        cropGifData.startTime = 0;
                                        cropGifData.endTime = 9;
                                    }
                                    //
                                    connectService.cropResource(cropGifData);

                                } else if (uploadedFileInfo.mediaType == "image") {
                                    component = new Moboo.DraftNodeOfComponentImage({});
                                    component.parse(currentComponent);
                                    //
                                    if (currentComponent.type == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN || currentComponent.type == Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN) {
                                        component.type = Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN;
                                    } else {
                                        component.type = Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH;
                                    }

                                    asset = new Moboo.DraftNodeOfAssetImage({});

                                    asset.uniqueId = uploadedFileInfo.uniqueId;
                                    asset.name = uploadedFileInfo.fileName;
                                    asset.width = uploadedFileInfo.width;
                                    asset.height = uploadedFileInfo.height;
                                    asset.ave = uploadedFileInfo.ave;
                                    asset.bucketCode = "creative";
                                    //
                                    component.assets[0].parse(asset);
                                }
                                //
                                editorService.modifyComponent(currentSectionIndex, currentComponentIndex, component);
                                //
                                $scope.$apply();
                            },
                            finished: function () {
                                //
                                editorService.getEditor().loadingStatus = false;
                                $scope.$apply();
                            },
                            uploadError: function (uploadErrorFile) {
                                //
                                publicPopup.alert("上传失败", function () {
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    $scope.$apply();
                                });
                            },
                            error: function (message, file) {
                                var fileName;
                                if (file) {

                                    if (publicFunctions.stringUtil.lengthForUnicode(file.name) > 14) {

                                        fileName = publicFunctions.stringUtil.subForUnicode(file.name, 14) + "...";
                                    } else {
                                        fileName = file.name
                                    }
                                } else {
                                    fileName = "";
                                }

                                if (typeof message == "string" && message == "文件过大") {
                                    message = "文件过大，最大可上传2Mb的动图文件";
                                } else if (typeof message == "string" && message == "文件格式错误") {
                                    message = "文件格式错误<br/>仅支持仅支持MP4、ogg、mov、gif";
                                }

                                publicPopup.alert(fileName + message, function () {
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    $scope.$apply();
                                });
                            }
                        }
                    );
                };
                //
                $scope.bindVideoUploader = function () {
                    uploadService.bindVideoFileUploader(
                        {
                            "pickId": "#uploadVideoBtn",
                            "multiple": true,
                            "fileSingleSizeLimit": 20 * 1024 * 1024
                        },
                        {
                            fileQueuedBefore: function (videoFileUploader, files) {
                                var currentSection = editorService.getDraft().node.sections[editorService.getEditor().currentSectionIdx];

                                if (currentSection.components.length < EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                    if ($scope.getDraftVideoLength() == EditorConstants.ELEMENT_LIMIT_LENGTH.VIDEOS) {
                                        videoFileUploader.removeFiles(files);
                                        publicPopup.alert("单个moboo最多可上传3个视频", function () {

                                        });
                                    } else if ((currentSection.components.length + files.length) > EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS || ($scope.getDraftVideoLength() + files.length) > EditorConstants.ELEMENT_LIMIT_LENGTH.VIDEOS) {

                                        var cancelUploadFiles = [];

                                        for (var i = Math.min((EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS - currentSection.components.length), (EditorConstants.ELEMENT_LIMIT_LENGTH.VIDEOS - $scope.getDraftVideoLength())); i < files.length; i++) {
                                            cancelUploadFiles.push(files[i]);
                                        }

                                        videoFileUploader.removeFiles(cancelUploadFiles);
                                        //
                                        if ((currentSection.components.length + files.length) > EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                            //
                                            publicPopup.alert("当前章节视觉元素数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS + "，已达上限", function () {

                                            });
                                        } else {
                                            //
                                            publicPopup.alert("单个moboo最多可上传3个视频", function () {

                                            });
                                        }

                                    }
                                } else if (currentSection.components.length == EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                                    videoFileUploader.removeFiles(files);
                                    //
                                    publicPopup.alert("当前章节视觉元素数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS + "，已达上限", function () {

                                    });
                                }
                                //
                                editorService.getEditor().loadingStatus = true;
                                $scope.$apply();
                            },
                            success: function (uploadedFileInfo) {
                                var fileName;
                                if (publicFunctions.stringUtil.lengthForUnicode(uploadedFileInfo.fileName) > 14) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(uploadedFileInfo.fileName, 14) + "...";
                                } else {
                                    fileName = uploadedFileInfo.fileName;
                                }
                                //
                                var data = {
                                    title: fileName,
                                    text: "上传成功"
                                };

                                uploadPanelObject.pushSuccessFile(data);

                                //
                                var resolution,
                                    currentSectionIndex = editorService.getEditor().currentSectionIdx,
                                    currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;


                                var component = new Moboo.DraftNodeOfComponentVideo({});
                                component.uniqueId = editorFunctions.generateUniqueId();
                                //
                                var asset = new Moboo.DraftNodeOfAssetVideo({});

                                asset.bucketCode = "creative";
                                asset.name = uploadedFileInfo.fileName;
                                asset.uniqueId = uploadedFileInfo.uniqueId;
                                asset.width = uploadedFileInfo.width;
                                asset.height = uploadedFileInfo.height;
                                asset.duration = uploadedFileInfo.duration;
                                asset.fileSize = uploadedFileInfo.fileSize;
                                //
                                component.type = editorFunctions.getVideoComponentType(uploadedFileInfo.width, uploadedFileInfo.height);
                                component.assets.push(asset);
                                //
                                editorService.addComponent(currentSectionIndex, currentComponentIndex, component);


                                //crop
                                var videoFileId = $scope.editor.draft.fileNamePrefix.fileId + asset.uniqueId;
                                var cropVideoData = {
                                    "mediaTypeCode": "video",
                                    "providerCode": "qiniu",
                                    "bucketCode": "creative",
                                    "originalFileId": videoFileId,
                                    "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                    "transformFormats": ["mp4"],
                                    "userQueue": true
                                };
                                if (asset.width > 640) {
                                    resolution = editorFunctions.getZoomResolution(asset.width, asset.height, 640);
                                    cropVideoData.width = resolution.width;
                                    cropVideoData.height = resolution.height;
                                }

                                connectService.cropResource(cropVideoData);

                                //gif
                                var cropGifData = {
                                    "mediaTypeCode": "video",
                                    "providerCode": "qiniu",
                                    "bucketCode": "creative",
                                    "originalFileId": videoFileId,
                                    "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                    "transformFormats": ["gif"],
                                    "userQueue": true
                                };
                                if (asset.width > 320) {
                                    resolution = editorFunctions.getZoomResolution(asset.width, asset.height, 320);
                                    cropGifData.width = resolution.width;
                                    cropGifData.height = resolution.height;
                                }
                                if (asset.duration > 9) {
                                    cropGifData.startTime = 0;
                                    cropGifData.endTime = 9;
                                }
                                connectService.cropResource(cropGifData);

                                //
                                $scope.$apply();
                            },
                            finished: function () {
                                editorService.getEditor().loadingStatus = false;

                                if (uploadPanelObject.getErrorFiles().length > 0) {
                                    $scope.$emit(
                                        "openModuleWindow",
                                        {
                                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.UPLOAD_ERROR
                                        }
                                    );
                                } else {
                                    uploadPanelObject.reset();
                                }

                                $scope.$apply();
                            },
                            uploadError: function (uploadErrorFile) {
                                //
                                var fileName;
                                if (uploadErrorFile) {

                                    if (publicFunctions.stringUtil.lengthForUnicode(uploadErrorFile.name) > 14) {

                                        fileName = publicFunctions.stringUtil.subForUnicode(uploadErrorFile.name, 14) + "...";
                                    } else {
                                        fileName = uploadErrorFile.name
                                    }
                                } else {
                                    fileName = "";
                                }
                                var data = {
                                    title: fileName,
                                    text: "上传失败"
                                };

                                uploadPanelObject.pushErrorFile(data);
                            },
                            error: function (message, file) {
                                var fileName;

                                if (typeof message == "string" && message == "文件过大") {
                                    message = "文件过大，最大可上传20Mb的视频文件";
                                } else if (typeof message == "string" && message == "文件格式错误") {
                                    message = "文件格式错误,无法上传(仅支持MP4、ogg、mov)";
                                }

                                if (file) {

                                    if (publicFunctions.stringUtil.lengthForUnicode(file.name) > 14) {

                                        fileName = publicFunctions.stringUtil.subForUnicode(file.name, 14) + "...";
                                    } else {
                                        fileName = file.name
                                    }
                                } else {
                                    fileName = "";
                                }

                                var data = {
                                    title: fileName,
                                    text: message
                                };

                                uploadPanelObject.pushErrorFile(data);
                            }
                        }
                    )
                };
                //
                $scope.bindReplaceVideoUploader = function () {
                    uploadService.bindVideoFileUploader(
                        {
                            "pickId": ".replace-video-btn",
                            "multiple": false,
                            "fileSingleSizeLimit": 20 * 1024 * 1024
                        },
                        {
                            fileQueuedBefore: function (videoFileUploader, files) {
                                //
                                editorService.getEditor().loadingStatus = true;
                                $scope.$apply();
                            },
                            success: function (uploadedFileInfo) {
                                var resolution,
                                    currentSectionIndex = editorService.getEditor().currentSectionIdx,
                                    currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                                //
                                var asset = new Moboo.DraftNodeOfAssetVideo({});

                                asset.bucketCode = "creative";
                                asset.name = uploadedFileInfo.fileName;
                                asset.uniqueId = uploadedFileInfo.uniqueId;
                                asset.width = uploadedFileInfo.width;
                                asset.height = uploadedFileInfo.height;
                                asset.duration = uploadedFileInfo.duration;
                                asset.fileSize = uploadedFileInfo.fileSize;
                                //
                                editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, asset);

                                //crop
                                var videoFileId = $scope.editor.draft.fileNamePrefix.fileId + asset.uniqueId;
                                var cropVideoData = {
                                    "mediaTypeCode": "video",
                                    "providerCode": "qiniu",
                                    "bucketCode": "creative",
                                    "originalFileId": videoFileId,
                                    "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                    "transformFormats": ["mp4"],
                                    "userQueue": true
                                };
                                if (asset.width > 640) {
                                    resolution = editorFunctions.getZoomResolution(asset.width, asset.height, 640);
                                    cropVideoData.width = resolution.width;
                                    cropVideoData.height = resolution.height;
                                }

                                connectService.cropResource(cropVideoData);

                                //gif
                                var cropGifData = {
                                    "mediaTypeCode": "video",
                                    "providerCode": "qiniu",
                                    "bucketCode": "creative",
                                    "originalFileId": videoFileId,
                                    "fileIdPrefix": videoFileId.substring(0, videoFileId.lastIndexOf(".")),
                                    "transformFormats": ["gif"],
                                    "userQueue": true
                                };
                                if (asset.width > 320) {
                                    resolution = editorFunctions.getZoomResolution(asset.width, asset.height, 320);
                                    cropGifData.width = resolution.width;
                                    cropGifData.height = resolution.height;
                                }
                                if (asset.duration > 9) {
                                    cropGifData.startTime = 0;
                                    cropGifData.endTime = 9;
                                }
                                connectService.cropResource(cropGifData);
                                //
                                $scope.$apply();
                            },
                            finished: function () {
                                //
                                editorService.getEditor().loadingStatus = false;
                                $scope.$apply();
                            },
                            uploadError: function (uploadErrorFile) {
                                //
                                publicPopup.alert("上传失败", function () {
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    $scope.$apply();
                                });
                            },
                            error: function (message, file) {
                                var fileName;

                                if (file) {

                                    if (publicFunctions.stringUtil.lengthForUnicode(file.name) > 14) {

                                        fileName = publicFunctions.stringUtil.subForUnicode(file.name, 14) + "...";
                                    } else {
                                        fileName = file.name
                                    }
                                } else {
                                    fileName = "";
                                }

                                if (typeof message == "string" && message == "文件过大") {
                                    message = "文件过大，最大可上传20Mb的视频文件";
                                } else if (typeof message == "string" && message == "文件格式错误") {
                                    message = "文件格式错误<br/>仅支持仅支持MP4、ogg、mov";
                                }
                                publicPopup.alert(fileName + message, function () {
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    $scope.$apply();
                                });
                            }
                        }
                    )
                };
                //
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {

                        $scope.viewCoverImageUrlAndFilePrefix = editorParam.coverImageUploadSetting.viewUrlPrefix + editorParam.coverImageUploadSetting.storeFileNamePrefix;
                        $scope.viewImageUrlAndFilePrefix = editorParam.imageUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.audioUploadSetting.storeFileNamePrefix;
                        $scope.viewVideoUrlAndFilePrefix = editorParam.videoUploadSetting.viewUrlPrefix + editorParam.videoUploadSetting.storeFileNamePrefix;
                        //
                        $scope.bindImageDummyUploader();
                        //
                        $scope.bindImageUploader();
                        //
                        $scope.bindCoverImageFileUploader();
                        //
                        $scope.bindMopicUploader();
                        //
                        $scope.bindVideoUploader();
                        //
                        $scope.bindReplaceImageUploader();
                        $scope.bindReplaceMopicUploader();
                        $scope.bindReplaceVideoUploader();
                        //
                        $scope.modifyTitle();
                    }
                );
                /**
                 * end upload image、audio、video
                 * **/
            }
        ]
    );

    //文本属性controller
    editorModule.controller(
        "propertyController",
        [
            "$scope", "$http", "editorService", "EditorConstants",
            function ($scope, $http, editorService, EditorConstants) {
                //bind the service data to the scope.
                $scope.editor = editorService.getEditor();
                //
                $scope.editorFontFamilys = Moboo.DraftConstants.FONT.FAMILYS;
                $scope.editorFontSizes = Moboo.DraftConstants.FONT.SIZES;
                $scope.editorFontColors = Moboo.DraftConstants.FONT.COLORS;
                //
                $scope.fontPropertyOfSizeOps = false;
                $scope.fontPropertyOfFamilyOps = false;
                //
                $scope.propertyOfFontFamily = function (propertyAssetText) {
                    var fontFamily;
                    //
                    for (var i = 0; i < Moboo.DraftConstants.FONT.FAMILYS.length; i++) {
                        if (propertyAssetText.fontFamily == Moboo.DraftConstants.FONT.FAMILYS[i]) {

                            fontFamily = Moboo.DraftConstants.FONT.FAMILYS[i];
                            break;
                        }
                    }

                    return fontFamily;
                };
                //
                $scope.propertyOfFontSize = function (propertyAssetText) {
                    var fontSize;
                    //
                    for (var key in Moboo.DraftConstants.FONT.SIZES) {
                        if (propertyAssetText.fontSize == Moboo.DraftConstants.FONT.SIZES[key].size) {

                            fontSize = Moboo.DraftConstants.FONT.SIZES[key].name;
                            break;
                        }
                    }

                    return fontSize;
                };
                //
                $scope.showFontFamilyOrSizeSelectOptions = function ($event) {
                    var target = $event.srcElement || $event.target;

                    if (target.getAttribute("data-action") == EditorConstants.DATA_ACTION.SELECTED_FONT_FAMILY) {
                        //
                        $scope.fontPropertyOfSizeOps = false;
                        $scope.fontPropertyOfFamilyOps = !$scope.fontPropertyOfFamilyOps;

                    } else if (target.getAttribute("data-action") == EditorConstants.DATA_ACTION.SELECTED_FONT_SIZE) {
                        //
                        $scope.fontPropertyOfFamilyOps = false;
                        $scope.fontPropertyOfSizeOps = !$scope.fontPropertyOfSizeOps;
                    }
                };
                //
                $scope.setAssetTextEditStatus = function () {
                    editorService.getEditor().assetTextIsEditStatus = true;
                };
                //
                $scope.setFontFamily = function (fontFamily) {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx;
                    var currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    //
                    editorService.getEditor().propertyAssetText.fontFamily = fontFamily;
                    $scope.fontPropertyOfFamilyOps = false;
                    //
                    $scope.$emit(
                        "modifyAssetTextFont",
                        {}
                    );
                    //
                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {
                        //
                        editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {fontFamily: fontFamily});

                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {
                        //
                        editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {fontFamily: fontFamily});
                    }
                };
                //
                $scope.setFontSize = function (fontSize) {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx;
                    var currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    //
                    editorService.getEditor().propertyAssetText.fontSize = fontSize;
                    $scope.fontPropertyOfSizeOps = false;
                    //
                    $scope.$emit(
                        "modifyAssetTextFont",
                        {}
                    );
                    //
                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {
                        //
                        editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {fontSize: fontSize});

                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {
                        //
                        editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {fontSize: fontSize});
                    }
                };
                //
                $scope.setFontAlign = function ($event) {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    var target = $event.srcElement || $event.target;
                    //
                    if (target.getAttribute("data-action") === EditorConstants.DATA_ACTION.ALIGN_LEFT) {
                        //
                        editorService.getEditor().propertyAssetText.align = EditorConstants.DATA_ACTION.ALIGN_LEFT;
                        //
                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {

                            editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {align: EditorConstants.DATA_ACTION.ALIGN_LEFT});
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {

                            editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {align: EditorConstants.DATA_ACTION.ALIGN_LEFT});
                        }

                    } else if (target.getAttribute("data-action") === EditorConstants.DATA_ACTION.ALIGN_CENTER) {
                        //
                        editorService.getEditor().propertyAssetText.align = EditorConstants.DATA_ACTION.ALIGN_CENTER;
                        //
                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {

                            editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {align: EditorConstants.DATA_ACTION.ALIGN_CENTER});
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {

                            editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {align: EditorConstants.DATA_ACTION.ALIGN_CENTER});
                        }

                    } else if (target.getAttribute("data-action") === EditorConstants.DATA_ACTION.ALIGN_RIGHT) {
                        //
                        editorService.getEditor().propertyAssetText.align = EditorConstants.DATA_ACTION.ALIGN_RIGHT;
                        //
                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {

                            editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {align: EditorConstants.DATA_ACTION.ALIGN_RIGHT});
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {

                            editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {align: EditorConstants.DATA_ACTION.ALIGN_RIGHT});
                        }

                    } else if (target.getAttribute("data-action") === EditorConstants.DATA_ACTION.VERTICAL_ALIGN_TOP) {
                        //
                        editorService.getEditor().propertyAssetText.verticalAlign = EditorConstants.DATA_ACTION.VERTICAL_ALIGN_TOP;
                        //
                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {

                            editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {verticalAlign: EditorConstants.DATA_ACTION.VERTICAL_ALIGN_TOP});
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {

                            editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {verticalAlign: EditorConstants.DATA_ACTION.VERTICAL_ALIGN_TOP});
                        }

                    } else if (target.getAttribute("data-action") === EditorConstants.DATA_ACTION.VERTICAL_ALIGN_MIDDLE) {
                        //
                        editorService.getEditor().propertyAssetText.verticalAlign = EditorConstants.DATA_ACTION.VERTICAL_ALIGN_MIDDLE;
                        //
                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {

                            editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {verticalAlign: EditorConstants.DATA_ACTION.VERTICAL_ALIGN_MIDDLE});
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {

                            editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {verticalAlign: EditorConstants.DATA_ACTION.VERTICAL_ALIGN_MIDDLE});
                        }

                    } else if (target.getAttribute("data-action") === EditorConstants.DATA_ACTION.VERTICAL_ALIGN_BOTTOM) {
                        //
                        editorService.getEditor().propertyAssetText.verticalAlign = EditorConstants.DATA_ACTION.VERTICAL_ALIGN_BOTTOM;
                        //
                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {

                            editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {verticalAlign: EditorConstants.DATA_ACTION.VERTICAL_ALIGN_BOTTOM});
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {

                            editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {verticalAlign: EditorConstants.DATA_ACTION.VERTICAL_ALIGN_BOTTOM});
                        }
                    }
                };
                //
                $scope.setFontColor = function ($event) {
                    var target = $event.srcElement || $event.target,
                        fontColor = target.getAttribute("data-color"),
                        currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    //
                    editorService.getEditor().propertyAssetText.fontColor = fontColor;
                    //
                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_IMAGE_CAPTION) {
                        //
                        editorService.modifyCaptionForImageAssert(currentSectionIndex, currentComponentIndex, 0, {fontColor: fontColor});

                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_COMPONENT_ASSET) {
                        //
                        editorService.modifyAsset(currentSectionIndex, currentComponentIndex, 0, {fontColor: fontColor});
                    }
                }
            }
        ]
    );

    //loading
    editorModule.controller(
        "loadingController",
        [
            "$scope", "$http", "editorService", "EditorConstants",
            function ($scope, $http, editorService, EditorConstants) {
                //bind the service data to the scope.
                $scope.editor = editorService.getEditor();
                //用来控制模块是否显示。
                $scope.show = false;

                ////////////////////////
                //the event listener.
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.LOADING,
                    function (event, data) {
                        //
                        $scope.show = true;
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.CLOSE + EditorConstants.MODULE_WINDOW_NAME.LOADING,
                    function (event, data) {
                        //
                        $scope.show = false;

                        //todo.
                    }
                );
            }
        ]
    );
}