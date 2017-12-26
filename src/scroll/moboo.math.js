/**
 * Created by gary on 9/26/16.
 */
var Moboo = Moboo || {};

Moboo.Math = {
    //
    getBezierValue: function (x1, x2, t) {
        var returnValue = new Moboo.MathPoint(0, 0);

        //
        var cp = [
            new Moboo.MathPoint(0, 0),
            new Moboo.MathPoint(x1, 0),
            new Moboo.MathPoint(x2, 1),
            new Moboo.MathPoint(1, 1)
        ];

        var ax, bx, cx;
        var ay, by, cy;
        var tSquared, tCubed;

        //
        cx = 3.0 * (cp[1].x - cp[0].x);
        bx = 3.0 * (cp[2].x - cp[1].x) - cx;
        ax = cp[3].x - cp[0].x - cx - bx;

        //
        cy = 3.0 * (cp[1].y - cp[0].y);
        by = 3.0 * (cp[2].y - cp[1].y) - cy;
        ay = cp[3].y - cp[0].y - cy - by;

        tSquared = t * t;
        tCubed = tSquared * t;

        returnValue.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
        returnValue.y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;

        return returnValue.y;
    },
    getBezierArea: function (x1, x2, fromT, toT, splitT, totalT) {
        var returnValue = 0;

        for (var v = fromT; v < toT; v += splitT) {
            returnValue += (1 - this.getBezierValue(x1, x2, v / totalT)) * splitT;
        }

        return returnValue;
    }
};

//
Moboo.MathPoint = function (x, y) {
    //
    this.x = x || 0.0;
    this.y = y || 0.0;
};

Moboo.MathPoint.prototype = {
    //
    constructor: Moboo.MathPoint,
    //
    x: 0.0,
    y: 0.0
};