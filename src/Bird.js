import animate;
import ui.ImageView as ImageView;

// Images configuration
var birdImgConf = {
  width: 300,
  height: 176,
  r: {
    normal: -0.14,
    min: -0.44,
    max: 0.46
  }
};
var wingImgConf = {
  x: 131,
  y: 91,
  width: 98,
  height: 126,
  centerX: 54,
  centerY: 90,
  normalFlap: {
    r: -0.34,
    d1: 100,
    d2: 200
  },
  bigFlap: {
    r: -1.2,
    d1: 100,
    d2: 200
  }
};
var scale = 0.5;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

    var opts = merge(opts, {
      image: "resources/images/bird.png",
      width: birdImgConf.width,
      height: birdImgConf.height,
      x: -birdImgConf.width,
      y: GC.app.baseHeight / 2,
      scale: scale,
      offsetX: -birdImgConf.width / 2,
      offsetY: -birdImgConf.height / 2,
      anchorX: birdImgConf.width / 2,
      anchorY: birdImgConf.height / 2
    });

    supr(this, 'init', [opts]);

    this.wing = new ImageView({
      superview: this,
      image: "resources/images/bird-wing.png",
      x: wingImgConf.x,
      y: wingImgConf.y,
      width: wingImgConf.width,
      height: wingImgConf.height,
      offsetX: -wingImgConf.centerX,
      offsetY: -wingImgConf.centerY,
      anchorX: wingImgConf.centerX,
      anchorY: wingImgConf.centerY
    });

    this.animator = animate(this);
    this.wingAnimator = animate(this.wing);
    this.reset();

    this.on("die", bind(this, function() {
      this.flying = false;
      this.wingAnimator.clear();
    }))
    this.on("loseHP", bind(this, function() {
      this.setInvicible(3000);
    }));
  };

  this.reset = function() {
    var that = this;
    this.flying = false;
    this.invicible = false;
    this.animator.clear();
    this.animateNormalFlap();
    var initX = GC.app.baseWidth / 2;
    var initY = GC.app.baseHeight / 2;

    this.animator
      .now({
        x: initX,
        y: initY,
        r: birdImgConf.r.normal,
        opacity: 1
      }, 400)
      .then(function oscillate() {
        that.animator
          .now({
            y: initY - 10
          }, 500)
          .then({
            y: initY + 10
          }, 800)
          .then(oscillate);
      });
  };

  this.fall = function() {
    var dY = GC.app.baseHeight + Config.floorY - this.style.y;
    var duration = Math.sqrt(dY / Config.gravity) * 1000;
    this.animator
      .now({
        x: Math.min(this.style.x + (Config.obstacles.speed * 1000) / duration, GC.app.baseWidth / 2),
        y: GC.app.baseHeight + Config.floorY,
        r: birdImgConf.r.max
      }, duration, animate.easeIn);
  };

  this.flap = function() {
    this.flying = true;
    var duration = Math.sqrt(Config.flapHeight / Config.gravity) * 1000;
    this.animator
      .now({
        x: Math.min(this.style.x + duration / (Config.obstacles.speed * 1000), GC.app.baseWidth / 2),
        y: Math.max(this.style.y - Config.flapHeight, Config.ceilY),
        r: birdImgConf.r.min
      }, duration, animate.easeOut)
      .then(bind(this, this.fall));
    this.animateBigFlap(2);
  };

  this.animateBigFlap = function(n) {
    if (n == 0) {
      return this.animateNormalFlap();
    }
    var that = this;
    this.wingAnimator
      .now({
        r: wingImgConf.bigFlap.r
      }, wingImgConf.bigFlap.d1)
      .then({
        r: 0
      }, wingImgConf.bigFlap.d2)
      .then(function() {
        that.animateBigFlap(--n);
      });
  };

  this.animateNormalFlap = function() {
    this.wingAnimator
      .now({
        r: wingImgConf.normalFlap.r
      }, wingImgConf.normalFlap.d1)
      .then({
        r: 0
      }, wingImgConf.normalFlap.d2)
      .then(bind(this, this.animateNormalFlap));
  };

  this.setX = function(x) {
    this.style.x = x;
  };

  this.setY = function(y) {
    this.style.y = y;
  };

  this.setInvicible = function(duration) {
    if (this.invicible) {
      return;
    }
    var that = this;
    this.invicible = true;

    (function blink(n) {
      if (n == 0 || !that.invicible) {
        that.invicible = false;
        return;
      }
      setTimeout(function() {
        if (!that.invicible) {
          return;
        }
        that.updateOpts({
          opacity: 0.5
        });
        setTimeout(function() {
          that.updateOpts({
            opacity: 1
          });
          blink(n - 1);
        }, 300);
      }, 300);
    })(Math.round(duration / 600));
  };

  this.tick = function() {
    if (!this.flying) {
      return;
    }

    // Fall on the floor
    if (this.style.y >= GC.app.baseHeight + Config.floorY) {
      this.emit("die");

      // Too far on the left
    } else if (this.style.x <= 0) {
      this.emit("die");

      // Collision with an obstacle
    } else if (GC.app.obstacles.collide(this)) {
      if (!this.invicible) {
        this.emit("loseHP");
      }
    }

    GC.app.obstacles.countScore(this);
  };


});