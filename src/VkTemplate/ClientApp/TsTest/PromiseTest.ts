//
//  Async function returning Promise object
//  note: resolve/reject method takes only 1 param and always returns void
//
function getTickPromise(flag: boolean): Promise<number> {
    return new Promise<number>(
        // function with 2 params (resolve and reject)
        // the body should perform sync operation
        // resolve and reject are passed in by caller of this async method
        // this method complete the async call by calling either resolve or reject
        (resolve: (n: number) => void, reject: (n: number) => void) => {
            function _asyncCall() {
                if (flag) {
                    let date = new Date();
                    let tick: number = date.getTime();
                    console.log(`_asyncCall: ${tick}`);
                    resolve(tick); // success: pass the value to caller
                }
                else {
                    reject(0); // error: pass the value to caller (0);
                    // Promise object will save the value and actually throw exception
                }
            }

            // initiates the async call and returns to caller right away
            setTimeout(_asyncCall, 7000);
        }
    );
}

async function callGetTickPromise() {
    let date = new Date();
    console.log(`time1: ${date.getTime()}`);
    // to call async method synchronously, use the 'await' keyword which will block the call
    // to call async method asynchronously, remove the 'await' keyword here
    await getTickPromise(false).then(
        // caller passing the resolve method here
        (n: number) => {
            console.log(`success: time=${date.getTime()}, val=${n}`);
        }
    )
    .catch(
        // caller passing the resolve method here
        (n: number) => {
            // you will get the returned value for error case (see callGetTickPromise2 below)
            console.log(`error: time=${date.getTime()}, val=${n}`);
        }
    );
    console.log(`time2: ${date.getTime()}`);
}

// another way to call getTickPromise synchronously
async function callGetTickPromise2() {
    let date = new Date();
    console.log(`time1: ${date.getTime()}`);
    let result: number = -1;
    try {
        result = await getTickPromise(false);
        console.log(`success: result=${result}`);   
    }
    catch (error) {
        // you don't get the returned value for error case 
        console.log(`error: result=${result}`);   // you will get -1 here, not 0
    }
    
    console.log(`time2: ${date.getTime()}`);
}

async function callFoo() {
}


callGetTickPromise();
