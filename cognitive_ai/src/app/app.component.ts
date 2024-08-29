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

          console.log("projectstructure", this.projectStructure);
         // this.fetchFolderStructure(this.projectStructure);
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
    const solutionStructureText = `- Solution Name: ToDoListApp
   - Root Folder: ToDoListApp
   - Project Path: ToDoListApp/ToDoListApp
   - File Name: ToDoListApp.sln
   
   - Project Name: ToDoListApp
   - Project Path: ToDoListApp/ToDoListApp
     - File Name: Task.cs
       - Coding Language: C#
       - Technology Stack: .NET Core
       - File Purpose and Context: Define the Task model
       - Methods:
         - Method Name: Validate
           - Purpose: Validate task data
           - Parameters: None
           - Output: Boolean
       - Data Validation: Ensure Title, Description are within character limits
       - Error Handling: Return validation errors
       - Logging: Log validation process
       - Interactions and Dependencies: N/A
       - Integration Points: N/A
     - File Name: User.cs
       - Coding Language: C#
       - Technology Stack: .NET Core
       - File Purpose and Context: Define the User model
       - Methods:
         - Method Name: Validate
           - Purpose: Validate user data
           - Parameters: None
           - Output: Boolean
       - Data Validation: Ensure username and password meet criteria
       - Error Handling: Return validation errors
       - Logging: Log validation process
       - Interactions and Dependencies: N/A
       - Integration Points: N/A
     - File Name: TaskRepository.cs
       - Coding Language: C#
       - Technology Stack: .NET Core, Entity Framework Core
       - File Purpose and Context: Handle database operations for tasks
       - Methods:
         - Method Name: CreateTask
           - Purpose: Add a new task
           - Parameters: Task task
           - Output: Void
         - Method Name: GetTasks
           - Purpose: Retrieve tasks
           - Parameters: None
           - Output: List<Task>
         - Method Name: UpdateTask
           - Purpose: Update a task
           - Parameters: Task task
           - Output: Void
         - Method Name: DeleteTask
           - Purpose: Delete a task
           - Parameters: int taskId
           - Output: Void
       - Data Validation: Validate task data before database operations
       - Error Handling: Handle database errors
       - Logging: Log database operations
       - Interactions and Dependencies: Entity Framework Core
       - Integration Points: SQL Server
     - File Name: UserRepository.cs
       - Coding Language: C#
       - Technology Stack: .NET Core, Entity Framework Core
       - File Purpose and Context: Handle database operations for users
       - Methods:
         - Method Name: CreateUser
           - Purpose: Add a new user
           - Parameters: User user
           - Output: Void
         - Method Name: GetUser
           - Purpose: Retrieve user by username
           - Parameters: string username
           - Output: User
       - Data Validation: Validate user data before database operations
       - Error Handling: Handle database errors
       - Logging: Log database operations
       - Interactions and Dependencies: Entity Framework Core
       - Integration Points: SQL Server
     - File Name: TaskService.cs
       - Coding Language: C#
       - Technology Stack: .NET Core
       - File Purpose and Context: Implement business logic for tasks
       - Methods:
         - Method Name: CreateTask
           - Purpose: Add a new task
           - Parameters: Task task
           - Output: Void
         - Method Name: GetTasks
           - Purpose: Retrieve tasks
           - Parameters: None
           - Output: List<Task>
         - Method Name: UpdateTask
           - Purpose: Update a task
           - Parameters: Task task
           - Output: Void
         - Method Name: DeleteTask
           - Purpose: Delete a task
           - Parameters: int taskId
           - Output: Void
       - Data Validation: Validate task data before business operations
       - Error Handling: Handle business logic errors
       - Logging: Log business operations
       - Interactions and Dependencies: TaskRepository
       - Integration Points: N/A
     - File Name: UserService.cs
       - Coding Language: C#
       - Technology Stack: .NET Core
       - File Purpose and Context: Implement business logic for users
       - Methods:
         - Method Name: CreateUser
           - Purpose: Add a new user
           - Parameters: User user
           - Output: Void
         - Method Name: AuthenticateUser
           - Purpose: Authenticate a user
           - Parameters: string username, string password
           - Output: Boolean
       - Data Validation: Validate user data before business operations
       - Error Handling: Handle business logic errors
       - Logging: Log business operations
       - Interactions and Dependencies: UserRepository
       - Integration Points: Authentication Service`;
    //console.log("Text",solutionStructureText);
  
    this.folderStructure = this.parseSolutionStructure(solutionStructureText);
    //console.log(this.folderStructure);
  }
  
 
  parseSolutionStructure(text: string): any[] {
    const lines = text.split('\n');
    const rootFolderStack: any[] = [];
    let currentFolder: any = null;
    let currentProject: any = null;
    let currentFile: any = null;
 
    lines.forEach(line => {
      line = line.trim();
      line = line.replace(/^-+\s*/,'');
      if (line.startsWith('Solution Name:')) {
        const name = line.replace('Solution Name:', '').trim();
        currentFolder = { name, type: 'folder', children: [] };
        rootFolderStack.push(currentFolder);
      } else if (line.startsWith('Root Folder:')) {
        const name = line.replace('Root Folder:', '').trim();
        const rootFolder = { name, type: 'folder', children: [] };
        rootFolderStack.push(rootFolder);
        currentFolder = rootFolder;
      } else if (line.startsWith('Project Name:')) {
        const name = line.replace('Project Name:', '').trim();
        const projectFolder = { name, type: 'folder', children: [] };
        if (currentFolder) {
          currentFolder.children.push(projectFolder);
          currentProject = projectFolder;
        }
      } else if (line.startsWith('File Name:')) {
        const name = line.replace('File Name:', '').trim();
        if (currentProject) {
          currentProject.children = currentProject.children || [];
          currentFile = { name, type: 'file', details: {} };
          currentProject.children.push(currentFile);
        }
      } else if (line.startsWith('Coding Language:') && currentFile) {
        currentFile.details['Coding Language'] = line.replace('Coding Language:', '').trim();
      } else if (line.startsWith('Technology Stack:') && currentFile) {
        currentFile.details['Technology Stack'] = line.replace('Technology Stack:', '').trim();
      } else if (line.startsWith('File Purpose and Context:') && currentFile) {
        currentFile.details['File Purpose and Context'] = line.replace('File Purpose and Context:', '').trim();
      } else if (line.startsWith('Methods:') && currentFile) {
        currentFile.details['Methods'] = [];
        let methodLine = line.replace('Methods:', '').trim();
        if (methodLine) {
          currentFile.details['Methods'].push(methodLine);
        }
      } else if (line.startsWith('-') && currentFile) {
        const method = line.replace('-', '').trim();
        if (currentFile.details['Methods']) {
          currentFile.details['Methods'].push(method);
        }
      } else if (line.startsWith('Data Validation:') && currentFile) {
        currentFile.details['Data Validation'] = line.replace('Data Validation:', '').trim();
      } else if (line.startsWith('Error Handling:') && currentFile) {
        currentFile.details['Error Handling'] = line.replace('Error Handling:', '').trim();
      } else if (line.startsWith('Logging:') && currentFile) {
        currentFile.details['Logging'] = line.replace('Logging:', '').trim();
      } else if (line.startsWith('Interactions and Dependencies:') && currentFile) {
        currentFile.details['Interactions and Dependencies'] = line.replace('Interactions and Dependencies:', '').trim();
      } else if (line.startsWith('Integration Points:') && currentFile) {
        currentFile.details['Integration Points'] = line.replace('Integration Points:', '').trim();
      }
    });
 
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