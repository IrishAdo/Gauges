var Guage = {
	list: [],
	idCounter:-1,
	factory:null,
	//	since we are not doing a 360 degree graph we will use 270
	singleDegree: 270 / 100,
	// register a canvas element as a Guage
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
			var id = 'Guage'+Guage.idCounter++;
		} else {
			var id = obj.id+'Element';
		}
		if(Guage.isCanvasSupported() == false){
			Guage.factoryObject = Guage.Factory.SVG;
			el.innerHTML ="<svg id='"+id+"' width='"+el.getAttribute('width')+"' height='"+el.getAttribute('height')+"'></svg>";
		} else {
			Guage.factoryObject = Guage.Factory.Canvas;
			el.innerHTML ="<canvas id='"+id+"' width='"+el.getAttribute('width')+"' height='"+el.getAttribute('height')+"'></canvas>";
		}

		Guage.list[id] = {
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
			parent:el,
		};

		var setData = el.getAttribute('data-set').split(',');
		var Dx = Guage.list[id].max - Guage.list[id].min;
		Guage.CheckMinMaxValue(id);

		Guage.list[id].valuePercent = ((Guage.list[id].value / Dx) * 100);
		for (var index = 0; index < setData.length; index++) {
			if (setData[index] >= Guage.list[id].min && setData[index] <= Guage.list[id].max) {
				Guage.list[id].set[Guage.list[id].set.length] = (setData[index] / Dx) *	100;
			}
		}

	},
	CheckMinMaxValue: function(id) {
		if (Guage.list[id].value < Guage.list[id].min) {
			Guage.list[id].value = Guage.list[id].min;
		}
		if (Guage.list[id].value > Guage.list[id].max) {
			Guage.list[id].value = Guage.list[id].max;
		}
	},
	Redraw: function() {
		for (id in Guage.list) {
			Guage.list[id].value=Guage.list[id].parent.getAttribute('data-value');
			Guage.CheckMinMaxValue(id);
			var Dx = Guage.list[id].max - Guage.list[id].min;
			Guage.list[id].valuePercent = ((Guage.list[id].value / Dx) * 100);
			Guage.Draw(id);
		}
	},
	DegreeToRadians: function(degrees) {
		if (degrees > 360) {
			degrees = Guage.GetDegrees(degrees - 360);
		}
		return (Math.PI / 180) * (degrees % 360);
	},
	GetDegrees:function (degrees,mod){
		if(mod == undefined){
			mod=360;
		}
		if (degrees > mod) {
			return Guage.GetDegrees(degrees - mod,mod);
		}
		return degrees;
	},
	Draw: function(id) {
		return Guage.factoryObject.Draw(id);
	},
	DrawSegment: function(ctx, id, index) {
		return Guage.factoryObject.DrawSegment(ctx, id, index);
	},
	DrawLabelsAndTicks: function(ctx, id) {
		return Guage.factoryObject.DrawLabelsAndTicks(ctx, id);
	},
	OutlineGuage: function(ctx) {
		return Guage.factoryObject.OutlineGuage(ctx);
	},
	DrawNeedle: function(ctx, degrees) {
		return Guage.factoryObject.DrawNeedle(ctx, degrees);
	},
	Factory:{
		Canvas :{
			Draw: function(id) {
				var canvas = Guage.list[id].canvas;
				if (canvas.getContext) {

					var ctx = canvas.getContext('2d');
					ctx.fillStyle = "#ffffff";
					ctx.translate(0, 0);
					ctx.fillRect(0, 0, Guage.list[id].width, Guage.list[id].height);
					ctx.save();

					ctx.lineWidth = 49;
					for (var index = 1; index < Guage.list[id].set.length; index++) {
						Guage.DrawSegment(ctx, id, index);
					}
					Guage.OutlineGuage(ctx);
					Guage.DrawNeedle(ctx, (45 + (Guage.singleDegree * Guage.list[id].valuePercent)));
					Guage.DrawLabelsAndTicks(ctx, id);
				}

			},
			DrawSegment: function(ctx, id, index) {
				var path = new Path2D();
				ctx.strokeStyle = Guage.list[id].colors[index - 1];
				var startDegrees = (135 + (Guage.singleDegree * Guage.list[id].set[index -
					1]));
				var endDegrees = (135 + (Guage.singleDegree * Guage.list[id].set[index]) +
					0.5);
				path.arc(125, 125, 75, Guage.DegreeToRadians(startDegrees), Guage.DegreeToRadians(
					endDegrees), false); // Outer circle
				ctx.stroke(path);

			},
			DrawLabelsAndTicks: function(ctx, id) {
				var maxIndex = Guage.list[id].labels.length;
				var stepPercentage = 100 / (maxIndex - 1);
				ctx.strokeStyle = "#000000";
				ctx.fillStyle = "#000000";
				ctx.lineWidth = 1;
				
				ctx.font="9px Verdana";
				for (var index = 0; index < maxIndex; index++) {
					ctx.save();
					var angle = Guage.GetDegrees(45+ (Guage.singleDegree * (stepPercentage * index)))
					var dx = (Math.cos(Guage.DegreeToRadians(angle+90))*110);
					var dy = (Math.sin(Guage.DegreeToRadians(angle+90))*110);
					
					ctx.textAlign="center"; 
					ctx.fillText(Guage.list[id].labels[index], 125+dx,125+dy);
				
					// draw tick
					var path = new Path2D();
					path.moveTo(0, 90);
					path.lineTo(0, 100);
					ctx.translate(125, 125);
					ctx.rotate(Guage.DegreeToRadians(angle));
					ctx.stroke(path);
					ctx.restore();
				}
				ctx.font="20px Verdana";
				ctx.textAlign="center"; 
				ctx.fillText(Guage.list[id].parent.getAttribute('data-value')+Guage.list[id].valueType, 125,200);
				ctx.font="15px Verdana";
				ctx.fillText(Guage.list[id].label, 125,220);
			},
			OutlineGuage: function(ctx) {
				var path = new Path2D();
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = "rgba(0,0,0,1)";
				path.arc(125, 125, 100, Guage.DegreeToRadians(135), Guage.DegreeToRadians(45), false); // Outer circle
				path.arc(125, 125, 50, Guage.DegreeToRadians(45), Guage.DegreeToRadians(135),true); // Outer circle
				path.arc(125, 125, 100, Guage.DegreeToRadians(135), Guage.DegreeToRadians(135), true); // Outer circle
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
 				buffer += '<rect width="'+Guage.list[id].width+'" height="'+Guage.list[id].height+'" style="fill:rgb(255,255,255);" />';
				for (var index = 1; index < Guage.list[id].set.length; index++) {
					buffer += Guage.DrawSegment(id, index);
				}
				buffer += Guage.OutlineGuage(null);
				buffer += Guage.DrawNeedle(null, ((Guage.singleDegree * Guage.list[id].valuePercent)));
				buffer += Guage.DrawLabelsAndTicks(null, id);
				buffer ="<svg id='"+Guage.list[id].id+"' width='"+Guage.list[id].parent.getAttribute('width')+"' height='"+Guage.list[id].parent.getAttribute('height')+"'>"+buffer+"</svg>";
				Guage.list[id].parent.innerHTML =buffer; 
				console.log(Guage.list[id].canvas.innerHTML)
				
			},
			calcArc:function(startDegrees,endDegrees,radius){
				return {
					dx1 : Math.round(Math.cos(Guage.DegreeToRadians(startDegrees+0))*radius),
					dy1 : Math.round(Math.sin(Guage.DegreeToRadians(startDegrees+0))*radius),
					dx2 : Math.round(Math.cos(Guage.DegreeToRadians(endDegrees+0))*radius),
					dy2 : Math.round(Math.sin(Guage.DegreeToRadians(endDegrees+0))*radius)
				};
			},
			DrawSegment: function(id, index) {
				var startDegrees = (135 + (Guage.singleDegree * Guage.list[id].set[index -1]));
				var endDegrees = (135 + (Guage.singleDegree * Guage.list[id].set[index]));
				var radius =  75;
				var data = Guage.Factory.SVG.calcArc(startDegrees,endDegrees,radius);
				return '<path d="M0,0 m'+Math.round(125+data.dx1)+','+Math.round(125+data.dy1)+' a '+radius+','+radius+' 0 0,1 '+(data.dx2-data.dx1)+' '+(data.dy2-data.dy1)+' "  stroke="'+Guage.list[id].colors[index - 1]+'" stroke-width="50" fill="none"></path>'
			},
			DrawLabelsAndTicks: function(ctx, id) {
				var maxIndex = Guage.list[id].labels.length;
				var stepPercentage = 100 / (maxIndex - 1);
				var buffer ='';

				for (var index = 0; index < maxIndex; index++) {
					var angle = Guage.GetDegrees(45+(Guage.singleDegree * (stepPercentage * index)))
					var dx = (Math.cos(Guage.DegreeToRadians(angle+90))*110);
					var dy = (Math.sin(Guage.DegreeToRadians(angle+90))*110);
					buffer += '<text x="'+(125+dx)+'" y="'+(125+dy)+'" font-family="Verdana" font-size="8" text-anchor="middle">'+Guage.list[id].labels[index]+'</text>';
					var lx1 = (Math.cos(Guage.DegreeToRadians(angle+90))*100);
					var ly1 = (Math.sin(Guage.DegreeToRadians(angle+90))*100);
					var lx2 = (Math.cos(Guage.DegreeToRadians(angle+90))*90);
					var ly2 = (Math.sin(Guage.DegreeToRadians(angle+90))*90);
					buffer +='<line x1="'+(125+lx1)+'" y1="'+(125+ly1)+'" x2="'+(125+lx2)+'" y2="'+(125+ly2)+'" stroke="black" stroke-width="1"/>';
				}
				buffer += '<text x="125" y="200" font-family="Verdana" font-size="20" text-anchor="middle">'+Guage.list[id].parent.getAttribute('data-value')+Guage.list[id].valueType+'</text>';
				buffer += '<text x="125" y="220" font-family="Verdana" font-size="15" text-anchor="middle">'+Guage.list[id].label+'</text>';
				return buffer;
			},
			OutlineGuage: function(ctx) {

				var startDegrees = (135 + (Guage.singleDegree * Guage.list[id].set[0]));
				var endDegrees = (135 + (Guage.singleDegree * Guage.list[id].set[Guage.list[id].set.length-1]));
				var radiusInside = 50;
				var radiusOutSide = 100;
				var dataOutside = Guage.Factory.SVG.calcArc(startDegrees,endDegrees,radiusOutSide);
				var dataInside = Guage.Factory.SVG.calcArc(startDegrees,endDegrees,radiusInside);
				
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
			DrawNeedle: function(ctx, degrees) {
				var radius = 9;
				var data = Guage.Factory.SVG.calcArc(degrees,0,radius);
				var buffer = '<circle cx="125" cy="125" r="5" style="stroke:#333; fill:#333"/>';
				buffer += '<path d="M125,120 L50,125 L125,130 z" ';
				buffer += ' transform="rotate('+(degrees-45)+',125,125)" stroke="#333" stroke-width="1" fill="#333"></path>';
				return buffer;
			}
		}
	}
}
