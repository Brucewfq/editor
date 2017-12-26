if (editorModule) {
    //
    editorModule.directive(
        "hello",
        [
            function () {
                return {
                    restrict: "E",
                    replace: true,
                    transclude: true,
                    template: "<div>Recording：<ng-transclude></ng-transclude></div>",
                    link: function (scope, elements, attributes) {
                        //
                        elements[0].onmouseover = function () {
                            elements[0].style.backgroundColor = "red";
                        };

                        //
                        elements[0].onmouseout = function () {
                            elements[0].style.backgroundColor = "";
                        };
                    }
                };
            }
        ]
    );
}