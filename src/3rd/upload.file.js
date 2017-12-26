var FileUploader = FileUploader || {};

FileUploader.UploadImage = function (configObj, imageUploadSetting) {

    this.uploadSetting = {};

    this.uploader = null;

    this.ratio = window.devicePixelRatio || 1;

    //
    this.init(configObj, imageUploadSetting);
}

FileUploader.UploadImage.prototype = {
    constructor: FileUploader.UploadImage,

    //
    uploadSetting: null,
    fileQueuedCallbackFunction: null,
    successCallbackFunction: null,
    progressCallbackFunction: null,
    errorCallbackFunction: null,
    init: function (configObj, imageUploadSetting) {
        this.uploadSetting = imageUploadSetting;

        this.config = {
            pickId: configObj.pickId || document.body,

            auto: configObj.auto != undefined && typeof configObj.auto == "boolean" ? configObj.auto : true,
            // 缩略图大小
            thumbnailWidth: configObj.thumbnailWidth != undefined && !isNaN(configObj.thumbnailWidth) && configObj.thumbnailWidth > 0 ? configObj.thumbnailWidth : 100 * this.ratio,
            thumbnailHeight: configObj.thumbnailHeight != undefined && !isNaN(configObj.thumbnailHeight) && configObj.thumbnailHeight > 0 ? configObj.thumbnailHeight : 100 * this.ratio,

            //
            multiple: configObj.multiple != undefined && typeof configObj.multiple == "boolean" ? configObj.multiple : true,
            isEditor: configObj.isEditor != undefined && typeof configObj.isEditor == "boolean" ? configObj.isEditor : false,//是否DRAFT编辑器内使用
            chunked: configObj.chunked != undefined && typeof configObj.chunked == "boolean" ? configObj.chunked : false,//分片上传
            fileNumLimit: configObj.fileNumLimit != undefined && !isNaN(configObj.fileNumLimit) && configObj.fileNumLimit > 0 ? configObj.fileNumLimit : null,

            //单个文件的限制,单位B
            fileSingleSizeLimit: configObj.fileSingleSizeLimit != undefined && !isNaN(configObj.fileSingleSizeLimit) && configObj.fileSingleSizeLimit > 0 ? configObj.fileSingleSizeLimit : undefined,
            //总文件大小限制
            fileSizeLimit: configObj.fileSizeLimit != undefined && !isNaN(configObj.fileSizeLimit) && configObj.fileSizeLimit > 0 ? configObj.fileSizeLimit : undefined,
            //拖拽
            dnd: configObj.dnd || undefined,
            disableGlobalDnd: configObj.disableGlobalDnd != undefined && typeof configObj.disableGlobalDnd == "boolean" ? configObj.disableGlobalDnd : false,

            //支持文件重复
            duplicate: configObj.duplicate != undefined && typeof configObj.duplicate == "boolean" ? configObj.duplicate : true
        }

    }, load: function () {
        //
        this.uploader = WebUploader.create({
            // 自动上传。
            auto: this.config.auto,
            // swf文件路径
            swf: '/static/src/Uploader.swf',
            // 文件接收服务端。
            server: this.uploadSetting.uploadUrl,
            //拖拽
            dnd: this.config.dnd,
            disableGlobalDnd: this.config.disableGlobalDnd,
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id: this.config.pickId,
                multiple: this.config.multiple //默认为true，就是可以多选
            },
            // 只允许选择文件，可选。
            accept: {
                title: 'Images',
                extensions: 'jpg,jpeg,png',
                mimeTypes: 'image/jpg,image/jpeg,image/png'   //修改这行
            },
            // 上传文件个数
            // fileNumLimit: this.config.fileNumLimit,
            fileSingleSizeLimit: this.config.fileSingleSizeLimit,
            fileSizeLimit: this.config.fileSizeLimit,
            // 全局设置, 文件上传请求的参数表，每次发送都会发送此对象中的参数。
            //formData: {
            //    token: this.uploadSetting.uploadToken
            //},
            // compress: null,
            compress: {
                width: 10000,
                height: 10000,
                // 图片质量，只有type为`image/jpeg`的时候才有效。
                quality: 90,

                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,

                // 是否允许裁剪。
                crop: false,

                // 是否保留头部meta信息。
                preserveHeaders: true,

                // 如果发现压缩后文件大小比原来还大，则使用原来图片
                // 此属性可能会影响图片自动纠正功能
                noCompressIfLarger: false,

                // 单位字节，如果图片大小小于此值，不会采用压缩。
                compressSize: 0
            },
            //
            chunked: this.config.chunked,

            duplicate: this.config.duplicate//支持文件重复
        });

        //
        this.startUpload(this.startCallbackFunction);
        //  this.stopUpload(stopUploadFunction);
        this.uploadFinished(this.finishedUploadFunction);

        this.uploadBeforeSend();

        //
        this.fileQueuedBefore();
        this.fileQueued(this.fileQueuedBeforeCallbackFunction, this.fileQueuedCallbackFunction, this.thumbCallbackFun);
        this.uploadSuccess(this.successCallbackFunction);
        this.uploadProgress(this.progressCallbackFunction);
        this.uploadError(this.uploadErrorCallbackFunction);
        this.error(this.errorCallbackFunction);
    },
    setCallbackFunction: function (callbackFunction) {
        this.startCallbackFunction = callbackFunction.start;
        this.finishedUploadFunction = callbackFunction.finished;

        this.fileQueuedBeforeCallbackFunction = callbackFunction.fileQueuedBefore;
        this.fileQueuedCallbackFunction = callbackFunction.fileQueued;

        //
        this.thumbCallbackFun = callbackFunction.thumb;

        //
        this.successCallbackFunction = callbackFunction.success;
        this.progressCallbackFunction = callbackFunction.progress;
        this.uploadErrorCallbackFunction = callbackFunction.uploadError;
        this.errorCallbackFunction = callbackFunction.error;
    },
    fileQueuedBefore: function () {
        var that = this;

        that.uploader.on('beforeFileQueued', function (file) {
            //
            if (file != undefined && file != null && file.ext == "") {
                if (that.errorCallbackFunction) {
                    that.errorCallbackFunction("文件后缀错误", file);
                }

                return false;
            }
        });
    },
    fileQueued: function (queuedBeforeCallbackFunction, queuedCallbackFun, thumbCallbackFun) {
        var that = this;

        if (that.config.multiple) {
            that.uploader.on('filesQueued', function (files) {
                if (queuedBeforeCallbackFunction) {
                    queuedBeforeCallbackFunction(files);
                }

                if (that.config.fileNumLimit && files.length > that.config.fileNumLimit) {
                    that.removeFiles(files.slice(that.config.fileNumLimit, files.length));
                    files = files.slice(0, that.config.fileNumLimit);
                }

                //
                var uploadedFilesInfo = {
                    fileNum: files.length,
                    files: []
                };

                //
                for (var i = 0; i < files.length; i++) {
                    uploadedFilesInfo.files.push({"fileName": files[i].name, "fileId": files[i].id});
                }

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo, thumbCallbackFun);

                    //
                    for (var i = 0; i < files.length; i++) {
                        that.makeThumb(files[i], thumbCallbackFun)
                    }
                }

                //
                for (var i = 0; i < files.length; i++) {
                    that.makeThumb(files[i], thumbCallbackFun)
                }

            });
        } else {
            that.uploader.on('fileQueued', function (file) {

                //
                if (queuedBeforeCallbackFunction) {
                    queuedBeforeCallbackFunction([file]);
                }

                var uploadedFilesInfo = {
                    fileNum: 1,
                    files: []
                };

                //
                uploadedFilesInfo.files.push({"fileName": file.name, "fileId": file.id});

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }


                //
                if (queuedCallbackFun) {
                    queuedCallbackFun();
                }

                //
                if (thumbCallbackFun) {
                    that.makeThumb(file, thumbCallbackFun);
                }
            });
        }
    }
    ,
    makeThumb: function (file, thumbCallbackFun) {
        this.uploader.makeThumb(file, function (error, src) {
            if (error) {
                return;
            }

            if (thumbCallbackFun) {
                var uploadedFilesInfo = {
                    fileId: file.id,
                    fileName: file.name,
                    thumbUrl: src
                };
                thumbCallbackFun(uploadedFilesInfo);
            }

        }, this.config.thumbnailWidth, this.config.thumbnailHeight);
    }
    ,
    startUpload: function (startCallbackFunction) {
        this.uploader.on('startUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    }
    ,
    stopUpload: function (startCallbackFunction) {
        this.uploader.on('stopUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    }
    ,
    uploadFinished: function (finishedCallbackFunction) {
        this.uploader.on('uploadFinished', function () {

            if (finishedCallbackFunction) {
                finishedCallbackFunction();
            }
        });

    }
    ,
    uploadBeforeSend: function () {
        var storeFileNamePrefix = this.uploadSetting.storeFileNamePrefix;
        //局部设置，给每个独立的文件上传请求参数设置，每次发送都会发送此对象中的参数
        var that = this;
        that.uploader.on('uploadBeforeSend', function (block, data, headers) {
            // file为分块对应的file对象。
            data.file = block.file;

            var storeFileFullName = null;
            var suffix = null;

            if (block.file.name.lastIndexOf(".") >= 0) {
                suffix = block.file.name.substr(block.file.name.lastIndexOf("."))
            }
            var nowDate = new Date();

            var year = nowDate.getFullYear();
            var month = nowDate.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var day = nowDate.getDate();
            if (day < 10) {
                day = "0" + day;
            }

            //
            if (storeFileFullName == null && suffix !== null) {
                if (that.config.isEditor) {
                    storeFileFullName = storeFileNamePrefix + MobooLib.Functions.generateGUID(16, 64, true) + suffix.toLowerCase();
                } else {
                    storeFileFullName = storeFileNamePrefix + year + '-' + month + '-' + day + '-' + MobooLib.Functions.generateGUID(12, 64, true) + suffix.toLowerCase();
                }
            }

            data.key = storeFileFullName;
            data.token = that.uploadSetting.uploadToken;
        });
    }
    ,
    uploadProgress: function (progressCallbackFunction) {
        var uploadStartTime = new Date().getTime();
        var uploadTime = 0;
        var uploadFileSize = 0;
        var loaded = 0;

        this.uploader.on('uploadProgress', function (file, percentage) {
            uploadTime = new Date().getTime() - uploadStartTime;
            uploadFileSize = file.size;
            loaded = uploadFileSize * percentage;

            var progressInfo = {
                "fileName": file.name,
                "fileId": file.id,
                "percent": Math.ceil(percentage * 100),
                "speed": Math.ceil(loaded / uploadTime * 1000 * 10 / 1024 / 1024) / 10,//M/s
                "spentTime": Math.ceil(uploadTime),
                "remainTime": loaded > 0 ? Math.ceil(uploadTime * (uploadFileSize - loaded) / loaded / 1000) : 0,//秒
                "totalSize": Math.ceil(uploadFileSize * 10 / 1024 / 1024) / 10,//M 保留一位小数
                "uploadedSize": Math.ceil(loaded * 10 / 1024 / 1024) / 10
            };

            if (progressInfo.percent > 100) {
                $.extend(progressInfo, {"percent": 100})
            }
            //console.log(percentage);
            //console.log("progressInfo=" + JSON.stringify(progressInfo));
            //
            if (progressCallbackFunction) {
                progressCallbackFunction(progressInfo);
            }
        });
    }
    ,
    uploadSuccess: function (successCallbackFunction) {
        var uploadSetting = this.uploadSetting;

        var width = 0;
        var height = 0;
        this.uploader.on('uploadSuccess', function (file, response) {
            var data = response;
            var byteSize = data.fsize;

            //
            if (successCallbackFunction) {
                var uploadedFileInfo = {
                    fileName: file.name,
                    fileId: file.id,
                    origin: uploadSetting.viewUrlPrefix + data.key,
                    id: data.key,
                    providerCode: uploadSetting.providerCode,
                    bucketCode: uploadSetting.bucketCode,
                    fileSize: Math.ceil(byteSize / 1024),
                    width: width,
                    height: height,
                    "mediaType": data.mediaType.code
                };

                if (data.mediaType != undefined && data.mediaType != null) {
                    //image
                    if ("image" == data.mediaType.code) {
                        var uploadedImageInfo = {
                            width: data.w,
                            height: data.h,
                            ave: data.ave
                        };

                        //
                        $.extend(uploadedFileInfo, uploadedImageInfo);
                    } else if ("audio" == data.mediaType.code) {
                        var uploadedAudioInfo = {
                            duration: data.duration
                        };

                        //
                        $.extend(uploadedFileInfo, uploadedAudioInfo);
                    } else if ("video" == data.mediaType.code) {
                        var uploadedVideoInfo = {
                            duration: data.duration,
                            width: data.w,
                            height: data.h
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedVideoInfo);
                    }
                }

                //
                var storeFileNamePrefix = uploadSetting.storeFileNamePrefix;
                if (storeFileNamePrefix != null) {
                    var storeFileInfo = {
                        "prefixed": storeFileNamePrefix,
                        "uniqueId": uploadedFileInfo.id.replace(storeFileNamePrefix, "")
                    }
                    $.extend(uploadedFileInfo, storeFileInfo);
                }

                //console.log("uploadedFileInfo=" + JSON.stringify(uploadedFileInfo));
                successCallbackFunction(uploadedFileInfo);
            }
        });

        this.uploader.reset();
    }
    ,
    uploadComplete: function (callbackFunction) {
        this.uploader.on('uploadComplete', function (file) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    }
    ,
    uploadError: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('uploadError', function (file, reason) {
            //文件上传失败，重新加上上传本文件
            //文件上传失败，重新加上上传本文件
            console.log("uploadError start" + reason);
            console.log("uploadError end ");

            if (reason != "abort" && reason != "http" && reason != "server") {
                //重新加入文件
                thatThis.uploader.addFiles(file);
            } else {
                if (errorCallbackFunction) {
                    errorCallbackFunction(file);
                }
            }
        });
    },
    error: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('error', function (stateCode, stateId, file) {
            var stateInf = "";
            if (stateCode == "Q_TYPE_DENIED") {
                stateInf += "文件格式错误";
            } else if (stateCode == "F_EXCEED_SIZE") {
                stateInf += "文件过大";
            } else if (stateCode == "Q_EXCEED_NUM_LIMIT") {
                stateInf += "文件添加数量过多";
            } else if (stateCode == "Q_EXCEED_SIZE_LIMIT") {
                stateInf += "文件添加文件的总大小过大";
            }
            console.log("error=" + stateInf);
            console.log(file);
            errorCallbackFunction(stateInf, file);
        });
    },
    uploadAccept: function (callbackFunction) {
        this.uploader.on('uploadAccept', function (file, response) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    }
    ,
    upload: function (callbackFunction) {
        //非自动上传时使用
        this.uploader.upload();
        if (callbackFunction) {
            callbackFunction();
        }
    }
    ,
    removeFiles: function (files) {

        for (var i = 0; i < files.length; i++) {
            this.uploader.removeFile(files[i], true);
        }
    }
    ,
    removeFilesById: function (ids) {
        for (var i = 0; i < ids.length; i++) {
            this.uploader.removeFile(ids[i], true);
        }
    }
    ,
    isMultiple: function () {

        return this.config.multiple;
    }
    ,
    setMultiple: function (multiple) {

        if (typeof  multiple == 'boolean') {
            this.config.multiple = multiple;
        }
    }
    ,
    setFileNumLimit: function (fileNumLimit) {
        this.config.fileNumLimit = fileNumLimit;
    }
}


FileUploader.UploadAudio = function (configObj, audioUploadSetting) {

    this.uploadSetting = {};

    this.uploader = null;

    this.init(configObj, audioUploadSetting);
}

//
FileUploader.UploadAudio.prototype = {
    constructor: FileUploader.UploadAudio,

    //
    uploadSetting: null,
    fileQueuedCallbackFunction: null,
    successCallbackFunction: null,
    progressCallbackFunction: null,
    errorCallbackFunction: null,
    init: function (configObj, audioUploadSetting) {
        //
        this.uploadSetting = audioUploadSetting;

        this.config = {
            pickId: configObj.pickId || document.body,

            auto: configObj.auto != undefined && typeof configObj.auto == "boolean" ? configObj.auto : true,
            // 缩略图大小
            thumbnailWidth: configObj.thumbnailWidth != undefined && !isNaN(configObj.thumbnailWidth) && configObj.thumbnailWidth > 0 ? configObj.thumbnailWidth : 100 * this.ratio,
            thumbnailHeight: configObj.thumbnailHeight != undefined && !isNaN(configObj.thumbnailHeight) && configObj.thumbnailHeight > 0 ? configObj.thumbnailHeight : 100 * this.ratio,

            //
            multiple: configObj.multiple != undefined && typeof configObj.multiple == "boolean" ? configObj.multiple : true,
            isEditor: configObj.isEditor != undefined && typeof configObj.isEditor == "boolean" ? configObj.isEditor : false,//是否DRAFT编辑器内使用
            chunked: configObj.chunked != undefined && typeof configObj.chunked == "boolean" ? configObj.chunked : false,//分片上传
            fileNumLimit: configObj.fileNumLimit != undefined && !isNaN(configObj.fileNumLimit) && configObj.fileNumLimit > 0 ? configObj.fileNumLimit : null,
            //单个文件的限制,单位B
            fileSingleSizeLimit: configObj.fileSingleSizeLimit != undefined && !isNaN(configObj.fileSingleSizeLimit) && configObj.fileSingleSizeLimit > 0 ? configObj.fileSingleSizeLimit : undefined,
            //总文件大小限制
            fileSizeLimit: configObj.fileSizeLimit != undefined && !isNaN(configObj.fileSizeLimit) && configObj.fileSizeLimit > 0 ? configObj.fileSizeLimit : undefined,

            //拖拽
            dnd: configObj.dnd || undefined,
            disableGlobalDnd: configObj.disableGlobalDnd != undefined && typeof configObj.disableGlobalDnd == "boolean" ? configObj.disableGlobalDnd : false,

            //支持文件重复
            duplicate: configObj.duplicate != undefined && typeof configObj.duplicate == "boolean" ? configObj.duplicate : true
        }

    },
    setCallbackFunction: function (callbackFunction) {
        //
        this.startCallbackFunction = callbackFunction.start;
        this.finishedUploadFunction = callbackFunction.finished;

        //
        this.fileQueuedBeforeCallbackFunction = callbackFunction.fileQueuedBefore;
        this.fileQueuedCallbackFunction = callbackFunction.fileQueued;

        //
        this.successCallbackFunction = callbackFunction.success;
        this.progressCallbackFunction = callbackFunction.progress;
        this.uploadErrorCallbackFunction = callbackFunction.uploadError;
        this.errorCallbackFunction = callbackFunction.error;
    }, load: function () {
        this.uploader = WebUploader.create({
            // 自动上传。
            auto: this.config.auto,
            // swf文件路径
            swf: '/static/src/Uploader.swf',
            // 文件接收服务端。
            server: this.uploadSetting.uploadUrl,
            //拖拽
            dnd: this.config.dnd,
            disableGlobalDnd: this.config.disableGlobalDnd,
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id: this.config.pickId,
                multiple: this.config.multiple //默认为true，就是可以多选
            },
            // 只允许选择文件，可选。
            accept: {
                title: 'Audios',
                extensions: 'MP3,Wav,Ogg,m4a',
                mimeTypes: 'audio/mp3,audio/wav,audio/ogg,audio/mp4'   //修改这行
            },
            // 上传文件个数
            fileSingleSizeLimit: this.config.fileSingleSizeLimit,
            fileSizeLimit: this.config.fileSizeLimit,
            //fileNumLimit: this.config.fileNumLimit,
            // 全局设置, 文件上传请求的参数表，每次发送都会发送此对象中的参数。
            //formData: {
            //    token: this.uploadSetting.uploadToken
            //},
            chunked: this.config.chunked,
            duplicate: this.config.duplicate//支持文件重复
        });

        //
        this.startUpload(this.startCallbackFunction);
        // this.stopUpload(stopUploadFunction);
        this.uploadFinished(this.finishedUploadFunction);

        this.uploadBeforeSend();

        //
        this.fileQueuedBefore();
        this.fileQueued(this.fileQueuedBeforeCallbackFunction, this.fileQueuedCallbackFunction);
        this.uploadSuccess(this.successCallbackFunction);
        this.uploadProgress(this.progressCallbackFunction);
        this.uploadError(this.uploadErrorCallbackFunction);
        this.error(this.errorCallbackFunction);
    },
    fileQueuedBefore: function () {
        var that = this;

        that.uploader.on('beforeFileQueued', function (file) {
            //
            if (file != undefined && file != null && file.ext == "") {
                if (that.errorCallbackFunction) {
                    that.errorCallbackFunction("文件后缀错误", file);
                }

                return false;
            }
        });
    },
    fileQueued: function (queuedBeforeCallbackFun, queuedCallbackFun) {
        var that = this;

        if (that.config.multiple) {
            that.uploader.on('filesQueued', function (files) {

                //
                if (queuedBeforeCallbackFun) {
                    queuedBeforeCallbackFun(files);
                }

                if (that.config.fileNumLimit && files.length > that.config.fileNumLimit) {
                    that.removeFiles(files.slice(that.config.fileNumLimit, files.length));
                    files = files.slice(0, that.config.fileNumLimit);
                }

                //
                var uploadedFilesInfo = {
                    fileNum: files.length,
                    files: []
                };

                //
                for (var i = 0; i < files.length; i++) {
                    uploadedFilesInfo.files.push({"fileName": files[i].name, "fileId": files[i].id});
                }

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }
            });
        } else {
            that.uploader.on('fileQueued', function (file) {
                //
                if (queuedBeforeCallbackFun) {
                    queuedBeforeCallbackFun([file]);
                }

                var uploadedFilesInfo = {
                    fileNum: 1,
                    files: []
                };

                //
                uploadedFilesInfo.files.push({"fileName": file.name, "fileId": file.id});

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }
            });
        }
    }, startUpload: function (startCallbackFunction) {
        this.uploader.on('startUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    }, stopUpload: function (startCallbackFunction) {
        this.uploader.on('stopUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    }, uploadFinished: function (finishedCallbackFunction) {
        this.uploader.on('uploadFinished', function () {
            if (finishedCallbackFunction) {
                finishedCallbackFunction();
            }
        });

    },
    uploadBeforeSend: function () {
        var storeFileNamePrefix = this.uploadSetting.storeFileNamePrefix;
        var that = this;
        //局部设置，给每个独立的文件上传请求参数设置，每次发送都会发送此对象中的参数
        that.uploader.on('uploadBeforeSend', function (block, data, headers) {
            // file为分块对应的file对象。
            data.file = block.file;

            var storeFileFullName = null;
            var suffix = null;

            if (block.file.name.lastIndexOf(".") >= 0) {
                suffix = block.file.name.substr(block.file.name.lastIndexOf("."))
            }

            var nowDate = new Date();

            var year = nowDate.getFullYear();
            var month = nowDate.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var day = nowDate.getDate();
            if (day < 10) {
                day = "0" + day;
            }

            //
            if (storeFileFullName == null && suffix !== null) {
                if (that.config.isEditor) {
                    storeFileFullName = storeFileNamePrefix + MobooLib.Functions.generateGUID(16, 64, true) + suffix.toLowerCase();
                } else {
                    storeFileFullName = storeFileNamePrefix + year + '-' + month + '-' + day + '-' + MobooLib.Functions.generateGUID(12, 64, true) + suffix.toLowerCase();
                }
            }

            data.key = storeFileFullName;
            data.token = that.uploadSetting.uploadToken;
        });
    }

    ,
    uploadProgress: function (progressCallbackFunction) {
        var uploadStartTime = new Date().getTime();
        var uploadTime = 0;
        var uploadFileSize = 0;
        var loaded = 0;

        this.uploader.on('uploadProgress', function (file, percentage) {
            uploadTime = new Date().getTime() - uploadStartTime;
            uploadFileSize = file.size;
            loaded = uploadFileSize * percentage;

            var progressInfo = {
                "fileName": file.name,
                "fileId": file.id,
                "percent": Math.ceil(percentage * 100),
                "speed": Math.ceil(loaded / uploadTime * 1000 * 10 / 1024 / 1024) / 10,//M/s
                "spentTime": Math.ceil(uploadTime),
                "remainTime": loaded > 0 ? Math.ceil(uploadTime * (uploadFileSize - loaded) / loaded / 1000) : 0,//秒
                "totalSize": Math.ceil(uploadFileSize * 10 / 1024 / 1024) / 10,//M 保留一位小数
                "uploadedSize": Math.ceil(loaded * 10 / 1024 / 1024) / 10
            };

            if (progressInfo.percent > 100) {
                $.extend(progressInfo, {"percent": 100})
            }
            // console.log(percentage);
            //  console.log("progressInfo=" + JSON.stringify(progressInfo));
            //
            if (progressCallbackFunction) {
                progressCallbackFunction(progressInfo);
            }
        });
    }
    ,
    uploadSuccess: function (successCallbackFunction) {
        var uploadSetting = this.uploadSetting;

        var width = 0;
        var height = 0;
        this.uploader.on('uploadSuccess', function (file, response) {
            var data = response;
            var byteSize = data.fsize;

            //
            if (successCallbackFunction != null) {
                var uploadedFileInfo = {
                    "fileName": file.name,
                    "fileId": file.id,
                    "origin": uploadSetting.viewUrlPrefix + data.key,
                    "id": data.key,
                    "providerCode": uploadSetting.providerCode,
                    "bucketCode": uploadSetting.bucketCode,
                    "fileSize": Math.ceil(byteSize / 1024),
                    "width": width,
                    "height": height
                };

                if (data.mediaType != undefined && data.mediaType != null) {
                    //image
                    if ("image" == data.mediaType.code) {
                        var uploadedImageInfo = {
                            width: data.w,
                            height: data.h,
                            ave: data.ave
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedImageInfo);
                    } else if ("audio" == data.mediaType.code) {
                        var uploadedAudioInfo = {
                            duration: data.duration
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedAudioInfo);
                    } else if ("video" == data.mediaType.code) {
                        var uploadedVideoInfo = {
                            duration: data.duration,
                            width: data.w,
                            height: data.h
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedVideoInfo);
                    }
                }

                //
                var storeFileNamePrefix = uploadSetting.storeFileNamePrefix;
                if (storeFileNamePrefix != null) {
                    var storeFileInfo = {
                        "prefixed": storeFileNamePrefix,
                        "uniqueId": uploadedFileInfo.id.replace(storeFileNamePrefix, "")
                    }
                    $.extend(uploadedFileInfo, storeFileInfo);
                }

                //  console.log("uploadedFileInfo=" + JSON.stringify(uploadedFileInfo));
                successCallbackFunction(uploadedFileInfo);
            }
        });

        this.uploader.reset();
    }
    ,
    uploadComplete: function (callbackFunction) {
        this.uploader.on('uploadComplete', function (file) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    }
    ,
    uploadError: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('uploadError', function (file, reason) {
            //文件上传失败，重新加上上传本文件
            //文件上传失败，重新加上上传本文件
            console.log("uploadError start" + reason);
            console.log("uploadError end ");

            if (reason != "abort" && reason != "http" && reason != "server") {
                //重新加入文件
                thatThis.uploader.addFiles(file);
            } else {
                if (errorCallbackFunction) {
                    errorCallbackFunction(file);
                }
            }
        });
    }, error: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('error', function (stateCode, stateId, file) {
            var stateInf = "";
            console.log(stateCode)
            if (stateCode == "Q_TYPE_DENIED") {
                stateInf += "文件格式错误";
            } else if (stateCode == "F_EXCEED_SIZE") {
                stateInf += "文件过大";
            } else if (stateCode == "Q_EXCEED_NUM_LIMIT") {
                stateInf += "文件添加数量过多";
            } else if (stateCode == "Q_EXCEED_SIZE_LIMIT") {
                stateInf += "文件添加文件的总大小过大";
            }
            console.log("error=" + stateInf);
            console.log(file);
            errorCallbackFunction(stateInf, file);
        });
    }
    ,
    uploadAccept: function (callbackFunction) {
        this.uploader.on('uploadAccept', function (file, response) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    }
    ,
    upload: function (callbackFunction) {
        //非自动上传时使用
        this.uploader.upload();
        if (callbackFunction) {
            callbackFunction();
        }
    }, removeFiles: function (files) {

        for (var i = 0; i < files.length; i++) {
            this.uploader.removeFile(files[i], true);
        }
    },
    removeFilesById: function (ids) {
        for (var i = 0; i < ids.length; i++) {
            this.uploader.removeFile(ids[i], true);
        }
    },
    isMultiple: function () {

        return this.config.multiple;
    }, setMultiple: function (multiple) {

        if (typeof  multiple == 'boolean') {
            this.config.multiple = multiple;
        }
    }, setFileNumLimit: function (fileNumLimit) {
        this.config.fileNumLimit = fileNumLimit;
    }
}


FileUploader.UploadVideo = function (configObj, uploadSetting) {

    this.uploadSetting = {};

    this.uploader = null;
    //
    this.init(configObj, uploadSetting);
}

//
FileUploader.UploadVideo.prototype = {
    constructor: FileUploader.UploadVideo,

    //
    uploadSetting: null,
    fileQueuedCallbackFunction: null,
    successCallbackFunction: null,
    progressCallbackFunction: null,
    errorCallbackFunction: null,
    init: function (configObj, videoUploadSetting) {
        this.uploadSetting = videoUploadSetting;

        this.config = {
            pickId: configObj.pickId || document.body,

            auto: configObj.auto != undefined && typeof configObj.auto == "boolean" ? configObj.auto : true,
            // 缩略图大小
            thumbnailWidth: configObj.thumbnailWidth != undefined && !isNaN(configObj.thumbnailWidth) && configObj.thumbnailWidth > 0 ? configObj.thumbnailWidth : 100 * this.ratio,
            thumbnailHeight: configObj.thumbnailHeight != undefined && !isNaN(configObj.thumbnailHeight) && configObj.thumbnailHeight > 0 ? configObj.thumbnailHeight : 100 * this.ratio,

            //
            multiple: configObj.multiple != undefined && typeof configObj.multiple == "boolean" ? configObj.multiple : true,
            isEditor: configObj.isEditor != undefined && typeof configObj.isEditor == "boolean" ? configObj.isEditor : false,//是否DRAFT编辑器内使用
            chunked: configObj.chunked != undefined && typeof configObj.chunked == "boolean" ? configObj.chunked : false,//分片上传
            fileNumLimit: configObj.fileNumLimit != undefined && !isNaN(configObj.fileNumLimit) && configObj.fileNumLimit > 0 ? configObj.fileNumLimit : null,
            //单个文件的限制,单位B
            fileSingleSizeLimit: configObj.fileSingleSizeLimit != undefined && !isNaN(configObj.fileSingleSizeLimit) && configObj.fileSingleSizeLimit > 0 ? configObj.fileSingleSizeLimit : undefined,
            //总文件大小限制
            fileSizeLimit: configObj.fileSizeLimit != undefined && !isNaN(configObj.fileSizeLimit) && configObj.fileSizeLimit > 0 ? configObj.fileSizeLimit : undefined,

            //拖拽
            dnd: configObj.dnd || undefined,
            disableGlobalDnd: configObj.disableGlobalDnd != undefined && typeof configObj.disableGlobalDnd == "boolean" ? configObj.disableGlobalDnd : false,

            //支持文件重复
            duplicate: configObj.duplicate != undefined && typeof configObj.duplicate == "boolean" ? configObj.duplicate : true
        }
    },
    load: function () {
        this.uploader = WebUploader.create({
            // 自动上传。
            auto: this.config.auto,
            // swf文件路径
            swf: '/static/src/Uploader.swf',
            // 文件接收服务端。
            server: this.uploadSetting.uploadUrl,
            //拖拽
            dnd: this.config.dnd,
            disableGlobalDnd: this.config.disableGlobalDnd,
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id: this.config.pickId,
                multiple: this.config.multiple //默认为true，就是可以多选
            },
            // 只允许选择文件，可选。
            accept: {
                title: 'Videos',
                extensions: 'mp4,ogg,mov',
                mimeTypes: 'video/mp4,video/ogg,video/quicktime'  //修改这行
            },
            // 上传文件个数
            // fileNumLimit: this.fileNumLimit,
            fileSizeLimit: this.config.fileSizeLimit,
            fileSingleSizeLimit: this.config.fileSingleSizeLimit,
            // 全局设置, 文件上传请求的参数表，每次发送都会发送此对象中的参数。
            //formData: {
            //    token: this.uploadSetting.uploadToken
            //},
            chunked: this.config.chunked,
            duplicate: this.config.duplicate//支持文件重复
        });

        //
        this.startUpload(this.startCallbackFunction);
        this.uploadFinished(this.finishedUploadFunction);

        this.uploadBeforeSend();

        //
        this.fileQueuedBefore();
        this.fileQueued(this.fileQueuedBeforeCallbackFunction, this.fileQueuedCallbackFunction, null);
        this.uploadSuccess(this.successCallbackFunction);
        this.uploadProgress(this.progressCallbackFunction);
        this.uploadError(this.uploadErrorCallbackFunction);
        this.error(this.errorCallbackFunction);
    },
    setCallbackFunction: function (callbackFunction) {
        //
        this.startCallbackFunction = callbackFunction.start;
        this.finishedUploadFunction = callbackFunction.finished;

        //
        this.fileQueuedBeforeCallbackFunction = callbackFunction.fileQueuedBefore;
        this.fileQueuedCallbackFunction = callbackFunction.fileQueued;

        //
        this.successCallbackFunction = callbackFunction.success;
        this.progressCallbackFunction = callbackFunction.progress;
        this.uploadErrorCallbackFunction = callbackFunction.uploadError;
        this.errorCallbackFunction = callbackFunction.error;
    },
    fileQueuedBefore: function () {
        var that = this;

        that.uploader.on('beforeFileQueued', function (file) {
            //
            if (file != undefined && file != null && file.ext == "") {
                if (that.errorCallbackFunction) {
                    that.errorCallbackFunction("文件后缀错误", file);
                }

                return false;
            }
        });
    },
    fileQueued: function (queuedBeforeCallbackFun, queuedCallbackFun, thumbCallbackFun) {
        var that = this;

        if (that.config.multiple) {
            that.uploader.on('filesQueued', function (files) {
                //
                if (queuedBeforeCallbackFun) {
                    queuedBeforeCallbackFun(files);
                }

                if (that.config.fileNumLimit && files.length > that.config.fileNumLimit) {
                    that.removeFiles(files.slice(that.config.fileNumLimit, files.length));
                    files = files.slice(0, that.config.fileNumLimit);
                }
                //
                var uploadedFilesInfo = {
                    fileNum: files.length,
                    files: []
                };

                //
                for (var i = 0; i < files.length; i++) {
                    uploadedFilesInfo.files.push({"fileName": files[i].name, "fileId": files[i].id});
                }

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }

                if (thumbCallbackFun) {
                    that.makeThumb(thumbCallbackFun);
                }

            });
        } else {
            that.uploader.on('fileQueued', function (file) {
                //
                if (queuedBeforeCallbackFun) {
                    queuedBeforeCallbackFun([file]);
                }

                var uploadedFilesInfo = {
                    fileNum: 1,
                    files: []
                };

                //
                uploadedFilesInfo.files.push({"fileName": file.name, "fileId": file.id});

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }
                //
                if (thumbCallbackFun) {
                    that.makeThumb(thumbCallbackFun);
                }
            });
        }
    },
    makeThumb: function (thumbCallbackFun) {
        this.uploader.makeThumb(files[0], function (error, src) {
            if (error) {
                return;
            }
        }, this.config.thumbnailWidth, this.config.thumbnailHeight);
    },
    startUpload: function (startCallbackFunction) {
        this.uploader.on('startUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    },
    stopUpload: function (startCallbackFunction) {
        this.uploader.on('stopUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    },
    uploadFinished: function (finishedCallbackFunction) {
        this.uploader.on('uploadFinished', function () {
            if (finishedCallbackFunction) {
                finishedCallbackFunction();
            }
        });

    },
    uploadBeforeSend: function () {
        var storeFileNamePrefix = this.uploadSetting.storeFileNamePrefix;
        var that = this;
        //局部设置，给每个独立的文件上传请求参数设置，每次发送都会发送此对象中的参数
        that.uploader.on('uploadBeforeSend', function (block, data, headers) {
            // file为分块对应的file对象。
            data.file = block.file;

            var storeFileFullName = null;
            var suffix = null;

            if (block.file.name.lastIndexOf(".") >= 0) {
                suffix = block.file.name.substr(block.file.name.lastIndexOf("."))
            }
            var nowDate = new Date();

            var year = nowDate.getFullYear();
            var month = nowDate.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var day = nowDate.getDate();
            if (day < 10) {
                day = "0" + day;
            }

            //
            if (storeFileFullName == null && suffix !== null) {
                if (that.config.isEditor) {
                    storeFileFullName = storeFileNamePrefix + MobooLib.Functions.generateGUID(16, 64, true) + suffix.toLowerCase();
                } else {
                    storeFileFullName = storeFileNamePrefix + year + '-' + month + '-' + day + '-' + MobooLib.Functions.generateGUID(12, 64, true) + suffix.toLowerCase();
                }
            }

            data.key = storeFileFullName;
            data.token = that.uploadSetting.uploadToken;
            //   console.log(storeFileFullName + "===");
        });
    }

    ,
    uploadProgress: function (progressCallbackFunction) {
        var uploadStartTime = new Date().getTime();
        var uploadTime = 0;
        var uploadFileSize = 0;
        var loaded = 0;

        this.uploader.on('uploadProgress', function (file, percentage) {
            uploadTime = new Date().getTime() - uploadStartTime;
            uploadFileSize = file.size;
            loaded = uploadFileSize * percentage;

            var progressInfo = {
                "fileName": file.name,
                "fileId": file.id,
                "percent": Math.ceil(percentage * 100),
                "speed": Math.ceil(loaded / uploadTime * 1000 * 10 / 1024 / 1024) / 10,//M/s
                "spentTime": Math.ceil(uploadTime),
                "remainTime": loaded > 0 ? Math.ceil(uploadTime * (uploadFileSize - loaded) / loaded / 1000) : 0,//秒
                "totalSize": Math.ceil(uploadFileSize * 10 / 1024 / 1024) / 10,//M 保留一位小数
                "uploadedSize": Math.ceil(loaded * 10 / 1024 / 1024) / 10
            };

            if (progressInfo.percent > 100) {
                $.extend(progressInfo, {"percent": 100})
            }
            // console.log(percentage);
            //  console.log("progressInfo=" + JSON.stringify(progressInfo));
            //
            if (progressCallbackFunction) {
                progressCallbackFunction(progressInfo);
            }
        });
    }
    ,
    uploadSuccess: function (successCallbackFunction) {
        var uploadSetting = this.uploadSetting;

        var width = 0;
        var height = 0;
        this.uploader.on('uploadSuccess', function (file, response) {
            var data = response;
            var byteSize = data.fsize;

            //
            if (successCallbackFunction != null) {
                var uploadedFileInfo = {
                    "fileName": file.name,
                    "fileId": file.id,
                    "origin": uploadSetting.viewUrlPrefix + data.key,
                    "id": data.key,
                    "providerCode": uploadSetting.providerCode,
                    "bucketCode": uploadSetting.bucketCode,
                    "fileSize": Math.ceil(byteSize / 1024),
                    "width": width,
                    "height": height
                };

                if (data.mediaType != undefined && data.mediaType != null) {
                    //image
                    if ("image" == data.mediaType.code) {
                        var uploadedImageInfo = {
                            width: data.w,
                            height: data.h,
                            ave: data.ave
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedImageInfo);
                    } else if ("audio" == data.mediaType.code) {
                        var uploadedAudioInfo = {
                            duration: data.duration
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedAudioInfo);
                    } else if ("video" == data.mediaType.code) {
                        var uploadedVideoInfo = {
                            duration: data.duration,
                            width: data.w,
                            height: data.h
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedVideoInfo);
                    }
                }

                //
                var storeFileNamePrefix = uploadSetting.storeFileNamePrefix;
                if (storeFileNamePrefix) {
                    var storeFileInfo = {
                        "prefixed": storeFileNamePrefix,
                        "uniqueId": uploadedFileInfo.id.replace(storeFileNamePrefix, "")
                    }
                    $.extend(uploadedFileInfo, storeFileInfo);
                }

                //  console.log("uploadedFileInfo=" + JSON.stringify(uploadedFileInfo));
                successCallbackFunction(uploadedFileInfo);
            }
        });

        this.uploader.reset();
    }
    ,
    uploadComplete: function (callbackFunction) {
        this.uploader.on('uploadComplete', function (file) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    }
    ,
    uploadError: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('uploadError', function (file, reason) {
            //文件上传失败，重新加上上传本文件
            //文件上传失败，重新加上上传本文件
            console.log("uploadError start" + reason);
            console.log("uploadError end ");

            if (reason != "abort" && reason != "http" && reason != "server") {
                //重新加入文件
                thatThis.uploader.addFiles(file);
            } else {
                if (errorCallbackFunction) {
                    errorCallbackFunction(file);
                }
            }
        });
    }, error: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('error', function (stateCode, stateId, file) {
            var stateInf = "";
            if (stateCode == "Q_TYPE_DENIED") {
                stateInf += "文件格式错误";
            } else if (stateCode == "F_EXCEED_SIZE") {
                stateInf += "文件过大";
            } else if (stateCode == "Q_EXCEED_NUM_LIMIT") {
                stateInf += "文件添加数量过多";
            } else if (stateCode == "Q_EXCEED_SIZE_LIMIT") {
                stateInf += "文件添加文件的总大小过大";
            }
            console.log("error=" + stateInf);
            console.log(file);
            errorCallbackFunction(stateInf, file);
        });
    }
    ,
    uploadAccept: function (callbackFunction) {
        this.uploader.on('uploadAccept', function (file, response) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    }
    ,
    upload: function (callbackFunction) {
        //非自动上传时使用
        this.uploader.upload();
        if (callbackFunction) {
            callbackFunction();
        }
    }, removeFiles: function (files) {

        for (var i = 0; i < files.length; i++) {
            this.uploader.removeFile(files[i], true);
        }
    },
    removeFilesById: function (ids) {
        for (var i = 0; i < ids.length; i++) {
            this.uploader.removeFile(ids[i], true);
        }
    },
    isMultiple: function () {

        return this.config.multiple;
    }, setMultiple: function (multiple) {

        if (typeof  multiple == 'boolean') {
            this.config.multiple = multiple;
        }
    }, setFileNumLimit: function (fileNumLimit) {
        this.config.fileNumLimit = fileNumLimit;
    }
}

FileUploader.UploadFlowPhoto = function (configObj, uploadSetting) {

    //
    this.uploadSetting = {
        "default": null,
        "image": null,
        "video": null
    }

    this.uploader = null;
    //
    this.init(configObj, uploadSetting);
}


//
FileUploader.UploadFlowPhoto.prototype = {
    constructor: FileUploader.UploadFlowPhoto,

    //
    fileQueuedCallbackFunction: null,
    successCallbackFunction: null,
    progressCallbackFunction: null,
    errorCallbackFunction: null,
    init: function (configObj, uploadSetting) {

        //
        this.uploadSetting = uploadSetting;

        //
        if (this.uploadSetting.default == undefined || this.uploadSetting.default == null) {
            for (var r in this.uploadSetting) {
                this.uploadSetting.default = this.uploadSetting[r];
                break;
            }
        }

        this.config = {
            pickId: configObj.pickId || document.body,

            auto: configObj.auto != undefined && typeof configObj.auto == "boolean" ? configObj.auto : true,
            // 缩略图大小
            thumbnailWidth: configObj.thumbnailWidth != undefined && !isNaN(configObj.thumbnailWidth) && configObj.thumbnailWidth > 0 ? configObj.thumbnailWidth : 100 * this.ratio,
            thumbnailHeight: configObj.thumbnailHeight != undefined && !isNaN(configObj.thumbnailHeight) && configObj.thumbnailHeight > 0 ? configObj.thumbnailHeight : 100 * this.ratio,

            //
            multiple: configObj.multiple != undefined && typeof configObj.multiple == "boolean" ? configObj.multiple : true,
            isEditor: configObj.isEditor != undefined && typeof configObj.isEditor == "boolean" ? configObj.isEditor : false,//是否DRAFT编辑器内使用
            chunked: configObj.chunked != undefined && typeof configObj.chunked == "boolean" ? configObj.chunked : false,//分片上传
            fileNumLimit: configObj.fileNumLimit != undefined && !isNaN(configObj.fileNumLimit) && configObj.fileNumLimit > 0 ? configObj.fileNumLimit : null,
            //单个文件的限制,单位B
            imageFileSingleSizeLimit: configObj.imageFileSingleSizeLimit && configObj.imageFileSingleSizeLimit && !isNaN(configObj.imageFileSingleSizeLimit) && configObj.imageFileSingleSizeLimit > 0 ? configObj.imageFileSingleSizeLimit : undefined,
            //单个文件的限制,单位B
            videoFileSingleSizeLimit: configObj.videoFileSingleSizeLimit && configObj.videoFileSingleSizeLimit && !isNaN(configObj.videoFileSingleSizeLimit) && configObj.videoFileSingleSizeLimit > 0 ? configObj.videoFileSingleSizeLimit : undefined,
            //总文件大小限制
            fileSizeLimit: configObj.fileSizeLimit != undefined && !isNaN(configObj.fileSizeLimit) && configObj.fileSizeLimit > 0 ? configObj.fileSizeLimit : undefined,

            //拖拽
            dnd: configObj.dnd || undefined,
            disableGlobalDnd: configObj.disableGlobalDnd != undefined && typeof configObj.disableGlobalDnd == "boolean" ? configObj.disableGlobalDnd : false,

            //支持文件重复
            duplicate: configObj.duplicate != undefined && typeof configObj.duplicate == "boolean" ? configObj.duplicate : true,

            //
            acceptExtensions: "",
            acceptMimeTypes: ""
        }

        // accept
        var acceptExtensions = "";
        var acceptMimeTypes = "";
        if (this.uploadSetting.video != undefined && this.uploadSetting.video != null) {
            if (acceptExtensions != "") {
                acceptExtensions += ",";
            }
            if (acceptMimeTypes != "") {
                acceptMimeTypes += ",";
            }

            acceptExtensions += "mp4,ogg,mov";
            acceptMimeTypes += "video/mp4,video/ogg,video/quicktime";
        }
        if (this.uploadSetting.image != undefined && this.uploadSetting.image != null) {
            if (acceptExtensions != "") {
                acceptExtensions += ",";
            }
            if (acceptMimeTypes != "") {
                acceptMimeTypes += ",";
            }

            acceptExtensions += "gif";
            acceptMimeTypes += "image/gif";
        }

        this.config.acceptExtensions = acceptExtensions;
        this.config.acceptMimeTypes = acceptMimeTypes;
    },
    load: function () {

        this.uploader = WebUploader.create({
            // 自动上传。
            auto: this.config.auto,
            // swf文件路径
            swf: '/static/src/Uploader.swf',
            // 文件接收服务端。
            server: this.uploadSetting.default.uploadUrl,
            //拖拽
            dnd: this.config.dnd,
            disableGlobalDnd: this.config.disableGlobalDnd,
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id: this.config.pickId,
                multiple: this.config.multiple //默认为true，就是可以多选
            },
            // 只允许选择文件，可选。
            accept: {
                title: 'FlowPhoto',
                extensions: this.config.acceptExtensions,
                mimeTypes: this.config.acceptMimeTypes  //修改这行
            },
            // 上传文件个数
            // fileNumLimit: this.fileNumLimit,
            fileSizeLimit: this.config.fileSizeLimit,
            fileSingleSizeLimit: this.config.fileSingleSizeLimit,
            // 全局设置, 文件上传请求的参数表，每次发送都会发送此对象中的参数。
            //formData: {
            //    token: this.uploadSetting.uploadToken
            //},
            chunked: this.config.chunked,
            duplicate: this.config.duplicate//支持文件重复
        });

        //
        this.startUpload(this.startCallbackFunction);
        // this.stopUpload(stopUploadFunction);
        this.uploadFinished(this.finishedUploadFunction);

        this.uploadBeforeSend();

        //
        this.fileQueuedBefore();
        this.fileQueued(this.fileQueuedBeforeCallbackFunction, this.fileQueuedCallbackFunction, this.thumbCallbackFun);
        this.uploadSuccess(this.successCallbackFunction);
        this.uploadProgress(this.progressCallbackFunction);
        this.uploadError(this.uploadErrorCallbackFunction);
        this.error(this.errorCallbackFunction);
    },
    setCallbackFunction: function (callbackFunction) {
        //
        this.startCallbackFunction = callbackFunction.start;
        this.finishedUploadFunction = callbackFunction.finished;

        //
        this.fileQueuedBeforeCallbackFunction = callbackFunction.fileQueuedBefore;
        this.fileQueuedCallbackFunction = callbackFunction.fileQueued;
        //
        this.thumbCallbackFun = callbackFunction.thumb;
        //
        this.successCallbackFunction = callbackFunction.success;
        this.progressCallbackFunction = callbackFunction.progress;
        this.uploadErrorCallbackFunction = callbackFunction.uploadError;
        this.errorCallbackFunction = callbackFunction.error;
    },
    fileQueuedBefore: function () {
        var that = this;

        that.uploader.on('beforeFileQueued', function (file) {
            //
            if (file !== undefined && file !== null && file.ext == "") {

                if (that.errorCallbackFunction) {
                    that.errorCallbackFunction("文件后缀错误", file);
                }
                return false;
            }

            //
            var overLimitSize = false;

            if (that.config.imageFileSingleSizeLimit || that.config.videoFileSingleSizeLimit) {
                var fileType = file.type;
                if (fileType != undefined && fileType != null) {
                    if (that.config.imageFileSingleSizeLimit && (fileType.indexOf("image") > -1 || file.ext == "gif") && file.size > that.config.imageFileSingleSizeLimit) {
                        overLimitSize = true;
                    } else if (that.config.videoFileSingleSizeLimit && (fileType.indexOf("video") > -1 || "mp4,ogg,mov".indexOf(file.ext) > -1) && file.size > that.config.videoFileSingleSizeLimit) {
                        overLimitSize = true;
                    }
                }
            }

            //
            if (overLimitSize) {
                that.removeFiles([file]);
                if (that.errorCallbackFunction) {
                    that.errorCallbackFunction("文件过大", file);
                }

                return false;
            }
        });
    },
    fileQueued: function (queuedBeforeCallbackFun, queuedCallbackFun, thumbCallbackFun) {
        var that = this;

        if (that.config.multiple) {
            that.uploader.on('filesQueued', function (files) {
                if (queuedBeforeCallbackFun) {
                    queuedBeforeCallbackFun(files);
                }

                if (that.config.fileNumLimit && files.length > that.config.fileNumLimit) {
                    that.removeFiles(files.slice(that.config.fileNumLimit, files.length));
                    files = files.slice(0, that.config.fileNumLimit);
                }
                //
                var uploadedFilesInfo = {
                    fileNum: 0,
                    files: []
                };

                //
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var overLimitSize = false;
                    if (that.config.imageFileSingleSizeLimit || that.config.videoFileSingleSizeLimit) {
                        var fileType = file.type;
                        if (fileType != undefined && fileType != null) {
                            if (that.config.imageFileSingleSizeLimit && (fileType.indexOf("image") > -1 || file.ext == "gif") && file.size > that.config.imageFileSingleSizeLimit) {
                                overLimitSize = true;
                            } else if (that.config.videoFileSingleSizeLimit && (fileType.indexOf("video") > -1 || "mp4,ogg,mov".indexOf(file.ext) > -1) && file.size > that.config.videoFileSingleSizeLimit) {
                                overLimitSize = true;
                            }
                        }
                    }

                    //
                    if (overLimitSize) {
                        that.removeFiles([file]);
                        if (that.errorCallbackFunction) {
                            that.errorCallbackFunction("文件过大", file);
                        }
                    } else {
                        uploadedFilesInfo.fileNum++;
                        uploadedFilesInfo.files.push({"fileName": file.name, "fileId": file.id});
                    }
                }

                //
                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }

                //
                if (thumbCallbackFun) {
                    for (var i = 0; i < files.length; i++) {
                        that.makeThumb(files[i], thumbCallbackFun)
                    }
                }
            });
        } else {
            that.uploader.on('fileQueued', function (file) {

                var uploadedFilesInfo = {
                    fileNum: 1,
                    files: []
                };

                var overLimitSize = false;
                if (that.config.imageFileSingleSizeLimit || that.config.videoFileSingleSizeLimit) {
                    var fileType = file.type;
                    if (fileType != undefined && fileType != null) {
                        if (that.config.imageFileSingleSizeLimit && (fileType.indexOf("image") > -1 || file.ext == "gif") && file.size > that.config.imageFileSingleSizeLimit) {
                            overLimitSize = true;
                        } else if (that.config.videoFileSingleSizeLimit && (fileType.indexOf("video") > -1 || "mp4,ogg,mov".indexOf(file.ext) > -1) && file.size > that.config.videoFileSingleSizeLimit) {
                            overLimitSize = true;
                        }
                    }
                }

                //
                if (overLimitSize) {
                    that.removeFiles([file]);
                    if (that.errorCallbackFunction) {
                        that.errorCallbackFunction("文件过大", file);
                    }
                } else {
                    uploadedFilesInfo.fileNum++;
                    uploadedFilesInfo.files.push({"fileName": file.name, "fileId": file.id});
                }

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }
                //
                if (thumbCallbackFun) {
                    that.makeThumb(file, thumbCallbackFun);
                }
            });
        }
    },
    makeThumb: function (file, thumbCallbackFun) {
        this.uploader.makeThumb(file, function (error, src) {
            if (error) {
                return;
            }

            if (thumbCallbackFun) {
                var uploadedFilesInfo = {
                    fileId: file.id,
                    fileName: file.name,
                    thumbUrl: src
                };
                thumbCallbackFun(uploadedFilesInfo);
            }

        }, this.config.thumbnailWidth, this.config.thumbnailHeight);
    },
    startUpload: function (startCallbackFunction) {
        this.uploader.on('startUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    },
    stopUpload: function (startCallbackFunction) {
        this.uploader.on('stopUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    },
    uploadFinished: function (finishedCallbackFunction) {
        this.uploader.on('uploadFinished', function () {
            if (finishedCallbackFunction) {
                finishedCallbackFunction();
            }
        });

    },
    uploadBeforeSend: function () {
        var thatUploadSetting = this.uploadSetting;

        var storeFileNamePrefix = thatUploadSetting.default.storeFileNamePrefix;
        var that = this;
        //局部设置，给每个独立的文件上传请求参数设置，每次发送都会发送此对象中的参数
        that.uploader.on('uploadBeforeSend', function (block, data, headers) {
            // file为分块对应的file对象。
            data.file = block.file;

            var storeFileFullName = null;
            var suffix = null;

            if (block.file.name.lastIndexOf(".") >= 0) {
                suffix = block.file.name.substr(block.file.name.lastIndexOf("."))
            }
            var nowDate = new Date();

            var year = nowDate.getFullYear();
            var month = nowDate.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var day = nowDate.getDate();
            if (day < 10) {
                day = "0" + day;
            }

            //
            var fileType = data.file.type;
            if (fileType != undefined && fileType != null) {
                if (fileType.indexOf("image") > -1 || data.file.ext == "gif") {
                    storeFileNamePrefix = thatUploadSetting.image.storeFileNamePrefix;
                    data.token = thatUploadSetting.image.uploadToken;
                } else if (fileType.indexOf("video") > -1 || "mp4,ogg,mov".indexOf(data.file.ext) > -1) {
                    storeFileNamePrefix = thatUploadSetting.video.storeFileNamePrefix;
                    data.token = thatUploadSetting.video.uploadToken;
                }
            }

            //
            if (storeFileFullName == null && suffix !== null) {
                if (that.config.isEditor) {
                    storeFileFullName = storeFileNamePrefix + MobooLib.Functions.generateGUID(16, 64, true) + suffix.toLowerCase();
                } else {
                    storeFileFullName = storeFileNamePrefix + year + '-' + month + '-' + day + '-' + MobooLib.Functions.generateGUID(12, 64, true) + suffix.toLowerCase();
                }
            }

            data.key = storeFileFullName;
        });
    },
    uploadProgress: function (progressCallbackFunction) {
        var uploadStartTime = new Date().getTime();
        var uploadTime = 0;
        var uploadFileSize = 0;
        var loaded = 0;

        this.uploader.on('uploadProgress', function (file, percentage) {
            uploadTime = new Date().getTime() - uploadStartTime;
            uploadFileSize = file.size;
            loaded = uploadFileSize * percentage;

            var progressInfo = {
                "fileName": file.name,
                "fileId": file.id,
                "percent": Math.ceil(percentage * 100),
                "speed": Math.ceil(loaded / uploadTime * 1000 * 10 / 1024 / 1024) / 10,//M/s
                "spentTime": Math.ceil(uploadTime),
                "remainTime": loaded > 0 ? Math.ceil(uploadTime * (uploadFileSize - loaded) / loaded / 1000) : 0,//秒
                "totalSize": Math.ceil(uploadFileSize * 10 / 1024 / 1024) / 10,//M 保留一位小数
                "uploadedSize": Math.ceil(loaded * 10 / 1024 / 1024) / 10
            };

            if (progressInfo.percent > 100) {
                $.extend(progressInfo, {"percent": 100})
            }
            // console.log(percentage);
            //  console.log("progressInfo=" + JSON.stringify(progressInfo));
            //
            if (progressCallbackFunction) {
                progressCallbackFunction(progressInfo);
            }
        });
    },
    uploadSuccess: function (successCallbackFunction) {
        var uploadSetting = this.uploadSetting;

        var width = 0;
        var height = 0;
        var viewUrlPrefix = uploadSetting.default.viewUrlPrefix;
        var providerCode = uploadSetting.default.providerCode;
        var bucketCode = uploadSetting.bucketCode;
        var storeFileNamePrefix = uploadSetting.default.storeFileNamePrefix;
        this.uploader.on('uploadSuccess', function (file, response) {
            var data = response;
            var byteSize = data.fsize;

            //
            if (successCallbackFunction) {

                //
                var fileType = file.type;
                if (fileType != undefined && fileType != null) {
                    if (fileType.indexOf("image") > -1 || file.ext == "gif") {
                        viewUrlPrefix = uploadSetting.image.viewUrlPrefix;
                        providerCode = uploadSetting.image.providerCode;
                        bucketCode = uploadSetting.image.bucketCode;
                        storeFileNamePrefix = uploadSetting.image.storeFileNamePrefix;
                    } else if (fileType.indexOf("video") > -1 || "mp4,ogg,mov".indexOf(file.ext) > -1) {
                        viewUrlPrefix = uploadSetting.video.viewUrlPrefix;
                        providerCode = uploadSetting.video.providerCode;
                        bucketCode = uploadSetting.video.bucketCode;
                        storeFileNamePrefix = uploadSetting.video.storeFileNamePrefix;
                    }
                }

                var uploadedFileInfo = {
                    "fileName": file.name,
                    "fileId": file.id,
                    "origin": viewUrlPrefix + data.key,
                    "id": data.key,
                    "providerCode": providerCode,
                    "bucketCode": bucketCode,
                    "fileSize": Math.ceil(byteSize / 1024),
                    "width": width,
                    "height": height,
                    "mediaType": data.mediaType.code
                };

                if (data.mediaType != undefined && data.mediaType != null) {
                    //image
                    if ("image" == data.mediaType.code) {
                        var uploadedImageInfo = {
                            width: data.w,
                            height: data.h,
                            ave: data.ave
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedImageInfo);
                    } else if ("audio" == data.mediaType.code) {
                        var uploadedAudioInfo = {
                            duration: data.duration
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedAudioInfo);
                    } else if ("video" == data.mediaType.code) {
                        var uploadedVideoInfo = {
                            duration: data.duration,
                            width: data.w,
                            height: data.h
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedVideoInfo);
                    }
                }

                //
                if (storeFileNamePrefix) {
                    var storeFileInfo = {
                        "prefixed": storeFileNamePrefix,
                        "uniqueId": uploadedFileInfo.id.replace(storeFileNamePrefix, "")
                    }

                    $.extend(uploadedFileInfo, storeFileInfo);
                }

                //  console.log("uploadedFileInfo=" + JSON.stringify(uploadedFileInfo));
                successCallbackFunction(uploadedFileInfo);
            }
        });

        this.uploader.reset();
    },
    uploadComplete: function (callbackFunction) {
        this.uploader.on('uploadComplete', function (file) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    },
    uploadError: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('uploadError', function (file, reason) {
            //文件上传失败，重新加上上传本文件
            //文件上传失败，重新加上上传本文件
            console.log("uploadError start" + reason);
            console.log("uploadError end ");

            if (reason != "abort" && reason != "http" && reason != "server") {
                //重新加入文件
                thatThis.uploader.addFiles(file);
            } else {
                if (errorCallbackFunction) {
                    errorCallbackFunction(file);
                }
            }
        });
    },
    error: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('error', function (stateCode, stateId, file) {
            var stateInf = "";
            if (stateCode == "Q_TYPE_DENIED") {
                stateInf += "文件格式错误";
            } else if (stateCode == "F_EXCEED_SIZE") {
                stateInf += "文件过大";
            } else if (stateCode == "Q_EXCEED_NUM_LIMIT") {
                stateInf += "文件添加数量过多";
            } else if (stateCode == "Q_EXCEED_SIZE_LIMIT") {
                stateInf += "文件添加文件的总大小过大";
            }
            console.log("error=" + stateInf);
            console.log(file);
            errorCallbackFunction(stateInf, file);
        });
    },
    uploadAccept: function (callbackFunction) {
        this.uploader.on('uploadAccept', function (file, response) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    },
    upload: function (callbackFunction) {
        //非自动上传时使用
        this.uploader.upload();
        if (callbackFunction) {
            callbackFunction();
        }
    },
    removeFiles: function (files) {

        for (var i = 0; i < files.length; i++) {
            this.uploader.removeFile(files[i], true);
        }
    },
    removeFilesById: function (ids) {
        for (var i = 0; i < ids.length; i++) {
            this.uploader.removeFile(ids[i], true);
        }
    },
    isMultiple: function () {

        return this.config.multiple;
    },
    setMultiple: function (multiple) {

        if (typeof  multiple == 'boolean') {
            this.config.multiple = multiple;
        }
    },
    setFileNumLimit: function (fileNumLimit) {
        this.config.fileNumLimit = fileNumLimit;
    }
}


FileUploader.UploadBlob = function (blob, configObj, uploadSetting) {

    this.uploadSetting = {};

    //
    this.xmlHttp = null;
    this.uploadFormData = null;

    this.uploaded = false;
    this.uploading = false;

    //
    this.init(blob, configObj, uploadSetting);
}


FileUploader.UploadBlob.prototype = {
    constructor: FileUploader.UploadBlob,
    //
    uploadSetting: null,

    //
    fileQueuedCallbackFunction: null,
    successCallbackFunction: null,
    progressCallbackFunction: null,
    errorCallbackFunction: null,
    init: function (blob, configObj, uploadSetting) {
        this.uploadSetting = uploadSetting;

        //
        this.config = {
            isEditor: configObj.isEditor != undefined && typeof configObj.isEditor == "boolean" ? configObj.isEditor : false//是否DRAFT编辑器内使用
        };

        this.blob = blob;
    }, load: function () {
        this.xmlHttp = new XMLHttpRequest();
        //  this.xmlHttp.open("post", this.uploadSetting.uploadUrl, true);

        //
        if (FormData) {
            this.uploadBeforeSend(this.blob);
            this.startUpload(this.startCallbackFunction);
            //  this.uploadFinished(this.finishedUploadFunction);
            //
            this.fileQueued(this.fileQueuedBeforeCallbackFunction, this.fileQueuedCallbackFunction, this.thumbCallbackFun);

            this.uploadSuccess(this.successCallbackFunction);
            this.uploadProgress(this.progressCallbackFunction);
        }

        this.uploadError(this.uploadErrorCallbackFunction);
    },
    setCallbackFunction: function (callbackFunction) {
        this.startCallbackFunction = callbackFunction.start;
        this.finishedUploadFunction = callbackFunction.finished;

        this.fileQueuedBeforeCallbackFunction = callbackFunction.fileQueuedBefore;
        this.fileQueuedCallbackFunction = callbackFunction.fileQueued;

        //
        this.thumbCallbackFun = callbackFunction.thumb;

        //
        this.successCallbackFunction = callbackFunction.success;
        this.progressCallbackFunction = callbackFunction.progress;
        this.uploadErrorCallbackFunction = callbackFunction.uploadError;
        this.errorCallbackFunction = callbackFunction.error;
    }, setFile: function (blob) {
        this.blob = blob;
    }, startUpload: function (callbackFunction) {
        //
        this.uploaded = false;
        this.uploading = false;
        //
        this.xmlHttp = new XMLHttpRequest();
        this.xmlHttp.open("post", this.uploadSetting.uploadUrl, true);
        this.xmlHttp.send(this.uploadFormData);
        if (callbackFunction) {
            callbackFunction();
        }
    }, uploadBeforeSend: function (blob) {
        var storeFileFullName = null;
        //
        if (storeFileFullName == null) {
            if (this.config.isEditor) {
                storeFileFullName = this.uploadSetting.storeFileNamePrefix + MobooLib.Functions.generateGUID(16, 64, true) + ".wav";
            } else {
                var nowDate = new Date();

                var year = nowDate.getFullYear();
                var month = nowDate.getMonth() + 1;
                if (month < 10) {
                    month = "0" + month;
                }
                var day = nowDate.getDate();
                if (day < 10) {
                    day = "0" + day;
                }

                storeFileFullName = this.uploadSetting.storeFileNamePrefix + year + '-' + month + '-' + day + '-' + MobooLib.Functions.generateGUID(12, 64, true) + ".wav";
            }
        }

        //
        this.uploadFormData = new FormData();
        this.uploadFormData.append("file", blob);
        this.uploadFormData.append("token", this.uploadSetting.uploadToken);
        this.uploadFormData.append("key", storeFileFullName);

    }, fileQueued: function (callbackFunction) {

    },
    uploadSuccess: function (callbackFunction) {

        var thatThis = this;
        var uploadSetting = this.uploadSetting;
        thatThis.xmlHttp.onloadend = function (event) {

            if (!thatThis.uploaded && !thatThis.uploading) {
                thatThis.uploading = true;

                var currentTarget = event.currentTarget;
                var data = JSON.parse(event.currentTarget.response);

                //
                if (currentTarget.readyState == 4 && currentTarget.status == 200) {
                    var byteSize = data.fsize;
                    //
                    if (callbackFunction) {
                        var uploadedFileInfo = {
                            origin: uploadSetting.viewUrlPrefix + data.key,
                            id: data.key,
                            providerCode: uploadSetting.providerCode,
                            bucketCode: uploadSetting.bucketCode,
                            fileSize: Math.ceil(byteSize / 1024),
                            width: 0,
                            height: 0
                        };

                        if (data.mediaType != undefined && data.mediaType != null) {
                            //image
                            if ("image" == data.mediaType.code) {
                                var uploadedImageInfo = {
                                    width: data.w,
                                    height: data.h,
                                    imageAve: data.ave
                                };

                                //
                                $.extend(uploadedFileInfo, uploadedImageInfo);
                            } else if ("audio" == data.mediaType.code) {
                                var uploadedAudioInfo = {
                                    duration: data.duration
                                }

                                //
                                $.extend(uploadedFileInfo, uploadedAudioInfo);
                            }
                        }

                        //
                        var storeFileNamePrefix = uploadSetting.storeFileNamePrefix;
                        if (storeFileNamePrefix != null) {
                            var storeFileInfo = {
                                "prefixed": storeFileNamePrefix,
                                "uniqueId": uploadedFileInfo.id.replace(storeFileNamePrefix, "")
                            };

                            $.extend(uploadedFileInfo, storeFileInfo);
                        }
                        callbackFunction(uploadedFileInfo);
                    }

                } else {

                    thatThis.error(data);
                }

                thatThis.uploadFinished(thatThis.finishedUploadFunction);
                thatThis.uploading = false;
            }
        }
    },
    uploadProgress: function (callbackFunction) {
        //
        var uploadStartTime = new Date().getTime();
        var uploadTime = 0;
        var uploadFileSize = 0;

        this.xmlHttp.upload.onprogress = function (event) {
            if (callbackFunction) {


                uploadTime = new Date().getTime() - uploadStartTime;
                uploadFileSize = event.total;

                var progressInfo = {
                    // "fileName": blob.,
                    "percent": Math.ceil(100 * (event.loaded / event.total)),
                    "speed": Math.ceil(event.loaded / uploadTime * 1000 * 10 / 1024 / 1024) / 10,//M/s
                    "spentTime": Math.ceil(uploadTime),
                    "remainTime": Math.ceil(uploadTime * (event.total - event.loaded) / event.loaded / 1000),//秒
                    "totalSize": Math.ceil(event.total * 10 / 1024 / 1024) / 10,//M 保留一位小数
                    "uploadedSize": Math.ceil(event.loaded * 10 / 1024 / 1024) / 10
                };

                //
                if (progressInfo.percent > 100) {
                    $.extend(progressInfo, {"percent": 100})
                }

                //
                callbackFunction(progressInfo);
            }
        };
    },
    uploadFinished: function (callbackFunction) {
        this.uploaded = true;
        if (callbackFunction) {
            callbackFunction();
        }
    }, uploadError: function (callbackFunction) {

        if (callbackFunction) {
            this.xmlHttp.onerror = function (event) {
                if (callbackFunction != null) {
                    callbackFunction(event);
                }
            };
        }
    }, error: function (data) {
        var thatThis = this;
        if (this.errorCallbackFunction) {
            this.errorCallbackFunction(data);
        }
    }
};
FileUploader.UploadMultiFormatImage = function (configObj, uploadSetting) {

    //
    this.uploadSetting = {};

    this.uploader = null;
    //
    this.init(configObj, uploadSetting);
}

//
FileUploader.UploadMultiFormatImage.prototype = {
    constructor: FileUploader.UploadMultiFormatImage,

    //
    fileQueuedCallbackFunction: null,
    successCallbackFunction: null,
    progressCallbackFunction: null,
    errorCallbackFunction: null,
    init: function (configObj, uploadSetting) {

        //
        this.uploadSetting = uploadSetting;
        //console.log(this.uploadSetting)

        //
        this.config = {
            pickId: configObj.pickId || document.body,

            auto: configObj.auto != undefined && typeof configObj.auto == "boolean" ? configObj.auto : true,
            // 缩略图大小
            thumbnailWidth: configObj.thumbnailWidth != undefined && !isNaN(configObj.thumbnailWidth) && configObj.thumbnailWidth > 0 ? configObj.thumbnailWidth : 100 * this.ratio,
            thumbnailHeight: configObj.thumbnailHeight != undefined && !isNaN(configObj.thumbnailHeight) && configObj.thumbnailHeight > 0 ? configObj.thumbnailHeight : 100 * this.ratio,

            //
            multiple: configObj.multiple != undefined && typeof configObj.multiple == "boolean" ? configObj.multiple : true,
            isEditor: configObj.isEditor != undefined && typeof configObj.isEditor == "boolean" ? configObj.isEditor : false,//是否DRAFT编辑器内使用
            chunked: configObj.chunked != undefined && typeof configObj.chunked == "boolean" ? configObj.chunked : true,//分片上传
            chunkSize: 256 * 1000,
            chunkRetry: 5,
            fileNumLimit: configObj.fileNumLimit != undefined && !isNaN(configObj.fileNumLimit) && configObj.fileNumLimit > 0 ? configObj.fileNumLimit : null,
            //单个文件的限制,单位B
            imageFileSingleSizeLimit: configObj.imageFileSingleSizeLimit && configObj.imageFileSingleSizeLimit && !isNaN(configObj.imageFileSingleSizeLimit) && configObj.imageFileSingleSizeLimit > 0 ? configObj.imageFileSingleSizeLimit : undefined,
            //单个文件的限制,单位B
            gifFileSingleSizeLimit: configObj.gifFileSingleSizeLimit && configObj.gifFileSingleSizeLimit && !isNaN(configObj.gifFileSingleSizeLimit) && configObj.gifFileSingleSizeLimit > 0 ? configObj.gifFileSingleSizeLimit : undefined,
            //总文件大小限制
            fileSizeLimit: configObj.fileSizeLimit != undefined && !isNaN(configObj.fileSizeLimit) && configObj.fileSizeLimit > 0 ? configObj.fileSizeLimit : undefined,

            //拖拽
            dnd: configObj.dnd || undefined,
            disableGlobalDnd: configObj.disableGlobalDnd != undefined && typeof configObj.disableGlobalDnd == "boolean" ? configObj.disableGlobalDnd : false,

            //支持文件重复
            duplicate: configObj.duplicate != undefined && typeof configObj.duplicate == "boolean" ? configObj.duplicate : true,

            //
            acceptExtensions: "",
            acceptMimeTypes: ""
        };
    },
    load: function () {

        this.uploader = WebUploader.create({
            // 自动上传。
            auto: this.config.auto,
            // swf文件路径
            swf: '/static/src/Uploader.swf',
            // 文件接收服务端。
            server: this.uploadSetting.uploadUrl,
            //拖拽
            dnd: this.config.dnd,
            disableGlobalDnd: this.config.disableGlobalDnd,
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id: this.config.pickId,
                multiple: this.config.multiple //默认为true，就是可以多选
            },
            // 只允许选择文件，可选。
            accept: {
                title: 'Images',
                extensions: 'jpg,jpeg,png,gif',
                mimeTypes: 'image/jpg,image/jpeg,image/png,image/gif'   //修改这行
            },
            // 上传文件个数
            // fileNumLimit: this.fileNumLimit,
            fileSizeLimit: this.config.fileSizeLimit,
            fileSingleSizeLimit: this.config.fileSingleSizeLimit,
            // 全局设置, 文件上传请求的参数表，每次发送都会发送此对象中的参数。
            //formData: {
            //    token: this.uploadSetting.uploadToken
            //},
            compress: {
                width: 10000,
                height: 10000,

                // 图片质量，只有type为`image/jpeg`的时候才有效。
                quality: 90,

                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,

                // 是否允许裁剪。
                crop: false,

                // 是否保留头部meta信息。
                preserveHeaders: true,

                // 如果发现压缩后文件大小比原来还大，则使用原来图片
                // 此属性可能会影响图片自动纠正功能
                noCompressIfLarger: false,

                // 单位字节，如果图片大小小于此值，不会采用压缩。
                compressSize: 0
            },
            /* chunked: this.config.chunked,
             chunkSize: this.config.chunkSize*/
            // chunkRetry: this.config.chunkRetry
            duplicate: this.config.duplicate//支持文件重复
        });

        //
        this.startUpload(this.startCallbackFunction);
        // this.stopUpload(stopUploadFunction);
        this.uploadFinished(this.finishedUploadFunction);

        this.uploadBeforeSend();

        //
        this.fileQueuedBefore();
        this.fileQueued(this.fileQueuedBeforeCallbackFunction, this.fileQueuedCallbackFunction, null);
        this.uploadSuccess(this.successCallbackFunction);
        this.uploadProgress(this.progressCallbackFunction);
        this.uploadError(this.uploadErrorCallbackFunction);
        this.error(this.errorCallbackFunction);
    },
    setCallbackFunction: function (callbackFunction) {
        //
        this.startCallbackFunction = callbackFunction.start;
        this.finishedUploadFunction = callbackFunction.finished;

        //
        this.fileQueuedBeforeCallbackFunction = callbackFunction.fileQueuedBefore;
        this.fileQueuedCallbackFunction = callbackFunction.fileQueued;

        //
        this.successCallbackFunction = callbackFunction.success;
        this.progressCallbackFunction = callbackFunction.progress;
        this.uploadErrorCallbackFunction = callbackFunction.uploadError;
        this.errorCallbackFunction = callbackFunction.error;
    },
    fileQueuedBefore: function () {
        var that = this;

        that.uploader.on('beforeFileQueued', function (file) {
            //
            if (file != undefined && file != null && file.ext == "") {
                if (that.errorCallbackFunction) {
                    that.errorCallbackFunction("文件后缀错误", file);
                }

                return false;
            }
        });
    },
    fileQueued: function (queuedBeforeCallbackFun, queuedCallbackFun, thumbCallbackFun) {
        var that = this;

        if (that.config.multiple) {
            that.uploader.on('filesQueued', function (files) {
                if (queuedBeforeCallbackFun) {
                    queuedBeforeCallbackFun(files);
                }

                if (that.config.fileNumLimit && files.length > that.config.fileNumLimit) {
                    that.removeFiles(files.slice(that.config.fileNumLimit, files.length));
                    files = files.slice(0, that.config.fileNumLimit);
                }
                //
                var uploadedFilesInfo = {
                    fileNum: 0,
                    files: []
                };

                //
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var overImageLimitSize = false, overGifLimitSize = false;
                    if (that.config.imageFileSingleSizeLimit || that.config.gifFileSingleSizeLimit) {
                        var fileType = file.type;

                        if (fileType != undefined && fileType != null) {
                            if (that.config.gifFileSingleSizeLimit && (fileType.indexOf("image") > -1 && file.ext == "gif") && file.size > that.config.gifFileSingleSizeLimit) {
                                overGifLimitSize = true;
                            } else if (that.config.imageFileSingleSizeLimit && (fileType.indexOf("image") > -1 && "png,jpg,jpeg".indexOf(file.ext) > -1) && file.size > that.config.imageFileSingleSizeLimit) {
                                overImageLimitSize = true;
                            }
                        }
                    }
                    //
                    if (overImageLimitSize) {
                        that.removeFiles([file]);
                        if (that.errorCallbackFunction) {
                            that.errorCallbackFunction("图片文件过大", file);
                        }
                    } else if (overGifLimitSize) {
                        that.removeFiles([file]);
                        if (that.errorCallbackFunction) {
                            that.errorCallbackFunction("gif文件过大", file);
                        }
                    } else {
                        uploadedFilesInfo.fileNum++;
                        uploadedFilesInfo.files.push({"fileName": file.name, "fileId": file.id});
                    }
                }

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }

                if (thumbCallbackFun) {
                    that.makeThumb(thumbCallbackFun);
                }

            });
        } else {

            that.uploader.on('fileQueued', function (file) {
                if (queuedBeforeCallbackFun) {
                    queuedBeforeCallbackFun([file]);
                }

                var uploadedFilesInfo = {
                    fileNum: 1,
                    files: []
                };

                var overImageLimitSize = false, overGifLimitSize = false;
                if (that.config.imageFileSingleSizeLimit || that.config.gifFileSingleSizeLimit) {
                    var fileType = file.type;

                    if (fileType != undefined && fileType != null) {
                        if (that.config.gifFileSingleSizeLimit && (fileType.indexOf("image") > -1 && file.ext == "gif") && file.size > that.config.gifFileSingleSizeLimit) {
                            overGifLimitSize = true;
                        } else if (that.config.imageFileSingleSizeLimit && (fileType.indexOf("image") > -1 && "png,jpg,jpeg".indexOf(file.ext) > -1) && file.size > that.config.imageFileSingleSizeLimit) {
                            overImageLimitSize = true;
                        }
                    }
                }
                //
                if (overImageLimitSize) {
                    that.removeFiles([file]);
                    if (that.errorCallbackFunction) {
                        that.errorCallbackFunction("图片文件过大", file);
                    }
                } else if (overGifLimitSize) {
                    that.removeFiles([file]);
                    if (that.errorCallbackFunction) {
                        that.errorCallbackFunction("gif文件过大", file);
                    }
                } else {
                    uploadedFilesInfo.fileNum++;
                    uploadedFilesInfo.files.push({"fileName": file.name, "fileId": file.id});
                }

                if (queuedCallbackFun) {
                    queuedCallbackFun(uploadedFilesInfo);
                }
                //
                if (thumbCallbackFun) {
                    that.makeThumb(thumbCallbackFun);
                }
            });
        }
    },
    makeThumb: function (thumbCallbackFun) {
        console.log("makeThumb=");
        this.uploader.makeThumb(files[0], function (error, src) {
            if (error) {
                return;
            }
        }, this.config.thumbnailWidth, this.config.thumbnailHeight);
    },
    startUpload: function (startCallbackFunction) {

        this.uploader.on('startUpload', function () {

            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    },
    stopUpload: function (startCallbackFunction) {

        this.uploader.on('stopUpload', function () {
            if (startCallbackFunction) {
                startCallbackFunction();
            }
        });

    },
    uploadFinished: function (finishedCallbackFunction) {

        this.uploader.on('uploadFinished', function () {
            if (finishedCallbackFunction) {
                finishedCallbackFunction();
            }
        });

    },
    uploadBeforeSend: function () {

        var thatUploadSetting = this.uploadSetting;

        var storeFileNamePrefix = thatUploadSetting.storeFileNamePrefix;
        var that = this;
        //局部设置，给每个独立的文件上传请求参数设置，每次发送都会发送此对象中的参数
        that.uploader.on('uploadBeforeSend', function (block, data, headers) {
            // file为分块对应的file对象。
            data.file = block.file;

            var storeFileFullName = null;
            var suffix = null;

            if (block.file.name.lastIndexOf(".") >= 0) {
                suffix = block.file.name.substr(block.file.name.lastIndexOf("."))
            }
            var nowDate = new Date();

            var year = nowDate.getFullYear();
            var month = nowDate.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var day = nowDate.getDate();
            if (day < 10) {
                day = "0" + day;
            }
            //
            var fileType = data.file.type;
            if (fileType != undefined && fileType != null) {
                if (fileType.indexOf("image") > -1 || data.file.ext == "gif") {
                    storeFileNamePrefix = thatUploadSetting.storeFileNamePrefix;
                    data.token = thatUploadSetting.uploadToken;
                } else if (fileType.indexOf("video") > -1 || "mp4,ogg,mov".indexOf(data.file.ext) > -1) {
                    storeFileNamePrefix = thatUploadSetting.storeFileNamePrefix;
                    data.token = thatUploadSetting.uploadToken;
                }
            }

            //
            if (storeFileFullName == null && suffix !== null) {
                if (that.config.isEditor) {
                    storeFileFullName = storeFileNamePrefix + MobooLib.Functions.generateGUID(16, 64, true) + suffix.toLowerCase();
                } else {
                    storeFileFullName = storeFileNamePrefix + year + '-' + month + '-' + day + '-' + MobooLib.Functions.generateGUID(12, 64, true) + suffix.toLowerCase();
                }
            }

            data.key = storeFileFullName;
        });
    },
    uploadProgress: function (progressCallbackFunction) {

        var uploadStartTime = new Date().getTime();
        var uploadTime = 0;
        var uploadFileSize = 0;
        var loaded = 0;

        this.uploader.on('uploadProgress', function (file, percentage) {
            uploadTime = new Date().getTime() - uploadStartTime;
            uploadFileSize = file.size;
            loaded = uploadFileSize * percentage;

            var progressInfo = {
                "fileName": file.name,
                "fileId": file.id,
                "percent": Math.ceil(percentage * 100),
                "speed": Math.ceil(loaded / uploadTime * 1000 * 10 / 1024 / 1024) / 10,//M/s
                "spentTime": Math.ceil(uploadTime),
                "remainTime": loaded > 0 ? Math.ceil(uploadTime * (uploadFileSize - loaded) / loaded / 1000) : 0,//秒
                "totalSize": Math.ceil(uploadFileSize * 10 / 1024 / 1024) / 10,//M 保留一位小数
                "uploadedSize": Math.ceil(loaded * 10 / 1024 / 1024) / 10
            };

            if (progressInfo.percent > 100) {
                $.extend(progressInfo, {"percent": 100})
            }
            //
            if (progressCallbackFunction) {
                progressCallbackFunction(progressInfo);
            }
        });
    },
    uploadSuccess: function (successCallbackFunction) {

        var uploadSetting = this.uploadSetting;

        var width = 0;
        var height = 0;
        var viewUrlPrefix = uploadSetting.viewUrlPrefix;
        var providerCode = uploadSetting.providerCode;
        var bucketCode = uploadSetting.bucketCode;
        var storeFileNamePrefix = uploadSetting.storeFileNamePrefix;
        this.uploader.on('uploadSuccess', function (file, response) {
            var data = response;
            var byteSize = data.fsize;
            //
            if (successCallbackFunction) {
                //
                var fileType = file.type;
                if (fileType != undefined && fileType != null) {
                    if (fileType.indexOf("image") > -1 || file.ext == "gif") {
                        viewUrlPrefix = uploadSetting.viewUrlPrefix;
                        providerCode = uploadSetting.providerCode;
                        bucketCode = uploadSetting.bucketCode;
                        storeFileNamePrefix = uploadSetting.storeFileNamePrefix;
                    } else if (fileType.indexOf("video") > -1 || "mp4,ogg,mov".indexOf(file.ext) > -1) {
                        viewUrlPrefix = uploadSetting.viewUrlPrefix;
                        providerCode = uploadSetting.providerCode;
                        bucketCode = uploadSetting.bucketCode;
                        storeFileNamePrefix = uploadSetting.storeFileNamePrefix;
                    }
                }

                var uploadedFileInfo = {
                    "fileName": file.name,
                    "fileId": file.id,
                    "origin": viewUrlPrefix + data.key,
                    "id": data.key,
                    "providerCode": providerCode,
                    "bucketCode": bucketCode,
                    "fileSize": Math.ceil(byteSize / 1024),
                    "width": width,
                    "height": height,
                    "mediaType": data.mediaType.code
                };

                if (data.mediaType != undefined && data.mediaType != null) {
                    //image
                    if ("image" == data.mediaType.code) {
                        var uploadedImageInfo = {
                            width: data.w,
                            height: data.h,
                            ave: data.ave
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedImageInfo);
                    } else if ("audio" == data.mediaType.code) {
                        var uploadedAudioInfo = {
                            duration: data.duration
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedAudioInfo);
                    } else if ("video" == data.mediaType.code) {
                        var uploadedVideoInfo = {
                            duration: data.duration,
                            width: data.w,
                            height: data.h
                        }

                        //
                        $.extend(uploadedFileInfo, uploadedVideoInfo);
                    }
                }

                //
                if (storeFileNamePrefix) {
                    var storeFileInfo = {
                        "prefixed": storeFileNamePrefix,
                        "uniqueId": uploadedFileInfo.id.replace(storeFileNamePrefix, "")
                    }

                    $.extend(uploadedFileInfo, storeFileInfo);
                }

                //  console.log("uploadedFileInfo=" + JSON.stringify(uploadedFileInfo));
                successCallbackFunction(uploadedFileInfo);
            }
        });

        this.uploader.reset();
    },
    uploadComplete: function (callbackFunction) {

        this.uploader.on('uploadComplete', function (file) {
            if (callbackFunction) {
                callbackFunction();
            }
        });
    },
    uploadError: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('uploadError', function (file, reason) {
            //文件上传失败，重新加上上传本文件
            //文件上传失败，重新加上上传本文件
            console.log("uploadError start. ");
            console.log("uploadError start" + reason);
            console.log("uploadError end ");

            if (reason != "abort" && reason != "http" && reason != "server") {
                //重新加入文件
                thatThis.uploader.addFiles(file);
            } else {
                if (errorCallbackFunction) {
                    errorCallbackFunction(file, reason);
                }
            }
        });
    },
    error: function (errorCallbackFunction) {
        var thatThis = this;
        thatThis.uploader.on('error', function (stateCode, stateId, file) {
            alert("error start.");
            var stateInf = "";
            if (stateCode == "Q_TYPE_DENIED") {
                stateInf += "文件格式错误";
            } else if (stateCode == "F_EXCEED_SIZE") {
                stateInf += "文件过大";
            } else if (stateCode == "Q_EXCEED_NUM_LIMIT") {
                stateInf += "文件添加数量过多";
            } else if (stateCode == "Q_EXCEED_SIZE_LIMIT") {
                stateInf += "文件添加文件的总大小过大";
            }

            // alert("error=" + stateInf);
            console.log("error=" + stateInf);
            console.log(file);
            errorCallbackFunction(stateInf, file);
        });
    },
    uploadAccept: function (callbackFunction) {
        this.uploader.on('uploadAccept', function (file, response) {
            // alert("uploadAccept=" + JSON.stringify(response));
            if (callbackFunction) {
                callbackFunction();
            }
        });
    },
    upload: function (callbackFunction) {
        //非自动上传时使用
        this.uploader.upload();
        if (callbackFunction) {
            callbackFunction();
        }
    },
    removeFiles: function (files) {

        for (var i = 0; i < files.length; i++) {
            this.uploader.removeFile(files[i], true);
        }
    },
    removeFilesById: function (ids) {
        for (var i = 0; i < ids.length; i++) {
            this.uploader.removeFile(ids[i], true);
        }
    },
    isMultiple: function () {

        return this.config.multiple;
    },
    setMultiple: function (multiple) {

        if (typeof  multiple == 'boolean') {
            this.config.multiple = multiple;
        }
    },
    setFileNumLimit: function (fileNumLimit) {
        this.config.fileNumLimit = fileNumLimit;
    }
};

//
FileUploader.createUploadImage = function (paramObj, imageUploadSetting) {
    return new FileUploader.UploadImage(paramObj, imageUploadSetting);
};

FileUploader.createUploadAudio = function (paramObj, uploadSetting) {
    return new FileUploader.UploadAudio(paramObj, uploadSetting);
};

FileUploader.createUploadVideo = function (paramObj, uploadSetting) {
    return new FileUploader.UploadVideo(paramObj, uploadSetting);
};

FileUploader.createUploadFlowPhoto = function (paramObj, uploadSetting) {
    return new FileUploader.UploadFlowPhoto(paramObj, uploadSetting);
};

FileUploader.createUploadBlob = function (blob, paramObj, uploadSetting) {
    return new FileUploader.UploadBlob(blob, paramObj, uploadSetting);
};
FileUploader.createUploadMultiFormatImage = function (paramObj, uploadSetting) {
    return new FileUploader.UploadMultiFormatImage(paramObj, uploadSetting);
};
