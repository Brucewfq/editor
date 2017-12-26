/**
 * Created by Colr on 2017/4/25.
 */
var MobooLib = MobooLib || {};

MobooLib.AudioRecord02 = function (config, audioContext) {
    //
    this.config = {};
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

    this.init();
};

MobooLib.AudioRecord02.prototype = {
    //
    constructor: MobooLib.AudioRecord02,
    //
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
    //
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

            //config
            this.config = {
                sampleBits: this.config.sampleBits || 16,  //采样数位 8, 16
                sampleRate: this.config.sampleRate || this.audioContext.sampleRate / 2,   //采样率(1/6 48000)
                maxDuration: this.config.maxDuration || 300 //最大录音时长限制。默认5分钟。
            };
        } else {
            this.supportWebAudioApi = true;
            this.externalAudioContext = true;
        }
    },
    release: function () {
        if (this.supportUserAudioMedia && this.supportWebAudioApi) {
            //
            if (this.recorderProcessor) {
                this.recorderProcessor.disconnect();
                this.recorderProcessor = null;
            }

            if (this.audioResource) {
                this.audioResource.disconnect();
                this.audioResource = null;
            }

            if (this.audioRecordData) {
                this.audioResource = null;
            }

            //
            if (!this.externalAudioContext && this.audioContext && this.audioContext.close) {
                this.audioContext.close();
                this.audioContext = null;
            }
        }
    },
    destroy: function () {
        //
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

        //
        if (this.supportUserAudioMedia) {
            //
            this.launch();

            //
            if (this.supportWebAudioApi) {
                //
                if (!this.inRecording) {
                    window.navigator.getUserMedia(
                        {
                            audio: true
                        },
                        function (stream) {
                            //
                            that.record(stream);
                            that.inRecording = true;
                        },
                        function (error) {

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

                            //
                            if (that.onErrorListener) {

                                that.onErrorListener(errorMessage);
                            }
                        }
                    );
                } else {
                    console.warn("Recording in running.");
                }
            }
        } else {
            //
            if (that.onErrorListener) {

                that.onErrorListener("你使用的浏览器不支持录音功能");
            }
        }
    },
    //
    record: function (audioStream) {
        if (this.supportUserAudioMedia && this.supportWebAudioApi && this.audioContext) {
            //
            var that = this;

            //
            this.audioResource = this.audioContext.createMediaStreamSource(audioStream);
            this.scriptProcessor = this.audioContext.createScriptProcessor || this.audioContext.createJavaScriptNode;
            this.recorderProcessor = this.scriptProcessor.apply(this.audioContext, [4096, 2, 2]);

            if (this.audioResource) {
                this.audioResource.connect(this.recorderProcessor);
                this.recorderProcessor.connect(this.audioContext.destination);
            }

            //
            this.audioRecordData = new MobooLib.audioRecordData(this.config.maxDuration, this.audioContext.sampleRate, 16, this.config.sampleRate, this.config.sampleBits);

            //
            if (this.onRecordingListener) {
                this.onRecordingListener("start");
            }
            this.audioRecordData.setOnProgressListener(this.onProgressListener);
            this.audioRecordData.setOnOverTimeListener(
                function () {
                    that.stop();
                }
            );

            //
            this.recorderProcessor.onaudioprocess = function (event) {
                that.audioRecordData.append(event.inputBuffer.getChannelData(0));
            };

            //
            if (this.onProgressListener) {
                this.onProgressListener(0.0);
            }
        }
    },
    cancel: function () {
        if (this.supportUserAudioMedia && this.supportWebAudioApi) {
            if (this.recorderProcessor && this.inRecording) {
                //
                this.recorderProcessor.disconnect();
                this.inRecording = false;

                //
                this.release();

                if (this.onRecordingListener) {
                    this.onRecordingListener("cancel");
                }
            } else {
                console.warn("No recording in running.");
            }
        }
    },
    stop: function () {
        if (this.supportUserAudioMedia && this.supportWebAudioApi) {
            if (this.recorderProcessor && this.inRecording) {
                //
                this.recorderProcessor.disconnect();
                this.inRecording = false;
                //
                this.release();

                if (this.onRecordingListener) {
                    this.onRecordingListener("stop");
                }
            } else {
                console.warn("No recording in running.");
            }
        }
    },
    //
    getWavData: function () {
        //
        if (this.inRecording) {
            console.warn("Recording in running.");

            return;
        }

        return this.audioRecordData.encodeWAV();
    }
};

MobooLib.audioRecordData02 = function (maxDuration, inputSampleRate, inputSampleBits, outputSimpleRate, outputSimpleBits) {
    //
    this.size = -1;          //录音文件长度
    this.buffer = [];     //录音缓存
    //
    this.maxDuration = maxDuration;   //最大录音时长
    this.inputSampleRate = inputSampleRate;   //输入采样率
    this.inputSampleBits = inputSampleBits;      //输入采样数位 8, 16
    this.outputSampleRate = outputSimpleRate;   //输出采样率
    this.outputSampleBits = outputSimpleBits;      //输出采样数位 8, 16
    //
    this.onProgressListener = null;
    this.onOverTimeListener = null;
};

MobooLib.audioRecordData02.prototype = {
    //
    constructor: MobooLib.audioRecordData02,
    //
    setOnProgressListener: function (listener) {
        this.onProgressListener = listener;
    },
    setOnOverTimeListener: function (listener) {
        this.onOverTimeListener = listener;
    },
    //
    append: function (data) {
        //
        if (this.size >= this.inputSampleRate * this.maxDuration) {
            //
            if (this.onOverTimeListener) {
                this.onOverTimeListener();
            }

            //
            return;
        }

        //
        if (this.size > -1) {
            this.buffer.push(new Float32Array(data));
            this.size += data.length;

            var result = 0, offset = 0;
            for (var i = 0; i < data.length; i++) {
                offset += Math.abs(data[i]);
            }
            result = offset / data.length;

            //
            if (this.onProgressListener) {
                this.onProgressListener(this.size / this.inputSampleRate);
            }
        } else {
            this.size = 0;
        }
    },
    compress: function () {
        //合并
        var data = new Float32Array(this.size);
        var offset = 0;
        for (var i = 0; i < this.buffer.length; i++) {
            data.set(this.buffer[i], offset);
            offset += this.buffer[i].length;
        }

        //压缩
        var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
        //   console.log(compression)
        var length = data.length / compression;
        var result = new Float32Array(parseInt(length));
        var index = 0, j = 0;
        while (index < length) {
            result[index] = data[j];
            j += compression;
            index++;
        }

        return result;
    },
    encodeWAV: function () {
        //
        var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
        var sampleBits = Math.min(this.inputSampleBits, this.outputSampleBits);

        //
        var bytes = this.compress();

        //
        var dataLength = bytes.length * (sampleBits / 8);
        var buffer = new ArrayBuffer(44 + dataLength);
        var data = new DataView(buffer);

        var channelCount = 1;//单声道
        var offset = 0;

        //
        var writeString = function (str) {
            for (var i = 0; i < str.length; i++) {
                data.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        // 资源交换文件标识符
        writeString('RIFF');
        offset += 4;
        // 下个地址开始到文件尾总字节数,即文件大小-8
        data.setUint32(offset, 36 + dataLength, true);
        offset += 4;
        // WAV文件标志
        writeString('WAVE');
        offset += 4;
        // 波形格式标志
        writeString('fmt ');
        offset += 4;
        // 过滤字节,一般为 0x10 = 16
        data.setUint32(offset, 16, true);
        offset += 4;
        // 格式类别 (PCM形式采样数据)
        data.setUint16(offset, 1, true);
        offset += 2;
        // 通道数
        data.setUint16(offset, channelCount, true);
        offset += 2;
        // 采样率,每秒样本数,表示每个通道的播放速度
        data.setUint32(offset, sampleRate, true);
        offset += 4;
        // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
        data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true);
        offset += 4;
        // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
        data.setUint16(offset, channelCount * (sampleBits / 8), true);
        offset += 2;
        // 每样本数据位数
        data.setUint16(offset, sampleBits, true);
        offset += 2;
        // 数据标识符
        writeString('data');
        offset += 4;
        // 采样数据总数,即数据总大小-44
        data.setUint32(offset, dataLength, true);
        offset += 4;

        // 写入采样数据
        if (sampleBits === 8) {
            for (var i = 0; i < bytes.length; i++, offset++) {
                var s = Math.max(-1, Math.min(1, bytes[i]));
                var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                val = parseInt(255 / (65535 / (val + 32768)));
                data.setInt8(offset, val, true);
            }
        } else {
            for (var i = 0; i < bytes.length; i++, offset += 2) {
                var s = Math.max(-1, Math.min(1, bytes[i]));
                data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        }

        return new Blob([data], {type: 'audio/wav'});
    }
};

