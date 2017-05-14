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
    this.on('plus', this.plusItem.bind(this));
    this.on('minus', this.minusItem.bind(this));
    this.cart.on('change remove', this.updateStorage.bind(this))
  },
  updateStorage: function() {
    this.setStorage('cart', this.cart);
    this.setStorage('cart_display', this.cartDisplay);
  },
  updateDisplay: function(id, quantity) {
    this.cartDisplay.forEach(function(item) {
      if (item.id === id) {
        item.quantity = quantity;
      }
    });

    this.cartDisplay = this.cartDisplay.filter(function(item) {
      return item.quantity > 0;
    });

    if (this.cartDisplay.length === 0) {
      this.cartItemsView.remove();
      this.totalCount(0)
    }
  },
  plusItem: function(e) {
    var id = $(e.target).closest('tr').data('id'),
        model = this.cart.get(id),
        quantity = model.toJSON().quantity + 1;

    model.set({ quantity: quantity });
    this.updateDisplay(id, quantity);
    this.checkout();
  },
  minusItem: function(e) {
    var id = $(e.target).closest('tr').data('id'),
        model = this.cart.get(id),
        quantity = model.toJSON().quantity - 1;

    if (quantity > 0)  {
      model.set({ quantity: quantity })
    } else {
      this.cart.remove(model);
    }

    this.updateDisplay(id, quantity);
    this.checkout();
  },
  checkout: function() {
    this.showCartDisplay(this.cartDisplay);
    this.updateStorage();
    this.showCheckoutView();
  },
  showCheckoutView: function() {
    this.checkoutView = new CheckoutView({
      collection: this.cart
    });
  },
  emptyCart: function() {
    this.cart.reset();
    this.cartDisplay = [];
    this.totalCount(0);
    this.emptyStorage();
    router.navigate('/');
    this.showIndexView().render();
  },
  emptyStorage: function() {
    localStorage.clear();
  },
  getCart: function() {
    var cartItems = this.getStorage('cart');

    this.cart = new CartItems(cartItems);
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
        cartDisplay, cartIems;

    cartIems = this.checkCartItem(model, selected);
    cartDisplay = this.checkCartDisplay(id, cartIems);

    this.updateStorage();
    this.showCartDisplay(cartDisplay);
  },
  setStorage: function(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
  },
  getStorage: function(name) {
    return JSON.parse(localStorage.getItem(name)) || []
  },
  showCartDisplay: function(cart) {
    if (cart.length) {
      this.cartItemsView = new CartItemsView({
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
    this.getCart();
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
  return total.toFixed(2);
});

Handlebars.registerHelper('If_order', function(cart, options) {
  if (cart.length > 0) {
    //return handlebars context if condition is matched.
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('fixed', function(price) {
  return price.toFixed(2);
});