import React from "react";
import Sketch from "react-p5";
import perlinNoise3d from 'perlin-noise-3d';

var crystalList = [];
const noise = new perlinNoise3d();

const HEXtoHSB = (hex) => {
  var aRgbHex = hex.slice(1).match(/.{1,2}/g);
  let r = parseInt(aRgbHex[0], 16)/255;
  let g = parseInt(aRgbHex[1], 16)/255;
  let b = parseInt(aRgbHex[2], 16)/255;
  const v = Math.max(r, g, b);
  const n = v - Math.min(r, g, b);
  const h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
  let HSB = [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
  return HSB;
};

class noiseCrystal {
  constructor(p5,x,y,z,size,color) {
    this.xcoord = x;
    this.ycoord = y;
    this.zcoord = z;
    this.scalar = size;
    this.color = HEXtoHSB(color);
    this.verts = [];
    this.orig = [];
    this.tris = [];
    this.offx = 3*Math.random();
    this.offy = 3*Math.random();
    this.offz = 3*Math.random();
    this.reset(p5);
  }

  reset(p5) {
    var t = (1.0 + Math.sqrt(5.0)) / 2.0;
  
    this.addVert(p5,p5.createVector(-1, t, 0));
    this.addVert(p5,p5.createVector( 1, t, 0));
    this.addVert(p5,p5.createVector(-1, -t, 0));
    this.addVert(p5,p5.createVector( 1, -t, 0));
  
    this.addVert(p5,p5.createVector( 0, -1, t));
    this.addVert(p5,p5.createVector( 0, 1, t));
    this.addVert(p5,p5.createVector( 0, -1, -t));
    this.addVert(p5,p5.createVector( 0, 1, -t));
  
    this.addVert(p5,p5.createVector( t, 0, -1));
    this.addVert(p5,p5.createVector( t, 0, 1));
    this.addVert(p5,p5.createVector(-t, 0, -1));
    this.addVert(p5,p5.createVector(-t, 0, 1));
  
    this.addTri(p5,0, 11, 5);
    this.addTri(p5,0, 5, 1);
    this.addTri(p5,0, 1, 7);
    this.addTri(p5,0, 7, 10);
    this.addTri(p5,0, 10, 11);
  
    //5 adjacent faces 
    this.addTri(p5,1, 5, 9);
    this.addTri(p5,5, 11, 4);
    this.addTri(p5,11, 10, 2);
    this.addTri(p5,10, 7, 6);
    this.addTri(p5,7, 1, 8);
  
    // 5 faces around point 3
    this.addTri(p5,3, 9, 4);
    this.addTri(p5,3, 4, 2);
    this.addTri(p5,3, 2, 6);
    this.addTri(p5,3, 6, 8);
    this.addTri(p5,3, 8, 9);
  
    // 5 adjacent faces 
    this.addTri(p5,4, 9, 5);
    this.addTri(p5,2, 4, 11);
    this.addTri(p5,6, 2, 10);
    this.addTri(p5,8, 6, 7);
    this.addTri(p5,9, 8, 1);
  }

  addVert(p5,p) {
    var m = 1;
    var length = ((p.x**2+p.y**2+p.z**2)**0.5) * noise.get( p.x*m + this.offx, p.y*m + this.offy,  p.z*m + this.offz  );
    this.verts.push(p5.createVector(p.x/length, p.y/length, p.z/length));
    //this.verts.push(p5.createVector(p.x*length, p.y*length, p.z*length));
  }
  
  addTri(p5, A, B, C) {
    this.tris.push(p5.createVector(A, B, C));
  }
  
  getMiddlePoint(p5, p1, p2) {
  
    var point1 = this.verts[p1];
    var point2 = this.verts[p2];
    var middle = p5.createVector(
    (point1.x + point2.x) / 2.0, 
    (point1.y + point2.y) / 2.0, 
    (point1.z + point2.z) / 2.0);

    this.addVert(p5,middle);
  
    return this.verts.length-1;
  }
  
  refine(p5) {
    // refine triangles
    for (var i = 0; i < 1; i++) {
      var tris2 = [];
      for (var j=0; j<this.tris.length; j++) {
        var tri = this.tris[j];
  
        // replace triangle by 4 triangles
        var a = this.getMiddlePoint( p5, parseInt(tri.x), parseInt(tri.y) );
        var b = this.getMiddlePoint( p5, parseInt(tri.y), parseInt(tri.z) );
        var c = this.getMiddlePoint( p5, parseInt(tri.z), parseInt(tri.x) );
  
        tris2.push(p5.createVector(tri.x, a, c));
        tris2.push(p5.createVector(tri.y, b, a));
        tris2.push(p5.createVector(tri.z, c, b));
        tris2.push(p5.createVector(a, b, c));
      }
      this.tris = tris2;
    }
  }

  drawTris(p5) {
  
    for (var i=0; i<this.tris.length; i++) {
  
      var tri = this.tris[i];
      var a, b, c;
  
      a = this.verts[parseInt(tri.x)];
      b = this.verts[parseInt(tri.y)];
      c = this.verts[parseInt(tri.z)];
  
      p5.beginShape(p5.TESS);
  
      p5.fill(this.color[0], this.color[1] + 10 - Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z)*10, this.color[2]);

      p5.vertex(a.x*this.scalar+this.xcoord, a.y*this.scalar+this.ycoord, a.z*this.scalar+this.zcoord);
      p5.vertex(b.x*this.scalar+this.xcoord, b.y*this.scalar+this.ycoord, b.z*this.scalar+this.zcoord);
      p5.vertex(c.x*this.scalar+this.xcoord, c.y*this.scalar+this.ycoord, c.z*this.scalar+this.zcoord);
  
      p5.endShape(p5.CLOSE);
    }
  }
}

// function mouseMoved() {
//   //camera1.arc(radians(mouseY - pmouseY));
//   //camera1.circle(radians(1));
//   //camera1.look(radians(mouseX - pmouseX) / 2.0, radians(mouseY - pmouseY) / 2.0);
//   //camera1.tumble(radians(mouseX - pmouseX), radians(mouseY - pmouseY));
// }

const CrystalMap = (props) => {
  const crystalListProps = props.itemListProp;
  const psizex = document.documentElement.clientWidth*0.8;
  const psizey = 600;

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(psizex, psizey, p5.WEBGL).parent(canvasParentRef);
    noise.noiseSeed(p5.millis());

    // let newCrystal = new noiseCrystal(p5,0,0,0,20,'#e19ef5');
    // crystalList.push(newCrystal);

    crystalListProps.map((item) => {
      const size = item.size.toNumber();
      if (size > 50) return;
      const coordx = item.coordx.toNumber()-psizex/2;
      const coordy = item.coordy.toNumber()-psizey/2;
      const color = item.color;
      let newCrystal = new noiseCrystal(p5,coordx,coordy,0,size,color);
      crystalList.push(newCrystal);
    });

    for (let i=0; i<3; ++i) {
      crystalList.forEach(crystal => {
        crystal.refine(p5);
      });
    }

    p5.colorMode(p5.HSB, 360, 100, 100);
    p5.background(HEXtoHSB('#8D818C'));
    p5.normalMaterial();
    crystalList.forEach(crystal => crystal.drawTris(p5));
  }

  // function mouseClicked() {
  //   normalMaterial();
  //   crystalList.forEach(crystal => {
  //     crystal.refine();
  //     crystal.drawTris();
  //   });
  // }

  const draw = (p5) => {
    // orbitControl();

    // p5.background(HEXtoHSB('#8A9994'));
    // p5.normalMaterial();
    // crystalList.forEach(crystal => crystal.drawTris());

    // const camDist = (height/2)/ tan(PI/6);
    // let camX = camDist*cos(map(mouseX,0,width,0,2*PI));
    // let camY = camDist*sin(map(mouseY,height,0,0,2*PI));
    // let camZ = (camDist**2 - camX**2 - camY**2)**0.5;
    // camera(camX,camY,camZ);
    // const eyeZ = ((height/2) / tan(PI/6));
    // perspective(PI/3, width/height, 0.01, eyeZ*1000);
  }

	return <Sketch setup={setup} draw={draw} />;
}

export default CrystalMap;