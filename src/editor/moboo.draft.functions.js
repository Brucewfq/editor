var Moboo = Moboo || {};

Moboo.Functions = {
    generateUniqueId: function () {
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
        var hour = nowDate.getHours();
        if (hour < 10) {
            hour = "0" + hour;
        }


        return "" + year + month + day + hour + MobooLib.Functions.generateGUID(5, 64, true);
    },
    //
    getElasticImageResolution: function (width, height, referSize) {
        var rate = width / height;
        var imageWidth, imageHeight, imageRate;

        //
        if (rate < 9 / 16) {
            //
            imageRate = referSize / width;
            imageWidth = referSize;
            imageHeight = height * imageRate;
        } else if (rate >= 9 / 16 && rate <= 1) {
            //
            imageRate = referSize / width;
            imageWidth = referSize;
            imageHeight = height * imageRate;
        } else if (rate > 1) {
            //
            imageRate = referSize / height;
            imageWidth = width * imageRate;
            imageHeight = referSize;
        } else {
            //
            imageWidth = referSize;
            imageHeight = referSize * 16 / 9;
        }

        //
        return {
            w: Math.ceil(imageWidth),
            h: Math.ceil(imageHeight)
        }
    },
    getSectionScreenPixel: function (audioDuration) {
        var sectionScreenPixel = 0;
        var duration = audioDuration * 1000;
        var screenHeightConstant = parseInt(Moboo.DraftConstants.SECTION_WIDTH.DEFAULT * 16 / 9);

        if (duration >= 1000 && duration <= 3000) {
            sectionScreenPixel = screenHeightConstant * 1.1;
        } else if (duration <= 6000) {
            sectionScreenPixel = screenHeightConstant * 2.2;
        } else if (duration <= 9000) {
            sectionScreenPixel = screenHeightConstant * 3.3;
        } else if (duration <= 12000) {
            sectionScreenPixel = screenHeightConstant * 4.4;
        } else if (duration <= 16000) {
            sectionScreenPixel = screenHeightConstant * 5.5;
        } else {
            sectionScreenPixel = screenHeightConstant * 5.5;
        }

        return parseInt(sectionScreenPixel);
    },
    getImageComponentType: function (width, height) {
        var componentType, imageRate;
        if (width > 0 && height > 0) {
            imageRate = width / height;

            if (imageRate > (3 / 4) || imageRate == (3 / 4)) {
                componentType = Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH;
            } else {
                componentType = Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLSCREEN;
            }
        } else {
            componentType = Moboo.DraftConstants.COMPONENT_TYPE.IMAGE_FULLWIDTH;
        }

        return componentType;
    },
    getVideoComponentType: function (width, height) {
        var componentType, imageRate;

        if (width > 0 && height > 0) {
            imageRate = width / height;

            if (imageRate > (3 / 4) || imageRate == (3 / 4)) {
                componentType = Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH;
            } else {
                componentType = Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLSCREEN;
            }
        } else {
            componentType = Moboo.DraftConstants.COMPONENT_TYPE.VIDEO_FULLWIDTH;
        }
        return componentType;
    },
    getZoomResolution: function (width, height, targetWidth) {
        if (width <= targetWidth) {
            return {
                width: width,
                height: height
            }
        } else {
            return {
                width: targetWidth,
                height: height * targetWidth / width
            }
        }

    },
    addRangeRow: function (range) {
        if (range != null) {

            return {
                startRowIdx: range.startRowIdx,
                endRowIdx: range.endRowIdx + 1,
                totalRows: range.totalRows + 1
            };
        }
    },
    removeRangeRow: function (range) {
        if (range != null) {

            return {
                startRowIdx: range.startRowIdx,
                endRowIdx: range.endRowIdx - 1,
                totalRows: range.totalRows - 1
            };
        }
    },
    browserDetection: function () {
        var returnValue,
            userAgent = navigator.userAgent, //取得浏览器的userAgent字符串
            isOpera = userAgent.indexOf("Opera") > -1;

        //判断是否Opera浏览器
        if (isOpera) {
            returnValue = "Opera"
        }
        //判断是否Firefox浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            returnValue = "Firefox";
        }
        //判断是否Chrome浏览器
        if (userAgent.indexOf("Chrome") > -1) {
            returnValue = "Chrome";
        }
        //判断是否Safari浏览器
        if (userAgent.indexOf("Safari") > -1) {
            returnValue = "Safari";
        }
        //判断是否IE浏览器
        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
            returnValue = "IE";
        }

        return returnValue;
    }
};
