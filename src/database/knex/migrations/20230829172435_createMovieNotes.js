exports.up = knex => knex.schema.createTable("films", table => {
  table.increments("id")
  table.text("title")
  table.text("description")
  table.integer("rating").notNull()
  table.integer("user_id").references("id").inTable("users")

  table.timestamp("created_at").default(knex.fn.now())
  table.timestamp("updated_at").default(knex.fn.now())
})

exports.down = knex => knex.schema.dropTable("films")