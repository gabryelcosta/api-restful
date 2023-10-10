const knex = require("../database/knex");

class FilmsController{
  async create(request, response){
    const{ title, description, rating, tags } = request.body
    const user_id = request.user.id

    const [films_id] = await knex("films").insert({ title, description, rating, user_id})

    const tagsInsert = tags.map(name =>{
      return {
        films_id,
        name,
        user_id
      }
    })
    await knex("tags").insert(tagsInsert)

    response.json();
  }

  async show(request, response){
    const { id } = request.params

    const films = await knex("films").where({ id }).first()
    const tags = await knex("tags").where({ films_id: id }).orderBy("name")

    return response.json({
      ...films,
      tags
    })
  }

  async delete(request, response){
    const { id } = request.params

    await knex("films").where({ id }).delete()

    return response.json()
  }

  async index(request, response){
    const { title, tags } = request.query
    const user_id = request.user.id

    let films
      if(tags){
        const filterTags = tags.split(',').map(tag => tag.trim())

        films = await knex("tags")
        .select([
          "films.id",
          "films.title",
          "films.user_id",
        ])
        .where("films.user_id", user_id)
        .whereLike("films.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("films", "films.id", "tags.films_id")
        .orderBy("films.title")
    }
      else {
      films = await knex("films")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const userTags = await knex("tags").where({ user_id })
    const filmsWithTags = films.map(films =>{
      const filmsTags = userTags.filter(tag => tag.films_id === films.id)

        return {
          ...films,
          tags: filmsTags
      }
    })

    return response.json(filmsWithTags)
  }
}

module.exports = FilmsController