if (editorModule) {
    ////////////////////////////
    //各种弹出窗口模块
    ////////////////////////////
    editorModule.controller(
        "audioRecordCropController",
        [
            "$scope", "$sce", "$http", "editorService", "audioRecordService", "audioCropService", "EditorConstants", "uploadService", "AudioPanelObject", "connectService", "editorParam", "editorFunctions", "publicFunctions", "publicPopup", "dragBarService",
            function ($scope, $sce, $http, editorService, audioRecordService, audioCropService, EditorConstants, uploadService, AudioPanelObject, connectService, editorParam, editorFunctions, publicFunctions, publicPopup, dragBarService) {
                $scope.viewImageUrlAndFilePrefix = null;
                $scope.viewAudioUrlAndFilePrefix = null;
                $scope.viewLibraryUrlPrefix = editorParam.libraryBucketOriginalUrlPrefix;
                $scope.viewDefaultUrlPrefix = editorParam.defaultBucketOriginalUrlPrefix;
                //
                $scope.sce = $sce.trustAsResourceUrl;

                //用来控制模块是否显示。
                $scope.showAudioRecordAndCrop = false;

                //
                $scope.editor = editorService.getDraft();

                //
                $scope.audio = new Moboo.DraftNodeOfAssetAudio({});
                $scope.audioPlaying = false;

                //record user
                $scope.audioRecordProgress = 0.0.toFixed(1);
                $scope.recordNormal = false;
                $scope.recordWarning = false;

                //show state
                $scope.showSelectAudio = function () {
                    return AudioPanelObject.currentAudioProcess == AudioPanelObject.audioProcess.SELECT_AUDIO;
                };
                $scope.showRecording = function () {
                    return AudioPanelObject.currentAudioProcess == AudioPanelObject.audioProcess.RECORDING;
                };
                $scope.showEditAudio = function () {
                    return AudioPanelObject.currentAudioProcess == AudioPanelObject.audioProcess.EDIT_AUDIO;
                };
                $scope.showOperateAudio = function () {
                    return editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_ACTION;
                };
                $scope.showSkipAudioBtn = function () {
                    return editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION;
                };
                //
                $scope.closeSelectAudio = function () {
                    //
                    $scope.showAudioRecordAndCrop = false;
                    dragBarService.destroy();
                };

                //show limit time
                $scope.limitTime = function () {
                    return "开始录音，请勿超过" + AudioPanelObject.getAudioDurationAlert.getIllegalPoint() + "s"
                };
                //
                $scope.getTooLowPoint = function () {
                    return AudioPanelObject.getAudioDurationAlert.getTooLowPoint();
                };

                //
                $scope.skipAudio = function () {
                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION) {
                        var currentSectionIndex = editorService.getEditor().currentSectionIdx;

                        //
                        var section = new Moboo.DraftNodeOfSectionContent({});
                        section.uniqueId = editorFunctions.generateUniqueId();

                        editorService.addSection(currentSectionIndex, section);
                    }
                    //
                    $scope.showAudioRecordAndCrop = false;
                    dragBarService.destroy();
                };
                /////////////////
                // set record listener
                $scope.frequency = null;
                audioRecordService.setOnProgressListener(function (time, frequency) {
                    $scope.audioRecordProgress = time.toFixed(1);
                    //
                    if ($scope.audioRecordProgress <= AudioPanelObject.getAudioDurationAlert.getWarningPoint()) {

                        $scope.recordNormal = true;
                    } else if ($scope.audioRecordProgress < AudioPanelObject.getAudioDurationAlert.getIllegalPoint()) {

                        $scope.recordNormal = false;
                        $scope.recordWarning = true;
                    } else {
                        $scope.recordNormal = false;
                        $scope.recordWarning = false;
                    }

                    //
                    if (frequency < 0.002) {

                        $scope.frequency = 'first';
                    } else if (0.002 <= frequency && frequency < 0.004) {

                        $scope.frequency = 'second';
                    } else if (0.004 <= frequency && frequency < 0.006) {

                        $scope.frequency = 'third';
                    } else if (0.006 <= frequency && frequency < 0.1) {

                        $scope.frequency = 'four';
                    } else if (frequency >= 0.1) {

                        $scope.frequency = 'five';
                    }

                    $scope.$apply();
                });
                //
                audioRecordService.setOnRecordingListener(
                    function (status) {
                        if (status == 'start') {
                            AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.RECORDING;
                            $scope.recordWarning = false;
                        } else if (status == 'stop') {
                            AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.EDIT_AUDIO;
                            //
                            $scope.uploadAudioResourceByBlob();
                        }
                    }
                );
                //
                audioRecordService.setOnErrorListener(function (errorMessage) {
                    if (errorMessage) {
                        publicPopup.alert(errorMessage);
                    }
                });

                //开始录音
                $scope.startRecord = function () {
                    audioRecordService.setMaxDuration(AudioPanelObject.getAudioDurationAlert.getIllegalPoint());
                    audioRecordService.start();
                };

                //取消录音
                $scope.cancelAudio = function () {
                    //
                    audioRecordService.cancel();
                    AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.SELECT_AUDIO;
                };

                //完成录音
                $scope.finishRecord = function () {
                    if ($scope.audioRecordProgress < AudioPanelObject.getAudioDurationAlert.getTooLowPoint()) {
                        audioRecordService.cancel();

                        publicPopup.alert("录音过短,请重新录音", function () {

                            AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.SELECT_AUDIO;
                            //
                            $scope.$apply();
                        });
                    } else {
                        //
                        AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.EDIT_AUDIO;
                        //
                        audioRecordService.stop();
                        //audioRecordService.release();
                    }
                    //
                    $scope.audioRecordProgress = 0.0.toFixed(1);
                };

                /////////////////
                // set crop audio listener
                audioCropService.setCropContainer(document.getElementById('audioCropContainer'));
                audioCropService.setOnLoadedListener(function () {

                    $scope.audioPlaying = true;
                    //
                    $scope.$apply();
                });
                //
                $scope.playAudio = function () {
                    if (!audioCropService.audioLoaded) {
                        return;
                    }

                    if (audioCropService && !$scope.audioPlaying) {
                        audioCropService.playAudio();
                        if (audioCropService.audioLoaded && !$scope.audioPlaying) {
                            $scope.audioPlaying = true;
                        }
                    }
                };

                //
                $scope.stopAudio = function () {
                    if (!audioCropService.audioLoaded) {
                        return;
                    }

                    if (audioCropService) {
                        audioCropService.stopAudio();
                        if (audioCropService.audioLoaded && $scope.audioPlaying) {
                            $scope.audioPlaying = false;
                        }
                    }
                };

                //
                $scope.isPlay = function () {

                    return $scope.audioPlaying;
                };
                //
                $scope.saveAudio = function () {
                    if (!audioCropService.audioLoaded) {
                        return;
                    }
                    //
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;
                    //
                    var audioResult = audioCropService.getCropResult();
                    if (audioResult && audioResult.length.toFixed(1) < AudioPanelObject.getAudioDurationAlert.getTooLowPoint()) {
                        publicPopup.alert("音频剪切过短！");
                        return;
                    }
                    //
                    editorService.getEditor().loadingStatus = true;
                    if ($scope.audio.originalUniqueId.substr($scope.audio.originalUniqueId.lastIndexOf(".") + 1) != "ogg" && $scope.audio.originalUniqueId.substr($scope.audio.originalUniqueId.lastIndexOf(".") + 1) != "wav" && (!audioResult || audioResult.length >= $scope.audio.originalDuration)) {
                        var audioData = {
                            uniqueId: $scope.audio.originalUniqueId,
                            providerCode: $scope.audio.providerCode,
                            bucketCode: $scope.audio.bucketCode,
                            duration: $scope.audio.duration,
                            volume: $scope.audio.volume,
                            originalUniqueId: $scope.audio.originalUniqueId,
                            originalProviderCode: $scope.audio.originalProviderCode,
                            originalBucketCode: $scope.audio.originalBucketCode,
                            originalDuration: $scope.audio.originalDuration,
                            editParam: {
                                cropStartTime: 0
                            }
                        };

                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION) {
                            var section = new Moboo.DraftNodeOfSectionContent({});
                            section.uniqueId = editorFunctions.generateUniqueId();

                            var audioNode = new Moboo.DraftNodeOfAssetAudio(audioData);
                            section.audios.push(audioNode);

                            editorService.addSection(currentSectionIndex, section);
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO) {
                            editorService.addAudioToSection(currentSectionIndex, new Moboo.DraftNodeOfAssetAudio(audioData));
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO) {
                            editorService.modifySectionAudio(currentSectionIndex, audioData);
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_ACTION) {
                            //
                            editorService.modifyAction(currentSectionIndex, currentComponentIndex, 0, {audio: audioData});
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_ACTION_PLAY_AUDIO) {
                            //
                            var playAudio = new Moboo.DraftNodeOfActionPlayAudio({audio: audioData});

                            editorService.addAction(currentSectionIndex, currentComponentIndex, playAudio);
                        }

                        //
                        $scope.resetEditAudio();
                        editorService.getEditor().loadingStatus = false;
                    } else {
                        //
                        var uniqueId = editorFunctions.generateUniqueId();
                        var audioId = uniqueId + ".mp3";
                        $scope.draft = editorService.getDraft();
                        //
                        var cropAudioData = {
                            "mediaTypeCode": "audio",
                            "providerCode": "qiniu",
                            "bucketCode": $scope.audio.bucketCode,
                            "originalFileId": $scope.draft.fileNamePrefix.fileId + $scope.audio.originalUniqueId,
                            "fileIdPrefix": $scope.draft.fileNamePrefix.fileId + uniqueId,
                            "startTime": audioResult.start,
                            "endTime": audioResult.start + audioResult.length,
                            "transformFormats": ["mp3"]
                        };

                        //crop
                        var audioData = {
                            uniqueId: audioId,
                            providerCode: $scope.audio.providerCode,
                            bucketCode: $scope.audio.bucketCode,
                            duration: audioResult.length,
                            volume: $scope.audio.volume,
                            originalUniqueId: $scope.audio.originalUniqueId,
                            originalProviderCode: $scope.audio.originalProviderCode,
                            originalBucketCode: $scope.audio.originalBucketCode,
                            originalDuration: $scope.audio.originalDuration,
                            editParam: {
                                cropStartTime: audioResult.start
                            }
                        };
                        connectService.cropResource(cropAudioData).then(
                            function (data) {
                                connectService.getPretreatmentFopStatus(data.persistId).then(function (dataP) {
                                    if (dataP) {

                                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION) {
                                            var section = new Moboo.DraftNodeOfSectionContent({});
                                            section.uniqueId = editorFunctions.generateUniqueId();
                                            var audioNode = new Moboo.DraftNodeOfAssetAudio(audioData);

                                            //
                                            section.audios.push(audioNode);
                                            editorService.addSection(currentSectionIndex, section);
                                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO) {
                                            editorService.addAudioToSection(currentSectionIndex, new Moboo.DraftNodeOfAssetAudio(audioData));
                                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO) {

                                            editorService.modifySectionAudio(currentSectionIndex, audioData);
                                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_ACTION) {
                                            //
                                            editorService.modifyAction(currentSectionIndex, currentComponentIndex, 0, {audio: audioData});
                                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_ACTION_PLAY_AUDIO) {
                                            //
                                            var playAudio = new Moboo.DraftNodeOfActionPlayAudio({audio: audioData});

                                            editorService.addAction(currentSectionIndex, currentComponentIndex, playAudio);
                                        }
                                        //
                                        editorService.getEditor().loadingStatus = false;

                                        $scope.resetEditAudio();
                                    } else {
                                        editorService.getEditor().loadingStatus = false;
                                        publicPopup.alert("截取音频失败！");
                                        console.log("截取音频失败" + JSON.stringify(data));
                                    }
                                }, function (error) {
                                    editorService.getEditor().loadingStatus = false;
                                });
                                //
                                //editorService.getEditor().loadingStatus = false;
                            }, function (data) {
                                publicPopup.ajaxExceptionProcess(data);
                                editorService.getEditor().loadingStatus = false;
                            }, function (error) {
                                publicPopup.ajaxExceptionProcess(error);
                                editorService.getEditor().loadingStatus = false;
                            }
                        )
                    }
                    //
                    $scope.stopAudio();
                    if ($scope.bgMusicPlay) {
                        $scope.stopBgMusic();
                    }
                };
                //
                $scope.replaceAudio = function () {
                    if (!audioCropService.audioLoaded) {
                        return;
                    }

                    AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.SELECT_AUDIO;
                    AudioPanelObject.setIsReplaceAudio(true);

                    if ($scope.bgMusicPlay) {
                        $scope.stopBgMusic();
                    }
                    //
                    if (audioCropService && audioCropService.audioLoaded) {
                        audioCropService.releaseAudio();
                    }

                };

                //
                $scope.audioInPlaying = true;
                $scope.bgMusicInPlaying = true;

                $scope.deleteAudio = function () {
                    if (!audioCropService.audioLoaded) {
                        return;
                    }
                    //
                    if (audioCropService && audioCropService.audioInPlaying) {
                        audioCropService.stopAudio();
                        $scope.audioInPlaying = false;
                    }

                    if ($scope.bgMusicPlay) {
                        $scope.stopBgMusic();
                        $scope.bgMusicPlay = false;
                        $scope.bgMusicInPlaying = false;
                    }

                    var sectionIndex = editorService.getEditor().currentSectionIdx,
                        componentIndex = editorService.getEditor().currentSectionComponentIdx;

                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO) {
                        //
                        publicPopup.confirm("确定要删除本次录制的声音吗？", function (data) {
                            if (data) {
                                if (!AudioPanelObject.getIsReplaceAudio()) {
                                    editorService.removeAudioFromSection(sectionIndex);
                                }
                                //
                                $scope.resetEditAudio();
                                $scope.$apply();
                            } else {
                                if (audioCropService && audioCropService.audioLoaded && !$scope.audioInPlaying) {
                                    audioCropService.playAudio();
                                    $scope.audioInPlaying = true;
                                }

                                if (!$scope.bgMusicPlay && !$scope.bgMusicInPlaying) {
                                    $scope.playBgMusic();
                                    $scope.bgMusicInPlaying = true;
                                }
                            }
                        });
                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_ACTION || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_ACTION_PLAY_AUDIO) {
                        //
                        publicPopup.confirm("确定要删除本次录制的声音吗？", function (data) {
                            if (data) {
                                if (!AudioPanelObject.getIsReplaceAudio()) {
                                    editorService.removeAction(sectionIndex, componentIndex, 0);
                                }
                                //
                                $scope.resetEditAudio();
                                $scope.$apply();
                            } else {
                                if (audioCropService && audioCropService.audioLoaded && !$scope.audioInPlaying) {
                                    audioCropService.playAudio();
                                    $scope.audioInPlaying = true;
                                }

                                if (!$scope.bgMusicPlay && !$scope.bgMusicInPlaying) {
                                    $scope.playBgMusic();
                                    $scope.bgMusicInPlaying = true;
                                }
                            }
                        });
                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION) {
                        publicPopup.confirm("确定要删除录音？<br/>将建立一个无录音的章节", function (data) {
                            if (data) {
                                //
                                var currentSectionIndex = editorService.getEditor().currentSectionIdx;
                                //
                                var section = new Moboo.DraftNodeOfSectionContent({});
                                section.uniqueId = editorFunctions.generateUniqueId();

                                editorService.addSection(currentSectionIndex, section);
                                //
                                $scope.resetEditAudio();

                                $scope.$apply();
                            } else {
                                if (audioCropService && audioCropService.audioLoaded && !$scope.audioInPlaying) {
                                    audioCropService.playAudio();
                                    $scope.audioInPlaying = true;
                                }

                                if (!$scope.bgMusicPlay && !$scope.bgMusicInPlaying) {
                                    $scope.playBgMusic();
                                    $scope.bgMusicInPlaying = true;
                                }
                            }
                        });
                    }
                };
                //
                $scope.uploadAudioResourceByBlob = function () {

                    editorService.getEditor().loadingStatus = true;
                    //
                    audioRecordService.getWavData(function (blob) {

                        uploadService.uploadAudioBlob(blob, {},
                            {
                                start: function () {
                                    editorService.getEditor().loadingStatus = true;
                                },
                                finished: function () {
                                    $scope.$apply();
                                },
                                fileQueued: function () {
                                    $scope.$apply();
                                },
                                success: function (successFileInfo) {
                                    var audioData = {
                                        uniqueId: successFileInfo.uniqueId,
                                        providerCode: "qiniu",
                                        bucketCode: "creative",
                                        name: successFileInfo.fileName,
                                        duration: successFileInfo.duration,
                                        fileSize: successFileInfo.fileSize,
                                        originalUniqueId: successFileInfo.uniqueId,
                                        originalProviderCode: "qiniu",
                                        originalBucketCode: successFileInfo.bucketCode,
                                        originalDuration: successFileInfo.duration
                                    };

                                    $scope.audio.parse(audioData);
                                    //
                                    AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.EDIT_AUDIO;
                                    editorService.getEditor().loadingStatus = false;
                                    //

                                    dragBarService.setCurrentPos($scope.audio.volume);

                                    //load audio
                                    if ($scope.viewAudioUrlAndFilePrefix) {

                                        audioCropService.loadAudio($scope.viewAudioUrlAndFilePrefix + ($scope.audio.originalUniqueId ? $scope.audio.originalUniqueId : $scope.audio.uniqueId), {
                                            startSecs: 0,
                                            lengthSecs: AudioPanelObject.getAudioDurationAlert.getIllegalPoint(),
                                            volume: $scope.audio.volume,
                                            cropMinSecs: AudioPanelObject.getAudioDurationAlert.getTooLowPoint(),
                                            cropMaxSecs: AudioPanelObject.getAudioDurationAlert.getIllegalPoint()
                                        });
                                    }

                                    $scope.$apply();
                                },
                                error: function (data) {
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.SELECT_AUDIO;

                                    publicPopup.ajaxExceptionProcess(data);

                                    $scope.$apply();
                                }
                            }
                        );
                    });
                };

                //
                $scope.bindAudioFileUploader = function () {
                    uploadService.bindAudioFileUploader(
                        {
                            "pickId": ".editor-upload-audio-btn",
                            "multiple": false,
                            "fileSingleSizeLimit": 5 * 1024 * 1024
                        },
                        {
                            start: function () {
                            },
                            finished: function () {
                                $scope.$apply();
                            },
                            fileQueuedBefore: function (files) {
                                editorService.getEditor().loadingStatus = true;
                                //
                                $scope.$apply();
                            },
                            fileQueued: function () {
                                //
                                $scope.$apply();
                            },
                            success: function (successFileInfo) {
                                if (successFileInfo.duration < AudioPanelObject.getAudioDurationAlert.getTooLowPoint()) {
                                    publicPopup.alert("上传音频过短，请重新上传", function () {
                                        editorService.getEditor().loadingStatus = false;
                                        AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.SELECT_AUDIO;
                                        //
                                        $scope.$apply();
                                    });
                                } else {
                                    //
                                    var audioData = {
                                        uniqueId: successFileInfo.uniqueId,
                                        providerCode: "qiniu",
                                        bucketCode: "creative",
                                        name: successFileInfo.fileName,
                                        duration: successFileInfo.duration,
                                        fileSize: successFileInfo.fileSize,
                                        originalUniqueId: successFileInfo.uniqueId,
                                        originalProviderCode: "qiniu",
                                        originalBucketCode: successFileInfo.bucketCode,
                                        originalDuration: successFileInfo.duration
                                    };

                                    $scope.audio.parse(audioData);
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.EDIT_AUDIO;

                                    //
                                    dragBarService.setCurrentPos($scope.audio.volume);

                                    //
                                    if ($scope.viewAudioUrlAndFilePrefix) {
                                        audioCropService.loadAudio($scope.viewAudioUrlAndFilePrefix + ($scope.audio.originalUniqueId ? $scope.audio.originalUniqueId : $scope.audio.uniqueId), {
                                            startSecs: 0,
                                            lengthSecs: AudioPanelObject.getAudioDurationAlert.getIllegalPoint(),
                                            volume: $scope.audio.volume,
                                            cropMinSecs: AudioPanelObject.getAudioDurationAlert.getTooLowPoint(),
                                            cropMaxSecs: AudioPanelObject.getAudioDurationAlert.getIllegalPoint()
                                        });
                                    }
                                    //
                                    $scope.$apply();
                                }
                            },
                            progress: function () {
                                $scope.$apply();
                            },
                            uploadError: function (uploadErrorFile) {
                                //
                                publicPopup.alert("上传失败", function () {
                                    editorService.getEditor().loadingStatus = false;
                                    //
                                    $scope.$apply();
                                });
                            },
                            error: function (message, file) {
                                var fileName;

                                if (message == "文件过大") {
                                    message = "文件过大，最大可上传5Mb的音频文件";
                                } else if (message == "文件格式错误") {
                                    message = "文件格式错误<br/>仅支持mp3、wav、ogg、m4a";
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
                                //
                                publicPopup.alert(fileName + message, function () {

                                    editorService.getEditor().loadingStatus = false;
                                    //
                                    $scope.$apply();
                                });

                            }
                        }, editorParam.audioUploadSetting
                    );
                };
                //
                $scope.closeEditAudio = function () {

                    if (!audioCropService.audioLoaded) {
                        return;
                    }
                    //
                    if ($scope.bgMusicPlay) {
                        $scope.stopBgMusic();
                    }
                    //
                    $scope.resetEditAudio();
                };
                //
                $scope.resetEditAudio = function () {

                    $scope.audio.clear();
                    $scope.showAudioRecordAndCrop = false;
                    AudioPanelObject.setIsReplaceAudio(false);

                    //
                    if (audioCropService && audioCropService.audioLoaded) {
                        audioCropService.releaseAudio();
                    }
                    //
                    dragBarService.destroy();
                };
                //
                $scope.cancelEditAudio = function () {
                    if (!audioCropService.audioLoaded) {
                        return;
                    }

                    AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.SELECT_AUDIO;
                    if ($scope.bgMusicPlay) {
                        $scope.stopBgMusic();
                    }
                    //
                    if (audioCropService && audioCropService.audioLoaded) {
                        audioCropService.releaseAudio();
                    }
                };
                ///////
                $scope.buttonIsDisable = function () {
                    return audioCropService.audioLoaded;
                };
                //
                $scope.generateVolumeBar = function () {
                    //
                    dragBarService.load(document.getElementById("audioVolumeContainer"));
                    //
                    dragBarService.setCurrentPos($scope.audio.volume);

                    dragBarService.onMoveListener(function (volume) {
                        $scope.audio.volume = volume;
                        $scope.$apply();

                        if (audioCropService && audioCropService.audioLoaded) {
                            audioCropService.setAudioVolume($scope.audio.volume);
                        }
                    });
                };
                ///////////bgm
                var audio = new Audio();
                $scope.bgMusicPlayProcess = 0;
                //
                $scope.loadBgMusicUrl = function () {
                    var browser = editorFunctions.browserDetection();

                    if (browser !== EditorConstants.BROWSER.OPERA && audio && $scope.editor.node.bgMusics[0] && $scope.editor.node.bgMusics[0].audio) {
                        audio.src = $scope.viewLibraryUrlPrefix + $scope.editor.node.bgMusics[0].audio.uniqueId;
                    } else if (browser === EditorConstants.BROWSER.OPERA && audio && $scope.editor.node.bgMusics[0] && $scope.editor.node.bgMusics[0].audio) {

                        //todo
                    }
                };
                //
                $scope.playBgMusic = function () {
                    var audioDuration = editorService.getDraft().node.bgMusics[0].audio.duration;

                    if (audio) {
                        var playPromise = audio.play();

                        if (playPromise) {
                            playPromise.catch(function (e) {
                                //console.log(e);
                            });
                        }

                        audio.volume = editorService.getDraft().node.bgMusics[0].audio.volume;
                        if (audio && audioDuration !== null && audioDuration !== undefined && audioDuration !== '') {
                            audio.addEventListener("timeupdate", function () {

                                $scope.bgMusicPlayProcess = audio.currentTime / audioDuration * 100;

                                $scope.$apply();
                            });
                            //
                            audio.addEventListener("ended", function () {

                                $scope.bgMusicPlay = false;

                                $scope.$apply();
                            });
                        }
                        //
                        $scope.bgMusicPlay = true;
                    }
                };
                //
                $scope.stopBgMusic = function () {

                    if (audio) {
                        audio.pause();
                        $scope.bgMusicPlay = false;
                    }
                };
                //
                $scope.fixedPointPlay = function ($event) {
                    if ($scope.bgMusicPlay) {
                        var target = $event.srcElement || $event.target,
                            fixedWidth = $event.pageX - target.parentNode.getBoundingClientRect().left,
                            targetWidth = target.offsetWidth,
                            audioDuration = editorService.getDraft().node.bgMusics[0].audio.duration;
                        //
                        var playPromise = audio.play();

                        if (playPromise) {
                            playPromise.catch(function (e) {
                                //console.log(e);
                            });
                        }
                        audio.currentTime = fixedWidth / targetWidth * audioDuration;
                    }
                };
                //
                $scope.showBgMusicControlBtn = function () {

                    return $scope.bgMusicPlay;
                };
                //////////////
                //the event listener
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewImageUrlAndFilePrefix = editorParam.imageUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;

                        $scope.bindAudioFileUploader();
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.AUDIO_RECORD_CROP,
                    function (event, data) {
                        $scope.showAudioRecordAndCrop = true;
                        //
                        $scope.generateVolumeBar();
                        $scope.loadBgMusicUrl();
                        //
                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_ACTION_PLAY_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION) {
                            AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.SELECT_AUDIO;

                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO || editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_ACTION) {
                            if ($scope.viewAudioUrlAndFilePrefix) {
                                //
                                var currentSectionIndex = editorService.getEditor().currentSectionIdx;
                                var currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;

                                //
                                if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO) {
                                    $scope.audio.parse(editorService.getSection(currentSectionIndex).audios[0]);

                                } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_ACTION) {
                                    $scope.audio.parse(editorService.getSection(currentSectionIndex).components[currentComponentIndex].actions[0].audio);
                                }

                                //
                                dragBarService.setCurrentPos($scope.audio.volume);
                                //
                                audioCropService.loadAudio($scope.viewAudioUrlAndFilePrefix + ($scope.audio.originalUniqueId ? $scope.audio.originalUniqueId : $scope.audio.uniqueId), {
                                    startSecs: $scope.audio.editParam.cropStartTime,
                                    lengthSecs: $scope.audio.duration,
                                    volume: $scope.audio.volume,
                                    cropMinSecs: AudioPanelObject.getAudioDurationAlert.getTooLowPoint(),
                                    cropMaxSecs: AudioPanelObject.getAudioDurationAlert.getIllegalPoint()
                                });
                            }
                            AudioPanelObject.currentAudioProcess = AudioPanelObject.audioProcess.EDIT_AUDIO;
                        }
                    }
                );
            }
        ]
    );
    //图片上传module
    editorModule.controller(
        "imageUploadController",
        [
            "$scope", "$http", "editorService", "EditorConstants", "editorFunctions", "ImagePanelObject", "uploadPanelObject", "editorParam", "publicPopup",
            function ($scope, $http, editorService, EditorConstants, editorFunctions, ImagePanelObject, uploadPanelObject, editorParam, publicPopup) {
                //
                $scope.viewImageUrlAndFilePrefix = null;
                $scope.viewAudioUrlAndFilePrefix = null;
                //
                $scope.emptyPanelFiles = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
                //
                $scope.editor = editorService.getEditor();
                //用来控制模块是否显示。
                $scope.showImageUploadPanel = false;
                //
                $scope.uploadLoadingStatus = function () {
                    return ImagePanelObject.uploadLoading;
                };
                //
                $scope.showUploadImageBtn = function () {
                    return $scope.getUploadImageThumbnail().length < 9;
                };
                //
                $scope.getUploadImageThumbnail = function () {

                    return ImagePanelObject.getPanelFiles();
                };
                //
                $scope.getImageFileDataFromPanel = function () {
                    var uploadImageData = ImagePanelObject.getFiles();
                    //
                    ImagePanelObject.revert();

                    return uploadImageData;
                };
                //
                $scope.getUploadErrorFiles = function () {
                    return uploadPanelObject.getErrorFiles();
                };
                //
                $scope.getCurrentUserOpsCode = function () {
                    return editorService.getEditor().currentOpsCode;
                };
                //
                $scope.saveUploadImagePanel = function () {

                    if (!ImagePanelObject.uploadLoading) {
                        var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                            currentComponentIndex = editorService.getEditor().currentSectionComponentIdx,
                            currentSection = editorService.getDraft().node.sections[currentSectionIndex];

                        //
                        var uploadFiles = $scope.getImageFileDataFromPanel();
                        var panelFiles = [];

                        for (var k = 0, len = uploadFiles.length; k < len; k++) {
                            if (!uploadFiles[k].error) {
                                panelFiles.push(uploadFiles[k]);
                            }
                        }
                        //
                        if (panelFiles.length == 0) {
                            ImagePanelObject.revert();

                            //
                            $scope.$emit(
                                "closeModuleWindow",
                                {
                                    moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                                    key: 'key', data: 'data'
                                }
                            );
                            return;
                        }

                        //
                        if (editorService.getEditor().currentOpsCode != EditorConstants.USER_OPS.ADD_SECTION && currentSection != undefined && (currentSection.components.length + panelFiles.length) >= EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS) {
                            var removeIndex = EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS - currentSection.components.length,
                                removeLength = panelFiles.length - (EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS - currentSection.components.length);
                            //
                            panelFiles.splice(removeIndex, removeLength);
                            publicPopup.alert("当前章节视觉元素数量" + EditorConstants.ELEMENT_LIMIT_LENGTH.COMPONENTS + "，已达到上限", function () {

                            });
                        }

                        //
                        var components = [],
                            section,
                            component,
                            asset;

                        if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION) {

                            section = new Moboo.DraftNodeOfSectionContent({});
                            section.uniqueId = editorFunctions.generateUniqueId();
                            //
                            for (var j = 0; j < panelFiles.length; j++) {
                                //
                                component = new Moboo.DraftNodeOfComponentImage({});
                                component.uniqueId = editorFunctions.generateUniqueId();
                                //
                                asset = new Moboo.DraftNodeOfAssetImage({});

                                asset.uniqueId = panelFiles[j].uniqueId;
                                asset.name = panelFiles[j].fileName;
                                asset.width = panelFiles[j].width;
                                asset.height = panelFiles[j].height;
                                asset.ave = panelFiles[j].ave;
                                asset.bucketCode = "creative";
                                //
                                component.type = editorFunctions.getImageComponentType(panelFiles[j].width, panelFiles[j].height);
                                component.assets.push(asset);
                                section.components.push(component);
                            }
                            //
                            editorService.addSection(currentSectionIndex, section);
                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_COMPONENT_IMAGES) {

                            for (var i = 0; i < panelFiles.length; i++) {
                                //
                                component = new Moboo.DraftNodeOfComponentImage({});
                                component.uniqueId = editorFunctions.generateUniqueId();
                                component.type = editorFunctions.getImageComponentType(panelFiles[i].width, panelFiles[i].height);

                                asset = new Moboo.DraftNodeOfAssetImage({});

                                asset.uniqueId = panelFiles[i].uniqueId;
                                asset.name = panelFiles[i].fileName;
                                asset.width = panelFiles[i].width;
                                asset.height = panelFiles[i].height;
                                asset.ave = panelFiles[i].ave;
                                asset.bucketCode = "creative";

                                component.assets.push(asset);
                                components.push(component);
                            }

                            //
                            editorService.addComponents(currentSectionIndex, currentComponentIndex, components);

                        } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_COMPONENT_MOPICS) {
                            for (var i = 0; i < panelFiles.length; i++) {

                                if (panelFiles[i].mediaType == "video") {
                                    component = new Moboo.DraftNodeOfComponentVideo({});
                                    component.type = editorFunctions.getVideoComponentType(panelFiles[i].width, panelFiles[i].height);

                                    asset = new Moboo.DraftNodeOfAssetVideo({});

                                    asset.bucketCode = "creative";
                                    asset.name = panelFiles[i].fileName;
                                    asset.uniqueId = panelFiles[i].uniqueId;
                                    asset.width = panelFiles[i].width;
                                    asset.height = panelFiles[i].height;
                                    asset.duration = panelFiles[i].duration;
                                    asset.fileSize = panelFiles[i].fileSize;

                                    component.assets.push(asset);
                                } else if (panelFiles[i].mediaType == "image") {
                                    component = new Moboo.DraftNodeOfComponentImage({});
                                    component.type = editorFunctions.getImageComponentType(panelFiles[i].width, panelFiles[i].height);

                                    asset = new Moboo.DraftNodeOfAssetImage({});

                                    asset.uniqueId = panelFiles[i].uniqueId;
                                    asset.name = panelFiles[i].fileName;
                                    asset.width = panelFiles[i].width;
                                    asset.height = panelFiles[i].height;
                                    asset.ave = panelFiles[i].ave;
                                    asset.bucketCode = "creative";

                                    component.assets.push(asset);
                                }

                                //
                                component.uniqueId = editorFunctions.generateUniqueId();
                                component.moPic = true;
                                components.push(component);
                            }

                            //
                            editorService.addComponents(currentSectionIndex, currentComponentIndex, components);
                        }
                        //
                        document.getElementById("limitImageTipText").style.display = "none";
                        document.getElementById("limitMopicTipText").style.display = "none";
                        editorService.getEditor().currentOpsCode = null;
                        uploadPanelObject.reset();

                        //
                        $scope.$emit(
                            "closeModuleWindow",
                            {
                                moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                                key: 'key', data: 'data'
                            }
                        );

                    }
                };
                //
                $scope.closeUploadImagePanel = function () {

                    if (ImagePanelObject.uploadLoading) {
                        return
                    }

                    //
                    ImagePanelObject.revert();
                    uploadPanelObject.reset();

                    //
                    document.getElementById("limitImageTipText").style.display = "none";
                    document.getElementById("limitMopicTipText").style.display = "none";
                    editorService.getEditor().currentOpsCode = null;


                    $scope.$emit(
                        "closeModuleWindow",
                        {
                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                            key: 'key', data: 'data'
                        }
                    );

                };
                //
                $scope.deleteImagePanelFile = function (panelIndex) {
                    if (!ImagePanelObject.uploadLoading) {
                        ImagePanelObject.deleteFile(panelIndex);

                        //
                        if (ImagePanelObject.getPanelFiles().length <= 9) {
                            document.getElementById("limitImageTipText").style.display = "none";
                            document.getElementById("limitMopicTipText").style.display = "none";
                        }
                    }
                };
                //
                $scope.initDragPanelImageSort = function () {

                    Sortable.create(document.getElementById("uploadImagePanel"), {
                        /*group: "words",*/
                        animation: 150,
                        store: {
                            get: function (sortable) {
                                var order = localStorage.getItem(sortable.options.group);
                                return order ? order.split('|') : [];
                            },
                            set: function (sortable) {
                                var order = sortable.toArray();
                                localStorage.setItem(sortable.options.group, order.join('|'));
                            }
                        },
                        onAdd: function (evt) {
                            //console.log('onAdd.foo:', [evt.item, evt.from]);
                        },
                        onUpdate: function (evt) {
                            //console.log('onUpdate.foo:', [evt.item, evt.from, evt.oldIndex, evt.newIndex]);
                            if (!ImagePanelObject.uploadLoading) {
                                return false;
                            }
                        },
                        onRemove: function (evt) {
                            //console.log('onRemove.foo:', [evt.item, evt.from]);
                        },
                        onStart: function (evt, options) {
                            // console.log('onStart.foo:', [evt.item, evt.from, evt.oldIndex, evt.newIndex]);
                        },
                        onSort: function (evt) {
                            //console.log('onStart.foo:', [evt.item, evt.from]);
                        },
                        onEnd: function (evt) {
                            //move section
                            if (!ImagePanelObject.uploadLoading) {
                                ImagePanelObject.moveFileFontInsert(evt.oldIndex, evt.newIndex);

                                $scope.dragImageEnd(evt.newIndex);
                                //
                                $scope.$apply();
                            }

                        },
                        onChoose: function (evt) {
                            //上传过程中不允许拖动排序;
                            if (ImagePanelObject.uploadLoading) {
                                evt.item.draggable = false;
                            } else {
                                evt.item.draggable = true;
                            }
                        }
                    });
                };

                //
                $scope.dragImageEnd = function (index) {
                    var uploadImagePanel = document.getElementById("uploadImagePanel");
                    var deleteImageBtn = uploadImagePanel.getElementsByClassName("delete-btn");

                    deleteImageBtn[index].setAttribute("class", "delete-btn");
                };
                ////////////////////////
                //the event listener.
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                    function (event, data) {
                        //
                        $scope.showImageUploadPanel = true;
                        $scope.initDragPanelImageSort();

                        //todo
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.CLOSE + EditorConstants.MODULE_WINDOW_NAME.IMAGE_UPLOAD,
                    function (event, data) {
                        //
                        $scope.showImageUploadPanel = false;
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewImageUrlAndFilePrefix = editorParam.imageUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                    }
                );

            }
        ]
    );

    //theme选择module
    editorModule.controller(
        "themeSelectorController",
        [
            "$scope", "$http", "editorService", "connectService", "EditorConstants", "editorParam", "editorFunctions", "publicFunctions", "publicPopup",
            function ($scope, $http, editorService, connectService, EditorConstants, editorParam, editorFunctions, publicFunctions, publicPopup) {
                //
                $scope.viewImageUrlAndFilePrefix = null;
                $scope.viewAudioUrlAndFilePrefix = null;
                //
                $scope.currentMobooTheme = null;
                $scope.currentThemeOption = null;
                //
                $scope.mobooThems = [];
                //用来控制模块是否显示。
                $scope.showThemeSelector = false;
                //
                var mobooThemeSelectHistory = {};
                //
                $scope.subStringForThemeDesc = function (str, num) {
                    var strLength = publicFunctions.stringUtil.lengthForUnicode(str);

                    if (strLength > num) {
                        var newText = publicFunctions.stringUtil.subForUnicode(str, num);
                        return newText + "...";
                    } else {
                        return str
                    }
                };
                //
                $scope.selectMobooTheme = function (mobooTheme) {
                    //
                    $scope.currentMobooTheme = mobooTheme;
                    $scope.currentThemeOption = mobooThemeSelectHistory[mobooTheme.code] ? mobooThemeSelectHistory[mobooTheme.code] : mobooTheme.defaultThemeOption;
                };
                //
                $scope.selectThemeOption = function (mobooTheme, themeOption) {
                    $scope.currentMobooTheme = mobooTheme;
                    $scope.currentThemeOption = themeOption;
                    mobooThemeSelectHistory[mobooTheme.code] = themeOption;
                };
                //
                $scope.isSelectOption = function (mobooTheme, themeOption) {
                    var returnValue = false;

                    //
                    if ($scope.currentMobooTheme && mobooTheme) {
                        //
                        if ($scope.currentMobooTheme.code == mobooTheme.code) {
                            //
                            if (mobooThemeSelectHistory[mobooTheme.code]) {

                                returnValue = mobooThemeSelectHistory[mobooTheme.code].code == themeOption.code;
                            } else {
                                if ($scope.currentThemeOption) {
                                    return $scope.currentThemeOption.code == themeOption.code;
                                } else {
                                    return mobooTheme.defaultThemeOption.code == themeOption.code;
                                }
                            }
                        }
                    }

                    return returnValue;
                };

                //
                $scope.getMobooThemeBgColor = function (mobooTheme) {
                    return $scope.currentMobooTheme != null && $scope.currentMobooTheme.code == mobooTheme.code && $scope.currentThemeOption != null ? $scope.currentThemeOption.bgColor : mobooThemeSelectHistory[mobooTheme.code] ? mobooThemeSelectHistory[mobooTheme.code].bgColor : mobooTheme.defaultThemeOption.bgColor;
                };
                // load the themes
                $scope.loadThemes = function () {
                    connectService.queryAllThemes().then(
                        function (data) {
                            var selectedTheme;
                            for (var i = 0; i < data.length; i++) {

                                if (data[i].code == editorService.getDraft().node.themeCode) {
                                    selectedTheme = data[i];
                                    break;
                                }

                                if (data[i].defaultSelected) {
                                    selectedTheme = data[i];
                                }
                            }
                            //
                            if (selectedTheme) {
                                $scope.currentMobooTheme = selectedTheme;

                                for (var j = 0; j < $scope.currentMobooTheme.themeOptions.length; j++) {
                                    var themeOption = $scope.currentMobooTheme.themeOptions[j];
                                    if (editorService.getDraft().node.bgColor == themeOption.bgColor) {

                                        $scope.currentThemeOption = themeOption;
                                        break;
                                    }
                                }

                                if ($scope.currentThemeOption == null || $scope.currentThemeOption == undefined) {
                                    if ($scope.currentMobooTheme.defaultThemeOption) {
                                        $scope.currentThemeOption = $scope.currentMobooTheme.defaultThemeOption;
                                    }
                                }
                            }

                            $scope.mobooThems = data;
                        },
                        function (data) {
                            publicPopup.ajaxExceptionProcess(data);
                        }, function (error) {
                            publicPopup.ajaxExceptionProcess(error);
                        }
                    );
                };
                //
                $scope.confirmTheme = function () {
                    //
                    if ($scope.currentMobooTheme == null) {
                        return;
                    }
                    //save theme and bgColor
                    if ($scope.currentThemeOption != null) {
                        editorService.modifyEpisode(
                            {
                                themeCode: $scope.currentMobooTheme.code,
                                bgColor: $scope.currentThemeOption.bgColor,
                                sectionBgColor: $scope.currentThemeOption.sectionBgColor
                            }
                        );
                    }
                    //
                    $scope.currentMobooTheme = null;
                    $scope.currentThemeOption = null;
                    // mobooThemeSelectHistory = {};
                    $scope.showThemeSelector = false;
                };
                //
                $scope.cancelTheme = function () {
                    $scope.currentMobooTheme = null;
                    $scope.currentThemeOption = null;
                    mobooThemeSelectHistory = {};
                    $scope.showThemeSelector = false;
                };
                ////////////////////////
                //the event listener.
                // data:{ null }
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.THEME_SELECTOR,
                    function (event, data) {
                        //
                        $scope.showThemeSelector = true;
                        $scope.loadThemes();
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.CLOSE + EditorConstants.MODULE_WINDOW_NAME.THEME_SELECTOR,
                    function (event, data) {
                        //
                        $scope.showThemeSelector = false;
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewImageUrlAndFilePrefix = editorParam.imageUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                    }
                );
            }
        ]
    );

    //bgMusics选择module
    editorModule.controller(
        "bgmSelectorController",
        [
            "$scope", "$sce", "$http", "$timeout", "editorService", "connectService", "EditorConstants", "editorFunctions", "editorParam", "publicFunctions", "publicPopup", "dragBarService", "uploadService", "uploadPanelObject",
            function ($scope, $sce, $http, $timeout, editorService, connectService, EditorConstants, editorFunctions, editorParam, publicFunctions, publicPopup, dragBarService, uploadService, uploadPanelObject) {
                //
                $scope.viewLibraryUrlPrefix = editorParam.libraryBucketOriginalUrlPrefix;
                $scope.viewDefaultUrlPrefix = editorParam.defaultBucketOriginalUrlPrefix;
                $scope.viewImageUrlAndFilePrefix = null;
                $scope.viewAudioUrlAndFilePrefix = null;
                //
                $scope.curSelectSelfMusic = null;
                //
                $scope.sce = $sce.trustAsResourceUrl;
                //the bgm data query from server by ajax.
                $scope.tags = [];
                $scope.selectedTag = {
                    tagId: 0,
                    title: ""
                };
                //audio info
                $scope.bgMusic = {
                    playProcess: 0,
                    play: false,
                    volume: EditorConstants.AUDIO_VOLUME.BACKGROUND_MUSIC
                };
                //用来控制模块是否显示。
                $scope.showBgmSelector = false;
                $scope.showUploadError = false;
                $scope.volumeBarVisable = false;
                $scope.userLoginStatus = false;
                //
                $scope.signonProcess = function () {
                    publicPopup.signonProcess();
                };
                //
                $scope.showVolumeBar = function () {
                    $scope.volumeBarVisable = !$scope.volumeBarVisable;
                };
                //
                $scope.showAudioControl = function () {
                    return $scope.bgMusic.play;
                };
                //
                $scope.selectBgMusic = function ($event, item) {
                    //
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    $scope.curSelectSelfMusic = item;
                };
                //
                $scope.cancelSelectBgMusic = function () {

                    if (!$scope.musicNameIsModify) {
                        $scope.curSelectSelfMusic = null;
                    }
                };
                //
                $scope.filterText = function (str) {
                    var text;

                    if (publicFunctions.stringUtil.lengthForUnicode(str) >= 28) {
                        text = publicFunctions.stringUtil.subForUnicode(str, 24) + "...";
                    } else {
                        text = str;
                    }

                    return text;
                };
                //
                $scope.subStringForBgmMusicTitle = function (str, $event) {
                    var target = $event.srcElement || $event.target;

                    if (publicFunctions.stringUtil.isNullOrEmpty(str) || publicFunctions.stringUtil.trim(str) == "") {
                        return;
                    }

                    if ($scope.curSelectSelfMusic) {

                        if (publicFunctions.stringUtil.lengthForUnicode(str) > 28) {

                            str = publicFunctions.stringUtil.splice(str, target.selectionStart - 1, 1);
                        }

                        $scope.curSelectSelfMusic.title = publicFunctions.stringUtil.subForUnicode(str, 28);
                    }
                };
                //
                var timer = null;
                $scope.previewLibrary = function (libraryItem) {

                    if ($scope.libraryItem != libraryItem) {
                        //
                        $scope.libraryItem = libraryItem;

                        $scope.loadBgMusicUrl();
                        $scope.pause();

                        if (timer) {
                            $timeout.cancel(timer);
                        }

                        if ($scope.libraryItem != null) {
                            //
                            timer = $timeout(function () {

                                $scope.play($scope.libraryItem.genericMedias[0].extStr01);
                            }, 100);
                        } else {
                            $scope.volumeBarVisable = false;
                        }
                    } else {
                        $scope.play();
                    }
                };
                ////////////////////////////
                var audio = new Audio();
                //
                $scope.loadBgMusicUrl = function () {
                    $scope.bgMusic.playProcess = 0;

                    var browser = editorFunctions.browserDetection();

                    if (browser != EditorConstants.BROWSER.OPERA && audio && $scope.libraryItem && $scope.libraryItem.genericMedias[0]) {
                        audio.src = $scope.viewLibraryUrlPrefix + $scope.libraryItem.genericMedias[0].fileId;
                    } else if (browser == EditorConstants.BROWSER.OPERA && audio && $scope.libraryItem && $scope.libraryItem.genericMedias[0]) {

                        //todo
                    }
                };
                //
                $scope.play = function (audioDuration) {

                    if (audio && !$scope.bgMusic.play) {
                        //
                        var playPromise = audio.play();
                        if (playPromise) {
                            playPromise.catch(function (e) {
                                //console.log(e);
                            })
                        }
                    }
                    //
                    audio.volume = $scope.bgMusic.volume;

                    if (audio && audioDuration != null && audioDuration != undefined && audioDuration !== '') {
                        //
                        audio.addEventListener("timeupdate", function () {

                            $scope.bgMusic.playProcess = audio.currentTime / audioDuration * 100;

                            $scope.$apply();
                        });
                        //
                        audio.addEventListener("ended", function () {

                            $scope.bgMusic.play = false;

                            $scope.$apply();
                        });
                    }
                    //
                    $scope.bgMusic.play = true;
                };

                //
                $scope.fixedPointPlay = function ($event) {
                    if ($scope.bgMusic.play) {
                        var target = $event.srcElement || $event.target,
                            fixedWidth = $event.pageX - target.parentNode.getBoundingClientRect().left,
                            targetWidth = target.offsetWidth,
                            audioDuration = $scope.libraryItem.genericMedias[0].extStr01;
                        //
                        var playPromise = audio.play();
                        if (playPromise) {
                            playPromise.catch(function (e) {
                            })
                        }
                        //
                        audio.currentTime = fixedWidth / targetWidth * audioDuration;
                    }
                };
                //
                $scope.pause = function () {

                    if (audio && $scope.bgMusic.play) {
                        audio.pause();
                        $scope.bgMusic.play = false;
                    }
                };
                //
                $scope.closeBgMusic = function () {
                    if ($scope.bgMusic.play) {
                        $scope.pause();
                    }

                    $scope.showBgmSelector = false;
                    $scope.volumeBarVisable = false;

                    dragBarService.destroy();
                    $scope.rangeRows = null;
                    $scope.selectedTag.tagId = 0;
                };
                //
                $scope.confirmBgMusic = function () {
                    if ($scope.libraryItem == null) {
                        editorService.removeBgMusic();
                        $scope.closeBgMusic();
                        return;
                    }

                    var genericMedia = $scope.libraryItem.genericMedias[0];
                    var audioData = {
                        "bucketCode": genericMedia.bucketCode,
                        "uniqueId": genericMedia.fileId,
                        "name": $scope.libraryItem.title,
                        "duration": genericMedia.extStr01,
                        "fileSize": genericMedia.extStr02,
                        "volume": $scope.bgMusic.volume,
                        "tagId": $scope.libraryItem.tag ? $scope.libraryItem.tag.id : 0
                    };

                    var coverData = null;
                    if ($scope.libraryItem.covers != null && $scope.libraryItem.covers.length > 0) {
                        coverData = {
                            "bucketCode": $scope.libraryItem.covers[0].bucketCode,
                            "name": $scope.libraryItem.covers[0].name,
                            "uniqueId": $scope.libraryItem.covers[0].fileId,
                            "width": $scope.libraryItem.covers[0].resolution != null ? $scope.libraryItem.covers[0].resolution.width : null,
                            "height": $scope.libraryItem.covers[0].resolution != null ? $scope.libraryItem.covers[0].resolution.height : null,
                            "ave": $scope.libraryItem.covers[0].ave != null ? $scope.libraryItem.covers[0].ave.ave : null
                        }
                    } else {
                        coverData = {};
                    }

                    var updateBgMusicData = {"cover": coverData, "audio": audioData};
                    if (editorService.getDraft().node.bgMusics && editorService.getDraft().node.bgMusics.length > 0) {

                        editorService.modifyBgMusic(updateBgMusicData);
                    } else {
                        updateBgMusicData.uniqueId = editorFunctions.generateUniqueId();
                        var bgMusic = new Moboo.DraftNodeOfBgMusic(updateBgMusicData);

                        editorService.addBgMusic(bgMusic);
                    }
                    //
                    $scope.closeBgMusic();
                };
                //
                $scope.generateVolumeBar = function () {
                    dragBarService.load(document.getElementById("bgMusicRangeContainer"));
                    dragBarService.setCurrentPos($scope.bgMusic.volume);
                    //
                    dragBarService.onMoveListener(function (volume) {
                        $scope.bgMusic.volume = volume;
                        console.log("bgMusic volume:" + $scope.bgMusic.volume);

                        if ($scope.bgMusic.play) {
                            $scope.play();
                        }
                    });
                };
                //
                $scope.generateLibraryItemByDraft = function () {
                    var returnValue = null;
                    var bgMusic = editorService.getDraft().node.bgMusics[0];

                    if (bgMusic != null) {
                        returnValue = {};

                        if (bgMusic.cover != null) {
                            returnValue.covers = [{
                                "providerCode": bgMusic.cover.providerCode,
                                "bucketCode": bgMusic.cover.bucketCode,
                                "fileId": bgMusic.cover.uniqueId,
                                "origin": $scope.viewImageUrlAndFilePrefix + bgMusic.cover.uniqueId,
                                "ave": {
                                    "ave": bgMusic.cover.ave
                                }, "resolution": {
                                    "width": bgMusic.cover.width,
                                    "height": bgMusic.cover.height
                                }
                            }];
                        }

                        if (bgMusic.audio != null) {
                            returnValue.genericMedias = [{
                                "providerCode": bgMusic.audio.providerCode,
                                "bucketCode": bgMusic.audio.bucketCode,
                                "type": "audio",
                                "fileId": bgMusic.audio.uniqueId,
                                "origin": $scope.viewAudioUrlAndFilePrefix + bgMusic.audio.uniqueId,
                                "extStr01": bgMusic.audio.duration, "extStr02": bgMusic.audio.fileSize
                            }];

                            returnValue.title = bgMusic.audio.name;
                            returnValue.tag = bgMusic.audio.tagId > 0 ? {id: bgMusic.audio.tagId} : null;
                            //
                            $scope.bgMusic.volume = bgMusic.audio.volume;
                        }
                    }
                    return returnValue;
                };
                //
                $scope.curOpsCode = null;
                $scope.loadController = function () {
                    //
                    $scope.libraryItem = $scope.generateLibraryItemByDraft();

                    $scope.loadBgMusicUrl();
                    $scope.generateVolumeBar();
                    //
                    if (publicFunctions.collectionUtil.isNullOrEmpty($scope.tags)) {
                        connectService.queryBgMusicTags().then(
                            function (data) {
                                $scope.tags = data;
                                //
                                for (var i = 0; i < $scope.tags.length; i++) {
                                    if ($scope.libraryItem && $scope.libraryItem.tag && $scope.libraryItem.tag.id > 0 && $scope.tags[i].tagId == $scope.libraryItem.tag.id) {
                                        $scope.selectedTag.tagId = $scope.libraryItem.tag.id;
                                        break;
                                    }
                                }
                                //
                                if ($scope.selectedTag.tagId > 0) {
                                    $scope.loadBgMusic(0, true);

                                    $scope.curOpsCode = EditorConstants.LOAD_MUSIC.PUBLIC;
                                } else {
                                    $scope.loadSelfBgMusic(0, true);

                                    $scope.curOpsCode = EditorConstants.LOAD_MUSIC.SELF;
                                }
                            },
                            function (data) {
                                publicPopup.ajaxExceptionProcess(data);
                            }, function (error) {
                                publicPopup.ajaxExceptionProcess(error);
                            }
                        );
                    } else {
                        //
                        for (var i = 0; i < $scope.tags.length; i++) {
                            if ($scope.libraryItem && $scope.libraryItem.tag && $scope.libraryItem.tag.id > 0 && $scope.tags[i].tagId == $scope.libraryItem.tag.id) {
                                $scope.selectedTag.tagId = $scope.libraryItem.tag.id;
                                break;
                            }
                        }
                        //
                        if ($scope.selectedTag.tagId > 0) {
                            $scope.loadBgMusic(0, true);

                            $scope.curOpsCode = EditorConstants.LOAD_MUSIC.PUBLIC;
                        } else {
                            $scope.loadSelfBgMusic(0, true);

                            $scope.curOpsCode = EditorConstants.LOAD_MUSIC.SELF;
                        }
                    }
                };
                //
                $scope.rangeRowsLoading = false;
                $scope.rangeRows = null;
                $scope.rangeSize = 15;

                $scope.musicNameIsModify = false;

                $scope.loadBgMusic = function (startRowIdx, append) {
                    $scope.rangeRowsLoading = true;

                    var endRowIdx = startRowIdx + $scope.rangeSize;
                    if ($scope.rangeRows && endRowIdx > $scope.rangeRows.totalRows) {
                        endRowIdx = $scope.rangeRows.totalRows;
                    }

                    connectService.searchBgMusics({
                        tagId: $scope.selectedTag.tagId,
                        startRowIdx: startRowIdx,
                        endRowIdx: endRowIdx
                    }).then(
                        function (data) {
                            //
                            if (append && $scope.rangeRows != null) {

                                $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows($scope.rangeRows.rows, data.rows);
                                $scope.rangeRows.range = data.range;
                            } else {

                                $scope.rangeRows = data;
                            }
                            $scope.rangeRowsLoading = false;
                        }, function (data) {
                            $scope.rangeRowsLoading = false;
                            publicPopup.ajaxExceptionProcess(data);
                        },
                        function (error) {
                            $scope.rangeRowsLoading = false;
                            publicPopup.ajaxExceptionProcess(error);
                        }
                    );
                };
                //
                $scope.loadSelfBgMusic = function (startRowIdx, append) {
                    $scope.rangeRowsLoading = true;

                    if (editorParam.userNo) {
                        var endRowIdx = startRowIdx + $scope.rangeSize;
                        if ($scope.rangeRows && endRowIdx > $scope.rangeRows.totalRows) {
                            endRowIdx = $scope.rangeRows.totalRows;
                        }

                        connectService.querySelfBgMusics({
                            startRowIdx: startRowIdx,
                            endRowIdx: endRowIdx
                        }).then(
                            function (data) {
                                //
                                if (append && $scope.rangeRows != null) {

                                    $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows($scope.rangeRows.rows, data.rows);
                                    $scope.rangeRows.range = data.range;
                                } else {

                                    $scope.rangeRows = data;
                                }
                                $scope.rangeRowsLoading = false;
                            }, function (data) {
                                $scope.rangeRowsLoading = false;
                                publicPopup.ajaxExceptionProcess(data);
                            },
                            function (error) {
                                $scope.rangeRowsLoading = false;
                                publicPopup.ajaxExceptionProcess(error);
                            }
                        );
                    } else {
                        $scope.userLoginStatus = true;
                    }
                };
                //
                $scope.searchSelfBgMusics = function (tagId) {
                    $scope.selectedTag.tagId = tagId;
                    if (tagId != undefined) {
                        $scope.selectedTag.tagId = tagId;
                        $scope.rangeRows = null;
                        $scope.loadSelfBgMusic(0, true);
                        $scope.curOpsCode = EditorConstants.LOAD_MUSIC.SELF;
                    }
                };
                //
                $scope.searchBgMusics = function (tagId) {
                    if (tagId != undefined) {
                        $scope.selectedTag.tagId = tagId;
                        $scope.rangeRows = null;
                        $scope.loadBgMusic(0, true);
                        $scope.curOpsCode = EditorConstants.LOAD_MUSIC.PUBLIC;
                    }
                };
                //
                $scope.nextRangeRows = function (range) {

                    if (range != null && !$scope.rangeRowsLoading) {

                        var startRowIdx = range.endRowIdx + 1;

                        if (startRowIdx <= range.totalRows) {
                            if ($scope.curOpsCode == EditorConstants.LOAD_MUSIC.PUBLIC) {
                                $scope.loadBgMusic(startRowIdx, true);
                            } else if ($scope.curOpsCode == EditorConstants.LOAD_MUSIC.SELF) {
                                $scope.loadSelfBgMusic(startRowIdx, true);
                            }
                        }
                    }
                };
                //
                $scope.operateSelfMusic = function ($event, index) {
                    var target = $event.srcElement || $event.target;
                    //
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    //
                    if (EditorConstants.DATA_ACTION.DELETE == target.getAttribute('data-action')) {

                        publicPopup.confirm("确定要删除背景音乐" + $scope.curSelectSelfMusic.title + "", function (data) {

                            if (data) {
                                connectService.removeSelfLibrary({
                                    itemNo: $scope.curSelectSelfMusic.itemNo
                                }).then(
                                    function (data) {
                                        if (data) {
                                            //
                                            $scope.rangeRows.rows = publicFunctions.collectionUtil.removeRow($scope.rangeRows.rows, index);
                                            $scope.rangeRows.range = editorFunctions.removeRangeRow($scope.rangeRows.range);

                                            if ($scope.rangeRows.range.totalRows > $scope.rangeSize && $scope.rangeRows.rows.length < $scope.rangeSize) {

                                                clearTimeout(timer);

                                                timer = setTimeout(function () {
                                                    $scope.nextRangeRows($scope.rangeRows.range);
                                                }, 2000)
                                            }
                                        }
                                        //
                                        $scope.curSelectSelfMusic = null;
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );
                            }
                        });

                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MODIFY_SELF_MUSIC) {

                        var element = document.getElementById("musicName" + index + "");

                        element.removeAttribute("readonly");
                        clearTimeout(timer);

                        timer = setTimeout(function () {
                            element.focus();
                        }, 100);

                        $scope.musicNameIsModify = true;
                    }
                };
                //
                $scope.saveSelfMusicOfModify = function (index) {
                    var element = document.getElementById("musicName" + index + "");

                    if ($scope.curSelectSelfMusic && publicFunctions.stringUtil.isNullOrEmpty($scope.curSelectSelfMusic.title)) {
                        publicPopup.alert("音乐标题不能为空", function () {
                            element.focus();
                        });

                        return;
                    }
                    //
                    if ($scope.curSelectSelfMusic) {

                        element.setAttribute("readonly", "readonly");
                        $scope.musicNameIsModify = false;

                        if (publicFunctions.stringUtil.lengthForUnicode($scope.curSelectSelfMusic.title) > 28) {

                            $scope.curSelectSelfMusic.title = publicFunctions.stringUtil.subForUnicode($scope.curSelectSelfMusic.title, 28);
                        }

                        //
                        connectService.modifySelfLibrary({
                            itemNo: $scope.curSelectSelfMusic.itemNo,
                            title: $scope.curSelectSelfMusic.title,
                            libraryItemTypeCode: "background.music"
                        }).then(
                            function (data) {

                                if (data) {

                                }
                            }, function (data) {
                                publicPopup.ajaxExceptionProcess(data);
                            }, function (error) {
                                publicPopup.ajaxExceptionProcess(error);
                            }
                        );

                    }
                };
                //
                $scope.showSelfBgMusicUploadBtn = function () {
                    if ($scope.rangeRows != null && $scope.rangeRows != undefined) {
                        return $scope.rangeRows.range.totalRows < EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC
                    } else {
                        return true
                    }
                };
                $scope.beyondLimit = function () {
                    publicPopup.alert("可上传的背景音乐数量已达100个上限", function () {

                    });
                };
                //upload self music
                $scope.bindAudioFileUploader = function () {

                    uploadService.bindAudioFileUploader(
                        {
                            "pickId": ".upload-self-audio-btn",
                            "multiple": true,
                            fileNumLimit: 9,
                            "fileSingleSizeLimit": 5 * 1024 * 1024
                        },
                        {
                            fileQueuedBefore: function (files, audioFileUploader) {
                                var cancelUploadFiles = [];
                                var length = files.length > 9 ? 9 : files.length;
                                //
                                if ($scope.rangeRows != null && $scope.rangeRows != undefined && $scope.rangeRows.range.totalRows + length > EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC) {

                                    for (var i = EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC - $scope.rangeRows.range.totalRows; i < files.length; i++) {
                                        cancelUploadFiles.push(files[i]);
                                    }

                                    audioFileUploader.removeFiles(cancelUploadFiles);

                                    publicPopup.alert("可上传的背景音乐数量已达100个上限", function () {

                                    });
                                }
                                //
                                $scope.$apply();
                            },
                            fileQueued: function () {
                                //
                                $scope.$apply();
                            },
                            progress: function () {
                                editorService.getEditor().loadingStatus = true;
                                $scope.$apply();
                            },
                            success: function (successFileInfo) {
                                var cropAudioData = {
                                    "mediaTypeCode": "audio",
                                    "providerCode": "qiniu",
                                    "bucketCode": successFileInfo.bucketCode,
                                    "originalFileId": successFileInfo.id,
                                    "fileIdPrefix": editorParam.audioUploadSetting.storeFileNamePrefix + MobooLib.Functions.generateGUID(16, 64, true),
                                    "transformFormats": ["mp3"]
                                };

                                var fileName;
                                if (publicFunctions.stringUtil.lengthForUnicode(successFileInfo.fileName) > 14) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(successFileInfo.fileName, 14) + "...";
                                } else {
                                    fileName = successFileInfo.fileName;
                                }
                                //
                                var data = {
                                    title: fileName,
                                    text: "上传成功"
                                };

                                uploadPanelObject.pushSuccessFile(data);
                                //
                                connectService.cropResource(cropAudioData).then(
                                    function (data) {
                                        //
                                        connectService.getPretreatmentFopStatus(data.persistId).then(function (dataP) {
                                            if (dataP) {

                                                var audioData = {
                                                    title: publicFunctions.stringUtil.subForUnicode(successFileInfo.fileName, 28),
                                                    libraryItemTypeCode: "background.music",
                                                    providerCode: successFileInfo.providerCode,
                                                    extStr01: successFileInfo.duration,
                                                    extStr02: successFileInfo.fileSize,
                                                    bucketCode: successFileInfo.bucketCode,
                                                    fileId: cropAudioData.fileIdPrefix + ".mp3"
                                                };

                                                connectService.createSelfLibrary(audioData).then(
                                                    function (data) {
                                                        //
                                                        $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows([data], $scope.rangeRows.rows);
                                                        $scope.rangeRows.range = editorFunctions.addRangeRow($scope.rangeRows.range);

                                                        editorService.getEditor().loadingStatus = false;

                                                        if (uploadPanelObject.getSuccessFiles().length >= 9 || uploadPanelObject.getErrorFiles().length > 0) {
                                                            $scope.$emit(
                                                                "openModuleWindow",
                                                                {
                                                                    moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.UPLOAD_ERROR
                                                                }
                                                            );
                                                        } else {
                                                            uploadPanelObject.reset();
                                                        }
                                                    },
                                                    function (data) {
                                                        editorService.getEditor().loadingStatus = false;
                                                        publicPopup.ajaxExceptionProcess(data);
                                                    }, function (error) {
                                                        editorService.getEditor().loadingStatus = false;
                                                        publicPopup.ajaxExceptionProcess(error);
                                                    }
                                                );

                                                //
                                                connectService.generateAudioMultiVolumeFiles({
                                                    "providerCode": audioData.providerCode,
                                                    "bucketCode": audioData.bucketCode,
                                                    "fileId": audioData.fileId
                                                });
                                            } else {
                                                editorService.getEditor().loadingStatus = false;
                                                publicPopup.alert("音频转码失败！");
                                                console.log("音频转码失败" + JSON.stringify(data));
                                            }

                                        }, function (error) {
                                            editorService.getEditor().loadingStatus = false;
                                        });
                                    }, function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                        editorService.getEditor().loadingStatus = false;
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                        editorService.getEditor().loadingStatus = false;
                                    }
                                )
                            },
                            finished: function () {
                                //
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

                                if (message == "文件过大") {
                                    message = "文件过大，最大可上传5Mb的音频文件";
                                } else if (message == "文件格式错误") {
                                    message = "文件格式错误,无法上传(仅支持MP3、ogg、wav、m4a)";
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

                                if (uploadPanelObject.getSuccessFiles().length == 0 && uploadPanelObject.getErrorFiles().length > 0) {

                                    $scope.$emit(
                                        "openModuleWindow",
                                        {
                                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.UPLOAD_ERROR
                                        }
                                    );
                                    //
                                    editorService.getEditor().loadingStatus = false;
                                    $scope.$apply();

                                }
                            }
                        }, editorParam.libAudioUploadSetting
                    );
                };
                ////////////////////////
                //the event listener.
                // data:{tagId: int, curPage: int, pageSize: int}
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.BGM_SELECTOR,
                    function (event, data) {
                        //
                        $scope.showBgmSelector = true;
                        //
                        $scope.loadController();
                        //
                        $scope.bindAudioFileUploader();
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewImageUrlAndFilePrefix = editorParam.imageUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                    }
                );

            }
        ]
    );
    //
    editorModule.controller(
        "evnMusicSelectorController",
        [
            "$scope", "$timeout", "EditorConstants", "connectService", "publicFunctions", "editorFunctions", "publicPopup", "editorParam", "editorService", "dragBarService", "uploadService", "uploadPanelObject",
            function ($scope, $timeout, EditorConstants, connectService, publicFunctions, editorFunctions, publicPopup, editorParam, editorService, dragBarService, uploadService, uploadPanelObject) {
                //
                $scope.viewLibraryUrlPrefix = editorParam.libraryBucketOriginalUrlPrefix;
                $scope.viewDefaultUrlPrefix = editorParam.defaultBucketOriginalUrlPrefix;
                //
                $scope.viewAudioUrlAndFilePrefix = null;
                //
                $scope.libraryItem = null;
                //
                $scope.curSelectMusic = {
                    code: null,
                    item: null
                };
                //
                $scope.volume = EditorConstants.AUDIO_VOLUME.ENV_MUSIC;
                //控制模块显隐
                $scope.showEvnMusicSelector = false;
                $scope.evnMusicPlay = false;
                $scope.userLoginStatus = false;
                //
                $scope.signonProcess = function () {
                    publicPopup.signonProcess();
                };
                //
                var audio = new Audio();
                $scope.previewLibrary = function (item) {
                    $scope.libraryItem = item;

                    if ($scope.musicNameIsModify) {
                        return
                    }

                    if ($scope.evnMusicPlay) {
                        $scope.pause();
                    }

                    if (item != null) {
                        $scope.play();
                        //
                        audio.addEventListener("ended", function () {
                            $scope.evnMusicPlay = false;

                            $scope.$apply();
                        });
                    }
                };
                //
                $scope.play = function () {

                    if (!$scope.evnMusicPlay) {
                        audio.src = $scope.viewLibraryUrlPrefix + $scope.libraryItem.genericMedias[0].fileId;

                        var playPromise = audio.play();

                        if (playPromise) {
                            playPromise.catch(function (e) {
                                //console.log(e);
                            })
                        }
                        audio.loop = true;
                    }

                    audio.volume = $scope.volume;
                    $scope.evnMusicPlay = true;

                };
                //
                $scope.pause = function () {
                    if ($scope.evnMusicPlay) {
                        audio.pause();
                        $scope.evnMusicPlay = false;
                    }
                };
                //
                $scope.showAudioControlBtn = function () {
                    return $scope.evnMusicPlay;
                };
                //
                $scope.selectSelfEffectMusic = function ($event, item) {
                    //
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    $scope.curSelectMusic.item = item;
                };
                //
                $scope.cancelSelectEffectMusic = function () {

                    if (!$scope.musicNameIsModify) {
                        $scope.curSelectMusic.item = null;
                    }
                };
                //
                $scope.closeEvnMusic = function () {
                    $scope.showEvnMusicSelector = false;
                    $scope.rangeRows = null;
                    $scope.pause();
                    dragBarService.destroy();
                };
                //
                $scope.saveEvnMusic = function () {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx;

                    if ($scope.libraryItem == null) {
                        editorService.removeAudioFromSection(currentSectionIndex);
                        $scope.closeEvnMusic();
                        return;
                    }

                    var audioNode = new Moboo.DraftNodeOfAssetAudio({
                        bucketCode: $scope.libraryItem.genericMedias[0].bucketCode,
                        duration: $scope.libraryItem.genericMedias[0].extStr01 != null ? $scope.libraryItem.genericMedias[0].extStr01 : 0,
                        name: $scope.libraryItem.title != null ? $scope.libraryItem.title : "",
                        fileSize: $scope.libraryItem.genericMedias[0].extStr02 != null ? $scope.libraryItem.genericMedias[0].extStr02 : 0,
                        uniqueId: $scope.libraryItem.genericMedias[0].fileId != null ? $scope.libraryItem.genericMedias[0].fileId : "",
                        volume: $scope.volume
                    });

                    //
                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_SECTION_AUDIO) {
                        editorService.modifySectionAudio(currentSectionIndex, audioNode)
                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_SECTION_AUDIO) {
                        editorService.addAudioToSection(currentSectionIndex, audioNode);
                    }
                    //
                    $scope.closeEvnMusic();
                };
                //
                $scope.loadControllerData = function (type) {
                    $scope.libraryItem = $scope.generateLibraryItemByDraft();
                    $scope.generateVolumeBar();
                    //
                    if ($scope.libraryItem) {
                        $scope.play();
                    }
                    //
                    $scope.switchEvnMusicType(type);
                };
                //
                $scope.switchEvnMusicType = function (type) {
                    //
                    $scope.rangeRows = null;

                    if (type == EditorConstants.LOAD_MUSIC.PUBLIC) {
                        $scope.loadEvnMusics(0, true);
                    } else if (type == EditorConstants.LOAD_MUSIC.SELF) {
                        $scope.loadSelfEvnMusics(0, true);
                    }
                    //
                    $scope.curSelectMusic.code = type;
                };
                //
                $scope.generateVolumeBar = function () {
                    dragBarService.load(document.getElementById("evnMusicRangeContainer"));

                    dragBarService.setCurrentPos($scope.volume);

                    dragBarService.onMoveListener(function (volume) {
                        $scope.volume = volume;
                        if ($scope.evnMusicPlay) {
                            $scope.play();
                        }
                    });
                };
                //
                $scope.generateLibraryItemByDraft = function () {
                    var returnValue = null;
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentSectionEvnMusic = editorService.getDraft().node.sections[currentSectionIndex].audios[0];

                    if (currentSectionEvnMusic != null) {
                        returnValue = {};

                        returnValue.genericMedias = [{
                            "providerCode": currentSectionEvnMusic.providerCode,
                            "bucketCode": currentSectionEvnMusic.bucketCode,
                            "type": "audio",
                            "fileId": currentSectionEvnMusic.uniqueId,
                            "origin": $scope.viewAudioUrlAndFilePrefix + currentSectionEvnMusic.uniqueId,
                            "extStr01": currentSectionEvnMusic.duration,
                            "extStr02": currentSectionEvnMusic.fileSize
                        }];

                        returnValue.title = currentSectionEvnMusic.name;

                        dragBarService.setCurrentPos(currentSectionEvnMusic.volume);
                        //
                        $scope.volume = currentSectionEvnMusic.volume;

                        return returnValue;
                    } else {
                        $scope.volume = EditorConstants.AUDIO_VOLUME.ENV_MUSIC;
                    }

                    return returnValue;
                };
                //
                $scope.rangeRowsLoading = false;
                $scope.rangeRows = null;
                $scope.rangeSize = 15;

                $scope.loadEvnMusics = function (startRowIdx, append) {
                    $scope.rangeRowsLoading = true;

                    connectService.searchEvnMusics({
                        startRowIdx: startRowIdx,
                        endRowIdx: startRowIdx + $scope.rangeSize
                    }).then(
                        function (data) {
                            //
                            if (append && $scope.rangeRows != null) {
                                $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows($scope.rangeRows.rows, data.rows);
                                $scope.rangeRows.range = data.range;
                            } else {

                                $scope.rangeRows = data;
                            }
                            $scope.rangeRowsLoading = false;
                        }, function (data) {
                            $scope.rangeRowsLoading = false;
                            publicPopup.ajaxExceptionProcess(data);
                        },
                        function (error) {
                            $scope.rangeRowsLoading = false;
                            publicPopup.ajaxExceptionProcess(error);
                        }
                    );
                };
                //
                $scope.loadSelfEvnMusics = function (startRowIdx, append) {
                    $scope.rangeRowsLoading = true;

                    if (editorParam.userNo) {
                        connectService.querySelfEvnMusics({
                            startRowIdx: startRowIdx,
                            endRowIdx: startRowIdx + $scope.rangeSize
                        }).then(
                            function (data) {
                                //
                                if (append && $scope.rangeRows != null) {

                                    $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows($scope.rangeRows.rows, data.rows);
                                    $scope.rangeRows.range = data.range;
                                } else {

                                    $scope.rangeRows = data;
                                }
                                $scope.rangeRowsLoading = false;
                            }, function (data) {
                                $scope.rangeRowsLoading = false;
                                publicPopup.ajaxExceptionProcess(data);
                            },
                            function (error) {
                                $scope.rangeRowsLoading = false;
                                publicPopup.ajaxExceptionProcess(error);
                            }
                        );
                    } else {
                        $scope.userLoginStatus = true;
                    }
                };

                //
                $scope.nextRangeRows = function (range) {

                    if (range != null && !$scope.rangeRowsLoading) {
                        var startRowIdx = range.endRowIdx + 1;

                        if (startRowIdx <= range.totalRows) {
                            if ($scope.curSelectMusic.code == EditorConstants.LOAD_MUSIC.PUBLIC) {
                                $scope.loadEvnMusics(startRowIdx, true);
                            } else if ($scope.curSelectMusic.code == EditorConstants.LOAD_MUSIC.SELF) {
                                $scope.loadSelfEvnMusics(startRowIdx, true);
                            }
                        }
                    }
                };
                //
                var timer;
                $scope.musicNameIsModify = false;
                //
                $scope.operateSelfEvnMusic = function ($event, index) {
                    var target = $event.srcElement || $event.target;
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    //
                    if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.DELETE) {

                        publicPopup.confirm("确定要删除环境音" + $scope.curSelectMusic.item.title + "", function (data) {

                            if (data) {
                                connectService.removeSelfLibrary({
                                    itemNo: $scope.curSelectMusic.item.itemNo
                                }).then(
                                    function (data) {
                                        if (data) {
                                            //
                                            $scope.rangeRows.rows = publicFunctions.collectionUtil.removeRow($scope.rangeRows.rows, index);
                                            $scope.rangeRows.range = editorFunctions.removeRangeRow($scope.rangeRows.range);

                                            if ($scope.rangeRows.range.totalRows > $scope.rangeSize && $scope.rangeRows.rows.length < $scope.rangeSize) {

                                                clearTimeout(timer);

                                                timer = setTimeout(function () {
                                                    $scope.nextRangeRows($scope.rangeRows.range);
                                                }, 2000);
                                            }
                                        }
                                        //
                                        $scope.curSelectMusic.item = null;
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );
                            }
                        });

                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MODIFY_SELF_MUSIC) {

                        var element = document.getElementById("evnMusicName" + index + "");

                        element.removeAttribute("readonly");
                        clearTimeout(timer);

                        timer = setTimeout(function () {
                            element.focus();
                        }, 100);

                        $scope.musicNameIsModify = true;
                    }
                };
                //
                $scope.saveSelfMusicOfModify = function (index) {
                    var element = document.getElementById("evnMusicName" + index + "");

                    if ($scope.curSelectMusic.item && publicFunctions.stringUtil.isNullOrEmpty($scope.curSelectMusic.item.title)) {
                        publicPopup.alert("音乐标题不能为空", function () {
                            element.focus();
                        });

                        return;
                    }
                    //
                    if ($scope.curSelectMusic.item) {

                        element.setAttribute("readonly", "readonly");
                        $scope.musicNameIsModify = false;

                        if (publicFunctions.stringUtil.lengthForUnicode($scope.curSelectMusic.item.title) > 28) {

                            $scope.curSelectMusic.item.title = publicFunctions.stringUtil.subForUnicode($scope.curSelectMusic.item.title, 28);
                        }

                        //
                        connectService.modifySelfLibrary({
                            itemNo: $scope.curSelectMusic.item.itemNo,
                            title: $scope.curSelectMusic.item.title,
                            libraryItemTypeCode: "env.music"
                        }).then(
                            function (data) {

                                if (data) {

                                }
                            }, function (data) {
                                publicPopup.ajaxExceptionProcess(data);
                            }, function (error) {
                                publicPopup.ajaxExceptionProcess(error);
                            }
                        );

                    }
                };
                //
                $scope.subStringForEnvMusicTitle = function (str, $event) {
                    var target = $event.srcElement || $event.target;
                    if (publicFunctions.stringUtil.isNullOrEmpty(str) || publicFunctions.stringUtil.trim(str) == "") {
                        return;
                    }

                    if ($scope.curSelectMusic.item) {

                        if (publicFunctions.stringUtil.lengthForUnicode(str) > 28) {

                            str = publicFunctions.stringUtil.splice(str, target.selectionStart - 1, 1);
                        }

                        $scope.curSelectMusic.item.title = publicFunctions.stringUtil.subForUnicode(str, 28);

                    }
                };
                //
                $scope.showSelfEvnMusicUploadBtn = function () {
                    if ($scope.rangeRows != null && $scope.rangeRows != undefined) {
                        return $scope.rangeRows.range.totalRows < EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC
                    } else {
                        return true;
                    }
                };
                $scope.beyondLimit = function () {
                    publicPopup.alert("可上传的环境音数量已达100个上限", function () {

                    });
                };
                ////////////////
                $scope.bindAudioFileUploader = function () {

                    uploadService.bindAudioFileUploader(
                        {
                            "pickId": ".upload-evn-audio-btn",
                            "multiple": true,
                            fileNumLimit: 9,
                            "fileSingleSizeLimit": 256 * 1024
                        },
                        {
                            fileQueuedBefore: function (files, audioFileUploader) {
                                var cancelUploadFiles = [];
                                var length = files.length > 9 ? 9 : files.length;

                                if ($scope.rangeRows != null && $scope.rangeRows != undefined && $scope.rangeRows.range.totalRows + length > EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC) {

                                    for (var i = EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC - $scope.rangeRows.range.totalRows; i < files.length; i++) {
                                        cancelUploadFiles.push(files[i]);
                                    }

                                    audioFileUploader.removeFiles(cancelUploadFiles);

                                    publicPopup.alert("可上传的环境音数量已达100个上限", function () {

                                    });
                                }

                                editorService.getEditor().loadingStatus = true;
                                //
                                $scope.$apply();
                            },
                            fileQueued: function () {
                                //
                                $scope.$apply();
                            },
                            progress: function () {
                                $scope.$apply();
                            },
                            success: function (successFileInfo) {

                                var fileName;
                                if (publicFunctions.stringUtil.lengthForUnicode(successFileInfo.fileName) > 14) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(successFileInfo.fileName, 14) + "...";
                                } else {
                                    fileName = successFileInfo.fileName;
                                }
                                //
                                var data = {
                                    title: fileName,
                                    text: "上传成功"
                                };

                                uploadPanelObject.pushSuccessFile(data);

                                var audioData = {
                                    title: publicFunctions.stringUtil.subForUnicode(successFileInfo.fileName, 28),
                                    libraryItemTypeCode: "env.music",
                                    providerCode: successFileInfo.providerCode,
                                    extStr01: successFileInfo.duration,
                                    extStr02: successFileInfo.fileSize,
                                    bucketCode: successFileInfo.bucketCode,
                                    fileId: successFileInfo.id
                                };
                                connectService.createSelfLibrary(audioData).then(
                                    function (data) {
                                        //
                                        $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows([data], $scope.rangeRows.rows);
                                        $scope.rangeRows.range = editorFunctions.addRangeRow($scope.rangeRows.range);
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );
                            },
                            finished: function () {

                                editorService.getEditor().loadingStatus = false;

                                if (uploadPanelObject.getSuccessFiles().length >= 9 || uploadPanelObject.getErrorFiles().length > 0) {
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

                                if (message == "文件过大") {
                                    message = "文件过大，最大可上传256kb的音频文件";
                                } else if (message == "文件格式错误") {
                                    message = "文件格式错误,无法上传(仅支持MP3、ogg、wav、m4a)";
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
                        }, editorParam.libAudioUploadSetting
                    );
                };
                /////////////////////
                //
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.EVN_MUSIC_SELECTOR,
                    function (event, data) {
                        //
                        $scope.showEvnMusicSelector = true;
                        //
                        $scope.loadControllerData(EditorConstants.LOAD_MUSIC.SELF);
                    }
                )
            }
        ]
    );

    editorModule.directive("whenScrollEnd", function () {
        return function ($scope, element, attr) {
            element[0].addEventListener("scroll", function () {
                var elementScrollTop = element[0].scrollTop;
                var elementHeight = element[0].offsetHeight;
                var maxScrollHeight = element[0].scrollHeight;
                if ((elementScrollTop + elementHeight) >= maxScrollHeight) {

                    $scope.$apply(attr.whenScrollEnd);
                }
            });
        }
    });
    //
    editorModule.controller(
        "effectMusicSelectorController",
        [
            "$scope", "$timeout", "EditorConstants", "connectService", "publicFunctions", "publicPopup", "editorFunctions", "editorParam", "editorService", "dragBarService", "uploadService", "uploadPanelObject",
            function ($scope, $timeout, EditorConstants, connectService, publicFunctions, publicPopup, editorFunctions, editorParam, editorService, dragBarService, uploadService, uploadPanelObject) {
                //
                $scope.viewAudioUrlAndFilePrefix = null;
                $scope.viewLibraryUrlPrefix = editorParam.libraryBucketOriginalUrlPrefix;
                $scope.viewDefaultUrlPrefix = editorParam.defaultBucketOriginalUrlPrefix;
                //控制模块显隐
                $scope.showEffectMusicSelector = false;
                $scope.effectMusicPlay = false;
                $scope.userLoginStatus = false;
                //
                $scope.libraryItem = null;
                $scope.volume = EditorConstants.AUDIO_VOLUME.EFFECT_MUSIC;
                //
                $scope.curSelectMusic = {
                    code: null,
                    item: null
                };
                //
                $scope.signonProcess = function () {
                    publicPopup.signonProcess();
                };
                //
                var audio = new Audio();
                $scope.previewLibrary = function (item) {
                    $scope.libraryItem = item;

                    if ($scope.musicNameIsModify) {
                        return
                    }

                    if ($scope.effectMusicPlay) {
                        $scope.pause();
                    }

                    if (item != null) {
                        //
                        $scope.play();

                        audio.addEventListener("ended", function () {

                            $scope.effectMusicPlay = false;

                            $scope.$apply();
                        });
                    }
                };
                //
                $scope.play = function () {
                    var isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended
                        && audio.readyState > 2;

                    if (!$scope.effectMusicPlay && !isPlaying) {
                        audio.src = $scope.viewLibraryUrlPrefix + $scope.libraryItem.genericMedias[0].fileId;
                        var playPromise = audio.play();

                        if (playPromise) {
                            playPromise.catch(function (e) {
                                //console.log(e);
                            })
                        }
                    }

                    audio.volume = $scope.volume;
                    $scope.effectMusicPlay = true;

                };
                //
                $scope.pause = function () {
                    if ($scope.effectMusicPlay) {
                        audio.pause();
                        $scope.effectMusicPlay = false;
                    }
                };
                //
                $scope.showAudioControlBtn = function () {
                    return $scope.effectMusicPlay;
                };
                //
                $scope.selectSelfEffectMusic = function ($event, item) {
                    //
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }

                    $scope.curSelectMusic.item = item;
                };
                //
                $scope.cancelSelectEffectMusic = function () {

                    if (!$scope.musicNameIsModify) {
                        $scope.curSelectMusic.item = null;
                    }
                };
                //
                $scope.closeEffectMusic = function () {
                    $scope.showEffectMusicSelector = false;
                    $scope.rangeRows = null;
                    $scope.pause();
                    dragBarService.destroy();
                };
                //
                $scope.saveEffectMusic = function () {
                    var currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx;

                    if ($scope.libraryItem == null) {
                        editorService.removeAction(currentSectionIndex, currentComponentIndex, 0);
                        $scope.closeEffectMusic();
                        return;
                    }

                    var audioNode = new Moboo.DraftNodeOfActionPlayAudio({
                        audio: {
                            bucketCode: $scope.libraryItem.genericMedias[0].bucketCode,
                            duration: $scope.libraryItem.genericMedias[0].extStr01 != null ? $scope.libraryItem.genericMedias[0].extStr01 : 0,
                            name: $scope.libraryItem.title != null ? $scope.libraryItem.title : "",
                            fileSize: $scope.libraryItem.genericMedias[0].extStr02 != null ? $scope.libraryItem.genericMedias[0].extStr02 : 0,
                            uniqueId: $scope.libraryItem.genericMedias[0].fileId != null ? $scope.libraryItem.genericMedias[0].fileId : "",
                            volume: $scope.volume
                        }
                    });

                    if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.ADD_ACTION_PLAY_AUDIO) {
                        editorService.addAction(currentSectionIndex, currentComponentIndex, audioNode);

                    } else if (editorService.getEditor().currentOpsCode == EditorConstants.USER_OPS.MODIFY_ACTION) {
                        editorService.modifyAction(currentSectionIndex, currentComponentIndex, 0, audioNode);
                    }

                    //
                    $scope.closeEffectMusic();
                };
                //
                $scope.generateVolumeBar = function () {
                    dragBarService.load(document.getElementById("effectMusicRangeContainer"));

                    dragBarService.setCurrentPos($scope.volume);

                    dragBarService.onMoveListener(function (volume) {
                        $scope.volume = volume;
                        if ($scope.effectMusicPlay) {
                            $scope.play();
                        }
                    });
                };
                //
                $scope.getLibraryItemByEffectMusic = function () {
                    var returnValue = null,
                        currentEffectMusic = null,
                        currentSectionIndex = editorService.getEditor().currentSectionIdx,
                        currentComponentIndex = editorService.getEditor().currentSectionComponentIdx,
                        actions = editorService.getDraft().node.sections[currentSectionIndex].components[currentComponentIndex].actions;


                    if (actions && actions.length > 0) {
                        for (var i = 0; i < actions.length; i++) {

                            if (actions[i].type === Moboo.DraftConstants.ACTION_TYPE.PLAY_AUDIO) {
                                currentEffectMusic = actions[i];

                                break;
                            }
                        }
                    }

                    if (currentEffectMusic != null) {
                        returnValue = {};

                        returnValue.genericMedias = [{
                            "providerCode": currentEffectMusic.audio.providerCode,
                            "bucketCode": currentEffectMusic.audio.bucketCode,
                            "type": "audio",
                            "fileId": currentEffectMusic.audio.uniqueId,
                            "origin": $scope.viewAudioUrlAndFilePrefix + currentEffectMusic.audio.uniqueId,
                            "extStr01": currentEffectMusic.audio.duration,
                            "extStr02": currentEffectMusic.audio.fileSize
                        }];

                        returnValue.title = currentEffectMusic.audio.name;

                        dragBarService.setCurrentPos(currentEffectMusic.audio.volume);
                        //
                        $scope.volume = currentEffectMusic.audio.volume;

                        return returnValue;
                    } else {
                        $scope.volume = EditorConstants.AUDIO_VOLUME.EFFECT_MUSIC;
                    }

                    return returnValue;
                };

                //
                $scope.loadControllerData = function (type) {
                    $scope.libraryItem = $scope.getLibraryItemByEffectMusic();
                    $scope.generateVolumeBar();

                    $scope.switchEffectMusicType(type);
                };
                //
                $scope.switchEffectMusicType = function (type) {
                    $scope.rangeRows = null;

                    if (type == EditorConstants.LOAD_MUSIC.PUBLIC) {
                        $scope.loadEffectMusics(0, true);
                    } else if (type == EditorConstants.LOAD_MUSIC.SELF) {
                        $scope.loadSelfEffectMusics(0, true);
                    }
                    //
                    $scope.curSelectMusic.code = type;
                };
                //
                $scope.rangeRowsLoading = false;
                $scope.rangeRows = null;
                $scope.rangeSize = 15;
                //
                $scope.loadEffectMusics = function (startRowIdx, append) {
                    $scope.rangeRowsLoading = true;

                    //
                    var endRowIdx = startRowIdx + $scope.rangeSize;
                    if ($scope.rangeRows && endRowIdx > $scope.rangeRows.totalRows) {
                        endRowIdx = $scope.rangeRows.totalRows;
                    }

                    connectService.searchEffectMusics({
                        startRowIdx: startRowIdx,
                        endRowIdx: endRowIdx
                    }).then(
                        function (data) {
                            //
                            if (append && $scope.rangeRows != null) {
                                $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows($scope.rangeRows.rows, data.rows);
                                $scope.rangeRows.range = data.range;
                            } else {

                                $scope.rangeRows = data;
                            }
                            $scope.rangeRowsLoading = false;
                        }, function (data) {
                            $scope.rangeRowsLoading = false;
                            publicPopup.ajaxExceptionProcess(data);
                        },
                        function (error) {
                            $scope.rangeRowsLoading = false;
                            publicPopup.ajaxExceptionProcess(error);
                        }
                    );
                };

                $scope.loadSelfEffectMusics = function (startRowIdx, append) {
                    $scope.rangeRowsLoading = true;

                    if (editorParam.userNo) {
                        //
                        var endRowIdx = startRowIdx + $scope.rangeSize;
                        if ($scope.rangeRows && endRowIdx > $scope.rangeRows.totalRows) {
                            endRowIdx = $scope.rangeRows.totalRows;
                        }

                        connectService.querySelfEffectMusics({
                            startRowIdx: startRowIdx,
                            endRowIdx: endRowIdx
                        }).then(
                            function (data) {
                                //
                                if (append && $scope.rangeRows != null) {
                                    $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows($scope.rangeRows.rows, data.rows);
                                    $scope.rangeRows.range = data.range;
                                } else {

                                    $scope.rangeRows = data;
                                }
                                $scope.rangeRowsLoading = false;
                            }, function (data) {
                                $scope.rangeRowsLoading = false;
                                publicPopup.ajaxExceptionProcess(data);
                            },
                            function (error) {
                                $scope.rangeRowsLoading = false;
                                publicPopup.ajaxExceptionProcess(error);
                            }
                        );
                    } else {
                        $scope.userLoginStatus = true;
                    }
                };
                //
                $scope.nextRangeRows = function (range) {

                    if (range != null && !$scope.rangeRowsLoading) {

                        var startRowIdx = range.endRowIdx + 1;

                        if (startRowIdx <= range.totalRows) {
                            if ($scope.curSelectMusic.code == EditorConstants.LOAD_MUSIC.PUBLIC) {
                                $scope.loadEffectMusics(startRowIdx, true);
                            } else if ($scope.curSelectMusic.code == EditorConstants.LOAD_MUSIC.SELF) {
                                $scope.loadSelfEffectMusics(startRowIdx, true);
                            }
                        }
                    }
                };
                //
                var timer;
                $scope.musicNameIsModify = false;
                //
                $scope.operateSelfEffectMusic = function ($event, index) {
                    var target = $event.srcElement || $event.target;
                    if ($event.stopPropagation && $event.stopPropagation != undefined) {
                        $event.stopPropagation();
                    }
                    //
                    if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.DELETE) {

                        publicPopup.confirm("确定要删除音效" + $scope.curSelectMusic.item.title + "", function (data) {

                            if (data) {
                                connectService.removeSelfLibrary({
                                    itemNo: $scope.curSelectMusic.item.itemNo
                                }).then(
                                    function (data) {
                                        if (data) {
                                            //
                                            $scope.rangeRows.rows = publicFunctions.collectionUtil.removeRow($scope.rangeRows.rows, index);
                                            $scope.rangeRows.range = editorFunctions.removeRangeRow($scope.rangeRows.range);

                                            if ($scope.rangeRows.range.totalRows > $scope.rangeSize && $scope.rangeRows.rows.length < $scope.rangeSize) {
                                                clearTimeout(timer);

                                                timer = setTimeout(function () {
                                                    $scope.nextRangeRows($scope.rangeRows.range);
                                                }, 2000)
                                            }
                                        }
                                        //
                                        $scope.curSelectMusic.item = null;
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );
                            }

                        });

                    } else if (target.getAttribute('data-action') == EditorConstants.DATA_ACTION.MODIFY_SELF_MUSIC) {

                        var element = document.getElementById("effectMusicName" + index + "");

                        element.removeAttribute("readonly");
                        clearTimeout(timer);

                        timer = setTimeout(function () {
                            element.focus();
                        }, 100);

                        $scope.musicNameIsModify = true;

                    }
                };
                //
                $scope.saveSelfMusicOfModify = function (index) {
                    var element = document.getElementById("effectMusicName" + index + "");

                    if ($scope.curSelectMusic.item && publicFunctions.stringUtil.isNullOrEmpty($scope.curSelectMusic.item.title)) {
                        publicPopup.alert("音乐标题不能为空", function () {
                            element.focus();
                        });

                        return;
                    }
                    //
                    if ($scope.curSelectMusic.item) {

                        element.setAttribute("readonly", "readonly");
                        $scope.musicNameIsModify = false;

                        if (publicFunctions.stringUtil.lengthForUnicode($scope.curSelectMusic.item.title) > 28) {

                            $scope.curSelectMusic.item.title = publicFunctions.stringUtil.subForUnicode($scope.curSelectMusic.item.title, 28);
                        }

                        //
                        connectService.modifySelfLibrary({
                            itemNo: $scope.curSelectMusic.item.itemNo,
                            title: $scope.curSelectMusic.item.title,
                            libraryItemTypeCode: "effect.music"
                        }).then(
                            function (data) {

                                if (data) {
                                    //todo
                                }
                            }, function (data) {
                                publicPopup.ajaxExceptionProcess(data);
                            }, function (error) {
                                publicPopup.ajaxExceptionProcess(error);
                            }
                        );

                    }
                };
                //
                $scope.subStringForEffectMusicTitle = function (str, $event) {
                    var target = $event.srcElement || $event.target;
                    if (publicFunctions.stringUtil.isNullOrEmpty(str) || publicFunctions.stringUtil.trim(str) == "") {
                        return;
                    }

                    if ($scope.curSelectMusic.item) {

                        if (publicFunctions.stringUtil.lengthForUnicode(str) > 28) {

                            str = publicFunctions.stringUtil.splice(str, target.selectionStart - 1, 1);
                        }

                        $scope.curSelectMusic.item.title = publicFunctions.stringUtil.subForUnicode(str, 28);

                    }
                };
                //
                $scope.showSelfEffectMusicUploadBtn = function () {
                    if ($scope.rangeRows != null && $scope.rangeRows != undefined) {
                        return $scope.rangeRows.range.totalRows < EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC;
                    } else {
                        return true
                    }
                };
                $scope.beyondLimit = function () {
                    publicPopup.alert("可上传的音效数量已达100个上限", function () {

                    });
                };
                ////////////////
                $scope.bindAudioFileUploader = function () {

                    uploadService.bindAudioFileUploader(
                        {
                            "pickId": ".upload-effect-audio-btn",
                            "multiple": true,
                            fileNumLimit: 9,
                            "fileSingleSizeLimit": 256 * 1024
                        },
                        {
                            fileQueuedBefore: function (files, audioFileUploader) {
                                var cancelUploadFiles = [];
                                var length = files.length > 9 ? 9 : files.length;

                                if ($scope.rangeRows != null && $scope.rangeRows != undefined && $scope.rangeRows.range.totalRows + length > EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC) {

                                    for (var i = EditorConstants.AUDIO_LIMIT_LENGTH.SELF_BG_MUSIC - $scope.rangeRows.range.totalRows; i < files.length; i++) {
                                        cancelUploadFiles.push(files[i]);
                                    }

                                    audioFileUploader.removeFiles(cancelUploadFiles);

                                    publicPopup.alert("可上传的音效数量已达100个上限", function () {

                                    });
                                }

                                //
                                editorService.getEditor().loadingStatus = true;
                                $scope.$apply();
                            },
                            fileQueued: function () {
                                //
                                $scope.$apply();
                            },
                            progress: function () {
                                $scope.$apply();
                            },
                            success: function (successFileInfo) {
                                var fileName;
                                if (publicFunctions.stringUtil.lengthForUnicode(successFileInfo.fileName) > 14) {

                                    fileName = publicFunctions.stringUtil.subForUnicode(successFileInfo.fileName, 14) + "...";
                                } else {
                                    fileName = successFileInfo.fileName;
                                }
                                //
                                var data = {
                                    title: fileName,
                                    text: "上传成功"
                                };

                                uploadPanelObject.pushSuccessFile(data);

                                var audioData = {
                                    title: publicFunctions.stringUtil.subForUnicode(successFileInfo.fileName, 28),
                                    libraryItemTypeCode: "effect.music",
                                    providerCode: successFileInfo.providerCode,
                                    extStr01: successFileInfo.duration,
                                    extStr02: successFileInfo.fileSize,
                                    bucketCode: successFileInfo.bucketCode,
                                    fileId: successFileInfo.id
                                };
                                connectService.createSelfLibrary(audioData).then(
                                    function (data) {
                                        //
                                        $scope.rangeRows.rows = publicFunctions.collectionUtil.appendRows([data], $scope.rangeRows.rows);
                                        $scope.rangeRows.range = editorFunctions.addRangeRow($scope.rangeRows.range);
                                    },
                                    function (data) {
                                        publicPopup.ajaxExceptionProcess(data);
                                    }, function (error) {
                                        publicPopup.ajaxExceptionProcess(error);
                                    }
                                );
                            },
                            finished: function () {

                                editorService.getEditor().loadingStatus = false;

                                if (uploadPanelObject.getSuccessFiles().length >= 9 || uploadPanelObject.getErrorFiles().length > 0
                                ) {
                                    $scope.$emit(
                                        "openModuleWindow",
                                        {
                                            moduleWindowName: EditorConstants.MODULE_WINDOW_NAME.UPLOAD_ERROR
                                        }
                                    );
                                }
                                else {
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

                                if (message == "文件过大") {
                                    message = "文件过大，最大可上传256kb的音频文件";
                                } else if (message == "文件格式错误") {
                                    message = "文件格式错误,无法上传(仅支持MP3、ogg、wav、m4a)";
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
                        }, editorParam.libAudioUploadSetting
                    );
                };
                ////////////////////////
                //the event listener.
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                    }
                );
                //
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.EFFECT_MUSIC_SELECTOR,
                    function (event, data) {
                        $scope.showEffectMusicSelector = true;
                        //
                        $scope.loadControllerData(EditorConstants.LOAD_MUSIC.SELF);
                    }
                )
            }
        ]
    );
    editorModule.controller("uploadErrorController", ["$scope", "uploadPanelObject", "EditorConstants", function ($scope, uploadPanelObject, EditorConstants) {
        //
        $scope.showUploadError = false;
        //
        $scope.hideUploadError = function () {
            $scope.showUploadError = false;
            uploadPanelObject.reset();
        };
        //
        $scope.getUploadFiles = function () {
            return uploadPanelObject.getFiles();
        };
        //
        $scope.getUploadSuccessFiles = function () {
            return uploadPanelObject.getSuccessFiles();
        };
        //
        $scope.getUploadErrorFiles = function () {
            return uploadPanelObject.getErrorFiles();
        };
        ////////////////////////
        //the event listener.
        $scope.$on(
            EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.UPLOAD_ERROR,
            function (event, data) {
                //
                $scope.showUploadError = true;
            }
        );

        $scope.$on(
            EditorConstants.MODULE_WINDOW_OPS.CLOSE + EditorConstants.MODULE_WINDOW_NAME.UPLOAD_ERROR,
            function (event, data) {
                //
                $scope.showUploadError = false;
            }
        );
    }]);

//preview选择module
    editorModule.controller(
        "mobooPreviewController",
        [
            "$scope", "$http", "$timeout", "editorService", "editorParam", "EditorConstants", "publicPopup",
            function ($scope, $http, $timeout, editorService, editorParam, EditorConstants, publicPopup) {
                //
                $scope.viewImageUrlAndFilePrefix = null;
                $scope.viewAudioUrlAndFilePrefix = null;
                //用来控制模块是否显示。
                $scope.show = false;
                //
                $scope.sectionLists = [];
                $scope.sectionLength = 0;
                $scope.currentActiveSection = -1;
                //
                var timer,
                    upBtn = document.getElementById("upBtn"),
                    downBtn = document.getElementById("downBtn"),
                    previewModel = document.getElementsByClassName("editor-preview-wrap")[0];
                //
                $scope.showLoading = function () {
                    //
                    mobooLoading = new Moboo.Loading(document.getElementById("moboo-container"));
                    mobooLoading.start();

                    //create the display scripts element.
                    var mobooScript = document.createElement("script");
                    mobooScript.src = "https://assetlib.moboo.ly/moboo.displayer-" + editorParam.mobooDisplayerVersion + ".min.js";

                    var mobooPageScripts = document.getElementsByTagName("script")[0];
                    mobooPageScripts.parentNode.appendChild(mobooScript);
                };

                //
                $scope.previewDraft = function () {
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
                        //
                        for (var j = 0; j < sections.length; j++) {
                            $scope.sectionLists[j].hasComponent = true;
                        }

                        $scope.sectionLength = sections.length;
                    }

                    //
                    if (!allowPreview) {
                        publicPopup.alert("至少创作一个内容！");
                        return;
                    }

                    //
                    $scope.show = true;

                    //
                    previewModel.style.display = "block";
                    document.body.style.overflow = "hidden";

                    //
                    mobooConfigParam = {
                        episodeContainer: document.getElementById("moboo-container"),
                        assetDisplayDomainUrl: editorParam.assetDisplayDomainUrl,

                        //
                        episodeData: episode,
                        //
                        fileNameDefaultPrefix: editorParam.defaultBucketOriginalUrlPrefix,
                        fileNameLibraryPrefix: editorParam.libraryBucketOriginalUrlPrefix,
                        fileNameMobooPrefix: editorParam.mobooBucketOriginalUrlPrefix + editorService.getDraft().fileNamePrefix.fileId,
                        fileNameCreativePrefix: editorParam.creativeBucketOriginalUrlPrefix + editorService.getDraft().fileNamePrefix.fileId,
                        //
                        episodeCoverData: editorService.getCoverSectionJson(),
                        //
                        supportMouse: true,
                        initSectionIdx: 0,
                        initScrollPosition: 0
                    };

                    mobooListenersParam = {
                        onLoadedListener: function () {
                            if (mobooLoading) {
                                mobooLoading.loadingAssetReady = true;

                                //
                                upBtn.addEventListener("mouseover", $scope.bindUpEvent, false);
                                upBtn.addEventListener("mouseout", $scope.bindUpEvent, false);
                                downBtn.addEventListener("mouseover", $scope.bindDownEvent, false);
                                downBtn.addEventListener("mouseout", $scope.bindDownEvent, false);
                            }
                        },
                        onUserGestureListener: function (param1, param2, sectionIndex) {

                            if (mobooDisplayer !== undefined) {
                                if ((sectionIndex - 1) >= 0) {
                                    $timeout(function () {
                                        $scope.currentActiveSection = sectionIndex - 1;
                                    }, 10);
                                }
                            }
                        }
                    };

                    //
                    $scope.showLoading();
                };
                //
                $scope.playAppointedSection = function (index) {
                    if (mobooDisplayer !== undefined && index <= $scope.sectionLength) {
                        mobooDisplayer.jumpToSection(index);

                        $scope.currentActiveSection = index;
                    }
                };

                $scope.bindUpEvent = function (event) {
                    if (mobooDisplayer !== undefined && event.type == "mouseover") {
                        mobooDisplayer.onScrollStart("wheel");

                        timer = setInterval(
                            function () {
                                mobooDisplayer.onScrolling(2, 2, 3, 'wheel');
                            },
                            30
                        );
                    } else if (mobooDisplayer !== undefined && event.type == "mouseout") {
                        clearInterval(timer);

                        mobooDisplayer.onScrollEnd(2, 10, "wheel");
                    }
                };

                //
                $scope.bindDownEvent = function (event) {
                    if (mobooDisplayer !== undefined && event.type == "mouseover") {
                        mobooDisplayer.onScrollStart("wheel");

                        timer = setInterval(
                            function () {
                                mobooDisplayer.onScrolling(2, 2, -3, 'wheel');
                            },
                            30
                        );
                    } else if (mobooDisplayer !== undefined && event.type == "mouseout") {
                        clearInterval(timer);
                        mobooDisplayer.onScrollEnd(2, 2, "wheel");
                    }

                };

                //
                $scope.removeEvent = function (upBtn, downBtn) {
                    upBtn.removeEventListener("mouseover", $scope.bindUpEvent, false);
                    upBtn.removeEventListener("mouseout", $scope.bindUpEvent, false);
                    downBtn.removeEventListener("mouseover", $scope.bindDownEvent, false);
                    downBtn.removeEventListener("mouseout", $scope.bindDownEvent, false);
                };

                //
                $scope.closePreview = function () {
                    if (mobooDisplayer !== undefined) {
                        $scope.removeEvent(upBtn, downBtn);
                        mobooDisplayer.destroy();

                        $scope.show = false;
                        $scope.currentActiveSection = -1;
                        $scope.sectionLists = [];
                    }

                };

                ////////////////////////
                //the event listener.
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.MOBOO_PREVIEW,
                    function (event, data) {
                        //
                        for (var i = 0; i < 15; i++) {
                            var property = {
                                hasComponent: false
                            };

                            $scope.sectionLists.push(property);
                        }
                        //
                        $scope.previewDraft();
                    }
                );

                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.CLOSE + EditorConstants.MODULE_WINDOW_NAME.MOBOO_PREVIEW,
                    function (event, data) {
                        //
                        $scope.show = false;
                    }
                );

                //
                $scope.$on(
                    EditorConstants.MODEL_UPLOAD_SETTING.COMPLETE,
                    function (event, data) {
                        $scope.viewImageUrlAndFilePrefix = editorParam.imageUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                        $scope.viewAudioUrlAndFilePrefix = editorParam.audioUploadSetting.viewUrlPrefix + editorParam.imageUploadSetting.storeFileNamePrefix;
                    }
                );
            }
        ]
    );

    editorModule.controller(
        "mobooPublishController",
        [
            "$scope", "editorService", "editorParam", "connectService", "EditorConstants", "publicPopup",
            function ($scope, editorService, editorParam, connectService, EditorConstants, publicPopup) {
                //
                $scope.draft = editorService.getEditor().draft;
                //
                $scope.show = false;
                $scope.circleDataLoadedStatus = false;

                $scope.circleList = null;
                $scope.currentCircleItem = null;

                //
                $scope.publishDraftOfCheck = function () {

                    if (editorParam.userNo) {
                        //
                        var allowPublish = true;

                        //
                        if ($scope.draft.node == null || $scope.draft.node.sections == undefined || $scope.draft.node.sections == null || $scope.draft.node.sections.length == 0) {
                            allowPublish = false;
                        }

                        //
                        if (allowPublish) {
                            var hasComponent = false;
                            for (var i = 0; i < $scope.draft.node.sections.length; i++) {
                                if ($scope.draft.node.sections[i].components != undefined && $scope.draft.node.sections[i].components != null && $scope.draft.node.sections[i].components.length > 0) {
                                    hasComponent = true;
                                    break;
                                }
                            }

                            allowPublish = hasComponent;
                        }

                        //
                        if (!allowPublish) {
                            publicPopup.alert("至少创作一个内容！");
                            return;
                        }

                        if ($scope.draft.title === null || $scope.draft.title === "") {
                            publicPopup.alert("请输入Moboo标题!");
                            return;
                        }

                        if ($scope.draft.cover === null || $scope.draft.cover.fileId === null || $scope.draft.cover.fileId === "") {
                            publicPopup.alert("请上传Moboo封面!");
                            return;
                        }

                        if (editorParam.circles !== null) {
                            $scope.currentCircleItem = editorParam.circles[0];
                            //
                            if ($scope.currentCircleItem) {
                                $scope.publishDraft();
                            }
                        } else {
                            $scope.show = true;
                            $scope.loadCircleData();
                        }
                    } else {
                        publicPopup.signonProcess();
                    }
                };
                //
                $scope.loadCircleData = function () {
                    if (editorParam.userNo && $scope.circleList === null) {
                        connectService.queryCircles({
                            sortField: "article.episode"
                        }).then(
                            function (data) {
                                $scope.circleList = data;
                            },
                            function (error) {

                            }
                        )
                    }
                };
                //
                $scope.select = function (circleItem) {
                    if (circleItem && circleItem.allowPublishMoboo) {
                        $scope.currentCircleItem = circleItem;
                    }
                };

                //
                $scope.cancelPublish = function () {
                    $scope.show = false;
                };

                //
                $scope.publishDraft = function () {
                    var circleNoValues = [{
                        no: $scope.currentCircleItem.circleNo,
                        value: $scope.currentCircleItem.title
                    }];

                    var publishDraftData = {
                        "draftNo": $scope.draft.draftNo,
                        "title": $scope.draft.title,
                        "subtitle": $scope.draft.subtitle,
                        "formatTypeCode": $scope.draft.formatTypeCode,
                        "bodyText": $scope.draft.bodyText,
                        "providerCode": $scope.draft.cover.providerCode,
                        "coverFileId": $scope.draft.cover != null ? $scope.draft.cover.fileId : null,
                        "coverAve": $scope.draft.cover != null && $scope.draft.cover.ave != null ? $scope.draft.cover.ave.ave : null,
                        "coverResolution": $scope.draft.cover != null && $scope.draft.cover.resolution != null ? $scope.draft.cover.resolution.width + "*" + $scope.draft.cover.resolution.height : null,
                        "bucketCode": $scope.draft.cover.bucketCode,
                        "categoryId": -1,
                        "tagIdValues": [],
                        "circleNoValues": circleNoValues
                    };

                    connectService.publishDraft(publishDraftData).then(
                        function (data) {
                            if (data) {

                                $scope.show = false;
                                //
                                window.location.href = editorParam.apiDomainPrefix + editorParam.apiUrlUserArticleList;
                            } else {
                                publicPopup.alert("投稿失败");
                            }
                        },
                        function (error) {

                        }
                    )

                };

                ////////////////////////
                //the event listener.
                $scope.$on(
                    EditorConstants.MODULE_WINDOW_OPS.OPEN + EditorConstants.MODULE_WINDOW_NAME.MOBOO_PUBBLISH,
                    function (event, data) {
                        $scope.publishDraftOfCheck();
                    }
                );
            }
        ]
    );
}