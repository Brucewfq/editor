#!/bin/bash
#git 还原代码，本地不进行修改
/usr/bin/git checkout .

#获取最新的代码
/usr/bin/git pull 

#获取git的版本号
gitcount=`/usr/local/git/bin/git  rev-list HEAD --count`

#create path
dispath="./output/version"
if [ ! -d "$dispath" ];then
mkdir -p  "$dispath"
fi


#对所有模块的js进行压缩并输出
#for model audio crop.
audiocropversion=0.1.0."$gitcount"

uglifyjs src/audiocrop/moboolib.audiocrop.js -c -v -m -o output/version/moboolib.audiocrop-$audiocropversion.min.js

#for audio record
audiorecordversion=0.1.0."$gitcount"

uglifyjs src/audiorecord/moboolib.audiorecord.js -c -v -m -o output/version/moboolib.audiorecord-$audiorecordversion.min.js

#for audio record02
audiorecord02version=0.1.0."$gitcount"

uglifyjs src/audiorecord02/moboolib.audiorecord02.js -c -v -m -o output/version/moboolib.audiorecord02-$audiorecord02version.min.js

#for drag bar
dragbarversion=0.1.0."$gitcount"
uglifyjs src/dragbar/moboolib.dragbar.js -c -v -m -o output/version/moboolib.dragbar-$dragbarversion.min.js

#for editor
editorversion=0.1.0."$gitcount"
uglifyjs src/editor/moboo.editor.js src/editor/moboo.draft.constants.js src/editor/moboo.draft.js src/editor/moboo.draft.node.js src/editor/moboo.draft.functions.js src/editor/angularjs.module.js src/editor/angularjs.service.js src/editor/angularjs.directive.js src/editor/angularjs.controller.layout.js src/editor/angularjs.controller.modals.js -c -v -m -o output/version/moboo.editor-$editorversion.min.js

#todo. add more model.
