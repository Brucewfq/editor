/**
 * Created by Bruce wan on 2017/8/4 .
 */
var MobooLib = MobooLib || {};

(function (factory) {
    "use strict";
    //
    MobooLib['Popups'] = factory();
})(function () {
    "use strict";
    var Popups, promptModal;

    Popups = {
        alert: function (message, callback) {
            var params = {
                type: "alert",
                title: "提示",
                message: message,
                callback: callback
            };

            if (!promptModal) {
                promptModal = _generateDom(params);

                var promptModalElements = document.getElementsByClassName("prompt-modal");
                if (promptModalElements && promptModalElements.length > 0) {
                    for (var i = 0; i < promptModalElements.length; i++) {
                        document.body.removeChild(promptModalElements[i]);
                    }
                }

                document.body.appendChild(promptModal);
            }

            //show popup
            if (promptModal) {
                _fadeIn(promptModal);
            }
        },
        confirm: function (message, callback) {
            var params = {
                type: "confirm",
                message: message,
                callback: callback
            };

            if (!promptModal) {
                promptModal = _generateDom(params);

                var promptModalElements = document.getElementsByClassName("prompt-modal");
                if (promptModalElements && promptModalElements.length > 0) {
                    for (var i = 0; i < promptModalElements.length; i++) {
                        document.body.removeChild(promptModalElements[i]);
                    }
                }

                document.body.appendChild(promptModal);
            }

            //show popup
            if (promptModal) {
                _fadeIn(promptModal);
            }
        },
        signonConfirm: function () {
            var sigonUrl = "/signon?successurl=" + window.location.href,
                params = {
                    type: "signon",
                    sigonUrl: sigonUrl
                };

            if (!promptModal) {
                promptModal = _generateDom(params);

                var promptModalElements = document.getElementsByClassName("prompt-modal");

                if (promptModalElements && promptModalElements.length > 0) {
                    for (var i = 0; i < promptModalElements.length; i++) {
                        document.body.removeChild(promptModalElements[i]);
                    }
                }

                document.body.appendChild(promptModal);
            }

            //show popup
            if (promptModal) {
                _fadeIn(promptModal);
            }
        },
        signonBlankPageConfirm: function (blankUrl) {
            var sigonUrl = "/signon?successurl=" + blankUrl ? blankUrl : window.location.href,
                params = {
                    type: "signon",
                    sigonUrl: sigonUrl
                };

            if (!promptModal) {
                promptModal = _generateDom(params);

                var promptModalElements = document.getElementsByClassName("prompt-modal");
                if (promptModalElements && promptModalElements.length > 0) {
                    for (var i = 0; i < promptModalElements.length; i++) {
                        document.body.removeChild(promptModalElements[i]);
                    }
                }

                document.body.appendChild(promptModal);
            }
            //show popup
            _fadeIn(promptModal);
        },
        signonProcess: function () {
            this.signonConfirm();
        },
        signonByBlankPageProcess: function (blankUrl) {
            this.signonBlankPageConfirm(blankUrl);
        },
        ajaxExceptionProcess: function (data) {
            if (data && data.code === -2) {
                this.signonProcess();
            } else {
                if (data && data.desc) {
                    this.alert(data.desc, function (returnValue) {
                        if (data.id === 107002) {
                            window.location.href = window.location.protocol + '//' + window.location.host;
                        }
                    });
                } else {
                    this.alert("网络异常！");
                }
            }
        }
    };

    //////////////////
    function _generateDom(params) {
        var options = {
                type: params.type || "alert",
                sigonUrl: params.sigonUrl || "",
                title: params.title || "",
                message: params.message || "",
                callback: params.callback || null
            },
            popupWrapContainer, popupContainer, closeBtn, popupTitle, popupText, buttons, confirmBtn, signonBtn,
            cancelBtn;
        //
        popupWrapContainer = document.createElement("div");
        popupWrapContainer.setAttribute("class", "prompt-modal");

        popupContainer = document.createElement("div");
        popupContainer.setAttribute("class", "prompt-box");

        closeBtn = document.createElement("span");
        closeBtn.setAttribute("class", "popup-cancel");

        //
        if (options.title !== "") {
            popupTitle = document.createElement("strong");
            popupTitle.setAttribute("class", "popup-title");
            popupTitle.textContent = options.title;

            popupContainer.appendChild(popupTitle);
        }

        popupText = document.createElement("p");
        popupText.setAttribute("class", "popup-text");
        popupText.innerHTML = options.message;

        //
        popupContainer.appendChild(closeBtn);
        popupContainer.appendChild(popupText);

        popupWrapContainer.appendChild(popupContainer);

        //
        if (options.type === "alert") {
            //
            confirmBtn = document.createElement("button");
            confirmBtn.setAttribute("class", "popup_confirm");
            confirmBtn.textContent = "确定";

            popupContainer.appendChild(confirmBtn);
            //
            confirmBtn.addEventListener("click", function () {
                _fadeOut(popupWrapContainer, function () {

                    promptModal = null;
                    if (typeof options.callback === "function") {
                        options.callback(true);
                    }
                });
            }, false);
        } else if (options.type === "signon") {
            popupText.textContent = "你还没有登录，请登录";

            //
            signonBtn = document.createElement("a");
            signonBtn.setAttribute("class", "popup_confirm");
            signonBtn.setAttribute("href", options.sigonUrl);
            signonBtn.textContent = "登录";

            popupContainer.appendChild(signonBtn);
        } else if (options.type === "confirm") {
            //
            buttons = document.createElement("div");
            buttons.setAttribute("class", "popup_btns");

            cancelBtn = document.createElement("button");
            cancelBtn.setAttribute("class", "popup_cancel");
            cancelBtn.textContent = "取消";

            confirmBtn = document.createElement("button");
            confirmBtn.setAttribute("class", "popup_ok");
            confirmBtn.textContent = "确定";

            buttons.appendChild(cancelBtn);
            buttons.appendChild(confirmBtn);

            //
            popupContainer.appendChild(buttons);

            ////////////////////////////////////////
            //bind event
            cancelBtn.addEventListener("click", function () {
                _fadeOut(popupWrapContainer, function () {
                    promptModal = null;

                    if (typeof options.callback === "function") {
                        options.callback(false);
                    }
                });
            }, false);

            confirmBtn.addEventListener("click", function () {
                promptModal = null;

                _fadeOut(popupWrapContainer, function () {
                    if (typeof options.callback === "function") {
                        options.callback(true);
                    }
                });
            }, false);
        }

        /////
        closeBtn.addEventListener("click", function () {
            promptModal = null;

            _fadeOut(popupWrapContainer, function () {
                if (typeof options.callback === "function") {
                    options.callback(false);
                }
            });
        }, false);

        //
        return popupWrapContainer;
    }

    function _fadeIn(obj) {
        var opacity = 0;

        (function autoFadeIn() {
            opacity += 0.05;
            if (obj) {
                obj.style.opacity = opacity;
            }

            if (opacity <= 1) {
                setTimeout(autoFadeIn, 20);
            } else {
                if (obj) {
                    obj.style.display = "block";
                }
            }
        })();
    }

    function _fadeOut(obj, callback) {
        var opacity = 1;

        (function autoFadeOut() {
            opacity -= 0.05;

            if (obj) {
                obj.style.opacity = opacity;
            }

            if (opacity > 0) {
                setTimeout(autoFadeOut, 20);
            } else {
                if (obj) {
                    obj.style.opacity = 0;
                    obj.style.display = "none";
                }

                if (typeof callback === "function") {
                    callback();
                }
            }
        })();
    }

    //
    return Popups;
});
