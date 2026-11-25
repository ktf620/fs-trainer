/* 동물 달리기 1km — 그림 : 동물 150종을 실제 체형(옆모습, 오른쪽을 보고 달림)으로 그린다. 그림 파일 없이 캔버스에 직접 그림 */
(function (root) {
  'use strict';
  var PI = Math.PI, TAU = PI * 2, OL = '#4a3226', LW = 2.6;
  var Art = root.Art = root.Art || {};
  var SPEC = {"rabbit":{"fur":"#fff4e3","fur2":"#ffffff","inner":"#ffb3c4","nose":"#ff7f9d","ear":"long","tail":"puff","snout":{"x":14,"y":9,"rx":11,"ry":8,"out":false},"size":0.95,"teeth":true},"turtle":{"fur":"#8fd46b","fur2":"#d6f2a8","inner":"#8fd46b","nose":null,"ear":"none","tail":"tiny","snout":null,"size":0.92,"leg":7,"hr":0.9,"shell":"#c48a4a","shell2":"#93602c"},"cheetah":{"fur":"#ffcc55","fur2":"#fff4d6","inner":"#f2a35e","nose":"#3b2a20","ear":"round-s","tail":"long","tailTip":"#4a3226","snout":{"x":15,"y":9,"rx":11,"ry":8,"out":true},"size":1.04,"spots":"#7a4a22","leg":11},"fox":{"fur":"#ff8b3d","fur2":"#fff6ea","inner":"#ffd9b8","nose":"#3b2a20","ear":"point","earTip":"#5a3524","tail":"bushy","tailTip":"#fff6ea","snout":{"x":17,"y":9,"rx":12,"ry":7.2,"out":true},"size":1,"sock":"#5a3524","cheek":true},"bear":{"fur":"#b07a45","fur2":"#f0d2a6","inner":"#8a5a30","nose":"#3b2a20","ear":"round","tail":"stub","snout":{"x":15,"y":9,"rx":11,"ry":8.6,"out":true},"size":1.13,"brx":17,"bry":18.5,"lw":8.6},"penguin":{"dark":true,"fur":"#3c4963","fur2":"#ffffff","inner":"#3c4963","nose":null,"ear":"none","tail":"wedge","snout":null,"size":0.9,"leg":6,"brx":16.5,"bry":18,"beak":"#ffa92e","feet":"#ffa92e","belly":"#ffffff","penguinFace":true,"wing":true},"elephant":{"fur":"#a9bcd3","fur2":"#c7d6e6","inner":"#f5b9c9","nose":null,"ear":"fan","tail":"tuft","snout":null,"size":1.18,"brx":18,"bry":19,"lw":9.4,"trunk":true},"kangaroo":{"fur":"#d99a5b","fur2":"#f8dfc0","inner":"#f2b6a0","nose":"#3b2a20","ear":"tall","tail":"thick","snout":{"x":17,"y":8,"rx":12.5,"ry":8,"out":true},"size":1.08,"leg":11.5,"bigFeet":true,"belly":"#f8dfc0"},"skunk":{"dark":true,"sclera":true,"fur":"#3b3442","fur2":"#ffffff","inner":"#ff9eb5","nose":"#ff7f9d","ear":"round-s","tail":"skunk","snout":{"x":15,"y":9,"rx":10.5,"ry":7.5,"out":true},"size":0.93,"stripe":true},"pig":{"fur":"#ffb6c4","fur2":"#ff8fab","inner":"#ff8fab","nose":null,"ear":"pig","tail":"curl","snout":{"x":20,"y":8,"rx":8,"ry":8.6,"out":true,"disc":true},"size":1,"brx":17.5,"bry":18},"dog":{"fur":"#f2a64b","fur2":"#fff7e8","inner":"#ffd9b8","nose":"#3b2a20","ear":"point-s","tail":"curlup","snout":{"x":16,"y":9,"rx":11.5,"ry":7.6,"out":true},"size":0.97,"cheek":true,"brow":"#fff7e8","tongue":true},"cat":{"fur":"#9ca6b9","fur2":"#f1f4f9","inner":"#ffb3c4","nose":"#ff7f9d","ear":"point","tail":"catup","snout":{"x":13,"y":9,"rx":10,"ry":7,"out":false},"size":0.95,"stripes":"#6c7689","whisker":true},"panda":{"fur":"#ffffff","fur2":"#ffffff","inner":"#3b3442","nose":"#3b3442","ear":"round","earCol":"#3b3442","tail":"stub","snout":{"x":14,"y":9,"rx":10.5,"ry":8,"out":false},"size":1.08,"brx":17.5,"bry":18.5,"lw":8.6,"limbCol":"#3b3442","patch":true},"duck":{"fur":"#ffe35a","fur2":"#ffe35a","inner":"#ffe35a","nose":null,"ear":"none","tail":"duck","snout":null,"size":0.86,"leg":6,"beak":"#ff9a2e","feet":"#ff9a2e","tuft":true,"wing":true},"lion":{"fur":"#f6b84a","fur2":"#fff1cf","inner":"#e89a5a","nose":"#5a3524","ear":"round-s","tail":"lion","tailTip":"#8a4f22","snout":{"x":15,"y":9,"rx":11.5,"ry":8.6,"out":true},"size":1.08,"mane":"#b5651d","brx":16.5,"bry":18},"tiger":{"fur":"#ff9a3c","fur2":"#fff6ea","inner":"#ffd9b8","nose":"#ff7f9d","ear":"round-s","tail":"ring","ring":"#2b2018","ringThin":true,"snout":{"x":15,"y":9,"rx":11,"ry":8.2,"out":true},"size":1.06,"tstripes":"#2b2018","lowerWhite":true,"brow":"#fff6ea"},"zebra":{"fur":"#ffffff","fur2":"#5b5b68","inner":"#ffb3c4","nose":"#2b2018","ear":"leaf","tail":"tuft","snout":{"x":18,"y":9,"rx":13,"ry":9,"out":true},"size":1.03,"zstripes":"#2b2018","maneTop":"#2b2018","leg":11,"bodyStripes":"#2b2018"},"giraffe":{"fur":"#ffd45e","fur2":"#fff0c4","inner":"#f2a35e","nose":"#5a3524","ear":"leaf","tail":"lion","tailTip":"#8a4f22","snout":{"x":18,"y":9,"rx":12.5,"ry":8.5,"out":true},"size":1,"neck":17,"patches":"#c77b30","ossi":"#8a4f22","leg":12,"lashes":true,"hr":0.88},"horse":{"fur":"#b9783f","fur2":"#e9c9a2","inner":"#8a5a30","nose":"#3b2a20","ear":"leaf","tail":"horse","tailCol":"#5a3524","snout":{"x":18,"y":9,"rx":13,"ry":9,"out":true},"size":1.07,"maneTop":"#5a3524","forelock":"#5a3524","leg":11.5,"neck":4,"blaze":true},"cow":{"fur":"#ffffff","fur2":"#ffc2cf","inner":"#ffc2cf","nose":null,"ear":"side","tail":"tuft","snout":{"x":17,"y":10,"rx":12.5,"ry":8.4,"out":true,"nostril":true},"size":1.08,"cowspots":"#3b3442","horn":"cow","brx":17.5,"bry":18.5,"lw":8.4},"sheep":{"fur":"#fff0dc","fur2":"#fff0dc","inner":"#ffc2cf","nose":"#ff7f9d","ear":"side","tail":"puff","snout":{"x":14,"y":9,"rx":10,"ry":7.5,"out":false},"size":0.96,"wool":"#ffffff","bodyCol":"#ffffff","woolBody":true},"goat":{"fur":"#f1ede4","fur2":"#ffffff","inner":"#ffc2cf","nose":"#ff7f9d","ear":"side","tail":"stub","snout":{"x":16,"y":9,"rx":11,"ry":8,"out":true},"size":0.98,"horn":"goat","beard":"#e3ddd0"},"deer":{"fur":"#d28f52","fur2":"#fff1dc","inner":"#f2b6a0","nose":"#3b2a20","ear":"leaf","tail":"puff","snout":{"x":17,"y":9,"rx":11.5,"ry":7.6,"out":true},"size":1.02,"horn":"antler","dots":"#fff1dc","leg":11.5},"koala":{"fur":"#a7adb8","fur2":"#e9edf2","inner":"#ffffff","nose":null,"ear":"koala","tail":"none","snout":{"x":13,"y":10,"rx":10,"ry":7,"out":false},"size":0.98,"bigNose":"#4a4050","eyeWide":3},"sloth":{"fur":"#b99a78","fur2":"#f1e2c8","inner":"#b99a78","nose":"#5a3524","ear":"none","tail":"none","snout":null,"size":0.98,"slothFace":true,"sclera":true},"monkey":{"fur":"#a8703c","fur2":"#f6d7ae","inner":"#f6d7ae","nose":null,"ear":"sideRound","tail":"monkey","snout":null,"size":0.97,"apeFace":true},"gorilla":{"dark":true,"sclera":true,"fur":"#4b4f5a","fur2":"#9aa0ad","inner":"#9aa0ad","nose":null,"ear":"sideRound","tail":"none","snout":null,"size":1.15,"apeFace":true,"brx":18,"bry":19,"lw":9.2},"hippo":{"fur":"#b49ac0","fur2":"#d5c1de","inner":"#f2b6c8","nose":null,"ear":"round-s","tail":"tiny","snout":{"x":16,"y":10,"rx":15.5,"ry":10.5,"out":true,"nostrilTop":true,"teeth2":true},"size":1.13,"brx":18.5,"bry":19,"lw":9.4},"rhino":{"fur":"#9aa3ad","fur2":"#b9c1c9","inner":"#f2b6c8","nose":null,"ear":"leaf","tail":"tuft","snout":{"x":17,"y":10,"rx":13.5,"ry":9.5,"out":true,"nostril":true},"size":1.13,"brx":18.5,"bry":19,"lw":9.4,"horn":"rhino"},"croc":{"fur":"#6fbf5a","fur2":"#e8f2a6","inner":"#6fbf5a","nose":null,"ear":"none","tail":"croc","snout":{"x":20,"y":9,"rx":18,"ry":7.6,"out":true,"croc":true},"size":1.02,"belly":"#e8f2a6","eyeBump":true},"frog":{"fur":"#7ed35f","fur2":"#e2f7b0","inner":"#7ed35f","nose":null,"ear":"none","tail":"none","snout":null,"size":0.9,"leg":8,"belly":"#e2f7b0","eyesTop":true,"bigFeet":true,"wideMouth":true},"squirrel":{"fur":"#d9853b","fur2":"#fff1dc","inner":"#f2b6a0","nose":"#5a3524","ear":"point-s","tail":"squirrel","snout":{"x":14,"y":9,"rx":10.5,"ry":7.6,"out":false},"size":0.9,"teeth":true},"hamster":{"fur":"#f5b66a","fur2":"#fffaf0","inner":"#ffb3c4","nose":"#ff7f9d","ear":"round-s","tail":"none","snout":{"x":13,"y":10,"rx":9,"ry":6.5,"out":false},"size":0.86,"leg":7,"hamFace":true,"hrx":1.08,"brx":16.5},"mouse":{"fur":"#b8bcc8","fur2":"#f1f4f9","inner":"#ffb3c4","nose":"#ff7f9d","ear":"big","tail":"thinlong","tailCol":"#ffb3c4","snout":{"x":16,"y":9,"rx":10.5,"ry":7,"out":true},"size":0.84,"leg":7.5,"teeth":true},"hedgehog":{"fur":"#f6dfc0","fur2":"#fff4e3","inner":"#f2b6a0","nose":"#3b2a20","ear":"round-s","tail":"none","snout":{"x":17,"y":9,"rx":10.5,"ry":7,"out":true},"size":0.86,"leg":7,"spikes":"#8a5a3a"},"raccoon":{"sclera":true,"fur":"#9a9aa6","fur2":"#ffffff","inner":"#3b3442","nose":"#3b2a20","ear":"point-s","tail":"ring","ring":"#3b3442","snout":{"x":15,"y":9,"rx":10.5,"ry":7.5,"out":true},"size":0.95,"mask":"#3b3442","lowerWhite":true},"otter":{"fur":"#8a5f45","fur2":"#f1dcc0","inner":"#6b4632","nose":"#3b2a20","ear":"round-s","tail":"thick","snout":{"x":14,"y":9,"rx":11,"ry":8,"out":false},"size":0.97,"whisker":true,"belly":"#f1dcc0","tailK":0.66},"beaver":{"fur":"#9a6a42","fur2":"#e2c49a","inner":"#6b4632","nose":"#3b2a20","ear":"round-s","tail":"paddle","snout":{"x":14,"y":9,"rx":11,"ry":8,"out":false},"size":0.97,"teethBig":true,"brx":16.5},"wolf":{"fur":"#8e97a6","fur2":"#f4f6f9","inner":"#d9dde4","nose":"#2b2018","ear":"point","tail":"bushy","tailTip":"#f4f6f9","snout":{"x":17,"y":9,"rx":12,"ry":7.4,"out":true},"size":1.05,"cheek":true},"polar":{"fur":"#f7fbff","fur2":"#ffffff","inner":"#dfe8f2","nose":"#2b2018","ear":"round","tail":"stub","snout":{"x":15,"y":9,"rx":11,"ry":8.6,"out":true},"size":1.13,"brx":17.5,"bry":18.8,"lw":8.8},"seal":{"fur":"#8fa3b8","fur2":"#e6edf4","inner":"#8fa3b8","nose":"#2b2018","ear":"none","tail":"flipper","snout":{"x":14,"y":9,"rx":11.5,"ry":8,"out":false},"size":0.95,"leg":6,"wing":true,"whisker":true,"belly":"#e6edf4","feet":"#6f8399"},"owl":{"fur":"#9b6b43","fur2":"#f3dfc0","inner":"#9b6b43","nose":null,"ear":"tuft","tail":"wedge","snout":null,"size":0.9,"leg":6,"wing":true,"beak":"#ffb02e","beakType":"owl","feet":"#ffb02e","belly":"#f3dfc0","owlDisc":"#f3dfc0","brx":16.5,"bry":18},"chicken":{"fur":"#ffffff","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#ffffff","#f1f1f1","#ffffff"],"snout":null,"size":0.9,"leg":6.5,"wing":true,"beak":"#ffb02e","beakType":"cone","feet":"#ffb02e","comb":"#ff4d5e"},"parrot":{"fur":"#ff5a4d","fur2":"#ffffff","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#3d8bff","#ff5a4d","#ffd23f"],"snout":null,"size":0.9,"leg":6,"wing":true,"wingCol":"#3ecf8e","beak":"#f3e9d6","beakType":"hook","feet":"#8a8f9c","eyeRing":true,"crest":"#ffd23f"},"flamingo":{"fur":"#ff9ec0","fur2":"#ffffff","inner":"#ff9ec0","nose":null,"ear":"none","tail":"feathers","feathers":["#ff7fae","#ff9ec0","#ffc0d6"],"snout":null,"size":0.96,"leg":13,"legW":4.2,"neck":19,"neckW":6,"wing":true,"wingCol":"#ff7fae","beak":"#fff6ea","beakType":"bent","feet":"#ff7fae","limbCol":"#ff8fb8","hr":0.74,"brx":14,"bry":15},"ostrich":{"fur":"#f6cdb4","fur2":"#f6cdb4","inner":"#f6cdb4","nose":null,"ear":"none","tail":"feathers","feathers":["#ffffff","#f1f1f1","#ffffff"],"snout":null,"size":1.02,"leg":14,"legW":5,"neck":15,"neckW":6.5,"wing":true,"wingCol":"#4a4352","bodyCol":"#3b3442","beak":"#e8b98a","beakType":"flat","feet":"#f2a79a","limbCol":"#f6b8a8","hr":0.78,"tuftHair":true,"lashes":true,"brx":16,"bry":16},"camel":{"fur":"#dcae6e","fur2":"#f2d9ae","inner":"#c89250","nose":"#5a3524","ear":"leaf","tail":"tuft","snout":{"x":18,"y":10,"rx":13,"ry":9,"out":true},"size":1.08,"neck":7,"hump":true,"leg":11.5,"hr":0.92},"alpaca":{"fur":"#fff0dc","fur2":"#fffaf2","inner":"#ffc2cf","nose":"#c98a7a","ear":"leaf","tail":"puff","snout":{"x":15,"y":10,"rx":9.5,"ry":7,"out":true},"size":0.98,"neck":11,"neckW":13,"wool":"#fff0dc","bodyCol":"#fff0dc","woolBody":true,"hr":0.88},"bat":{"dark":true,"sclera":true,"fur":"#5b4a78","fur2":"#8a78a8","inner":"#ff9eb5","nose":"#ff9eb5","ear":"bat","tail":"none","snout":{"x":13,"y":9,"rx":9,"ry":6.5,"out":false},"size":0.86,"leg":6.5,"wing":true,"batWing":true,"wingCol":"#463a5e","fang":true},"redpanda":{"fur":"#d9632e","fur2":"#ffffff","inner":"#ffffff","nose":"#3b2a20","ear":"round","earEdge":"#ffffff","tail":"ring","ring":"#9a3f1a","snout":{"x":14,"y":9,"rx":10.5,"ry":7.6,"out":false},"size":0.96,"limbCol":"#4a2a1e","rpFace":true,"brow":"#ffffff"},"shark":{"fur":"#7f93a8","fur2":"#e6edf4","inner":"#8fa3b8","nose":null,"ear":"none","tail":"flipper","snout":{"x":17,"y":9,"rx":13,"ry":7.4,"out":true,"croc":true},"size":1.05,"leg":6,"wing":true,"whisker":false,"belly":"#ffffff","feet":"#6f8399","fin":1},"whale":{"fur":"#5b8fd6","fur2":"#dcebff","inner":"#8fa3b8","nose":"#2b2018","ear":"none","tail":"flipper","snout":null,"size":1.15,"leg":6,"wing":true,"whisker":false,"belly":"#dcebff","feet":"#4a7bc0","wideMouth":true,"spout":1,"brx":18.5,"bry":19},"dolphin":{"fur":"#8fb4d6","fur2":"#f1f7fc","inner":"#8fa3b8","nose":null,"ear":"none","tail":"flipper","snout":{"x":19,"y":10,"rx":12,"ry":6,"out":true},"size":0.95,"leg":6,"wing":true,"whisker":false,"belly":"#f1f7fc","feet":"#7a9fc2","fin":1},"orca":{"fur":"#2f3440","fur2":"#ffffff","inner":"#8fa3b8","nose":null,"ear":"none","tail":"flipper","snout":{"x":14,"y":9,"rx":11.5,"ry":8,"out":false},"size":1.12,"leg":6,"wing":true,"whisker":false,"belly":"#ffffff","feet":"#2f3440","dark":true,"sclera":true,"fin":1,"orca":1},"octopus":{"fur":"#e58ab0","fur2":"#f7c3d8","inner":"#8fd46b","nose":null,"ear":"none","tail":"tentacle","snout":null,"size":0.95,"leg":8,"hr":1.08,"shell":null,"shell2":"#93602c"},"squid":{"fur":"#f7d9e3","fur2":"#ffffff","inner":"#8fd46b","nose":null,"ear":"none","tail":"tentacle","snout":null,"size":0.92,"leg":8,"hr":0.9,"shell":null,"shell2":"#93602c","fin":1},"crab":{"fur":"#f0553a","fur2":"#ffd1c2","inner":"#7ed35f","nose":null,"ear":"none","tail":"none","snout":null,"size":0.88,"leg":8,"belly":"#ffd1c2","eyesTop":true,"bigFeet":false,"wideMouth":true,"claw":1,"brx":17},"lobster":{"fur":"#c9382e","fur2":"#f2a79a","inner":"#7ed35f","nose":null,"ear":"none","tail":"croc","snout":null,"size":0.98,"leg":8,"belly":"#f2a79a","eyesTop":true,"bigFeet":false,"wideMouth":true,"claw":1,"antenna":"#c9382e"},"shrimp":{"fur":"#ff9d7a","fur2":"#ffe1d6","inner":"#7ed35f","nose":null,"ear":"none","tail":"monkey","snout":null,"size":0.84,"leg":8,"belly":"#ffe1d6","eyesTop":false,"bigFeet":false,"wideMouth":false,"antenna":"#ff7a52"},"jellyfish":{"fur":"#d9a8f0","fur2":"#f1dcfb","inner":"#8fd46b","nose":null,"ear":"none","tail":"tentacle","snout":null,"size":0.86,"leg":7,"hr":1.1,"shell":null,"shell2":"#93602c"},"starfish":{"fur":"#ffa23a","fur2":"#ffd08a","inner":"#8fd46b","nose":null,"ear":"none","tail":"none","snout":null,"size":0.86,"leg":7,"hr":0.9,"shell":null,"shell2":"#93602c","starBack":1},"seahorse":{"fur":"#ffc23a","fur2":"#ffe59a","inner":"#8fd46b","nose":null,"ear":"none","tail":"monkey","snout":{"x":22,"y":8,"rx":10,"ry":4.4,"out":true},"size":0.9,"leg":7,"hr":0.9,"shell":null,"shell2":"#93602c","crest":"#ff9a2e"},"clownfish":{"fur":"#ff8a2e","fur2":"#ffffff","inner":"#8fa3b8","nose":"#2b2018","ear":"none","tail":"flipper","snout":null,"size":0.86,"leg":6,"wing":true,"whisker":false,"belly":"#ffffff","feet":"#ff8a2e","bands":1,"fin":1,"wideMouth":true},"puffer":{"fur":"#f2d27a","fur2":"#fff6d6","inner":"#f2b6a0","nose":"#3b2a20","ear":"none","tail":"flipper","snout":null,"size":0.86,"leg":7,"spikes":"#c9a23a","wideMouth":true,"feet":"#c9a23a","hrx":1.1},"manta":{"dark":false,"sclera":false,"fur":"#3f5f8f","fur2":"#eaf2fb","inner":"#ff9eb5","nose":null,"ear":"none","tail":"thinlong","snout":null,"size":0.98,"leg":6.5,"wing":true,"batWing":true,"wingCol":"#34507a","fang":false,"belly":"#eaf2fb","tailCol":"#34507a","wideMouth":true},"walrus":{"fur":"#a9785a","fur2":"#e2c4a8","inner":"#8fa3b8","nose":"#2b2018","ear":"none","tail":"flipper","snout":{"x":14,"y":10,"rx":13,"ry":9,"out":false},"size":1.15,"leg":6,"wing":true,"whisker":true,"belly":null,"feet":"#8a5f45","tusk":12,"brx":18.5,"bry":19},"narwhal":{"fur":"#b9c7d6","fur2":"#eef3f8","inner":"#8fa3b8","nose":null,"ear":"none","tail":"flipper","snout":{"x":14,"y":9,"rx":11.5,"ry":8,"out":false},"size":1.02,"leg":6,"wing":true,"whisker":false,"belly":"#eef3f8","feet":"#6f8399","uni":"#fff4dc"},"sealion":{"fur":"#a8794f","fur2":"#e2c49a","inner":"#8a5f45","nose":"#2b2018","ear":"round-s","tail":"flipper","snout":{"x":14,"y":9,"rx":11.5,"ry":8,"out":false},"size":1.02,"leg":6,"wing":true,"whisker":true,"belly":null,"feet":"#8a5f45"},"manatee":{"fur":"#9aa3ad","fur2":"#c7ced6","inner":"#8fa3b8","nose":null,"ear":"none","tail":"paddle","snout":{"x":15,"y":10,"rx":14,"ry":10,"out":true,"nostrilTop":true},"size":1.12,"leg":6,"wing":true,"whisker":false,"belly":null,"feet":"#7f8a96","brx":18.5,"bry":19},"beluga":{"fur":"#f4f8fc","fur2":"#ffffff","inner":"#8fa3b8","nose":"#2b2018","ear":"none","tail":"flipper","snout":null,"size":1.04,"leg":6,"wing":true,"whisker":false,"belly":null,"feet":"#dfe8f2","wideMouth":true,"hr":1.06},"swordfish":{"fur":"#4f78b8","fur2":"#c9d6ea","inner":"#8fa3b8","nose":null,"ear":"none","tail":"flipper","snout":{"x":26,"y":8,"rx":20,"ry":3.4,"out":true},"size":0.95,"leg":6,"wing":true,"whisker":false,"belly":"#dfeaf8","feet":"#3f64a0","fin":1},"angler":{"fur":"#5a4a5e","fur2":"#8a7890","inner":"#8fa3b8","nose":null,"ear":"none","tail":"flipper","snout":{"x":15,"y":10,"rx":14,"ry":8,"out":true,"croc":true},"size":0.9,"leg":6,"wing":true,"whisker":false,"belly":null,"feet":"#463a4a","dark":true,"sclera":true,"lure":1},"seaturtle":{"fur":"#7fcfa8","fur2":"#d6f2e2","inner":"#8fd46b","nose":null,"ear":"none","tail":"tiny","snout":null,"size":1,"leg":7,"hr":0.9,"shell":"#4f9f8a","shell2":"#2f7f6a","wing":true},"snake":{"fur":"#7ec850","fur2":"#f2e9a0","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thinlong","snout":{"x":16,"y":9,"rx":11,"ry":7,"out":true},"size":0.95,"belly":"#f2e9a0","eyeBump":false,"fork":1,"tailCol":"#7ec850"},"cobra":{"fur":"#c9a66b","fur2":"#f2e2bd","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thinlong","snout":{"x":16,"y":9,"rx":11,"ry":7,"out":true},"size":1,"belly":"#f2e2bd","eyeBump":false,"hood":"#b08a4f","fork":1,"tailCol":"#c9a66b"},"lizard":{"fur":"#58c79a","fur2":"#d9f5e6","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thinlong","snout":{"x":16,"y":9,"rx":11.5,"ry":7,"out":true},"size":0.86,"belly":"#d9f5e6","eyeBump":false,"tailCol":"#58c79a","leg":8},"chameleon":{"fur":"#8fd14f","fur2":"#e2f7b0","inner":"#6fbf5a","nose":null,"ear":"none","tail":"monkey","snout":{"x":16,"y":9,"rx":11,"ry":7,"out":true},"size":0.88,"belly":"#e2f7b0","eyeBump":true,"crestBack":"#6fb83a","leg":8},"iguana":{"fur":"#6fbf8a","fur2":"#d6f0dc","inner":"#6fbf5a","nose":null,"ear":"none","tail":"croc","snout":{"x":16,"y":9,"rx":12,"ry":7.4,"out":true},"size":1,"belly":"#d6f0dc","eyeBump":false,"spikes":"#3f8f5a"},"gecko":{"fur":"#ffd36b","fur2":"#fff3cf","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":15,"y":9,"rx":11,"ry":7,"out":true},"size":0.84,"belly":"#fff3cf","eyeBump":false,"spots":"#e08a2e","tailK":0.6,"leg":8,"eyeWide":1},"komodo":{"fur":"#7a7466","fur2":"#b9b2a0","inner":"#6fbf5a","nose":null,"ear":"none","tail":"croc","snout":{"x":18,"y":9,"rx":14,"ry":7.4,"out":true},"size":1.12,"belly":"#b9b2a0","eyeBump":false,"fork":1,"brx":18,"bry":18.5,"lw":9},"tortoise":{"fur":"#c9b27a","fur2":"#efe2b8","inner":"#8fd46b","nose":null,"ear":"none","tail":"tiny","snout":null,"size":1.08,"leg":7,"hr":0.9,"shell":"#8a6a3f","shell2":"#5f4526"},"axolotl":{"fur":"#ffb3c8","fur2":"#ffe1ea","inner":"#7ed35f","nose":null,"ear":"none","tail":"thick","snout":null,"size":0.88,"leg":8,"belly":"#ffe1ea","eyesTop":false,"bigFeet":false,"wideMouth":true,"gills":"#ff6f9a","tailK":0.6},"salamander":{"fur":"#3b3442","fur2":"#ffd23f","inner":"#7ed35f","nose":null,"ear":"none","tail":"thick","snout":null,"size":0.86,"leg":8,"belly":"#ffd23f","eyesTop":false,"bigFeet":false,"wideMouth":true,"dark":true,"sclera":true,"spots":"#ffd23f","tailK":0.6},"toad":{"fur":"#a88a5a","fur2":"#e2d0a8","inner":"#7ed35f","nose":null,"ear":"none","tail":"none","snout":null,"size":0.9,"leg":8,"belly":"#e2d0a8","eyesTop":true,"bigFeet":true,"wideMouth":true,"spots":"#7a6038"},"eagle":{"fur":"#ffffff","fur2":"#ffffff","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#7a4f2e","#5f3c20","#7a4f2e"],"snout":null,"size":1.02,"leg":6,"wing":true,"wingCol":"#6b4326","beak":"#ffc23a","beakType":"hook","feet":"#ffc23a","eyeRing":false,"crest":null,"bodyCol":"#7a4f2e"},"falcon":{"fur":"#8a93a6","fur2":"#f1f4f9","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#5f6878","#8a93a6","#5f6878"],"snout":null,"size":0.9,"leg":6,"wing":true,"wingCol":"#5f6878","beak":"#ffc23a","beakType":"hook","feet":"#ffc23a","eyeRing":false,"crest":null,"belly":"#f1f4f9"},"crow":{"fur":"#2f3138","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#2f3138","#24262c","#2f3138"],"snout":null,"size":0.88,"leg":6.5,"wing":true,"beak":"#4a4d57","beakType":"cone","feet":"#4a4d57","comb":null,"dark":true,"sclera":true,"wingCol":"#24262c"},"swan":{"fur":"#ffffff","fur2":"#ffffff","inner":"#ff9ec0","nose":null,"ear":"none","tail":"feathers","feathers":["#ffffff","#f1f4f9","#ffffff"],"snout":null,"size":1.02,"leg":8,"legW":5,"neck":17,"neckW":7,"wing":true,"wingCol":"#f1f4f9","beak":"#ff8a2e","beakType":"duck","feet":"#3b3442","limbCol":"#3b3442","hr":0.82,"brx":16.5,"bry":16.5},"goose":{"fur":"#f4f1ea","fur2":"#ffffff","inner":"#ff9ec0","nose":null,"ear":"none","tail":"feathers","feathers":["#f4f1ea","#d9d3c6","#f4f1ea"],"snout":null,"size":0.98,"leg":8,"legW":5,"neck":13,"neckW":7,"wing":true,"wingCol":"#d9d3c6","beak":"#ff9a2e","beakType":"duck","feet":"#ff9a2e","limbCol":"#ff9a2e","hr":0.84,"brx":16,"bry":16.5},"peacock":{"fur":"#2f6fd6","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"fan","feathers":["#ffffff","#f1f1f1","#ffffff"],"snout":null,"size":0.98,"leg":6.5,"wing":true,"beak":"#f3e9d6","beakType":"cone","feet":"#8a8f9c","comb":null,"wingCol":"#2a9d8f","crest":"#2a9d8f","fanCol":"#2a9d8f","fanEye":"#3d5bd6"},"toucan":{"fur":"#2f3138","fur2":"#ffffff","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#2f3138","#ff5a4d","#2f3138"],"snout":null,"size":0.9,"leg":6,"wing":true,"wingCol":"#24262c","beak":"#ff9a2e","beakType":"toucan","feet":"#6aa9ff","eyeRing":true,"crest":null,"dark":true,"sclera":true,"belly":"#ffffff"},"pelican":{"fur":"#ffffff","fur2":"#ffe35a","inner":"#ffe35a","nose":null,"ear":"none","tail":"feathers","snout":null,"size":1.02,"leg":6,"beak":"#ffb02e","feet":"#ffb02e","tuft":false,"wing":true,"beakType":"pouch","wingCol":"#e6e6e6","feathers":["#ffffff","#eeeeee","#ffffff"]},"woodpecker":{"fur":"#2f3138","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#2f3138","#ffffff","#2f3138"],"snout":null,"size":0.86,"leg":6.5,"wing":true,"beak":"#8a8f9c","beakType":"long","feet":"#8a8f9c","comb":null,"dark":true,"sclera":true,"belly":"#ffffff","crest":"#ff4d5e","wingCol":"#24262c","beakLen":13},"pigeon":{"fur":"#9aa3b5","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#7f8899","#9aa3b5","#7f8899"],"snout":null,"size":0.86,"leg":6.5,"wing":true,"beak":"#f2b6a0","beakType":"cone","feet":"#ff7f9d","comb":null,"bodyCol":"#8a78b8","wingCol":"#7f8899"},"seagull":{"fur":"#ffffff","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#aab4c2","#ffffff","#3b3442"],"snout":null,"size":0.9,"leg":6.5,"wing":true,"beak":"#ffc23a","beakType":"cone","feet":"#ffb02e","comb":null,"wingCol":"#aab4c2"},"sparrow":{"fur":"#b9854f","fur2":"#f6e6cf","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#8a5f38","#b9854f","#8a5f38"],"snout":null,"size":0.8,"leg":6.5,"wing":true,"beak":"#5a3f2a","beakType":"cone","feet":"#c98a5a","comb":null,"belly":"#f6e6cf","wingCol":"#8a5f38"},"hummingbird":{"fur":"#2fbf8a","fur2":"#f1fff8","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#1f9a6f","#2fbf8a","#c2185b"],"snout":null,"size":0.76,"leg":6.5,"wing":true,"beak":"#3b3442","beakType":"long","feet":"#5a5f6a","comb":null,"belly":"#f1fff8","wingCol":"#1f9a6f","beakLen":20},"kiwi":{"fur":"#8a6a4a","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"none","feathers":["#ffffff","#f1f1f1","#ffffff"],"snout":null,"size":0.84,"leg":6.5,"wing":false,"beak":"#e8d2b0","beakType":"long","feet":"#c9a27a","comb":null,"beakLen":20,"brx":17,"bry":18},"turkey":{"fur":"#8a5a3a","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"fan","feathers":["#ffffff","#f1f1f1","#ffffff"],"snout":null,"size":1,"leg":6.5,"wing":true,"beak":"#ffc23a","beakType":"cone","feet":"#c98a5a","comb":"#ff4d5e","wingCol":"#6b4326","fanCol":"#c9783a","fanEye":"#fff1dc"},"crane":{"fur":"#ffffff","fur2":"#ffffff","inner":"#ff9ec0","nose":null,"ear":"none","tail":"feathers","feathers":["#3b3442","#ffffff","#3b3442"],"snout":null,"size":1.02,"leg":13,"legW":4.2,"neck":19,"neckW":6,"wing":true,"wingCol":"#3b3442","beak":"#ffc23a","beakType":"long","feet":"#5a5f6a","limbCol":"#5a5f6a","hr":0.74,"brx":14,"bry":15,"beakLen":18,"dome":"#ff4d5e"},"stork":{"fur":"#ffffff","fur2":"#ffffff","inner":"#ff9ec0","nose":null,"ear":"none","tail":"feathers","feathers":["#3b3442","#ffffff","#3b3442"],"snout":null,"size":1,"leg":13,"legW":4.2,"neck":12,"neckW":6,"wing":true,"wingCol":"#3b3442","beak":"#ff6a4d","beakType":"long","feet":"#ff6a4d","limbCol":"#ff6a4d","hr":0.74,"brx":14,"bry":15,"beakLen":20},"puffin":{"dark":true,"fur":"#3c4963","fur2":"#ffffff","inner":"#3c4963","nose":null,"ear":"none","tail":"wedge","snout":null,"size":0.86,"leg":6,"brx":16.5,"bry":18,"beak":"#ff7a2e","feet":"#ff7a2e","belly":"#ffffff","penguinFace":true,"wing":true,"beakType":"toucan"},"robin":{"fur":"#8a6f55","fur2":"#ff8a3d","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#6b543f","#8a6f55","#6b543f"],"snout":null,"size":0.8,"leg":6.5,"wing":true,"beak":"#5a3f2a","beakType":"cone","feet":"#8a5f45","comb":null,"belly":"#ff8a3d","wingCol":"#6b543f"},"canary":{"fur":"#ffe14d","fur2":"#ffffff","inner":"#ffffff","nose":null,"ear":"none","tail":"feathers","feathers":["#f5c518","#ffe14d","#f5c518"],"snout":null,"size":0.78,"leg":6.5,"wing":true,"beak":"#ffb07a","beakType":"cone","feet":"#ffb07a","comb":null,"wingCol":"#f5c518"},"cockatoo":{"fur":"#ffffff","fur2":"#ffffff","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#ffffff","#ffe14d","#ffffff"],"snout":null,"size":0.9,"leg":6,"wing":true,"wingCol":"#f1f1f1","beak":"#5a5f6a","beakType":"hook","feet":"#8a8f9c","eyeRing":false,"crest":"#ffe14d"},"vulture":{"fur":"#f2b6a8","fur2":"#ffffff","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#3b3442","#4a4352","#3b3442"],"snout":null,"size":1.02,"leg":6,"wing":true,"wingCol":"#3b3442","beak":"#e8d2b0","beakType":"hook","feet":"#c9c2b4","eyeRing":false,"crest":null,"bodyCol":"#4a4352","neck":6,"neckW":7,"hr":0.86},"dodo":{"fur":"#9aa9b8","fur2":"#ffffff","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#ffffff","#f1f1f1","#ffffff"],"snout":null,"size":1,"leg":6,"wing":true,"wingCol":"#7f8f9f","beak":"#f2d98a","beakType":"hook","feet":"#ffc23a","eyeRing":false,"crest":null,"brx":18,"bry":18.5},"trex":{"fur":"#7fae5a","fur2":"#e2efb8","inner":"#6fbf5a","nose":null,"ear":"none","tail":"croc","snout":{"x":19,"y":10,"rx":15,"ry":8.4,"out":true,"croc":true},"size":1.2,"belly":"#e2efb8","eyeBump":false,"armK":0.55,"brx":18.5,"bry":19,"lw":9.6,"hr":1.1},"triceratops":{"fur":"#4fb3a6","fur2":"#d6f2ec","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":18,"y":10,"rx":12,"ry":8.4,"out":true,"nostril":true},"size":1.15,"belly":"#d6f2ec","eyeBump":false,"mane":"#f2a35e","horn":"tri","hornNose":1,"brx":18.5,"bry":19,"lw":9.4},"stego":{"fur":"#6fbf8a","fur2":"#d9f2df","inner":"#6fbf5a","nose":null,"ear":"none","tail":"croc","snout":{"x":17,"y":10,"rx":11.5,"ry":7.6,"out":true},"size":1.12,"belly":"#d9f2df","eyeBump":false,"spikes":"#ff9a3c","spikeBig":1,"brx":18.5,"bry":19,"lw":9.4,"hr":0.9},"brachio":{"fur":"#6f9fd6","fur2":"#dcebff","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":16,"y":9,"rx":11,"ry":7.4,"out":true},"size":1.12,"belly":"#dcebff","eyeBump":false,"dome":"#5f8fc6","neck":20,"neckW":11,"brx":18.5,"bry":19,"lw":9.4,"hr":0.82},"raptor":{"fur":"#d98a4f","fur2":"#f6e2c4","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":18,"y":9,"rx":13,"ry":7,"out":true,"croc":true},"size":0.98,"belly":"#f6e2c4","eyeBump":false,"crest":"#3d8bff","armK":0.8,"tailK":0.8},"ptero":{"dark":false,"sclera":false,"fur":"#d9b27a","fur2":"#f6e6c4","inner":"#ff9eb5","nose":null,"ear":"none","tail":"none","snout":null,"size":1,"leg":6.5,"wing":true,"batWing":true,"wingCol":"#b98a4f","fang":false,"belly":"#f6e6c4","crestBack":"#c9783a","beak":"#e8d2a0","beakType":"long","beakLen":22},"ankylo":{"fur":"#a88a5a","fur2":"#e2d0a8","inner":"#6fbf5a","nose":null,"ear":"none","tail":"club","snout":{"x":17,"y":10,"rx":12,"ry":8,"out":true,"nostril":true},"size":1.1,"belly":"#e2d0a8","eyeBump":false,"spikes":"#7a6038","brx":19,"bry":18.5,"lw":9.4,"hr":0.92},"parasaur":{"fur":"#9ccf5a","fur2":"#eaf6c4","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":18,"y":10,"rx":12.5,"ry":7.6,"out":true},"size":1.08,"belly":"#eaf6c4","eyeBump":false,"crestBack":"#ff8a5a"},"spino":{"fur":"#c9684f","fur2":"#f2d6c4","inner":"#6fbf5a","nose":null,"ear":"none","tail":"croc","snout":{"x":20,"y":9,"rx":18,"ry":7.6,"out":true,"croc":true},"size":1.18,"belly":"#f2d6c4","eyeBump":false,"sail":"#e08a5a","brx":18.5,"bry":19,"lw":9.4},"diplodocus":{"fur":"#b9a0d6","fur2":"#ece2f7","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thinlong","snout":{"x":16,"y":9,"rx":11,"ry":7.4,"out":true},"size":1.1,"belly":"#ece2f7","eyeBump":false,"neck":16,"neckW":10,"tailCol":"#b9a0d6","brx":18.5,"bry":19,"lw":9.2,"hr":0.82},"pachy":{"fur":"#e0a15a","fur2":"#f7e6c4","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":17,"y":10,"rx":11.5,"ry":7.6,"out":true},"size":1.02,"belly":"#f7e6c4","eyeBump":false,"dome":"#c9783a","tailK":0.8},"dilopho":{"fur":"#5fb38a","fur2":"#d6f2e2","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":18,"y":9,"rx":13,"ry":7,"out":true,"croc":true},"size":1,"belly":"#d6f2e2","eyeBump":false,"crest":"#ff5a4d","hood":"#ffb02e","armK":0.8,"tailK":0.8},"compy":{"fur":"#8fd16a","fur2":"#e6f7c4","inner":"#6fbf5a","nose":null,"ear":"none","tail":"thick","snout":{"x":17,"y":9,"rx":11,"ry":6.6,"out":true},"size":0.78,"belly":"#e6f7c4","eyeBump":false,"armK":0.8,"leg":9,"tailK":0.7},"plesio":{"fur":"#4f9fb8","fur2":"#d6eef5","inner":"#8fa3b8","nose":null,"ear":"none","tail":"flipper","snout":{"x":16,"y":9,"rx":11,"ry":7,"out":true},"size":1.08,"leg":6,"wing":true,"whisker":false,"belly":"#d6eef5","feet":"#3f8aa0","neck":17,"neckW":9,"hr":0.82},"mammoth":{"fur":"#9a6a45","fur2":"#b98a62","inner":"#c98a7a","nose":null,"ear":"fan","tail":"tuft","snout":null,"size":1.22,"brx":18,"bry":19,"lw":9.4,"trunk":true,"maneTop":"#7a4f2e"},"sabertooth":{"fur":"#e0b070","fur2":"#fff6ea","inner":"#ffd9b8","nose":"#ff7f9d","ear":"round-s","tail":"stub","ring":"#2b2018","ringThin":true,"snout":{"x":15,"y":9,"rx":11,"ry":8.2,"out":true},"size":1.08,"tstripes":null,"lowerWhite":true,"brow":"#fff6ea","tusk":10},"dimetrodon":{"fur":"#b98ad6","fur2":"#ecdcf7","inner":"#6fbf5a","nose":null,"ear":"none","tail":"croc","snout":{"x":18,"y":10,"rx":13,"ry":7.6,"out":true,"croc":true},"size":1.05,"belly":"#ecdcf7","eyeBump":false,"sail":"#ff9a6a"},"archaeo":{"fur":"#3fa7d6","fur2":"#ffffff","inner":"#ff5a4d","nose":null,"ear":"none","tail":"feathers","feathers":["#ff5a4d","#3fa7d6","#ffd23f"],"snout":null,"size":0.88,"leg":6,"wing":true,"wingCol":"#2f8fbf","beak":"#e8d2a0","beakType":"long","feet":"#8a8f9c","eyeRing":false,"crest":"#ff5a4d","beakLen":12},"capybara":{"fur":"#b98a5a","fur2":"#d6b088","inner":"#8a5f38","nose":"#3b2a20","ear":"round-s","tail":"none","snout":{"x":16,"y":9,"rx":13,"ry":10,"out":true},"size":1.02,"brx":17,"bry":18.5,"lw":8.6},"fennec":{"fur":"#f6dcae","fur2":"#fffaf0","inner":"#ffc2cf","nose":"#3b2a20","ear":"bat","earTip":null,"tail":"bushy","tailTip":"#5a3524","snout":{"x":17,"y":9,"rx":12,"ry":7.2,"out":true},"size":0.86,"sock":null,"cheek":true},"meerkat":{"fur":"#d9b27a","fur2":"#f6e6c4","inner":"#5a3f2a","nose":"#3b2a20","ear":"round-s","tail":"thinlong","snout":{"x":14,"y":9,"rx":11,"ry":8,"out":false},"size":0.88,"whisker":false,"belly":"#f6e6c4","tailK":0.66,"sclera":true,"mask":"#5a3f2a","tailCol":"#d9b27a"},"badger":{"dark":false,"sclera":true,"fur":"#f4f4f4","fur2":"#ffffff","inner":"#ff9eb5","nose":"#ff7f9d","ear":"round-s","tail":"stub","snout":{"x":15,"y":9,"rx":10.5,"ry":7.5,"out":true},"size":1,"stripe":false,"badger":1,"bodyCol":"#6b6f7a","limbCol":"#3b3442","earCol":"#3b3442"},"ferret":{"fur":"#f1e6d2","fur2":"#ffffff","inner":"#f2b6a0","nose":"#3b2a20","ear":"round-s","tail":"thick","snout":{"x":14,"y":9,"rx":11,"ry":8,"out":false},"size":0.88,"whisker":true,"belly":null,"tailK":0.6,"sclera":true,"mask":"#6b4632","limbCol":"#5a3f2a"},"chipmunk":{"fur":"#c98a4f","fur2":"#fff1dc","inner":"#f2b6a0","nose":"#5a3524","ear":"point-s","tail":"bushy","snout":{"x":14,"y":9,"rx":10.5,"ry":7.6,"out":false},"size":0.82,"teeth":true,"stripes":"#5a3524","tailTip":"#5a3524"},"leopard":{"fur":"#f2c14e","fur2":"#fff4d6","inner":"#f2a35e","nose":"#3b2a20","ear":"round-s","tail":"long","tailTip":"#4a3226","snout":{"x":15,"y":9,"rx":11,"ry":8,"out":true},"size":1.06,"spots":"#5a3524","leg":11},"panther":{"fur":"#2f3138","fur2":"#4a4d57","inner":"#6b5a6e","nose":"#6b5a6e","ear":"point","tail":"catup","snout":{"x":13,"y":9,"rx":10,"ry":7,"out":false},"size":1.06,"stripes":null,"whisker":true,"dark":true,"sclera":true},"hyena":{"fur":"#c9a66b","fur2":"#e8d6b0","inner":"#ffd9b8","nose":"#3b2a20","ear":"round","tail":"bushy","snout":{"x":16,"y":9,"rx":11.5,"ry":7.6,"out":true},"size":1.02,"cheek":true,"brow":null,"tongue":true,"spots":"#6b4f2e","maneTop":"#6b4f2e","tailTip":"#3b2a20"},"lynx":{"fur":"#d9b27a","fur2":"#fff6e6","inner":"#ffb3c4","nose":"#ff7f9d","ear":"point","tail":"stub","snout":{"x":13,"y":9,"rx":10,"ry":7,"out":false},"size":1.02,"stripes":"#8a6a3f","whisker":true,"cheek":true},"bison":{"fur":"#6b4a32","fur2":"#8a6a4f","inner":"#5a3f2a","nose":null,"ear":"side","tail":"tuft","snout":{"x":17,"y":10,"rx":12.5,"ry":8.4,"out":true,"nostril":true},"size":1.18,"cowspots":null,"horn":"cow","brx":17.5,"bry":18.5,"lw":8.4,"hump":true,"beard":"#4a3222","maneTop":"#4a3222"},"moose":{"fur":"#7a5a3f","fur2":"#b99a78","inner":"#f2b6a0","nose":"#3b2a20","ear":"leaf","tail":"puff","snout":{"x":18,"y":10,"rx":13.5,"ry":9.5,"out":true},"size":1.18,"horn":"antler","dots":null,"leg":11.5,"beard":"#5a3f2a","brx":17.5,"bry":18.5,"lw":8.6},"reindeer":{"fur":"#a8794f","fur2":"#f1e2c8","inner":"#f2b6a0","nose":"#ff4d5e","ear":"leaf","tail":"puff","snout":{"x":17,"y":9,"rx":11.5,"ry":7.6,"out":true},"size":1.04,"horn":"antler","dots":null,"leg":11.5},"llama":{"fur":"#f6efe2","fur2":"#fffaf2","inner":"#ffc2cf","nose":"#c98a7a","ear":"leaf","tail":"puff","snout":{"x":15,"y":10,"rx":9.5,"ry":7,"out":true},"size":1.04,"neck":12,"neckW":13,"wool":"#c98a5a","bodyCol":"#c98a5a","woolBody":true,"hr":0.88},"donkey":{"fur":"#9a9aa6","fur2":"#f1f1f1","inner":"#f2b6c8","nose":"#3b2a20","ear":"long","tail":"horse","tailCol":"#5f5f6a","snout":{"x":18,"y":9,"rx":13,"ry":9,"out":true},"size":1,"maneTop":"#5f5f6a","forelock":null,"leg":11.5,"neck":2,"blaze":false},"boar":{"fur":"#7a5a45","fur2":"#b98a7a","inner":"#b98a7a","nose":null,"ear":"pig","tail":"curl","snout":{"x":20,"y":8,"rx":8,"ry":8.6,"out":true,"disc":true},"size":1.04,"brx":17.5,"bry":18,"maneTop":"#4a3222","tusk":6},"anteater":{"fur":"#8a8f9c","fur2":"#c9ced6","inner":"#d9dde4","nose":"#2b2018","ear":"round-s","tail":"bushy","tailTip":"#5f6470","snout":{"x":24,"y":10,"rx":18,"ry":5,"out":true},"size":1.02,"cheek":false},"armadillo":{"fur":"#d9b89a","fur2":"#f2e0cf","inner":"#f2b6a0","nose":"#5a3524","ear":"leaf","tail":"thinlong","snout":{"x":17,"y":9,"rx":11,"ry":6.5,"out":true},"size":0.9,"leg":8,"hr":0.9,"shell":"#b98a6a","shell2":"#8a6248","tailCol":"#d9b89a"},"pangolin":{"fur":"#c9a27a","fur2":"#e8d2b0","inner":"#f2b6a0","nose":"#3b2a20","ear":"none","tail":"thick","snout":{"x":19,"y":9,"rx":13,"ry":6,"out":true},"size":0.92,"leg":7,"spikes":"#8a6a4a","tailK":0.7},"platypus":{"fur":"#8a5f45","fur2":"#e2c49a","inner":"#6b4632","nose":"#3b2a20","ear":"round-s","tail":"paddle","snout":null,"size":0.9,"teethBig":false,"brx":16.5,"beak":"#5a5f6a","beakType":"duck"},"wombat":{"fur":"#9a7a5f","fur2":"#b99a80","inner":"#7a5a45","nose":"#3b2a20","ear":"round-s","tail":"none","snout":{"x":13,"y":10,"rx":10,"ry":7,"out":false},"size":0.95,"brx":18,"bry":18.5,"lw":8.6,"bigNose":"#4a3a32","eyeWide":3},"quokka":{"fur":"#b98a62","fur2":"#e2c4a0","inner":"#8a5f45","nose":"#3b2a20","ear":"round","tail":"thick","snout":{"x":14,"y":9,"rx":10,"ry":7.6,"out":false},"size":0.86,"brx":17,"bry":18.5,"lw":8.6,"tailK":0.5},"lemur":{"sclera":true,"fur":"#b9bcc6","fur2":"#ffffff","inner":"#ffffff","nose":"#3b2a20","ear":"round-s","tail":"ring","ring":"#3b3442","snout":{"x":15,"y":9,"rx":10.5,"ry":7.5,"out":true},"size":0.92,"mask":"#3b3442","lowerWhite":true},"orangutan":{"fur":"#d9632e","fur2":"#b98a7a","inner":"#b98a7a","nose":null,"ear":"none","tail":"none","snout":null,"size":1.12,"apeFace":true,"hrx":1.14,"brx":17.5,"bry":18.5,"lw":8.6},"chimp":{"fur":"#4a3f3a","fur2":"#e2bfa0","inner":"#e2bfa0","nose":null,"ear":"sideRound","tail":"none","snout":null,"size":1.04,"apeFace":true}};
  var c = null;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function shade(hex, k) {            // k < 0 어둡게, k > 0 밝게
    if (!hex || hex.charAt(0) !== '#') return hex;
    if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(v) { return clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255); }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function ell(x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); }
  function paint(fill, lw) {
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (lw !== 0) { c.lineWidth = lw || LW; c.strokeStyle = OL; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  }
  function poly(p, open) { c.beginPath(); c.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); if (!open) c.closePath(); }
  function line(p, w, col) { poly(p, true); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w; c.strokeStyle = col || OL; c.stroke(); }
  // 굵기가 변하는 줄 (꼬리 · 목 · 촉수 · 뱀)
  function taper(p, w0, w1, col, lw) {
    var n = p.length / 2, L = [], R = [], i, dx, dy, d, w;
    for (i = 0; i < n; i++) {
      var a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      dx = p[b * 2] - p[a * 2]; dy = p[b * 2 + 1] - p[a * 2 + 1]; d = Math.sqrt(dx * dx + dy * dy) || 1;
      w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
      L.push(p[i * 2] - dy / d * w, p[i * 2 + 1] + dx / d * w); R.push(p[i * 2] + dy / d * w, p[i * 2 + 1] - dx / d * w);
    }
    c.beginPath(); c.moveTo(L[0], L[1]);
    for (i = 1; i < n; i++) c.lineTo(L[i * 2], L[i * 2 + 1]);
    for (i = n - 1; i >= 0; i--) c.lineTo(R[i * 2], R[i * 2 + 1]);
    c.closePath(); paint(col, lw);
  }
  // 굵은 줄에 테두리 (다리)
  function limb(p, w, col) { line(p, w + LW * 2, OL); line(p, w, col); }
  // 다리 : 엉덩이(hx, hy) 에서 길이 len, 앞뒤 각 th, 굽힘 bend → 발끝 좌표
  function leg(hx, hy, len, w, th, bend, col, foot) {
    var l = len * 0.52, a1 = th + bend * 0.45, a2 = th - bend * 0.9;
    var kx = hx + Math.sin(a1) * l, ky = hy + Math.cos(a1) * l, fx = kx + Math.sin(a2) * l, fy = ky + Math.cos(a2) * l;
    limb([hx, hy, kx, ky, fx, fy], w, col);
    if (foot) { ell(fx + w * 0.3, fy + w * 0.05, w * 0.72, w * 0.46); paint(foot, LW * 0.85); }
    return [fx, fy];
  }
  // 눈 : open · wide · closed · happy · x · sad
  function eye(x, y, r, mode, t, white) {
    c.lineCap = 'round';
    if (mode !== 'wide' && mode !== 'x' && mode !== 'closed' && mode !== 'happy' && (t % 3.9) < 0.11) mode = 'closed';
    if (mode === 'closed') { c.beginPath(); c.arc(x, y - r * 0.3, r, 0.15 * PI, 0.85 * PI); c.lineWidth = LW * 0.9; c.strokeStyle = OL; c.stroke(); return; }
    if (mode === 'happy') { c.beginPath(); c.arc(x, y + r * 0.5, r, 1.15 * PI, 1.85 * PI); c.lineWidth = LW * 0.9; c.strokeStyle = OL; c.stroke(); return; }
    if (mode === 'x') { line([x - r, y - r, x + r, y + r], LW * 0.9); line([x - r, y + r, x + r, y - r], LW * 0.9); return; }
    var rr = mode === 'wide' ? r * 1.3 : r;
    if (white || mode === 'wide') { ell(x, y, rr * 1.45, rr * 1.5); c.fillStyle = '#fff'; c.fill(); }
    ell(x, y, rr, rr * 1.1); c.fillStyle = '#2b2018'; c.fill();
    ell(x + rr * 0.32, y - rr * 0.38, rr * 0.36, rr * 0.36); c.fillStyle = '#fff'; c.fill();
    if (mode === 'sad') line([x - rr * 1.5, y - rr * 1.3, x + rr * 0.9, y - rr * 2.1], LW * 0.8);
  }
  function mouthAt(x, y, w, mode) {
    if (mode === 'open' || mode === 'o') { ell(x, y + w * 0.2, w * (mode === 'o' ? 0.4 : 0.6), w * 0.5); c.fillStyle = '#7a2d2d'; c.fill(); c.lineWidth = LW * 0.7; c.strokeStyle = OL; c.stroke(); }
    else if (mode === 'wavy') line([x - w, y, x - w * 0.4, y - w * 0.4, x + w * 0.1, y + w * 0.2, x + w * 0.7, y - w * 0.2], LW * 0.75);
    else if (mode === 'flat') line([x - w * 0.8, y, x + w * 0.6, y], LW * 0.75);
    else { c.beginPath(); c.arc(x - w * 0.2, y - w * 0.5, w * 0.9, 0.2 * PI, 0.75 * PI); c.lineWidth = LW * 0.75; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); }
  }
  // 번호표 (몸통에 붙인다)
  function bib(G, x, y, r) {
    if (G.num == null) return;
    ell(x, y, r, r); c.fillStyle = G.color || '#fff'; c.fill(); c.lineWidth = LW * 0.8; c.strokeStyle = OL; c.stroke();
    c.save(); c.translate(x, y); c.rotate(-G.rot);
    c.font = '700 ' + Math.round(r * (G.num > 9 ? 1.05 : 1.3)) + 'px "Jua", "Gowun Dodum", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = G.color ? '#fff' : OL; c.lineWidth = 2.2; c.strokeStyle = 'rgba(74,50,38,.75)'; c.strokeText(String(G.num), 0, r * 0.08); c.fillText(String(G.num), 0, r * 0.08);
    c.restore();
  }

  // ───────────── 꼬리 (몸 뒤쪽 끝 x, y 에서 왼쪽으로) ─────────────
  function drawTail(G, type, x, y, k) {
    var sp = G.sp, col = sp.tailCol || G.body, tip = sp.tailTip || sp.fur2, wag = Math.sin(G.t * 6 + G.ph) * 0.18 * (G.amp > 0 ? 1.4 : 1), q;
    k = (k || 1) * (sp.tailK || 1);
    c.save(); c.translate(x, y);
    switch (type) {
      case 'puff': ell(-4 * k, -2, 8 * k, 7.5 * k); paint(sp.tailCol || sp.fur2); break;
      case 'stub': case 'tiny': case 'wedge': ell(-3 * k, 0, 6 * k, 4.5 * k, -0.5); paint(col); break;
      case 'bushy': case 'ring':
        c.rotate(-0.5 + wag);
        ell(-20 * k, 0, 22 * k, 9.5 * k); paint(col);
        if (type === 'ring') { c.save(); ell(-20 * k, 0, 22 * k, 9.5 * k); c.clip(); c.fillStyle = sp.ring || shade(col, -0.45); for (q = 0; q < 4; q++) c.fillRect(-(8 + q * 10) * k, -12 * k, (sp.ringThin ? 3 : 4.5) * k, 24 * k); c.restore(); }
        else { c.save(); ell(-20 * k, 0, 22 * k, 9.5 * k); c.clip(); ell(-40 * k, 0, 12 * k, 12 * k); c.fillStyle = tip; c.fill(); c.restore(); }
        ell(-20 * k, 0, 22 * k, 9.5 * k); paint(null);
        break;
      case 'skunk': case 'squirrel':
        c.rotate(wag * 0.6);
        taper([0, 0, -10 * k, -10 * k, -12 * k, -26 * k, -4 * k, -40 * k, 8 * k, -46 * k], 12 * k, 20 * k, col);
        if (type === 'skunk') line([-2 * k, -4 * k, -9 * k, -14 * k, -9 * k, -28 * k, -2 * k, -39 * k, 6 * k, -43 * k], 5 * k, '#fff');
        break;
      case 'long': case 'thinlong': case 'monkey': case 'curlup': case 'catup':
        q = type === 'thinlong' ? 2.6 : 4.6;
        c.rotate(wag);
        if (type === 'catup') taper([0, 0, -12 * k, 2 * k, -22 * k, -4 * k, -26 * k, -16 * k, -22 * k, -26 * k], q * 1.25, q * 0.9, col);
        else if (type === 'monkey' || type === 'curlup') taper([0, 0, -12 * k, 4 * k, -24 * k, 0, -30 * k, -12 * k, -24 * k, -20 * k, -16 * k, -16 * k, -18 * k, -9 * k], q, q * 0.7, col);
        else taper([0, 0, -12 * k, 5 * k, -26 * k, 6 * k, -38 * k, 0, -44 * k, -8 * k], q * 1.2, q * 0.6, col);
        break;
      case 'tuft': case 'lion':
        c.rotate(wag);
        taper([0, 0, -10 * k, 6 * k, -20 * k, 14 * k, -26 * k, 22 * k], 4, 3, col);
        ell(-28 * k, 25 * k, 5.5 * k, 7 * k, 0.5); paint(sp.tailTip || sp.mane || shade(col, -0.4));
        break;
      case 'horse':
        c.rotate(wag * 0.8);
        taper([0, 0, -10 * k, 2 * k, -20 * k, 10 * k, -26 * k, 22 * k, -28 * k, 34 * k], 8 * k, 4 * k, sp.tailCol || sp.mane || shade(col, -0.45));
        break;
      case 'curl':
        c.beginPath(); c.arc(-6 * k, -3 * k, 5 * k, 0.3 * PI, 2.2 * PI); c.lineCap = 'round';
        c.lineWidth = 3.6 + LW * 1.6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.6; c.strokeStyle = col; c.stroke();
        break;
      case 'thick': case 'croc':
        c.rotate(wag * 0.5);
        taper([0, 0, -18 * k, 3 * k, -36 * k, 7 * k, -54 * k, 9 * k, -66 * k, 8 * k], (G.tailW || 16) * k, 2.5, col);
        break;
      case 'paddle': c.rotate(0.25 + wag * 0.4); ell(-17 * k, 2 * k, 18 * k, 8 * k); paint(sp.tailCol || shade(col, -0.35)); break;
      case 'club':
        c.rotate(wag * 0.5);
        taper([0, 0, -18 * k, 2 * k, -36 * k, 4 * k, -50 * k, 4 * k], 14 * k, 6 * k, col);
        ell(-54 * k, 4 * k, 9 * k, 8 * k); paint(shade(col, -0.25));
        break;
      case 'duck': case 'feathers': poly([0, -5 * k, -14 * k, -9 * k, -12 * k, 0, -14 * k, 6 * k, 0, 4 * k]); paint(col); break;
      default: break;
    }
    c.restore();
  }

  // ───────────── 귀 (머리 위 x, y 가 뿌리) ─────────────
  function drawEar(G, type, x, y, r, far) {
    var sp = G.sp, col = sp.earCol || (far ? shade(G.head, -0.12) : G.head), inn = sp.inner || shade(G.head, -0.2);
    c.save(); c.translate(x, y);
    switch (type) {
      case 'long': c.rotate(-0.35 - (far ? 0.2 : 0) + Math.sin(G.t * 5 + G.ph) * 0.06 * G.amp);
        ell(0, -r * 1.25, r * 0.36, r * 1.3); paint(col); ell(0, -r * 1.2, r * 0.17, r * 0.95); c.fillStyle = inn; c.fill(); break;
      case 'tall': c.rotate(-0.3 - (far ? 0.25 : 0)); poly([-r * 0.3, 0, -r * 0.05, -r * 1.25, r * 0.32, 0]); paint(col); break;
      case 'point': case 'tuft': c.rotate(-0.25 - (far ? 0.3 : 0));
        poly([-r * 0.42, r * 0.1, -r * 0.05, -r * 0.92, r * 0.42, r * 0.1]); paint(col);
        poly([-r * 0.2, r * 0.05, -r * 0.03, -r * 0.5, r * 0.2, r * 0.05]); c.fillStyle = inn; c.fill();
        if (type === 'tuft') line([-r * 0.05, -r * 0.9, -r * 0.2, -r * 1.35], LW);
        break;
      case 'point-s': c.rotate(-0.25 - (far ? 0.3 : 0)); poly([-r * 0.3, r * 0.1, -r * 0.03, -r * 0.6, r * 0.3, r * 0.1]); paint(col); break;
      case 'pig': c.rotate(0.5 - (far ? 0.3 : 0)); poly([-r * 0.35, 0, r * 0.25, -r * 0.75, r * 0.4, r * 0.05]); paint(col); break;
      case 'round': case 'sideRound': ell(0, -r * 0.12, r * 0.42, r * 0.42); paint(col); ell(0, -r * 0.1, r * 0.2, r * 0.2); c.fillStyle = inn; c.fill(); break;
      case 'round-s': ell(0, -r * 0.05, r * 0.28, r * 0.28); paint(col); break;
      case 'big': ell(-r * 0.1, -r * 0.35, r * 0.62, r * 0.68); paint(col); ell(-r * 0.1, -r * 0.32, r * 0.38, r * 0.44); c.fillStyle = inn; c.fill(); break;
      case 'koala': ell(-r * 0.1, -r * 0.1, r * 0.6, r * 0.56); paint(col); ell(-r * 0.1, -r * 0.08, r * 0.32, r * 0.3); c.fillStyle = inn; c.fill(); break;
      case 'fan': c.rotate(Math.sin(G.t * 4 + G.ph) * 0.1); ell(-r * 0.55, r * 0.35, r * 0.8, r * 1.0, -0.15); paint(col); ell(-r * 0.5, r * 0.4, r * 0.5, r * 0.7, -0.15); c.fillStyle = inn; c.fill(); break;
      case 'leaf': case 'side': c.rotate(-0.9 - (far ? 0.25 : 0)); ell(0, -r * 0.5, r * 0.26, r * 0.6); paint(col); break;
      case 'bat': c.rotate(-0.2 - (far ? 0.3 : 0)); poly([-r * 0.45, r * 0.1, -r * 0.1, -r * 1.3, r * 0.45, r * 0.1]); paint(col); poly([-r * 0.22, r * 0.05, -r * 0.08, -r * 0.8, r * 0.22, r * 0.05]); c.fillStyle = inn; c.fill(); break;
      default: break;
    }
    c.restore();
  }

  // 몸통 무늬 (몸 타원 안에만)
  function bodyPattern(G, cx, cy, rx, ry) {
    var sp = G.sp, q, n;
    c.save(); ell(cx, cy, rx, ry); c.clip();
    if (G.belly) { ell(cx + rx * 0.05, cy + ry * 1.0, rx * 0.9, ry * 0.72); c.fillStyle = G.belly; c.fill(); }
    if (sp.stripes || sp.tstripes || sp.zstripes || sp.bodyStripes) {
      c.fillStyle = typeof sp.stripes === 'string' ? sp.stripes : (typeof sp.bodyStripes === 'string' ? sp.bodyStripes : shade(G.body, sp.zstripes ? -0.8 : -0.55));
      n = Math.max(4, Math.round(rx / 6));
      for (q = 0; q < n; q++) { poly([cx - rx + (q + 0.35) * 2 * rx / n, cy - ry - 2, cx - rx + (q + 0.75) * 2 * rx / n, cy - ry - 2, cx - rx + (q + 0.45) * 2 * rx / n, cy + ry * (sp.zstripes ? 1.2 : 0.25)]); c.fill(); }
    }
    if (sp.spots || sp.dots) {
      c.fillStyle = typeof sp.spots === 'string' ? sp.spots : (typeof sp.dots === 'string' ? sp.dots : shade(G.body, -0.4));
      for (q = 0; q < 11; q++) { ell(cx - rx * 0.8 + ((q * 37) % 100) / 100 * rx * 1.6, cy - ry * 0.75 + ((q * 53) % 100) / 100 * ry * 1.1, sp.dots ? 1.8 : 3.2, sp.dots ? 1.8 : 2.8); c.fill(); }
    }
    if (sp.cowspots || sp.patches) {
      c.fillStyle = typeof sp.cowspots === 'string' ? sp.cowspots : (typeof sp.patches === 'string' ? sp.patches : '#3d2f2a');
      ell(cx - rx * 0.45, cy - ry * 0.35, rx * 0.3, ry * 0.5, 0.3); c.fill(); ell(cx + rx * 0.3, cy - ry * 0.1, rx * 0.26, ry * 0.42, -0.4); c.fill(); ell(cx - rx * 0.05, cy + ry * 0.6, rx * 0.2, ry * 0.3); c.fill();
    }
    if (sp.bands) { c.strokeStyle = shade(G.body, -0.3); c.lineWidth = 1.8; for (q = 1; q < 6; q++) { c.beginPath(); c.moveTo(cx - rx + q * rx / 3, cy - ry); c.lineTo(cx - rx + q * rx / 3 - 2, cy + ry); c.stroke(); } }
    if (sp.orca) { ell(cx + rx * 0.2, cy + ry * 1.0, rx * 0.95, ry * 0.75); c.fillStyle = '#fff'; c.fill(); ell(cx - rx * 0.55, cy + ry * 0.2, rx * 0.22, ry * 0.3, -0.5); c.fill(); }
    if (sp.badger) { c.fillStyle = '#fff'; c.fillRect(cx - rx, cy - ry * 0.25, rx * 2, ry * 0.3); }
    if (sp.woolBody || sp.wool) { c.strokeStyle = shade(G.body, -0.14); c.lineWidth = 1.6; for (q = 0; q < 9; q++) { c.beginPath(); c.arc(cx - rx * 0.75 + ((q * 41) % 100) / 100 * rx * 1.5, cy - ry * 0.5 + ((q * 67) % 100) / 100 * ry, 4, 0.1 * PI, 0.9 * PI); c.stroke(); } }
    c.restore();
  }

  // ───────────── 머리 장식 (뿔 · 갈기 · 코 · 엄니 등), 머리 중심 (0, 0) · 반지름 r ─────────────
  function headExtras(G, r, sn, behind) {
    var sp = G.sp, q;
    if (behind) {
      if (sp.mane && !G.P.neckMane) { ell(-r * 0.25, r * 0.1, r * 1.5, r * 1.55); paint(sp.mane); }
      if (sp.horn === 'tri') { c.save(); c.rotate(-0.25); ell(-r * 0.75, -r * 0.15, r * 0.8, r * 1.45); paint(shade(G.head, -0.1)); ell(-r * 0.75, -r * 0.15, r * 0.48, r * 1.05); c.fillStyle = sp.inner || shade(G.head, 0.25); c.fill(); c.restore(); }
      return;
    }
    if (sp.horn === 'cow') { c.beginPath(); c.moveTo(-r * 0.1, -r * 0.8); c.quadraticCurveTo(r * 0.1, -r * 1.5, r * 0.55, -r * 1.45); c.quadraticCurveTo(r * 0.3, -r * 1.15, r * 0.3, -r * 0.82); c.closePath(); paint('#f3e9d4'); }
    if (sp.horn === 'goat') { c.beginPath(); c.moveTo(-r * 0.05, -r * 0.8); c.quadraticCurveTo(-r * 0.1, -r * 1.7, -r * 1.0, -r * 1.55); c.quadraticCurveTo(-r * 0.45, -r * 1.3, -r * 0.4, -r * 0.75); c.closePath(); paint('#e8dcc0'); }
    if (sp.horn === 'antler') {
      c.lineCap = 'round';
      [[LW * 2 + 3.4, OL], [3.4, '#b98450']].forEach(function (w) {
        c.beginPath(); c.moveTo(0, -r * 0.8); c.quadraticCurveTo(-r * 0.5, -r * 1.6, -r * 0.2, -r * 2.3);
        c.moveTo(-r * 0.3, -r * 1.35); c.lineTo(-r * 0.95, -r * 1.75); c.moveTo(-r * 0.32, -r * 1.8); c.lineTo(r * 0.35, -r * 2.15); c.moveTo(-r * 0.15, -r * 1.1); c.lineTo(r * 0.5, -r * 1.45);
        c.lineWidth = w[0]; c.strokeStyle = w[1]; c.stroke();
      });
    }
    if (sp.horn === 'rhino' || sp.hornNose) { poly([r * 0.55 + sn * 0.6, -r * 0.1, r * 0.75 + sn, -r * 1.2, r * 0.95 + sn * 0.9, -r * 0.02]); paint('#e8dcc0'); poly([r * 0.2 + sn * 0.3, -r * 0.45, r * 0.35 + sn * 0.4, -r * 0.95, r * 0.55 + sn * 0.4, -r * 0.4]); paint('#e8dcc0'); }
    if (sp.horn === 'tri') { poly([r * 0.05, -r * 0.6, r * 0.75, -r * 1.75, r * 0.45, -r * 0.5]); paint('#f3e9d4'); poly([r * 0.6 + sn * 0.5, -r * 0.2, r * 0.85 + sn * 0.7, -r * 0.95, r * 0.95 + sn * 0.7, -r * 0.1]); paint('#f3e9d4'); }
    if (sp.ossi) { for (q = 0; q < 2; q++) { line([-r * 0.1 + q * r * 0.4, -r * 0.8, -r * 0.2 + q * r * 0.4, -r * 1.45], 3.4 + LW * 2); line([-r * 0.1 + q * r * 0.4, -r * 0.8, -r * 0.2 + q * r * 0.4, -r * 1.45], 3.4, G.head); ell(-r * 0.2 + q * r * 0.4, -r * 1.5, 3, 3); paint(shade(G.head, -0.5)); } }
    if (sp.forelock || sp.tuftHair || sp.tuft) { ell(r * 0.1, -r * 0.85, r * 0.38, r * 0.3, 0.3); paint(typeof sp.forelock === 'string' ? sp.forelock : (sp.mane || shade(G.head, -0.35))); }
    if (sp.beard) { poly([r * 0.3, r * 0.7, r * 0.45, r * 1.5, r * 0.75, r * 0.72]); paint(typeof sp.beard === 'string' ? sp.beard : '#fff'); }
    if (sp.crest && typeof sp.crest === 'string' && G.plan === 'quad') { poly([-r * 0.5, -r * 0.7, -r * 0.2, -r * 1.4, 0, -r * 0.85, r * 0.25, -r * 1.3, r * 0.4, -r * 0.75]); paint(sp.crest); }
    if (sp.gills) { c.lineCap = 'round'; for (q = 0; q < 3; q++) { line([-r * 0.6, -r * 0.3 + q * r * 0.35, -r * 1.5, -r * 0.8 + q * r * 0.6], 3.2 + LW * 1.6); line([-r * 0.6, -r * 0.3 + q * r * 0.35, -r * 1.5, -r * 0.8 + q * r * 0.6], 3.2, typeof sp.gills === 'string' ? sp.gills : '#ff8fb0'); } }
  }

  // ───────────── 머리 (옆모습). 머리 중심으로 옮긴 좌표에서 그린다 ─────────────
  function drawHead(G, r, sn, opt) {
    var sp = G.sp, o = opt || {}, muz = (sp.snout && !sp.snout.croc && !o.plain) ? sp.fur2 : G.head, sh = r * (G.P.snh || 0.54), q;
    headExtras(G, r, sn, true);
    if (sp.ear && sp.ear !== 'none' && sp.ear !== 'fan') drawEar(G, sp.ear, -r * 0.05, -r * 0.72, r * (G.P.earK || 1), true);
    if (sp.trunk) {        // 코끼리 코
      var sw = Math.sin(G.t * 3 + G.ph) * r * 0.25;
      taper([r * 0.6, r * 0.05, r * 1.3, r * 0.5, r * 1.45 + sw * 0.4, r * 1.4, r * 1.25 + sw, r * 2.2, r * 1.6 + sw, r * 2.5], r * 0.75, r * 0.34, G.head);
    }
    if (sn > 0 && !sp.trunk && !sp.beak) {     // 주둥이
      if (G.P.flat) { ell(r * 0.42, r * 0.2, r * 0.56, r * 0.6); paint(sp.fur2); }
      else { ell(r * 0.5 + sn * 0.5, r * 0.24, r * 0.34 + sn * 0.55, sh, sn > r ? 0.04 : 0.12); paint(muz); }
    }
    ell(0, 0, r, r * 0.92); paint(G.head);
    if (sn > 0 && !sp.trunk && !sp.beak && !G.P.flat) { ell(r * 0.5 + sn * 0.5, r * 0.24, r * 0.34 + sn * 0.55 - LW * 0.5, sh - LW * 0.5, sn > r ? 0.04 : 0.12); c.fillStyle = muz; c.fill(); }
    if (G.P.flat) { ell(r * 0.42, r * 0.2, r * 0.56 - LW * 0.5, r * 0.6 - LW * 0.5); c.fillStyle = sp.fur2; c.fill(); }
    if (sp.beak && G.plan === 'quad') { ell(r * 0.85 + sn * 0.5, r * 0.3, sn * 0.75 + r * 0.2, r * 0.3); paint(sp.beak); }      // 오리너구리 부리
    if (sp.patch) { ell(r * 0.32, -r * 0.12, r * 0.34, r * 0.4, -0.4); c.fillStyle = typeof sp.patch === 'string' ? sp.patch : '#2b2018'; c.fill(); }
    if (sp.mask) { c.save(); ell(0, 0, r, r * 0.92); c.clip(); c.fillStyle = typeof sp.mask === 'string' ? sp.mask : '#3a2f2c'; c.fillRect(-r * 0.3, -r * 0.4, r * 1.4, r * 0.52); c.restore(); }
    if (sp.blaze || sp.stripe || sp.badger) { c.save(); ell(0, 0, r, r * 0.92); c.clip(); c.fillStyle = '#fff'; c.fillRect(r * 0.1, -r, r * 0.34, r * 2); c.restore(); }
    if (sp.tstripes || sp.zstripes || (sp.stripes && !G.P.flat)) { c.strokeStyle = shade(G.head, sp.zstripes ? -0.8 : -0.55); c.lineWidth = 2.2; c.lineCap = 'round'; for (q = 0; q < 3; q++) { c.beginPath(); c.moveTo(-r * 0.7 + q * r * 0.38, -r * 0.75); c.lineTo(-r * 0.55 + q * r * 0.38, -r * 0.3); c.stroke(); } }
    // 코 · 입
    var nx = G.P.flat ? r * 0.82 : r * 0.72 + sn, ny = G.P.flat ? r * 0.12 : r * 0.1;
    if (sp.snout && sp.snout.disc) { ell(nx - 1, r * 0.22, r * 0.2, sh * 0.72); paint(sp.nose || sp.inner || '#ff9db0'); ell(nx - 1, r * 0.08, 1.4, 1.8); c.fillStyle = OL; c.fill(); ell(nx - 1, r * 0.36, 1.4, 1.8); c.fill(); }
    else if (sp.nose && !sp.trunk && !sp.beak) { ell(nx - r * 0.1, ny, r * (sp.bigNose ? 0.3 : 0.19), r * (sp.bigNose ? 0.26 : 0.16)); c.fillStyle = sp.nose; c.fill(); c.lineWidth = LW * 0.6; c.strokeStyle = OL; c.stroke(); }
    else if (!sp.trunk && !sp.beak && sn > 0) { ell(nx - r * 0.12, ny - r * 0.05, 1.5, 1.5); c.fillStyle = OL; c.fill(); }
    if (!sp.trunk) mouthAt(G.P.flat ? r * 0.55 : r * 0.42 + sn * 0.55, r * 0.24 + sh * 0.55, r * 0.3, G.mouth);
    if (sp.snout && sp.snout.croc && sn > r * 0.8) { c.fillStyle = '#fff'; for (q = 0; q < 4; q++) { poly([r * 0.5 + q * sn * 0.22, r * 0.5, r * 0.56 + q * sn * 0.22, r * 0.72, r * 0.62 + q * sn * 0.22, r * 0.5]); c.fill(); } }
    if (sp.teeth || sp.teethBig) { c.fillStyle = '#fff'; c.fillRect(nx - r * 0.42, r * 0.24 + sh * 0.5, r * 0.26, r * (sp.teethBig ? 0.42 : 0.26)); c.lineWidth = LW * 0.6; c.strokeStyle = OL; c.strokeRect(nx - r * 0.42, r * 0.24 + sh * 0.5, r * 0.26, r * (sp.teethBig ? 0.42 : 0.26)); }
    if (sp.fang) { poly([nx - r * 0.5, r * 0.5, nx - r * 0.4, r * 1.35, nx - r * 0.22, r * 0.5]); paint('#fff', LW * 0.7); }
    if (sp.tusk) { c.beginPath(); c.moveTo(r * 0.5, r * 0.55); c.quadraticCurveTo(r * 1.3, r * 1.25, r * 1.75, r * 0.5); c.quadraticCurveTo(r * 1.2, r * 0.85, r * 0.8, r * 0.45); c.closePath(); paint('#fff8ea', LW * 0.8); }
    if (sp.whisker) { c.strokeStyle = 'rgba(74,50,38,.6)'; c.lineWidth = 1.1; for (q = 0; q < 2; q++) { c.beginPath(); c.moveTo(nx - r * 0.3, r * 0.3 + q * 2.5); c.lineTo(nx + r * 0.5, r * 0.2 + q * 6); c.stroke(); } }
    if (sp.tongue && G.boost) { ell(r * 0.5 + sn * 0.4, r * 0.85, r * 0.16, r * 0.3, -0.3); paint('#ff7f9d', LW * 0.7); }
    if (sp.cheek) { ell(r * 0.05, r * 0.42, r * 0.22, r * 0.15); c.fillStyle = 'rgba(255,120,140,.5)'; c.fill(); }
    eye(r * (o.ex != null ? o.ex : 0.3), -r * (o.ey != null ? o.ey : 0.18), r * (G.P.eyeK || 0.2), G.eyes, G.t, sp.dark || sp.sclera || sp.patch || sp.mask);
    if (sp.ear && sp.ear !== 'none') { if (sp.ear === 'fan') drawEar(G, 'fan', -r * 0.5, -r * 0.5, r * 0.8 * (G.P.earK || 1), false); else drawEar(G, sp.ear, -r * 0.4, -r * 0.6, r * (G.P.earK || 1), false); }
    headExtras(G, r, sn, false);
  }

  // ───────────── 네 발 동물 ─────────────
  function planQuad(G) {
    var sp = G.sp, P = G.P, L = P.L, H = P.H, lw = P.lw || 8, tk = 1 - G.tuck * 0.72, fl = P.leg * (P.front || 1) * tk, hl = P.leg * (P.hind || 1) * tk;
    var ph = G.ph, A = 0.6 * G.amp * (G.boost ? 1.25 : 1), bound = P.gait === 'bound' || G.hop, sprawl = P.gait === 'sprawl';
    var bob = G.amp ? -Math.abs(Math.sin(ph)) * (bound ? 6 : 2) : 0;
    var hipH = [-L * 0.3, -hl + bob], hipF = [L * 0.3, -fl + bob], rot = Math.atan2(hipF[1] - hipH[1], L * 0.6) + (G.amp && bound ? Math.sin(ph + 0.6) * 0.1 : 0);
    var cx = 0, cy = (hipH[1] + hipF[1]) / 2 - H * 0.26, legCol = sp.limbCol || G.body, far = shade(legCol, -0.16), foot = P.flip ? null : (sp.feet || shade(legCol, -0.3)), q;
    var offs = bound ? [0, 0.45, PI, PI + 0.45] : (G.boost ? [0, 0.7, PI + 0.3, PI + 1.0] : [0, PI, PI, 0]);     // 먼 뒤 · 가까운 뒤 · 먼 앞 · 가까운 앞
    function th(k) { return G.stretch ? (k < 2 ? -0.95 : 0.95) : A * Math.sin(ph + offs[k]) * (sprawl ? 1.25 : 1) + (sprawl ? (k < 2 ? -0.25 : 0.25) : 0); }
    function bd(k) { return G.stretch ? 0.1 : (G.amp ? Math.max(0, Math.cos(ph + offs[k])) * 0.95 : G.tuck * 1.7); }
    function oneLeg(k) {
      var hp = k < 2 ? hipH : hipF, len = k < 2 ? hl : fl, dx = (k % 2 ? 0 : 4);
      if (P.flip) { c.save(); c.translate(hp[0] + dx, hp[1] + 2); c.rotate(-th(k) * 1.4 + 0.5 + (k < 2 ? 0.7 : 0)); ell(0, len * 0.9, lw * 0.6, len * 1.1); paint(k % 2 ? legCol : far); c.restore(); }
      else leg(hp[0] + dx, hp[1], len, lw * (k < 2 && P.hind ? 1.2 : 1), th(k), bd(k), k % 2 ? legCol : far, foot);
    }
    oneLeg(0); oneLeg(2);
    c.save(); c.translate(cx, cy); c.rotate(rot);
    if (sp.tail && sp.tail !== 'none') { G.tailW = H * 0.55; drawTail(G, sp.tail, -L * 0.47, -H * (sp.tail === 'thick' || sp.tail === 'croc' || sp.tail === 'club' ? 0.02 : 0.2), P.tailK || 1); }
    if (P.plates) { for (q = 0; q < 7; q++) { var px = -L * 0.42 + q * L * 0.14, pr = 9 + 5 * Math.sin((q + 0.5) / 7 * PI); poly([px - pr * 0.6, -H * 0.42, px - pr * 0.2, -H * 0.42 - pr * 1.5, px + pr * 0.5, -H * 0.42 - pr * 0.9, px + pr * 0.7, -H * 0.42]); paint(sp.inner || '#e8a14a'); } }
    if (sp.sail) { c.beginPath(); c.moveTo(-L * 0.4, -H * 0.3); c.quadraticCurveTo(-L * 0.05, -H * 0.4 - 52, L * 0.36, -H * 0.3); c.closePath(); paint(typeof sp.sail === 'string' ? sp.sail : (sp.inner || '#e8734a')); c.strokeStyle = 'rgba(74,50,38,.45)'; c.lineWidth = 1.4; for (q = 0; q < 6; q++) { c.beginPath(); c.moveTo(-L * 0.32 + q * L * 0.12, -H * 0.36); c.lineTo(-L * 0.3 + q * L * 0.115, -H * 0.4 - 18 - 20 * Math.sin((q + 0.5) / 6 * PI)); c.stroke(); } }
    if (sp.crestBack || (sp.crest && G.P.gait === 'sprawl')) { for (q = 0; q < 8; q++) { poly([-L * 0.4 + q * L * 0.1, -H * 0.44, -L * 0.37 + q * L * 0.1, -H * 0.44 - 7, -L * 0.32 + q * L * 0.1, -H * 0.44]); paint(typeof sp.crestBack === 'string' ? sp.crestBack : (typeof sp.crest === 'string' ? sp.crest : shade(G.body, -0.3)), LW * 0.7); } }
    if (sp.spikes) { c.fillStyle = typeof sp.spikes === 'string' ? sp.spikes : shade(G.body, -0.45); for (q = 0; q < 11; q++) { var an = PI * (0.98 + q * 0.105), sr = sp.spikeBig ? 1.75 : 1.45; poly([Math.cos(an - 0.09) * L * 0.5, Math.sin(an - 0.09) * H * 0.5, Math.cos(an) * L * 0.5 * sr * 0.86, Math.sin(an) * H * 0.5 * sr, Math.cos(an + 0.09) * L * 0.5, Math.sin(an + 0.09) * H * 0.5]); paint(c.fillStyle, LW * 0.7); } }
    if (sp.hump) { for (q = 0; q < (sp.hump > 1 ? 2 : 1); q++) { ell(sp.hump > 1 ? -L * 0.18 + q * L * 0.3 : (P.humpX || 0) * L, -H * 0.42, L * (sp.hump > 1 ? 0.15 : 0.22), H * 0.36); paint(G.body); } }
    ell(0, 0, L / 2, H / 2); paint(G.body);
    bodyPattern(G, 0, 0, L / 2 - LW * 0.4, H / 2 - LW * 0.4);
    if (sp.hump) { for (q = 0; q < (sp.hump > 1 ? 2 : 1); q++) { ell(sp.hump > 1 ? -L * 0.18 + q * L * 0.3 : (P.humpX || 0) * L, -H * 0.3, L * (sp.hump > 1 ? 0.13 : 0.2), H * 0.3); c.fillStyle = G.body; c.fill(); } }
    if (sp.shell) {      // 등딱지
      c.beginPath(); c.ellipse(-L * 0.02, -H * 0.12, L * 0.5, H * 0.72, 0, PI, TAU); c.closePath(); paint(sp.shell);
      c.strokeStyle = sp.shell2 || shade(sp.shell, -0.3); c.lineWidth = 2;
      for (q = 0; q < 4; q++) { c.beginPath(); c.moveTo(-L * 0.36 + q * L * 0.22, -H * 0.14); c.lineTo(-L * 0.3 + q * L * 0.2, -H * 0.7); c.stroke(); }
      c.beginPath(); c.ellipse(-L * 0.02, -H * 0.12, L * 0.36, H * 0.46, 0, PI, TAU); c.stroke();
    }
    if (P.armor) { c.beginPath(); c.ellipse(0, -H * 0.05, L * 0.5, H * 0.6, 0, PI, TAU); c.closePath(); paint(shade(G.body, -0.18)); for (q = 0; q < 9; q++) { ell(-L * 0.4 + q * L * 0.1, -H * 0.3 - (q % 2) * 6, 3.4, 3.4); paint(shade(G.body, 0.25), LW * 0.6); } }
    bib(G, L * 0.02, H * 0.02, Math.min(11, H * 0.3));
    c.restore();
    oneLeg(1); oneLeg(3);
    // 목 · 머리
    var na = (P.na || 0) * PI / 180 - G.headDip * 1.1 + (G.amp ? Math.sin(ph * 2) * 0.03 : 0), nk = P.neck || 0, r = P.hr, sn = P.sn == null ? 8 : P.sn;
    var nb = [cx + Math.cos(rot) * L * 0.36 + Math.sin(rot) * H * 0.18, cy + Math.sin(rot) * L * 0.36 - Math.cos(rot) * H * 0.18];
    var hd = [nb[0] + Math.cos(na) * (nk + r * 0.55), nb[1] - Math.sin(na) * (nk + r * 0.55)];
    if (nk > 3) {
      var nw0 = Math.min(H * 0.62, r * 1.7), nw1 = r * 1.15;
      if (P.sneck) taper([nb[0] - 4, nb[1] + 2, nb[0] + nk * 0.5, nb[1] - nk * 0.2, nb[0] + nk * 0.2, hd[1] + nk * 0.3, hd[0], hd[1]], nw0, nw1, G.body);
      else taper([nb[0] - Math.cos(na) * 6, nb[1] + Math.sin(na) * 6, (nb[0] + hd[0]) / 2, (nb[1] + hd[1]) / 2, hd[0], hd[1]], nw0, nw1, G.body);
      if (sp.spots && nk > 30) { c.fillStyle = typeof sp.spots === 'string' ? sp.spots : shade(G.body, -0.4); for (q = 1; q < 6; q++) { ell(nb[0] + (hd[0] - nb[0]) * q / 6 + (q % 2 ? 2 : -2), nb[1] + (hd[1] - nb[1]) * q / 6, 3, 3.2); c.fill(); } }
      if (sp.mane && P.neckMane) { c.save(); c.translate(nb[0], nb[1]); c.rotate(-na); ell(nk * 0.5, -nw0 * 0.42, nk * 0.62, 4.5); paint(sp.mane); c.restore(); }
    }
    c.save(); c.translate(hd[0], hd[1]); c.rotate(-(P.ha == null ? Math.min(na * 0.35, 0.3) : P.ha * PI / 180) + G.headDip * 0.5);
    drawHead(G, r, sn);
    c.restore();
    return { hx: hd[0], hy: hd[1], hr: r, top: Math.min(hd[1] - r * (sp.ear === 'long' ? 3.3 : (sp.horn === 'antler' ? 2.6 : 1.5)), cy - H * 0.5 - (sp.sail ? 56 : 12)), len: L * 0.5 + nk + r * 2 + sn };
  }

  // ───────────── 두 발 공룡 · 캥거루 ─────────────
  function planBiped(G) {
    var sp = G.sp, P = G.P, L = P.L || 54, H = P.H || 30, lg = (P.leg || 34) * (1 - G.tuck * 0.7), lw = P.lw || 10, roo = !!P.roo, ph = G.ph;
    var A = 0.62 * G.amp * (G.boost ? 1.2 : 1), hopK = roo || G.hop, bob = G.amp ? -Math.abs(Math.sin(ph)) * (hopK ? 9 : 2.5) : 0;
    var tilt = -((P.up == null ? 12 : P.up) * PI / 180) + (G.amp && hopK ? Math.sin(ph) * 0.08 : 0), cy = -lg - H * 0.3 + bob, q;
    var legCol = sp.limbCol || G.body, far = shade(legCol, -0.16), foot = sp.feet || shade(legCol, -0.3);
    function th(k) { return G.stretch ? (k ? 0.8 : -0.8) : A * Math.sin(ph + (hopK ? k * 0.3 : k * PI)); }
    function bd(k) { return G.stretch ? 0.2 : (G.amp ? 0.35 + Math.max(0, Math.cos(ph + (hopK ? k * 0.3 : k * PI))) * 0.8 : 0.35 + G.tuck * 1.4); }
    leg(4, cy + H * 0.25, lg, lw, th(0), bd(0), far, foot);
    c.save(); c.translate(0, cy); c.rotate(tilt);
    var wag = Math.sin(G.t * 5 + ph) * 5, tl = P.tailL || 58;
    taper([-L * 0.3, 0, -L * 0.3 - tl * 0.35, 3 + wag * 0.3, -L * 0.3 - tl * 0.7, 2 + wag * 0.7, -L * 0.3 - tl, -3 + wag], H * 0.78, 2.5, G.body);
    if (sp.sail) { c.beginPath(); c.moveTo(-L * 0.42, -H * 0.3); c.quadraticCurveTo(-L * 0.02, -H * 0.4 - 50, L * 0.36, -H * 0.3); c.closePath(); paint(typeof sp.sail === 'string' ? sp.sail : (sp.inner || '#e8734a')); }
    ell(0, 0, L / 2, H / 2); paint(G.body);
    bodyPattern(G, 0, 0, L / 2 - 1, H / 2 - 1);
    if (roo) { ell(L * 0.12, H * 0.2, L * 0.2, H * 0.24); c.fillStyle = sp.fur2; c.fill(); c.lineWidth = LW * 0.7; c.strokeStyle = OL; c.beginPath(); c.arc(L * 0.12, H * 0.1, L * 0.17, 0.1 * PI, 0.9 * PI); c.stroke(); }
    bib(G, -L * 0.05, -H * 0.02, Math.min(11, H * 0.3));
    limb([L * 0.3, H * 0.12, L * 0.42, H * 0.42, L * 0.52 + Math.sin(ph) * 2 * G.amp, H * 0.3], P.arm || 4.5, G.body);
    c.restore();
    leg(-2, cy + H * 0.25, lg, lw * 1.08, th(1), bd(1), legCol, foot);
    var na = (P.na == null ? 40 : P.na) * PI / 180 - G.headDip, nk = P.neck == null ? 14 : P.neck, r = P.hr || 15, sn = P.sn == null ? 14 : P.sn;
    var nb = [Math.cos(tilt) * L * 0.36 + Math.sin(tilt) * H * 0.12, cy + Math.sin(tilt) * L * 0.36 - Math.cos(tilt) * H * 0.12];
    var hd = [nb[0] + Math.cos(na) * (nk + r * 0.5), nb[1] - Math.sin(na) * (nk + r * 0.5)];
    taper([nb[0] - 6, nb[1] + 4, (nb[0] + hd[0]) / 2, (nb[1] + hd[1]) / 2, hd[0], hd[1]], Math.min(H * 0.7, r * 1.7), r * 1.1, G.body);
    c.save(); c.translate(hd[0], hd[1]); c.rotate(G.headDip * 0.5 + (roo ? -0.1 : 0.08));
    if (sp.crestBack || P.tube) { taper([-r * 0.2, -r * 0.5, -r * 1.2, -r * 1.1, -r * 2.3, -r * 1.2], r * 0.6, r * 0.4, typeof sp.crestBack === 'string' ? sp.crestBack : (sp.inner || shade(G.head, -0.2))); }
    drawHead(G, r, sn, { plain: !roo });
    if (sp.dome) { c.beginPath(); c.ellipse(-r * 0.05, -r * 0.5, r * 0.8, r * 0.75, 0, PI, TAU); c.closePath(); paint(typeof sp.dome === 'string' ? sp.dome : shade(G.head, 0.3)); }
    if (sp.crest && !roo) { for (q = 0; q < 2; q++) { c.beginPath(); c.ellipse(r * 0.25 - q * 3, -r * 0.7, r * 0.7, r * 0.6, 0, PI, TAU); c.closePath(); paint(typeof sp.crest === 'string' ? sp.crest : '#e8734a', LW * 0.8); } }
    c.restore();
    return { hx: hd[0], hy: hd[1], hr: r, top: Math.min(hd[1] - r * (roo ? 3 : 1.7), cy - H * 0.5 - (sp.sail ? 54 : 6)), len: L * 0.5 + nk + r * 2 + sn };
  }

  // ───────────── 새 (박쥐 · 익룡 포함) ─────────────
  function beak(G, r) {
    var sp = G.sp, ty = sp.beakType || 'cone', col = sp.beak || '#ffb84d', n = (sp.beakLen > 3 ? clamp(sp.beakLen / 11, 0.9, 2.1) : (sp.beakLen || 1)) * r, open = (G.mouth === 'open' || G.mouth === 'o') ? 0.25 : 0;
    switch (ty) {
      case 'duck': ell(r * 0.95 + n * 0.25, r * 0.2, n * 0.55 + r * 0.2, r * 0.28); paint(col); break;
      case 'owl': poly([r * 0.55, -r * 0.05, r * 0.95, r * 0.15, r * 0.6, r * 0.5]); paint(col); break;
      case 'hook': c.beginPath(); c.moveTo(r * 0.75, -r * 0.3); c.quadraticCurveTo(r * 1.75, -r * 0.3, r * 1.6, r * 0.55); c.quadraticCurveTo(r * 1.3, r * 0.2, r * 0.75, r * 0.3); c.closePath(); paint(col); break;
      case 'bent': c.beginPath(); c.moveTo(r * 0.75, -r * 0.3); c.quadraticCurveTo(r * 1.7, -r * 0.2, r * 1.5, r * 0.95); c.quadraticCurveTo(r * 1.1, r * 0.4, r * 0.7, r * 0.3); c.closePath(); paint(col); poly([r * 1.35, r * 0.35, r * 1.56, r * 0.4, r * 1.5, r * 0.95]); c.fillStyle = '#2b2018'; c.fill(); break;
      case 'toucan': c.beginPath(); c.moveTo(r * 0.7, -r * 0.6); c.quadraticCurveTo(r * 2.7, -r * 0.9, r * 2.9, r * 0.55); c.quadraticCurveTo(r * 1.6, r * 0.5, r * 0.7, r * 0.4); c.closePath(); paint(col); ell(r * 2.55, r * 0.15, r * 0.3, r * 0.38); c.fillStyle = '#2b2018'; c.fill(); break;
      case 'pouch': poly([r * 0.7, -r * 0.2, r * 3.0, r * 0.15, r * 0.7, r * 0.3]); paint(col); c.beginPath(); c.moveTo(r * 0.75, r * 0.28); c.quadraticCurveTo(r * 1.6, r * 1.5, r * 2.9, r * 0.2); c.closePath(); paint(shade(col, 0.3)); break;
      case 'long': poly([r * 0.75, -r * 0.2, r * 0.9 + n, r * 0.12, r * 0.75, r * 0.28]); paint(col); break;
      case 'penguin': poly([r * 0.75, -r * 0.2, r * 1.6, r * 0.12, r * 0.75, r * 0.3]); paint(col); break;
      default: poly([r * 0.8, -r * 0.28 - open * r, r * 1.55, r * 0.05, r * 0.8, r * 0.3]); paint(col); break;
    }
  }
  function planBird(G) {
    var sp = G.sp, P = G.P, bl = P.bl || 38, bh = P.bh || 26, up = !!P.up, flying = G.fly || P.flyer, lg = (P.leg || 14) * (flying ? 0.5 : 1) * (1 - G.tuck * 0.7), ph = G.ph;
    var A = 0.7 * G.amp * (G.boost ? 1.2 : 1), bob = G.amp ? -Math.abs(Math.sin(ph)) * 2.5 : 0, hover = P.flyer ? 24 + Math.sin(G.t * 5) * 4 : 0;
    var rot = up ? -1.15 + (G.amp ? Math.sin(ph) * 0.09 : 0) : -0.18, cy = -lg - (up ? bl * 0.42 : bh * 0.5) + bob - hover, q;
    var feet = sp.feet || '#ffb84d', wingCol = sp.wingCol || shade(G.body, -0.18), flap = Math.sin(G.t * (flying ? 22 : 16) + ph);
    function birdLeg(k, col) {
      var hx = (up ? 0 : -bl * 0.05) + (k ? -3 : 4), hy = cy + (up ? bl * 0.36 : bh * 0.3), t = flying ? -0.9 : A * Math.sin(ph + k * PI), b = flying ? 0.5 : (G.amp ? Math.max(0, Math.cos(ph + k * PI)) * 0.9 : G.tuck * 1.5);
      var f = leg(hx, hy, lg, P.legW || 2.6, t, b, col, null);
      line([f[0] - 2, f[1], f[0] + 6, f[1] + 0.5], 2.4 + LW, OL); line([f[0] - 2, f[1], f[0] + 6, f[1] + 0.5], 2.4, col);
    }
    if (!P.bat) birdLeg(0, shade(feet, -0.2));
    c.save(); c.translate(0, cy); c.rotate(rot);
    // 꼬리
    var tcol = (sp.feathers && sp.feathers[0]) || sp.tailCol || wingCol, tl = P.tailLen || 13;
    if (P.fan) { for (q = 0; q < 9; q++) { c.save(); c.translate(-bl * 0.3, -bh * 0.1); c.rotate(-1.9 + q * 0.3 + Math.sin(G.t * 3) * 0.02); ell(0, -30, 6.5, 30); paint(sp.fanCol || tcol, LW * 0.8); ell(0, -50, 4, 5); c.fillStyle = sp.fanEye || shade(sp.fanCol || tcol, 0.4); c.fill(); c.restore(); } }
    else if (!P.notail && !P.bat) { for (q = 0; q < 3; q++) { poly([-bl * 0.36, -3 + q * 3, -bl * 0.42 - tl, -8 + q * 6, -bl * 0.4 - tl * 0.8, -1 + q * 4, -bl * 0.34, 2 + q * 2]); paint((sp.feathers && sp.feathers[q]) || tcol, LW * 0.8); } }
    if (P.pt) taper([-bl * 0.4, 0, -bl * 0.4 - 16, 2, -bl * 0.4 - 30, 0], 5, 1.5, G.body);
    // 먼 쪽 날개 (날 때만)
    if (flying) wingShape(G, bl, bh, -flap, true, wingCol);
    if (up) { ell(0, 0, bl * 0.5, bh * 0.5); paint(G.body); c.save(); ell(0, 0, bl * 0.5 - 1, bh * 0.5 - 1); c.clip(); ell(bl * 0.05, bh * 0.42, bl * 0.42, bh * 0.4); c.fillStyle = G.belly || sp.fur2; c.fill(); c.restore(); }
    else { ell(0, 0, bl * 0.5, bh * 0.5); paint(G.body); bodyPattern(G, 0, 0, bl * 0.5 - 1, bh * 0.5 - 1); }
    bib(G, up ? bl * 0.02 : -bl * 0.02, up ? bh * 0.12 : bh * 0.08, Math.min(9.5, bh * 0.3));
    if (flying) wingShape(G, bl, bh, flap, false, wingCol);
    else { c.save(); c.translate(up ? -bl * 0.05 : -bl * 0.04, up ? -bh * 0.12 : -bh * 0.06); c.rotate((G.boost ? flap * 0.3 : 0) + (up ? 0.15 : 0.12)); ell(-bl * 0.08, 0, bl * 0.34, bh * 0.27); paint(wingCol); c.restore(); }
    c.restore();
    if (!P.bat) birdLeg(1, feet);
    // 목 · 머리
    var r = P.hr || 12, nk = P.neck || 0, na = (up ? 1.45 : 0.95) - G.headDip * 1.2;
    var nb = up ? [bh * 0.05, cy - bl * 0.36] : [Math.cos(rot) * bl * 0.34 - Math.sin(rot) * -bh * 0.2, cy + Math.sin(rot) * bl * 0.34 - bh * 0.24];
    var hd = [nb[0] + Math.cos(na) * (nk + r * 0.45), nb[1] - Math.sin(na) * (nk + r * 0.45)];
    if (nk > 4) {
      var ncol = sp.neckCol || (nk > 12 ? G.head : G.body);
      if (P.sneck) taper([nb[0] - 3, nb[1] + 3, nb[0] + nk * 0.42, nb[1] - nk * 0.25, nb[0] + nk * 0.05, hd[1] + nk * 0.28, hd[0], hd[1]], (P.neckW || 9) + 2, (P.neckW ? P.neckW * 0.8 : 7) + 1.5, ncol);
      else taper([nb[0] - 3, nb[1] + 3, (nb[0] + hd[0]) / 2, (nb[1] + hd[1]) / 2, hd[0], hd[1]], (P.neckW || 10) + 2, (P.neckW ? P.neckW * 0.8 : 7.5) + 1.5, ncol);
    }
    c.save(); c.translate(hd[0], hd[1]); c.rotate(G.headDip * 0.6);
    if (P.bat && !P.pt) drawHead(G, r, 4);
    else {
      if (P.pt) taper([-r * 0.3, -r * 0.5, -r * 1.6, -r * 1.2, -r * 2.6, -r * 1.1], r * 0.55, 2, sp.inner || shade(G.head, -0.2));
      if (sp.crest) { for (q = 0; q < 3; q++) { c.save(); c.rotate(-0.9 + q * 0.42); ell(0, -r * 1.25, r * 0.2, r * 0.6); paint(typeof sp.crest === 'string' ? sp.crest : G.head, LW * 0.8); c.restore(); } }
      if (sp.comb) { ell(r * 0.05, -r * 0.95, r * 0.5, r * 0.34); paint(typeof sp.comb === 'string' ? sp.comb : '#ff4d4d'); ell(r * 0.55, r * 0.75, r * 0.2, r * 0.36); paint(typeof sp.comb === 'string' ? sp.comb : '#ff4d4d', LW * 0.8); }
      beak(G, r);
      ell(0, 0, r, r * 0.96); paint(G.head);
      if (sp.penguinFace || sp.owlDisc) { ell(r * 0.3, r * 0.08, r * 0.62, r * 0.72); c.fillStyle = sp.fur2; c.fill(); }
      if (sp.cheek) { ell(r * 0.05, r * 0.4, r * 0.24, r * 0.17); c.fillStyle = typeof sp.cheek === 'string' ? sp.cheek : 'rgba(255,120,140,.55)'; c.fill(); }
      if (sp.eyeRing) { ell(r * 0.34, -r * 0.14, r * 0.42, r * 0.44); c.fillStyle = typeof sp.eyeRing === 'string' ? sp.eyeRing : '#fff'; c.fill(); }
      eye(r * 0.34, -r * 0.14, r * (sp.owlDisc ? 0.3 : 0.22), G.eyes, G.t, sp.dark || sp.sclera);
    }
    c.restore();
    return { hx: hd[0], hy: hd[1], hr: r, top: Math.min(hd[1] - r * 1.6, cy - bh - (P.fan ? 40 : 0) - (flying ? 22 : 0)), len: bl * 0.5 + r * 2.2 };
  }
  function wingShape(G, bl, bh, flap, far, col) {
    var P = G.P, w = (P.wing || 1) * bl * (P.bat ? 1.25 : 0.95), a = -0.35 + flap * 0.85;
    c.save(); c.translate(bl * 0.02, -bh * 0.18); c.rotate(a + (far ? -0.25 : 0));
    if (P.bat) {
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-w * 0.15, -w * 0.9); c.lineTo(-w * 0.4, -w * 0.62); c.lineTo(-w * 0.62, -w * 0.82); c.lineTo(-w * 0.7, -w * 0.45); c.lineTo(-w * 0.95, -w * 0.5); c.lineTo(-w * 0.55, 0); c.closePath();
      paint(far ? shade(col, -0.15) : col);
    } else {
      c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(-w * 0.1, -w * 1.05, -w * 0.5, -w * 0.9); c.lineTo(-w * 0.42, -w * 0.62); c.lineTo(-w * 0.66, -w * 0.58); c.lineTo(-w * 0.5, -w * 0.34); c.lineTo(-w * 0.62, -w * 0.2); c.quadraticCurveTo(-w * 0.3, 0, 4, 0); c.closePath();
      paint(far ? shade(col, -0.15) : col);
    }
    c.restore();
  }

  // ───────────── 바다 동물 (물고기 · 고래 · 물개 · 가오리 · 수장룡) ─────────────
  function planFish(G) {
    var sp = G.sp, P = G.P, L = P.L || 76, H = P.H || 28, ph = G.ph, seal = !!P.seal, sw = Math.sin(ph) * (G.amp ? 1 : 0.25), q;
    var cy = seal ? -H * 0.5 - 2 - (G.amp ? Math.abs(Math.sin(ph)) * 5 : 0) : -(H * 0.5 + 15) + Math.sin(G.t * 4 + ph * 0.5) * 2.5, tilt = seal ? -0.2 + sw * 0.07 : sw * 0.04;
    var fin = sp.feet || shade(G.body, -0.2), belly = G.belly || sp.fur2;
    c.save(); c.translate(0, cy); c.rotate(tilt);
    if (P.wings) {       // 가오리
      var fl = Math.sin(G.t * 9 + ph) * 0.9;
      taper([-L * 0.4, 0, -L * 0.75, 3, -L * 1.05, 0], 4, 1.2, G.body);
      poly([L * 0.3, 0, -L * 0.05, -H * 0.4 - 34 * fl, -L * 0.42, 0]); paint(shade(G.body, -0.12));
      ell(0, 0, L * 0.46, H * 0.6); paint(G.body);
      c.save(); ell(0, 0, L * 0.46 - 1, H * 0.6 - 1); c.clip(); ell(0, H * 0.75, L * 0.5, H * 0.6); c.fillStyle = belly; c.fill(); c.restore();
      poly([L * 0.34, 2, -L * 0.02, H * 0.3 + 30 * fl + 8, -L * 0.4, 2]); paint(G.body);
      poly([L * 0.4, -3, L * 0.56, -7, L * 0.47, 2]); paint(G.body, LW * 0.8);
      bib(G, -L * 0.05, -1, 8);
      eye(L * 0.3, -H * 0.1, 3.2, G.eyes, G.t, sp.dark);
      c.restore();
      return { hx: L * 0.28, hy: cy, hr: 13, top: cy - H - 34, len: L * 0.6 };
    }
    if (P.plesio) { for (q = 0; q < 2; q++) { c.save(); c.translate(-L * 0.2 + q * L * 0.42, H * 0.3); c.rotate(0.5 + Math.sin(ph + q * 2) * 0.5 * (G.amp || 0.3)); ell(0, 9, 5, 12); paint(shade(fin, -0.12)); c.restore(); } }
    // 꼬리
    var tx = -L * 0.5 - (P.round ? 2 : 12), ty = sw * 5;
    if (!P.round) taper([-L * 0.22, 0, -L * 0.4, ty * 0.4, tx, ty], H * 0.72, H * 0.2, G.body);
    c.save(); c.translate(tx, ty); c.rotate(sw * 0.5);
    if (seal || P.paddle) { ell(-7, 0, 11, P.paddle ? 12 : 6.5, 0.2); paint(fin); if (seal) { ell(-7, 5, 10, 5, -0.4); paint(fin); } }
    else if (P.fluke) { c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(-8, -H * 0.2, -15, -H * 0.42); c.quadraticCurveTo(-9, 0, -15, H * 0.42); c.quadraticCurveTo(-8, H * 0.2, 2, 0); c.closePath(); paint(fin); }
    else { poly([3, 0, -15, -H * 0.62, -8, 0, -15, H * 0.55]); paint(fin); }
    c.restore();
    if (P.dorsal !== 0 && !seal) { var dh = (P.dorsal || 1) * H * 0.55; poly([L * 0.08, -H * 0.42, -L * 0.1, -H * 0.45 - dh, -L * 0.16, -H * 0.4]); paint(fin); }
    if (P.neckL) {       // 수장룡의 긴 목
      var nx = L * 0.36 + P.neckL * 0.8, ny = -H * 0.2 - P.neckL * 0.62 + G.headDip * 20;
      taper([L * 0.3, -H * 0.1, L * 0.36 + P.neckL * 0.4, -H * 0.3 - P.neckL * 0.2, nx, ny], H * 0.5, 8, G.body);
      c.save(); c.translate(nx, ny); ell(4, 0, 11, 7.5); paint(G.body); eye(7, -2, 2.4, G.eyes, G.t, sp.dark); mouthAt(9, 3, 4, G.mouth); c.restore();
    }
    if (P.round) { c.fillStyle = sp.spikes && typeof sp.spikes === 'string' ? sp.spikes : shade(G.body, -0.35); for (q = 0; q < 14; q++) { var an = q / 14 * TAU; poly([Math.cos(an - 0.12) * L * 0.48, Math.sin(an - 0.12) * H * 0.48, Math.cos(an) * L * 0.62, Math.sin(an) * H * 0.62, Math.cos(an + 0.12) * L * 0.48, Math.sin(an + 0.12) * H * 0.48]); paint(c.fillStyle, LW * 0.7); } }
    ell(P.round ? 0 : L * 0.06, 0, L * (P.round ? 0.5 : 0.44), H / 2); paint(G.body);
    c.save(); ell(P.round ? 0 : L * 0.06, 0, L * (P.round ? 0.5 : 0.44) - 1, H / 2 - 1); c.clip();
    ell(L * 0.1, H * 0.62, L * 0.5, H * 0.5); c.fillStyle = belly; c.fill();
    if (sp.bands || sp.stripes) { c.fillStyle = '#fff'; for (q = 0; q < 3; q++) { c.fillRect(-L * 0.26 + q * L * 0.24, -H, L * 0.085, H * 2); } c.strokeStyle = OL; c.lineWidth = 1.2; for (q = 0; q < 3; q++) c.strokeRect(-L * 0.26 + q * L * 0.24, -H, L * 0.085, H * 2); }
    if (sp.orca) { ell(L * 0.3, -H * 0.12, L * 0.09, H * 0.14, -0.3); c.fillStyle = '#fff'; c.fill(); ell(L * 0.0, H * 0.6, L * 0.5, H * 0.42); c.fill(); }
    if (sp.spots || sp.dots) { c.fillStyle = typeof sp.spots === 'string' ? sp.spots : shade(G.body, -0.3); for (q = 0; q < 8; q++) { ell(-L * 0.3 + ((q * 37) % 100) / 100 * L * 0.6, -H * 0.4 + ((q * 53) % 100) / 100 * H * 0.4, 2.4, 2.2); c.fill(); } }
    c.restore();
    if (P.melon) { ell(L * 0.36, -H * 0.22, L * 0.13, H * 0.3); c.fillStyle = G.body; c.fill(); }
    bib(G, -L * 0.04, -H * 0.02, Math.min(10.5, H * 0.3));
    // 가슴지느러미 · 앞발
    c.save(); c.translate(L * 0.16, H * 0.3); c.rotate(0.7 + Math.sin(ph + 1) * 0.35 * (G.amp || 0.3));
    if (seal) { ell(2, 10, 6.5, 13); paint(fin); } else { poly([-5, 0, -3, 16, 8, 2]); paint(fin); }
    c.restore();
    if (P.plesio) { c.save(); c.translate(-L * 0.18, H * 0.34); c.rotate(0.6 + Math.sin(ph + 3) * 0.5 * (G.amp || 0.3)); ell(0, 10, 5.5, 13); paint(fin); c.restore(); }
    // 얼굴
    var fx = L * 0.5, ex = L * (P.round ? 0.26 : 0.33), ey = -H * 0.12;
    if (P.bill) { poly([fx - 4, -3, fx + P.bill, 0, fx - 4, 4]); paint(shade(G.body, -0.15)); }
    if (P.beak) { ell(fx + 3, H * 0.08, 10, 5); paint(G.body); }
    if (P.tusk) { line([fx - 6, -H * 0.05, fx + P.tusk, -H * 0.3], 3 + LW * 1.6, OL); line([fx - 6, -H * 0.05, fx + P.tusk, -H * 0.3], 3, '#fff8ea'); }
    if (sp.tusk && seal) { for (q = 0; q < 2; q++) { poly([fx - 12 - q * 5, H * 0.2, fx - 9 - q * 5, H * 0.2 + 16, fx - 6 - q * 5, H * 0.2]); paint('#fff8ea', LW * 0.7); } }
    if (sp.lure) { c.beginPath(); c.moveTo(L * 0.3, -H * 0.45); c.quadraticCurveTo(L * 0.42, -H * 1.1, L * 0.62, -H * 0.72); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke(); ell(L * 0.63, -H * 0.68, 5, 5); c.fillStyle = 'rgba(255,240,130,.5)'; c.fill(); ell(L * 0.63, -H * 0.68, 3, 3); paint('#fff38a', LW * 0.6); }
    if (!P.neckL) {
      if (seal) { ell(fx - 3, H * 0.02, 3.2, 2.6); c.fillStyle = sp.nose || OL; c.fill(); c.strokeStyle = 'rgba(74,50,38,.6)'; c.lineWidth = 1.1; for (q = 0; q < 3; q++) { c.beginPath(); c.moveTo(fx - 8, H * 0.12 + q * 2); c.lineTo(fx + 6, H * 0.08 + q * 5); c.stroke(); } }
      if (sp.teeth || sp.teethBig || (sp.snout && sp.snout.croc && !seal)) { c.fillStyle = '#fff'; for (q = 0; q < 5; q++) { poly([fx - 20 + q * 4, H * 0.2, fx - 18 + q * 4, H * 0.2 + (sp.teethBig ? 7 : 4.5), fx - 16 + q * 4, H * 0.2]); c.fill(); } line([fx - 22, H * 0.2, fx - 1, H * 0.16], LW * 0.75); }
      else mouthAt(fx - 9, H * 0.16, 5, G.mouth);
      eye(ex, ey, Math.max(2.6, H * (P.round ? 0.11 : 0.1)), G.eyes, G.t, sp.dark || sp.sclera);
    }
    if (sp.spout && G.amp && (G.t % 2.2) < 0.7) { c.strokeStyle = 'rgba(150,210,255,.9)'; c.lineWidth = 2.4; c.lineCap = 'round'; for (q = -1; q <= 1; q++) { c.beginPath(); c.moveTo(L * 0.2, -H * 0.5); c.quadraticCurveTo(L * 0.2 + q * 4, -H * 0.5 - 14, L * 0.2 + q * 10, -H * 0.5 - 20); c.stroke(); } }
    c.restore();
    return { hx: P.neckL ? L * 0.36 + P.neckL * 0.8 : L * 0.3, hy: P.neckL ? cy - H * 0.2 - P.neckL * 0.62 : cy, hr: P.neckL ? 10 : Math.min(18, H * 0.5), top: cy - H * 0.5 - (P.neckL ? P.neckL * 0.7 : (P.dorsal === 0 ? 4 : H * 0.5)), len: L * 0.56 + (P.bill || P.tusk || 0) };
  }

  // ───────────── 뱀 ─────────────
  function planSerpent(G) {
    var sp = G.sp, P = G.P, ph = G.ph, n = 15, pts = [], q, x, y, hood = !!P.hood, A = (G.amp ? 6.5 : 2.5) * (1 - G.tuck);
    for (q = 0; q < n; q++) {
      x = -54 + q * 6.2; y = -7 + Math.sin(q * 0.75 - ph) * A * Math.min(1, (n - q) / 4 + 0.25);
      if (hood && q > n - 6) { var k = (q - (n - 6)) / 5; x = -54 + (n - 6) * 6.2 + k * 10; y = -7 - k * k * 40; }
      pts.push(x, y);
    }
    taper(pts, 4, 12, G.body);
    c.save(); taper(pts, 4, 12, null, 0); c.clip();
    c.fillStyle = sp.stripes && typeof sp.stripes === 'string' ? sp.stripes : shade(G.body, -0.28);
    for (q = 1; q < n - 1; q += 2) { ell(pts[q * 2], pts[q * 2 + 1] - 2, 2.6, 5); c.fill(); }
    c.restore();
    bib(G, pts[12], pts[13], 7);
    var hx = pts[n * 2 - 2] + 5, hy = pts[n * 2 - 1] - 1;
    c.save(); c.translate(hx, hy); c.rotate(G.headDip * 0.5);
    if (hood) { ell(-5, 6, 15, 19); paint(typeof sp.hood === 'string' ? sp.hood : shade(G.body, 0.15)); ell(-5, 7, 8, 11); c.fillStyle = G.belly || sp.fur2; c.fill(); }
    if (G.amp || G.boost) { var tg = (G.t * 3 % 1) < 0.4 ? 1 : 0.2; line([9, 2, 9 + 9 * tg, 3], 1.8, '#ff4d6a'); if (tg > 0.5) { line([18, 3, 22, 0.5], 1.6, '#ff4d6a'); line([18, 3, 22, 5.5], 1.6, '#ff4d6a'); } }
    ell(0, 0, 11, 8.5); paint(G.head);
    eye(3.5, -2, 2.4, G.eyes, G.t, sp.dark); mouthAt(5, 3.5, 4, G.mouth);
    c.restore();
    return { hx: hx, hy: hy, hr: 10, top: hy - (hood ? 24 : 14), len: 46 };
  }

  // ───────────── 게 · 바닷가재 · 새우 ─────────────
  function planCrust(G) {
    var sp = G.sp, P = G.P, ph = G.ph, q, k, a = G.amp, col = G.body, dk = shade(col, -0.18), snap = 0.25 + 0.2 * Math.sin(G.t * 7 + ph);
    if (P.kind === 'crab') {
      var cy = -17 - (a ? Math.abs(Math.sin(ph * 2)) * 2 : 0) + G.tuck * 8;
      for (q = 0; q < 3; q++) for (k = -1; k <= 1; k += 2) { var w = Math.sin(ph * 2 + q * 2 + (k > 0 ? PI : 0)) * 5 * a; limb([k * 14, cy + 4, k * (24 + q * 4) + w * 0.4, cy + 2 - q * 2, k * (27 + q * 5) + w, -1], 3.6, dk); }
      for (k = -1; k <= 1; k += 2) { limb([k * 16, cy - 4, k * 27, cy - 14, k * 24, cy - 26], 5, col); c.save(); c.translate(k * 24, cy - 28); c.rotate(k * 0.3); c.beginPath(); c.arc(0, 0, 9.5, (-0.5 + snap) * PI, (1.5 - snap) * PI); c.lineTo(0, 0); c.closePath(); paint(col); c.restore(); }
      for (k = -1; k <= 1; k += 2) { line([k * 7, cy - 9, k * 8, cy - 19], 2.6 + LW, OL); line([k * 7, cy - 9, k * 8, cy - 19], 2.6, col); ell(k * 8, cy - 21, 4.2, 4.6); paint('#fff', LW * 0.7); ell(k * 8 + 0.8, cy - 21, 2, 2.3); c.fillStyle = '#2b2018'; c.fill(); }
      ell(0, cy, 22, 14); paint(col);
      c.save(); ell(0, cy, 21, 13); c.clip(); ell(0, cy + 13, 20, 9); c.fillStyle = G.belly || sp.fur2; c.fill(); c.restore();
      mouthAt(1, cy + 1, 5, G.mouth);
      bib(G, 0, cy + 7, 6.5);
      return { hx: 0, hy: cy - 6, hr: 17, top: cy - 40, len: 32 };
    }
    var thin = !!P.thin, cy2 = -15 + (a ? Math.sin(ph * 2) * 1.2 : 0) + G.tuck * 6;
    for (q = 0; q < 5; q++) { var lw2 = Math.sin(ph * 2 + q * 1.3) * 4 * a; limb([-12 + q * 6, cy2 + 5, -13 + q * 6 + lw2 * 0.5, cy2 + 10, -12 + q * 6 + lw2, -0.5], 2.4, dk); }
    c.save(); c.translate(-30, cy2 + 3); c.rotate(0.25 + Math.sin(ph * 2) * 0.12 * a); for (q = -1; q <= 1; q++) { c.save(); c.rotate(q * 0.5); ell(-9, 0, 9, 4.5); paint(q ? dk : col, LW * 0.8); c.restore(); } c.restore();
    for (q = 0; q < 4; q++) { ell(-22 + q * 7.5, cy2 + 2 - q * 0.8, 6.5, (thin ? 7 : 9) + q * 0.6); paint(q % 2 ? col : dk); }
    ell(10, cy2 - 1, 15, thin ? 9.5 : 12); paint(col);
    bib(G, 6, cy2, 6.5);
    c.lineCap = 'round'; c.strokeStyle = OL; c.lineWidth = 1.6;
    for (q = 0; q < 2; q++) { c.beginPath(); c.moveTo(20, cy2 - 7); c.quadraticCurveTo(34 + q * 6, cy2 - 34 + q * 8 + Math.sin(G.t * 5) * 2, 12 + q * 24, cy2 - 40 + q * 10); c.stroke(); }
    if (!thin) for (q = 0; q < 2; q++) { limb([18, cy2 + 3 - q * 4, 30, cy2 + 2 - q * 10, 38, cy2 - 4 - q * 10], 4.4, q ? col : dk); c.save(); c.translate(42, cy2 - 6 - q * 10); c.rotate(-0.3); c.beginPath(); c.arc(0, 0, 9, (-0.95 + snap) * PI, (0.95 - snap) * PI); c.lineTo(-2, 0); c.closePath(); paint(q ? col : dk); c.restore(); }
    else { limb([20, cy2 + 3, 28, cy2 + 6, 33, cy2 + 2], 2.4, dk); poly([22, cy2 - 6, 38, cy2 - 12, 24, cy2 - 2]); paint(dk, LW * 0.8); }
    ell(19, cy2 - 8, 3.8, 4); paint('#fff', LW * 0.7); ell(19.8, cy2 - 8, 1.9, 2.1); c.fillStyle = '#2b2018'; c.fill();
    mouthAt(19, cy2 + 1, 3.5, G.mouth);
    return { hx: 14, hy: cy2 - 4, hr: 14, top: cy2 - 42, len: thin ? 40 : 52 };
  }

  // ───────────── 곤충 ─────────────
  // 옆모습 : 배 · 가슴 · 머리 + 다리 여섯 + 더듬이. P 로 생김새를 바꾼다.
  //   L · H 배의 반지름(길이 · 높이)  th 가슴  hr 머리  leg 다리 길이  lw 다리 굵기
  //   wing : fly(투명 날개) · butter(나비) · dragon(잠자리) · shell(딱지날개)   hover : 달릴 때도 날아다님   hov : 뜨는 높이
  //   ant(더듬이) : elbow · long · club · feather · short
  //   덧붙임 : horn(rhino · stag) snout needle sting pincer raptor hind dig jaw glow ball tails leaf tubes wide(납작) neck(목 길이) kind('larva' 애벌레)
  function planBug(G) {
    var sp = G.sp, P = G.P, ph = G.ph, a = G.amp, t = G.t, q, k;
    var col = G.body, dk = shade(col, -0.22), hcol = sp.headCol || col;
    var L = P.L || 15, H = P.H || 10, th = P.th || 8, hr = P.hr || 8.5, lg = P.leg || 13, lw = P.lw || 2.6;
    if (P.kind === 'larva') {                    // 애벌레 : 마디가 물결치며 기어간다
      var n = P.seg || 6, r0 = H, x0 = -(n - 1) * r0 * 0.62, ys = [];
      for (q = 0; q < n; q++) ys.push(-r0 - Math.max(0, Math.sin(ph * 2 - q * 1.1)) * r0 * 0.55 * a + G.tuck * 2);
      for (q = 0; q < n; q++) { for (k = 0; k < 2; k++) line([x0 + q * r0 * 1.25 - 2 + k * 4, ys[q] + r0 * 0.7, x0 + q * r0 * 1.25 - 2 + k * 4, 0], 2.2, dk); }
      for (q = 0; q < n; q++) { ell(x0 + q * r0 * 1.25, ys[q], r0, r0); paint(q % 2 ? col : shade(col, 0.1)); if (sp.spots) { ell(x0 + q * r0 * 1.25, ys[q] - r0 * 0.25, r0 * 0.28, r0 * 0.28); c.fillStyle = sp.spots; c.fill(); } }
      var lhx = x0 + n * r0 * 1.25 - r0 * 0.25, lhy = ys[n - 1] - r0 * 0.25 + G.headDip * 5;
      for (k = 0; k < 2; k++) { line([lhx + 2 + k * 3, lhy - hr * 0.8, lhx + 5 + k * 5, lhy - hr * 1.7 + Math.sin(t * 5 + k) * 1.5], 1.8, OL); ell(lhx + 5 + k * 5, lhy - hr * 1.7 + Math.sin(t * 5 + k) * 1.5, 1.8, 1.8); c.fillStyle = OL; c.fill(); }
      ell(lhx, lhy, hr, hr); paint(hcol);
      eye(lhx + hr * 0.3, lhy - hr * 0.12, hr * 0.3, G.eyes, t, true); mouthAt(lhx + hr * 0.45, lhy + hr * 0.5, hr * 0.3, G.mouth);
      bib(G, x0 + r0 * 2.5, ys[2], Math.min(6.5, r0 * 0.72));
      return { hx: lhx, hy: lhy, hr: hr * 1.2, top: lhy - hr * 2.2, len: (n * r0 * 1.25 + hr) * 0.55 };
    }
    var air = G.fly || (P.hover && G.tuck < 0.5 && G.rot === 0 || P.hover && G.tuck < 0.5 && Math.abs(G.rot) < 0.5);     // 날고 있는가
    var fast = P.wing === 'butter' ? 13 : 44, flap = Math.sin(t * fast + ph);
    var up = lg * 0.8 + (air ? (P.hov || 15) + Math.sin(t * 5 + ph) * 2.2 : (a ? Math.abs(Math.sin(ph * 2)) * 1.1 : 0)) - G.tuck * lg * 0.45;
    var cy = -(up + Math.max(th, H) * 0.55);                               // 가슴 높이
    var ax = -(th * 0.75 + L * 0.8), ay = cy + (P.droop || 0) + (air ? 2 : 0);    // 배
    var nk = P.neck || 0, hx0 = th * 0.7 + hr * 0.75 + nk * 0.75, hy = cy - nk * 0.8 - (P.headUp || 0) + G.headDip * 6;
    var roots = [-th * 0.6, 0, th * 0.6];
    function legOf(i, far) {
      var x0 = roots[i] + (far ? 1.5 : 0), y0 = cy + th * 0.5, dir = i === 0 ? -1 : (i === 2 ? 1 : 0.15), cl = far ? shade(dk, -0.15) : dk;
      var gph = ph * 2 + (i % 2 ? PI : 0) + (far ? PI : 0), sw = Math.sin(gph) * lg * 0.34 * a, liftY = -Math.max(0, Math.cos(gph)) * 2.6 * a;
      if (P.hind && i === 0) {             // 뛰는 뒷다리 : 굵은 넓적다리가 등 위로 솟는다
        var kx = x0 - lg * 0.75, ky = cy - lg * (G.stretch ? 0.2 : 0.75);
        limb([x0, cy, kx, ky], lw * 2.1, far ? shade(col, -0.3) : shade(col, -0.08));
        limb([kx, ky, x0 - lg * (G.stretch ? 1.5 : 0.55) + sw, air ? cy + lg * 0.5 : liftY], lw, cl);
        return;
      }
      if (P.raptor && i === 2) {           // 낫 모양 앞다리 : 가슴 앞에 접어 든다
        var sx = hx0 - hr * 0.9 - nk * 0.35, sy = hy + hr * 0.9, sn = Math.sin(t * 4 + (far ? 1 : 0)) * 1.5;
        limb([sx, sy, sx + lg * 0.75, sy - lg * 0.15 + sn, sx + lg * 0.3, sy - lg * 0.75 + sn], lw * 1.5, far ? shade(col, -0.3) : col);
        return;
      }
      if (P.dig && i === 2) { limb([x0, y0, x0 + lg * 0.7, y0 + 1 + sw * 0.3], lw * 2.4, cl); ell(x0 + lg * 0.9, y0 + 2 + sw * 0.3, lw * 2.1, lw * 1.6); paint(far ? shade(col, -0.3) : col, LW * 0.8); return; }
      if (air) { limb([x0, y0, x0 + dir * lg * 0.32, y0 + lg * 0.3, x0 + dir * lg * 0.1 - 2, y0 + lg * 0.6], lw, cl); return; }
      var spread = P.spread || 1;
      limb([x0, y0, x0 + dir * lg * 0.6 * spread, y0 - lg * 0.2, x0 + dir * lg * 0.95 * spread + sw, liftY], lw, cl);
    }
    function clearWing(x, y, len, wid, ang) { c.save(); c.translate(x, y); c.rotate(ang); ell(-len * 0.5, 0, len * 0.5, wid); c.fillStyle = sp.wingCol || 'rgba(255,255,255,.72)'; c.fill(); c.lineWidth = 1.3; c.strokeStyle = 'rgba(74,50,38,.55)'; c.stroke(); c.restore(); }
    function bigWing(far) {                // 나비 · 나방 날개 : 펄럭일 때 폭이 줄었다 늘었다 한다
      var w = P.ws || 26, wf = air ? 0.35 + 0.65 * Math.abs(flap) : 0.55 + Math.sin(t * 2.4 + ph) * 0.12, wc = sp.wingCol || '#f7d23f', we = sp.wingEdge || OL;
      c.save(); c.translate(-th * 0.2, cy - th * 0.5); if (far) { c.translate(3, -1); c.globalAlpha *= 0.85; }
      c.scale(far ? wf * 0.85 : wf, 1);
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-w * 0.2, -w * 1.25, -w * 1.25, -w * 1.2, -w * 1.05, -w * 0.25); c.quadraticCurveTo(-w * 0.6, -w * 0.05, 0, 0); c.closePath(); paint(far ? shade(wc, -0.15) : wc, LW * 0.9);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-w * 1.0, -w * 0.15, -w * 0.9, w * 0.45); c.quadraticCurveTo(-w * (P.tail ? 0.95 : 0.5), w * (P.tail ? 0.95 : 0.6), -w * 0.25, w * 0.3); c.closePath(); paint(far ? shade(wc, -0.22) : shade(wc, -0.07), LW * 0.9);
      if (!far) { ell(-w * 0.7, -w * 0.62, w * 0.2, w * 0.15); c.fillStyle = sp.wingSpot || we; c.fill(); ell(-w * 0.55, w * 0.2, w * 0.13, w * 0.11); c.fill();
        c.beginPath(); c.moveTo(-w * 0.2, -w * 0.9); c.bezierCurveTo(-w * 0.9, -w * 1.2, -w * 1.25, -w * 0.9, -w * 1.05, -w * 0.25); c.lineWidth = w * 0.11; c.strokeStyle = we; c.lineCap = 'round'; c.stroke(); }
      c.restore();
    }
    // ── 뒤쪽 날개 · 뒤쪽 다리 ──
    if (P.wing === 'butter') bigWing(true);
    if (air && P.wing === 'dragon') for (q = 0; q < 2; q++) clearWing(-th * 0.3 + q * 5, cy - th * 0.6, P.ws || 30, 4.2, 0.85 + q * 0.5 + flap * 0.25);
    if (air && (P.wing === 'fly' || P.wing === 'shell')) clearWing(-th * 0.2, cy - th * 0.6, P.ws || 20, (P.ws || 20) * 0.3, 0.75 + flap * 0.5);
    for (q = 0; q < 3; q++) legOf(q, true);
    // ── 배 ──
    if (P.tails) for (k = -1; k <= 1; k++) line([ax - L * 0.9, ay, ax - L * 0.9 - P.tails, ay - 3 + k * 5 + Math.sin(t * 4 + k) * 1.5], 1.5, OL);
    if (P.pincer) for (k = -1; k <= 1; k += 2) { c.beginPath(); c.moveTo(ax - L * 0.85, ay + k * 1.5); c.quadraticCurveTo(ax - L - 9, ay + k * 8, ax - L - 12, ay + k * (1.5 + Math.sin(t * 6) * 1.2)); c.lineWidth = 3 + LW; c.lineCap = 'round'; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = sp.fur2 || dk; c.stroke(); }
    if (P.sting) { poly([ax - L * 0.92, ay - 2.4, ax - L - 8, ay + 0.5, ax - L * 0.92, ay + 2.4]); paint(OL, 1); }
    if (P.tubes) for (k = 0; k < 2; k++) line([ax - L * 0.5 + k * 3, ay - H * 0.7, ax - L * 0.9 + k * 3, ay - H * 1.35], 2.2, dk);
    if (P.glow) { var gl = 0.55 + 0.45 * Math.sin(t * 5 + ph); c.save(); c.globalAlpha *= 0.35 + 0.3 * gl; ell(ax - L * 0.55, ay + 1, L * 0.95 + gl * 5, H * 1.25 + gl * 5); c.fillStyle = '#fff27a'; c.fill(); c.restore(); }
    ell(ax, ay, L, H); paint(P.wing === 'shell' ? shade(col, -0.1) : col);
    if (sp.fur2 && P.wing !== 'shell' && !P.plain) { c.save(); ell(ax, ay, L - 1, H - 1); c.clip(); ell(ax, ay + H * 0.95, L, H * 0.7); c.fillStyle = sp.fur2; c.fill(); c.restore(); }
    if (sp.stripes) { c.save(); ell(ax, ay, L - 1.2, H - 1.2); c.clip(); c.fillStyle = sp.stripes; for (q = 0; q < 3; q++) c.fillRect(ax - L * 0.72 + q * L * 0.52, ay - H, L * 0.24, H * 2); c.restore(); ell(ax, ay, L, H); c.lineWidth = LW; c.strokeStyle = OL; c.stroke(); }
    if (P.glow) { c.save(); ell(ax, ay, L - 1.2, H - 1.2); c.clip(); ell(ax - L * 0.6, ay + 1, L * 0.55, H); c.fillStyle = '#fff27a'; c.fill(); c.restore(); }
    // ── 가슴 · 목 ──
    if (nk) taper([th * 0.2, cy, hx0 - hr * 0.4, hy + hr * 0.3], th * 1.5, hr * 0.9, col);
    ell(0, cy, th * (P.wide ? 1.25 : 1), th * 0.95); paint(sp.thorax || col);
    // ── 딱지날개 ──
    if (P.wing === 'shell') {
      var sc = sp.shell || col, er = air ? -0.75 - flap * 0.08 : 0;
      c.save(); c.translate(-th * 0.35, cy - th * 0.2); c.rotate(er);
      c.beginPath(); c.ellipse(-L * 0.95, th * 0.2 + (P.droop || 0), L * 1.12, H * (P.wide ? 0.95 : 1.12), 0, PI * 0.98, TAU + 0.02); c.closePath(); paint(sc);
      if (sp.spots) { c.fillStyle = sp.spots; for (q = 0; q < 3; q++) { ell(-L * (0.45 + q * 0.5), th * 0.2 - H * (0.5 + (q % 2) * 0.3), H * 0.2, H * 0.2); c.fill(); } }
      if (sp.shell2) { c.save(); c.beginPath(); c.ellipse(-L * 0.95, th * 0.2, L * 1.12, H * 1.12, 0, PI, TAU); c.clip(); c.fillStyle = sp.shell2; c.fillRect(-L * 2.2, th * 0.2 - H * 0.42, L * 2.4, H * 0.2); c.restore(); }
      c.beginPath(); c.ellipse(-L * 0.95, th * 0.2, L * 0.8, H * 0.82, 0, PI * 1.15, PI * 1.6); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineCap = 'round'; c.stroke();
      c.restore();
    }
    for (q = 0; q < 3; q++) legOf(q, false);
    // ── 머리 ──
    var ant = P.ant || 'short', atx = hx0 + hr * 0.25, aty = hy - hr * 0.75, wig = Math.sin(t * 5 + ph) * 2;
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (k = 0; k < 2; k++) {
      c.beginPath(); c.moveTo(atx - k * 3, aty);
      if (ant === 'elbow') { c.lineTo(atx - k * 3 + 2, aty - hr * 0.9); c.lineTo(atx + hr * 1.1 - k * 4, aty - hr * 1.2 + wig); }
      else if (ant === 'long') c.bezierCurveTo(atx + hr * 0.8, aty - hr * 2.2, atx - hr * 2, aty - hr * 2.6 - k * 4 + wig, atx - (P.antLen || 30) - k * 4, aty - hr * 0.6 - k * 5 + wig);
      else if (ant === 'club' || ant === 'feather') c.quadraticCurveTo(atx + hr * 0.5 - k * 2, aty - hr * 1.2, atx + hr * 1.0 - k * 6, aty - hr * 1.9 + wig);
      else c.lineTo(atx + hr * 0.5 - k * 3, aty - hr * 0.7 + wig * 0.4);
      c.lineWidth = ant === 'feather' ? 3.4 : 1.8; c.strokeStyle = ant === 'feather' ? (sp.fur2 || dk) : OL; c.stroke();
      if (ant === 'club') { ell(atx + hr * 1.0 - k * 6, aty - hr * 1.9 + wig, 2, 2); c.fillStyle = OL; c.fill(); }
    }
    if (P.horn === 'stag') for (k = 0; k < 2; k++) { c.beginPath(); c.moveTo(hx0 + hr * 0.6, hy - 1 + k * 4); c.quadraticCurveTo(hx0 + hr * 2.2, hy - hr * 1.5 + k * hr * 2.2, hx0 + hr * 2.9, hy - hr * 0.35 + k * hr * 0.9 + Math.sin(t * 5) * (k ? -1 : 1)); c.lineWidth = 3.6 + LW; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.6; c.strokeStyle = sp.horn || dk; c.stroke(); }
    if (P.jaw) for (k = 0; k < 2; k++) { c.beginPath(); c.moveTo(hx0 + hr * 0.7, hy + hr * 0.2 + k * 2); c.quadraticCurveTo(hx0 + hr * 1.6, hy - hr * 0.5 + k * hr * 1.3, hx0 + hr * (1.5 + P.jaw * 0.5), hy + hr * 0.3 + k * 1.5); c.lineWidth = 2.6 + LW; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2.6; c.strokeStyle = sp.horn || dk; c.stroke(); }
    ell(hx0, hy, hr * (P.wide ? 1.15 : 1), hr * 0.95); paint(hcol);
    if (P.horn === 'rhino') { c.beginPath(); c.moveTo(hx0 + hr * 0.5, hy - hr * 0.3); c.quadraticCurveTo(hx0 + hr * 2.4, hy - hr * 0.2, hx0 + hr * 2.3, hy - hr * 2.2); c.lineWidth = 4.2 + LW; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4.2; c.strokeStyle = sp.horn || dk; c.stroke(); line([hx0 + hr * 2.3, hy - hr * 2.2, hx0 + hr * 1.8, hy - hr * 2.7], 3.2, OL); line([hx0 + hr * 2.3, hy - hr * 2.2, hx0 + hr * 2.9, hy - hr * 2.5], 3.2, OL); }
    if (P.snout) { c.beginPath(); c.moveTo(hx0 + hr * 0.6, hy + hr * 0.1); c.quadraticCurveTo(hx0 + hr * 1.8, hy + hr * 0.2, hx0 + hr * 1.9, hy + hr * 1.6); c.lineWidth = 3.4 + LW; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.4; c.strokeStyle = hcol; c.stroke(); }
    if (P.needle) line([hx0 + hr * 0.7, hy + hr * 0.3, hx0 + hr * 0.9 + P.needle, hy + hr * 0.9 + P.needle * 0.45], 1.7, OL);
    var er2 = hr * (P.eye || 0.34);
    if (sp.eyeCol) { ell(hx0 + hr * 0.3, hy - hr * 0.15, er2 * 1.5, er2 * 1.6); paint(sp.eyeCol, LW * 0.7); if (G.eyes === 'x' || G.eyes === 'closed' || G.eyes === 'happy') eye(hx0 + hr * 0.3, hy - hr * 0.15, er2 * 0.8, G.eyes, t, false); else { ell(hx0 + hr * 0.42, hy - hr * 0.3, er2 * 0.45, er2 * 0.45); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); } }
    else eye(hx0 + hr * 0.3, hy - hr * 0.15, er2, G.eyes, t, true);
    if (!P.snout && !P.needle) mouthAt(hx0 + hr * 0.55, hy + hr * 0.5, hr * 0.3, G.mouth);
    if (P.leaf) { c.save(); c.translate(hx0 + hr * 0.2, hy - hr * 1.1); c.rotate(-0.5 + Math.sin(ph * 2) * 0.08 * a); line([0, 2, 0, -6], 2, OL); c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-16, -14, -4, -30); c.quadraticCurveTo(14, -18, 0, -4); c.closePath(); paint(sp.leaf || '#6fbf4a'); line([-1, -8, -3, -26], 1.3, shade(sp.leaf || '#6fbf4a', -0.3)); c.restore(); }
    if (P.ball) { var br = P.ball, bx = hx0 + hr + br * 0.75; c.save(); c.translate(bx, -br); c.rotate(ph * 1.2); ell(0, 0, br, br); paint(sp.ballCol || '#7a5a3a'); for (q = 0; q < 4; q++) { ell(Math.cos(q * 1.7) * br * 0.5, Math.sin(q * 1.7) * br * 0.5, br * 0.16, br * 0.12); c.fillStyle = shade(sp.ballCol || '#7a5a3a', -0.25); c.fill(); } c.restore(); }
    // ── 앞쪽 날개 ──
    if (P.wing === 'butter') bigWing(false);
    else if (P.wing === 'dragon') { if (air) for (q = 0; q < 2; q++) clearWing(-th * 0.3 + q * 5, cy - th * 0.6, P.ws || 30, 4.6, 1.1 + q * 0.5 - flap * 0.25); else for (q = 0; q < 2; q++) clearWing(-th * 0.3, cy - th * 0.7, P.ws || 30, 4.2, 0.12 + q * 0.2); }
    else if (P.wing === 'fly') { if (air) clearWing(-th * 0.2, cy - th * 0.6, P.ws || 20, (P.ws || 20) * 0.32, 1.1 - flap * 0.5); else clearWing(-th * 0.1, cy - th * 0.75, (P.ws || 20) * 1.05, (P.ws || 20) * 0.26, 0.16); }
    else if (P.wing === 'shell' && air) clearWing(-th * 0.2, cy - th * 0.6, P.ws || 20, (P.ws || 20) * 0.32, 1.25 - flap * 0.5);
    bib(G, P.wing === 'shell' ? -th * 0.35 - L * 0.9 : ax, P.wing === 'shell' ? cy - H * 0.25 : ay, Math.min(6.5, Math.max(4, H * 0.66)));
    var topY = hy - hr * 2.2 - (P.horn === 'rhino' ? hr * 0.8 : 0) - (P.leaf ? 22 : 0);
    if (P.wing === 'butter') topY = Math.min(topY, cy - th * 0.5 - (P.ws || 26) * 1.25);
    if (P.hind) topY = Math.min(topY, cy - lg * 0.8);
    var frontX = hx0 + hr + (P.horn ? hr * 1.9 : 0) + (P.ball ? P.ball * 1.75 : 0) + (P.needle || 0), backX = ax - L - (P.tails || 0) - (P.pincer ? 12 : 0);
    if (P.wing === 'butter') backX = Math.min(backX, -th * 0.2 - (P.ws || 26) * 1.1);
    return { hx: hx0, hy: hy, hr: hr * 1.25, top: topY, len: (frontX - backX) * 0.55 };
  }

  // ───────────── 문어 · 오징어 · 해파리 ─────────────
  function planTent(G) {
    var sp = G.sp, P = G.P, ph = G.ph, q, k, col = G.body, a = G.amp ? 1 : 0.35, t = G.t;
    function arm(x0, y0, dx, dy, len, w, seed) { var p = [], j; for (j = 0; j <= 6; j++) { var u = j / 6; p.push(x0 + dx * len * u + Math.sin(ph * 1.6 + seed + u * 4) * 5 * u * a * (dy ? 1 : 0.4), y0 + dy * len * u + Math.sin(ph * 1.6 + seed + u * 4) * 5 * u * a * (dy ? 0.3 : 1)); } taper(p, w, 1.6, seed % 2 > 0.9 ? shade(col, -0.14) : col); }
    function face(x, y, r) { for (k = -1; k <= 1; k += 2) eye(x + k * r * 0.42, y, r * 0.2, G.eyes, t, true); mouthAt(x + 1, y + r * 0.42, r * 0.25, G.mouth); if (sp.cheek !== false) { for (k = -1; k <= 1; k += 2) { ell(x + k * r * 0.72, y + r * 0.3, r * 0.17, r * 0.11); c.fillStyle = 'rgba(255,120,140,.45)'; c.fill(); } } }
    if (P.kind === 'squid') {
      var cy = -(30 + Math.sin(t * 4) * 3);
      for (q = 0; q < 5; q++) arm(-22, cy - 6 + q * 3, -1, 0, 34 + (q % 2) * 12, 5, q * 1.7);
      poly([40, cy, 22, cy - 22, 14, cy - 4]); paint(shade(col, -0.12)); poly([40, cy, 22, cy + 22, 14, cy + 4]); paint(shade(col, -0.12));
      c.beginPath(); c.moveTo(-24, cy - 12); c.quadraticCurveTo(20, cy - 20, 46, cy); c.quadraticCurveTo(20, cy + 20, -24, cy + 12); c.closePath(); paint(col);
      bib(G, 12, cy, 7.5);
      for (k = -1; k <= 1; k += 2) eye(-13, cy + k * 5.5, 3.2, G.eyes, t, true);
      return { hx: -6, hy: cy, hr: 17, top: cy - 26, len: 48 };
    }
    if (P.kind === 'jelly') {
      var pul = 1 + Math.sin(t * 6 + ph) * 0.07, cy2 = -(46 + Math.sin(t * 3) * 4);
      for (q = 0; q < 6; q++) arm(-15 + q * 6, cy2 + 4, -0.25, 1, 26 + (q % 3) * 9, 3.4, q * 1.3);
      c.save(); c.translate(0, cy2); c.scale(pul, 2 - pul);
      c.beginPath(); c.ellipse(0, 4, 24, 26, 0, PI, TAU); for (q = 0; q < 5; q++) c.quadraticCurveTo(24 - q * 9.6 - 4.8, 11, 24 - (q + 1) * 9.6, 4); c.closePath();
      c.globalAlpha *= 0.88; paint(col); c.globalAlpha /= 0.88;
      ell(-8, -12, 6, 3.5, -0.5); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
      face(0, -5, 15);
      c.restore();
      bib(G, 0, cy2 + 14, 6.5);
      return { hx: 0, hy: cy2 - 6, hr: 19, top: cy2 - 28, len: 26 };
    }
    var cy3 = -(34 + (G.amp ? Math.abs(Math.sin(ph)) * 3 : 0)) + G.tuck * 10;
    for (q = 0; q < 7; q++) { var dx = (q - 3) / 3; arm(dx * 12, cy3 + 12, dx * 0.9, 0.75 - Math.abs(dx) * 0.2, 27, 7.5, q * 1.9); }
    ell(0, cy3, 22, 24); paint(col);
    c.save(); ell(0, cy3, 21, 23); c.clip(); c.fillStyle = shade(col, 0.22); for (q = 0; q < 5; q++) { ell(-14 + ((q * 37) % 28), cy3 - 16 + ((q * 53) % 12), 2.4, 2.4); c.fill(); } c.restore();
    face(1, cy3 + 4, 17);
    bib(G, 0, cy3 - 13, 6.5);
    return { hx: 0, hy: cy3 + 2, hr: 20, top: cy3 - 26, len: 30 };
  }

  // ───────────── 불가사리 (옆돌기로 굴러간다) · 해마 · 개구리 ─────────────
  function planStar(G) {
    var sp = G.sp, q, cy = -30 + G.tuck * 8, rot = G.amp ? G.ph * 0.45 : Math.sin(G.t * 2) * 0.1, k;
    c.save(); c.translate(0, cy); c.rotate(rot);
    c.beginPath();
    for (q = 0; q < 10; q++) { var an = -PI / 2 + q * PI / 5, r = q % 2 ? 14 : 31; if (q === 0) c.moveTo(Math.cos(an) * r, Math.sin(an) * r); else c.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
    c.closePath(); c.lineJoin = 'round'; c.lineWidth = 8 + LW * 2; c.strokeStyle = OL; c.stroke(); c.lineWidth = 8; c.strokeStyle = G.body; c.stroke(); c.fillStyle = G.body; c.fill();
    c.fillStyle = shade(G.body, 0.3); for (q = 0; q < 5; q++) { var a2 = -PI / 2 + q * TAU / 5; ell(Math.cos(a2) * 19, Math.sin(a2) * 19, 2.6, 2.6); c.fill(); }
    c.restore();
    for (k = -1; k <= 1; k += 2) eye(k * 6, cy - 2, 3, G.eyes, G.t, false);
    mouthAt(1, cy + 5, 4, G.mouth);
    for (k = -1; k <= 1; k += 2) { ell(k * 11, cy + 4, 3, 2); c.fillStyle = 'rgba(255,120,140,.5)'; c.fill(); }
    bib(G, 0, cy + 15, 6);
    return { hx: 0, hy: cy, hr: 18, top: cy - 38, len: 34 };
  }
  function planSeahorse(G) {
    var sp = G.sp, cy = -(42 + Math.sin(G.t * 4 + G.ph * 0.3) * 3), col = G.body, fl = Math.sin(G.t * 26) * 0.25, q;
    c.save(); c.translate(0, cy); c.rotate(G.amp ? 0.12 : 0);
    c.save(); c.translate(-9, 0); c.rotate(-0.4 + fl); poly([0, -8, -13, -5, -15, 3, -12, 10, 0, 8]); paint(sp.wingCol || shade(col, 0.25), LW * 0.8); c.restore();
    taper([0, 12, 0, 24, -3, 34, -9, 40, -14, 36, -12, 30, -8, 32], 15, 4, col);
    ell(1, 2, 12, 17); paint(col);
    c.save(); ell(1, 2, 11, 16); c.clip(); ell(8, 4, 8, 15); c.fillStyle = G.belly || sp.fur2; c.fill(); c.strokeStyle = shade(col, -0.2); c.lineWidth = 1.3; for (q = 0; q < 5; q++) { c.beginPath(); c.moveTo(-10, -9 + q * 6); c.lineTo(12, -9 + q * 6); c.stroke(); } c.restore();
    bib(G, 1, 4, 6.5);
    taper([0, -10, 3, -20, 7, -26], 13, 12, col);
    c.save(); c.translate(8, -29); c.rotate(G.headDip * 0.6);
    poly([-6, -9, -2, -17, 2, -9, 6, -15, 8, -7]); paint(shade(col, -0.15), LW * 0.8);
    c.beginPath(); c.rect(6, -1, 17, 6.5); paint(col); ell(24, 2.2, 2.4, 3.6); paint(shade(col, -0.2), LW * 0.7);
    ell(0, 0, 11, 10); paint(G.head);
    eye(3.5, -2, 2.8, G.eyes, G.t, sp.dark);
    c.restore();
    c.restore();
    return { hx: 8, hy: cy - 29, hr: 12, top: cy - 50, len: 30 };
  }
  function planFrog(G) {
    var sp = G.sp, P = G.P, ph = G.ph, k = G.amp ? ((ph / TAU) % 1 + 1) % 1 : 0, up = G.amp ? Math.sin(PI * k) : 0, ext = G.stretch ? 1 : (G.amp ? clamp(Math.sin(PI * k) * 1.4, 0, 1) : 0), q;
    var cy = -17 - up * 15 + G.tuck * 5, col = G.body, dk = shade(sp.limbCol || col, -0.16), tilt = -0.22 - ext * 0.25;
    c.save(); c.translate(0, cy); c.rotate(tilt);
    // 뒷다리 : 접었다 폈다
    limb([-12, 6, -26 - ext * 4, -4 + ext * 12, -14 - ext * 22, 12 + ext * 8, -4 - ext * 34, 14 + ext * 9], 7, sp.limbCol || col);
    ell(-2 - ext * 36, 15 + ext * 9, 9, 3.6); paint(sp.feet || dk, LW * 0.8);
    ell(0, 0, 25, 17); paint(col);
    c.save(); ell(0, 0, 24, 16); c.clip(); ell(6, 13, 22, 11); c.fillStyle = G.belly || sp.fur2; c.fill();
    if (sp.spots || sp.dots || P.warts) { c.fillStyle = shade(col, -0.25); for (q = 0; q < 7; q++) { ell(-18 + ((q * 37) % 30), -12 + ((q * 53) % 14), 2.4, 2); c.fill(); } }
    c.restore();
    bib(G, -3, 1, 7.5);
    limb([12, 8, 15, 17 - ext * 4, 21 + ext * 4, 19 - ext * 8], 5, sp.limbCol || col); ell(23 + ext * 4, 20 - ext * 8, 5.5, 2.8); paint(sp.feet || dk, LW * 0.8);
    ell(14, -14, 8.5, 8.5); paint(col); eye(15.5, -14.5, 4.4, G.eyes, G.t, true);
    if (G.mouth === 'open' || G.mouth === 'o') mouthAt(19, 2, 6, G.mouth); else line([8, 4, 18, 6, 24, 1], LW * 0.8);
    ell(22, -3, 1.2, 1.2); c.fillStyle = OL; c.fill();
    c.restore();
    return { hx: 12, hy: cy - 5, hr: 17, top: cy - 30, len: 34 };
  }

  // ───────────── 동물별 체형 표 ─────────────
  // q(몸길이, 몸높이, 다리, 다리굵기, 목길이, 목각도, 머리, 주둥이, 그 밖)
  function q(L, H, leg, lw, neck, na, hr, sn, x) { var o = { L: L, H: H, leg: leg, lw: lw, neck: neck, na: na, hr: hr, sn: sn }; if (x) for (var k in x) o[k] = x[k]; return o; }
  var T = {
    rabbit: ['quad', 0.9, q(40, 28, 15, 6.5, 5, 50, 14, 6, { gait: 'bound', hind: 1.35 })],
    turtle: ['quad', 0.95, q(50, 26, 9, 9, 13, 18, 10, 3, { gait: 'sprawl' })],
    cheetah: ['quad', 1.0, q(64, 23, 35, 6, 9, 32, 12, 7)],
    fox: ['quad', 0.92, q(54, 23, 24, 6, 8, 38, 13, 11)],
    bear: ['quad', 1.15, q(66, 43, 23, 12, 6, 22, 18, 10)],
    penguin: ['bird', 1.0, { up: 1, bl: 46, bh: 30, leg: 6, legW: 4, hr: 14 }],
    elephant: ['quad', 1.12, q(74, 50, 31, 14, 4, 15, 22, 0, { earK: 1.15 })],
    kangaroo: ['biped', 1.02, { roo: 1, up: 48, L: 44, H: 28, leg: 34, lw: 9, neck: 10, na: 70, hr: 12, sn: 9, tailL: 46, arm: 4 }],
    skunk: ['quad', 0.88, q(46, 25, 13, 7, 4, 30, 12, 8)],
    pig: ['quad', 0.98, q(56, 37, 15, 8, 2, 12, 16, 8)],
    dog: ['quad', 0.96, q(54, 27, 25, 7, 8, 42, 14, 10)],
    cat: ['quad', 0.88, q(48, 23, 21, 6, 6, 42, 13, 5)],
    panda: ['quad', 1.1, q(60, 42, 21, 12, 4, 20, 18, 7)],
    duck: ['bird', 0.9, { bl: 42, bh: 27, leg: 11, neck: 9, hr: 12 }],
    lion: ['quad', 1.15, q(68, 31, 29, 9, 8, 36, 16, 9)],
    tiger: ['quad', 1.15, q(68, 31, 28, 9, 8, 32, 16, 9)],
    zebra: ['quad', 1.08, q(64, 31, 38, 6.5, 20, 52, 13, 12, { neckMane: 1 })],
    giraffe: ['quad', 1.12, q(54, 29, 50, 6, 58, 74, 11, 10, { front: 1.08 })],
    horse: ['quad', 1.12, q(66, 31, 40, 6.5, 22, 52, 13, 13, { neckMane: 1 })],
    cow: ['quad', 1.14, q(70, 39, 27, 8, 6, 20, 16, 11)],
    sheep: ['quad', 0.98, q(54, 38, 19, 6, 4, 26, 13, 8)],
    goat: ['quad', 0.92, q(50, 27, 25, 6, 8, 48, 12, 9)],
    deer: ['quad', 1.0, q(54, 25, 37, 5, 18, 58, 11, 10)],
    koala: ['quad', 0.9, q(44, 35, 13, 9, 0, 25, 16, 5)],
    sloth: ['quad', 0.92, q(50, 29, 19, 8, 2, 25, 14, 4, { front: 1.2 })],
    monkey: ['quad', 0.9, q(40, 23, 21, 6, 3, 48, 14, 5, { front: 1.15, flat: 1 })],
    gorilla: ['quad', 1.15, q(52, 42, 21, 12, 3, 38, 18, 6, { front: 1.5, flat: 1 })],
    hippo: ['quad', 1.1, q(74, 46, 17, 14, 2, 6, 21, 15, { snh: 0.72 })],
    rhino: ['quad', 1.1, q(76, 42, 21, 13, 4, 2, 17, 15, { snh: 0.62 })],
    croc: ['quad', 1.1, q(80, 19, 9, 8, 3, 3, 10, 30, { gait: 'sprawl', snh: 0.5 })],
    frog: ['frog', 0.9, {}],
    squirrel: ['quad', 0.8, q(38, 23, 11, 6, 3, 42, 13, 5)],
    hamster: ['quad', 0.78, q(36, 30, 6, 6, 0, 15, 15, 4)],
    mouse: ['quad', 0.72, q(34, 21, 7, 5, 1, 20, 12, 8)],
    hedgehog: ['quad', 0.82, q(42, 27, 6, 6, 0, 5, 12, 10)],
    raccoon: ['quad', 0.9, q(48, 27, 15, 7, 3, 32, 14, 8)],
    otter: ['quad', 0.92, q(60, 19, 9, 7, 5, 32, 12, 5, { gait: 'sprawl' })],
    beaver: ['quad', 0.9, q(50, 30, 9, 8, 1, 20, 14, 6)],
    wolf: ['quad', 1.04, q(60, 27, 29, 7, 8, 36, 14, 12)],
    polar: ['quad', 1.12, q(70, 43, 23, 12, 10, 22, 16, 11)],
    seal: ['fish', 1.0, { seal: 1, L: 64, H: 28 }],
    owl: ['bird', 0.92, { up: 1, bl: 40, bh: 34, leg: 7, hr: 17 }],
    chicken: ['bird', 0.88, { bl: 38, bh: 30, leg: 15, neck: 7, hr: 11 }],
    parrot: ['bird', 0.88, { bl: 36, bh: 24, leg: 9, neck: 3, hr: 13, tailLen: 26 }],
    flamingo: ['bird', 1.0, { bl: 36, bh: 24, leg: 48, legW: 2.4, neck: 42, hr: 10, sneck: 1, neckW: 7 }],
    ostrich: ['bird', 1.18, { bl: 48, bh: 36, leg: 50, legW: 3.6, neck: 48, hr: 10, neckW: 7 }],
    camel: ['quad', 1.18, q(66, 33, 40, 7, 28, 60, 12, 12)],
    alpaca: ['quad', 1.0, q(50, 33, 29, 7, 30, 76, 12, 8)],
    bat: ['bird', 0.9, { bl: 26, bh: 18, leg: 4, hr: 13, flyer: 1, bat: 1 }],
    redpanda: ['quad', 0.9, q(48, 25, 13, 7, 3, 32, 14, 6)],
    shark: ['fish', 1.12, { L: 84, H: 27, dorsal: 1.3 }],
    whale: ['fish', 1.2, { L: 96, H: 44, fluke: 1, dorsal: 0.35 }],
    dolphin: ['fish', 1.05, { L: 76, H: 23, fluke: 1, beak: 1 }],
    orca: ['fish', 1.15, { L: 90, H: 33, fluke: 1, dorsal: 1.5 }],
    octopus: ['tent', 1.0, { kind: 'octo' }],
    squid: ['tent', 1.0, { kind: 'squid' }],
    crab: ['crust', 0.95, { kind: 'crab' }],
    lobster: ['crust', 1.0, { kind: 'lob' }],
    shrimp: ['crust', 0.85, { kind: 'lob', thin: 1 }],
    jellyfish: ['tent', 0.95, { kind: 'jelly' }],
    starfish: ['star', 0.9, {}],
    seahorse: ['seahorse', 1.0, {}],
    clownfish: ['fish', 0.8, { L: 46, H: 27 }],
    puffer: ['fish', 0.85, { L: 40, H: 38, round: 1, dorsal: 0 }],
    manta: ['fish', 1.1, { L: 70, H: 13, wings: 1 }],
    walrus: ['fish', 1.12, { seal: 1, L: 76, H: 40 }],
    narwhal: ['fish', 1.08, { L: 78, H: 27, fluke: 1, dorsal: 0, tusk: 34 }],
    sealion: ['fish', 1.05, { seal: 1, L: 70, H: 26 }],
    manatee: ['fish', 1.1, { L: 84, H: 38, paddle: 1, dorsal: 0 }],
    beluga: ['fish', 1.12, { L: 78, H: 31, fluke: 1, dorsal: 0, melon: 1 }],
    swordfish: ['fish', 1.08, { L: 80, H: 21, dorsal: 1.6, bill: 30 }],
    angler: ['fish', 0.92, { L: 50, H: 38, dorsal: 0.5 }],
    seaturtle: ['quad', 1.0, q(56, 24, 12, 9, 12, 14, 10, 4, { gait: 'sprawl', flip: 1 })],
    snake: ['serpent', 1.0, {}],
    cobra: ['serpent', 1.0, { hood: 1 }],
    lizard: ['quad', 0.82, q(46, 13, 7, 5, 3, 10, 8, 8, { gait: 'sprawl' })],
    chameleon: ['quad', 0.88, q(44, 22, 9, 5.5, 2, 8, 11, 7, { gait: 'sprawl', eyeK: 0.3 })],
    iguana: ['quad', 0.98, q(56, 17, 9, 6, 4, 14, 9, 8, { gait: 'sprawl' })],
    gecko: ['quad', 0.78, q(42, 13, 7, 5, 2, 8, 9, 6, { gait: 'sprawl', eyeK: 0.3 })],
    komodo: ['quad', 1.12, q(78, 21, 10, 8, 5, 10, 10, 13, { gait: 'sprawl' })],
    tortoise: ['quad', 1.1, q(54, 30, 10, 11, 13, 22, 11, 3, { gait: 'sprawl' })],
    axolotl: ['quad', 0.85, q(48, 16, 6, 5, 1, 4, 11, 5, { gait: 'sprawl' })],
    salamander: ['quad', 0.8, q(48, 13, 6, 5, 2, 6, 8, 6, { gait: 'sprawl' })],
    toad: ['frog', 0.95, { warts: 1 }],
    eagle: ['bird', 1.05, { bl: 46, bh: 30, leg: 15, legW: 3.4, neck: 5, hr: 13, wing: 1.15 }],
    falcon: ['bird', 0.9, { bl: 38, bh: 24, leg: 13, neck: 3, hr: 11 }],
    crow: ['bird', 0.88, { bl: 38, bh: 24, leg: 13, neck: 3, hr: 12 }],
    swan: ['bird', 1.05, { bl: 50, bh: 30, leg: 11, neck: 44, hr: 10, sneck: 1, neckW: 8 }],
    goose: ['bird', 0.98, { bl: 46, bh: 30, leg: 15, neck: 28, hr: 10, neckW: 8 }],
    peacock: ['bird', 1.0, { bl: 42, bh: 26, leg: 21, neck: 20, hr: 9, fan: 1, neckW: 7 }],
    toucan: ['bird', 0.9, { bl: 36, bh: 24, leg: 11, neck: 3, hr: 12 }],
    pelican: ['bird', 1.05, { bl: 48, bh: 32, leg: 13, neck: 16, hr: 12, neckW: 8 }],
    woodpecker: ['bird', 0.82, { bl: 34, bh: 20, leg: 9, neck: 3, hr: 11 }],
    pigeon: ['bird', 0.82, { bl: 36, bh: 26, leg: 9, neck: 5, hr: 10 }],
    seagull: ['bird', 0.9, { bl: 40, bh: 24, leg: 11, neck: 5, hr: 11 }],
    sparrow: ['bird', 0.75, { bl: 30, bh: 24, leg: 7, neck: 1, hr: 11 }],
    hummingbird: ['bird', 0.72, { bl: 26, bh: 16, leg: 4, neck: 1, hr: 9, flyer: 1 }],
    kiwi: ['bird', 0.85, { bl: 36, bh: 32, leg: 13, legW: 3.2, neck: 1, hr: 11, notail: 1 }],
    turkey: ['bird', 1.0, { bl: 46, bh: 36, leg: 17, legW: 3.2, neck: 13, hr: 10, fan: 1, neckW: 7 }],
    crane: ['bird', 1.08, { bl: 42, bh: 26, leg: 48, legW: 2.4, neck: 42, hr: 9, neckW: 6.5 }],
    stork: ['bird', 1.08, { bl: 44, bh: 28, leg: 44, legW: 2.4, neck: 34, hr: 10, neckW: 7 }],
    puffin: ['bird', 0.88, { up: 1, bl: 38, bh: 26, leg: 7, legW: 3.4, hr: 13 }],
    robin: ['bird', 0.75, { bl: 28, bh: 24, leg: 9, hr: 11 }],
    canary: ['bird', 0.75, { bl: 28, bh: 22, leg: 8, hr: 10 }],
    cockatoo: ['bird', 0.88, { bl: 36, bh: 24, leg: 9, neck: 3, hr: 13 }],
    vulture: ['bird', 1.05, { bl: 48, bh: 32, leg: 15, legW: 3.2, neck: 14, hr: 10, neckW: 6.5, wing: 1.15 }],
    dodo: ['bird', 1.0, { bl: 48, bh: 40, leg: 15, legW: 4, neck: 9, hr: 14, neckW: 11 }],
    trex: ['biped', 1.18, { L: 58, H: 34, leg: 38, lw: 12, neck: 10, na: 30, hr: 18, sn: 20, tailL: 62, arm: 4, snh: 0.72 }],
    triceratops: ['quad', 1.14, q(78, 43, 23, 13, 2, 2, 18, 13, { snh: 0.6 })],
    stego: ['quad', 1.14, q(78, 41, 21, 12, 9, -12, 9, 8, { plates: 1, hind: 1.25 })],
    brachio: ['quad', 1.18, q(66, 39, 38, 12, 66, 66, 9, 7, { front: 1.2 })],
    raptor: ['biped', 0.98, { L: 46, H: 22, leg: 32, lw: 7, neck: 14, na: 45, hr: 12, sn: 14, tailL: 52, arm: 5 }],
    ptero: ['bird', 1.12, { bl: 40, bh: 20, leg: 10, neck: 14, hr: 10, flyer: 1, bat: 1, pt: 1, wing: 1.2, neckW: 6 }],
    ankylo: ['quad', 1.12, q(78, 35, 15, 12, 2, 0, 13, 9, { armor: 1 })],
    parasaur: ['biped', 1.1, { L: 54, H: 30, leg: 34, lw: 10, neck: 16, na: 50, hr: 13, sn: 13, tailL: 56, arm: 5, tube: 1 }],
    spino: ['biped', 1.18, { L: 62, H: 32, leg: 34, lw: 11, neck: 12, na: 30, hr: 14, sn: 24, tailL: 62, arm: 6, snh: 0.5 }],
    diplodocus: ['quad', 1.18, q(70, 35, 29, 12, 60, 26, 8, 7)],
    pachy: ['biped', 1.0, { L: 48, H: 26, leg: 30, lw: 9, neck: 12, na: 55, hr: 13, sn: 9, tailL: 50, arm: 5 }],
    dilopho: ['biped', 1.05, { L: 50, H: 24, leg: 34, lw: 8, neck: 14, na: 45, hr: 13, sn: 15, tailL: 56, arm: 5 }],
    compy: ['biped', 0.72, { L: 40, H: 18, leg: 28, lw: 5.5, neck: 14, na: 50, hr: 10, sn: 10, tailL: 46, arm: 4 }],
    plesio: ['fish', 1.1, { L: 68, H: 28, plesio: 1, neckL: 44, dorsal: 0 }],
    mammoth: ['quad', 1.16, q(74, 52, 30, 14, 4, 15, 22, 0, { earK: 0.6 })],
    sabertooth: ['quad', 1.15, q(66, 31, 27, 9, 8, 32, 16, 9)],
    dimetrodon: ['quad', 1.1, q(68, 21, 10, 8, 4, 8, 11, 12, { gait: 'sprawl' })],
    archaeo: ['bird', 0.92, { bl: 38, bh: 22, leg: 15, neck: 7, hr: 10, tailLen: 30 }],
    capybara: ['quad', 0.98, q(56, 35, 15, 8, 1, 15, 15, 10, { snh: 0.68 })],
    fennec: ['quad', 0.8, q(46, 21, 20, 5.5, 6, 40, 12, 9, { earK: 1.5 })],
    meerkat: ['quad', 0.8, q(42, 17, 12, 5, 7, 58, 11, 7)],
    badger: ['quad', 0.92, q(54, 25, 10, 8, 1, 10, 13, 10)],
    ferret: ['quad', 0.85, q(56, 15, 8, 6, 5, 32, 10, 6)],
    chipmunk: ['quad', 0.78, q(36, 22, 10, 6, 3, 40, 12, 5)],
    leopard: ['quad', 1.05, q(62, 25, 25, 7, 7, 32, 14, 7)],
    panther: ['quad', 1.05, q(62, 25, 25, 7, 7, 32, 14, 7)],
    hyena: ['quad', 1.0, q(54, 29, 26, 7.5, 9, 32, 15, 10, { front: 1.18 })],
    lynx: ['quad', 0.92, q(50, 25, 23, 7, 6, 40, 14, 5)],
    bison: ['quad', 1.12, q(74, 44, 23, 10, 0, -5, 18, 10, { humpX: 0.18 })],
    moose: ['quad', 1.1, q(68, 37, 42, 7, 12, 32, 14, 16, { snh: 0.66 })],
    reindeer: ['quad', 1.04, q(56, 28, 34, 5.5, 16, 52, 12, 11)],
    llama: ['quad', 1.04, q(52, 32, 31, 7, 32, 76, 12, 9)],
    donkey: ['quad', 1.0, q(58, 30, 32, 6.5, 18, 50, 13, 13, { neckMane: 1, earK: 1.3 })],
    boar: ['quad', 1.02, q(58, 37, 17, 8, 2, 8, 16, 11)],
    anteater: ['quad', 1.0, q(62, 27, 17, 8, 4, -2, 9, 30, { snh: 0.32 })],
    armadillo: ['quad', 0.85, q(46, 28, 8, 6, 1, -2, 10, 11, { snh: 0.42 })],
    pangolin: ['quad', 0.88, q(54, 23, 9, 7, 3, -2, 9, 11, { snh: 0.42 })],
    platypus: ['quad', 0.85, q(50, 17, 6, 6, 1, 4, 11, 13, { gait: 'sprawl' })],
    wombat: ['quad', 0.92, q(50, 33, 10, 9, 0, 8, 15, 6)],
    quokka: ['quad', 0.85, q(40, 28, 13, 6.5, 2, 40, 13, 6, { gait: 'bound', hind: 1.3 })],
    lemur: ['quad', 0.88, q(42, 22, 20, 6, 3, 45, 13, 7)],
    orangutan: ['quad', 1.1, q(48, 38, 19, 10, 3, 40, 17, 6, { front: 1.6, flat: 1 })],
    chimp: ['quad', 1.0, q(46, 32, 20, 9, 3, 42, 16, 6, { front: 1.35, flat: 1 })]
  };
  // ── 2026-11 에 더한 50종 : 비슷한 동물의 체형을 바탕으로 크기 · 비율 · 색을 바꿔 만든다 ──
  // id: [바탕 동물, 크기, 체형에서 바꿀 값, 색 · 모양에서 바꿀 값]
  var NEW50 = {
    jaguar: ['leopard', 1.08, { H: 27, lw: 8 }, { fur: '#e2a03a', fur2: '#fff0d0', spots: '#3f2a18' }],
    snowleopard: ['leopard', 1.02, {}, { fur: '#d9dde2', fur2: '#ffffff', inner: '#c9b8b0', spots: '#5a5f6a', tailTip: '#5a5f6a' }],
    gazelle: ['deer', 0.9, { L: 48, leg: 36, neck: 16 }, { fur: '#e0a55e', fur2: '#fff6e6', horn: 'cow', dots: null }],
    gnu: ['bison', 1.05, { H: 38, leg: 28 }, { fur: '#5a5560', fur2: '#77727f', inner: '#4a4650', beard: '#e9e2d0', maneTop: '#2f2b33' }],
    buffalo: ['bison', 1.12, { H: 40, leg: 22 }, { fur: '#4a4650', fur2: '#666170', inner: '#3a3640', hump: false, beard: null, maneTop: null }],
    yak: ['bison', 1.12, { H: 46, leg: 18 }, { fur: '#3d3038', fur2: '#5a4a52', inner: '#2a2026', beard: '#2a2026', maneTop: '#2a2026' }],
    tapir: ['pig', 1.02, { L: 60, H: 34, leg: 18, sn: 12 }, { fur: '#3f4048', fur2: '#f1f1f1', inner: '#6b6c75', ear: 'round-s', tail: 'stub', belly: '#f1f1f1', snout: { x: 21, y: 10, rx: 9, ry: 7, out: true } }],
    okapi: ['giraffe', 1.0, { neck: 28, na: 60, leg: 40 }, { fur: '#6b3f2a', fur2: '#f6efe6', patches: null, ossi: '#4a2e1e', tailTip: '#3a2418', sock: '#f6efe6' }],
    mole: ['hamster', 0.74, { L: 40, H: 24, leg: 5, sn: 8 }, { fur: '#4a4350', fur2: '#6b6470', inner: '#ff9eb5', nose: '#ff9eb5', ear: 'none', hamFace: false, snout: { x: 16, y: 10, rx: 10, ry: 6.5, out: true } }],
    prairiedog: ['meerkat', 0.78, { L: 38, H: 20 }, { fur: '#d9a868', fur2: '#f6e2bd', belly: '#f6e2bd', mask: null, tail: 'stub', tailCol: '#d9a868' }],
    flyingsquirrel: ['squirrel', 0.76, {}, { fur: '#9a8f88', fur2: '#fff4ea', inner: '#ffc9d6' }],
    tasdevil: ['badger', 0.9, {}, { dark: true, fur: '#2f2a30', fur2: '#ffffff', badger: 0, bodyCol: '#2f2a30', limbCol: '#231f24', earCol: '#ff9eb5' }],
    echidna: ['hedgehog', 0.84, { sn: 14 }, { fur: '#8a6a4a', fur2: '#b89a78', spikes: '#e8d8b0', snout: { x: 20, y: 9, rx: 12, ry: 5, out: true } }],
    mandrill: ['monkey', 1.0, {}, { fur: '#6b6a4f', fur2: '#e6e2c8', inner: '#4f8fe8', nose: '#e8453c' }],
    magpie: ['crow', 0.86, {}, { fur: '#22242b', belly: '#ffffff', wingCol: '#2f5fb8', feathers: ['#22242b', '#2f5fb8', '#22242b'] }],
    swallow: ['sparrow', 0.74, { bl: 32, bh: 20 }, { fur: '#2b3f7a', fur2: '#fff4ea', belly: '#fff4ea', wingCol: '#22325f', feathers: ['#22325f', '#2b3f7a', '#22325f'], beak: '#3b2a20', inner: '#e8603c' }],
    kingfisher: ['sparrow', 0.78, {}, { fur: '#2f9fd9', fur2: '#ff9a4d', belly: '#ff9a4d', wingCol: '#1f7fb8', feathers: ['#1f7fb8', '#2f9fd9', '#1f7fb8'], beak: '#3b2a20', beakType: 'long', beakLen: 14 }],
    albatross: ['seagull', 1.05, { bl: 48, wing: 1.3 }, { wingCol: '#3b3f4a', feathers: ['#3b3f4a', '#ffffff', '#3b3f4a'], beak: '#ffd0b8' }],
    emu: ['ostrich', 1.1, { neck: 40, leg: 44 }, { fur: '#8a9bb0', fur2: '#8a9bb0', inner: '#8a9bb0', bodyCol: '#6b5a4a', wingCol: '#5a4a3c', feathers: ['#6b5a4a', '#5a4a3c', '#6b5a4a'], limbCol: '#6b6f7a', feet: '#5a5f6a', beak: '#4a4d57' }],
    cassowary: ['ostrich', 1.1, { neck: 36, leg: 40 }, { fur: '#3f8fd9', fur2: '#3f8fd9', inner: '#e8453c', bodyCol: '#26242b', wingCol: '#1c1a20', feathers: ['#26242b', '#1c1a20', '#26242b'], limbCol: '#7a7f8a', feet: '#6a6f7a', beak: '#4a4d57', dome: '#8a6a4a', tuftHair: false }],
    roadrunner: ['chicken', 0.82, { bl: 40, bh: 22, leg: 22, neck: 8 }, { fur: '#b89a78', fur2: '#f1e6d0', belly: '#f1e6d0', wingCol: '#6b5a4a', feathers: ['#4a3f38', '#6b5a4a', '#4a3f38'], comb: '#3f3a48', beak: '#5a4a3c', feet: '#8a9bb0' }],
    heron: ['crane', 1.05, {}, { fur: '#b8c2d0', wingCol: '#8a96a8', feathers: ['#5a6678', '#b8c2d0', '#5a6678'], dome: null }],
    pheasant: ['chicken', 0.9, { bl: 42 }, { fur: '#c9783a', fur2: '#e8a85a', wingCol: '#8a4f22', feathers: ['#8a4f22', '#c9a23a', '#5a3f2a'], comb: '#e8453c', beak: '#e8d2a0', feet: '#8a8f9a' }],
    mandarin: ['duck', 0.86, {}, { fur: '#ff9a3d', fur2: '#fff0d6', inner: '#7a4fb8', beak: '#e8453c', feet: '#ffb02e' }],
    shoebill: ['stork', 1.12, { neck: 26, hr: 13 }, { fur: '#8a96a8', fur2: '#b8c2d0', wingCol: '#6b7688', feathers: ['#6b7688', '#8a96a8', '#6b7688'], beak: '#d9c9a0', beakLen: 15, feet: '#5a5f6a', limbCol: '#5a5f6a' }],
    secretary: ['crane', 1.08, {}, { fur: '#c9ced6', wingCol: '#3b3442', feathers: ['#3b3442', '#c9ced6', '#3b3442'], dome: null, beak: '#8a96a8', beakType: 'hook', beakLen: 9, inner: '#ff8a3d', limbCol: '#f2b6a0', feet: '#f2b6a0' }],
    rattlesnake: ['snake', 0.95, {}, { fur: '#c9a66b', fur2: '#f2e2bd', belly: '#f2e2bd', tailCol: '#8a6a3a' }],
    anaconda: ['snake', 1.2, {}, { fur: '#5a7a3a', fur2: '#d9d28a', belly: '#d9d28a', tailCol: '#5a7a3a', spots: '#2f4a22' }],
    frilled: ['lizard', 0.86, {}, { fur: '#c98a4a', fur2: '#f2dcb0', belly: '#f2dcb0', tailCol: '#c98a4a', crestBack: '#e8603c' }],
    basilisk: ['lizard', 0.84, {}, { fur: '#4fb85a', fur2: '#d9f5c4', belly: '#d9f5c4', tailCol: '#4fb85a', crestBack: '#2f9f8a' }],
    dartfrog: ['frog', 0.78, {}, { fur: '#2f7fe8', fur2: '#8fd0ff', belly: '#8fd0ff', inner: '#2f7fe8', spots: '#16233f' }],
    softshell: ['turtle', 0.95, { sn: 8, neck: 16 }, { fur: '#a8a878', fur2: '#e6e6c0', inner: '#a8a878', shell: '#7a8a5a', shell2: '#5a6a42' }],
    whaleshark: ['shark', 1.25, { L: 92, H: 30 }, { fur: '#4a6a8a', fur2: '#e6edf4', feet: '#3f5a78', dots: '#e6f2ff' }],
    hammerhead: ['shark', 1.08, {}, { fur: '#8a96a0', fur2: '#eef2f5', feet: '#75828c', snout: { x: 15, y: 8, rx: 8, ry: 11, out: true } }],
    sunfish: ['puffer', 1.15, { L: 44, H: 52, round: 0, dorsal: 1.7 }, { fur: '#a8b8c8', fur2: '#e6eef5', spikes: null, feet: '#8a9cb0', hrx: 1.0 }],
    flyingfish: ['swordfish', 0.8, { L: 56, H: 16, bill: 0, dorsal: 0.8 }, { fur: '#4f9fd9', fur2: '#e6f4ff', belly: '#e6f4ff', feet: '#8fd0ff', snout: { x: 15, y: 9, rx: 10, ry: 6, out: true } }],
    moray: ['snake', 1.05, {}, { fur: '#7a8a3a', fur2: '#d9d28a', belly: '#d9d28a', tailCol: '#7a8a3a', fork: 0, spots: '#4a5a22' }],
    seaotter: ['otter', 0.9, {}, { fur: '#7a5a45', fur2: '#f1e6d6', belly: '#f1e6d6' }],
    hermit: ['crab', 0.88, {}, { fur: '#e8783a', fur2: '#ffd9c2', belly: '#ffd9c2' }],
    cuttlefish: ['squid', 0.92, {}, { fur: '#c98a6a', fur2: '#f2dcc8' }],
    eel: ['snake', 1.08, {}, { fur: '#4a4f5a', fur2: '#f2b03a', belly: '#f2b03a', tailCol: '#4a4f5a', fork: 0 }],
    salmon: ['swordfish', 0.92, { L: 60, H: 20, bill: 0, dorsal: 0.9 }, { fur: '#e87a6a', fur2: '#fde6de', belly: '#fde6de', feet: '#c95a4a', snout: { x: 15, y: 9, rx: 10, ry: 6, out: true } }],
    allosaurus: ['trex', 1.1, { sn: 18, arm: 6 }, { fur: '#c98a4a', fur2: '#f2dcb0', belly: '#f2dcb0', crest: '#e8603c' }],
    carno: ['trex', 1.08, { sn: 15, snh: 0.8, arm: 2 }, { fur: '#b8563a', fur2: '#f2c8a8', belly: '#f2c8a8', horn: 'cow' }],
    therizino: ['parasaur', 1.15, { neck: 24, na: 60, arm: 9, tube: 0 }, { fur: '#7a9a5a', fur2: '#e2efb8', belly: '#e2efb8', crestBack: null }],
    iguanodon: ['parasaur', 1.1, { tube: 0 }, { fur: '#8a9a4a', fur2: '#eef2c4', belly: '#eef2c4', crestBack: null }],
    gallimimus: ['compy', 0.98, { L: 46, leg: 36, neck: 22, na: 58 }, { fur: '#d9b27a', fur2: '#f6ecd0', belly: '#f6ecd0' }],
    mosasaurus: ['plesio', 1.2, { neckL: 10, L: 84, H: 28 }, { fur: '#3f6a7a', fur2: '#d6e6ea', belly: '#d6e6ea', feet: '#2f5563', snout: { x: 19, y: 10, rx: 15, ry: 8, out: true, croc: true } }],
    quetzal: ['ptero', 1.1, { neck: 20, wing: 1.12 }, { fur: '#c9b89a', fur2: '#f6ecd8', belly: '#f6ecd8', wingCol: '#a8926a', crestBack: '#e8603c', beakLen: 26 }],
    glyptodon: ['armadillo', 1.2, { L: 62, H: 40, leg: 10, lw: 9 }, { fur: '#b89a78', fur2: '#e6d2b8', shell: '#8a7458', shell2: '#6b5a42', tail: 'club' }]
  };
  Object.keys(NEW50).forEach(function (id) {
    var d = NEW50[id], bt = T[d[0]], pp = {}, sp = {}, k;
    for (k in bt[2]) pp[k] = bt[2][k];
    for (k in d[2]) pp[k] = d[2][k];
    for (k in SPEC[d[0]]) sp[k] = SPEC[d[0]][k];
    for (k in d[3]) sp[k] = d[3][k];
    T[id] = [bt[0], d[1], pp]; SPEC[id] = sp;
  });
  // ── 곤충 50종 : id: [크기, 체형 값, 색]  (체형 값의 뜻은 planBug 머리말에) ──
  var BUGS = {
    ant: [1.45, { L: 13, H: 8.5, th: 6.5, hr: 8.5, leg: 13, ant: 'elbow', jaw: 0.6 }, { fur: '#5a3a2e' }],
    fireant: [1.4, { L: 13, H: 8, th: 6.5, hr: 8.5, leg: 13, ant: 'elbow', jaw: 0.8 }, { fur: '#c9452e', headCol: '#d9603c' }],
    leafcutter: [1.42, { L: 12, H: 8, th: 6.5, hr: 9, leg: 13, ant: 'elbow', jaw: 0.8, leaf: 1 }, { fur: '#a5562c', leaf: '#6fbf4a' }],
    bulletant: [1.6, { L: 15, H: 9, th: 7.5, hr: 9.5, leg: 15, ant: 'elbow', jaw: 1, sting: 1 }, { fur: '#2e2a30', headCol: '#3a3238' }],
    termite: [1.38, { L: 14, H: 9, th: 6, hr: 9, leg: 11, ant: 'short', jaw: 0.9 }, { fur: '#ead9b8', headCol: '#d9853a' }],
    honeybee: [1.45, { L: 13, H: 9.5, th: 8.5, hr: 8, leg: 10, wing: 'fly', hover: 1, ant: 'elbow', sting: 1, ws: 20 }, { fur: '#f7c531', stripes: '#3b2a20', thorax: '#e0a020', headCol: '#3b2a20' }],
    bumblebee: [1.5, { L: 15, H: 12.5, th: 10.5, hr: 8.5, leg: 9, wing: 'fly', hover: 1, hov: 12, ant: 'elbow', ws: 18 }, { fur: '#f7c531', stripes: '#2b2018', thorax: '#2b2018', headCol: '#2b2018' }],
    wasp: [1.45, { L: 16, H: 7, th: 7, hr: 8, leg: 12, wing: 'fly', hover: 1, ant: 'elbow', sting: 1, ws: 22, droop: 3 }, { fur: '#ffd23f', stripes: '#2b2018', thorax: '#2b2018', headCol: '#ffd23f' }],
    hornet: [1.7, { L: 17, H: 8.5, th: 8.5, hr: 9.5, leg: 13, wing: 'fly', hover: 1, ant: 'elbow', sting: 1, jaw: 0.8, ws: 24, droop: 3 }, { fur: '#f08c2e', stripes: '#5a2e1a', thorax: '#5a2e1a', headCol: '#f0a02e' }],
    housefly: [1.4, { L: 12, H: 9, th: 8.5, hr: 8.5, leg: 10, wing: 'fly', hover: 1, hov: 13, ant: 'short', eye: 0.42, ws: 20 }, { fur: '#5f6672', fur2: '#8a909a', eyeCol: '#c9452e' }],
    mosquito: [1.4, { L: 17, H: 4.2, th: 6, hr: 6, leg: 19, lw: 1.6, wing: 'fly', hover: 1, hov: 16, ant: 'feather', needle: 14, ws: 22, droop: 4 }, { fur: '#6b6f7a', stripes: '#f1f1f1' }],
    fruitfly: [1.15, { L: 11, H: 8, th: 7.5, hr: 8, leg: 9, wing: 'fly', hover: 1, hov: 13, ant: 'short', eye: 0.44, ws: 18 }, { fur: '#d9a55a', stripes: '#8a5a2a', eyeCol: '#e8453c' }],
    horsefly: [1.6, { L: 14, H: 9.5, th: 9.5, hr: 9.5, leg: 10, wing: 'fly', hover: 1, hov: 13, ant: 'short', eye: 0.46, ws: 23 }, { fur: '#4a4038', fur2: '#7a6a58', eyeCol: '#3fb86a' }],
    hoverfly: [1.35, { L: 14, H: 6.5, th: 7, hr: 8, leg: 9, wing: 'fly', hover: 1, hov: 17, ant: 'short', eye: 0.42, ws: 20 }, { fur: '#ffd23f', stripes: '#2b2018', thorax: '#6a5a3a', eyeCol: '#8a4a2a' }],
    swallowtail: [1.5, { L: 14, H: 3.6, th: 5, hr: 6, leg: 8, lw: 1.6, wing: 'butter', hover: 1, hov: 18, ant: 'club', ws: 29, tail: 1 }, { fur: '#2b2018', wingCol: '#f7d23f', wingEdge: '#2b2018', wingSpot: '#3f7fe8' }],
    monarch: [1.5, { L: 14, H: 3.6, th: 5, hr: 6, leg: 8, lw: 1.6, wing: 'butter', hover: 1, hov: 18, ant: 'club', ws: 29 }, { fur: '#2b2018', wingCol: '#f08c2e', wingEdge: '#2b2018', wingSpot: '#ffffff' }],
    morpho: [1.45, { L: 14, H: 3.6, th: 5, hr: 6, leg: 8, lw: 1.6, wing: 'butter', hover: 1, hov: 18, ant: 'club', ws: 30 }, { fur: '#3a2a26', wingCol: '#2f8fe8', wingEdge: '#16233f', wingSpot: '#8fd0ff' }],
    moth: [1.4, { L: 13, H: 6, th: 7.5, hr: 7, leg: 8, lw: 1.8, wing: 'butter', hover: 1, hov: 15, ant: 'feather', ws: 25 }, { fur: '#b89a78', wingCol: '#c9b08a', wingEdge: '#8a6f4a', wingSpot: '#6b5238' }],
    hawkmoth: [1.45, { L: 16, H: 7, th: 8.5, hr: 7.5, leg: 8, wing: 'fly', hover: 1, hov: 16, ant: 'club', needle: 16, ws: 26 }, { fur: '#8a7a6a', stripes: '#e86a8a', wingCol: 'rgba(138,110,90,.85)' }],
    caterpillar: [1.4, { kind: 'larva', H: 8.5, hr: 9.5, seg: 6 }, { fur: '#7fc24a', spots: '#f7d23f', headCol: '#5fa83a' }],
    dragonfly: [1.5, { L: 24, H: 3.2, th: 7, hr: 8.5, leg: 8, lw: 1.6, wing: 'dragon', hover: 1, hov: 18, ant: 'short', eye: 0.46, ws: 32 }, { fur: '#d9452e', thorax: '#b83a26', eyeCol: '#8a2a1a' }],
    mayfly: [1.3, { L: 15, H: 3.4, th: 5.5, hr: 6, leg: 10, lw: 1.5, wing: 'fly', hover: 1, hov: 17, ant: 'short', tails: 18, ws: 22 }, { fur: '#e8e2c0', fur2: '#fffbe6' }],
    grasshopper: [1.45, { L: 17, H: 6.5, th: 7.5, hr: 8, leg: 14, hind: 1, ant: 'short' }, { fur: '#7fc24a', fur2: '#d9f0a8' }],
    locust: [1.5, { L: 18, H: 7, th: 8, hr: 8.5, leg: 14, hind: 1, ant: 'short' }, { fur: '#c9a55a', fur2: '#f1e2b8', stripes: '#8a6a3a' }],
    cricket: [1.4, { L: 14, H: 8, th: 8, hr: 9, leg: 12, hind: 1, ant: 'long', antLen: 26, tails: 8 }, { fur: '#4a3426', fur2: '#6b4f3a' }],
    katydid: [1.45, { L: 17, H: 9.5, th: 7.5, hr: 7.5, leg: 15, lw: 2, hind: 1, ant: 'long', antLen: 38 }, { fur: '#5fb84a', plain: 1 }],
    molecricket: [1.45, { L: 17, H: 8.5, th: 9.5, hr: 8.5, leg: 9, dig: 1, ant: 'short', tails: 7, wide: 1 }, { fur: '#8a5f3a', fur2: '#c9a070' }],
    flea: [1.15, { L: 10, H: 10.5, th: 7, hr: 6.5, leg: 14, hind: 1, ant: 'short' }, { fur: '#8a3a2a', fur2: '#b85a3f' }],
    mantis: [1.5, { L: 20, H: 5.5, th: 6, hr: 7.5, leg: 17, lw: 2, raptor: 1, neck: 14, ant: 'club', eye: 0.4 }, { fur: '#7fc24a', fur2: '#d9f0a8' }],
    stickbug: [1.5, { L: 24, H: 2.6, th: 4, hr: 5, leg: 19, lw: 1.7, ant: 'long', antLen: 20, neck: 8 }, { fur: '#8a6a45', plain: 1 }],
    ladybug: [1.5, { L: 12.5, H: 12, th: 7, hr: 7, leg: 8, wing: 'shell', ant: 'short' }, { fur: '#2b2018', shell: '#e8452e', spots: '#2b2018', headCol: '#2b2018' }],
    rhinobeetle: [1.7, { L: 14, H: 11.5, th: 9, hr: 8, leg: 11, lw: 3.2, wing: 'shell', horn: 'rhino', ant: 'short' }, { fur: '#4a2a1a', shell: '#6b3a22', horn: '#3a2014' }],
    stagbeetle: [1.65, { L: 15, H: 9.5, th: 9, hr: 9, leg: 11, lw: 3, wing: 'shell', horn: 'stag', ant: 'short', wide: 1 }, { fur: '#2e2422', shell: '#3a2a26', horn: '#5a3a2e' }],
    dungbeetle: [1.4, { L: 12, H: 10.5, th: 8, hr: 7.5, leg: 10, lw: 3, wing: 'shell', ant: 'short', ball: 12 }, { fur: '#26242b', shell: '#2e2a30', ballCol: '#7a5a3a' }],
    firefly: [1.35, { L: 15, H: 6.5, th: 6.5, hr: 7, leg: 9, wing: 'shell', ant: 'elbow', glow: 1 }, { fur: '#3a3438', shell: '#3a3438', thorax: '#e8603c', headCol: '#e8603c' }],
    longhorn: [1.5, { L: 18, H: 7, th: 7, hr: 7.5, leg: 12, wing: 'shell', ant: 'long', antLen: 44 }, { fur: '#2b2620', shell: '#2b2620', spots: '#f1f1f1' }],
    weevil: [1.4, { L: 13, H: 10, th: 7.5, hr: 7.5, leg: 10, wing: 'shell', ant: 'elbow', snout: 1 }, { fur: '#8a7a6a', shell: '#9a8a78', shell2: '#6b5a4a' }],
    tigerbeetle: [1.4, { L: 14, H: 7, th: 6.5, hr: 8, leg: 16, lw: 2, wing: 'shell', ant: 'long', antLen: 16, jaw: 1, eye: 0.42 }, { fur: '#1f7a4a', shell: '#2fa86a', spots: '#fff3c4' }],
    bombardier: [1.4, { L: 14, H: 8.5, th: 6.5, hr: 7.5, leg: 12, wing: 'shell', ant: 'long', antLen: 16 }, { fur: '#e8853a', shell: '#2f3a5a', headCol: '#e8853a' }],
    jewelbeetle: [1.45, { L: 17, H: 7.5, th: 7, hr: 7.5, leg: 10, wing: 'shell', ant: 'short' }, { fur: '#1fa87a', shell: '#2fc28a', shell2: '#e8603c' }],
    divingbeetle: [1.45, { L: 15, H: 9, th: 8, hr: 7.5, leg: 11, lw: 3.2, wing: 'shell', ant: 'short', wide: 1 }, { fur: '#2e3a2e', shell: '#3a4a3a', shell2: '#d9c24a' }],
    strider: [1.35, { L: 16, H: 3, th: 4.5, hr: 5.5, leg: 22, lw: 1.5, spread: 1.35, ant: 'short' }, { fur: '#5a5248', plain: 1 }],
    waterbug: [1.55, { L: 17, H: 7.5, th: 8.5, hr: 7.5, leg: 12, lw: 2.8, raptor: 1, ant: 'short', wide: 1 }, { fur: '#7a5f3a', fur2: '#a8875a' }],
    cicada: [1.5, { L: 15, H: 8.5, th: 9.5, hr: 9, leg: 9, wing: 'fly', ant: 'short', wide: 1, eye: 0.36, ws: 30 }, { fur: '#3a4a3a', fur2: '#c9b88a', eyeCol: '#e8603c' }],
    stinkbug: [1.4, { L: 13, H: 8.5, th: 9, hr: 6.5, leg: 10, wing: 'shell', ant: 'long', antLen: 14, wide: 1 }, { fur: '#5a8a3a', shell: '#6fa84a', shell2: '#4a7a2e' }],
    cockroach: [1.45, { L: 18, H: 6.5, th: 8, hr: 7, leg: 13, wing: 'shell', ant: 'long', antLen: 36, wide: 1 }, { fur: '#6b3a1e', shell: '#8a4f2a' }],
    earwig: [1.4, { L: 19, H: 5, th: 6, hr: 7, leg: 10, ant: 'long', antLen: 16, pincer: 1 }, { fur: '#7a3a26', fur2: '#c9853a', stripes: '#5a2a1a' }],
    antlion: [1.45, { L: 15, H: 11, th: 8, hr: 8, leg: 9, lw: 3, ant: 'short', jaw: 2.2 }, { fur: '#9a8a72', fur2: '#c9bca0' }],
    froghopper: [1.2, { L: 12, H: 8, th: 7.5, hr: 8, leg: 12, hind: 1, wing: 'shell', ant: 'short' }, { fur: '#6b5238', shell: '#8a6f4a', shell2: '#c9b08a' }],
    aphid: [1.15, { L: 12, H: 10, th: 6, hr: 7, leg: 10, lw: 1.8, ant: 'long', antLen: 14, tubes: 1 }, { fur: '#9fd45a', fur2: '#d9f0a8' }]
  };
  Object.keys(BUGS).forEach(function (id) { T[id] = ['bug', BUGS[id][0], BUGS[id][1]]; SPEC[id] = BUGS[id][2]; });
  var PLANS = { quad: planQuad, biped: planBiped, bird: planBird, fish: planFish, serpent: planSerpent, crust: planCrust, tent: planTent, star: planStar, seahorse: planSeahorse, frog: planFrog, bug: planBug };
  function pivotOf(row) {
    var P = row[2];
    switch (row[0]) {
      case 'quad': return P.leg * 0.7 + P.H * 0.5;
      case 'biped': return (P.leg || 34) + 8;
      case 'bird': return (P.leg || 14) * (P.flyer ? 0.5 : 1) + (P.up ? (P.bl || 38) * 0.42 : (P.bh || 26) * 0.5) + (P.flyer ? 24 : 0);
      case 'fish': return (P.H || 28) * 0.5 + (P.seal ? 2 : 15);
      case 'serpent': return 9;
      case 'crust': return 16;
      case 'bug': return (P.leg || 13) * 0.8 + Math.max(P.th || 8, P.H || 10) * 0.55 + (P.hover ? (P.hov || 15) : 0);
      default: return 32;
    }
  }

  // 그리기 본체. 돌려주는 값 : 화면 좌표의 머리 자리와 꼭대기
  function draw(ctx, id, o) {
    c = ctx;
    var sp = SPEC[id] || SPEC.dog, row = T[id] || T.dog, S = (o.s || 1) * row[1], pose = o.pose || 'run', t = o.t || 0;
    var G = { id: id, sp: sp, P: row[2], plan: row[0], t: t, ph: o.phase || 0, amp: 1, eyes: o.eyes || 'open', mouth: o.mouth || '', boost: !!o.boost, hop: !!o.hop,
      fly: false, tuck: 0, headDip: 0, stretch: false, num: o.num, color: o.color, rot: 0, body: sp.bodyCol || sp.fur, head: sp.fur, belly: sp.belly || null };
    var rot = 0, dx = 0, dy = 0, sq = 1;
    switch (pose) {
      case 'idle': case 'spray': G.amp = 0; sq = 1 + Math.sin(t * 2.6) * 0.012; break;
      case 'ready': G.amp = 0; G.tuck = 0.18; G.headDip = 0.1; break;
      case 'cheer': G.amp = 0; dy = -Math.abs(Math.sin(t * 7)) * 12; if (!o.eyes) G.eyes = 'happy'; if (!o.mouth) G.mouth = 'open'; break;
      case 'sad': G.amp = 0; G.headDip = 0.45; if (!o.eyes) G.eyes = 'sad'; break;
      case 'dizzy': G.amp = 0.2; rot = Math.sin(t * 8) * 0.14; if (!o.eyes) G.eyes = 'x'; break;
      case 'zap': G.amp = 0; dx = Math.sin(t * 70) * 2.5; if (!o.eyes) G.eyes = 'wide'; if (!o.mouth) G.mouth = 'o'; break;
      case 'spin': G.amp = 0.3; rot = t * 11; if (!o.eyes) G.eyes = 'x'; break;
      case 'trip': G.amp = 0.5; G.ph = t * 14; rot = PI * 0.95 + Math.sin(t * 6) * 0.08; if (!o.eyes) G.eyes = 'x'; break;
      case 'sleep': G.amp = 0; G.tuck = 1; G.headDip = 0.5; G.eyes = 'closed'; break;
      case 'eat': G.amp = 0; G.headDip = 0.5 + Math.sin(t * 10) * 0.18; break;
      case 'slide': G.amp = 0.12; G.tuck = 0.85; rot = 0.08; break;
      case 'roll': case 'shell': G.amp = 0; G.tuck = 1; G.headDip = 0.6; rot = (o.phase || t * 12) * 0.9; break;
      case 'jump': G.amp = 0; G.stretch = true; rot = -0.28 + 0.56 * (o.prog == null ? 0.5 : o.prog); break;
      case 'fly': G.amp = 0.3; G.fly = true; G.stretch = true; rot = -0.08 + Math.sin(t * 5) * 0.04; break;
      case 'lift': G.amp = 0.5; G.ph = t * 9; rot = Math.sin(t * 5) * 0.2; if (!o.eyes) G.eyes = 'wide'; break;
      default: break;
    }
    G.rot = rot;
    var pv = pivotOf(row) * (1 - G.tuck * 0.3);
    c.save(); c.translate(o.x + dx * S, o.y + dy * S); c.scale(S, S * sq);
    if (rot) { c.translate(0, -pv); c.rotate(rot); c.translate(0, pv); }
    var res = PLANS[row[0]](G);
    c.restore();
    var hx = res.hx, hy = res.hy;
    if (rot) { var cs = Math.cos(rot), sn = Math.sin(rot), ry = hy + pv; hy = -pv + hx * sn + ry * cs; hx = hx * cs - ry * sn; }
    return { hx: o.x + (hx + dx) * S, hy: o.y + (hy + dy) * S, top: o.y + (rot ? -pv * 2 : res.top + dy) * S, s: S, local: res, k: row[1] };
  }
  Art.drawAnimal = draw;

  // 재 보기 (얼굴 그림 · 카드 크기 맞춤에 쓴다)
  var MEAS = {}, scratch = null;
  function measure(id) {
    if (MEAS[id]) return MEAS[id];
    if (!scratch) scratch = root.document.createElement('canvas').getContext('2d');
    var keep = c, r = draw(scratch, id, { x: 0, y: 0, s: 1, t: 1, phase: 0, pose: 'idle' });
    c = keep;
    MEAS[id] = { hx: r.local.hx * r.k, hy: r.local.hy * r.k, hr: r.local.hr * r.k, top: r.local.top * r.k, len: (r.local.len || 60) * r.k };
    return MEAS[id];
  }
  Art.heightOf = function (id) { return Math.max(40, -measure(id).top + 6); };
  Art.lengthOf = function (id) { return measure(id).len; };
  // 얼굴 (머리를 크게, 동그랗게 잘라서)
  Art.drawFace = function (ctx, id, x, y, size, t, eyes) {
    // 머리 위치·크기는 '크기 배율을 뺀' 값으로 계산해야 큰 동물·작은 동물 모두 머리가 가운데에 온다
    var m = measure(id), sz = (T[id] || T.dog)[1], hr = m.hr / sz, k = size / (hr * 3.3);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y - size * 0.06, size * 0.56, 0, TAU); ctx.clip();
    draw(ctx, id, { x: x - (m.hx / sz + hr * 0.3) * k, y: y - size * 0.04 - m.hy / sz * k, s: k / sz, t: t || 1, phase: 0, pose: 'idle', eyes: eyes });
    ctx.restore();
  };
  Art.SPEC = SPEC; Art.PLAN = T; Art.OL = OL; Art.shade = shade;
  Art.LANE_COLORS = ["#ff5a5f","#ff9f1c","#f6c915","#3ecf8e","#19b8c9","#4d8df0","#9b5de5","#f062b0","#a0522d","#8fd14f","#0f7c6c","#1f4fa8","#c2185b","#7a8a99","#ffb3a7","#6a3fb5","#2e8b3d","#d4a017","#5ec8ff","#e07a5f","#b388eb","#3b3442"]; Art.LANE_TEXT = ["#fff","#fff","#4a3226","#fff","#fff","#fff","#fff","#fff","#fff","#4a3226","#fff","#fff","#fff","#fff","#4a3226","#fff","#fff","#fff","#4a3226","#fff","#fff","#fff"]; Art.MAX_LANES = 22;
})(typeof window !== 'undefined' ? window : globalThis);
