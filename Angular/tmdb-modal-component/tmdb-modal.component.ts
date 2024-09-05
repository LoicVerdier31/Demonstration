import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TmdbServiceService } from "src/app/Services/tmdb/tmdb-service.service";
import { ApiNasService } from "src/app/Services/Api/api-nas.service";

interface Results {
  title: string;
  poster_path: string;
  release_date: string;
  overview: string;
}

interface GenresList {
  name: string;
  id: number;
}

interface Film {
  id: number;
  title: string;
  path: string;
  extension: string;
  genres: any;
  release_date: string;
  overview: string;
  director: {};
  poster_url: string;
  tridimensionnal: boolean;
  actors: [];
}

interface Director {
  tmdb_id: number;
  name: string;
  photo: string;
  biography: string;
  place_of_birth: string;
  birthday: string;
  deathday: string;
  filmography: [];
}

interface Actor {
  tmdb_id: number;
  name: string;
  photo: string;
  biography: string;
  place_of_birth: string;
  birthday: string;
  deathday: string;
  filmography: [];
}

@Component({
  selector: "sty-tmdb-modal",
  templateUrl: "./tmdb-modal.component.html",
  styleUrls: ["./tmdb-modal.component.css"],
})
export class TmdbModalComponent implements OnInit {
  @Input() selectedFilm!: any;
  @Input() tagType!: number;
  genresList: GenresList[] = [];
  loading: boolean = false
  film: Film[] = [];
  results: Results[] = [];
  director: Director[] = [];
  actor: Actor[] = [];
  @Output() closeTmdb = new EventEmitter<any>();
  @Output() nextFilm = new EventEmitter<any>();

  constructor(
    private apiTmdbService: TmdbServiceService,
    private apiNasService: ApiNasService
  ) {}

  async ngOnInit(): Promise<void> {

    await this.getFilmData(this.selectedFilm);
  }

  async getFilmData(film: any): Promise<void> {
    try {

      // get genres list and general film informations
      const genresResponse = await this.apiTmdbService
        .getGenresList()
        .toPromise();
      this.genresList = genresResponse.genres;
      const filmInfosResponse = await this.apiTmdbService
        .getFilmsInfos(film.name)
        .toPromise();
      this.results = filmInfosResponse.results;
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la récupération des données :",
        error
      );
    }
  }

  async onValidation(film: any): Promise<void> {
    this.loading=true
    try {
      // Save film informations
      await this.processFilmData(film);

      // Save director informations
      if (this.film[0].director) {
        await this.processDirectorData(this.film[0].director);
      }

      // Save actors informations
      if (this.film[0].actors && this.film[0].actors.length > 0) {
        for (const actor of this.film[0].actors) {
          await this.processActorData(actor);
        }
      }
      if (this.tagType === 1){ 
        this.loading=false
        this.closeTmdb.emit(false);}
      else {
        this.loading=false
        this.nextFilm.emit(true);
      }
    } catch (error) {
      console.error("Une erreur est survenue lors du traitement :", error);
    }
  }

  async processFilmData(film: any): Promise<void> {
    try {
      const movieCredits = await this.apiTmdbService
        .getMovieCredits(film.id)
        .toPromise();
      const genres = this.genresList.filter((genre) =>
        film.genre_ids.includes(genre.id)
      );
      const findDirector = movieCredits.crew.find(
        (crewMember: any) => crewMember.job === "Director"
      );
      const director = findDirector
        ? { name: findDirector.name, tmdb_id: findDirector.id }
        : {};

      this.film[0] = {
        id: film.id,
        title: film.title,
        path: this.selectedFilm.path,
        extension: this.selectedFilm.extension,
        genres: genres.map((genre: any) => ({
          id: genre.id,
          name: genre.name,
        })),
        release_date: film.release_date,
        overview: film.overview,
        director: director,
        poster_url: `https://image.tmdb.org/t/p/w500/${film.poster_path}`,
        tridimensionnal: this.selectedFilm.tridimensionnal,
        actors: movieCredits.cast.map((actor: any) => ({
          tmdb_id: actor.id,
          name: actor.name,
          character: actor.character,
        })),
      };

      const postFilmResponse = await this.apiNasService
        .writeFilm(this.film[0])
        .toPromise();
      console.log(postFilmResponse);
    } catch (error) {
      console.error(
        "Une erreur est survenue lors du traitement des données du film :",
        error
      );
    }
  }

  async processDirectorData(director: any): Promise<void> {
    try {
      const directorInfos = await this.apiTmdbService
        .getPersonInfos(director.tmdb_id)
        .toPromise();
      const directorFilmography = await this.apiTmdbService
        .getPersonFilmography(director.tmdb_id)
        .toPromise();

      this.director[0] = {
        tmdb_id: directorInfos.id,
        name: directorInfos.name,
        photo: `https://image.tmdb.org/t/p/w500${directorInfos.profile_path}`,
        biography: directorInfos.biography,
        place_of_birth: directorInfos.place_of_birth,
        birthday: directorInfos.birthday,
        deathday: directorInfos.deathday,
        filmography: directorFilmography.crew
          .filter((film: any) => film.job === "Director")
          .map((film: any) => ({
            title: film.title,
            release_date: film.release_date,
          })),
      };

      const postDirectorResponse = await this.apiNasService
        .writeDirector(this.director[0])
        .toPromise();
      console.log(postDirectorResponse);
    } catch (error) {
      console.error(
        "Une erreur est survenue lors du traitement des données du réalisateur :",
        error
      );
    }
  }

  async processActorData(actor: any): Promise<void> {
    try {
      const actorInfos = await this.apiTmdbService
        .getPersonInfos(actor.tmdb_id)
        .toPromise();
      const actorFilmography = await this.apiTmdbService
        .getPersonFilmography(actor.tmdb_id)
        .toPromise();

      this.actor[0] = {
        tmdb_id: actorInfos.id,
        name: actorInfos.name,
        photo: `https://image.tmdb.org/t/p/w500${actorInfos.profile_path}`,
        biography: actorInfos.biography,
        place_of_birth: actorInfos.place_of_birth,
        birthday: actorInfos.birthday,
        deathday: actorInfos.deathday,
        filmography: actorFilmography.cast.map((film: any) => ({
          title: film.title,
          release_date: film.release_date,
        })),
      };

      const postActorResponse = await this.apiNasService
        .writeActor(this.actor[0])
        .toPromise();
      console.log(postActorResponse);
    } catch (error) {
      console.error(
        "Une erreur est survenue lors du traitement des données de l'acteur :",
        error
      );
    }
  }

  onCloseTmdb() {
    this.closeTmdb.emit(false);
  }

  onNextFilm() {
    this.nextFilm.emit(true);
  }

  onChangeCheckbox(event: any) {
    this.selectedFilm.tridimensionnal = event.target.checked;
  }
}
