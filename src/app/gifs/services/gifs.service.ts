import { HttpClient } from "@angular/common/http";
import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { environment } from "@enviroments/environment";
import type {  GiphyResponse } from "../interfaces/giphy.interfaces";
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from "../mapper/gif.mapper";
import { map, Observable, tap } from "rxjs";

const GIF_KEY = 'gifs';

const loadFromLocalStorage = (): Record<string, Gif[]> => {
  const history = localStorage.getItem(GIF_KEY);
  return history ? JSON.parse(history) : {};
}

@Injectable({providedIn: 'root'})
export class GifsService {

  private http = inject(HttpClient);
  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(true);

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  saveGifsToLocalStorage = effect(()=> {
    const gifsHistory = JSON.stringify(this.searchHistory());
    localStorage.setItem(GIF_KEY, gifsHistory);
  })

  constructor() {
    this.loadTrendingGifs();
  }

  loadTrendingGifs(){
    this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`,{
      params: {
        api_key: environment.giphyApiKey,
        limit: 10
      }
    }).subscribe((resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      this.trendingGifs.set(gifs);
      this.trendingGifsLoading.set(false);
      console.log(gifs);
    })
  }

  searchGifs(query:string): Observable<Gif[]>{
    return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`,{
      params: {
        api_key: environment.giphyApiKey,
        limit: 10,
        q: query
      }
    }).pipe(
      map(
        (({data}) => data)
        ),
        map((items) => GifMapper.mapGiphyItemsToGifArray(items)),
        tap((items)=> {
          this.searchHistory.update(history => ({
            ...history,
            [query.toLowerCase()]: items,
          }))
        })
    );/* .subscribe((resp)=> {
      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      console.log(gifs);
    }) */

  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }
}
