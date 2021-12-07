import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";

let crystalCores = [];

class crystalPoint {
	constructor(p5,x,y,distance) {
		this.x = x;
		this.y = y;
		this.distance = distance;
	}

	plot(p5,color) {
		p5.stroke(color);
		p5.strokeWeight(1);
		p5.point(this.x,this.y);
	}
}

class crystalCore {
	constructor(p5,x,y,color,size) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.size = size;
		this.activePoints = [new crystalPoint(p5,x,y,0)];
	}
	
	plotCenter(p5) {
		p5.stroke(this.color);
		p5.strokeWeight(this.size);
		p5.point(this.x,this.y);
	}
}

const addCrystal = (p5,item) => {
	const coordx = item.coordx.toNumber();
	const coordy = item.coordy.toNumber();
	const color = item.color;
	const size = item.size;
	let newCore = new crystalCore(p5,coordx,coordy,color,size);
	crystalCores.push(newCore);
	// newCore.plotCenter(p5);
}

const CrystalMap = (props) => {
	const crystalList = props.itemListProp;
	const psizex = document.documentElement.clientWidth;
	const psizey = document.documentElement.clientHeight;

	const setup = (p5, canvasParentRef) => {
		// use parent to render the canvas in this ref
		// (without that p5 will render the canvas outside of your component)
		p5.createCanvas(psizex*0.8, 500).parent(canvasParentRef);
		p5.colorMode(p5.HSB,100);
		p5.background(40,25,50);
		crystalList.map((item) => {
			addCrystal(p5,item);
		});
	};

	const draw = (p5) => {
		crystalCores.forEach (core => {
			const oldActive = core.activePoints;
			let newActive = [];
			oldActive.forEach (point => {
				if (point.distance > core.size) return;
				const travel = point.distance%4-1;
				const multiplier = (((point.distance%9)/5)*2)-1;
				for (let i=0; i<1; ++i) {
					let newPoint = new crystalPoint(p5,point.x+travel,point.y+travel*multiplier,point.distance+0.2);
					newPoint.plot(p5,core.color);
					newActive.push(newPoint);
				}
			});
			core.activePoints = newActive;
		});
	};

	return <Sketch setup={setup} draw={draw} />;
};

export default CrystalMap
