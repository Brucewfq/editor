//
Moboo.Draft = function () {
    //
    this.draftNo = null;
    this.episode = null;

    //
    this.fileNamePrefix = null;

    //
    this.node = new Moboo.DraftNodeOfEpisode({});

    //model image
    this.cover = null;
    this.title = null;
    this.subtitle = null;
    this.bodyText = null;

    this.lastUpdateDate = null;
};

Moboo.Draft.prototype = {
    //
    constructor: Moboo.Draft,
    //
    initDraft: function (jsonData) {
        //
        jsonData = jsonData || {};

        //
        this.draftNo = jsonData.draftNo;
        this.title = jsonData.title;
        this.subtitle = jsonData.subtitle;
        this.bodyText = jsonData.bodyText;
        this.cover = jsonData.cover;
        this.fileNamePrefix = jsonData.fileNamePrefix;

        this.lastUpdateDate = jsonData.lastUpdateDate;

        //
        this.episode = jsonData.episode;

        //
        this.node.parse(jsonData.detail);
    },
    //
    getEpisodeNode: function () {
        return this.node;
    },
    getSectionNode: function (sectionIndex) {
        return this.node.sections[sectionIndex];
    },
    getSectionJson: function (sectionIndex) {

        return this.node.sections[sectionIndex].toJson();
    },
    getEpisodeJson: function () {
        return this.node.toJson();
    },
    getCoverSectionForJson: function () {
        var section = new Moboo.DraftNodeOfSectionCover({});
        section.uniqueId = "11111";

        var component = new Moboo.DraftNodeOfComponentCover({});
        component.type = Moboo.DraftConstants.COMPONENT_TYPE.COVER;
        component.uniqueId = "33333";

        var asset = new Moboo.DraftNodeOfAssetImage({});
        //
        if (this.cover) {
            asset.uniqueId = this.cover.fileId;
            asset.providerCode = this.cover.providerCode;
            asset.bucketCode = this.cover.bucketCode;
            asset.ave = this.cover.ave ? this.cover.ave.ave : null;
            if (this.cover.resolution) {
                asset.width = this.cover.resolution.width;
                asset.height = this.cover.resolution.height;
            }
            component.assets.push(asset);
        }

        //
        section.components.push(component);

        return section.toJson();
    },
    getComponentNode: function (sectionIndex, componentIndex) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && componentIndex >= 0 && componentIndex < thatNode.sections[componentIndex].components.length) {
            return thatNode.sections[sectionIndex].components[componentIndex];
        }

        return null;
    },
    getBgMusicNode: function (bgMusicIndex) {
        var thatNode = this.node;

        //
        return thatNode.bgMusics.length > bgMusicIndex ? thatNode.bgMusics[bgMusicIndex] : null;
    },
    modifyCover: function (coverData) {
        this.cover = coverData;
    },
    modifyTitle: function (title) {
        this.title = title;
    },
    modifySubtitle: function (subtitle) {
        this.subtitle = subtitle;
    },
    modifyBodyText: function (bodyText) {
        this.bodyText = bodyText;
    },
    modifyEpisodeNode: function (draftData) {
        var thatNode = this.node;

        thatNode.parse(draftData);
    },
    addBgMusicNode: function (bgMusicIndex, bgMusicNode) {
        this.node.bgMusics.splice(bgMusicIndex, 1, bgMusicNode);
    },
    modifyBgMusicNode: function (bgMusicIndex, updateBgMusicDta) {
        var thatNode = this.node;

        var bgMusics = thatNode.bgMusics;
        if (bgMusics && bgMusics.length > bgMusicIndex && updateBgMusicDta) {
            bgMusics[bgMusicIndex].parse(updateBgMusicDta)
        }
    },
    removeBgMusicNode: function (bgMusicIndex) {
        if (this.node.bgMusics && this.node.bgMusics.length > bgMusicIndex) {
            this.node.bgMusics.splice(bgMusicIndex, 1);
        }
    },
    addSectionNode: function (sectionIndex, sectionNode) {
        var thatNode = this.node;

        //
        if (sectionIndex == undefined || sectionIndex > thatNode.sections.length) {
            sectionIndex = thatNode.sections.length;
        } else if (sectionIndex < 0) {
            sectionIndex = 0;
        }

        //
        if (thatNode.sections.length > 0) {
            thatNode.sections.splice(sectionIndex, 0, sectionNode);
            thatNode.childNodeNos.splice(sectionIndex, 0, sectionNode.uniqueId);
        } else {
            thatNode.sections.push(sectionNode);
            thatNode.childNodeNos.push(sectionNode.uniqueId);
        }
    },
    addAudioNodeToSectionNode: function (sectionIndex, audioIndex, audioNode) {
        var thatNode = this.node;

        //
        if (sectionIndex != undefined && sectionIndex >= 0 && sectionIndex < thatNode.sections.length && audioNode) {
            //
            thatNode.sections[sectionIndex].audios.splice(audioIndex, 0, audioNode);
        }
    },
    modifySectionNode: function (sectionIndex, updateSectionData) {
        var thatNode = this.node;

        //
        if (sectionIndex == undefined || sectionIndex > thatNode.sections.length) {
            sectionIndex = thatNode.sections.length;
        } else if (sectionIndex < 0) {
            sectionIndex = 0;
        }

        //
        var sectionNode = thatNode.sections[sectionIndex];

        if (sectionNode && updateSectionData) {
            //
            sectionNode.parse(updateSectionData);
            thatNode.childNodeNos.splice(sectionIndex, 1, sectionNode.uniqueId);
        }
    },

    modifySectionAudioNode: function (sectionIndex, audioIndex, modifyData) {
        var thatNode = this.node;

        //
        if (sectionIndex != undefined && sectionIndex >= 0 && sectionIndex < thatNode.sections.length && audioIndex >= 0 && audioIndex < thatNode.sections[sectionIndex].audios.length && modifyData) {
            var audioNode = thatNode.sections[sectionIndex].audios[audioIndex];

            //
            if (audioNode) {
                audioNode.parse(modifyData);
            }
        }
    },
    removeSectionNode: function (sectionIndex) {
        var thatNode = this.node;

        //
        if (sectionIndex != undefined && sectionIndex >= 0 && sectionIndex < thatNode.sections.length) {
            thatNode.sections.splice(sectionIndex, 1);
            thatNode.childNodeNos.splice(sectionIndex, 1);
        }
    },
    removeAudioNodeFromSection: function (sectionIndex, audioIndex) {
        var thatNode = this.node;

        //
        if (sectionIndex != undefined && sectionIndex >= 0 && sectionIndex < thatNode.sections.length) {
            thatNode.sections[sectionIndex].audios.splice(audioIndex, 1);
        }
    },
    addComponentNode: function (sectionIndex, componentIndex, componentNode) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && componentNode) {
            //
            if (componentIndex == undefined || componentIndex > thatNode.sections[sectionIndex].components.length) {
                componentIndex = thatNode.sections[sectionIndex].components.length;
            }
            if (componentIndex < 0) {
                componentIndex = 0;
            }

            //
            thatNode.sections[sectionIndex].components.splice(componentIndex, 0, componentNode);
        }
    },
    addComponentNodes: function (sectionIndex, componentIndex, componentNodes) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length) {
            if (!componentNodes || componentNodes.length == 0) {
                return;
            }

            //
            if (componentIndex == undefined || componentIndex > thatNode.sections[sectionIndex].components.length) {
                componentIndex = thatNode.sections[sectionIndex].components.length;
            }
            if (componentIndex < 0) {
                componentIndex = 0;
            }


            componentNodes.unshift(componentIndex, 0);
            Array.prototype.splice.apply(thatNode.sections[sectionIndex].components, componentNodes);
        }

    },
    modifyComponentNode: function (sectionIndex, componentIndex, updateComponentData) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length) {
            //
            if (componentIndex == undefined || componentIndex > thatNode.sections[sectionIndex].components.length) {
                componentIndex = thatNode.sections[sectionIndex].components.length;
            }
            if (componentIndex < 0) {
                componentIndex = 0;
            }

            //
            var componentNode = thatNode.sections[sectionIndex].components[componentIndex];

            //
            if (componentNode && updateComponentData) {
                componentNode.parse(updateComponentData);
            }
        }
    },
    removeComponentNode: function (sectionIndex, componentIndex) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length) {
            thatNode.sections[sectionIndex].components.splice(componentIndex, 1);
        }
    },
    addActionNode: function (sectionIndex, componentIndex, actionNode) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && componentIndex >= 0 && componentIndex < thatNode.sections[sectionIndex].components.length) {
            //
            var actions = thatNode.sections[sectionIndex].components[componentIndex].actions;
            
            if (actions && actions.length === 0) {
                actions.push(actionNode);
            } else if (actions && actions.length === 1) {
                actions[0].parse(actionNode);

            } else if (actions && actions.length > 1) {
                var newAction = [];
                newAction.push(actions[actions.length - 1]);

                thatNode.sections[sectionIndex].components[componentIndex].actions = newAction;
                thatNode.sections[sectionIndex].components[componentIndex].actions[0].parse(actionNode);
            }
        }
    },
    modifyActionNode: function (sectionIndex, componentIndex, actionIndex, updateActionData) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length && actionIndex >= 0 && actionIndex < thatNode.sections[sectionIndex].components[componentIndex].actions.length) {
            var thatActions = thatNode.sections[sectionIndex].components[componentIndex].actions[actionIndex].parse(updateActionData);
        }
    }, removeActionNode: function (sectionIndex, componentIndex, actionIndex) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length && actionIndex >= 0 && actionIndex < thatNode.sections[sectionIndex].components[componentIndex].actions.length) {
            thatNode.sections[sectionIndex].components[componentIndex].actions.splice(actionIndex, 1);
        }
    },
    addCaptionForImageAssertNode: function (sectionIndex, componentIndex, assetIndex, captionNode) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length && captionNode) {
            thatNode.sections[sectionIndex].components[componentIndex].assets[assetIndex].caption = captionNode;
        }
    }
    ,
    modifyCaptionForImageAssertNode: function (sectionIndex, componentIndex, assetIndex, updateCaptionData) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length && updateCaptionData) {
            var captionNode = thatNode.sections[sectionIndex].components[componentIndex].assets[assetIndex].caption;

            if (captionNode) {
                if (captionNode instanceof Moboo.DraftNodeOfAssetText) {
                    captionNode.parse(updateCaptionData);
                }
            }

        }
    },
    removeCaptionForImageAssertNode: function (sectionIndex, componentIndex, assetIndex) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length) {
            thatNode.sections[sectionIndex].components[componentIndex].assets[assetIndex].caption = null;
        }
    },
    addDescriptionForImageAssertNode: function (sectionIndex, componentIndex, assetIndex, descriptionNode) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length && descriptionNode) {
            thatNode.sections[sectionIndex].components[componentIndex].assets[assetIndex].description = descriptionNode;
        }
    },
    modifyDescriptionForImageAssertNode: function (sectionIndex, componentIndex, assetIndex, descriptionData) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length && descriptionData) {
            var descriptionNode = thatNode.sections[sectionIndex].components[componentIndex].assets[assetIndex].description;

            if (descriptionNode) {
                if (descriptionNode instanceof Moboo.DraftNodeOfAssetText) {
                    descriptionNode.parse(descriptionData);
                }
            }

        }
    },
    modifyAssetNode: function (sectionIndex, componentIndex, assetIndex, assertData) {
        var thatNode = this.node;

        //
        if (sectionIndex >= 0 && sectionIndex <= thatNode.sections.length && componentIndex >= 0 && componentIndex <= thatNode.sections[sectionIndex].components.length) {
            thatNode.sections[sectionIndex].components[componentIndex].assets[assetIndex].parse(assertData);
        }
    }
    ,
    moveSectionNodeDown: function (sectionIndex) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && thatNode.sections.length >= 2 && sectionIndex < thatNode.sections.length - 1) {

            var currentSection = thatNode.sections[sectionIndex];

            thatNode.sections[sectionIndex] = thatNode.sections[sectionIndex + 1];
            thatNode.sections[sectionIndex + 1] = currentSection;

            //
            var childNo = thatNode.childNodeNos[sectionIndex];

            thatNode.childNodeNos[sectionIndex] = thatNode.childNodeNos[sectionIndex + 1];
            thatNode.childNodeNos[sectionIndex + 1] = childNo;
        }
    }
    ,
    moveSectionNodeUp: function (sectionIndex) {
        var thatNode = this.node;
        if (sectionIndex > 0 && thatNode.sections.length >= 2) {
            var currentSection = thatNode.sections[sectionIndex];

            thatNode.sections[sectionIndex] = thatNode.sections[sectionIndex - 1];
            thatNode.sections[sectionIndex - 1] = currentSection;

            //
            var childNo = thatNode.childNodeNos[sectionIndex];

            thatNode.childNodeNos[sectionIndex] = thatNode.childNodeNos[sectionIndex - 1];
            thatNode.childNodeNos[sectionIndex - 1] = childNo;
        }
    }
    ,
    moveSectionNodeSwap: function (srcSectionIndex, targetSectionIndex) {
        var thatNode = this.node;

        if (srcSectionIndex >= 0 && targetSectionIndex >= 0 && srcSectionIndex < thatNode.sections.length && targetSectionIndex < thatNode.sections.length) {
            var srcSection = thatNode.sections[srcSectionIndex];

            thatNode.sections[srcSectionIndex] = thatNode.sections[targetSectionIndex];
            thatNode.sections[targetSectionIndex] = srcSection;

            //
            var childNo = thatNode.childNodeNos[srcSectionIndex];

            thatNode.childNodeNos[srcSectionIndex] = thatNode.childNodeNos[targetSectionIndex];
            thatNode.childNodeNos[targetSectionIndex] = childNo;
        }
    }
    ,
    moveSectionNodeFontInsert: function (srcSectionIndex, targetSectionIndex) {
        var thatNode = this.node;

        if (srcSectionIndex >= 0 && targetSectionIndex >= 0 && srcSectionIndex < thatNode.sections.length && targetSectionIndex < thatNode.sections.length) {
            var srcSection = this.sections[srcSectionIndex];

            thatNode.sections.splice(srcSectionIndex, 1);
            thatNode.sections.splice(targetSectionIndex, 0, srcSection);

            //
            var childNo = thatNode.childNodeNos[srcSectionIndex];

            thatNode.childNodeNos.splice(srcSectionIndex, 1);
            thatNode.childNodeNos.splice(targetSectionIndex, 0, childNo);
        }
    }
    ,
    moveSectionNodeBehindInsert: function (srcSectionIndex, targetSectionIndex) {
        var thatNode = this.node;

        //
        if (srcSectionIndex >= 0 && targetSectionIndex >= 0 && srcSectionIndex < thatNode.sections.length && targetSectionIndex < thatNode.sections.length) {
            var srcSection = this.sections[srcSectionIndex];

            thatNode.sections.splice(srcSectionIndex, 1);
            thatNode.sections.splice(targetSectionIndex + 1, 0, srcSection);

            //
            var childNo = thatNode.childNodeNos[srcSectionIndex];

            thatNode.childNodeNos.splice(srcSectionIndex, 1);
            thatNode.childNodeNos.splice(targetSectionIndex + 1, 0, childNo);
        }
    }
    ,
    moveComponentNodeDown: function (sectionIndex, componentIndex) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && componentIndex >= 0 && componentIndex < thatNode.sections[sectionIndex].components.length && !(componentIndex == thatNode.sections[sectionIndex].components.length - 1 && sectionIndex == thatNode.sections.length - 1)) {

            //
            var components = thatNode.sections[sectionIndex].components;
            var currentComponent = components[componentIndex];

            if (componentIndex != components.length - 1) {
                components[componentIndex] = components[componentIndex + 1];
                components[componentIndex + 1] = currentComponent;
            } else {
                thatNode.sections[sectionIndex + 1].components.splice(0, 0, currentComponent);
                components.splice(componentIndex, 1);
            }
        }
    }
    ,
    moveComponentNodeUp: function (sectionIndex, componentIndex) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && componentIndex >= 0 && componentIndex < thatNode.sections[sectionIndex].components.length && !(componentIndex == 0 && sectionIndex == 0)) {

            //
            var components = thatNode.sections[sectionIndex].components;
            var currentComponent = components[componentIndex];

            if (componentIndex != 0) {
                components[componentIndex] = components[componentIndex - 1];
                components[componentIndex - 1] = currentComponent;
            } else {
                thatNode.sections[sectionIndex - 1].components.push(currentComponent);
                components.splice(componentIndex, 1);
            }
        }
    }
    ,
    moveComponentNodeSwap: function (sectionIndex, srcComponentIndex, targetComponentIndex) {

        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && srcComponentIndex >= 0 && targetComponentIndex >= 0 && srcComponentIndex < thatNode.sections[sectionIndex].components.length && targetComponentIndex < thatNode.sections[sectionIndex].components.length) {

            var components = thatNode.sections[sectionIndex].components;

            //
            var srcComponent = components[srcComponentIndex];

            components[srcComponentIndex] = components[targetComponentIndex];
            components[targetComponentIndex] = srcComponent;

        }
    }
    ,
    moveComponentNodeFontInsert: function (sectionIndex, srcComponentIndex, targetComponentIndex) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && srcComponentIndex >= 0 && targetComponentIndex >= 0 && srcComponentIndex < thatNode.sections[sectionIndex].components.length && targetComponentIndex < thatNode.sections[sectionIndex].components.length) {

            var components = thatNode.sections[sectionIndex].components;

            //
            var srcComponent = components[srcComponentIndex];

            components.splice(srcComponentIndex, 1);
            components.splice(targetComponentIndex, 0, srcComponent);
        }
    }
    ,
    moveComponentNodeBehindInsert: function (sectionIndex, srcComponentIndex, targetComponentIndex) {
        var thatNode = this.node;

        if (sectionIndex >= 0 && sectionIndex < thatNode.sections.length && srcComponentIndex >= 0 && targetComponentIndex >= 0 && srcComponentIndex < thatNode.sections[sectionIndex].components.length && targetComponentIndex < thatNode.sections[sectionIndex].components.length) {

            var components = thatNode.sections[sectionIndex].components;

            //
            var srcComponent = components[srcComponentIndex];

            components.splice(srcComponentIndex, 1);
            components.splice(targetComponentIndex + 1, 0, srcComponent);
        }
    }
    ,
    moveComponentNodeFontInsertFromCrossSectionNode: function (srcSectionIndex, srcComponentIndex, targetSectionIndex, targetComponentIndex) {
        var thatNode = this.node;
        if (srcSectionIndex >= 0 && srcSectionIndex < thatNode.sections.length && targetSectionIndex >= 0 && targetSectionIndex < thatNode.sections.length && srcComponentIndex >= 0 && targetComponentIndex >= 0 && srcComponentIndex < thatNode.sections[srcSectionIndex].components.length) {

            var srcComponents = thatNode.sections[srcSectionIndex].components;
            var srcComponent = srcComponents[srcComponentIndex];

            var targetComponents = thatNode.sections[targetSectionIndex].components;

            //
            srcComponents.splice(srcComponentIndex, 1);
            targetComponents.splice(targetComponentIndex, 0, srcComponent);
        }
    }
    ,
    changeTheme: function () {

    }
    ,
}
;