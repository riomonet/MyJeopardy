
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS = 5;
let selected = []; //main data structure
$('#start').on('click', setupAndStart)  // button to start/restart the game


// this function queries the API, Sets up the main data structure
async function setupAndStart() {

    //clear table
    $('table').children().remove();
    $('table').append('<tr id=header></tr>')
    selected = [];


    // here we filter categories down to a group of NUM_CATEGOREIES and push onto selected
    let offset = (Math.random() * 20000).toFixed(0); //randomize Pagination of category query
    let categories = await axios.get(`https://jservice.io/api/categories?count=100&offset=${offset}`);
    let filtered = categories.data.filter( (data) => data.clues_count > NUM_QUESTIONS); 
    let reduced = _.sampleSize(filtered, NUM_CATEGORIES);

    for (item of reduced)
	selected.push(item);

    // here we get NUM_QUESTIONS questions and answers for theac of those cateogires
    for (let category of selected)
	category.clue = await axios.get(`https://jservice.io/api/clues?category=${category.id}`);

    //see if you can do this concurrently with axios.

    for (let category of selected){
	category.clue = _.sampleSize(category.clue.data, NUM_QUESTIONS);
	for(c in category.clue) {
	    let {question, answer ,showing = null} = category.clue[c];
	    category.clue[c] = {question, answer,showing};
 	}
    }

    // here we call the render function
    createFrontEnd ();
}

//this function renders the HTML table
function createFrontEnd () {
    // fill header row
    for (let category of selected) {
	$('#header').append(`<th>${category.title}</th>`);
    }


    // create NUM_QUESTIONS rows
    for (let i = 0; i < NUM_QUESTIONS; i++) {
	$('table').append(`<tr id=row_${i}></tr>`);
    }

    //create NUM QUESTIONS * NUM_CATEGORIES <td></td>
    //each td gets a row num and col num attribute
    for (let i = 0; i < NUM_QUESTIONS; i++)
	for (let j = 0; j < NUM_CATEGORIES; j++) 
	    $(`#row_${i}`).append(`<td row=${i} col=${j}>?</td>`);

}



//  eventListener for a click on a cell
$('table').on('click' , 'td', function (evt) {

	evt.preventDefault();
	let col = this.getAttribute('col');
	let row = this.getAttribute('row');
	let question = selected[col].clue[row].question;
	let answer = selected[col].clue[row].answer;
	if ($(this).text() === '?')
		$(this).text(question);
	else if ($(this).text() === question)
		$(this).html(answer);
});


/*
-
-  axios cuncurrent requests?
-
*/

