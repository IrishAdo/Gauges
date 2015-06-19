var Guage = {
	list: [],
	//	since we are not doing a 360 degree graph we will use 270
	singleDegree: 270 / 100,
	// register a canvas element as a Guage
	register: function(id) {
		var el = document.getElementById(id);


		Guage.list[id] = {
			id: id,
			canvas: el,
			set: [],
			labels: el.getAttribute('data-labels').split(','),
			colors: el.getAttribute('data-set-color').split(','),
			min: el.getAttribute('data-min') * 1,
			max: el.getAttribute('data-max') * 1,
			value: el.getAttribute('data-value') * 1,
			valuePercent: 0,
			valuetype: el.getAttribute('data-valuetype') * 1,
			width: el.getAttribute('width').replace('px', '') * 1,
			height: el.getAttribute('height').replace('px', '') * 1,
		};

		var setData = el.getAttribute('data-set').split(',');
		var Dx = Guage.list[id].max - Guage.list[id].min;
		Guage.CheckMinMaxValue(id);

		Guage.list[id].valuePercent = ((Guage.list[id].value / Dx) * 100);
		for (var index = 0; index < setData.length; index++) {
			if (setData[index] >= Guage.list[id].min && setData[index] <= Guage.list[
					id].max) {
				Guage.list[id].set[Guage.list[id].set.length] = (setData[index] / Dx) *
					100;
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
			Guage.Draw(id);
		}
	},
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

		for (var index = 0; index < maxIndex; index++) {
			ctx.save();
			var path = new Path2D();
			path.moveTo(0, 90);
			path.lineTo(0, 100);
			ctx.translate(125, 125);
			ctx.rotate(Guage.DegreeToRadians(45 + (Guage.singleDegree * (
				stepPercentage * index))));
			ctx.stroke(path);
			ctx.restore();

			ctx.save();
			ctx.font = "12px serif";
			ctx.translate(125, 125);
			ctx.rotate(Guage.DegreeToRadians(45 + (Guage.singleDegree * stepPercentage *
				index)));
			ctx.fillText(Guage.list[id].labels[index], 0, 115);
			ctx.restore();
		}
	},
	OutlineGuage: function(ctx) {
		var path = new Path2D();
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = "rgba(0,0,0,1)";
		path.arc(125, 125, 100, Guage.DegreeToRadians(135), Guage.DegreeToRadians(
			45), false); // Outer circle
		path.arc(125, 125, 50, Guage.DegreeToRadians(45), Guage.DegreeToRadians(135),
			true); // Outer circle
		path.arc(125, 125, 100, Guage.DegreeToRadians(135), Guage.DegreeToRadians(
			135), true); // Outer circle
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
	},

	DegreeToRadians: function(degrees) {
		if (degrees > 360) {
			return Guage.DegreeToRadians(degrees - 360);
		}
		return (Math.PI / 180) * (degrees % 360);
	}

}
