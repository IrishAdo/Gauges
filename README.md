# Guages
Drawing Gauges with Canvas

<pre>
	&lt;div class='guage' 
		data-min='0' data-max='8'  data-set="0,2.8,5.3,8" 
		data-set-color="#00ff00,#ffff00,#ff0000" 
		data-labels='0.0,1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0' 
		data-value='3.46' data-valuetype='pence' 
		width='250px' height='250px'>&lt;/canvas>
	&lt;div class='guage' data-min='0' data-max='11'  
	data-set="0,3.6,7.4,11" 
	data-set-color="#ff0000,#00ff00,#ff0000" 
	data-labels='0,5.5,11' data-value='0.9' 
	data-valuetype='percent' width='250px' 
	height='250px'>&lt;/canvas>
	&lt;div class='guage' data-min='0' data-max='100'  
	data-set="0,34,67,100" data-set-color="#ff0000,#ffff00,#00ff00" 
	data-labels='0,13,25,38,50,63,75,88,100' data-value='29.9' 
	data-valuetype='percent' width='250px' height='250px'>&lt;/canvas>
	&lt;div class='guage' data-min='0' data-max='42'  
	data-set="0,7,11,16,35,42" 
	data-set-color="#ff0000,#ffff00,#00ff00,#ffff00,#ff0000" 
	data-labels='0,14,28,42' data-value='41' 
	data-valuetype='percent' width='250px' height='250px'>&lt;/canvas>
	&lt;script src='guage.js' >&lt;/script>
	&lt;script>
		var els = document.getElementsByClassName('guage');
		for (var index = 0 ; index &lt; els.length ; index ++){
			Guage.register(els[index]);
		}
		Guage.Redraw();
	&lt;/script>
	<image src='example.png'/>
</pre>