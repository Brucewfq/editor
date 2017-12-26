var Moboo = Moboo || {};

Moboo.DraftConstants = {
    //
    SECTION_WIDTH: {
        DEFAULT: 300
    },
    //
    SECTION_TYPE: {
        CONTENT: "content",
        COVER: "cover"
    },
    NARRATE_TYPE: {
        DIALOGUE: "dialogue",
        VOICE_OVER: "voiceover"
    },
    COMPONENT_TYPE: {
        COVER: "cover",
        IMAGE_FULLSCREEN: "image-fullscreen",
        IMAGE_FULLWIDTH: "image-fullwidth",
        TEXT_FULLSCREEN: "text-fullscreen",
        TEXT_FULLWIDTH: "text-fullwidth",
        VIDEO_FULLSCREEN: "video-fullscreen",
        VIDEO_FULLWIDTH: "video-fullwidth"
    },
    ACTION_TYPE: {
        PLAY_AUDIO: "playaudio",
        TRANSFER: "transfer",
        SCALE: "scale",
        ROTATE: "rotate",
        BRIGHTNESS: "brightness",
        OPACITY: "opacity",
        BLUR: "blur",
        GRAY: "gray",
        GRAYSCALE: "grayscale",
        NOISE: "noise",
        MOSAIC: "mosaic",
        FILL: "fill"
    },
    ASSET_TYPE: {
        IMAGE: "image",
        AUDIO: "audio",
        TEXT: "text",
        VIDEO: "video"
    },
    //
    ALIGN: {
        LEFT: "left",
        CENTER: "center",
        RIGHT: "right"
    },
    VERTICAL_ALIGN: {
        TOP: "top",
        MIDDLE: "middle",
        BOTTOM: "bottom"
    },
    FONT_WEIGHT: {
        NORMAL: "normal",
        BOLD: "bold"
    },
    FONT_STYLE: {
        NORMAL: "normal",
        ITALIC: "italic"
    },
    FONT: {
        FAMILYS: ["微软雅黑", "宋体", "楷体"],
        SIZES: [{name: "字号1", size: 18}, {name: "字号2", size: 22}, {name: "字号3", size: 33}, {
            name: "字号4",
            size: 44
        }, {name: "字号5", size: 60}],
        COLORS: ["#000000", "#434343", "#959595", "#c8c8c8", "#ffffff", "#3f5487", "#2b96c1", "#56c08c", "#275b42", "#032430", "#31f0e3", "#ff4fac", "#ffd75d", "#ff6731", "#ff2500", "#b05200", "#f7992b", "#aa7971", "#5c2537", "#2e171c", "#4b3418", "#917f60", "#bdc6d2", "#eff1f3", "#a21300"]
    }
};