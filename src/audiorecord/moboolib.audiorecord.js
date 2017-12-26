/**
 * Created by Colr on 2017/5/5.
 */
var MobooLib = MobooLib || {};

MobooLib.AudioRecord = function (config, audioContext) {
    //
    this.config = config || {};
    //是否支持web audio api，user media for audio
    this.supportWebAudioApi = false;
    this.supportUserAudioMedia = false;
    //
    this.audioContext = audioContext;
    this.externalAudioContext = false;
    //
    this.inRecording = false;
    this.audioResource = null;
    this.scriptProcessor = null;
    this.recorderProcessor = null;
    //
    this.audioRecordData = null;
    //
    this.onRecordingListener = null;
    this.onErrorListener = null;
    this.onProgressListener = null;
    //
    this.realAudioInput = null;
    this.inputPoint = null;
    this.audioRecorder = null;

    this.init();
};

MobooLib.AudioRecord.prototype = {
    constructor: MobooLib.AudioRecord,
    setOnRecordingListener: function (listener) {
        this.onRecordingListener = listener;
    },
    //
    setOnErrorListener: function (listener) {
        this.onErrorListener = listener;
    },
    //
    setOnProgressListener: function (listener) {
        this.onProgressListener = listener;
    },
    setMaxDuration: function (secs) {
        this.config.maxDuration = secs || this.config.maxDuration;
    },
    init: function () {
        //the user media for audio.
        if (window.navigator) {
            window.navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (window.navigator.getUserMedia) {
                this.supportUserAudioMedia = true;
            } else {
                if (this.onErrorListener) {
                    this.onErrorListener("The browser dosen't support web audio recording.");
                }
            }
        }
    },
    launch: function () {
        //the web audio init.
        if (!this.audioContext) {
            //
            var AudioContext = window.AudioContext || window.webkitAudioContext;

            if (AudioContext) {
                this.supportWebAudioApi = true;
                this.audioContext = new AudioContext();
            } else {
                if (this.onErrorListener) {
                    this.onErrorListener("The browser dosen't support web audio api.");
                }
            }

        } else {
            this.supportWebAudioApi = true;
            this.externalAudioContext = true;
        }
    },
    release: function () {
        if (this.supportUserAudioMedia && this.supportWebAudioApi) {
            //
            if (!this.externalAudioContext && this.audioContext && this.audioContext.close) {
                this.audioContext.close();
                this.audioContext = null;
            }
        }
    },
    destroy: function () {
        this.release();
        //
        this.onRecordingListener = null;
        this.onErrorListener = null;
        this.onProgressListener = null;
    },
    //
    start: function () {
        //
        var that = this;
        if (this.supportUserAudioMedia) {
            this.launch();
            if (this.supportWebAudioApi) {

                if (!this.inRecording) {
                    if (!navigator.getUserMedia) {
                        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                    } else if (!navigator.cancelAnimationFrame) {
                        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
                    } else if (!navigator.requestAnimationFrame) {
                        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
                    }

                    navigator.getUserMedia(
                        {
                            "audio": {
                                "mandatory": {
                                    "googEchoCancellation": "false",
                                    "googAutoGainControl": "false",
                                    "googNoiseSuppression": "false",
                                    "googHighpassFilter": "false"
                                },
                                "optional": []
                            }
                        }, function (stream) {
                            that.record(stream);

                            that.inRecording = true;

                        }, function (error) {
                            var errorMessage = null;
                            //
                            switch (error.code || error.name) {
                                case 'PERMISSION_DENIED':
                                case 'PermissionDeniedError':
                                    errorMessage = '用户拒绝提供信息。';
                                    break;
                                case 'NOT_SUPPORTED_ERROR':
                                case 'NotSupportedError':
                                    errorMessage = '浏览器不支持硬件设备。';
                                    break;
                                case 'MANDATORY_UNSATISFIED_ERROR':
                                case 'MandatoryUnsatisfiedError':
                                    errorMessage = '无法发现指定的硬件设备。';
                                    break;
                                default:
                                    errorMessage = '未检测到麦克风';
                                    break;
                            }

                            if (that.onErrorListener) {

                                that.onErrorListener(errorMessage);
                            }

                        });
                } else {
                    console.warn("Recording in running.");
                }
            }
        } else {
            if (that.onErrorListener) {

                that.onErrorListener("浏览器不支持录音功能");
            }
        }

    },
    record: function (stream) {
        var that = this;


        this.inputPoint = this.audioContext.createGain();

        this.realAudioInput = this.audioContext.createMediaStreamSource(stream);
        this.realAudioInput.connect(that.inputPoint);

        this.audioRecorder = new MobooLib.AudioRecordData(that.inputPoint, {
            maxDuration: that.config.maxDuration,
            workerPath: that.config.workerPath
        });

        this.audioRecorder.setOnOverTimeListener(
            function () {
                that.stop();
            }
        );

        if (!this.audioRecorder) {
            return;
        }

        this.audioRecorder.clear();
        this.audioRecorder.record();

        //
        if (this.onRecordingListener) {
            this.onRecordingListener("start");
        }
        //
        this.audioRecorder.setOnProgressListener(that.onProgressListener);
    },
    stop: function () {

        if (!this.audioRecorder) {
            return;
        }
        this.audioRecorder.stop();

        this.audioRecorder.exportWAV();

        this.inRecording = false;

        if (this.onRecordingListener) {
            this.onRecordingListener("stop");
        }
        //
        this.release();
    },
    cancel: function () {
        this.audioRecorder.stop();
        this.inRecording = false;

        if (this.onRecordingListener) {
            this.onRecordingListener("cancel");
        }
        //
        this.release();
    },
    getWavData: function (callback) {
        //
        if (this.inRecording) {
            console.warn("Recording in running.");

            return;
        }
        //
        this.audioRecorder.setOnRecordingListener(callback);
    }
};


MobooLib.AudioRecordData = function (source, cfg) {
    this.config = cfg || {};
    this.bufferLen = this.config.bufferLen || 4096;
    this.source = source;
    this.context = source.context;
    //
    this.blob = null;
    //
    this.recording = false;
    //
    this.init();
};
MobooLib.AudioRecordData.prototype = {
    constructor: MobooLib.AudioRecordData,
    setOnProgressListener: function (listener) {
        this.onProgressListener = listener;
    },
    setOnRecordingListener: function (listener) {

        this.onRecordingListener = listener;
    },
    setOnOverTimeListener: function (listener) {
        this.onOverTimeListener = listener;
    },
    init: function () {
        var that = this;
        if (!this.context.createScriptProcessor) {
            this.recorderProcessor = this.context.createJavaScriptNode(that.bufferLen, 2, 2);
        } else {
            this.recorderProcessor = this.context.createScriptProcessor(that.bufferLen, 2, 2);
        }

        this.worker = new Worker(that.config.workerPath);
        this.worker.postMessage({
            command: 'init',
            config: {
                sampleRate: this.context.sampleRate
            }
        });
        //
        this.recorderProcessor.onaudioprocess = function (e) {
            if (!that.recording) return;
            that.worker.postMessage({
                command: 'record',
                buffer: [
                    e.inputBuffer.getChannelData(0),
                    e.inputBuffer.getChannelData(1)
                ]
            });
        };
        //
        this.worker.onmessage = function (e) {

            switch (e.data.command) {
                case "recording":

                    if (e.data.recordDuration > that.config.maxDuration) {

                        if (that.onOverTimeListener) {
                            that.onOverTimeListener();
                        }
                    }
                    //
                    var result = 0;
                    for (var i = 0; i < e.data.buffer.length; i++) {
                        result += Math.abs(e.data.buffer[i]);
                    }

                    var frequency = result / e.data.buffer.length;

                    var time = e.data.recordDuration;
                    if (that.onProgressListener) {
                        that.onProgressListener(e.data.recordDuration, frequency);
                    }
                    break;
                case "exportBlob":
                    var blob = e.data.audioBlob;
                    if (that.onRecordingListener) {
                        that.onRecordingListener(blob);
                    }

                    break;
            }
        };
        //
        this.source.connect(that.recorderProcessor);
        this.recorderProcessor.connect(that.context.destination);
    },
    record: function () {
        this.recording = true;
    },
    stop: function () {
        this.recording = false;
    },
    clear: function () {
        this.worker.postMessage({command: 'clear'});
    },
    exportWAV: function (type) {
        var type = type || this.config.type || 'audio/wav';

        this.worker.postMessage({
            command: 'exportWAV',
            type: type
        });
    },
    exportMonoWAV: function (type) {
        var type = type || this.config.type || 'audio/wav';

        this.worker.postMessage({
            command: 'exportMonoWAV',
            type: type
        });
    }
};


