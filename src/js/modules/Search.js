export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getRecipe() {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    try {
      const res = await fetch(`${proxy}http://recipesapi.herokuapp.com/api/search?q=${this.query}`);
      const recipe = await res.json();
      this.result = recipe.recipes;
      // console.log(this.result);
    } catch (err) {
      alert(err);
    }
  }
}
