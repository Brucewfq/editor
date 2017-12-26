var MobooLib = MobooLib || {};

MobooLib.AudioCrop = function (config, audioCropContainer, audioContext) {
    //
    this.draw = this.draw.bind(this);
    //dom elements.
    this.audioCropContainer = audioCropContainer;
    //
    this.audioWaveContainer = null;
    this.waveCanvasDomElement = null;
    this.waveCropDomElement = null;
    //
    this.audioScrollContainer = null;
    this.scrollBarDomElement = null;
    //configure of the crop.
    this.config = {
        //
        width: config.width,
        height: config.height,
        //
        framesPerSec: config.framesPerSec || 10,
        frameWidth: config.frameWidth || 2,
        frameSplit: config.frameSplit || 1,
        frameValueMultiple: config.frameValueMultiple || 2,
        //
        frameDefaultColor: config.frameDefaultColor || "#c4c4c4",//背景默认色
        framePlayedColor: config.framePlayedColor || "#b04fc2",//
        frameUnPlayedColor: config.frameUnPlayedColor || "#656565",
        framePlayingColor: config.framePlayingColor || "transparent",
        //
        cropPaddingSecs: config.cropPaddingSecs || 2,
        cropMinSecs: config.cropMinSecs || 1,
        cropMaxSecs: config.cropMaxSecs || 15,
        cropBarWidth: config.cropBarWidth || 8,
        //
        scrollBarHeight: config.scrollBarHeight === undefined ? 10 : config.scrollBarHeight,
        //
        startSecs: config.startSecs || 0,//开始的秒数
        lengthSecs: config.lengthSecs || 15,//总时常用
        volume: config.volume === undefined ? 1.0 : config.volume, //音量
        //
        audioCropStyle: config.audioCropStyle || 'moboolib-audiocrop-container',
        waveCropStyle: config.waveCropStyle || 'moboolib-audiocrop-crop-root',
        cropBarLeftStyle: config.cropBarLeftStyle || 'moboolib-audiocrop-crop-left',
        cropBarRightStyle: config.cropBarRightStyle || 'moboolib-audiocrop-crop-right',
        scrollBarStyle: config.scrollBarStyle || 'moboolib-audiocrop-scroll-bar'
    };
    //
    this.onLoadedListener = null;
    //context
    this.audioContext = audioContext;
    this.externalAudioContext = false;
    this.audioWaveCanvasContext = null;
    //
    this.audioCropContainerWidth = 0;
    this.audioCropContainerHeight = 0;
    //source data.
    this.audioWaveDataArray = [];
    this.audioSourceBuffer = null;
    //the audio player.
    this.audioSource = null;
    this.audioGainNode = null;
    //
    this.audioInPlaying = false;
    this.pendingToStop = false;
    //
    this.audioLoaded = false;
    this.audioLoading = false;
    //需要渲染的帧的开始和结束，开始点可能<0。结束点不能大于duration - 1
    this.inScreenFrameIdxStart = 0;
    this.inScreenFrameIdxEnd = 0;
    this.inScreenFramesNum = 0;
    this.animationFrameId = 0;
    //用来计算当前播放的长度。
    this.audioPlayStartTime = 0;
    this.audioPlayedTime = -1;
    //用来表述当前crop的状态和方式。
    this.inCropping = false;
    this.adjustType = "0"; //1=left, 2= right, 3 = move.
    //
    this.audioDuration = 0;
    this.audioFrameNum = 0;
    this.adjustingHiddenFrameNum = 0;
    //
    this.cropPaddingFrameNum = 0;
    this.cropMaxFrameNum = 0;
    this.cropMinFrameNum = 0;
    //
    this.scrollBarWidth = 0;
    this.scrollPixelPerFrame = 0;
    //
    this.init();
};

MobooLib.AudioCrop.prototype = {
    //
    constructor: MobooLib.AudioCrop,
    //
    setOnLoadedListener: function (onLoadedListener) {
        //
        this.onLoadedListener = onLoadedListener;
    },
    //
    init: function () {
        //
        if (this.audioCropContainer) {
            this.audioCropContainerWidth = this.config.width || this.audioCropContainer.offsetWidth;
            this.audioCropContainerHeight = this.config.height || this.audioCropContainer.offsetHeight;
        }
    },
    //创建波形元素。
    generateWaveDomElement: function () {
        if (this.audioCropContainer) {
            //
            if (this.audioCropContainerWidth > 0 && this.audioCropContainerHeight > 0) {
                //the wave container
                if (!this.audioWaveContainer) {
                    this.audioWaveContainer = document.createElement("div");
                    this.audioWaveContainer.style.width = this.audioCropContainerWidth + "px";
                    this.audioWaveContainer.style.height = (this.audioCropContainerHeight - this.config.scrollBarHeight) + "px";
                    this.audioWaveContainer.style.position = "relative";
                    this.audioWaveContainer.style.webkitUserSelect = "none";
                    this.audioWaveContainer.style.left = "0";

                    this.audioCropContainer.appendChild(this.audioWaveContainer);

                    //
                    this.waveCanvasDomElement = document.createElement("canvas");
                    this.waveCanvasDomElement.setAttribute("width", this.audioCropContainerWidth + "px");
                    this.waveCanvasDomElement.setAttribute("height", (this.audioCropContainerHeight - this.config.scrollBarHeight) + "px");
                    this.waveCanvasDomElement.style.position = "absolute";
                    this.waveCanvasDomElement.style.webkitUserSelect = "none";
                    this.waveCanvasDomElement.style.left = "0";

                    this.audioWaveContainer.appendChild(this.waveCanvasDomElement);

                    //
                    this.audioWaveCanvasContext = this.waveCanvasDomElement.getContext("2d");

                    //the scroll container.
                    if (this.config.scrollBarHeight > 0) {
                        this.audioScrollContainer = document.createElement("div");
                        this.audioScrollContainer.style.width = this.audioCropContainerWidth + "px";
                        this.audioScrollContainer.style.height = this.config.scrollBarHeight + "px";
                        this.audioScrollContainer.style.position = "relative";
                        this.audioScrollContainer.style.webkitUserSelect = "none";

                        this.audioCropContainer.appendChild(this.audioScrollContainer);
                    }
                }
            } else {
                console.log("the audio crop container size is zero.");
            }
        }
    },
    //创建滚动条
    generateScrollDomElement: function () {
        if (this.config.scrollBarHeight > 0 && this.scrollBarDomElement === null
            && (this.audioFrameNum + this.cropPaddingFrameNum * 2 > this.inScreenFramesNum)) {
            //
            this.scrollBarDomElement = document.createElement('div');
            this.scrollBarDomElement.className = this.config.scrollBarStyle;


            this.audioScrollContainer.appendChild(this.scrollBarDomElement);

            //
            this.setDragEventListenersToScrollBar();
        }

        //
        if (this.scrollBarDomElement) {
            this.scrollBarDomElement.style.width = this.scrollBarWidth + "px";
            this.scrollBarDomElement.style.left = (this.adjustingHiddenFrameNum + this.cropPaddingFrameNum) * this.scrollPixelPerFrame + "px";
        }
    },
    //创建选择区域
    generateCropDomElement: function () {
        //
        if (this.waveCropDomElement === null) {
            this.waveCropDomElement = document.createElement('div');
            this.waveCropDomElement.className = this.config.waveCropStyle;

            var cropLeftBarElement = document.createElement("span");
            cropLeftBarElement.className = this.config.cropBarLeftStyle;
            cropLeftBarElement.style.width = this.config.cropBarWidth + "px";

            this.waveCropDomElement.appendChild(cropLeftBarElement);

            var cropRightBarElement = document.createElement("span");
            cropRightBarElement.className = this.config.cropBarRightStyle;
            cropRightBarElement.style.width = this.config.cropBarWidth + "px";

            this.waveCropDomElement.appendChild(cropRightBarElement);

            //
            this.audioWaveContainer.appendChild(this.waveCropDomElement);

            //add move event listener.
            this.setMoveEventListenersToCrop();
            this.setDraggingEventListenersToCrop();
        }

        //
        if (this.waveCropDomElement) {
            this.waveCropDomElement.style.left = this.calculateWidthByTime(this.config.startSecs) - this.calculateWidthByFrameNum(this.adjustingHiddenFrameNum) + "px";
            this.waveCropDomElement.style.width = this.calculateWidthByTime(this.config.lengthSecs) + "px";

            //
            var endSecs = this.config.lengthSecs + this.config.startSecs;
            this.waveCropDomElement.setAttribute('data-content', this.config.lengthSecs.toFixed(1) + 's');

            //
            this.waveCropDomElement.children[0].setAttribute('data-content', (this.config.startSecs.toFixed(1) + 's'));
            this.waveCropDomElement.children[1].setAttribute('data-content', (endSecs.toFixed(1) + 's'));
        }
    },
    initCropData: function () {
        //fixed nums.
        this.audioFrameNum = this.audioWaveDataArray.length - 1;
        this.inScreenFramesNum = this.calculateFrameNumByWidth(this.audioCropContainerWidth);
        this.cropPaddingFrameNum = this.calculateFrameNumByTime(this.config.cropPaddingSecs);

        this.audioDuration = this.audioFrameNum / this.config.framesPerSec;

        //
        if (this.config.startSecs >= this.audioDuration) {
            this.config.startSecs = Math.max(0, this.audioDuration - this.config.lengthSecs);
            this.config.lengthSecs = Math.min(this.config.lengthSecs, this.audioDuration - this.config.startSecs);
        } else {
            this.config.lengthSecs = Math.min(this.config.lengthSecs, this.audioDuration - this.config.startSecs);
        }

        //
        var cropStartFrameIdx = this.calculateFrameNumByTime(this.config.startSecs);

        if (this.audioFrameNum <= this.inScreenFramesNum - this.cropPaddingFrameNum * 2) {
            this.adjustingHiddenFrameNum = -this.cropPaddingFrameNum;
        } else if (this.audioFrameNum - cropStartFrameIdx - 1 >= this.inScreenFramesNum - this.cropPaddingFrameNum * 2) {
            this.adjustingHiddenFrameNum = cropStartFrameIdx - this.cropPaddingFrameNum;
        } else {
            this.adjustingHiddenFrameNum = this.audioFrameNum - this.inScreenFramesNum + this.cropPaddingFrameNum;
        }

        this.inScreenFrameIdxStart = this.adjustingHiddenFrameNum + 1;
        this.inScreenFrameIdxEnd = this.inScreenFrameIdxStart + this.inScreenFramesNum - 1;

        //
        this.cropMinFrameNum = Math.min(this.calculateFrameNumByTime(this.config.cropMinSecs), this.audioFrameNum);
        this.cropMaxFrameNum = Math.min(Math.min(this.calculateFrameNumByTime(this.config.cropMaxSecs), this.audioFrameNum), this.inScreenFramesNum - this.cropPaddingFrameNum * 2);

        //
        this.scrollBarWidth = Math.floor(this.inScreenFramesNum * this.inScreenFramesNum / (this.audioFrameNum + this.cropPaddingFrameNum * 2) * (this.config.frameWidth + this.config.frameSplit));
        this.scrollPixelPerFrame = (this.audioCropContainerWidth - this.scrollBarWidth) / (this.audioFrameNum + this.cropPaddingFrameNum * 2 - this.inScreenFramesNum);
    },
    //
    setCropContainer: function (audioCropContainer) {
        //
        this.audioCropContainer = audioCropContainer;

        //
        this.audioCropContainerWidth = this.config.width || this.audioCropContainer.offsetWidth;
        this.audioCropContainerHeight = this.config.height || this.audioCropContainer.offsetHeight;
    },
    //
    loadAudio: function (audioFileUrl, config) {
        if (!this.audioContext) {
            //the audio context
            var AudioContext = window.AudioContext || window.webkitAudioContext;

            //
            if (AudioContext) {
                this.audioContext = new AudioContext();
            }
        } else {
            this.externalAudioContext = true;
        }

        //load
        if (config) {
            this.config.startSecs = config.startSecs === undefined ? this.config.startSecs : config.startSecs;
            this.config.lengthSecs = config.lengthSecs === undefined ? this.config.lengthSecs : config.lengthSecs;
            this.config.volume = config.volume === undefined ? this.config.volume : config.volume;
            this.config.cropMinSecs = config.cropMinSecs === undefined ? this.config.cropMinSecs : config.cropMinSecs;
            this.config.cropMaxSecs = config.cropMaxSecs === undefined ? this.config.cropMaxSecs : config.cropMaxSecs;
        }

        //
        this.audioCropContainer.setAttribute('data-content', '声音波形绘制中...');
        this.audioCropContainer.className = this.config.audioCropStyle;

        //
        if (this.audioLoaded && this.audioInPlaying) {
            this.stopAudio();
            this.pendingToStop = false;
        }

        //
        var that = this;
        var request = new XMLHttpRequest();

        //
        request.open('GET', audioFileUrl, true);
        request.responseType = 'arraybuffer';

        //
        request.onreadystatechange = function (progressEvent) {
            if (progressEvent.currentTarget.readyState === XMLHttpRequest.DONE) {
                if (progressEvent.currentTarget.status === 200) {
                    if (!that.audioLoading && !that.audioLoaded) {
                        //
                        that.audioLoading = true;
                        // Decode asynchronously
                        if (that.audioContext) {

                            that.audioContext.decodeAudioData(
                                //
                                progressEvent.currentTarget.response,
                                //
                                function (buffer) {
                                    //
                                    if (!that.pendingToStop) {
                                        //
                                        that.audioSourceBuffer = buffer;

                                        //
                                        var channelDataArray = buffer.getChannelData(0);

                                        //
                                        that.audioPlayedTime = 0;

                                        //
                                        that.audioDuration = channelDataArray.length / that.audioContext.sampleRate;
                                        that.audioWaveDataArray = [];
                                        for (var i = 0; i < channelDataArray.length;) {
                                            that.audioWaveDataArray.push(channelDataArray[i]);
                                            i += that.audioContext.sampleRate / that.config.framesPerSec;
                                        }
                                        //
                                        that.audioLoaded = true;

                                        //after loading
                                        that.initCropData();

                                        //
                                        that.generateWaveDomElement();
                                        that.generateCropDomElement();
                                        that.generateScrollDomElement();

                                        //
                                        that.draw();
                                        that.playAudio();

                                        //
                                        if (that.onLoadedListener) {
                                            that.onLoadedListener();
                                        }
                                    }

                                    //
                                    if (that.audioLoaded) {
                                        that.audioCropContainer.setAttribute('data-content', '');
                                        that.audioCropContainer.className = '';
                                    }

                                },
                                function () {
                                    console.log("decode audio error: " + audioFileUrl);
                                }
                            );
                        } else {
                            that.audioCropContainer.setAttribute('data-content', '');
                            that.audioCropContainer.className = '';
                        }

                        //
                        that.audioLoading = false;
                    }
                } else {
                    console.log("decode audio error: " + audioFileUrl);
                }
            }
        };

        //
        request.ontimeout = function (e) {
            //
            that.audioCropContainer.setAttribute('data-content', '声波绘制超时...');
            that.audioCropContainer.className = this.config.audioCropStyle;

        };
        request.onerror = function (e) {
            that.audioCropContainer.setAttribute('data-content', '声波绘制失败...');
            that.audioCropContainer.className = this.config.audioCropStyle;
        };

        request.send();
    },
    draw: function () {
        this.animationFrameId = requestAnimationFrame(this.draw);

        this.drawWaves();
    },
    drawWaves: function () {
        //
        var playedTime = 0;

        if (this.audioPlayedTime < 0) {
            playedTime = this.audioContext.currentTime - this.audioPlayStartTime;
        } else {
            playedTime = this.audioPlayedTime;
        }

        if (this.inCropping && this.adjustType === 3) {
            //
            var adjustingLeft = this.waveCropDomElement.offsetLeft;
            var adjustingWidth = this.waveCropDomElement.offsetWidth;

            //pixels to frame numbers
            var adjustingLeftFrames = adjustingLeft / (this.config.frameSplit + this.config.frameWidth);
            var adjustingWidthFrames = adjustingWidth / (this.config.frameSplit + this.config.frameWidth);

            //move the whole crop window, change the hidden frame num.
            if (adjustingLeftFrames < this.cropPaddingFrameNum
                && this.inScreenFrameIdxStart > -(this.cropPaddingFrameNum - 1)) {
                this.adjustingHiddenFrameNum--;
                this.inScreenFrameIdxStart--;
                this.inScreenFrameIdxEnd--;
            } else if (adjustingLeftFrames + adjustingWidthFrames > this.inScreenFramesNum - this.cropPaddingFrameNum
                && this.inScreenFrameIdxEnd < this.audioFrameNum + this.cropPaddingFrameNum) {
                this.adjustingHiddenFrameNum++;
                this.inScreenFrameIdxStart++;
                this.inScreenFrameIdxEnd++;
            }

            //
            var scrollBarLeft = (this.adjustingHiddenFrameNum + this.cropPaddingFrameNum) * this.scrollPixelPerFrame;
            if (this.scrollBarDomElement) {
                this.scrollBarDomElement.style.left = scrollBarLeft + "px";
            }
        }

        //
        var audioStartFrameIdx = this.calculateFrameNumByTime(this.config.startSecs);
        var audioEndFrameIdx = this.calculateFrameNumByTime(this.config.startSecs + this.config.lengthSecs) - 1;
        var audioPlayedFrameIdx = this.calculateFrameNumByTime(this.config.startSecs + playedTime);

        //
        this.audioWaveCanvasContext.clearRect(0, 0, this.audioCropContainerWidth, this.audioCropContainerHeight - this.config.scrollBarHeight);

        //
        for (var i = this.inScreenFrameIdxStart; i < this.inScreenFramesNum + this.inScreenFrameIdxStart; i++) {
            //
            if (i < 0) {
                continue;
            }

            //
            var value = this.audioWaveDataArray[i] * (this.audioCropContainerHeight - this.config.scrollBarHeight) / 2 * this.config.frameValueMultiple;
            if (value < 1) {
                value = 1;
            }

            //
            if (i >= audioStartFrameIdx && i <= audioPlayedFrameIdx) {
                this.audioWaveCanvasContext.fillStyle = this.config.framePlayedColor;
            } else if (i > audioPlayedFrameIdx && i <= audioEndFrameIdx) {
                this.audioWaveCanvasContext.fillStyle = this.config.frameUnPlayedColor;
            } else {
                this.audioWaveCanvasContext.fillStyle = this.config.frameDefaultColor;
            }

            //
            this.audioWaveCanvasContext.fillRect(
                (i - this.adjustingHiddenFrameNum) * (this.config.frameSplit + this.config.frameWidth), (this.audioCropContainerHeight - this.config.scrollBarHeight - value) / 2,
                this.config.frameWidth, value
            );

            //
            if (i === audioPlayedFrameIdx) {
                this.audioWaveCanvasContext.fillStyle = this.config.framePlayingColor;
                this.audioWaveCanvasContext.fillRect(
                    (i - this.adjustingHiddenFrameNum) * (this.config.frameSplit + this.config.frameWidth), 0,
                    this.config.frameWidth, this.audioCropContainerHeight - this.config.scrollBarHeight
                );
            }
        }
    },
    playAudio: function () {
        //
        this.pendingToStop = false;

        //
        if (this.audioLoaded) {
            //
            if (this.audioSource) {
                this.audioSource.disconnect();
                this.audioSource = null;

                if (this.audioGainNode) {
                    this.audioGainNode.disconnect();
                    this.audioGainNode = null;
                }
            }

            //
            var that = this;

            //
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioSourceBuffer;

            // start playback, but make sure we stay in bound of the buffer.
            if (undefined === this.audioSource.start) {
                this.audioSource.start = this.audioSource.noteOn;
            }

            if (undefined === this.audioSource.stop) {
                this.audioSource.stop = this.audioSource.noteOff;
            }

            //
            this.audioSource.onended = function () {
                //
                that.audioPlayedTime = that.audioContext.currentTime - that.audioPlayStartTime;
                that.audioInPlaying = false;

                //
                if (!that.pendingToStop) {
                    that.playAudio();
                }
            };

            // Create a gain node.
            if (!this.audioContext.createGain) {
                this.audioContext.createGain = this.audioContext.createGainNode;
            }
            this.audioGainNode = this.audioContext.createGain();
            this.audioGainNode.gain.value = this.config.volume;

            /* this.audioSource.loop = true;
             this.audioSource.loopStart = this.config.startSecs;
             this.audioSource.loopEnd = this.config.startSecs + this.config.lengthSecs;*/

            // Connect the source to the gain node.
            this.audioSource.connect(this.audioGainNode);
            this.audioGainNode.connect(this.audioContext.destination);

            //
            this.audioPlayStartTime = this.audioContext.currentTime;
            this.audioPlayedTime = -1;
            this.audioInPlaying = true;
            /*console.log("startSecs:" + this.config.startSecs);
             console.log("lengthSecs" + this.config.lengthSecs);*/
            //
            this.audioSource.start(0, this.config.startSecs, this.config.lengthSecs);
        }
    },
    stopAudio: function () {
        //
        this.pendingToStop = true;
        //
        if (this.audioLoaded) {
            //
            if (this.audioSource) {
                if (this.audioInPlaying) {
                    this.audioSource.stop();
                }

                this.audioSource.disconnect();
                this.audioSource = null;

                //
                this.audioPlayedTime = this.audioContext.currentTime - this.audioPlayStartTime;
                this.audioInPlaying = false;

                //
                if (this.audioGainNode) {
                    this.audioGainNode.disconnect();
                    this.audioGainNode = null;
                }
            }
        }
    },
    setAudioVolume: function (volume) {
        //
        this.config.volume = volume;

        //
        if (this.audioGainNode) {
            this.audioGainNode.gain.value = this.config.volume;
        }
    },
    releaseAudio: function () {
        //destroy the canvas and audio context
        if (this.animationFrameId > 0) {
            cancelAnimationFrame(this.animationFrameId);
        }

        //the audio player.
        this.stopAudio();
        this.audioInPlaying = false;
        this.pendingToStop = false;

        this.audioWaveDataArray = [];
        this.audioSourceBuffer = null;

        //
        this.audioLoaded = false;

        //remove document
        this.audioCropContainer.innerHTML = "";
        this.audioWaveContainer = null;
        this.waveCropDomElement = null;
        this.scrollBarDomElement = null;

        //
        if (!this.externalAudioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        //
        this.config.startSecs = 0;//开始的秒数
        this.config.lengthSecs = 15;//总时常用
    },
    //
    destroy: function () {
        console.log("destroy");

        //
        this.releaseAudio();
    },
    //crop methods
    onCropAdjust: function (inCropping, adjustType) {
        //
        this.inCropping = inCropping;
        this.adjustType = adjustType;

        //
        var adjustingLeft = this.waveCropDomElement.offsetLeft;
        var adjustingWidth = this.waveCropDomElement.offsetWidth;

        //pixels to frame numbers
        var adjustingLeftFrames = adjustingLeft / (this.config.frameSplit + this.config.frameWidth);
        var adjustingWidthFrames = adjustingWidth / (this.config.frameSplit + this.config.frameWidth);
        //
        if (!this.inCropping) {
            //修正crop 窗口的位置
            //left bar is too left: move the crop left bar to right.
            if (adjustingLeftFrames < this.cropPaddingFrameNum) {
                //
                if (adjustType !== 3) {
                    //move bar, restore the left to padding, restore the width to padding.
                    adjustingWidthFrames += adjustingLeftFrames - this.cropPaddingFrameNum;
                    adjustingLeftFrames = this.cropPaddingFrameNum;

                    this.waveCropDomElement.style.left = this.calculateWidthByFrameNum(adjustingLeftFrames) + "px";
                    this.waveCropDomElement.style.width = this.calculateWidthByFrameNum(adjustingWidthFrames) + "px";
                } else {
                    //move window
                    adjustingLeftFrames = this.cropPaddingFrameNum;
                    this.waveCropDomElement.style.left = this.calculateWidthByFrameNum(adjustingLeftFrames) + "px";
                }
            }

            //right bar is too right. move the crop right bar to left.
            var rightLimitFrameNum = Math.min(this.inScreenFramesNum - this.cropPaddingFrameNum, this.audioFrameNum - this.adjustingHiddenFrameNum);

            //
            if (adjustingLeftFrames + adjustingWidthFrames > rightLimitFrameNum) {
                if (adjustType !== 3) {
                    //move bars
                    adjustingWidthFrames = rightLimitFrameNum - adjustingLeftFrames;

                    this.waveCropDomElement.style.width = this.calculateWidthByFrameNum(adjustingWidthFrames) + "px";
                } else {
                    //move window
                    adjustingLeftFrames = rightLimitFrameNum - adjustingWidthFrames;
                    this.waveCropDomElement.style.left = this.calculateWidthByFrameNum(adjustingLeftFrames) + "px";
                }
            }

            //
            this.config.startSecs = (adjustingLeftFrames + this.adjustingHiddenFrameNum) / this.config.framesPerSec;
            this.config.lengthSecs = adjustingWidthFrames / this.config.framesPerSec;

            //拿到计算过后的时间段
            var moveResult = this.calculationCropResult();
            var length = moveResult.end - moveResult.start;

            //
            this.waveCropDomElement.setAttribute('data-content', length.toFixed(1) + 's');
            this.waveCropDomElement.children[0].setAttribute('data-content', (moveResult.start + 's'));
            this.waveCropDomElement.children[1].setAttribute('data-content', (moveResult.end + 's'));

            //
            if (!this.pendingToStop) {
                this.playAudio();
            } else {
                this.audioPlayedTime = 0;
            }
        }
    },
    //选择区域向左向右拖动drag
    setDraggingEventListenersToCrop: function () {
        var that = this;
        //
        var dragBarElements = this.waveCropDomElement.children;
        for (var i = 0; i < dragBarElements.length; i++) {
            setDragEventListenersToBar(dragBarElements[i]);
        }

        function sendOutCropAdjustEvent(dragElement, className, inAdjusting, barType) {
            if (dragElement.className.indexOf(className) >= 0) {
                that.onCropAdjust(inAdjusting, barType);
            }
        }

        function setDragEventListenersToBar(dragBarElement) {
            //
            dragBarElement.onmousedown = function (ev) {
                var oEvent = ev || event;
                oEvent.cancelBubble = true;

                //
                var preXPosition = oEvent.clientX;

                var cropMaxWidth = (that.config.frameWidth + that.config.frameSplit) * that.cropMaxFrameNum;
                var cropMinWidth = (that.config.frameWidth + that.config.frameSplit) * that.cropMinFrameNum;

                //
                sendOutCropAdjustEvent(dragBarElement, that.config.cropBarRightStyle, true, 2);
                sendOutCropAdjustEvent(dragBarElement, that.config.cropBarLeftStyle, true, 1);

                //
                that.audioCropContainer.onmousemove = function (ev) {
                    var oEvent = ev || event;
                    //
                    var currentXPosition = oEvent.clientX;

                    var preCropDomElementLeft = that.waveCropDomElement.offsetLeft;
                    var preCropDomElementWidth = that.waveCropDomElement.offsetWidth;
                    var targetCropDomElementLeft = preCropDomElementLeft;
                    var targetCropDomElementWidth = preCropDomElementWidth;

                    //
                    var dragLength = Math.ceil((currentXPosition - preXPosition) / (that.config.frameSplit + that.config.frameWidth)) * (that.config.frameSplit + that.config.frameWidth);

                    //拿到计算过后的时间段
                    var moveResult = that.calculationCropResult();

                    //if drag the right bar.
                    if (dragBarElement.className.indexOf(that.config.cropBarRightStyle) >= 0) {
                        //
                        targetCropDomElementWidth = preCropDomElementWidth + dragLength;

                        //right just change the width.
                        if (preCropDomElementLeft + preCropDomElementWidth + dragLength > that.audioCropContainerWidth) {
                            targetCropDomElementWidth = that.audioCropContainerWidth - preCropDomElementLeft;
                        }

                        if (preCropDomElementWidth + dragLength < cropMinWidth) {
                            targetCropDomElementWidth = cropMinWidth;
                        }

                        if (preCropDomElementWidth + dragLength > cropMaxWidth) {
                            targetCropDomElementWidth = cropMaxWidth;
                        }

                        //
                        if (targetCropDomElementWidth !== preCropDomElementWidth) {
                            that.waveCropDomElement.style.width = targetCropDomElementWidth + "px";
                        }
                        dragBarElement.setAttribute('data-content', (moveResult.end) + 's');
                    }

                    //if drag the left bar.
                    if (dragBarElement.className.indexOf(that.config.cropBarLeftStyle) >= 0) {
                        //
                        targetCropDomElementWidth = preCropDomElementWidth - dragLength;
                        targetCropDomElementLeft = preCropDomElementLeft + dragLength;

                        //left need to change the width and left to keep the right.
                        if (preCropDomElementLeft + dragLength < 0) {
                            targetCropDomElementLeft = 0;
                            targetCropDomElementWidth = preCropDomElementWidth - (targetCropDomElementLeft - preCropDomElementLeft);
                        }

                        if (preCropDomElementWidth - dragLength < cropMinWidth) {
                            targetCropDomElementWidth = cropMinWidth;
                            targetCropDomElementLeft = preCropDomElementLeft + (preCropDomElementWidth - cropMinWidth);
                        }

                        if (preCropDomElementWidth - dragLength > cropMaxWidth) {
                            targetCropDomElementWidth = cropMaxWidth;
                            targetCropDomElementLeft = preCropDomElementLeft - (cropMaxWidth - preCropDomElementWidth);
                        }

                        //
                        if (targetCropDomElementWidth !== preCropDomElementWidth) {
                            that.waveCropDomElement.style.width = targetCropDomElementWidth + "px";
                        }

                        if (targetCropDomElementLeft !== preCropDomElementLeft) {
                            that.waveCropDomElement.style.left = targetCropDomElementLeft + "px";
                        }
                        dragBarElement.setAttribute('data-content', (moveResult.start) + 's')
                    }


                    var length = moveResult.end - moveResult.start;
                    that.waveCropDomElement.setAttribute('data-content', length.toFixed(1) + 's');

                    //
                    preXPosition += dragLength;
                };

                //
                that.audioCropContainer.onmouseup = function () {
                    //
                    that.audioCropContainer.onmousemove = null;
                    that.audioCropContainer.onmouseup = null;
                    that.audioCropContainer.onmouseout = null;

                    //
                    sendOutCropAdjustEvent(dragBarElement, that.config.cropBarRightStyle, false, 2);
                    sendOutCropAdjustEvent(dragBarElement, that.config.cropBarLeftStyle, false, 1);
                };
                //
                that.audioCropContainer.onmouseout = function (ev) {
                    var oEvent = ev || event;
                    var oTo = oEvent.toElement || oEvent.relatedTarget;
                    if (this.contains(oTo)) {
                        return;
                    }

                    that.audioCropContainer.onmousemove = null;
                    that.audioCropContainer.onmouseup = null;
                    that.audioCropContainer.onmouseout = null;

                    //
                    sendOutCropAdjustEvent(dragBarElement, that.config.cropBarRightStyle, false, 2);
                    sendOutCropAdjustEvent(dragBarElement, that.config.cropBarLeftStyle, false, 1);
                };

                return false;
            };
        }
    },
    //选择区域性移动
    setMoveEventListenersToCrop: function () {
        var that = this;
        //
        this.waveCropDomElement.onmousedown = function (ev) {
            var oEvent = ev || event;

            //
            var preXPosition = oEvent.clientX;

            //
            that.onCropAdjust(true, 3);

            //
            that.audioCropContainer.onmousemove = function (ev) {
                var oEvent = ev || event;

                //
                var currentXPosition = oEvent.clientX;

                var preCropDomElementLeft = that.waveCropDomElement.offsetLeft;
                var targetCropDomElementLeft = preCropDomElementLeft;

                //
                var moveLength = Math.ceil((currentXPosition - preXPosition) / (that.config.frameSplit + that.config.frameWidth)) * (that.config.frameSplit + that.config.frameWidth);

                //not move out of left or right
                if (preCropDomElementLeft + moveLength < 0) {
                    targetCropDomElementLeft = 0;
                } else if (preCropDomElementLeft + moveLength > that.audioCropContainerWidth - that.waveCropDomElement.offsetWidth) {
                    targetCropDomElementLeft = that.audioCropContainerWidth - that.waveCropDomElement.offsetWidth;
                } else {
                    targetCropDomElementLeft = preCropDomElementLeft + moveLength;
                }

                //
                if (targetCropDomElementLeft !== preCropDomElementLeft) {
                    //
                    that.waveCropDomElement.style.left = targetCropDomElementLeft + 'px';
                }

                //拿到计算过后的时间段
                var moveResult = that.calculationCropResult();
                var length = moveResult.end - moveResult.start;
                that.waveCropDomElement.setAttribute('data-content', length.toFixed(1) + 's');

                //
                that.waveCropDomElement.children[0].setAttribute('data-content', (moveResult.start + 's'));
                that.waveCropDomElement.children[1].setAttribute('data-content', (moveResult.end + 's'));

                //
                preXPosition += moveLength;
            };

            //
            that.audioCropContainer.onmouseup = function () {
                that.audioCropContainer.onmousemove = null;
                that.audioCropContainer.onmouseup = null;
                that.audioCropContainer.onmouseout = null;

                that.onCropAdjust(false, 3);
            };

            that.audioCropContainer.onmouseout = function () {
                that.audioCropContainer.onmousemove = null;
                that.audioCropContainer.onmouseup = null;
                that.audioCropContainer.onmouseout = null;

                that.onCropAdjust(false, 3);
            };

            return false;
        };
    },
    //
    setDragEventListenersToScrollBar: function () {
        var that = this;

        //
        this.scrollBarDomElement.onmousedown = function (ev) {
            var oEvent = ev || event;
            var preXPosition = oEvent.clientX;

            //
            that.onCropAdjust(true, 3);
            //

            that.audioCropContainer.onmousemove = function (ev) {
                var oEvent = ev || event;
                var currentXPosition = oEvent.clientX;

                //
                var preScrollBarLeft = that.scrollBarDomElement.offsetLeft;
                var targetScrollBarLeft = preScrollBarLeft;

                //
                var moveLength = Math.ceil((currentXPosition - preXPosition) / that.scrollPixelPerFrame) * that.scrollPixelPerFrame;

                //
                targetScrollBarLeft = targetScrollBarLeft + moveLength;

                if (preScrollBarLeft + moveLength < 0) {
                    targetScrollBarLeft = 0;
                }

                if (preScrollBarLeft + moveLength > that.audioCropContainerWidth - that.scrollBarWidth) {
                    targetScrollBarLeft = that.audioCropContainerWidth - that.scrollBarWidth;
                }

                //
                if (targetScrollBarLeft !== preScrollBarLeft) {
                    that.scrollBarDomElement.style.left = targetScrollBarLeft + "px";

                    //
                    var moveFrameNum = Math.ceil(targetScrollBarLeft / that.scrollPixelPerFrame);

                    //
                    that.adjustingHiddenFrameNum = -that.cropPaddingFrameNum + moveFrameNum;
                    that.inScreenFrameIdxStart = that.adjustingHiddenFrameNum;
                    that.inScreenFrameIdxEnd = that.inScreenFrameIdxStart + that.inScreenFramesNum;

                    //拿到计算过后的时间段
                    var moveResult = that.calculationCropResult();

                    //
                    that.waveCropDomElement.children[0].setAttribute('data-content', (moveResult.start + 's'));
                    that.waveCropDomElement.children[1].setAttribute('data-content', (moveResult.end + 's'));
                }

                //
                preXPosition += moveLength;
            };

            that.audioCropContainer.onmouseup = function () {
                that.audioCropContainer.onmousemove = that.audioCropContainer.onmouseup = that.audioCropContainer.onmouseout = null;
                that.onCropAdjust(false, 3);
            };

            that.audioCropContainer.onmouseout = function (ev) {
                var oEvent = ev || event;
                var target = oEvent.toElement || oEvent.relatedTarget;

                if (this.contains(target)) {
                    return;
                }

                that.audioCropContainer.onmousemove = that.audioCropContainer.onmouseup = that.audioCropContainer.onmouseout = null;
                that.onCropAdjust(false, 3);
            };

            return false;
        };
    },
    getCropResult: function () {
        return {
            start: this.config.startSecs,
            length: this.config.lengthSecs,
            volume: this.config.volume * 1.0
        };
    },
    //
    calculateFrameNumByTime: function (time) {
        var returnValue = 0;

        returnValue = Math.ceil(time * this.config.framesPerSec);

        return returnValue;
    },
    calculateFrameNumByWidth: function (width) {
        var returnValue = 0;

        returnValue = Math.ceil(width / (this.config.frameWidth + this.config.frameSplit));

        return returnValue;
    },
    calculateWidthByFrameNum: function (num) {
        var returnValue = 0;

        returnValue = (this.config.frameWidth + this.config.frameSplit) * num;

        return returnValue;
    },
    calculateWidthByTime: function (time) {
        var returnValue = 0;

        returnValue = Math.ceil(time * this.config.framesPerSec * (this.config.frameWidth + this.config.frameSplit));

        return returnValue;
    },
    calculationCropResult: function () {
        //
        var adjustingLeft = this.waveCropDomElement.offsetLeft;
        var adjustingWidth = this.waveCropDomElement.offsetWidth;

        //pixels to frame numbers
        var adjustingLeftFrames = adjustingLeft / (this.config.frameSplit + this.config.frameWidth);
        var adjustingWidthFrames = adjustingWidth / (this.config.frameSplit + this.config.frameWidth);
        var startSecs = (adjustingLeftFrames + this.adjustingHiddenFrameNum) / this.config.framesPerSec;
        var endSecs = (adjustingLeftFrames + this.adjustingHiddenFrameNum + adjustingWidthFrames) / this.config.framesPerSec;

        if (startSecs < 0) {
            startSecs = 0
        }

        //
        return {
            start: startSecs.toFixed(1),
            end: endSecs.toFixed(1)
        }
    }
};
