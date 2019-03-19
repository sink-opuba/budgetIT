
// BUDGET CONTROLLER
const budgetController = (() => {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    //This expense method simply returns the percentage

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    }
    //Data structure of budget items
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            //checks if the array is not empty
            if (data.allItems[type].length > 0) {
                //create ID by adding 1 to the last element in the array
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                //if array is empty set ID to 0;
                ID = 0;
            }


            //create new item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //Push it into the Data structure
            data.allItems[type].push(newItem);
            //returns new item
            return newItem;
        },
        deleteItem: function (type, id) {
            let ids, index;
            //Since items can the deleted from the data structure, simply accessing by their IDs(data.allItems[type][id]) is not effective
            //IDs can [1, 2, 4, 6, 8]
            //A better implementation is to get the index of the id
            ids = data.allItems[type].map((item) => {
                return item.id;
            });

            index = ids.indexOf(id);
            //check if index is not -1 i.e there's no index
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc)
            });
        },
        getPercentages: function () {
            let allperc = data.allItems.exp.map(cur => {
                return cur.getPercentage()
            });
            return allperc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },

        testing() {
            console.log(data);
        }
    }

})();


//UI CONTROLLER
const UIController = (() => {

    //An object of all DOM strings to make future modification of Selectors easier
    const DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage'

    }

    return {

        //Public method that gets all input data from UI
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value,// returns inc or exp
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        },
        //Public Method that adds items to the list on the app UI
        addListItem: function (obj, type) {
            let html, newHtml, element;

            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMString.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">x</i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMString.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">x</i></button></div></div></div>';
            }

            //replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);


            //insert HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        //Method to delete items from the UI after there removed from internal data structure
        deleteListItem: function (selectorID) {
            //Select the ID of item to be deleted
            let element = document.getElementById(selectorID);
            //Remove element from parent node
            element.parentNode.removeChild(element);
        },

        clearField: function () {
            let fields, fieldsArr;
            //Used to grab all selected input
            fields = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);// returns a NodeList

            //A trick to convert list to array
            fieldsArr = Array.prototype.slice.call(fields);
            //clears input value
            fieldsArr.forEach(element => {
                element.value = "";
            });
            fieldsArr[0].focus();

        },

        displayBudget: function (obj) {
            document.querySelector(DOMString.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMString.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMString.expensesLabel).textContent = obj.totalExp;


            if (obj.percentage > 0) {
                document.querySelector(DOMString.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMString.percentageLabel).textContent = '---';
            }
        },
        //The method displays expense percentage to the UI
        displayPercentages: function (percArray) {
            //grab all selected items and returns a nodeList of the selected items
            let fields = document.querySelectorAll(DOMString.expensePercLabel);

            //A reusable function for looping through a NodeList 
            nodeListForEach = function (list, callback) {
                for (let i = 0; i < list.length; i++) {

                    //calls the callback function declared later
                    callback(list[i], i);
                }
            }

            //Call nodeListForEach function with the specified callback functionality
            nodeListForEach(fields, function (current, index) {
                if (percArray[index] > 0) { //just to make sure percentage value is greater than 0
                    current.textContent = percArray[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });
        },
        //A method that exposes DOM string object
        getDOMString() {
            return DOMString;
        }
    }
})();


//GLOBAL APP CONTROLLER
const controller = (function (budgetCtrl, UICtrl) {

    //Sets up all initial event listeners for the app
    var setUpEventListeners = function () {
        let DOM = UICtrl.getDOMString();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener("keypress", function (event) {

            if (event.keyCode === 13 || event.which === 13) {

                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }
    var updateBudget = function () {

        //1. Calculate the buget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        let budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    var updatePercentages = function () {
        //1. Calculate the budget
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function () {
        let input, newItem;
        //1. get the file input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2.Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3.Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4.Clear input fields
            UICtrl.clearField();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
        }

    }

    var ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        //Traverse up the DOM from the target element to get the ID 
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {


            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }
    }

    return {
        //Initialization function
        init() {
            console.log('Application is started');
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            })
            setUpEventListeners();

        }
    }


})(budgetController, UIController);

controller.init();