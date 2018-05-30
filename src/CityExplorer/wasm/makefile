MY_TYPES = myTypes
WIDL_BINDER = widlBinder
TEMPLATE_INDEX_HTML = template-index.html
EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'destroy', 'setValue', 'getValue', 'lengthBytesUTF8']" 
EXPORTED_FUNCTIONS="['_malloc', '_free']" 

all: $(MY_TYPES).wasm $(MY_TYPES).js

$(WIDL_BINDER).cpp $(WIDL_BINDER).js: $(MY_TYPES).idl
	python $(DEV)\github\emsdk\emscripten\1.37.40\tools\webidl_binder.py $? $(WIDL_BINDER)

# emcc -O3 -o myFunct.html myFunct.c  -s WASM=1 --shell-file template_index.html -s NO_EXIT_RUNTIME=1  -s ALLOW_MEMORY_GROWTH=1   -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" -s EXPORTED_FUNCTIONS="['_malloc', '_free']"

$(MY_TYPES).wasm $(MY_TYPES).js $(MY_TYPES).html: $(WIDL_BINDER).cpp $(WIDL_BINDER).js $(MY_TYPES).h $(MY_TYPES).cpp _$(WIDL_BINDER).cpp $(TEMPLATE_INDEX_HTML)
	emcc -O3 -o $(MY_TYPES).html $(MY_TYPES).cpp _$(WIDL_BINDER).cpp -s WASM=1 -std=c++11 --shell-file $(TEMPLATE_INDEX_HTML) -s NO_EXIT_RUNTIME=1 -s EXTRA_EXPORTED_RUNTIME_METHODS=$(EXTRA_EXPORTED_RUNTIME_METHODS) -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) --post-js $(WIDL_BINDER).js
