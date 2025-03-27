import { HttpClient } from "@angular/common/http";
import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { environment } from "@enviroments/environment";
import type {  GiphyResponse } from "../interfaces/giphy.interfaces";
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from "../mapper/gif.mapper";
import { map, Observable, tap } from "rxjs";

const GIF_KEY = 'gifs';

const loadFromLocalStorage = (): Record<string, Gif[]> => {
  const gifsFromLocalStorage = localStorage.getItem(GIF_KEY);
  return gifsFromLocalStorage ? JSON.parse(gifsFromLocalStorage) : {};
}

@Injectable({providedIn: 'root'})
export class GifsService {

  private http = inject(HttpClient);
  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(false);
  private trendingPage = signal(0);


  trendingGifGroup = computed<Gif[][]>(() => {
    const groups = [];
    for(let i = 0; i< this.trendingGifs().length; i+=3){
      groups.push(this.trendingGifs().slice(i, i+3));
    }

    return groups;
  })
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
    if(this.trendingGifsLoading()) return;
    console.log(this.trendingPage());
    this.trendingGifsLoading.set(true);
    this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`,{
      params: {
        api_key: environment.giphyApiKey,
        limit: 20,
        offset: this.trendingPage() * 20
      }
    }).subscribe((resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      this.trendingGifs.update(currentGifs => [
        ...currentGifs,
        ...gifs
      ]);
      this.trendingGifsLoading.set(false);
      this.trendingPage.update(page => page + 1);
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
