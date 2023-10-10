const knex = require("../database/knex");

class NotesController{
  async create(request, response){
    const{ title, description, tags } = request.body
    const user_id = request.user.id

    const [notes_id] = await knex("notes").insert({ title, description, user_id})

    const tagsInsert = tags.map(name =>{
      return {
        notes_id,
        name,
        user_id
      }
    })
    await knex("tags").insert(tagsInsert)

    response.json();
  }

  async show(request, response){
    const { id } = request.params

    const notes = await knex("notes").where({ id }).first()
    const tags = await knex("tags").where({ notes_id: id }).orderBy("name")

    return response.json({
      ...notes,
      tags
    })
  }

  async delete(request, response){
    const { id } = request.params

    await knex("notes").where({ id }).delete()

    return response.json()
  }

  async index(request, response){
    const { title, tags } = request.query
    const user_id = request.user.id

    let notes
      if(tags){
        const filterTags = tags.split(',').map(tag => tag.trim())

        notes = await knex("tags")
        .select([
          "notes.id",
          "notes.title",
          "notes.user_id",
        ])
        .where("notes.user_id", user_id)
        .whereLike("notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("notes", "notes.id", "tags.notes_id")
        .orderBy("notes.title")
    }
      else {
      notes = await knex("notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const userTags = await knex("tags").where({ user_id })
    const notesWithTags = notes.map(notes =>{
      const notesTags = userTags.filter(tag => tag.notes_id === notes.id)

        return {
          ...notes,
          tags: notesTags
      }
    })

    return response.json(notesWithTags)
  }
}

module.exports = notesController