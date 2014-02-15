import animate;
import math.util as util;
import util.underscore as _;
import ui.View as View;
import ui.ImageView as ImageView;

var imgConfs = [{
  image: "resources/images/cloud1.png",
  width: 356,
  height: 196
}, {
  image: "resources/images/cloud2.png",
  width: 308,
  height: 154
}, {
  image: "resources/images/cloud3.png",
  width: 194,
  height: 106
}, {
  image: "resources/images/cloud4.png",
  width: 201,
  height: 109
}, {
  image: "resources/images/cloud5.png",
  width: 332,
  height: 169
}];

exports = Class(View, function(supr) {

  this.init = function(opts) {

    var opts = merge(opts, {
      width: GC.app.baseWidth,
      height: GC.app.baseHeight
    });

    supr(this, 'init', [opts]);

    _.times(Config.clouds.initNumber, bind(this, function() {
      this.add(util.random(0, GC.app.baseWidth));
    }));
  };

  this.add = function(x) {
    var imgConf = _.sample(imgConfs);
    var cloud = new ImageView({
      superview: this,
      image: imgConf.image,
      width: imgConf.width,
      height: imgConf.height,
      opacity: Math.random(),
      scale: Math.random() * 0.5 + 0.5,
      x: typeof(x) !== "undefined" ? x : GC.app.baseWidth,
      y: util.random(-100, GC.app.baseHeight)
    });

    var speed = Config.clouds.speed * cloud.style.opacity;
    animate(cloud)
      .now({
        x: -400
      }, (cloud.style.x + 400) / speed * 1000, animate.linear)
      .then(function() {
        cloud.removeFromSuperview();
      });

    // Generate another cloud
    if (typeof(this.addTimeout) !== "undefined") {
      clearTimeout(this.addTimeout);
      delete this.addTimeout;
    }
    this.addTimeout = setTimeout(bind(this, this.add), Config.clouds.generateTime + util.random(-Config.clouds.generateTime / 3, Config.clouds.generateTime / 3));

  };

});