import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService 
{
  constructor(private http: HttpClient)
  { }

   private apiUrl = 'http://localhost:5192/api/BRDAnalyzer/analyse'; 
   private apiurlsolidify = "http://localhost:5192/api/BRDAnalyzer/solidify";
   private apiurlBlueprinting ="http://localhost:5192/api/BRDAnalyzer/BluePrinting";
   private apiurlCodesynthesis = "http://localhost:5192/api/BRDAnalyzer/CodeSynthesis";

   APIanalyzeBRD(context: string, brdContent: string, task: string): Observable<string> 
   {
    const requestBody = {
      context: context || '',
      BRDContent: brdContent,
      task: task
    };
    return this.http.post<string>(this.apiUrl, requestBody, { responseType: 'text' as 'json' });
  }

  Solidify(fromInsightContent: string): Observable<string> 
  {
    const requestBody = {
      //context: context || '',
      AnalysisResult: fromInsightContent,
    };
    return this.http.post<string>(this.apiurlsolidify, requestBody, { responseType: 'text' as 'json' });
  }

  Blueprinting(fromSolidificationContent: string): Observable<{ [key: string]: string }> {
    const requestBody = {
      SolidificationOutput: fromSolidificationContent,
    };
    return this.http.post<{ [key: string]: string }>(this.apiurlBlueprinting, requestBody, { responseType: 'json' });
  }


  // Codesynthesis(Filename: string, Filecontent:string, k:number): Observable<string> 
  // {
  //   const requestBody = {
  //     filename: Filename,
  //     filecontent: Filecontent,
  //     i: k
  //   };
  //   console.log("requestBody :", requestBody);
  //   return this.http.post<string>(this.apiurlCodesynthesis, requestBody,{responseType: 'text' as 'json' });
  // }
  Codesynthesis(folderstructure: any): Observable<any> 
  {
    const requestBody = {
      FolderStructure : folderstructure} ;
    console.log("requestBody :", requestBody);
    return this.http.post<any>(this.apiurlCodesynthesis, requestBody,{responseType: 'text' as 'json' });
  }

  
}