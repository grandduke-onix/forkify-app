import * as model from "./model.js";
import recipeView from "./view/recipeView.js";
import searchView from "./view/searchView.js";
import resultsView from "./view/resultsView.js";
import paginationView from "./view/paginationView.js";
import bookmarksView from "./view/bookmarksView.js";
import addRecipeView from "./view/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

const recipeContainer = document.querySelector('.recipe');

// if(module.hot) {
// 	module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipies = async function () {
	try {
		const id = window.location.hash.slice(1);

		if(!id) return;
		recipeView.renderSpinner();

		//0) Update results view to mark selected search results
		resultsView.update(model.getSearchResultsPage());

		//3) Updating bookmarks view
		bookmarksView.update(model.state.bookmarks);

		//1) Loading recipe
		await model.loadRecipe(id);

		//2)Rendering recipe
		recipeView.render(model.state.recipe);


	} catch(err) {
		recipeView.renderError();
	}
};

const controlSearchResults = async function() {
	try {
		resultsView.renderSpinner();

		//1) Get search query
		const query = searchView.getQuery();
		if(!query) return;

		//2) Load search results
		await model.loadSearchResults(query);

		//3) Render results
		// console.log(model.state.search.results);
		// resultsView.render(model.state.search.results);
		resultsView.render(model.getSearchResultsPage(1));

		//4) Render initail pagination button
		paginationView.render(model.state.search);
	} catch(err) {
		console.log(err);
	}
};

const controlPagination = function(goToPage) {
	//3) Render NEW results
	// resultsView.render(model.state.search.results);
	resultsView.render(model.getSearchResultsPage(goToPage));

	//4) Render NEW pagination button
	paginationView.render(model.state.search);
}

const controlServings = function(newServings) {
	// Update the recipe servings(in state)
	model.updateServings(newServings);

	// Update the recipe view
	// recipeView.render(model.state.recipe);
	recipeView.update(model.state.recipe);
}

const controlBookmark = function() {
	// 1) Add/remove bookmark
	if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
	else if(model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id);

	// 2) Update the recipe view
	recipeView.update(model.state.recipe);

	// 3) Render the bookmarks
	bookmarksView.render(model.state.bookmarks);
}

const controlAllBookmarks = function() {
	bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
	try {
		// Show loading spinner
		addRecipeView.renderSpinner();

		// console.log(newRecipe);
		// Upload the new recipe data
		await model.uploadRecipe(newRecipe);
		console.log(model.state.recipe);

		// Render the new recipe
		recipeView.render(model.state.recipe);

		//Render bookmarks view
		bookmarksView.render(model.state.bookmarks);

		// Change ID in URl
		window.history.pushState(null, "", `#${model.state.recipe.id}`);

		// Close form window
		setTimeout(function() {
			addRecipeView.toggleWindow;
		}, MODAL_CLOSE_SEC * 1000);

		// Display success message after recipe upload
		addRecipeView.renderMessage();

	} catch(err) {
		addRecipeView.renderError(err.message);
	}
}

const init = function() {
	bookmarksView.addHandlerRender(controlAllBookmarks);
	recipeView.addHandlerRender(controlRecipies);
	recipeView.addHandlerUpdateServings(controlServings);
	recipeView.addHandlerAddBookmark(controlBookmark);
	searchView.addHandlerSearch(controlSearchResults);
	paginationView.addHandlderClick(controlPagination);
	addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
