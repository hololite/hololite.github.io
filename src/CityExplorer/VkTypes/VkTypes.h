class Table {
public:
	virtual ~Table(){}

	void setData(int i) {
		onSetData(i);
	}
protected:
	virtual void onSetData(int i)=0;
};

struct Vector {
public:
	Vector() : x(0), y(0), z(0) {}
	Vector(int a, int b, int c) : x(a), y(b), z(c) {}

	int x;
	int y;
	int z;

	Vector multiply(int m) {
		Vector v;
		v.x = this->x * m;
		v.y = this->y * m;
		v.z = this->z * m;
		return v;
	}
};

class Foo {
private:

public:
	Foo();
	~Foo();
	int setVal(int v);
	void setTable(Table& t);
	void setVector(Vector* v);
	void setVectorRef(Vector& v);

	static Foo* createInstance();
};

class Bar {
private:
	int val;

public:
	Bar(int val);
	~Bar();
	int getVal();
	Foo* makeFoo();
};
