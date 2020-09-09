

function mainCanvas(p) {
    let im;
    p.preload = function() {
        im = p.loadImage("images/hbdemo.png", img => {
            HBSettings.HBImage = img;
            HBSettings.HBGraphic = p.createGraphics(img.width, img.height);
            HBSettings.HBGraphic.image(img,0,0);
        });
    }
    p.setup=function () {

        let can = p.createCanvas(HBSettings.getWidthSetting(),HBSettings.getHeightSetting());
        can.id('mainCanvas');
        let fi = p.createFileInput(p.handleHBSelect);
        fi.parent(document.getElementById('inputTarget'));
        HBSettings.changeX(parseInt(document.getElementById('xPos').value));
        HBSettings.changeY(parseInt(document.getElementById('yPos').value));
        HBSettings.frameCount = parseInt(document.getElementById('frameCount').value);
    }

    p.handleHBSelect =function(file) {
        if(file.type === 'image') {
            p.loadImage(file.data, img => {
                HBSettings.HBImage=img;
                HBSettings.HBGraphic = p.createGraphics(img.width, img.height);
                HBSettings.HBGraphic.image(img,0,0);
            });
        }
    }

    p.handleBGSelect =function(file) {
        p.loadImage(file.data, img => {
            HBSettings.BGImage=img;
        });
    }

    p.draw=function() {
        if(HBSettings.height != p.height || HBSettings.width != p.width) {
            p.resizeCanvas(HBSettings.width, HBSettings.height);
        }
        if(HBSettings.generating) return;
        p.background(0);
        let pg = p.createGraphics(p.width,p.height);
        drawframe(pg, p.frameCount%HBSettings.frameCount);
        p.image(pg,0,0);
        pg.remove();
    }

    p.mousePressed = function() {
        
    }
}
var mc = new p5(mainCanvas,'canvasDiv');

function drawframe(sketch, frame) {
    sketch.push();
    sketch.translate(HBSettings.XPos,HBSettings.YPos); // center graphic
    applytransforms(sketch,frame);
    sketch.pop();
}

function scaleByFunction(num,dur,delay,power,phaseshift) {
    return num>=delay?Math.pow((num+phaseshift-delay)/((dur-1)-delay),power):0;
}

function applytransforms(sketch,frame) {
    if (HBSettings.drop) sketch.translate(0,scaleByFunction(frame,HBSettings.frameCount,HBSettings.dropDelay,HBSettings.dropPower,HBSettings.dropPhase)*HBSettings.dropAmount);
    if(HBSettings.rotate) sketch.rotate(scaleByFunction(frame,HBSettings.frameCount,HBSettings.rotateDelay,HBSettings.rotatePower,HBSettings.rotatePhase)*(sketch.TWO_PI*(HBSettings.rotateAngle/360.0)));
    if(HBSettings.fade) sketch.tint(255,255-scaleByFunction(frame,HBSettings.frameCount,HBSettings.fadeDelay,HBSettings.fadePower,HBSettings.fadePhase)*255);
    if(HBSettings.shrink) sketch.scale(1-scaleByFunction(frame,HBSettings.frameCount,HBSettings.shrinkDelay,HBSettings.shrinkPower,HBSettings.shrinkPhase));
    sketch.image(HBSettings.HBGraphic,-HBSettings.HBGraphic.width/2,-HBSettings.HBGraphic.height/2);
    if(HBSettings.blur) sketch.filter(sketch.BLUR,scaleByFunction(frame,HBSettings.frameCount,HBSettings.blurDelay,HBSettings.blurPower,HBSettings.blurPhase)*HBSettings.blurRadius);
}

function tempCanvas(p) {
    p.setup = function() {
        let can = p.createCanvas(HBSettings.width,HBSettings.height);
        can.id('hiddenCanvas');
    }

    p.drawChar= function(c) {;
    }
}

function recursiveGenerate(zb,i) {
    var pc = new p5(tempCanvas,'hiddenCanvas');
    let canv = document.getElementById('hiddenCanvas');
    drawframe(pc, i);
    canv.toBlob(function(blob) {
        var end = HBSettings.hdfiles? "@2x.png":".png";
        zb.add("hit"+HBSettings.hbstring+"-"+i+end,blob);
        pc.remove();
        if(i < HBSettings.frameCount-1) {
            recursiveGenerate(zb,i+1);
        } else {
            zb.save();
            
        }
    });
}

function generatePngs() {
    HBSettings.generating = true;
    let zb = new ZipBuilder();
    recursiveGenerate(zb,0);
}


class ZipBuilder {
    constructor() {
        this.jz = new JSZip();
    }

    setBlob(blob) {
        this.b = blob;
    }

    addMultiple(names,b) {
        names.forEach(element => {
            this.add(element,b);
        });
    }

    add(name,b) {
        this.setBlob(b);
        this.jz.file(name,this.b);
    }

    save() {            
        this.jz.generateAsync({type:"blob"}).then(
        function(blob) {
            saveAs(blob,"hitbursts.zip");
            HBSettings.generating=false;
        }, function(err) {
            console.log(err);
            HBSettings.generating=false;
        });

    }
}

class HBSettings {
    constructor(pg) {
        this.HBGraphic = pg
    }
    static HBImage;
    static BGImage;
    static width;
    static height;
    static YPos = 50;
    static XPos = 50;
    static frameCount;
    static generating = false;
    static hbTransforms = new Array();
    static shrink = true;
    static shrinkDelay = 0;
    static shrinkPhase = 0;
    static shrinkPower=2;
    static drop = false;
    static dropDelay = 0;
    static dropAmount = 30;
    static dropPhase = 0;
    static dropPower=2;
    static blur = false;
    static blurDelay = 0;
    static blurRadius= 5;
    static blurPhase = 0;
    static blurPower=2;
    static fade = false;
    static fadeDelay = 0;
    static fadePhase = 0;
    static fadePower=2;
    static rotate = false;
    static rotateDelay = 0;
    static rotateAngle = 360;
    static rotatePhase=0;
    static rotatePower=2;
    static hbstring = "0";
    static hdfiles = true;
    

    getY() {
        return HBSettings.YPos;
    }

    getX() {
        return HBSettings.XPos;
    }

    static toggle2x(checked) {
        HBSettings.hdfiles = checked;
    }

    static changeHitburst(s) {
        HBSettings.hbstring = s;
    }

    static changeX(x) {
        HBSettings.XPos = x;
    }

    static changeY(y) {
        HBSettings.YPos=y;
    }

    static toggleShrink(checked) {
        HBSettings.shrink = checked;
    }

    static changeShrinkDelay(x) {
        HBSettings.shrinkDelay = x;
    }

    static toggleDrop(checked) {
        HBSettings.drop = checked;
    }

    static changeDropDelay(x) {
        HBSettings.dropDelay = x;
    }

    static changeDropAmount(x) {
        HBSettings.dropAmount = x;
    }

    static toggleBlur(checked) {
        HBSettings.blur = checked;
    }

    static changeBlurDelay(x) {
        HBSettings.blurDelay = x;
    }

    static changeBlurRadius(x) {
        HBSettings.blurRadius = x;
    }

    static toggleFade(checked) {
        HBSettings.fade = checked;
    }

    static changeFadeDelay(x) {
        HBSettings.fadeDelay = x;
    }

    static toggleRotate(checked) {
        HBSettings.rotate = checked;
    }

    static changeRotateDelay(x) {
        HBSettings.rotateDelay = x;
    }

    static changeRotateAngle(x) {
        HBSettings.rotateAngle = x;
    }

    static changeFrameCount(f) {
        HBSettings.frameCount = f;
    }

    static changeWidth(x) {
        HBSettings.width = x;
    }
    
    static changeHeight(x) {
        HBSettings.height = x;
    }

    static getHeightSetting() {
        HBSettings.height = parseInt(document.getElementById('hbHeight').value);
        return HBSettings.height;
    }

    static getWidthSetting() {
        HBSettings.width = parseInt(document.getElementById('hbWidth').value);
        return HBSettings.width;
    }

    static getCharYSetting() {
        return parseInt(document.getElementById('yPos').value);
    }

    static getCharXSetting() {
        return parseInt(document.getElementById('xPos').value);
    }

    static twoXChecked() {
        return document.getElementById('2xoption').checked;
    }
}

