myMultiply = null;

function StringToUTF8(str) {
	var length = Module.lengthBytesUTF8(str + 1);
	var utf8 = Module._malloc(length);
	stringToUTF8(str, utf8, length);
	return utf8;
}

// this js function will be called from wasm
function importedFunct1(txt) {
	return '** ' + txt + ' **';
}

document.querySelector('.myMultiply').addEventListener('click', function(){
	if (myMultiply == null) {
		myMultiply = Module.cwrap('myMultiply', 			// name of C function 
									'number', 				// return type
									['number', 'number'] 	// argument types
									);
	}

	//
	//	accessing memory directly via Module.buffer
	//
	var ptr = Module._getMem();
	// the returned ptr/address from C function is actually 
	// an index/offset to the Module.buffer (which is an ArrayBuffer)
	
	// now you access the buffer via Float32Array
	var data = new Float32Array(Module.buffer, ptr);
	console.log('d[0]=' + data[0], ' d[1]=' + data[1], ' d[2]=' + data[2]);
	Module._free(ptr);
	//
	//	end of accessing memory directly
	//

	//
	// testing memory access via setValue/getValue
	//
	var x = Module._malloc(4);
	Module.setValue(x, 7, 'i32');

	var z = Module.HEAP8[x];
	console.log('z=' + z);

	Module._testMem(x);	 // call c funct which will triple the int in-place
	var y = Module.getValue(x, 'i32');	// should get 7*3=21
	console.log('y=' + y);
	Module._free(x);
	//
	// end of testing memory access via setValue/getValue
	//

	alert(myMultiply(2, 7));
});

document.querySelector('.passThrough').addEventListener('click', function(){
});

document.querySelector('.Foo').addEventListener('click', function(){
	var myTable = new MyTable();
	myTable.onSetData = function(i) {
		console.log('overridden onSetData: i=' + i);
	};
	myTable.setData(888);

	var vector = new Vector(100, 101, 102);
	console.log('vector.x=' + vector.get_x());
	vector.set_y(7);
	vector.set_z(8);
	var v2 = vector.multiply(2);
	console.log('v2.x=' + v2.get_x());
	console.log('v2.y=' + v2.get_y());
	console.log('v2.z=' + v2.get_z());

	var f = Foo.prototype.createInstance();

	var bar = new Module.Bar(777);
	var foo = bar.makeFoo(); 

	foo.setVectorRef(vector);

	var val = bar.getVal();
	alert(val);

	Module.destroy(foo);
	Module.destroy(bar);
});

