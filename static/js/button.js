$('#time_pick').appendDtpicker({
			"minuteInterval": 10,
			"closeOnSelected": true,
			"todayButton": false,
			"autodateOnStart": true,
			"current": "2014-7-4 12:30"
		});


$('#start_time').appendDtpicker({
			"minuteInterval": 10,
			"closeOnSelected": true,
			"todayButton": false,
			"autodateOnStart": true,
			"current": "2014-7-4 12:30"
		});

$('#end_time').appendDtpicker({
			"minuteInterval": 10,
			"closeOnSelected": true,
			"todayButton": false,
			"autodateOnStart": true,
			"current": "2014-7-5 12:30"
		});

$('#same_time').on('click',function(){
	var old_time_start=new Date($("#start_time").val());
	var old_time_end=new Date($("#end_time").val());
	
	var new_time_start=new Date($("#time_pick").val());
	var time_diff=new_time_start-old_time_start;
	var new_time_end=new Date(old_time_end.getTime()+time_diff);

	console.log(new_time_end);

	$("#start_time").handleDtpicker('setDate', new_time_start);
	$('#end_time').handleDtpicker('setDate',new_time_end);
	
	showTimeSeries(station_ts);
	
})

	$("#Plot").on('click',function(){
		var timeString=$("#time_pick").val();
		if(timeString===""){
			return;
		}
		else{
			console.log(timeString);
			var time=new Date(timeString);
			changeData(time,300);
		}
	});	

	$("#Plot_add10").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setMinutes(time.getMinutes()+10);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			// $("#time_pick").val(time)
			changeData(time,300);
		}
	});

	$("#Plot_addhour").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setHours(time.getHours()+1);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			changeData(time,300);
		}
	});

	$("#Plot_addday").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setDate(time.getDate()+1);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			changeData(time,300);
		}
	});

	$("#Plot_addmonth").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setMonth(time.getMonth()+1);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			changeData(time,300);
		}
	});


	$("#Plot_minus10").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setMinutes(time.getMinutes()-10);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			// $("#time_pick").val(time)
			changeData(time,300);
		}
	});

	$("#Plot_minushour").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setHours(time.getHours()-1);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			changeData(time,300);
		}
	});

	$("#Plot_minusday").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setDate(time.getDate()-1);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			changeData(time,300);
		}
	});

	$("#Plot_minusmonth").on('click',function(){
		var timeString=$("#time_pick").val();

		if(timeString===""){
			return;
		}
		else{
			// console.log(timeString);
			var time=new Date(timeString);
			// time=time+10*60*1000;
			time.setMonth(time.getMonth()-1);
			console.log(time);
			$("#time_pick").handleDtpicker('setDate', time);
			changeData(time,300);
		}
	});

	// 
	// ts plot button
	// 
	
	$("#tsPlot_addmonth").on('click',function(){
		var timeString1=$("#start_time").val();
		var timeString2=$("#end_time").val();

		
			// console.log(timeString);
			var time1=new Date(timeString1);
			var time2=new Date(timeString2);

			time1.setMonth(time1.getMonth()+1);
			time2.setMonth(time2.getMonth()+1);

			$("#start_time").handleDtpicker('setDate', time1);
			$("#end_time").handleDtpicker('setDate', time2);

			showTimeSeries(station_ts);
		
	});

	$("#tsPlot_minusmonth").on('click',function(){
		var timeString1=$("#start_time").val();
		var timeString2=$("#end_time").val();

		
			// console.log(timeString);
			var time1=new Date(timeString1);
			var time2=new Date(timeString2);

			time1.setMonth(time1.getMonth()-1);
			time2.setMonth(time2.getMonth()-1);

			$("#start_time").handleDtpicker('setDate', time1);
			$("#end_time").handleDtpicker('setDate', time2);

			showTimeSeries(station_ts);
		
	});


	$("#tsPlot_addday").on('click',function(){
		var timeString1=$("#start_time").val();
		var timeString2=$("#end_time").val();

		
			// console.log(timeString);
			var time1=new Date(timeString1);
			var time2=new Date(timeString2);

			time1.setDate(time1.getDate()+1);
			time2.setDate(time2.getDate()+1);

			$("#start_time").handleDtpicker('setDate', time1);
			$("#end_time").handleDtpicker('setDate', time2);

			showTimeSeries(station_ts);
		
	});

	$("#tsPlot_minusday").on('click',function(){
		var timeString1=$("#start_time").val();
		var timeString2=$("#end_time").val();

		
			// console.log(timeString);
			var time1=new Date(timeString1);
			var time2=new Date(timeString2);

			time1.setDate(time1.getDate()-1);
			time2.setDate(time2.getDate()-1);

			$("#start_time").handleDtpicker('setDate', time1);
			$("#end_time").handleDtpicker('setDate', time2);

			showTimeSeries(station_ts);
		
	});

	$("#tsPlot_adddata").on('click',function(){
		var timeString1=$("#start_time").val();
		var timeString2=$("#end_time").val();

		
			// console.log(timeString);
			var time1=new Date(timeString1);
			var time2=new Date(timeString2);

			// time1.setDate(time1.getDate()-1);
			time2.setDate(time2.getDate()+1);

			// $("#start_time").handleDtpicker('setDate', time1);
			$("#end_time").handleDtpicker('setDate', time2);

			showTimeSeries(station_ts);
		
	});

	$("#tsPlot_minusdata").on('click',function(){
		var timeString1=$("#start_time").val();
		var timeString2=$("#end_time").val();

		
			// console.log(timeString);
			var time1=new Date(timeString1);
			var time2=new Date(timeString2);

			// time1.setDate(time1.getDate()-1);
			time2.setDate(time2.getDate()-1);

			// $("#start_time").handleDtpicker('setDate', time1);
			$("#end_time").handleDtpicker('setDate', time2);

			showTimeSeries(station_ts);
		
	});

	$("#3d").on('click',function(){
		 window.open( "./3d_lake_erie.html");
	});	