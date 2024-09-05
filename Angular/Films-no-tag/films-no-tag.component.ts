import { Component, OnInit } from "@angular/core";
import { ApiNasService } from "../../../Services/Api/api-nas.service";
import {filmsDirectory} from "../../environment.ts"
interface Films {
  id: number;
  path: string;
  title: string;
}
interface NasFilmList {
  name: string;
  path: string;
  extension: string;
  tridimentionnal: boolean;
}

@Component({
  selector: "sty-films-no-tag",
  templateUrl: "./films-no-tag.component.html",
  styleUrls: ["./films-no-tag.component.css"],
})
export class FilmsNoTagComponent implements OnInit {
  films: Films[] = [];
  currentFilmIndex: number = 0;
  nasFilmList: NasFilmList[] = [];
  queries: string = `mediaType=film&entries=title, path, poster, id`;
  extensionsFilter = ["mkv", "avi", "m4v", "mp4"];
  queries2: string = `${filmsDirectory}/Films&extensionFilter=${JSON.stringify(
    this.extensionsFilter
  )}`;
  selectedFilm!: any;
  toTag: boolean = false;
  tagAll: boolean = false;

  constructor(private apiNasService: ApiNasService) {}

  async ngOnInit(): Promise<void> {
    try {
      // Get no tag film list from local storage
      const storedData = localStorage.getItem("completeList");

      // Get tagged films
      const films: Films[] = await this.apiNasService
        .getData(this.queries)
        .toPromise();

      //If localstorage is empty, keep list 
      if (!storedData) {
        this.nasFilmList = await this.apiNasService
          .getCompleteList(this.queries2)
          .toPromise();
        this.apiNasService.setCompleteList(this.nasFilmList);
      } else {
        this.nasFilmList = JSON.parse(storedData);
      }

      // keep only no tag films
      this.nasFilmList = this.nasFilmList.filter((film) => {
        return !films.some((taggedFilm) => taggedFilm.path === film.path);
      });
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors du chargement des films",
        error
      );
    }
  }
  onSelectFilm(film: NasFilmList) {
    this.selectedFilm = film;
  }

  onClosePanel(event: any) {
    this.selectedFilm = event;
    this.ngOnInit();
  }

  onOpenTmdb(event: any) {
    this.toTag = event;
  }
  onOpenMultiTmdb(event: any) {
    this.tagAll = event;
  }
  onCloseTmdb(event: any) {
    this.toTag = event;
    this.tagAll = event;
  }
  onNextFilm(event: any) {
    if (this.currentFilmIndex < this.nasFilmList.length - 1) {
      this.currentFilmIndex++;
    } else {
      this.tagAll = false;
    }
  }
}
