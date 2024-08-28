import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../Services/api.service';
import { take } from 'rxjs';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent {

  
  activeTab: string = 'Insight Elicitation';
  activeBlueprintingSubTab: string = 'Requirement Summary';
 
  // Properties for the Blueprinting sub-tabs
  requirementSummary: string = '';
  solutionOverview: string = '';
  projectStructure: string = '';
  dataFlow: string = '';
  unitTesting: string = '';
  commonFunctionalities: string = '';
  databaseScripts: string = '';
  parsedStructure:any;
 
  taskInput: string = '';
  promptLimit: number = 2048;
  tokenLimit: number = 4096;
 
 
  // Other properties
  inputText: string = '';
  outputText: string = '';
  tokenCount: number = 0;
  completionTokens: number = 0;
  promptTokens: number = 0;
  totalTokens: number = 0;
  technicalRequirement: string = '';
  solutionDesign: string = '';
  blueprintingContent: string = '';
 
  // Property for Code Synthesis
  codeSynthesisContent: string = '';
  isAnalyzing: boolean =  false;
  response: boolean = false;

  constructor(private apiService: ApiService){}
 
  // Tabs and sub-tabs
  tabs: string[] = ['Insight Elicitation', 'Solidification', 'Blueprinting', 'Code Synthesis'];
  blueprintingSubTabs: string[] = [
    'Requirement Summary',
    'Solution Overview',
    'Project Structure',
    'Data Flow',
    'Unit Testing',
    'Common Functionalities',
    'Database Scripts'
  ];
 
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
 
  setActiveBlueprintingSubTab(subTab: string) {
    this.activeBlueprintingSubTab = subTab;
  }
 
  startBluePrinting() 
  {
    this.requirementSummary = `Technical Requirement:\n${this.technicalRequirement}\n\nSolution Design:\n${this.solutionDesign}`;
    this.setActiveTab('Blueprinting');
    this.setActiveBlueprintingSubTab('Requirement Summary');
  }
 
  startCodeSynthesis() {
    this.codeSynthesisContent = `Blueprint:\n${this.blueprintingContent}`;
    this.setActiveTab('Code Synthesis');
  }
uploadBRD() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt'; // Specify the file types you want to allow

    input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const file = target.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                if (e.target) {
                    const text = e.target.result as string;
                    this.inputText = text; // Assuming inputtext is a global variable
                    console.log('File content:', text);
                } else {
                    console.error('Error: e.target is null');
                }
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
            };

            reader.readAsText(file);
        }
    };

    input.click();
}

  getTokenCount() {}

  analyzeBRD() 
  {
    this.isAnalyzing = true;
    this.response = false;
    this.apiService.APIanalyzeBRD('', this.inputText, this.taskInput).pipe(take(1)).subscribe(
      response => {
        this.outputText = response;
        if (this.outputText.length > 0)
          {
            this.isAnalyzing = false;
            this.response = true
          }
        // Stop the spinner after the response
      },
      error => {
        console.error("Error during BRD analysis:", error);
       
 
        this.isAnalyzing = false; // Stop the spinner even if there's an error
      }
    );
  }
  saveBRD() {}
  saveContextHistory() {}
  showContextHistory() {}

  solidify() 
  {
    // this.technicalRequirement = this.outputText;
    this.isAnalyzing = true;
    this.response = false;
    //console.log(this.outputText,"this.outputtext");
    this.apiService.Solidify(this.outputText).subscribe(
      response => {
        this.technicalRequirement = response;
        if (this.technicalRequirement.length > 0)
          {
            this.isAnalyzing = false;
            this.response = true
          }
        // Stop the spinner after the response
      },
      error => {
        console.error("Error during Solidify:", error);
       
 
        this.isAnalyzing = false; // Stop the spinner even if there's an error
      }
    );
  }

 
    blueprinting() 
    {
      this.apiService.Blueprinting(this.technicalRequirement).subscribe(
        (response: { [key: string]: string }) => {
          this.solutionOverview = response["solutionOverview"];
          this.dataFlow = response["dataFlow"];
          this.commonFunctionalities = response["commonFunctionalities"];
          this.projectStructure = response["projectStructure"];

          console.log("json", this.projectStructure);
         //this.fetchFolderStructure(this.projectStructure);
          //this.parsedStructure =  this.parseProjectStructure(this.projectStructure);
          //console.log('Blueprinting response:', response);
          // Handle the response here
            },      
          (error) => {
          console.error('Error:', error);
          //Handle the error here
        }
      );
    }

    // parseProjectStructure(projectStructure: string): any 
    // {
    //   const structure = {
    //     solutionName: '',
    //     rootFolder: '',
    //     projects: [] as any[]
    //   };
     
    //   const lines = projectStructure.split('\n').map(line => line.trim());
     
     
    //   let currentProject: any = null;
     
    //   lines.forEach(line => {
    //     if (line.startsWith('Solution Name:')) {
    //       structure.solutionName = line.replace('Solution Name:', '').trim();
    //     } else if (line.startsWith('Root Folder:')) {
    //       structure.rootFolder = line.replace('Root Folder:', '').trim();
    //     } else if (line.startsWith('Project Name:')) {
    //       if (currentProject) {
    //         structure.projects.push(currentProject);
    //       }
    //       currentProject = {
    //         projectName: line.replace('Project Name:', '').trim(),
    //         files: []
    //       };
    //     } else if (line.startsWith('File Name:')) {
    //       if (currentProject) {
    //         currentProject.files.push({
    //           fileName: line.replace('File Name:', '').trim(),
    //           codingLanguage: '',
    //           technologyStack: '',
    //           filePurpose: ''
    //         });
    //       }
    //     } else if (line.startsWith('Coding Language:')) {
    //       currentProject.files[currentProject.files.length - 1].codingLanguage = line.replace('Coding Language:', '').trim();
    //     } else if (line.startsWith('Technology Stack:')) {
    //       currentProject.files[currentProject.files.length - 1].technologyStack = line.replace('Technology Stack:', '').trim();
    //     } else if (line.startsWith('File Purpose and Context:')) {
    //       currentProject.files[currentProject.files.length - 1].filePurpose = line.replace('File Purpose and Context:', '').trim();
    //     }
    //   });
     
    //   // Push the last project if it exists
    //   if (currentProject) {
    //     structure.projects.push(currentProject);
    //   }
     
    //   return structure;
    // }
    
    // fetchFolderStructure()
    // {
    //    this.blueprinting();
    // }

 
 
 
 
  projectStructureDescription: string = 'This is the folder structure for our Todo List application. It includes frontend, backend, and data access layers.';
  //projectStructureDescription: string = this.projectStructure;
  folderStructure: any[] = [];
  selectedFileContent: string = '';
 
  ngOnInit() {
    this.fetchFolderStructure();
  }
 
  // fetchFolderStructure() {
  //   this.folderStructure = [
  //     {
  //       name: 'todolistapp',
  //       type: 'folder',
  //       expanded: false,
  //       children: [
  //         {
  //           name: 'frontend',
  //           type: 'folder',
  //           expanded: false,
  //           children: [
  //             { name: 'logintodo.cs', type: 'file' },
  //             { name: 'taskcreationform.cs', type: 'file' },
  //             { name: 'tasklistingform.cs', type: 'file' },
  //             { name: 'taskeditform.cs', type: 'file' }
  //           ]
  //         },
  //         {
  //           name: 'backend',
  //           type: 'folder',
  //           expanded: false,
  //           children: [
  //             { name: 'loginservice.cs', type: 'file' },
  //             { name: 'taskservicecreation.cs', type: 'file' },
  //             { name: 'taskservicelisting.cs', type: 'file' },
  //             { name: 'taskserviceedit.cs', type: 'file' }
  //           ]
  //         },
  //         {
  //           name: 'dataaccess',
  //           type: 'folder',
  //           expanded: false,
  //           children: [
  //             { name: 'applicationdbcontext.cs', type: 'file' },
  //             { name: 'taskrepository.cs', type: 'file' },
  //             { name: 'userrepository.cs', type: 'file' },
  //             { name: 'task.cs', type: 'file' },
  //             { name: 'user.cs', type: 'file' }
  //           ]
  //         }
  //       ]
  //     }
  //   ];
  // }

  fetchFolderStructure() 
  {
    const solutionStructureText = `Solution Name: ToDoListSolution
Root Folder: ToDoListApp
Project Name: ToDoListProject
Project Path: ToDoListApp/ToDoListProject
File Name: MainForm.cs (C#, Windows Forms, Main UI Form for task management, Methods: InitializeComponents, CreateTask, EditTask, DeleteTask, Data Validation: Check for null or empty fields, Error Handling: Try-catch blocks for UI actions, Logging: Log user actions, Interactions and Dependencies: Depends on backend services, Integration Points: None)
File Name: TaskRepository.cs (C#, .NET Core, Handles CRUD operations for tasks, Methods: AddTask, GetTasks, UpdateTask, DeleteTask, Data Validation: Ensure data integrity, Error Handling: Handle database exceptions, Logging: Log database operations, Interactions and Dependencies: Depends on Entity Framework Core, Integration Points: SQL Server)
File Name: UserRepository.cs (C#, .NET Core, Manages user authentication data, Methods: AddUser, GetUser, ValidateUser, Data Validation: Ensure valid user data, Error Handling: Handle database exceptions, Logging: Log user operations, Interactions and Dependencies: Depends on Entity Framework Core, Integration Points: SQL Server)
File Name: AuthenticationService.cs (C#, .NET Core, Manages user authentication and session, Methods: Login, Logout, Register, Data Validation: Validate user credentials, Error Handling: Handle authentication errors, Logging: Log authentication attempts, Interactions and Dependencies: Depends on UserRepository, Integration Points: None)
File Name: Program.cs (C#, .NET Core, Entry point of the application, Methods: Main, Data Validation: None, Error Handling: Handle application startup errors, Logging: Log application start and end, Interactions and Dependencies: Depends on MainForm, Integration Points: None)`;
    //console.log("Text",solutionStructureText);
  
    this.folderStructure = this.parseSolutionStructure(solutionStructureText);
    console.log(this.folderStructure);
  }
  
 
  parseSolutionStructure(text: string): any[] {
    const lines = text.split('\n');
    console.log("text", text);
    const rootFolderStack: any[] = [];
    let currentFolder: any = null;
    let currentProject: any = null;
    let currentFile: any = null;
    let currentMethod: any = null;
  
    lines.forEach(line => {
      line = line.trim();
  
      // Remove leading '-' and extra spaces
      line = line.replace(/^-+\s*/, '');
      console.log("line",line);
      // Console logging for debugging
      console.log(`Parsing line: "${line}"`);
  
      if (line.startsWith('Solution Name:')) {
        const name = line.replace('Solution Name:', '').trim();
        currentFolder = { name, type: 'folder', children: [] };
        rootFolderStack.push(currentFolder);
        console.log('Added root folder:', currentFolder);
      } else if (line.startsWith('Root Folder:')) {
        const name = line.replace('Root Folder:', '').trim();
        const rootFolder = { name, type: 'folder', children: [] };
        rootFolderStack.push(rootFolder);
        currentFolder = rootFolder;
        console.log('Updated root folder:', currentFolder);
      } else if (line.startsWith('Project Path:')) {
        // Skip the project path line
        console.log('Skipping Project Path line');
        return;
      } else if (line.startsWith('Project Name:')) {
        const name = line.replace('Project Name:', '').trim();
        const projectFolder = { name, type: 'folder', children: [] };
        if (currentFolder) {
          currentFolder.children.push(projectFolder);
          currentProject = projectFolder;
          console.log('Added project folder:', projectFolder);
        }
      } else if (line.startsWith('File Name:')) {
        const name = line.replace('File Name:', '').trim();
        if (currentProject) {
          currentProject.children = currentProject.children || [];
          currentFile = { name, type: 'file', details: {} };
          currentProject.children.push(currentFile);
          console.log('Added file:', currentFile);
        }
      } else if (line.startsWith('Coding Language:') && currentFile) {
        currentFile.details['Coding Language'] = line.replace('Coding Language:', '').trim();
        console.log('Added Coding Language to file:', currentFile);
      } else if (line.startsWith('Technology Stack:') && currentFile) {
        currentFile.details['Technology Stack'] = line.replace('Technology Stack:', '').trim();
        console.log('Added Technology Stack to file:', currentFile);
      } else if (line.startsWith('File Purpose and Context:') && currentFile) {
        currentFile.details['File Purpose and Context'] = line.replace('File Purpose and Context:', '').trim();
        console.log('Added File Purpose and Context to file:', currentFile);
      } else if (line.startsWith('Methods:') && currentFile) {
        currentFile.details['Methods'] = [];
        console.log('Starting Methods section for file:', currentFile);
      } else if (line.startsWith('Method Name:') && currentFile) {
        const methodName = line.replace('Method Name:', '').trim();
        currentMethod = { name: methodName, details: {} };
        if (currentFile) {
          currentFile.details['Methods'] = currentFile.details['Methods'] || [];
          currentFile.details['Methods'].push(currentMethod);
          console.log('Added method:', currentMethod);
        }
      } else if (line.startsWith('Purpose:') && currentMethod) {
        const purpose = line.replace('Purpose:', '').trim();
        currentMethod.details['Purpose'] = purpose;
        console.log('Added Purpose to method:', currentMethod);
      } else if (line.startsWith('Parameters:') && currentMethod) {
        const parameters = line.replace('Parameters:', '').trim();
        currentMethod.details['Parameters'] = parameters;
        console.log('Added Parameters to method:', currentMethod);
      } else if (line.startsWith('Output:') && currentMethod) {
        const output = line.replace('Output:', '').trim();
        currentMethod.details['Output'] = output;
        console.log('Added Output to method:', currentMethod);
      } else if (line.startsWith('Data Validation:') && currentFile) {
        currentFile.details['Data Validation'] = line.replace('Data Validation:', '').trim();
        console.log('Added Data Validation to file:', currentFile);
      } else if (line.startsWith('Error Handling:') && currentFile) {
        currentFile.details['Error Handling'] = line.replace('Error Handling:', '').trim();
        console.log('Added Error Handling to file:', currentFile);
      } else if (line.startsWith('Logging:') && currentFile) {
        currentFile.details['Logging'] = line.replace('Logging:', '').trim();
        console.log('Added Logging to file:', currentFile);
      } else if (line.startsWith('Interactions and Dependencies:') && currentFile) {
        currentFile.details['Interactions and Dependencies'] = line.replace('Interactions and Dependencies:', '').trim();
        console.log('Added Interactions and Dependencies to file:', currentFile);
      } else if (line.startsWith('Integration Points:') && currentFile) {
        currentFile.details['Integration Points'] = line.replace('Integration Points:', '').trim();
        console.log('Added Integration Points to file:', currentFile);
      } else {
        console.log('Unhandled line:', line);
      }
    });
  
    console.log('Parsed structure:', JSON.stringify(rootFolderStack, null, 2)); // Log final structure
    return rootFolderStack;
  }
 
  fetchFileContent(fileName: string) {
    // In a real application, you would fetch the actual file content from the backend
    const file = this.findFileByName(fileName, this.folderStructure);
    if (file) {
      this.selectedFileContent = this.formatFileDetails(file);
    } else {
      this.selectedFileContent = 'File not found.';
    }
  }
 
  findFileByName(name: string, folderStructure: any[]): any {
    for (const folder of folderStructure) {
      if (folder.type === 'folder') {
        const result = this.findFileByName(name, folder.children);
        if (result) return result;
} else if (folder.type === 'file' && folder.name === name) {
        return folder;
      }
    }
    return null;
  }
 
  formatFileDetails(file: any): string {
let details = `File Name: ${file.name}\n`;
    for (const [key, value] of Object.entries(file.details)) {
      if (Array.isArray(value)) {
        details += `${key}:\n- ${value.join('\n- ')}\n`;
      } else {
        details += `${key}: ${value}\n`;
      }
    }
    return details;
  }
 
  // fetchFileContent(fileName: string) {
  //   // In a real application, you would fetch the actual file content from the backend
  //   this.selectedFileContent = `This is the content of ${fileName}. In a real application, this would be the actual file content.`;
  // }
 
 
 
  toggleFolder(folder: any) {
    folder.expanded = !folder.expanded;
  }
 
 
  codeSynthesisFolderStructure: any[] = [
    {
      name: 'todolistapp',
      type: 'folder',
      expanded: false,
      children: [
        {
          name: 'src',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'main.ts', type: 'file' },
            { name: 'app.module.ts', type: 'file' },
            {
              name: 'components',
              type: 'folder',
              expanded: false,
              children: [
                { name: 'todo-list.component.ts', type: 'file' },
                { name: 'todo-item.component.ts', type: 'file' }
              ]
            },
            {
              name: 'services',
              type: 'folder',
              expanded: false,
              children: [
                { name: 'todo.service.ts', type: 'file' }
              ]
            }
          ]
        },
        { name: 'package.json', type: 'file' },
        { name: 'tsconfig.json', type: 'file' }
      ]
    }
  ];
 
  selectedCodeFile: string = '';
  selectedCodeContent: string = '';
 
  toggleCodeFolder(folder: any) {
    folder.expanded = !folder.expanded;
  }
 
  fetchCodeFileContent(fileName: string) {
    this.selectedCodeFile = fileName;
    this.selectedCodeContent = `// This is the content of ${fileName}\n// Actual code would be displayed here in a real application.`;
  }
 
  startCodeSynthesistest() {
    this.codeSynthesisContent = `Blueprint:\n${this.blueprintingContent}`;
    this.setActiveTab('Code Synthesis');
  }
 
}