//
var editorModule = angular.module(
    "mobooEditor",
    ['monospaced.elastic', 'as.sortable']
);

editorModule.constant(
    "EditorConstants",
    {
        MODULE_WINDOW_OPS: {
            OPEN: "open",
            CLOSE: "close"
        },
        MODULE_WINDOW_NAME: {
            LOADING: "Loading",
            AUDIO_RECORD_CROP: "AudioRecordCrop",
            THEME_SELECTOR: "ThemeSelector",
            BGM_SELECTOR: "BgmSelector",
            IMAGE_UPLOAD: "ImageUpload",
            EVN_MUSIC_SELECTOR: "EvnMusicSelector",
            EFFECT_MUSIC_SELECTOR: "EffectMusicSelector",
            UPLOAD_ERROR: "uploadError",
            MOBOO_PREVIEW: "MobooPreview",
            MOBOO_PUBBLISH: "MobooPublish"
        },
        MODEL_UPLOAD_SETTING: {
            LOADING: "loading",
            COMPLETE: "complete"
        },
        USER_OPS: {
            //
            ADD_SECTION: "section.add",
            //
            ADD_SECTION_AUDIO: "section.audio.add",
            MODIFY_SECTION_TITLE: "section.title.modify",
            MODIFY_SECTION_AUDIO: "section.audio.modify",
            //
            ADD_ACTION_PLAY_AUDIO: "action.play.audio.add",
            ADD_ACTION_BLUR: "action.blur.add",
            MODIFY_ACTION: "action.modify",
            //
            ADD_COMPONENT_IMAGES: "component.images.add",
            ADD_COMPONENT_MOPICS: "component.mopics.add",
            ADD_COMPONENT_VIDEOS: "component.videos.add",
            ADD_COMPONENT_TEXT: "component.text.add",
            MODIFY_COMPONENT: "component.modify",
            //
            ADD_COMPONENT_ASSET_IMAGES: "component.asset.images.add",
            ADD_COMPONENT_ASSET_MOPICS: "component.asset.mopics.add",
            ADD_COMPONENT_ASSET_VIDEOS: "component.asset.videos.add",
            MODIFY_COMPONENT_ASSET: "component.asset.modify",
            //
            MODIFY_IMAGE_CAPTION: "image.caption.modify",
            MODIFY_IMAGE_SUBCAPTION: "image.subcaption.modify",
            //
            MODIFY_IMAGE_DESCRIPTION: "image.description.modify",
            //
            SELECTED_COMPONENT_IMAGE: "component.image.selected",
            SELECTED_COMPONENT_VIDEO: "component.video.selected",
            SELECTED_COMPONENT_MOPIC: "component.mopic.selected"
        },
        DATA_ACTION: {
            MOVE_UP: "moveUp",
            MOVE_DOWN: "moveDown",
            DELETE: "delete",
            MODIFY_SELF_MUSIC: "modifySelfMusic",
            ADD_EVN_MUSIC: "addEvnMusic",
            MODIFY_ACTION: "modifyAction",
            INSERT_ACTION: "insertAction",
            MOVE_OPTIONS: "moveOptions",
            FULLWITH_COMPONENT: "fullwidthComponent",
            FULLSCREEN_COMPONENT: "fullscreenComponent",
            REMOVE_COMPONENT: "removeComponent",
            SELECTED_FONT_FAMILY: "selectedFontFamily",
            SELECTED_FONT_SIZE: "selectedFontSize",
            SET_FONT_SIZE: "setFontSize",
            ALIGN_LEFT: 'left',
            ALIGN_CENTER: 'center',
            ALIGN_RIGHT: 'right',
            VERTICAL_ALIGN_TOP: 'top',
            VERTICAL_ALIGN_MIDDLE: 'middle',
            VERTICAL_ALIGN_BOTTOM: 'bottom'
        },
        DATA_TYPE: {
            MULTIMEDIA: "multimedia",
            TEXT: "text",
            ADD_ELEMENT: "addElement"
        },
        TEXT_TYPE: {
            TITLE: "title",
            SUBTITLE: "subtitle",
            SECTION_TITLE: "section.title",
            ASSET_TEXT_CONTENT: "asset.text.content",
            //
            ASSET_DESCRIPTION: "asset.description",
            ASSET_CAPTION_TITLE: "asset.caption.title",
            ASSET_CAPTION_SUBTITLE: "asset.caption.subtitle"
        },
        API_URL: {
            GET_DRAFT_INIT_DATE: "/ajax/creative/draft/get",
            GET_UPLOAD_SETTING: "/ajax/setting/upload/get",
            QUERY_ALL_THEMES: "/ajax/creative/theme/list",
            QUERY_BGM_TAGS: "/ajax/tag/library/bgm/list",
            QUERY_EFFECT_MUSIC_TAGS: "/ajax/tag/library/effect/music/list",
            QUERY_EVN_MUSIC_TAGS: "/ajax/tag/library/env/music/list",
            QUERY_CIRCLES: "/ajax/user/circle/relation/list",
            SEARCH_LIBRARIES: "/ajax/creative/library/search",
            SEARCH_SELF_LIBRARIES: "/ajax/user/creative/library/search",
            CREATE_SELF_LIBRARIES: "/ajax/user/creative/library/create",
            MODIFY_SELF_LIBRARIES: "/ajax/user/creative/library/modify",
            REMOVE_SELF_LIBRARIES: "/ajax/user/creative/library/remove",
            SAVE_DRAFT: "/ajax/creative/draft/save",
            SAVE_DRAFT_ROOT: "/ajax/creative/draft/root/save",
            SAVE_DRAFT_SECTION: "/ajax/creative/draft/section/save",
            CROP_RESOURCE: '/ajax/creative/resource/crop',
            PUBLISH_DRAFT_PREFIX: '/user/creative/draft/publish/page/',
            PUBLISH_DRAFT: '/ajax/user/creative/draft/publish',
            USER_ARTICLE_LIST: '/user/article/episode/index',
            NOVICE_GUIDE_IMPLEMENT: '/ajax/help/novice/guide/implement',
            GET_PRETREATMENT_FOP_STATUS: "/ajax/creative/prefop/status/get",
            GENERATE_AUDIO_MULTI_VOLUME_FILES: "/ajax/creative/audio/multi/volume/generate"
        },
        SECTION_WIDTH: {
            DEFAULT: 300
        },
        ELEMENT_LIMIT_LENGTH: {
            VIDEOS: 3,
            MOPICS: 10000,
            COMPONENTS: 9,
            SECTIONS: 9
        },
        AUDIO_LIMIT_LENGTH: {
            SELF_BG_MUSIC: 100
        },
        LOAD_MUSIC: {
            PUBLIC: "public",
            SELF: "self"
        },
        AUDIO_VOLUME: {
            DEFAULT: 1,
            BACKGROUND_MUSIC: 0.25,
            EFFECT_MUSIC: 0.8,
            ENV_MUSIC: 0.8
        },
        TEXT_LENGTH: {
            TITLE: 88,
            SECTION_TITLE: 60,
            ASSET_DESCRIPTION_CONTENT: 288,
            ASSET_TEXT_CONTENT: 288,
            ASSET_CAPTION_TITLE: 28
        },
        BROWSER: {
            FIREFOX: "Firefox",
            OPERA: "Opera",
            CHROME: "Chrome",
            SAFARI: "Safari",
            IE: "IE"
        }
    }
);