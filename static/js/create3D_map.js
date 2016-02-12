function create3DMap(data){

	var height=data.length;
	var width=data[0].length;
	current_position=[0,1,2,3,4,5];
	scene = new THREE.Scene();
	
	var scale = chroma.scale(['red', 'yellow', 'blue']).domain([0, 12]);

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor("white", 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 300;
	camera.lookAt(new THREE.Vector3(0,0,0));

	var light = new THREE.DirectionalLight();
    light.position.set(0, 100, 0);
	scene.add(light);

	document.body.appendChild(renderer.domElement);

	var geom = new THREE.Geometry();
	
	console.log([width,height]);

	
	controls = new THREE.TrackballControls(camera);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 0.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	
	// Create vertices
	for(var y=0;y<height;y++){
		for(var x=0;x<width;x++){		
			var vertex=new THREE.Vector3((-82.5+x*0.005491329+81.55)*80, -(41.5+y*0.004081633-42)*80,-1);
			geom.vertices.push(vertex);
		}
	}

	// Create faces
	for(var y=0;y<height-1;y++){
		for(var x=0;x<width-1;x++){
			
			var a=x+y*width;
			var b=(x+1)+y*width;
			var c=x+(y+1)*width;
			var d=x+1+(y+1)*width;

			
			var color_a=new THREE.Color(data[y][x]);
			var color_b=new THREE.Color(data[y][x+1]);
			var color_c=new THREE.Color(data[y+1][x]);
			var color_d=new THREE.Color(data[y+1][x+1]);

			var face1=new THREE.Face3(a,b,d);
			var face2=new THREE.Face3(d,c,a);

			face1.vertexColors=[color_a,color_b,color_d];
			face2.vertexColors=[color_d,color_c,color_a];

			geom.faces.push(face1);
			geom.faces.push(face2);
		}
	}

	geom.computeVertexNormals(true);
		geom.computeFaceNormals();
		geom.computeBoundingBox();
		
	
	var vertexColorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors});
	vertexColorMaterial.side=THREE.DoubleSide;
	var mesh = new THREE.Mesh( geom, vertexColorMaterial );
	scene.add(mesh)
	
	// Create DO surface
	var DO_geom = new THREE.Geometry();
	
	for(var i=0; i<do_coor.length;i++){
		// console.log(do_coor[i]);
		var vertex=new THREE.Vector3( (do_coor[i][1]+81.705)*80,(do_coor[i][0]-42.005)*80,(do_coor[i][2]-150)*3);
		// var vertex=new THREE.Vector3((do_coor[i][0]-42.01)*8/0.03153800, -1,(do_coor[i][1]+81.59)*8/0.142);
		// var vertex=new THREE.Vector3(do_coor[i][0], -1, do_coor[i][1]);
		DO_geom.vertices.push(vertex);
	}

	
	for(var i=0; i<face_index.length;i++){
		// console.log(face_index[i]);
		var face=new THREE.Face3(face_index[i][0]-1,face_index[i][1]-1,face_index[i][2]-1);
		// face.color=new THREE.Color(0x666666);
		DO_geom.faces.push(face);
	}


	var DO_vertexColorMaterial = new THREE.MeshLambertMaterial( { vertexColors: THREE.FaceColors});
	var DO_mesh = new THREE.Mesh( DO_geom, vertexColorMaterial );

	scene.add(DO_mesh)

	// axes = buildAxes( 100 );
	// scene.add( axes );

	var fps=60;
	
	function render() 
	{	
		renderer.render(scene,camera);
		controls.update();
		// geom.vertices[index].setY(currentY+3*Math.random()*(height_change[j+1]-height_change[j])/60);

		// for(var i=0;i<current_position.length;i++){
			// DO_geom.vertices[i].setZ(current_position[i]*5);
		// }

		for(var i =0;i<DO_geom.faces.length;i++){			
			DO_geom.faces[i].color=new THREE.Color(scale(current_position[DO_geom.faces[i].a]).hex());
		}
		
		DO_mesh.geometry.colorsNeedUpdate = true;
		DO_mesh.geometry.verticesNeedUpdate = true;

		// setTimeout( function() {
		requestAnimationFrame( render );
		// }, 1000 / 1);
	}
	render();
}



// code below is from http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/ to help identify camera position
function buildAxes( length ) {
		var axes = new THREE.Object3D();

		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X "red"
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y "green"
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z "blue"
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

		return axes;

	}
function buildAxis( src, dst, colorHex, dashed ) {
		var geom = new THREE.Geometry(),
			mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );
		geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

		var axis = new THREE.Line( geom, mat, THREE.LinePieces );

		return axis;

	}
