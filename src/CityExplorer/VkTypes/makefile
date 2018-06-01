#
# $(DEV) is an env var which must be defined
#

VK_TYPES = VkTypes
WIDL_BINDER = widlBinder
TEMPLATE_INDEX_HTML = template-index.html
WIDL_OUTPUTS = $(addprefix $(WIDL_BINDER), .cpp .js) parser.out WebIDLGrammar.pkl
EMCC_OUTPUTS = $(addprefix $(VK_TYPES), .js .wasm .html)

#
# EM exported functions settings
# 
EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'destroy', 'setValue', 'getValue', 'lengthBytesUTF8']" 
EXPORTED_FUNCTIONS="['_malloc', '_free']" 

#
# target settings
# 
TARGET_DIR = ../ClientApp
TARGETS = $(addprefix $(TARGET_DIR)/, $(VK_TYPES).js $(VK_TYPES).wasm)

all: $(TARGET_DIR) $(TARGETS) 

$(TARGET_DIR):
	mkdir $(TARGET_DIR)

$(TARGET_DIR)/$(VK_TYPES).%: $(VK_TYPES).%
	cp $< $(TARGET_DIR)/

$(WIDL_BINDER).cpp $(WIDL_BINDER).js: $(VK_TYPES).idl
	python $(DEV)/github/emsdk/emscripten/1.37.40/tools/webidl_binder.py $? $(WIDL_BINDER)

# emcc -O3 -o myFunct.html myFunct.c  -s WASM=1 --shell-file template_index.html -s NO_EXIT_RUNTIME=1  -s ALLOW_MEMORY_GROWTH=1   -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" -s EXPORTED_FUNCTIONS="['_malloc', '_free']"

$(VK_TYPES).wasm $(VK_TYPES).js $(VK_TYPES).html: $(WIDL_BINDER).cpp $(WIDL_BINDER).js $(VK_TYPES).h $(VK_TYPES).cpp _$(WIDL_BINDER).cpp $(TEMPLATE_INDEX_HTML)
	emcc -O3 -o $(VK_TYPES).html $(VK_TYPES).cpp _$(WIDL_BINDER).cpp \
	-s WASM=1 -std=c++11 --shell-file $(TEMPLATE_INDEX_HTML) -s NO_EXIT_RUNTIME=1 \
	-s EXTRA_EXPORTED_RUNTIME_METHODS=$(EXTRA_EXPORTED_RUNTIME_METHODS) \
	-s MODULARIZE=1 -s EXPORT_NAME="'createVkModule'" \
	-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) --post-js $(WIDL_BINDER).js

clean:
	-rm -f $(WIDL_OUTPUTS) $(EMCC_OUTPUTS) $(TARGETS)
