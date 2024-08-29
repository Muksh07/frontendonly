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
  imports: [CommonModule, FormsModule],
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
  parsedStructure: any;

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
  isAnalyzing: boolean = false;
  response: boolean = false;

  constructor(private apiService: ApiService) {}

  // Tabs and sub-tabs
  tabs: string[] = [
    'Insight Elicitation',
    'Solidification',
    'Blueprinting',
    'Code Synthesis',
  ];
  blueprintingSubTabs: string[] = [
    'Requirement Summary',
    'Solution Overview',
    'Project Structure',
    'Data Flow',
    'Unit Testing',
    'Common Functionalities',
    'Database Scripts',
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  setActiveBlueprintingSubTab(subTab: string) {
    this.activeBlueprintingSubTab = subTab;
  }

  startBluePrinting() {
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

  analyzeBRD() {
    this.isAnalyzing = true;
    this.response = false;
    this.apiService
      .APIanalyzeBRD('', this.inputText, this.taskInput)
      .pipe(take(1))
      .subscribe(
        (response) => {
          this.outputText = response;
          if (this.outputText.length > 0) {
            this.isAnalyzing = false;
            this.response = true;
          }
          // Stop the spinner after the response
        },
        (error) => {
          console.error('Error during BRD analysis:', error);

          this.isAnalyzing = false; // Stop the spinner even if there's an error
        }
      );
  }
  saveBRD() {}
  saveContextHistory() {}
  showContextHistory() {}

  solidify() {
    // this.technicalRequirement = this.outputText;
    this.isAnalyzing = true;
    this.response = false;
    //console.log(this.outputText,"this.outputtext");
    this.apiService.Solidify(this.outputText).subscribe(
      (response) => {
        this.technicalRequirement = response;
        if (this.technicalRequirement.length > 0) {
          this.isAnalyzing = false;
          this.response = true;
        }
        // Stop the spinner after the response
      },
      (error) => {
        console.error('Error during Solidify:', error);

        this.isAnalyzing = false; // Stop the spinner even if there's an error
      }
    );
  }

  blueprinting() {
    this.apiService.Blueprinting(this.technicalRequirement).subscribe(
      (response: { [key: string]: string }) => {
        this.solutionOverview = response['solutionOverview'];
        this.dataFlow = response['dataFlow'];
        this.commonFunctionalities = response['commonFunctionalities'];
        this.projectStructure = response['projectStructure'];

        console.log('projectstructure', this.projectStructure);
        this.fetchFolderStructure(this.projectStructure );

        //console.log('json');
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

  

  projectStructureDescription: string =
    'This is the folder structure for our Todo List application. It includes frontend, backend, and data access layers.';
  //projectStructureDescription: string = this.projectStructure;
  folderStructure: any[] = [];
  selectedFileContent: string = '';

  ngOnInit() {
    //this.fetchFolderStructure();
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

  fetchFolderStructure(structure : string) {
    const inputString = structure;
 
    this.folderStructure = this.parseStructure(inputString);
    console.log('Parsed Folder Structure:', JSON.stringify(this.folderStructure, null, 2));
  }

  parseStructure(input: string): any[] {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    let folderMap: { [key: string]: any } = {};
    let rootNode: any = { name: '', type: 'folder', expanded: false, children: [] };
    let currentParent: any = rootNode;
    let currentFolder: any = null;
    let currentFileName: string = '';
    let contentAccumulator: string = '';
    let processingFile: boolean = false;
 
    const addFolderToParent = (parentFolder: any, folderName: string) => {
      const newFolder = { name: folderName, type: 'folder', expanded: false, children: [] };
      parentFolder.children.push(newFolder);
      folderMap[folderName] = newFolder;
      return newFolder;
    };
 
    const addFileToFolder = (folder: any, fileName: string, content: string) => {
      if (!folder.children) {
        folder.children = [];
      }
      folder.children.push({ name: fileName, type: 'file', content: content });
    };
 
    for (const line of lines) {
      if (line.startsWith('solution name:')) {
rootNode.name = line.split(':')[1].trim();
folderMap[rootNode.name] = rootNode;
      } else if (line.startsWith('root folder:')) {
        const rootFolderName = line.split(':')[1].trim();
        currentParent = addFolderToParent(rootNode, rootFolderName);
        currentFolder = currentParent;
      } else if (line.startsWith('project name:')) {
        const projectName = line.split(':')[1].trim();
        currentFolder = addFolderToParent(currentParent, projectName);
      } else if (line.startsWith('file name:')) {
        if (processingFile && currentFileName) {
          addFileToFolder(currentFolder, currentFileName, contentAccumulator.trim());
        }
        currentFileName = line.split(':')[1].trim();
        contentAccumulator = '';
        processingFile = true;
      } else if (processingFile) {
        contentAccumulator += line + '\n';
      }
    }
 
    // Add the last file if necessary
    if (processingFile && currentFileName) {
      addFileToFolder(currentFolder, currentFileName, contentAccumulator.trim());
    }
 
    return [rootNode];
  }

  fetchFileContent(fileName: string) {
    const findFileContent = (folder: any): string | null => {
      if (folder.type === 'folder' && folder.children) {
        for (const child of folder.children) {
if (child.type === 'file' && child.name === fileName) {
            return child.content;
          } else if (child.type === 'folder') {
            const content = findFileContent(child);
            if (content) return content;
          }
        }
      }
      return null;
    };
 
    const content = findFileContent(this.folderStructure[0]);
    if (content) {
      this.selectedFileContent = content;
    } else {
      this.selectedFileContent = 'File content not found.';
    }
  }
 
  showFileContent(item: any) {
    this.selectedFileContent = item.content || 'No content available.';
  }
 
  toggleFolder(item: any) 
  {
    item.expanded = !item.expanded;
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

  // toggleFolder(folder: any) {
  //   folder.expanded = !folder.expanded;
  // }

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
                { name: 'todo-item.component.ts', type: 'file' },
              ],
            },
            {
              name: 'services',
              type: 'folder',
              expanded: false,
              children: [{ name: 'todo.service.ts', type: 'file' }],
            },
          ],
        },
        { name: 'package.json', type: 'file' },
        { name: 'tsconfig.json', type: 'file' },
      ],
    },
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
