export class Inventory {
    constructor() {
      this.items = [];
    }
  
    add(model, name = "model") {
      this.items.push({ name, model });
    }
  
    list() {
      return this.items.map(i => i.name);
    }
  
    getByName(name) {
      const found = this.items.find(i => i.name === name);
      return found ? found.model : null;
    }
  
    getAt(index) {
      return this.items[index]?.model ?? null;
    }
  
    count() {
      return this.items.length;
    }
  }
  