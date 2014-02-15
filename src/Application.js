import device;
import animate;
import lib.Enum as Enum;
import util.underscore as _;
import ui.resource.loader as loader;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import src.Bird as Bird;
import src.Obstacles as Obstacles;
import src.Clouds as Clouds;
import src.ScoreBoard as ScoreBoard;

// Resolution mode
var RES_MODE = 720;
// Gravity
GLOBAL.Config = {
  gravity: 1500,
  flapHeight: 130,
  floorY: -100,
  ceilY: 100,
  HP: 3,
  obstacles: {
    speed: 200, // Pixels / second
    speedIncrease: 4, // Each time the score increase, speed is increased by this
    spaceX: {
      min: 400,
      max: 700
    },
    spaceY: {
      min: 300,
      max: 500
    },
    prob: {
      top: 0.8,
      bottom: 0.9
    }
  },
  clouds: {
    speed: 100, // Pixels / second
    generateTime: 1500, // Time between 2 generations
    initNumber: 10
  }
};

// Don't change that, please:
var BOUNDS_WIDTH = 720;
var BOUNDS_HEIGHT = 1280;

var GAME_STATE = Enum(
  "INIT",
  "FLYING",
  "DEAD"
);


exports = Class(GC.Application, function() {

  this.initUI = function() {
    var that = this;

    loader.preload(['resources/images', 'resources/sounds'], function() {
      //image is loaded, audio files are loaded ...
    });

    this.view.style.backgroundColor = '#cedeee';

    this.scaleUI();

    // Logo
    var logoHeight = GC.app.baseHeight * 3 / 10;
    var logoWidth = logoHeight * 800 / 576;
    if (logoWidth > GC.app.baseWidth - 20) {
      logoWidth = GC.app.baseWidth - 20;
      logoHeight = logoWidth * 576 / 800;
    }
    this.logo = new ImageView({
      superview: this,
      zIndex: 3,
      image: "resources/images/logo.png",
      x: GC.app.baseWidth / 2,
      y: GC.app.baseHeight * 1 / 10,
      width: logoWidth,
      height: logoHeight,
      offsetX: -logoWidth / 2,
      opacity: 0
    });
    this.logo.animator = animate(this.logo);


    // Score
    this.scoreText = new TextView({
      superview: this.view,
      x: 0,
      y: 0,
      zIndex: 3,
      width: GC.app.baseWidth,
      height: 100,
      anchorX: GC.app.baseWidth / 2,
      anchorY: 50,
      text: "",
      fontFamily: "wendy",
      autoFontSize: true,
      color: "#ef8b09",
      shadowColor: "#000000"
    });
    this.scoreText.animator = animate(this.scoreText);

    // Obstacles
    this.obstacles = new Obstacles({
      superview: this.view,
      zIndex: 1
    });

    // Sky
    new Clouds({
      superview: this.view,
      zIndex: 0
    });

    // Bird
    this.bird = new Bird({
      superview: this.view,
      zIndex: 2
    })
      .on("die", function() {
        that.setHP(0);
        that.stopGame();
      })
      .on("loseHP", function() {
        that.setHP(that.HP - 0.5);
        if (that.HP == 0) {
          that.bird.emit("die");
        }
      });

    // HP / Hearts
    this.hearts = [];
    for (var i = 0; i < Config.HP; i++) {
      this.hearts.unshift(new ImageView({
        superview: this,
        zIndex: 3,
        image: "resources/images/heart-full.png",
        width: 48,
        height: 48,
        anchorX: 24,
        anchorY: 24,
        x: GC.app.baseWidth - (48 + 5) * (i + 1),
        y: 5
      }));
      this.hearts[0].animator = animate(this.hearts[0]);
    }

    this.resetGame();

    // Clicks
    this.view.on("InputSelect", function() {
      if (this.state == GAME_STATE.INIT) {
        that.startGame();
      } else if (this.state == GAME_STATE.FLYING) {
        that.bird.flap();
      }
    });

    // Back button
    device.setBackButtonHandler(function() {
      return false;
    });
  };


  this.scaleUI = function() {
    this.resolutionMode = RES_MODE;
    if (device.height > device.width) {
      if (device.height / device.width > BOUNDS_HEIGHT / BOUNDS_WIDTH) {
        this.baseHeight = BOUNDS_HEIGHT;
        this.baseWidth = device.width * (BOUNDS_HEIGHT / device.height);
      } else {
        this.baseWidth = BOUNDS_WIDTH;
        this.baseHeight = device.height * (BOUNDS_WIDTH / device.width);
      }
      this.scale = device.width / this.baseWidth;
    }
    this.view.style.scale = this.scale;
  };

  this.startGame = function() {
    this.state = GAME_STATE.FLYING;
    this.score = 0;
    this.scoreText.setText(this.score);
    this.setHP(Config.HP);
    _.each(this.hearts, function(heart) {
      heart.show();
    });
    this.logo.animator.now({
      opacity: 0
    }, 200);

    this.bird.flap();
    this.obstacles.add();
  };

  this.resetGame = function() {
    var that = this;
    setTimeout(function() {
      that.state = GAME_STATE.INIT;
    }, 200);
    this.bird.reset();
    this.obstacles.reset();
    _.each(this.hearts, function(heart) {
      heart.hide();
    });
    this.logo.animator.now({
      opacity: 1
    }, 2000);
  };

  this.stopGame = function() {
    this.playing = false;
    this.state = GAME_STATE.DEAD;
    this.obstacles.stop();
    this.scoreText.setText("");

    // Highscore
    var highscore = localStorage.getItem("highscore");
    if (!highscore || this.score > highscore) {
      highscore = this.score;
      localStorage.setItem("highscore", highscore);
    }

    // Show score and Highscore
    setTimeout(bind(this, function() {
      if (!this.scoreBoard) {
        this.scoreBoard = new ScoreBoard({
          superview: this.view
        });
      }
      this.scoreBoard.appear(this.score, highscore);
    }), 1000);
  };


  this.setHP = function(HP) {
    this.HP = HP;
    _.times(Config.HP, bind(this, function(i) {
      var image;
      var heart = this.hearts[i];
      if (i == HP - 0.5) {
        image = "resources/images/heart-half.png";
      } else if (i + 1 > HP) {
        image = "resources/images/heart-empty.png";
      } else {
        image = "resources/images/heart-full.png";
      }
      if (image !== heart.getImage()._originalURL) {
        heart.animator
          .now({
            scale: 1.6
          }, 100)
          .then(function() {
            heart.setImage(image);
          })
          .then({
            scale: 1
          }, 300);
      }
    }));
  };

  this.incrScore = function(n) {
    this.score += n;
    this.scoreText.setText(this.score);
    this.scoreText.animator
      .now({
        scale: 1.6
      }, 100)
      .then({
        scale: 1
      }, 100);
    // Increase speed
    this.obstacles.speed = Config.obstacles.speed + Config.obstacles.speedIncrease * this.score;
  };

});