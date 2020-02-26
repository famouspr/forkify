import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import Likes from './modules/Likes';
import * as searchView from './modules/searchView';
import * as recipeView from './modules/recipeView';
import * as listView from './modules/listView';
import * as likesView from './modules/likesView';
import { elements, renderLoader, clearLoader } from './modules/base';
/* *************** Global State of the App ************** */

const state = {};

/* ****************** Search Controller ***************** */

const controlSearch = async () => {
  //Get the query
  const query = searchView.getInput();
  if (query) {
    //New Search Object and add to state
    state.search = new Search(query);
    // Prepare UI for Result
    searchView.clearResult();
    renderLoader(elements.searchRes);
    // Search for recipes
    try {
      await state.search.getRecipe();
      // Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
      searchView.clearInput();
    } catch {
      clearLoader();
      alert('Somthing Went Wrong!');
    }
  }
};

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

// const search = new Search('pizza');
// search.getRecipe();

elements.searchResPages.addEventListener('click', e => {
  let btn = e.target.closest('.btn-inline');
  if (btn) {
    const gotoPage = parseInt(btn.dataset.goto);
    searchView.clearResult();
    searchView.renderResults(state.search.result, gotoPage);
  }
});

/* ****************** Recipe Controller ***************** */

const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');
  if (id) {
    recipeView.clearRecipe();
    if (state.search) searchView.highlightSelected(id);
    renderLoader(elements.recipe);
    state.recipe = new Recipe(id);
    await state.recipe.getRecipeDetail();
    state.recipe.calcTime();
    state.recipe.calcServing();

    state.recipe.parseIngredient();
    clearLoader();
    recipeView.recipeRender(state.recipe, state.likes.isLiked(id));
  }
};
window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

/* ******************* List Controller ****************** */

const controlList = () => {
  if (!state.list) {
    state.list = new List();
  }
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

/* ******************* Like Controller ****************** */
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  if (!state.likes.isLiked(currentID)) {
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.img
    );
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);
  } else {
    state.likes.deleteLike(currentID);
    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

/* ***************** REstore Like Recipe **************** */
window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

/* ************ Handling Recipe Button Clicks *********** */

elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.serving > 4) {
      state.recipe.updateServings('dec');
    }
    recipeView.updateServingIngredients(state.recipe);
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }

  // if (e.target.matches('.btn-decrese, .btn-decrease *')){};
});

/* ************ Handle Delete Item from List ************ */

elements.shopping.addEventListener('click', e => {
  let id = e.target.closest('.shopping__item').dataset.itemid;
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    state.list.deleteItem(id);

    listView.deleteItem(id);
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});
