import { HttpClient } from '@angular/common/http';
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

  // Blueprinting(fromSolidificationContent: string): Observable<string> 
  // {
  //   const requestBody = {
  //     //context: context || '',
  //     SolidificationOutput: fromSolidificationContent,
  //   };
  //   return this.http.post<string>(this.apiurlBlueprinting, requestBody, { responseType: 'text' as 'json' });
  // }
  
  Blueprinting(fromSolidificationContent: string): Observable<{ [key: string]: string }> {
    const requestBody = {
      SolidificationOutput: fromSolidificationContent,
    };
    return this.http.post<{ [key: string]: string }>(this.apiurlBlueprinting, requestBody, { responseType: 'json' });
  }

  // Dummy API method
  // getDummyResponse(input: string): Observable<string> {
  //   const folderStructure = `
  //             Root Folder: ToDOApp/
  //             Frontend/
  //               LoginToDO.cs: Form for user authentication.
  //               TaskCreationForm.cs: Form for creating new tasks.
  //               TaskListingForm.cs: Form for listing and managing tasks.
  //               TaskEditForm.cs: Form for editing existing tasks.
  //             Backend/
  //               LoginService.cs: Handles user login validation.
  //               TaskServiceCreation.cs: Manages task operations for creation.
  //               TaskServiceListing.cs: Manages task operations for listing.
  //               TaskServiceEdit.cs: Manages task operations for editing.
  //             DataAccess/
  //               ApplicationDbContext.cs: Configures the database context.
  //               TaskRepository.cs: Handles CRUD operations for tasks.
  //               UserRepository.cs: Manages user-related data like authentication credentials.
  //               Task.cs: Defines the Task model.
  //               User.cs: Defines the User model.
  //             `;

  //   // Hardcoded responses based on input
  //   const responses: { [key: string]: string } = {
  //     'hello': 'Hello! How can I assist you today?',
  //     'project': 'Your project structure looks great! Here are some suggestions...',
  //     'code': 'Here\'s a sample code snippet for you:\n\nconsole.log("Hello, World!");',
  //     'default': folderStructure
  //   };

  //   // Get the response or use the default if not found
  //   const response = responses[input.toLowerCase()] || responses['default'];

  //   // Simulate API delay
  //   return of(response).pipe(delay(5000));
  // }
}