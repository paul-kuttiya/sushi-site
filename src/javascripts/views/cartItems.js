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