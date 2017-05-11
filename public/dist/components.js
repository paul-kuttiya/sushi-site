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
var Item = Backbone.Model.extend({});
var CartItem = Backbone.Model.extend({});
var Items = Backbone.Collection.extend({
  model: Item
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
    console.log(id)
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
    console.log(id)
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
  render: function() {
    this.$el.html(this.template(this.collection.toJSON()));
    App.$el.html(this.$el);
  },
  initialize: function() {
    this.render();
    this.listenTo(App, 'empty_cart', this.render);
  }
})