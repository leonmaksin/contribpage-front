let crystalCores = []
const psizex = document.documentElement.clientWidth;
const psizey = document.documentElement.clientHeight;
let grid = 10;
let stepSync = 1;
let speed = 1;
let color = 75;

class crystalCore {
  constructor(x,y,color,size) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
  }
  
  plotCenter(x,y) {
    stroke(this.color);
    strokeWeight(this.size);
    point(this.x,this.y);
  }
}

function setup() {
  createCanvas(psizex,psizey);
  colorMode(HSB,100);
  background(25,25,50);
  itemList.map((item) => {
    const coordx = item.coordx.toNumber();
    const coordy = item.coordy.toNumber();
    const color = item.color;
    const size = item.size;
    // const owner = item.owner.toString();

    let newCore = new crystalCore(coordx,coordy,color,size);
    newCore.plotCenter();
  });
}
