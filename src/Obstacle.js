import animate;
import util.underscore as _;
import ui.ImageView as ImageView;

var imgConfs = [{
  image: "resources/images/obstacle1.png",
  width: 190,
  height: 1000
}, {
  image: "resources/images/obstacle2.png",
  width: 190,
  height: 1000
}, {
  image: "resources/images/obstacle3.png",
  width: 183,
  height: 1000
}];

exports = Class(ImageView, function(supr) {

  this.init = function(opts, reverse) {
    var imgConf = _.sample(imgConfs);

    var opts = merge(opts, {
      image: imgConf.image,
      width: imgConf.width,
      height: imgConf.height,
      offsetX: -imgConf.width / 2,
      anchorX: imgConf.width / 2
    });
    if (reverse) {
      opts.r = Math.PI;
    }

    supr(this, 'init', [opts]);

    this.reverse = reverse || false; // True if on top
    this.counted = false; // For the score
    this.animator = animate(this);
  };


});