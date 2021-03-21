// create variable to hold db connection
let db;

//establish connection to indexedDB database called 'pizza_hunt'
const request = indexedDB.open('pizza_hunt', 1);

//this event will emit if the database version changes
requiest.onupgradeneeded = function (event) {
    //save a reference to database
    const db = event.target.result;
    //create object store called 'new_pizza'
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

//upon successful request
request.onsuccess = function (event) {
    db = event.target.result;

    //check if app is online
    if (navigato.onLine) {
        uploadPizza();
    }
};

request.onerror = function (event) {
    //log error
    console.log(event.target.errorCode);
};

// will execute if we attempt to submit a new pizza
function saveRecord(record) {
    //open new transaction with database with read and wrte permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //acces the object store for newpizza
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to your store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    //open transaction
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //get all record from store and set to variable
    const getAll = pizzaObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    // access the new_pizza object store
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    // clear all items in your store
                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

}

//listen for internet coming back online
window.addEventListener('online', uploadPizza);