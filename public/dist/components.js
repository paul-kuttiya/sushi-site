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
    router.navigate('/');
    this.cart.reset();
    this.cartDisplay = [];
    this.totalCount(0);
    this.emptyStorage();
    // this.showIndexView().render();
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
var Item = Backbone.Model.extend({});
var CartItem = Backbone.Model.extend({});
var Items = Backbone.Collection.extend({
  model: Item,
});
var CartItems = Backbone.Collection.extend({
  model: CartItem,
});
var IndexView = Backbone.View.extend({
  tagName: 'ul',
  id: 'items',
  events: {
    "click li header": "showDetail",
    "click a.add_cart": "AddToCart",
  },
  AddToCart: function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var id = this.findId(e);
    App.trigger('add_to_cart', id)
  },
  findId: function(e) {
    return $(e.target).closest('li').data('id');
  },
  showDetail: function(e) {
    e.stopPropagation();
    var id = this.findId(e);
    App.trigger('showDetail', id);
  },
  template: App.templates.index,
  render: function() {
    this.$el.html(this.template(this.collection.toJSON()));
    App.$el.html(this.$el);
  },
  initialize: function() {
    this.render();
  }
});
var DetailView = Backbone.View.extend({
  template: App.templates.item_details,
  id: "item_details",
  events: {
    "click .nav.next": "nextItem",
    "click .nav.prev": "prevItem",
    "click a.add_cart" : "AddToCart",
  },
  getId: function() {
    return this.$el.find('table').data('id');
  },
  AddToCart: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var id = this.getId();
    App.trigger('add_to_cart', id)
  },
  nextItem: function(e) {
    var id = this.getId() + 1,
        model;

    id = id > App.items.length ? 1 : id;
    App.trigger('showDetail', id);
  },
  prevItem: function(e) {
    var id = this.getId() - 1,
        model;

    id = id < 1 ? App.items.length : id;
    App.trigger('showDetail', id);
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    App.$el.html(this.$el);
  },
  initialize: function() {
    this.render();
  }
})
var CartItemsView = Backbone.View.extend({
  template: App.templates.cart,
  id: 'cart',
  events: {
    "click a.left.empty_cart": "emptyCart",
    "click a.right.checkout": "checkout",
  },
  checkout: function(e) {
    App.trigger('checkout');
  },
  emptyCart: function(e) {
    e.preventDefault();
    this.$el.remove();
    App.trigger('empty_cart');
  },
  render: function() {
    //this.collection is array of JSON.
    this.$el.html(this.template(this.collection))
    
    $('main #cart').remove();
    this.$el.insertBefore(App.$el);
  },
  initialize: function() {
    this.render();
  }
});
var CheckoutView = Backbone.View.extend({
  template: App.templates.checkout,
  id: "checkout",
  events: {
    "click .fa-plus": "plus",
    "click .fa-minus": "minus",
    'click footer form input[type="submit"]': "order"
  },
  plus: function(e) {
    App.trigger('plus', e);
  },
  minus: function(e) {
    App.trigger('minus', e);
  },
  order: function(e) {
    console.log('order')
    App.trigger('order', e);
  },
  render: function() {
    this.$el.html(this.template(this.collection.toJSON()));
    App.$el.html(this.$el);
  },
  initialize: function() {
    this.render();
    this.listenTo(App, 'empty_cart', this.render);
  }
})