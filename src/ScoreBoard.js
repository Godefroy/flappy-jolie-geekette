import animate;
import util.underscore as _;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;

var jewelry = [{
  image: "resources/images/jewel1.png",
  url: "http://www.joliegeekette.com/metal/boucles-mario-champi-rouge.html"
}, {
  image: "resources/images/jewel2.png",
  url: "http://www.joliegeekette.com/tous-les-bijoux/bague-croix-multidirectionnelle-xbox.html"
}, {
  image: "resources/images/jewel3.png",
  url: "http://www.joliegeekette.com/tous-les-bijoux/space-aliens-cuivres.html"
}, {
  image: "resources/images/jewel4.png",
  url: "http://www.joliegeekette.com/tous-les-bijoux/love-in-8bit.html"
}, {
  image: "resources/images/jewel5.png",
  url: "http://www.joliegeekette.com/hama/bracelet-coeurs-pixelises.html"
}, {
  image: "resources/images/jewel6.png",
  url: "http://www.joliegeekette.com/recup/bague-tabulation-noire.html"
}];

var boardMargins = 30;

exports = Class(View, function(supr) {

  this.init = function(opts) {
    var that = this;
    var opts = merge(opts, {
      width: GC.app.baseWidth - 2 * boardMargins,
      height: GC.app.baseHeight,
      x: GC.app.baseWidth,
      zIndex: 3
    });

    supr(this, 'init', [opts]);


    var scoresView = new ImageView({
      superview: this,
      image: "resources/images/scores.png",
      width: this.style.width * 2 / 3,
      height: this.style.width / 3,
      x: 0,
      y: 0
    });
    var scoreTextMargins = 20;

    // Score
    new TextView({
      superview: scoresView,
      x: scoreTextMargins,
      y: scoreTextMargins + 20,
      width: scoresView.style.width * 0.564 - 2 * scoreTextMargins,
      height: scoresView.style.height / 3 - scoreTextMargins,
      text: "Score",
      fontFamily: "wendy",
      size: 80,
      color: "#ef8b09",
      shadowColor: "#000000"
    });
    this.score = new TextView({
      superview: scoresView,
      x: scoreTextMargins,
      y: scoresView.style.height / 3 + scoreTextMargins,
      width: scoresView.style.width * 0.564 - 2 * scoreTextMargins,
      height: scoresView.style.height * 2 / 3 - scoreTextMargins,
      fontFamily: "wendy",
      size: 100,
      color: "#ef8b09",
      shadowColor: "#000000"
    });

    // High Score
    new TextView({
      superview: scoresView,
      x: this.score.style.x + this.score.style.width + 2 * scoreTextMargins,
      y: scoreTextMargins + 20,
      width: scoresView.style.width * 0.436 - 2 * scoreTextMargins,
      height: scoresView.style.height / 3 - scoreTextMargins,
      text: "Best",
      fontFamily: "wendy",
      size: 60,
      color: "#ef8b09",
      shadowColor: "#000000"
    });
    this.highscore = new TextView({
      superview: scoresView,
      x: this.score.style.x + this.score.style.width + 2 * scoreTextMargins,
      y: scoresView.style.height / 3 + scoreTextMargins,
      width: scoresView.style.width * 0.436 - 2 * scoreTextMargins,
      height: scoresView.style.height * 2 / 3 - scoreTextMargins,
      fontFamily: "wendy",
      size: 80,
      color: "#ef8b09",
      shadowColor: "#000000"
    });

    // Play button
    var playButton = new ImageView({
      superview: this,
      image: "resources/images/play-button.png",
      width: this.style.width / 3,
      height: this.style.width / 3,
      x: this.style.width * 2 / 3,
      y: 0
    })
      .on("InputSelect", function() {
        that.disappear();
      });


    // Jewelry
    var imgJewelryPanelConf = {
      width: 800,
      height: 533
    };
    var jewelryBgView = new ImageView({
      superview: this,
      width: this.style.width + 2 * boardMargins,
      height: this.style.width * imgJewelryPanelConf.height / imgJewelryPanelConf.width,
      x: -boardMargins,
      y: playButton.style.y + playButton.style.height + 60,
      backgroundColor: "#FFFFFF",
      opacity: 0.75
    });
    var jewelryView = new ImageView({
      superview: this,
      width: this.style.width,
      height: this.style.width * imgJewelryPanelConf.height / imgJewelryPanelConf.width,
      x: 0,
      y: playButton.style.y + playButton.style.height + 60
    });

    var jewelMargin = 60;
    var jewelSize = (jewelryView.style.width - jewelMargin * 4) / 3;
    _.each(jewelry, function(jewel, i) {
      new ImageView({
        superview: jewelryView,
        image: jewel.image,
        width: jewelSize,
        height: jewelSize,
        x: (i % 3) * (jewelSize + jewelMargin) + jewelMargin,
        y: Math.floor(i / 3) * (jewelSize + jewelMargin) + jewelMargin
      })
        .on("InputSelect", function() {
          window.open(jewel.url);
        });
    });


    // Discover button
    var imgDiscoverConf = {
      width: 1000,
      width2: 964,
      height: 355
    };
    new ImageView({
      superview: this,
      image: "resources/images/discover.png",
      width: this.style.width * imgDiscoverConf.width / imgDiscoverConf.width2,
      height: this.style.width * imgDiscoverConf.height / imgDiscoverConf.width,
      x: 0,
      y: jewelryView.style.y + jewelryView.style.height + 30
    })
      .on("InputSelect", function() {
        window.open("http://www.joliegeekette.com/");
      });


    // Position panel
    var lowestView = _.max(this.getSubviews(), function(view) {
      return view.style.y + view.style.height;
    });
    this.style.y = (GC.app.baseHeight - lowestView.style.y - lowestView.style.height) / 2;

    // Animations
    this.animator = animate(this);
  };


  this.appear = function(score, highscore) {
    this.style.x = GC.app.baseWidth;
    this.score.setText(score);
    this.highscore.setText(highscore);
    this.show();
    this.animator
      .now({
        x: 30
      });
  };

  this.disappear = function() {
    this.animator
      .now({
        x: -GC.app.baseWidth
      })
      .then(function() {
        this.hide();
        GC.app.resetGame();
      });
  };

});