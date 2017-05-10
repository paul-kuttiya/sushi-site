var App = {
  $el: $('main #content'),
  $itemCount: $('span.count'),
  templates: JST,
  bindEvents: function() {
    _.extend(this, Backbone.Events);
    this.on('showDetail', this.showDetail.bind(this));
    this.on('add_to_cart', this.addToCart.bind(this));
    this.on('empty_cart', this.emptyCart.bind(this));
    this.on('checkout', this.checkout.bind(this));
  },
  checkout: function() {
    this.showCartDisplay(this.cartDisplay);
    this.showCheckoutView();
  },
  showCheckoutView: function() {
    this.checkoutView = new CheckoutView({
      collection: this.cart
    });
  },
  emptyCart: function() {
    this.cart.reset();
    this.resetCartDisplay();
    this.totalCount(0);
    this.emptyStorage();
  },
  emptyStorage: function() {
    localStorage.clear();
  },
  resetCartDisplay: function() {
    this.cartDisplay = this.getStorage('cart_display');
  },  
  checkCartDisplay: function(id, selected) {
    //pass by reference
    var cart = this.cartDisplay;
    var idx = cart.findIndex(function(ele) {
      return ele.id === id;
    });

    (idx !== -1) ? cart[idx] = selected : cart.push(selected);
    (cart.length > 7) ? cart.shift() : cart;

    return cart;
  },
  checkCartItem: function(model, selected) {
    if (selected) {
      selected.set('quantity', selected.get('quantity') + 1);
    } else {
      model.quantity = 1;
      selected = this.cart.add(model)
    }

    return selected.toJSON();
  },
  addToCart: function(id) {
    var model = this.items.toJSON()[id - 1],
        selected = this.cart.get(id),
        cart;

    selected = this.checkCartItem(model, selected);
    cart = this.checkCartDisplay(id, selected);

    this.setStorage('cart', this.cart);
    this.setStorage('cart_display', this.cartDisplay);

    this.showCartDisplay(cart);
  },
  setStorage: function(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
  },
  getStorage: function(name) {
    return JSON.parse(localStorage.getItem(name)) || []
  },
  showCartDisplay: function(cart) {
    if (cart.length) {
      new CartItemsView({
        collection: cart
      });
    }
  },
  showIndexView: function() {
    this.showCartDisplay(this.cartDisplay);
    this.IndexView = new IndexView({
      collection: this.items
    });
  },
  showDetail: function(id) {
    var model = this.items.get(id);

    this.showCartDisplay(this.cartDisplay);
    this.DetailView = new DetailView({
      model: model
    });

    router.navigate("/menu/" + id);
  },
  totalCount: function(count) {
    this.$itemCount.text(count)
  },
  init: function() {
    var cartItems = this.getStorage('cart');
    
    this.cart = new CartItems(cartItems);
    this.resetCartDisplay();
    this.bindEvents();
  }
}

Handlebars.registerHelper('total', function(cart) {
  var total = 0,
      count = 0;
  cart.forEach(function(item) {
    total += (item.quantity * item.price);
    count += item.quantity;
  });

  App.totalCount(count);
  return total;
});

Handlebars.registerHelper('If_order', function(cart, options) {
  if (cart.length > 0) {
    //return handlebars context if condition is matched.
    return options.fn(this);
  }
  return options.inverse(this);
});