#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <emscripten.h>
// for C++
#include "myTypes.h"

////////////////////////////////////////////////////////////////////////////////
//
// 			C wrapper for imported js function
//

EM_JS(const char*, sayHello, (const char* cstr), {
	// this block is in js-land
	
	//
	// marshal in-param from c type to js type
	//
	var str = UTF8ToString(cstr);

	//
	// call the js function
	//
	var out = importedFunct1(str);

	//
	// marshal return val from js type to c type
	//
	var utf8 = StringToUTF8(out);

	return utf8; // caller must free this
});


////////////////////////////////////////////////////////////////////////////////
//
// 				Exported C functions
//

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE 
int myMultiply(int a, int b) {
	return a*b;
}

EMSCRIPTEN_KEEPALIVE 
const char* passThrough() {
	const char* out = sayHello(u8"hey 日本語 hey!");
	return out; // caller must free this
}

EMSCRIPTEN_KEEPALIVE 
char* myPrint(char* s, float f, int i, int b) {
	static int counter = 0;

	char* result = (char*)malloc(1024*1024);

	sprintf(result, u8"こんにちは！counter=%d: s=[%s] b=[%s] f=[%f], i=[%d]", counter++, s, (b ? u8"true" : u8"false"), f, i);
		
	return result;
}

EMSCRIPTEN_KEEPALIVE 
void testMem(int* ptr) {
	int i = *ptr;
	*ptr = i*3;
}

EMSCRIPTEN_KEEPALIVE 
const float* getMem() {
	float* m = (float*)malloc(3*4);

	m[0] = 7.5;
	m[1] = 8.5;
	m[2] = 9.5;

	return m;
}

#ifdef __cplusplus
}
#endif

////////////////////////////////////////////////////////////////////////////////
//
// 				C++
//


Foo::Foo() {
	emscripten_log(EM_LOG_CONSOLE, "Foo::Foo");
}

Foo::~Foo() {
	//emscripten_log(EM_LOG_CONSOLE|EM_LOG_C_STACK, "~Foo");
	emscripten_log(EM_LOG_CONSOLE, "Foo::~Foo");
}


int Foo::setVal(int v) {
	return v*7;
}

void Foo::setTable(Table& t) {
}

void Foo::setVector(Vector* vector) {
	emscripten_log(EM_LOG_CONSOLE, "vector: x=%d, y=%d, z=%d", vector->x, vector->y, vector->z);
}

void Foo::setVectorRef(Vector& vector) {
	emscripten_log(EM_LOG_CONSOLE, "vector: x=%d, y=%d, z=%d", vector.x, vector.y, vector.z);
}

Bar::Bar(int val) : val(val) {
	emscripten_log(EM_LOG_CONSOLE, "Bar::Bar");
}

Bar::~Bar() {
	emscripten_log(EM_LOG_CONSOLE, "Bar::~Bar");
}

int Bar::getVal() {
	return val;
}

Foo* Bar::makeFoo() {
	return new Foo();
}

Foo* Foo::createInstance() {
	return new Foo();
}
