if (editorModule) {
    //
    editorModule.service("editorFunctions",
        [
            function () {
                return Moboo.Functions;
            }
        ]
    );

    editorModule.service("publicFunctions",
        [
            function () {
                return MobooLib.Functions;
            }
        ]
    );

    editorModule.service("publicPopup",
        [
            function () {
                return MobooLib.Popups;
            }
        ]
    );

    //from editor config.
    editorModule.service(
        "editorParam",
        ["$interval", "EditorConstants",
            function ($interval, EditorConstants) {
                var editorParam = {};

                //
                editorInitParam = editorInitParam || {};

                //
                editorParam.draftNo = editorInitParam.draftNo;
                editorParam.narrateTypeCode = editorInitParam.narrateTypeCode;
                editorParam.circles = editorInitParam.circles;

                //
                editorParam.userNo = editorInitParam.userNo;

                //the upload settings.
                editorParam.imageUploadSetting = editorInitParam.imageUploadSetting;
                editorParam.audioUploadSetting = editorInitParam.audioUploadSetting;
                editorParam.videoUploadSetting = editorInitParam.videoUploadSetting;
                editorParam.coverImageUploadSetting = editorInitParam.coverImageUploadSetting;
                editorParam.libAudioUploadSetting = editorInitParam.libAudioUploadSetting;

                //for displayer
                editorParam.assetDisplayDomainUrl = editorInitParam.assetDisplayDomainUrl;
                editorParam.mobooDisplayerVersion = editorInitParam.mobooDisplayerVersion;

                //for domain
                editorParam.noviceGuideCookieDomain = editorInitParam.noviceGuideCookieDomain;

                //url prefix
                editorParam.defaultBucketOriginalUrlPrefix = editorInitParam.defaultBucketOriginalUrlPrefix;
                editorParam.mobooBucketOriginalUrlPrefix = editorInitParam.mobooBucketOriginalUrlPrefix;
                editorParam.libraryBucketOriginalUrlPrefix = editorInitParam.libraryBucketOriginalUrlPrefix;
                editorParam.creativeBucketOriginalUrlPrefix = editorInitParam.creativeBucketOriginalUrlPrefix;

                //the ajax apis
                editorParam.apiDomainPrefix = editorInitParam.apiDomainPrefix;
                if (editorParam.apiDomainPrefix == "" || editorParam.apiDomainPrefix == null) {
                    editorParam.apiDomainPrefix = window.location.protocol + '//' + window.location.host;
                }

                //ajax api url
                editorParam.ajaxApiUrlGetDraftInitData = editorInitParam.ajaxApiUrlGetDraftInitData || EditorConstants.API_URL.GET_DRAFT_INIT_DATE;
                editorParam.ajaxApiUrlQueryAllThemes = editorInitParam.ajaxApiUrlQueryAllThemes || EditorConstants.API_URL.QUERY_ALL_THEMES;

                //
                editorParam.ajaxApiUrlQueryCircles = editorInitParam.ajaxApiUrlQueryCircles || EditorConstants.API_URL.QUERY_CIRCLES;

                //
                editorParam.ajaxApiUrlQueryBgmTags = editorInitParam.ajaxApiUrlQueryBgmTags || EditorConstants.API_URL.QUERY_BGM_TAGS;
                editorParam.ajaxApiUrlQueryEffectMusicTags = editorInitParam.ajaxApiUrlQueryEffectMusicTags || EditorConstants.API_URL.QUERY_EFFECT_MUSIC_TAGS;
                editorParam.ajaxApiUrlQueryEnvMusicTags = editorInitParam.ajaxApiUrlQueryEnvMusicTags || EditorConstants.API_URL.QUERY_EVN_MUSIC_TAGS;

                //
                editorParam.ajaxApiUrlSearchLibraries = editorInitParam.ajaxApiUrlSearchLibraries || EditorConstants.API_URL.SEARCH_LIBRARIES;
                editorParam.ajaxApiUrlSearchSelfLibraries = editorInitParam.ajaxApiUrlSearchSelfLibraries || EditorConstants.API_URL.SEARCH_SELF_LIBRARIES;
                editorParam.ajaxApiUrlCreateSelfLibrary = editorInitParam.ajaxApiUrlCreateSelfLibrary || EditorConstants.API_URL.CREATE_SELF_LIBRARIES;
                editorParam.ajaxApiUrlModifySelfLibrary = editorInitParam.ajaxApiUrlModifySelfLibrary || EditorConstants.API_URL.MODIFY_SELF_LIBRARIES;
                editorParam.ajaxApiUrlRemoveSelfLibrary = editorInitParam.ajaxApiUrlRemoveSelfLibrary || EditorConstants.API_URL.REMOVE_SELF_LIBRARIES;

                //
                editorParam.ajaxApiUrlSaveDraft = editorInitParam.ajaxApiUrlSaveDraft || EditorConstants.API_URL.SAVE_DRAFT;
                editorParam.ajaxApiUrlSaveDraftRoot = editorInitParam.ajaxApiUrlSaveDraftRoot || EditorConstants.API_URL.SAVE_DRAFT_ROOT;
                editorParam.ajaxApiUrlSaveDraftSection = editorInitParam.ajaxApiUrlSaveDraftSection || EditorConstants.API_URL.SAVE_DRAFT_SECTION;
                editorParam.ajaxApiUrlGetUploadSetting = editorInitParam.ajaxApiUrlGetUploadSetting || EditorConstants.API_URL.GET_UPLOAD_SETTING;
                editorParam.ajaxApiUrlCropResource = editorInitParam.ajaxApiUrlCropResource || EditorConstants.API_URL.CROP_RESOURCE;
                editorParam.ajaxApiUrlGetPretreatmentFopStatus = editorInitParam.ajaxApiUrlGetPretreatmentFopStatus || EditorConstants.API_URL.GET_PRETREATMENT_FOP_STATUS;
                editorParam.ajaxApiUrlGenerateAudioMultiVolumeFiles = editorInitParam.ajaxApiUrlGenerateAudioMultiVolumeFiles || EditorConstants.API_URL.GENERATE_AUDIO_MULTI_VOLUME_FILES;
                editorParam.ajaxApiUrlPublishDraft = editorInitParam.ajaxApiUrPublishDraft || EditorConstants.API_URL.PUBLISH_DRAFT;

                editorParam.apiUrlPublishDraft = editorInitParam.apiUrlPublishDraftPrefix || EditorConstants.API_URL.PUBLISH_DRAFT_PREFIX + editorParam.draftNo;
                editorParam.apiUrlUserArticleList = editorInitParam.apiUrlUserArticleList || EditorConstants.API_URL.USER_ARTICLE_LIST;


                editorParam.ajaxApiUrlNoviceGuideImplement = editorInitParam.ajaxApiUrlNoviceGuideImplement || EditorConstants.API_URL.NOVICE_GUIDE_IMPLEMENT;
                //connect db service
                editorParam.synDb = editorInitParam.synDb != undefined ? editorInitParam.synDb : true;
                return editorParam;
            }
        ]
    );

    editorModule.service("connectService",
        ["$http", "$q", "$interval", "editorParam", "publicFunctions",
            function ($http, $q, $interval, editorParam, publicFunctions) {
                var synDb = editorParam.synDb;

                //
                this.getUploadSetting = function (bucketCode, mediaTypeCode, storeFileNamePrefix) {
                    var deferred = $q.defer();

                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlGetUploadSetting,
                        {
                            "bucketCode": bucketCode,
                            "mediaTypeCode": mediaTypeCode,
                            "storeFileNamePrefix": storeFileNamePrefix
                        }
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            deferred.notify(error);
                        }
                    );

                    return deferred.promise;
                };

                //
                this.queryBgMusicTags = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }

                    //
                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlQueryBgmTags,
                        paramData
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(error);
                        }
                    );

                    return deferred.promise;
                };

                //
                this.queryEffectMusicTags = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }

                    //
                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlQueryEffectMusicTags,
                        paramData
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(error);
                        }
                    );

                    return deferred.promise;
                };

                //环境音
                this.queryEvnMusicTags = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }

                    //
                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlQueryEnvMusicTags,
                        paramData
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(error);
                        }
                    );

                    return deferred.promise;
                };

                //
                this.searchBgMusics = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }
                    paramData.libraryItemTypeCode = "background.music";

                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSearchLibraries,
                        paramData
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (data) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(data);
                        }
                    );

                    return deferred.promise;
                };

                //
                this.searchEffectMusics = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }
                    paramData.libraryItemTypeCode = "effect.music";

                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSearchLibraries,
                        paramData
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (data) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(data);
                        }
                    );

                    return deferred.promise;
                };

                //
                this.searchEvnMusics = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }
                    paramData.libraryItemTypeCode = "env.music";

                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSearchLibraries,
                        paramData
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (data) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(data);
                        }
                    );

                    return deferred.promise;
                };


                //
                this.querySelfBgMusics = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }
                    paramData.libraryItemTypeCode = "background.music";

                    //
                    if (synDb) {
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSearchSelfLibraries,
                            paramData
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                deferred.notify(error);
                            }
                        );
                    }

                    return deferred.promise;
                };

                //
                this.querySelfEffectMusics = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }
                    paramData.libraryItemTypeCode = "effect.music";

                    //
                    if (synDb) {
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSearchSelfLibraries,
                            paramData
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                deferred.notify(error);
                            }
                        );
                    }

                    return deferred.promise;
                };

                //
                this.querySelfEvnMusics = function (paramData) {
                    var deferred = $q.defer();

                    if (paramData == undefined || paramData == null) {
                        paramData = {};
                    }
                    paramData.libraryItemTypeCode = "env.music";

                    //
                    if (synDb) {
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSearchSelfLibraries,
                            paramData
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                deferred.notify(error);
                            }
                        );
                    }

                    return deferred.promise;
                };

                //
                this.createSelfLibrary = function (paramData) {
                    var deferred = $q.defer();

                    //
                    if (synDb) {
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlCreateSelfLibrary,
                            paramData
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                deferred.notify(error);
                            }
                        );
                    }

                    return deferred.promise;
                };

                //
                this.modifySelfLibrary = function (paramData) {
                    var deferred = $q.defer();

                    //
                    if (synDb) {
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlModifySelfLibrary,
                            paramData
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                deferred.notify(error);
                            }
                        );
                    }
                    return deferred.promise;
                };


                //
                this.removeSelfLibrary = function (paramData) {
                    var deferred = $q.defer();

                    if (synDb) {
                        //
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlRemoveSelfLibrary,
                            paramData
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                deferred.notify(error);
                            }
                        );
                    }

                    return deferred.promise;
                };


                //
                this.queryAllThemes = function () {
                    var deferred = $q.defer();

                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlQueryAllThemes, {}
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(error);
                        }
                    );

                    return deferred.promise;
                };
                //
                this.queryCircles = function (data) {
                    var deferred = $q.defer();

                    $http.post(editorParam.apiDomainPrefix + editorParam.ajaxApiUrlQueryCircles, data).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else if (response.data.code == -2) {
                                publicPopup.signonProcess();
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错");
                            deferred.reject();
                        }
                    );
                    return deferred.promise;
                };

                this.publishDraft = function (episodeObject) {
                    var deferred = $q.defer();

                    $http.post(editorParam.apiDomainPrefix + editorParam.ajaxApiUrlPublishDraft, episodeObject).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function () {
                            console.log("通信出错");
                            deferred.reject();
                        }
                    );
                    return deferred.promise;
                };

                //
                this.getDraft = function () {
                    var deferred = $q.defer();
                    //$http.defaults.useXDomain = true;
                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlGetDraftInitData,
                        {
                            "draftNo": editorParam.draftNo,
                            "narrateTypeCode": editorParam.narrateTypeCode
                        }
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(error);
                        }
                    );

                    return deferred.promise;
                };

                //
                this.saveDraftWithDetail = function (draftNo, title, subtitle, bodyText, coverData, fileNamePrefixData, draftData) {
                    var deferred = $q.defer();

                    if (synDb) {
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSaveDraft,
                            {
                                "draftNo": draftNo,
                                "title": title,
                                "subtitle": subtitle,
                                "bodyText": bodyText,
                                "providerCode": "qiniu",
                                "coverFileId": coverData ? coverData.fileId : null,
                                "coverBackCode": "default",
                                "coverAve": coverData && coverData.ave != null ? coverData.ave.ave : null,
                                "coverResolution": coverData && coverData.resolution ? coverData.resolution.width + "*" + coverData.resolution.height : null,
                                "bucketCode": "creative",
                                "resourcePrefixFileId": fileNamePrefixData ? fileNamePrefixData.fileId : null,
                                //
                                "detail": draftData
                            }
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                publicPopup.ajaxExceptionProcess(error);

                                // deferred.notify(data);
                            }
                        )
                    }

                    //
                    return deferred.promise;
                };

                //
                this.saveDraft = function (draftNo, title, subtitle, bodyText, coverData, fileNamePrefixData) {
                    var deferred = $q.defer();

                    if (synDb) {
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSaveDraft,
                            {
                                "draftNo": draftNo,
                                "title": title,
                                "subtitle": subtitle,
                                "bodyText": bodyText,
                                "providerCode": "qiniu",
                                "coverFileId": coverData ? coverData.fileId : null,
                                "coverBackCode": "default",
                                "coverAve": coverData && coverData.ave ? coverData.ave.ave : null,
                                "coverResolution": coverData && coverData.resolution ? coverData.resolution.width + "*" + coverData.resolution.height : null,
                                "bucketCode": "creative",
                                "resourcePrefixFileId": fileNamePrefixData ? fileNamePrefixData.fileId : null
                            }
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                publicPopup.ajaxExceptionProcess(error);

                                //   deferred.notify(data);
                            }
                        );
                    }

                    return deferred.promise;
                };

                this.saveRootDraft = function (draftNo, draftData) {
                    var deferred = $q.defer();

                    if (synDb) {
                        //
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSaveDraftRoot,
                            {
                                "draftNo": draftNo,
                                "root": draftData
                            }
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                publicPopup.ajaxExceptionProcess(error);

                                //  deferred.notify(data);
                            }
                        );
                    }

                    return deferred.promise;
                };

                //
                this.saveSection = function (draftNo, sectionData, nodeIndex) {
                    var deferred = $q.defer();

                    var data = {
                        "draftNo": draftNo,
                        "section": sectionData
                    };

                    //
                    if (nodeIndex != undefined && nodeIndex != null) {
                        data.nodeIndex = nodeIndex;
                    }

                    if (synDb) {
                        //
                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlSaveDraftSection,
                            data
                        ).then(
                            function (response) {
                                if (response.data.code == 1) {
                                    //
                                    deferred.resolve(response.data.result);
                                } else {
                                    deferred.reject(response.data);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                publicPopup.ajaxExceptionProcess(error);
                                // deferred.notify(data);
                            }
                        );
                    }

                    return deferred.promise;
                };

                //crop resource
                this.cropResource = function (data) {
                    var deferred = $q.defer();

                    //
                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlCropResource,
                        data
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                //
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(error);
                        }
                    );
                    return deferred.promise;
                };


                //get pretreatment fop status
                this.getPretreatmentFopStatus = function (persistId) {
                    var deferred = $q.defer();

                    var endData = 0;
                    var timer = $interval(function () {
                        if (endData > 2000 * 15) {
                            clearTime();
                            deferred.resolve(false);
                        }

                        endData += 2000;

                        $http.post(
                            editorParam.apiDomainPrefix + editorParam.ajaxApiUrlGetPretreatmentFopStatus, {
                                persistId: persistId
                            }
                        ).then(
                            function (response) {
                                // console.log(response.data);
                                if (response.data.code == 1 && response.data.result) {
                                    clearTime();
                                    deferred.resolve(true);
                                }
                            },
                            function (error) {
                                console.log("通信出错:" + JSON.stringify(error));
                                deferred.notify(data);
                            }
                        );
                    }, 2000);

                    //
                    function clearTime() {
                        $interval.cancel(timer);
                    }

                    return deferred.promise;
                };

                //
                this.generateAudioMultiVolumeFiles = function (dataJson) {
                    var deferred = $q.defer();

                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlGenerateAudioMultiVolumeFiles,
                        dataJson
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(data);
                        }
                    );
                    return deferred.promise;
                }

                //
                this.saveCurrentStep = function (stepNum) {
                    var deferred = $q.defer();

                    $http.post(
                        editorParam.apiDomainPrefix + editorParam.ajaxApiUrlNoviceGuideImplement,
                        {stepNum: stepNum}
                    ).then(
                        function (response) {
                            if (response.data.code == 1) {
                                deferred.resolve(response.data.result);
                            } else {
                                deferred.reject(response.data);
                            }
                        },
                        function (error) {
                            console.log("通信出错:" + JSON.stringify(error));
                            deferred.notify(data);
                        }
                    );
                    return deferred.promise;
                }

                //
                this.tryIframeSignon = function () {
                    var deferred = $q.defer();
                    //
                    var iframe = document.createElement('iframe');
                    iframe.src = editorParam.apiDomainPrefix + '/creative/draft/signon/silent';
                    iframe.style.display = "none";

                    //
                    iframe.onload = function () {
                        var userNo = getUserNo();
                        editorParam.userNo = userNo;
                        document.body.removeChild(iframe);
                        // console.log("userNo" + userNo);
                        deferred.resolve(userNo && userNo != null);
                    };

                    document.body.appendChild(iframe);

                    return deferred.promise;
                }
            }
        ]
    );

    //
    editorModule.service("editorService",
        [
            "connectService", "publicFunctions", "$interval", "$timeout", "editorParam",
            function (connectService, publicFunctions, $interval, $timeout, editorParam) {
                //
                var editor = new Moboo.Editor();

                this.trySignOn = function () {
                    var thatThis = this;
                    if (!editor.isTryIframeSignon) {
                        var timer = $interval(function () {
                            if (editor.tryIframeSignonTimes >= 5) {
                                editor.tryIframeSignonTimes = 0;
                                publicFunctions.signonBlankPageProcess(editorParam.apiDomainPrefix + "/signon?successurl=" + editorParam.apiDomainPrefix + "/user/creative/signon/success");
                            }
                            connectService.tryIframeSignon().then(function (data) {
                                if (data) {
                                    //
                                    var draftNode = thatThis.getDraft();
                                    connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                                            editor.tryIframeSignonTimes = 0;
                                            editor.isTryIframeSignon = false;
                                            $interval.cancel(timer);
                                        }, function (data) {
                                            if (data.code == -2) {
                                                editor.tryIframeSignonTimes++;
                                                editor.isTryIframeSignon = true;
                                            } else {
                                                publicPopup.ajaxExceptionProcess(data);
                                            }
                                        }
                                    );
                                } else {
                                    editor.tryIframeSignonTimes++;
                                    editor.isTryIframeSignon = true;
                                }
                            });
                        }, 1000 * 30);
                    }


                };
                //
                this.initDraft = function (draftData) {
                    //
                    editor.initDraft(draftData);
                };

                //
                this.getEditor = function () {
                    return editor;
                };

                //
                this.getEpisode = function () {
                    var draft = editor.getDraft();

                    return draft.getEpisodeNode();
                };

                //
                this.getEpisodeJson = function () {
                    var draft = editor.getDraft();

                    return draft.getEpisodeJson();
                };
                //
                this.getDraft = function () {
                    return editor.getDraft();
                };

                //
                this.getSection = function (sectionIndex) {
                    return editor.getDraft().getSectionNode(sectionIndex);
                };

                this.getSectionJson = function (sectionIndex) {
                    return editor.getDraft().getSectionJson(sectionIndex);
                }

                //
                this.getCoverSectionJson = function () {
                    return editor.getDraft().getCoverSectionForJson();
                };

                //
                this.getComponent = function (sectionIndex, componentIndex) {
                    return editor.getDraft().getComponentNode(sectionIndex, componentIndex);
                };

                //
                this.getBgMusic = function () {
                    return editor.getDraft().getBgMusicNode(0);
                };

                //
                this.modifyCover = function (coverData) {
                    editor.getDraft().modifyCover(coverData);

                    var thatThis = this;

                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        )
                        draftNode.modifyEpisodeNode({"syncStatus": "valid"});
                    } else {
                        connectService.saveDraft(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                this.modifyTitle = function (title) {
                    editor.getDraft().modifyTitle(title);

                    var thatThis = this;
                    //save db
                    var draftNode = this.getDraft();
                    //console.log("syncStatus=" + draftNode.getEpisodeNode().syncStatus + ",lastUpdateDate=" + draftNode.lastUpdateDate);
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        if (draftNode.lastUpdateDate == undefined || draftNode.lastUpdateDate == null) {
                            draftNode.lastUpdateDate = new Date();
                            connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                                    draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                                }, function (data) {
                                    if (data.code == -2) {
                                        thatThis.trySignOn();
                                    } else {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }
                                }
                            );
                        } else {
                            var timer = $timeout(function () {
                                connectService.saveDraft(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix).then(function (data) {
                                        $timeout.cancel(timer);
                                    }, function (data) {
                                        if (data.code == -2) {
                                            thatThis.trySignOn();
                                        } else {
                                            publicPopup.ajaxExceptionProcess(data);
                                        }
                                    }
                                );
                            }, 2000);
                        }
                    } else {
                        connectService.saveDraft(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                this.modifySubtitle = function (subtitle) {
                    editor.getDraft().modifySubtitle(subtitle);

                    var thatThis = this;
                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                                draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    } else {
                        connectService.saveDraft(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                this.modifyBodyText = function (bodyText) {
                    editor.getDraft().modifyBodyText(bodyText);

                    var thatThis = this;

                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                        draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                    } else {
                        connectService.saveDraft(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                //
                this.saveEpisode = function () {

                    var thatThis = this;

                    //save db
                    var draftNode = this.getDraft();
                    connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.modifyEpisode = function (episodeData) {
                    editor.getDraft().modifyEpisodeNode(episodeData);
                    var thatThis = this;

                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                        draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                    } else {
                        connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                //
                this.addBgMusic = function (bgMusicNode) {
                    editor.getDraft().addBgMusicNode(0, bgMusicNode);

                    var thatThis = this;

                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                        draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                    } else {
                        connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                this.modifyBgMusic = function (updateBgMusicDta) {
                    editor.getDraft().modifyBgMusicNode(0, updateBgMusicDta);

                    var thatThis = this;

                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                        draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                    } else {
                        connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                this.removeBgMusic = function () {
                    editor.getDraft().removeBgMusicNode(0);

                    var thatThis = this;

                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                        draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                    } else {
                        connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                //
                this.addSection = function (sectionIndex, sectionNode) {
                    editor.getDraft().addSectionNode(sectionIndex, sectionNode);
                    var thatThis = this;
                    //save db
                    var draftNode = this.getDraft();
                    if (draftNode.getEpisodeNode().syncStatus == "invalid") {
                        connectService.saveDraftWithDetail(draftNode.draftNo, draftNode.title, draftNode.subtitle, draftNode.bodyText, draftNode.cover, draftNode.fileNamePrefix, draftNode.getEpisodeJson()).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                        draftNode.getEpisodeNode().parse({"syncStatus": "valid"});
                    } else {
                        connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                };

                this.addAudioToSection = function (sectionIndex, audioNode) {
                    editor.getDraft().addAudioNodeToSectionNode(sectionIndex, 0, audioNode);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.modifySection = function (sectionIndex, updateData) {
                    editor.getDraft().modifySectionNode(sectionIndex, updateData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                //
                this.modifySectionAudio = function (sectionIndex, modifyData) {
                    editor.getDraft().modifySectionAudioNode(sectionIndex, 0, modifyData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.removeSection = function (sectionIndex) {
                    editor.getDraft().removeSectionNode(sectionIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                //
                this.saveSection = function (srcSectionIndex, targetSectionIndex) {
                    var thatThis = this;
                    if (srcSectionIndex === targetSectionIndex) {
                        connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(srcSectionIndex), srcSectionIndex).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    } else {
                        connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(srcSectionIndex), srcSectionIndex).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                        connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(targetSectionIndex), targetSectionIndex);
                    }
                };

                this.removeAudioFromSection = function (sectionIndex) {
                    editor.getDraft().removeAudioNodeFromSection(sectionIndex, 0);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.addComponent = function (sectionIndex, componentIndex, componentData) {
                    editor.getDraft().addComponentNode(sectionIndex, componentIndex, componentData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                //
                this.addComponents = function (sectionIndex, componentIndex, componentDatas) {
                    editor.getDraft().addComponentNodes(sectionIndex, componentIndex, componentDatas);

                    //save db
                    var thatThis = this;
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.modifyComponent = function (sectionIndex, componentIndex, updateData) {
                    editor.getDraft().modifyComponentNode(sectionIndex, componentIndex, updateData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.removeComponent = function (sectionIndex, componentIndex) {
                    editor.getDraft().removeComponentNode(sectionIndex, componentIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                //
                this.addAction = function (sectionIndex, componentIndex, actionData) {
                    editor.getDraft().addActionNode(sectionIndex, componentIndex, actionData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.modifyAction = function (sectionIndex, componentIndex, actionIndex, updateData) {
                    editor.getDraft().modifyActionNode(sectionIndex, componentIndex, actionIndex, updateData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.removeAction = function (sectionIndex, componentIndex, actionIndex) {

                    editor.getDraft().removeActionNode(sectionIndex, componentIndex, actionIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.addCaptionForImageAssert = function (sectionIndex, componentIndex, assetIndex, captionData) {
                    editor.getDraft().addCaptionForImageAssertNode(sectionIndex, componentIndex, assetIndex, captionData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.modifyCaptionForImageAssert = function (sectionIndex, componentIndex, assetIndex, updateData) {
                    editor.getDraft().modifyCaptionForImageAssertNode(sectionIndex, componentIndex, assetIndex, updateData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.removeCaptionForImageAssert = function (sectionIndex, componentIndex, assetIndex) {
                    editor.getDraft().removeCaptionForImageAssertNode(sectionIndex, componentIndex, assetIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.addDescriptionForImageAssertNode = function (sectionIndex, componentIndex, assetIndex, descriptionNode) {
                    editor.getDraft().addDescriptionForImageAssertNode(sectionIndex, componentIndex, assetIndex, descriptionNode);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.modifyDescriptionForImageAssertNode = function (sectionIndex, componentIndex, assetIndex, descriptionData) {
                    editor.getDraft().modifyDescriptionForImageAssertNode(sectionIndex, componentIndex, assetIndex, descriptionData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.modifyAsset = function (sectionIndex, componentIndex, assetIndex, assertData) {
                    editor.getDraft().modifyAssetNode(sectionIndex, componentIndex, assetIndex, assertData);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveSectionDown = function (sectionIndex) {
                    editor.getDraft().moveSectionNodeDown(sectionIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveSectionUp = function (sectionIndex) {
                    editor.getDraft().moveSectionNodeUp(sectionIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveSectionSwap = function (srcSectionIndex, targetSectionIndex) {
                    editor.getDraft().moveSectionNodeSwap(srcSectionIndex, targetSectionIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveSectionFontInsert = function (srcSectionIndex, targetSectionIndex) {
                    editor.getDraft().moveSectionNodeFontInsert(srcSectionIndex, targetSectionIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveSectionBehindInsert = function (srcSectionIndex, targetSectionIndex) {
                    editor.getDraft().moveSectionNodeBehindInsert(srcSectionIndex, targetSectionIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveRootDraft(this.getDraft().draftNo, this.getEpisodeJson()).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveComponentDown = function (sectionIndex, componentIndex) {
                    var lastComponent = this.getSection(sectionIndex).components.length - 1 == componentIndex;
                    editor.getDraft().moveComponentNodeDown(sectionIndex, componentIndex);

                    var thatThis = this;
                    //save db
                    if (lastComponent) {
                        connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex + 1), sectionIndex + 1).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveComponentUp = function (sectionIndex, componentIndex) {
                    editor.getDraft().moveComponentNodeUp(sectionIndex, componentIndex);

                    var thatThis = this;
                    //save db
                    if (componentIndex == 0) {
                        connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex - 1), sectionIndex - 1).then(function (data) {
                            }, function (data) {
                                if (data.code == -2) {
                                    thatThis.trySignOn();
                                } else {
                                    publicPopup.ajaxExceptionProcess(data);
                                }
                            }
                        );
                    }
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveComponentSwap = function (sectionIndex, srcComponentIndex, targetComponentIndex) {
                    editor.getDraft().moveComponentNodeUp(sectionIndex, srcComponentIndex, targetComponentIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveComponentFontInsert = function (sectionIndex, srcComponentIndex, targetComponentIndex) {
                    editor.getDraft().moveComponentNodeFontInsert(sectionIndex, srcComponentIndex, targetComponentIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveComponentBehindInsert = function (sectionIndex, srcComponentIndex, targetComponentIndex) {
                    editor.getDraft().moveComponentNodeBehindInsert(sectionIndex, srcComponentIndex, targetComponentIndex);

                    var thatThis = this;
                    //save db
                    connectService.saveSection(this.getDraft().draftNo, this.getSectionJson(sectionIndex), sectionIndex).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

                this.moveComponentFontInsertFromCrossSection = function (srcSectionIndex, srcComponentIndex, targetSectionIndex, targetComponentIndex) {
                    editor.getDraft().moveComponentNodeFontInsertFromCrossSectionNode(srcSectionIndex, srcComponentIndex, targetComponentIndex, targetComponentIndex);

                    var thatThis = this;
                    //save db
                    var draftNo = this.getDraft().draftNo;
                    connectService.saveSection(draftNo, this.getSectionJson(srcSectionIndex)).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                    connectService.saveSection(draftNo, this.getSectionJson(targetSectionIndex)).then(function (data) {
                        }, function (data) {
                            if (data.code == -2) {
                                thatThis.trySignOn();
                            } else {
                                publicPopup.ajaxExceptionProcess(data);
                            }
                        }
                    );
                };

            }
        ]
    )
    ;
    //
    editorModule.service(
        "audioRecordService",
        [
            function () {
                return new MobooLib.AudioRecord(
                    {workerPath: "/static/js/audioRecorderWorker.js"}
                );
            }
        ]
    );

    //
    editorModule.service(
        "audioCropService",
        [
            function () {
                return new MobooLib.AudioCrop(
                    {}
                );
            }
        ]
    );
    //
    editorModule.service("dragBarService",
        [
            function () {
                return new MobooLib.DragBar(
                    {}
                );
            }
        ]
    );
    //
    editorModule.factory("ImagePanelObject", ["editorFunctions", "editorService", "EditorConstants", function (editorFunctions, editorService, EditorConstants) {
        var ImagePanelObject = {};

        //
        ImagePanelObject.showUploadImagePanel = false;
        ImagePanelObject.uploadLoading = false;
        ImagePanelObject.panelImageHeight = 0;
        ImagePanelObject.sectionComponentWarnText = null;

        var currentFileIndex = 0;

        //
        ImagePanelObject.fileNum = 0;
        //ImagePanelObject.files = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
        ImagePanelObject.files = [];
        ImagePanelObject.fileIds = {};

        //use in section or component
        ImagePanelObject.useSection = false;

        ImagePanelObject.getFiles = function () {
            var currentFiles = [];
            var files = ImagePanelObject.files;
            for (var i = 0; i < files.length; i++) {
                var fileId = files[i].fileId;

                if (fileId != undefined && fileId != null) {
                    currentFiles.push(files[i]);
                }
            }
            return currentFiles;
        };

        ImagePanelObject.getPanelFiles = function () {
            return ImagePanelObject.files;
        };

        ImagePanelObject.getFile = function (fileId) {
            var fileIndex = ImagePanelObject.fileIds[fileId];

            if (fileIndex == undefined || fileIndex == null) {
                return {};
            }

            return ImagePanelObject.files[fileIndex];
        };


        ImagePanelObject.revert = function () {
            ImagePanelObject.fileNum = 0;
            ImagePanelObject.fileIds = {};
            //ImagePanelObject.files = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
            ImagePanelObject.files = [];

            currentFileIndex = 0;

            ImagePanelObject.panelImageHeight = 0;
        };

        ImagePanelObject.pushFileInfo = function (fileInfo) {
            if (ImagePanelObject.files.length >= 9) {
                return;
            }
            var fileId = ImagePanelObject.fileIds[fileInfo.fileId];

            if (fileId == undefined || fileId == null) {
                ImagePanelObject.files[currentFileIndex] = fileInfo;

                ImagePanelObject.fileIds[fileInfo.fileId] = currentFileIndex;

                //
                ImagePanelObject.files[currentFileIndex].error = false;

                currentFileIndex++;
            } else {
                var fileIdIndex = ImagePanelObject.fileIds[fileInfo.fileId];

                ImagePanelObject.files[fileIdIndex] = fileInfo;
                ImagePanelObject.files[fileIdIndex].error = false;
            }


        };
        //
        ImagePanelObject.handleUploadError = function (uploadErrorFile) {
            for (var i = 0; i < ImagePanelObject.files.length; i++) {
                if (ImagePanelObject.files[i].fileId == uploadErrorFile.id) {
                    ImagePanelObject.files[i].error = true;
                }

            }
        };

        //
        ImagePanelObject.deleteFile = function (fileIndex) {

            delete ImagePanelObject.fileIds[ImagePanelObject.files[fileIndex].fileId];
            ImagePanelObject.files.splice(fileIndex, 1);
            ImagePanelObject.panelImageHeight = 0;

            if (ImagePanelObject.files.length != 0) {
                for (var i = 0; i < ImagePanelObject.files.length; i++) {
                    // DraftEditorService.sectionIsValid(ImagePanelObject.files[i], ImagePanelObject.files.length);
                    this.checkImageIsQualify(ImagePanelObject.files[i], ImagePanelObject.files.length);
                }
            } else {
                this.checkImageIsQualify(null, 0);
            }


            currentFileIndex = ImagePanelObject.files.length;
        };

        //
        ImagePanelObject.checkImageIsQualify = function (fileInfo, fileLength) {
            var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                currentSection = editorService.getDraft().node.sections[currentSectionIndex];

            if (currentSection == undefined || currentSection.audios[0] == undefined && currentSection.audios[0] == null) {
                return;
            }

            var sectionAudioDuration = currentSection.audios[0].duration;
            var screenHeightConstant = EditorConstants.SECTION_WIDTH.DEFAULT * 16 / 9;
            var sectionScreenHeight = editorFunctions.getSectionScreenPixel(sectionAudioDuration) + (currentSection.components.length + fileLength) * 44 + 40;
            var sectionHeight = document.getElementById("editorSection" + currentSectionIndex + "").offsetHeight + 40;
            var element = document.getElementById("threshold");

            //
            if (fileInfo == null) {
                ImagePanelObject.panelImageHeight = 0;
            } else {
                var componentData = {}, rate, imageHeight;
                var imageRate = fileInfo.width / fileInfo.height;
                //
                if (imageRate > (3 / 4) || imageRate == (3 / 4)) {
                    componentData.type = Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH;
                } else {
                    componentData.type = Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN;
                }
                //
                if (componentData.type == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN) {
                    imageHeight = parseInt(EditorConstants.SECTION_WIDTH.DEFAULT * 16 / 9) + 46;
                } else if (componentData.type == Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH) {
                    rate = EditorConstants.SECTION_WIDTH.DEFAULT / fileInfo.width;
                    imageHeight = parseInt(fileInfo.height * rate) + 46;
                }
                //
                ImagePanelObject.panelImageHeight = ImagePanelObject.panelImageHeight + imageHeight;
            }

            //
            if (element) {
                //
                var param = {
                    'standardHeight': sectionScreenHeight,
                    'deviationHeight': parseInt(screenHeightConstant / 2),
                    'realityHeight': parseInt(sectionHeight) + ImagePanelObject.panelImageHeight,
                    'executeFn': {
                        'less': function () {
                            var percent = param.realityHeight / param.standardHeight * 100;

                            element.style.cssText = "height:" + percent + "%;background-color: rgba(247,76,49,.3);border: 2px dashed rgb(247,76,49)";
                            ImagePanelObject.sectionComponentWarnText = "过少,可以适当增加（建议仅供参考）";
                        },
                        'normal': function () {
                            var percent = param.realityHeight / param.standardHeight * 100;

                            element.style.cssText = "height:" + percent + "%;background-color: rgba(37,216,239,.3);border: 2px dashed rgb(37,216,239);max-height:466px";
                            ImagePanelObject.sectionComponentWarnText = "合适";
                        },
                        'over': function () {
                            var percent = param.realityHeight / param.standardHeight * 100;

                            element.style.cssText = "height:" + percent + "%;background-color: rgba(247,76,49,.3);border: 2px dashed rgb(247,76,49);max-height:550px";
                            ImagePanelObject.sectionComponentWarnText = "过多,可以适当删减（建议仅供参考）";
                        }
                    }
                };

                if (param.realityHeight < (param.standardHeight - param.deviationHeight)) {
                    param.executeFn.less();
                } else if ((param.standardHeight - param.deviationHeight) <= param.realityHeight && param.realityHeight <= (param.standardHeight + param.deviationHeight)) {
                    param.executeFn.normal();
                } else if (param.realityHeight > (param.standardHeight + param.deviationHeight)) {
                    param.executeFn.over();
                }
            }

        };

        //
        ImagePanelObject.moveFileFontInsert = function (srcIndex, targetIndex) {

            if (srcIndex >= 0 && targetIndex >= 0 && srcIndex < ImagePanelObject.files.length && targetIndex < ImagePanelObject.files.length) {

                var file;
                //
                if (srcIndex > targetIndex) {
                    for (var i = targetIndex; i < srcIndex; i++) {
                        file = ImagePanelObject.files[i];
                        ImagePanelObject.fileIds[file.fileId]++;
                    }
                    ImagePanelObject.fileIds[ImagePanelObject.files[srcIndex].fileId] = targetIndex;
                } else if (srcIndex < targetIndex) {
                    for (var j = srcIndex + 1; j < targetIndex; j++) {
                        file = ImagePanelObject.files[j];
                        ImagePanelObject.fileIds[file.fileId]--;
                    }
                    ImagePanelObject.fileIds[ImagePanelObject.files[srcIndex].fileId] = targetIndex - 1;
                }

                var srcFile = ImagePanelObject.files[srcIndex];
                ImagePanelObject.files.splice(srcIndex, 1);
                ImagePanelObject.files.splice(targetIndex, 0, srcFile);
            }
        };

        return ImagePanelObject;
    }]);

    //
    editorModule.factory("AudioPanelObject", ["editorService", "EditorConstants", function (editorService, EditorConstants) {
        var AudioPanelObject = {};

        AudioPanelObject.isReplaceAudio = false;
        //
        AudioPanelObject.setIsReplaceAudio = function (isReplaceAudio) {
            AudioPanelObject.isReplaceAudio = isReplaceAudio
        };
        //
        AudioPanelObject.getIsReplaceAudio = function () {
            return AudioPanelObject.isReplaceAudio;
        };

        //
        AudioPanelObject.audioProcess = {
            NONE: "none",
            SELECT_AUDIO: "select.audio",
            RECORDING: "recording",
            EDIT_AUDIO: "edit.audio"
        };
        AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.NONE;

        //秒
        AudioPanelObject.audioDurationAlert = {
            SECTION: {
                TOO_LOW_POINT: 1,
                WARNING_POINT: 12,
                ILLEGAL_POINT: 15
            },
            ACTION: {
                TOO_LOW_POINT: 1,
                WARNING_POINT: 12,
                ILLEGAL_POINT: 15
            }
        };

        //
        AudioPanelObject.getAudioDurationAlert = {
            getTooLowPoint: function () {

                if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO) {
                    return AudioPanelObject.audioDurationAlert.SECTION.TOO_LOW_POINT;

                } else {
                    return AudioPanelObject.audioDurationAlert.ACTION.TOO_LOW_POINT;
                }
            },
            getWarningPoint: function () {

                if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO) {
                    return AudioPanelObject.audioDurationAlert.SECTION.WARNING_POINT;

                } else {
                    return AudioPanelObject.audioDurationAlert.ACTION.WARNING_POINT;
                }
            },
            getIllegalPoint: function () {
                if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO) {
                    return AudioPanelObject.audioDurationAlert.SECTION.ILLEGAL_POINT;

                } else {
                    return AudioPanelObject.audioDurationAlert.ACTION.ILLEGAL_POINT;

                }
            }
        };

        return AudioPanelObject;
    }]);
    //
    editorModule.service("uploadPanelObject", [function () {

        var uploadPanelObjectFiles = [];
        var uploadPanelObjectSuccess = [];
        var uploadPanelObjectError = [];
        //
        this.getFiles = function () {
            return uploadPanelObjectFiles;
        };
        this.getSuccessFiles = function () {
            return uploadPanelObjectSuccess;
        };
        this.getErrorFiles = function () {
            return uploadPanelObjectError;
        };
        //
        this.pushFile = function (data) {
            uploadPanelObjectFiles.push(data);
        };
        this.pushSuccessFile = function (data) {
            uploadPanelObjectSuccess.push(data);
        };
        this.pushErrorFile = function (data) {
            uploadPanelObjectError.push(data);
        };
        //
        this.reset = function () {
            uploadPanelObjectSuccess = [];
            uploadPanelObjectError = [];
            uploadPanelObjectFiles = [];
        }
    }]);

    //
    editorModule.service(
        "uploadService",
        ["editorParam",
            function (editorParam) {
                //
                this.bindImageFileUploader = function (configObj, callbackFunObject) {
                    //
                    if (configObj != undefined) {
                        configObj.isEditor = true;
                    }

                    //
                    if (editorParam.imageUploadSetting) {

                        var imageFileUploader = FileUploader.createUploadImage(configObj, editorParam.imageUploadSetting);

                        //
                        imageFileUploader.setCallbackFunction(
                            {
                                start: function () {
                                    if (callbackFunObject && callbackFunObject.start) {
                                        callbackFunObject.start();
                                    }
                                },
                                finished: function () {
                                    //
                                    if (callbackFunObject && callbackFunObject.finished) {
                                        callbackFunObject.finished();
                                    }
                                },
                                fileQueuedBefore: function (files) {
                                    //控制上传图片文件
                                    imageFileUploader.setFileNumLimit(9);
                                    if (callbackFunObject && callbackFunObject.fileQueuedBefore) {
                                        callbackFunObject.fileQueuedBefore(imageFileUploader, files);
                                    }
                                },
                                fileQueued: function (queuedFilesInfo) {

                                    if (callbackFunObject && callbackFunObject.fileQueued) {
                                        callbackFunObject.fileQueued(queuedFilesInfo);
                                    }
                                },
                                thumb: function (themFilesInfo) {
                                    if (callbackFunObject && callbackFunObject.thumb) {
                                        callbackFunObject.thumb(themFilesInfo);
                                    }
                                },
                                success: function (uploadedFileInfo) {
                                    if (callbackFunObject && callbackFunObject.success) {
                                        callbackFunObject.success(uploadedFileInfo);
                                    }
                                },
                                progress: function (progressInfo) {
                                    if (callbackFunObject && callbackFunObject.progress) {
                                        callbackFunObject.progress(progressInfo);
                                    }
                                },
                                uploadError: function (file) {
                                    if (callbackFunObject && callbackFunObject.uploadError) {
                                        callbackFunObject.uploadError(file);
                                    }
                                },
                                error: function (message, file) {
                                    if (callbackFunObject && callbackFunObject.error) {
                                        callbackFunObject.error(message, file);
                                    }
                                }
                            }
                        );

                        //
                        imageFileUploader.load();
                    }
                };

                //
                this.bindMoPicFileUploader = function (configObj, callbackFunObject) {
                    if (configObj) {
                        configObj.isEditor = true;
                    }

                    //
                    if (editorParam.videoUploadSetting && editorParam.imageUploadSetting) {
                        var flowPhotoFileUploader = FileUploader.createUploadFlowPhoto(
                            configObj,
                            {
                                "video": editorParam.videoUploadSetting,
                                "image": editorParam.imageUploadSetting
                            }
                        );

                        flowPhotoFileUploader.setCallbackFunction(
                            {
                                start: function () {
                                    if (callbackFunObject && callbackFunObject.start) {
                                        callbackFunObject.start();
                                    }
                                },
                                finished: function () {
                                    //
                                    if (callbackFunObject && callbackFunObject.finished) {
                                        callbackFunObject.finished();
                                    }
                                },
                                fileQueuedBefore: function (files) {
                                    //
                                    if (callbackFunObject && callbackFunObject.fileQueuedBefore) {
                                        callbackFunObject.fileQueuedBefore(flowPhotoFileUploader, files);
                                    }
                                },
                                fileQueued: function (queuedFilesInfo) {

                                    if (callbackFunObject && callbackFunObject.fileQueued) {
                                        callbackFunObject.fileQueued(queuedFilesInfo);
                                    }
                                },
                                thumb: function (themFilesInfo) {
                                    if (callbackFunObject && callbackFunObject.thumb) {
                                        callbackFunObject.thumb(themFilesInfo);
                                    }
                                },
                                success: function (uploadedFileInfo) {
                                    if (callbackFunObject && callbackFunObject.success) {
                                        callbackFunObject.success(uploadedFileInfo);
                                    }
                                },
                                progress: function (progressInfo) {
                                    if (callbackFunObject && callbackFunObject.progress) {
                                        callbackFunObject.progress(progressInfo);
                                    }
                                },
                                uploadError: function (file) {
                                    if (callbackFunObject && callbackFunObject.uploadError) {
                                        callbackFunObject.uploadError(file);
                                    }
                                },
                                error: function (message, file) {
                                    if (callbackFunObject && callbackFunObject.error) {
                                        callbackFunObject.error(message, file);
                                    }
                                }
                            }
                        );

                        flowPhotoFileUploader.load();
                    }
                };

                //
                this.bindCoverImageFileUploader = function (configObj, callbackFunObject) {
                    var thatThis = this;

                    //
                    if (configObj) {
                        configObj.isEditor = true;
                    }

                    //
                    if (editorParam.coverImageUploadSetting) {
                        var imageFileUploader = FileUploader.createUploadImage(configObj, editorParam.coverImageUploadSetting);
                        imageFileUploader.setCallbackFunction(
                            {
                                start: function () {
                                    if (callbackFunObject && callbackFunObject.start) {
                                        callbackFunObject.start();
                                    }
                                },
                                finished: function () {
                                    //
                                    if (callbackFunObject && callbackFunObject.finished) {
                                        callbackFunObject.finished();
                                    }
                                },
                                fileQueuedBefore: function () {
                                    //
                                    if (callbackFunObject && callbackFunObject.fileQueuedBefore) {
                                        callbackFunObject.fileQueuedBefore();
                                    }
                                },
                                fileQueued: function (queuedFilesInfo) {

                                    if (callbackFunObject && callbackFunObject.fileQueued) {
                                        callbackFunObject.fileQueued(queuedFilesInfo);
                                    }
                                },
                                thumb: function (themFilesInfo) {
                                    if (callbackFunObject && callbackFunObject.thumb) {
                                        callbackFunObject.thumb(themFilesInfo);
                                    }
                                },
                                success: function (uploadedFileInfo) {
                                    if (callbackFunObject && callbackFunObject.success) {
                                        callbackFunObject.success(uploadedFileInfo);
                                    }
                                },
                                progress: function (progressInfo) {
                                    if (callbackFunObject && callbackFunObject.progress) {
                                        callbackFunObject.progress(progressInfo);
                                    }
                                },
                                uploadError: function (file) {
                                    if (callbackFunObject && callbackFunObject.uploadError) {
                                        callbackFunObject.uploadError(file);
                                    }
                                },
                                error: function (message, file) {
                                    if (callbackFunObject && callbackFunObject.error) {
                                        callbackFunObject.error(message, file);
                                    }
                                }
                            }
                        );

                        imageFileUploader.load();
                    }
                };

                //
                this.bindVideoFileUploader = function (configObj, callbackFunObject) {
                    var thatThis = this;

                    //
                    if (configObj) {
                        configObj.isEditor = true;
                    }

                    //
                    if (editorParam.videoUploadSetting) {
                        var videoFileUploader = FileUploader.createUploadVideo(configObj, editorParam.videoUploadSetting);
                        videoFileUploader.setCallbackFunction({
                            start: function () {
                                if (callbackFunObject && callbackFunObject.start) {
                                    callbackFunObject.start();
                                }
                            }, finished: function () {
                                //
                                if (callbackFunObject && callbackFunObject.finished) {
                                    callbackFunObject.finished();
                                }
                            }, fileQueuedBefore: function (files) {
                                //
                                if (callbackFunObject && callbackFunObject.fileQueuedBefore) {
                                    callbackFunObject.fileQueuedBefore(videoFileUploader, files);
                                }
                            }, fileQueued: function (queuedFilesInfo) {

                                if (callbackFunObject && callbackFunObject.fileQueued) {
                                    callbackFunObject.fileQueued(queuedFilesInfo);
                                }
                            }, thumb: function (themFilesInfo) {
                                if (callbackFunObject && callbackFunObject.thumb) {
                                    callbackFunObject.thumb(themFilesInfo);
                                }
                            }, success: function (uploadedFileInfo) {
                                if (callbackFunObject && callbackFunObject.success) {
                                    callbackFunObject.success(uploadedFileInfo);
                                }
                            }, progress: function (progressInfo) {
                                if (callbackFunObject && callbackFunObject.progress) {
                                    callbackFunObject.progress(progressInfo);
                                }
                            },
                            uploadError: function (file) {
                                if (callbackFunObject && callbackFunObject.uploadError) {
                                    callbackFunObject.uploadError(file);
                                }
                            },
                            error: function (message, file) {
                                if (callbackFunObject && callbackFunObject.error) {
                                    callbackFunObject.error(message, file);
                                }
                            }
                        });

                        videoFileUploader.load();
                    }
                };

                //audio
                this.bindAudioFileUploader = function (configObj, callbackFunObject, uploadSetting) {
                    var thatThis = this;

                    //
                    if (configObj) {
                        configObj.isEditor = true;
                    }

                    if (editorParam.audioUploadSetting) {
                        var audioFileUploader = FileUploader.createUploadAudio(configObj, uploadSetting);
                        audioFileUploader.setCallbackFunction({
                            start: function () {
                                if (callbackFunObject && callbackFunObject.start) {
                                    callbackFunObject.start();
                                }
                            }, finished: function () {
                                //
                                if (callbackFunObject && callbackFunObject.finished) {
                                    callbackFunObject.finished();
                                }
                            }, fileQueuedBefore: function (files) {
                                //
                                if (callbackFunObject && callbackFunObject.fileQueuedBefore) {
                                    callbackFunObject.fileQueuedBefore(files, audioFileUploader);
                                }
                            }, fileQueued: function (queuedFilesInfo) {

                                if (callbackFunObject && callbackFunObject.fileQueued) {
                                    callbackFunObject.fileQueued(queuedFilesInfo);
                                }
                            }, thumb: function (themFilesInfo) {
                                if (callbackFunObject && callbackFunObject.thumb) {
                                    callbackFunObject.thumb(themFilesInfo);
                                }
                            }, success: function (uploadedFileInfo) {
                                if (callbackFunObject && callbackFunObject.success) {
                                    callbackFunObject.success(uploadedFileInfo);
                                }
                            }, progress: function (progressInfo) {
                                if (callbackFunObject && callbackFunObject.progress) {
                                    callbackFunObject.progress(progressInfo);
                                }
                            },
                            uploadError: function (file) {
                                if (callbackFunObject && callbackFunObject.uploadError) {
                                    callbackFunObject.uploadError(file);
                                }
                            },
                            error: function (message, file) {
                                if (callbackFunObject && callbackFunObject.error) {
                                    callbackFunObject.error(message, file);
                                }
                            }
                        });
                        audioFileUploader.load();
                    }
                };

                //
                //
                this.uploadAudioBlob = function (oblob, configObj, callbackFunObject) {
                    var thatThis = this;
                    //
                    if (configObj) {
                        configObj.isEditor = true;
                    } else {
                        configObj = {};
                    }

                    if (editorParam.audioUploadSetting) {
                        var blobFileUploader = FileUploader.createUploadBlob(oblob, configObj, editorParam.audioUploadSetting);
                        blobFileUploader.setCallbackFunction({
                            start: function () {
                                if (callbackFunObject && callbackFunObject.start) {
                                    callbackFunObject.start();
                                }
                            }, finished: function () {
                                //
                                if (callbackFunObject && callbackFunObject.finished) {
                                    callbackFunObject.finished();
                                }
                            }, fileQueuedBefore: function () {
                                //
                                if (callbackFunObject && callbackFunObject.fileQueuedBefore) {
                                    callbackFunObject.fileQueuedBefore();
                                }
                            }, fileQueued: function (queuedFilesInfo) {

                                if (callbackFunObject && callbackFunObject.fileQueued) {
                                    callbackFunObject.fileQueued(queuedFilesInfo);
                                }
                            }, thumb: function (themFilesInfo) {
                                if (callbackFunObject && callbackFunObject.thumb) {
                                    callbackFunObject.thumb(themFilesInfo);
                                }
                            }, success: function (uploadedFileInfo) {
                                if (callbackFunObject && callbackFunObject.success) {
                                    callbackFunObject.success(uploadedFileInfo);
                                }
                            }, progress: function (progressInfo) {
                                if (callbackFunObject && callbackFunObject.progress) {
                                    callbackFunObject.progress(progressInfo);
                                }
                            }, uploadError: function (file) {
                                if (callbackFunObject && callbackFunObject.uploadError) {
                                    callbackFunObject.uploadError(file);
                                }
                            },
                            error: function (data) {
                                if (callbackFunObject && callbackFunObject.error) {
                                    callbackFunObject.error(data);
                                }
                            }
                        });
                        blobFileUploader.load();
                    }
                };
            }
        ]
    );
}