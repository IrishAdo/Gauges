var Gauge = {
	list: [],
	idCounter:-1,
	factory:null,
	//	since we are not doing a 360 degree graph we will use 270
	singleDegree: 270 / 100,
	// register a canvas element as a Gauge
	isCanvasSupported:function (){
	  var elem = document.createElement('canvas');
	  try{
	  	var path = new Path2D();
	  } catch(exception){
	  	return false;
	  }
	  return !!(elem.getContext && elem.getContext('2d'));
	},
	register: function(obj) {
		var el = obj;
		if (!obj.id) {
			var id = 'Gauge'+Gauge.idCounter++;
		} else {
			var id = obj.id+'Element';
		}
		if(Gauge.isCanvasSupported() == false){
			Gauge.factoryObject = Gauge.Factory.SVG;
			el.innerHTML ="<svg id='"+id+"' width='"+el.getAttribute('width')+"' height='"+el.getAttribute('height')+"'></svg>";
		} else {
			Gauge.factoryObject = Gauge.Factory.Canvas;
			el.innerHTML ="<canvas id='"+id+"' width='"+el.getAttribute('width')+"' height='"+el.getAttribute('height')+"'></canvas>";
		}

		Gauge.list[id] = {
			id: id,
			canvas: document.getElementById(id),
			set: [],
			labels: el.getAttribute('data-labels').split(','),
			colors: el.getAttribute('data-set-color').split(','),
			min: el.getAttribute('data-min') * 1,
			max: el.getAttribute('data-max') * 1,
			value: el.getAttribute('data-value') * 1,
			valuePercent: 0,
			valueType: el.getAttribute('data-valuetype'),
			label: el.getAttribute('data-label'),
			width: el.getAttribute('width').replace('px', '') * 1,
			height: el.getAttribute('height').replace('px', '') * 1,
			parent: el
		};

		var setData = el.getAttribute('data-set').split(',');
		var Dx = Gauge.list[id].max - Gauge.list[id].min;
		Gauge.CheckMinMaxValue(id);

		Gauge.list[id].valuePercent = ((Gauge.list[id].value / Dx) * 100);
		for (var index = 0; index < setData.length; index++) {
			if (setData[index] >= Gauge.list[id].min && setData[index] <= Gauge.list[id].max) {
				Gauge.list[id].set[Gauge.list[id].set.length] = (setData[index] / Dx) *	100;
			}
		}

	},
	CheckMinMaxValue: function(id) {
		if (Gauge.list[id].value < Gauge.list[id].min) {
			Gauge.list[id].value = Gauge.list[id].min;
		}
		if (Gauge.list[id].value > Gauge.list[id].max) {
			Gauge.list[id].value = Gauge.list[id].max;
		}
	},
	Redraw: function() {
		for (id in Gauge.list) {
			Gauge.list[id].value=Gauge.list[id].parent.getAttribute('data-value');
			Gauge.CheckMinMaxValue(id);
			var Dx = Gauge.list[id].max - Gauge.list[id].min;
			Gauge.list[id].valuePercent = ((Gauge.list[id].value / Dx) * 100);
			Gauge.Draw(id);
		}
	},
	DegreeToRadians: function(degrees) {
		if (degrees > 360) {
			degrees = Gauge.GetDegrees(degrees - 360);
		}
		return (Math.PI / 180) * (degrees % 360);
	},
	GetDegrees:function (degrees,mod){
		if(mod == undefined){
			mod=360;
		}
		if (degrees > mod) {
			return Gauge.GetDegrees(degrees - mod,mod);
		}
		return degrees;
	},
	Draw: function(id) {
		return Gauge.factoryObject.Draw(id);
	},
	DrawSegment: function(ctx, id, index) {
		return Gauge.factoryObject.DrawSegment(ctx, id, index);
	},
	DrawLabelsAndTicks: function(ctx, id) {
		return Gauge.factoryObject.DrawLabelsAndTicks(ctx, id);
	},
	OutlineGauge: function(ctx) {
		return Gauge.factoryObject.OutlineGauge(ctx);
	},
	DrawNeedle: function(ctx, degrees) {
		return Gauge.factoryObject.DrawNeedle(ctx, degrees);
	},
	Factory:{
		Canvas :{
			Draw: function(id) {
				var canvas = Gauge.list[id].canvas;
				if (canvas.getContext) {

					var ctx = canvas.getContext('2d');
					ctx.fillStyle = "#ffffff";
					ctx.translate(0, 0);
					ctx.fillRect(0, 0, Gauge.list[id].width, Gauge.list[id].height);
					ctx.save();

					ctx.lineWidth = 49;
					for (var index = 1; index < Gauge.list[id].set.length; index++) {
						Gauge.DrawSegment(ctx, id, index);
					}
					Gauge.OutlineGauge(ctx);
					Gauge.DrawNeedle(ctx, (45 + (Gauge.singleDegree * Gauge.list[id].valuePercent)));
					Gauge.DrawLabelsAndTicks(ctx, id);
				}

			},
			DrawSegment: function(ctx, id, index) {
				var path = new Path2D();
				ctx.strokeStyle = Gauge.list[id].colors[index - 1];
				var startDegrees = (135 + (Gauge.singleDegree * Gauge.list[id].set[index -1]));
				var endDegrees = (135 + (Gauge.singleDegree * Gauge.list[id].set[index]) + 0.5);
				path.arc(125, 125, 75, Gauge.DegreeToRadians(startDegrees), Gauge.DegreeToRadians(endDegrees), false); // Outer circle
				ctx.stroke(path);

			},
			DrawLabelsAndTicks: function(ctx, id) {
				var maxIndex = Gauge.list[id].labels.length;
				var stepPercentage = 100 / (maxIndex - 1);
				ctx.strokeStyle = "#000000";
				ctx.fillStyle = "#000000";
				ctx.lineWidth = 1;
				
				ctx.font="9px Verdana";
				for (var index = 0; index < maxIndex; index++) {
					ctx.save();
					var angle = Gauge.GetDegrees(45+ (Gauge.singleDegree * (stepPercentage * index)))
					var dx = (Math.cos(Gauge.DegreeToRadians(angle+90))*110);
					var dy = (Math.sin(Gauge.DegreeToRadians(angle+90))*110);
					
					ctx.textAlign="center"; 
					ctx.fillText(Gauge.list[id].labels[index], 125+dx,125+dy);
				
					// draw tick
					var path = new Path2D();
					path.moveTo(0, 90);
					path.lineTo(0, 100);
					ctx.translate(125, 125);
					ctx.rotate(Gauge.DegreeToRadians(angle));
					ctx.stroke(path);
					ctx.restore();
				}
				ctx.font="20px Verdana";
				ctx.textAlign="center"; 
				ctx.fillText(Gauge.list[id].parent.getAttribute('data-value')+Gauge.list[id].valueType, 125,200);
				ctx.font="15px Verdana";
				ctx.fillText(Gauge.list[id].label, 125,220);
			},
			OutlineGauge: function(ctx) {
				var path = new Path2D();
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = "rgba(0,0,0,1)";
				path.arc(125, 125, 100, Gauge.DegreeToRadians(135), Gauge.DegreeToRadians(45), false); // Outer circle
				path.arc(125, 125, 50, Gauge.DegreeToRadians(45), Gauge.DegreeToRadians(135),true); // Outer circle
				path.arc(125, 125, 100, Gauge.DegreeToRadians(135), Gauge.DegreeToRadians(135), true); // Outer circle
				ctx.stroke(path);
			},
			DrawNeedle: function(ctx, degrees) {
				ctx.save();
				ctx.strokeStyle = "rgba(0,0,0,1)";
				var path = new Path2D();
				path.arc(125, 125, 3, 0, Math.PI * 2, true);
				ctx.lineWidth = 3;
				ctx.stroke(path);
				ctx.restore();

				ctx.strokeStyle = "#000000";
				ctx.fillStyle = "#000000";
				ctx.lineWidth = 1;
				var path = new Path2D();
				path.moveTo(0, 80);
				path.lineTo(-4, 0);
				path.lineTo(4, 0);
				ctx.translate(125, 125);
				ctx.rotate((Math.PI / 180) * degrees);
				ctx.fill(path);
				ctx.restore();
			}
		},
		SVG :{
			Draw: function(id) {
				var buffer ='';
 				buffer += '<rect width="'+Gauge.list[id].width+'" height="'+Gauge.list[id].height+'" style="fill:rgb(255,255,255);" />';
				for (var index = 1; index < Gauge.list[id].set.length; index++) {
					buffer += Gauge.DrawSegment(id, index);
				}
				buffer += Gauge.OutlineGauge();
				buffer += Gauge.DrawNeedle(((Gauge.singleDegree * Gauge.list[id].valuePercent)));
				buffer += Gauge.DrawLabelsAndTicks(id);
				buffer ="<svg id='"+Gauge.list[id].id+"' width='"+Gauge.list[id].parent.getAttribute('width')+"' height='"+Gauge.list[id].parent.getAttribute('height')+"'>"+buffer+"</svg>";
				Gauge.list[id].parent.innerHTML =buffer; 
			},
			calcArc:function(startDegrees,endDegrees,radius){
				return {
					dx1 : Math.round(Math.cos(Gauge.DegreeToRadians(startDegrees+0))*radius),
					dy1 : Math.round(Math.sin(Gauge.DegreeToRadians(startDegrees+0))*radius),
					dx2 : Math.round(Math.cos(Gauge.DegreeToRadians(endDegrees+0))*radius),
					dy2 : Math.round(Math.sin(Gauge.DegreeToRadians(endDegrees+0))*radius)
				};
			},
			DrawSegment: function(id, index) {
				var startDegrees = (135 + (Gauge.singleDegree * Gauge.list[id].set[index -1]));
				var endDegrees = (135 + (Gauge.singleDegree * Gauge.list[id].set[index]));
				var radius =  75;
				var data = Gauge.Factory.SVG.calcArc(startDegrees,endDegrees,radius);
				return '<path d="M0,0 m'+Math.round(125+data.dx1)+','+Math.round(125+data.dy1)+' a '+radius+','+radius+' 0 0,1 '+(data.dx2-data.dx1)+' '+(data.dy2-data.dy1)+' "  stroke="'+Gauge.list[id].colors[index - 1]+'" stroke-width="50" fill="none"></path>'
			},
			DrawLabelsAndTicks: function(id) {
				var maxIndex = Gauge.list[id].labels.length;
				var stepPercentage = 100 / (maxIndex - 1);
				var buffer ='';

				for (var index = 0; index < maxIndex; index++) {
					var angle = Gauge.GetDegrees(45+(Gauge.singleDegree * (stepPercentage * index)))
					var dx = (Math.cos(Gauge.DegreeToRadians(angle+90))*110);
					var dy = (Math.sin(Gauge.DegreeToRadians(angle+90))*110);
					buffer += '<text x="'+(125+dx)+'" y="'+(125+dy)+'" font-family="Verdana" font-size="8" text-anchor="middle">'+Gauge.list[id].labels[index]+'</text>';
					var lx1 = (Math.cos(Gauge.DegreeToRadians(angle+90))*100);
					var ly1 = (Math.sin(Gauge.DegreeToRadians(angle+90))*100);
					var lx2 = (Math.cos(Gauge.DegreeToRadians(angle+90))*90);
					var ly2 = (Math.sin(Gauge.DegreeToRadians(angle+90))*90);
					buffer +='<line x1="'+(125+lx1)+'" y1="'+(125+ly1)+'" x2="'+(125+lx2)+'" y2="'+(125+ly2)+'" stroke="black" stroke-width="1"/>';
				}
				buffer += '<text x="125" y="200" font-family="Verdana" font-size="20" text-anchor="middle">'+Gauge.list[id].parent.getAttribute('data-value')+Gauge.list[id].valueType+'</text>';
				buffer += '<text x="125" y="220" font-family="Verdana" font-size="15" text-anchor="middle">'+Gauge.list[id].label+'</text>';
				return buffer;
			},
			OutlineGauge: function() {

				var startDegrees = (135 + (Gauge.singleDegree * Gauge.list[id].set[0]));
				var endDegrees = (135 + (Gauge.singleDegree * Gauge.list[id].set[Gauge.list[id].set.length-1]));
				var radiusInside = 50;
				var radiusOutSide = 100;
				var dataOutside = Gauge.Factory.SVG.calcArc(startDegrees,endDegrees,radiusOutSide);
				var dataInside = Gauge.Factory.SVG.calcArc(startDegrees,endDegrees,radiusInside);
				
				var buffer = '<path d="M0,0 m'+Math.round(125+dataOutside.dx1)+','+Math.round(125+dataOutside.dy1);
				buffer += ' L'+Math.round(125+dataInside.dx1)+','+Math.round(125+dataInside.dy1);
				// inside arc
				buffer += ' a'+radiusInside+','+radiusInside+' 0 1,1 '+(dataInside.dx2-dataInside.dx1)+' '+(dataInside.dy2-dataInside.dy1);
				// line to outside arc
				buffer += ' L'+Math.round(125+dataOutside.dx2)+','+Math.round(125+dataOutside.dy2);
				// outside arc
				buffer += ' M 0,0 m'+Math.round(125+dataOutside.dx1)+','+Math.round(125+dataOutside.dy1)+' a'+radiusOutSide+','+radiusOutSide
				buffer += ' 0 1,1 '+(dataOutside.dx2-dataOutside.dx1)+' '+(dataOutside.dy2-dataOutside.dy1);
				buffer += ' "  stroke="black" stroke-width="1.5" fill="none"></path>';
				return buffer;
			},
			DrawNeedle: function(degrees) {
				var radius = 9;
				var data = Gauge.Factory.SVG.calcArc(degrees,0,radius);
				var buffer = '<circle cx="125" cy="125" r="5" style="stroke:#333; fill:#333"/>';
				buffer += '<path d="M125,120 L50,125 L125,130 z" ';
				buffer += ' transform="rotate('+(degrees-45)+',125,125)" stroke="#333" stroke-width="1" fill="#333"></path>';
				return buffer;
			}
		}
	}
}
