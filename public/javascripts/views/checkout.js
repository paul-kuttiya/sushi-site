var CheckoutView = Backbone.View.extend({
  template: App.templates.checkout,
  id: "checkout",
  events: {
    "click .fa-plus": "plus",
    "click .fa-minus": "minus",
  },
  plus: function(e) {
    App.trigger('plus', e);
  },
  minus: function(e) {
    App.trigger('minus', e);
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