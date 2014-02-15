import animate;
import math.geom.intersect as intersect;
import math.geom.Rect as Rect;
import math.geom.Circle as Circle;
import math.util as util;
import util.underscore as _;
import ui.View as View;
import src.Obstacle as Obstacle;

exports = Class(View, function(supr) {

  this.obstacles = [];

  this.init = function(opts) {

    var opts = merge(opts, {
      width: GC.app.baseWidth,
      height: GC.app.baseHeight
    });

    supr(this, 'init', [opts]);

    this.reset();
  };

  this.reset = function() {
    _.each(this.obstacles, function(obstacle) {
      animate(obstacle)
        .now({
          y: obstacle.reverse ? 0 : GC.app.baseHeight
        }, 400, animate.easeInBack)
        .then(function() {
          obstacle.removeFromSuperview();
        });
    });
    this.obstacles.length = 0;
    this.speed = Config.obstacles.speed;
  };

  this.stop = function() {
    _.each(this.obstacles, function(obstacle) {
      obstacle.animator.clear();
    });
  };

  this.add = function() {
    var x;
    if (this.obstacles.length != 0) {
      x = this.obstacles[this.obstacles.length - 1].style.x + util.random(Config.obstacles.spaceX.min, Config.obstacles.spaceX.max);
    } else {
      x = GC.app.baseWidth + 150;
    }

    // Bottom obstacle
    var obstacle, obstacle2;
    if (Math.random() < Config.obstacles.prob.bottom) {
      obstacle = new Obstacle({
        superview: this,
        x: x,
        y: util.random(GC.app.baseHeight / 3, GC.app.baseHeight * 7 / 8)
      });
      this.obstacles.push(obstacle);
      this.animateObstacle(obstacle);
    }

    // Top obstacle
    if (!obstacle || Math.random() < Config.obstacles.prob.top) {
      var y;
      if (typeof(obstacle) !== "undefined") {
        y = obstacle.style.y - util.random(Config.obstacles.spaceY.min, Config.obstacles.spaceY.max);
      } else {
        y = util.random(GC.app.baseHeight * 1 / 8, GC.app.baseHeight * 1 / 3)
      }
      obstacle2 = new Obstacle({
        superview: this,
        x: x,
        y: y
      }, true);
      this.obstacles.push(obstacle2);
      this.animateObstacle(obstacle2);
    }

  };

  this.animateObstacle = function(obstacle) {
    obstacle.animator
      .now({
        x: -obstacle.style.width
      }, (obstacle.style.x + obstacle.style.width) / this.speed * 1000, animate.linear)
      .then(bind(this, function() {
        obstacle.removeFromSuperview();
        for (var i = this.obstacles.length - 1; i >= 0; i--) {
          if (this.obstacles[i] === obstacle) {
            this.obstacles.splice(i, 1);
            break;
          }
        }
      }));
  };

  this.collide = function(bird) {
    this.Rect = Rect;
    var circleBird = new Circle({
      x: bird.style.x,
      y: bird.style.y,
      radius: 78 * bird.style.scale
    });
    return _.some(this.obstacles, function(obstacle) {
      var rectObstacle = new Rect({
        x: obstacle.style.x + obstacle.style.offsetX,
        y: obstacle.style.y + (obstacle.reverse ? -obstacle.style.offsetY - obstacle.style.height : obstacle.style.offsetY),
        width: obstacle.style.width,
        height: obstacle.style.height
      });
      if (intersect.circleAndRect(circleBird, rectObstacle)) {
        // Shift bird to the left
        if (circleBird.x < rectObstacle.x) {
          bird.setX(rectObstacle.x + bird.style.offsetX * bird.style.scale);
        } else if (obstacle.reverse) {
          bird.setY(rectObstacle.y + rectObstacle.height - bird.style.offsetY * bird.style.scale);
        } else {
          bird.setY(rectObstacle.y + bird.style.offsetY * bird.style.scale);
        }
        return true;
      }
    });
  };

  this.countScore = function(bird) {
    _.each(this.obstacles, function(obstacle) {
      if (!obstacle.counted && obstacle.style.x < bird.style.x) {
        obstacle.counted = true;
        GC.app.incrScore(1);
      }
    });
  };

  this.tick = function() {
    if (this.obstacles.length != 0 && this.obstacles[this.obstacles.length - 1].style.x < GC.app.baseWidth) {
      this.add();
    }
  };

});