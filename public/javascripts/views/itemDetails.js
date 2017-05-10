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