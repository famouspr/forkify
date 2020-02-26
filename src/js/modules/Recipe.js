export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipeDetail() {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    try {
      const res = await fetch(
        `${proxy}http://recipesapi.herokuapp.com/api/get?rId=${this.id}`
      );
      const recipeDetail = await res.json();
      this.ingredients = recipeDetail.recipe.ingredients;
      this.title = recipeDetail.recipe.title;
      this.publisher = recipeDetail.recipe.publisher;
      this.img = recipeDetail.recipe.image_url;
      this.src = recipeDetail.recipe.source_url;
    } catch (err) {
      alert(err);
    }
  }

  calcTime() {
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServing() {
    this.serving = 4;
  }

  parseIngredient() {
    const unitsLong = [
      'tablespoons',
      'tablespoon',
      'ounces',
      'ounce',
      'tablespoons',
      'tablespoon',
      'cups',
      'pounds',
      'pound'
    ];
    const unitsShort = [
      'tbsp',
      'tbsp',
      'oz',
      'oz',
      'tsp',
      'tsp',
      'cup',
      'cup',
      'cup'
    ];
    const units = [...unitsShort, 'kg', 'g'];
    const newIngredients = this.ingredients.map(el => {
      // Normalising the Units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      // Removing ()
      ingredient = ingredient.replace(/ *\([^)]*\)*/g, ' ');
      // Parse ingredient into count
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(e2 => units.includes(e2));
      let objIng;
      if (unitIndex > -1) {
        const arrCount = arrIng.slice(0, unitIndex);
        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0]);
        } else {
          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        };
      } else if (parseInt(arrIng[0])) {
        objIng = {
          count: parseInt(arrIng[0]),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        };
      } else if (unitIndex === -1) {
        objIng = {
          count: 1,
          unit: '',
          ingredient
        };
      }

      return objIng;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    let newServings = type === 'dec' ? this.serving - 1 : this.serving + 1;
    this.ingredients.forEach(ing => {
      ing.count = ing.count * (newServings / this.serving);
    });
    this.serving = newServings;
  }
}
