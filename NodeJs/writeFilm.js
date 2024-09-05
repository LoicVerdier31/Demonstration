module.exports = async (req, res) => {
    const knex = require("knex");
const knexConfig = require("../knexfile.js");
const dataBase = knex(knexConfig.production);
    const { default: axios } = require("axios");
    const film = req.body;
  
    try {
      const downloadedImage = await axios.get(film.poster_url, {
        responseType: "arraybuffer",
      });
      const base64Image = Buffer.from(downloadedImage.data, "binary").toString(
        "base64"
      );
   
      await dataBase.into("FILMS").insert({
        tmdb_id: film.id,
        title: film.title,
        path: film.path,
        extension: film.extension,
        genres: JSON.stringify(film.genres),
        release_date: film.release_date,
        overview: film.overview,
        director: film.director,
        poster: base64Image,
        tridimentionnal: film.tridimentionnal,
        actors: JSON.stringify(film.actors),
      });
  
      res
        .status(200)
        .send({ validation: "les données du film ont été enregistrées" });
    } catch (error) {
      if (error.code === "23505" || error.constraint === "UNIQUE") {
        const message = "Le film existe déjà";
        res.send({ ignore: message });
        
      } else {
        console.error("Erreur lors de l'écriture des détails du film:", error);
        res
          .status(500)
          .send({ error: "Erreur lors de l'enregistrement des détails du film" });
      }
    }finally{
      await dataBase.destroy()}
  };