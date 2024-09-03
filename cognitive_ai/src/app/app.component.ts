import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../Services/api.service';
import { take } from 'rxjs';
import {saveAs} from 'file-saver';
import JSZip from 'jszip';

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
  selectedContent: string = '';

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
  codeSynthesisFolderStructure: any[] = [];
  selectedCodeFile: string = '';
  selectedCodeContent: string = '';
  unittesttree: any;
  databasetree: any;
  datascripttree: any;
  unittestingtree: any;
  loading: boolean = false;
  isdescribe: boolean = false;

  //variables for processing
  isAnalyzingCOD : boolean = false;
  responseCOD : boolean = false;
  isAnalyzingBRD : boolean = false;
  responseBRD : boolean = false;
  isAnalyzingSOL : boolean = false;
  responseSOL : boolean = false;
  isAnalyzingBLU : boolean = false;
  responseBLU : boolean = false;




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

  startCodeSynthesis() 
  {
    this.isAnalyzingCOD = true;
    this.responseCOD = false;

    this.loading = true;
    this.traverseAndUpdateFolderStructure(this.codeSynthesisFolderStructure[0]);
    this.logUpdatedFolderStructure();
    // this.codeSynthesisContent = `Blueprint:\n${this.blueprintingContent}`;
    // this.setActiveTab('Code Synthesis');
    this.isAnalyzingCOD = false;
    this.responseCOD = true;
  }
  logUpdatedFolderStructure() {
    console.log('Updated Folder Structure:', JSON.stringify(this.codeSynthesisFolderStructure, null, 2));
  }

  // startCodeSynthesis() {
  //   this.apiService
  //     .Codesynthesis(this.codeSynthesisFolderStructure[0])
  //     .subscribe(
  //       (response) => {
  //         console.log('result', response);
  //         this.codeSynthesisFolderStructure[0] = response;
  //       },
  //       (error) => {
  //         console.error('Error during code generation:', error);
  //       }
  //     );
  // }
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
    this.isAnalyzingBRD = true;
    this.responseBRD = false;
    this.apiService
      .APIanalyzeBRD('', this.inputText, this.taskInput)
      .pipe(take(1))
      .subscribe(
        (response) => {
          this.outputText = response;
          if (this.outputText.length > 0) {
            this.isAnalyzingBRD = false;
            this.responseBRD = true;
          }
          // Stop the spinner after the response
        },
        (error) => {
          console.error('Error during BRD analysis:', error);

          this.isAnalyzingBRD = false; // Stop the spinner even if there's an error
        }
      );
  }
  saveBRD() {}
  saveContextHistory() {}
  showContextHistory() {}

  solidify() {
    // this.technicalRequirement = this.outputText;
    this.isAnalyzingSOL = true;
    this.responseSOL = false;
    //console.log(this.outputText,"this.outputtext");
    this.apiService.Solidify(this.outputText).subscribe(
      (response) => {
        this.technicalRequirement = response;
        if (this.technicalRequirement.length > 0) {
          this.isAnalyzingSOL = false;
          this.responseSOL = true;
        }
        // Stop the spinner after the response
      },
      (error) => {
        console.error('Error during Solidify:', error);

        this.isAnalyzingSOL = false; // Stop the spinner even if there's an error

      }
    );
  }

  blueprinting() 
  {
    this.isAnalyzingBLU = true;
    this.responseBLU = false;
    this.apiService.Blueprinting(this.technicalRequirement).subscribe(
      (response: { [key: string]: string }) => {
        this.solutionOverview = response['solutionOverview'];
        this.dataFlow = response['dataFlow'];
        this.commonFunctionalities = response['commonFunctionalities'];
        this.projectStructure = response['projectStructure'];
        this.requirementSummary = response['requirementSummary'];
        this.unitTesting = response['unitTesting'];
        this.databaseScripts = response['databaseScripts'];
        console.log('my database script', this.databaseScripts);
        console.log('my unit testing', this.unitTesting);

        this.fetchFolderStructure(this.projectStructure);
        this.projectStructureDescription = this.projectStructure;

        this.createUnittesttree(this.unitTesting);
        this.createdatabasetree(this.databaseScripts);
        this.synfetchFolderStructure(this.projectStructure);
       
        this.isAnalyzingBLU = false;
        this.responseBLU = true;
        
      },
      (error) => {
        console.error('Error:', error);
        this.isAnalyzingBLU = false;
        //Handle the error here
      }
    );
  }

  projectStructureDescription: string = '';
  //projectStructureDescription: string = this.projectStructure;
  folderStructure: any[] = [];
  selectedFileContent: string = '';

  ngOnInit() {
    //this.fetchFolderStructure();
  }

  // parseText(input: string): any[] {
  //   const projects: any[] = [];

  //   // Split input into sections by "Project name:"
  //   const sections = input.split(/(?=Project name:)/).filter(section => section.trim());

  //   for (const section of sections) {
  //     const project: any = { type: 'folder', expanded: false, children: [] };

  //     // Extract project name
  //     const projectNameMatch = section.match(/Project name:\s*(.*)/);
  //     if (projectNameMatch) {
  //       project.name = projectNameMatch[1].trim();
  //     }

  //     // Extract files and their content
  //     const fileMatches = section.match(/- File name:\s*(.*?)(?=(?:- File name:|$))/gs);

  //     if (fileMatches) {
  //       for (const fileMatch of fileMatches) {
  //         const file: any = { type: 'file', content: '' };

  //         // Extract file name
  //         const fileNameMatch = fileMatch.match(/- File name:\s*(.*)/);
  //         if (fileNameMatch) {
  //           file.name = fileNameMatch[1].trim();
  //         }

  //         // Extract content
  //         const contentMatch = fileMatch.match(/(?:- Class:.*?)([\s\S]*?)(?=- File name:|$)/);
  //         if (contentMatch) {
  //           file.content = contentMatch[1].trim().replace(/(?:- Class:|\s*- Test scenarios:)/g, '\n');
  //         }

  //         project.children.push(file);
  //       }
  //     }

  //     projects.push(project);
  //   }

  //   return projects;
  // }

  // parseDatabaseScript(input: string): any[] {
  //   const databaseScript: any[] = [];

  //   // Split the input to isolate the Database Name section
  //   const dbSectionMatch = input.match(/- Database Name:\s*(.*?)\s*(?=- Tables:)/s);
  //   if (dbSectionMatch) {
  //     const database: any = {
  //       type: 'folder',
  //       expanded: false,
  //       children: [],
  //       name: dbSectionMatch[1].trim()
  //     };

  //     // Extract the tables within this database
  //     const tableMatches = input.split(/-\s*Table Name:/).filter(table => table.trim());

  //     tableMatches.slice(1).forEach(table => {  // Start from 1 to skip the initial text before the first table
  //       const tableObj: any = { type: 'file', content: '', name: '' };

  //       // Extract the table name
  //       const tableNameMatch = table.match(/^\s*(.*?)\s*(?=\n)/);
  //       if (tableNameMatch) {
  //         tableObj.name = tableNameMatch[1].trim() + '.sql';
  //       }

  //       // Extract the columns, primary key, indexes, and foreign key
  //       const columnsMatch = table.match(/- Columns:\s*([\s\S]*?)(?=\n-\s*Primary Key:|\n-\s*Indexes:|\n-\s*Foreign Key:|$)/);
  //       const primaryKeyMatch = table.match(/- Primary Key:\s*(.*?)\s*(?=\n|$)/);
  //       const indexesMatch = table.match(/- Indexes:\s*(.*?)\s*(?=\n|$)/);
  //       const foreignKeyMatch = table.match(/- Foreign Key:\s*(.*?)\s*(?=\n|$)/);

  //       // Construct the content
  //       let content = '';
  //       if (columnsMatch) {
  //         content += 'Columns:\n' + columnsMatch[1].trim() + '\n';
  //       }
  //       if (primaryKeyMatch) {
  //         content += 'Primary Key: ' + primaryKeyMatch[1].trim() + '\n';
  //       }
  //       if (indexesMatch) {
  //         content += 'Indexes: ' + indexesMatch[1].trim() + '\n';
  //       }
  //       if (foreignKeyMatch) {
  //         content += 'Foreign Key: ' + foreignKeyMatch[1].trim() + '\n';
  //       }

  //       tableObj.content = content.trim();
  //       if (tableObj.name) {
  //         database.children.push(tableObj);
  //       }
  //     });

  //     if (database.name && database.children.length > 0) {
  //       databaseScript.push(database);
  //     }
  //   }

  //   return databaseScript;
  // }

  fetchFolderStructure(structure: string) {
    const inputString = structure;

    this.folderStructure = this.parseStructure(inputString);
    console.log(
      'Parsed Folder Structure:',
      JSON.stringify(this.folderStructure, null, 2)
    );
  }

  parseStructure(input: string): any[] {
    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);
    let folderMap: { [key: string]: any } = {};
    let rootNode: any = {
      name: '',
      type: 'folder',
      expanded: false,
      children: [],
      content: 'Solution Name',
    };
    let currentParent: any = rootNode;
    let currentFolder: any = null;
    let currentFileName: string = '';
    let contentAccumulator: string = '';
    let processingFile: boolean = false;
    let projectPath: string = '';
    let unitTestNode: any = null;
    let dataScriptingNode: any = null;
    let databaseNameNode: any = null;
    let insideDataScripting = false;
    let insideUnitTest = false;

    const addFolderToParent = (
      parentFolder: any,
      folderName: string,
      content: string = ''
    ) => {
      const newFolder = {
        name: folderName,
        type: 'folder',
        expanded: false,
        children: [],
        content: content,
      };
      parentFolder.children.push(newFolder);
      folderMap[folderName] = newFolder;
      return newFolder;
    };

    const addFileToFolder = (
      folder: any,
      fileName: string,
      content: string
    ) => {
      if (!folder.children) {
        folder.children = [];
      }
      folder.children.push({ name: fileName, type: 'file', content: content });
    };

    for (const line of lines) {
      if (line.startsWith('solution name:')) {
        rootNode.name = line.split(':')[1].trim();
        rootNode.content = 'Solution Name'; // Set content for solution name
        folderMap[rootNode.name] = rootNode;
      } else if (line.startsWith('root folder:')) {
        const rootFolderName = line.split(':')[1].trim();
        currentParent = addFolderToParent(
          rootNode,
          rootFolderName,
          'Root folder'
        ); // Set content for root folder
        currentFolder = currentParent;
      } else if (line.startsWith('project path:')) {
        projectPath = line.split(':')[1].trim(); // Store the project path
        if (currentFolder && currentFolder.name !== rootNode.name) {
          // Only set content if it's not the root folder
          currentFolder.content = projectPath;
        }
      } else if (line.startsWith('project name:')) {
        const projectName = line.split(':')[1].trim();
        currentFolder = addFolderToParent(currentParent, projectName);
      } else if (line.startsWith('file name:')) {
        if (processingFile && currentFileName) {
          addFileToFolder(
            currentFolder,
            currentFileName,
            contentAccumulator.trim()
          );
        }
        currentFileName = line.split(':')[1].trim();
        contentAccumulator = '';
        processingFile = true;
      } else if (line.startsWith('UnitTest')) {
        // Finalize any ongoing file processing
        if (processingFile && currentFileName) {
          addFileToFolder(
            currentFolder,
            currentFileName,
            contentAccumulator.trim()
          );
        }

        // Initialize UnitTest node
        if (!unitTestNode) {
          unitTestNode = addFolderToParent(
            rootNode,
            'UnitTest',
            'Unit Testing Folder'
          );
        }
        currentFolder = unitTestNode;
        insideUnitTest = true;
      } else if (line.startsWith('dataScripting')) {
        // Finalize any ongoing file processing
        if (processingFile && currentFileName) {
          addFileToFolder(
            currentFolder,
            currentFileName,
            contentAccumulator.trim()
          );
        }

        // Initialize Data Scripting node
        if (!dataScriptingNode) {
          dataScriptingNode = addFolderToParent(
            rootNode,
            'dataScripting',
            'Data Scripting Folder'
          );
        }
        currentFolder = dataScriptingNode;
        insideDataScripting = true;
      } else if (line.startsWith('Database Name:') && insideDataScripting) {
        const dbName = line.split(':')[1].trim();
        databaseNameNode = addFolderToParent(
          currentFolder,
          dbName,
          'Database Name'
        );
        currentFolder = databaseNameNode;
      } else if (line.startsWith('Table Name:') && insideDataScripting) {
        const tableName = line.split(':')[1].trim();
        addFolderToParent(currentFolder, tableName, 'Table Name');
      } else if (line.startsWith('folder name:')) {
        const folderName = line.split(':')[1].trim();
        currentFolder = addFolderToParent(
          currentFolder,
          folderName,
          'Test folder'
        );
      } else if (
        (insideUnitTest && line.startsWith('project name:')) ||
        (insideUnitTest && line.startsWith('file name:'))
      ) {
        // Handle UnitTest sections
        const name = line.split(':')[1].trim();
        currentFolder = addFolderToParent(currentFolder, name, 'Test Details');
      } else if (processingFile) {
        contentAccumulator += line + '\n';
      }
    }

    // Add the last file if necessary
    if (processingFile && currentFileName) {
      addFileToFolder(
        currentFolder,
        currentFileName,
        contentAccumulator.trim()
      );
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
      this.selectedContent = content;
    } else {
      this.selectedContent = 'File content not found.';
    }
  }

  showFileContent(item: any) {
    this.selectedContent = item.content || 'No content available.';
  }

  showFolderContent(item: any) {
    this.selectedContent = item.content || 'No content available.';
  }

  showCodeFileContent(item: any) {
    this.selectedCodeContent = item.content || 'No content available.';
  }

  showCodeFolderContent(item: any) {
    this.selectedCodeContent = item.content || 'No content available.';
  }

  toggleFolder(item: any) {
    item.expanded = !item.expanded;
  }

  showCodeContent(content: string) {
    this.selectedCodeContent = content;
  }

  // toggleCodeFile(item: any) {
  //   if (item.type === 'file' && item.code && item.description) {
  //     item.expanded = !item.expanded;
  //   }
  // }
  toggleCodeFile(item: any) {
    if( (item.type === 'file') && (item.code || item.description)) {
      item.expanded = !item.expanded;
    }
  }

  showDescription= false;

  // async traverseAndUpdateFolderStructure(rootNode: any) {
  //   const stack = [{ node: rootNode, level: 0, parentfolder: '' }];

  //   while (stack.length > 0) {
  //     const { node, level, parentfolder } = stack.pop()!;

  //     console.log(
  //       `Traversing: ${node.name}, Level: ${level}, Current Parent Folder: ${parentfolder}`
  //     );

  //     // Check if we're at level 2 and it's a folder named 'DataScripting' or 'UnitTest'
  //     let newParentFolder = parentfolder;
  //     if (node.type === 'folder' && level === 2) {
  //       if (node.name === 'DataScripting') {
  //         newParentFolder = 'DataScripting';
  //         console.log(
  //           `Found DataScripting folder at level 2, setting parentfolder to ${newParentFolder}`
  //         );
  //       } else if (node.name === 'UnitTest') {
  //         newParentFolder = 'UnitTest';
  //         console.log(
  //           `Found UnitTest folder at level 2, setting parentfolder to ${newParentFolder}`
  //         );
  //       } else {
  //         console.log(
  //           `At level 2, but folder name does not match: ${node.name}`
  //         );
  //       }
  //     }

  //     // Process file based on the parentfolder
  //     if (node.type === 'file') {
  //       if (newParentFolder === 'UnitTest') {
  //         console.log(`Processing UnitTest file: ${node.name}`);
  //           (await this.apiService.Codesynthesis(node.name, node.content, 2,this.dataFlow,this.solutionOverview)).subscribe(
  //             (response) => {
  //               console.log("result", response);
  //               node.expanded = false;
  //               node.code = response;
  //               console.log(`Processed UnitTest file: ${node.name} at level ${level}`);
  //               // Stop the spinner after the response
  //             },
  //             (error) => {
  //               console.error('Error during codegeneration:', error);
  //               //this.isAnalyzing = false; // Stop the spinner even if there's an error
  //             }
  //           );
  //           console.log(
  //             `Processed UnitTest file: ${node.name} at level ${level}`
  //           );
  //       } else if (newParentFolder === 'DataScripting') {
  //           console.log(`Processing DataScripting file: ${node.name}`);
  //           (await this.apiService.Codesynthesis(node.name, node.content, 1,this.dataFlow,this.solutionOverview)).subscribe(
  //             (response) => {
  //               console.log("result", response);
  //               node.expanded = false;
  //               node.code = response;
  //               console.log(`Processed DataScripting file: ${node.name} at level ${level}`);
  //               // Stop the spinner after the response
  //             },
  //             (error) => {
  //               console.error('Error during codegeneration:', error);
  //               //this.isAnalyzing = false; // Stop the spinner even if there's an error
  //             }
  //           );
  //           console.log(
  //             `Processed DataScripting file: ${node.name} at level ${level}`
  //           );
  //       } else {
  //         console.log(`Processing general file: ${node.name}`);
  //         (
  //           await this.apiService.Codesynthesis(node.name, node.content, 0,this.dataFlow,this.solutionOverview)
  //         ).subscribe(
  //           (response) => {
  //             console.log('result', response);
  //             node.expanded = false;
  //             node.code = response;

  //             console.log(
  //               `Processed general file: ${node.name} at level ${level}`
  //             );
  //             // Stop the spinner after the response
  //           },
  //           (error) => {
  //             console.error('Error during codegeneration:', error);

  //             //this.isAnalyzing = false; // Stop the spinner even if there's an error
  //           }
  //         );
  //         break;
  //         console.log(`Processed general file: ${node.name} at level ${level}`);
  //       }
  //     }

  //     // Add children to stack
  //     if (node.children) {
  //       for (const child of node.children) {
  //         stack.push({
  //           node: child,
  //           level: level + 1,
  //           parentfolder: newParentFolder,
  //         });
  //       }
  //     }
  //   }
  // }

  traverseAndUpdateFolderStructure(node: any, level: number = 0, parentfolder: string = '') {
    console.log(`Traversing: ${node.name}, Level: ${level}, Current Parent Folder: ${parentfolder}`);
      
        // Check if we're at level 2 and it's a folder named 'DataScripting' or 'UnitTest'
        if (node.type === 'folder' && level === 2) {
    if (node.name === 'DataScripting') { // Corrected to match the existing folder name
            parentfolder = 'DataScripting';
            console.log(`Found DataScripting folder at level 2, setting parentfolder to ${parentfolder}`);
    } else if (node.name === 'UnitTest') {
            parentfolder = 'UnitTest';
            console.log(`Found UnitTest folder at level 2, setting parentfolder to ${parentfolder}`);
          } else {
             console.log(`At level 2, but folder name does not match: ${node.name}`);
          }
        }
        
      
        // Process file based on the parentfolder
        if (node.type === 'file') 
        {
          if (parentfolder === 'UnitTest') 
          {
             if(!this.isdescribe)
              {
                console.log(`Processing UnitTest file: ${node.name}`);
                this.apiService.Codesynthesis(node.name, node.content, 2,this.dataFlow,this.solutionOverview).subscribe(
                  (response) => {
                    console.log("result", response);
                    node.expanded = false;
                    node.code = response;
                    console.log(`Processed UnitTest file: ${node.name} at level ${level}`);
                    // Stop the spinner after the response
                  },
                  (error) => {
                    console.error('Error during codegeneration:', error);
                    //this.isAnalyzing = false; // Stop the spinner even if there's an error
                  }
                );
              }
              if(this.isdescribe)
              {
                  this.apiService.Codesynthesis(node.name, node.content, 2,this.dataFlow,this.solutionOverview).subscribe(
                    (response) => {
                      console.log("result", response);
                      node.expanded = false;
                      node.code = response;
                      console.log(`Processed UnitTest file: ${node.name} at level ${level}`);
                      // Stop the spinner after the response
                    },
                    (error) => {
                      console.error('Error during codegeneration:', error);
                      //this.isAnalyzing = false; // Stop the spinner even if there's an error
                    }
                  );
                  this.apiService.Codesynthesis(node.name, node.content, 3,this.dataFlow,this.solutionOverview).subscribe(
                    (response) => {
                      console.log("result", response);
                      node.expanded = false;
                      node.description = response;
                      console.log(`Processed UnitTest file: ${node.name} at level ${level}`);
                      // Stop the spinner after the response
                    },
                    (error) => {
                      console.error('Error during codegeneration:', error);
                      //this.isAnalyzing = false; // Stop the spinner even if there's an error
                    }
                  );

                }
             console.log(`Processed UnitTest file: ${node.name} at level ${level}`);
          } 
          else if (parentfolder === 'DataScripting') 
          {
            if(!this.isdescribe)
            {
              console.log(`Processing DataScripting file: ${node.name}`);
              this.apiService.Codesynthesis(node.name, node.content, 1,this.dataFlow,this.solutionOverview).subscribe(
                            (response) => {
                              console.log("result", response);
                              node.expanded = false;
                              node.code = response;
                              console.log(`Processed DataScripting file: ${node.name} at level ${level}`);
                              // Stop the spinner after the response
                            },
                            (error) => {
                              console.error('Error during codegeneration:', error);
                              //this.isAnalyzing = false; // Stop the spinner even if there's an error
                            }
                          );

              }
              if(this.isdescribe)
              {
                console.log(`Processing DataScripting file: ${node.name}`);
                this.apiService.Codesynthesis(node.name, node.content, 1,this.dataFlow,this.solutionOverview).subscribe(
                            (response) => {
                              console.log("result", response);
                              node.expanded = false;
                              node.code = response;
                              console.log(`Processed DataScripting file: ${node.name} at level ${level}`);
                              // Stop the spinner after the response
                            },
                            (error) => {
                              console.error('Error during codegeneration:', error);
                              //this.isAnalyzing = false; // Stop the spinner even if there's an error
                            }
                          );
                          this.apiService.Codesynthesis(node.name, node.content, 3,this.dataFlow,this.solutionOverview).subscribe(
                            (response) => {
                              console.log("result", response);
                              node.expanded = false;
                              node.description = response;
                              console.log(`Processed UnitTest file: ${node.name} at level ${level}`);
                              // Stop the spinner after the response
                            },
                            (error) => {
                              console.error('Error during codegeneration:', error);
                              //this.isAnalyzing = false; // Stop the spinner even if there's an error
                            }
                          );
                }
              
              console.log(`Processed DataScripting file: ${node.name} at level ${level}`);
          } 
          else 
          {
            if(!this.isdescribe)
            {
               console.log(`Processing general file: ${node.name}`);
               this.apiService.Codesynthesis(node.name, node.content, 0,this.dataFlow,this.solutionOverview).subscribe(
               (response) => {
               console.log('result', response);
               node.expanded = false;
                node.code = response;

                console.log(`Processed general file: ${node.name} at level ${level}`);
                 // Stop the spinner after the response
               },
               (error) => {
                console.error('Error during codegeneration:', error);

                //this.isAnalyzing = false; // Stop the spinner even if there's an error
                }
               );

            }
            if(this.isdescribe)
            {
              console.log(`Processing general file: ${node.name}`);
               this.apiService.Codesynthesis(node.name, node.content, 0,this.dataFlow,this.solutionOverview).subscribe(
               (response) => {
               console.log('result', response);
               node.expanded = false;
                node.code = response;

                console.log(`Processed general file: ${node.name} at level ${level}`);
                 // Stop the spinner after the response
               },
               (error) => {
                console.error('Error during codegeneration:', error);

                //this.isAnalyzing = false; // Stop the spinner even if there's an error
                }
               );
               this.apiService.Codesynthesis(node.name, node.content, 3,this.dataFlow,this.solutionOverview).subscribe(
                (response) => {
                  console.log("result", response);
                  node.expanded = false;
                  node.description = response;
                  console.log(`Processed UnitTest file: ${node.name} at level ${level}`);
                  // Stop the spinner after the response
                },
                (error) => {
                  console.error('Error during codegeneration:', error);
                  //this.isAnalyzing = false; // Stop the spinner even if there's an error
                }
              );

            }
           console.log(`Processed general file: ${node.name} at level ${level}`);
          }
        }
      
        // Recursively traverse children
        if (node.children) {
          for (const child of node.children) {
            this.traverseAndUpdateFolderStructure(child, level + 1, parentfolder);
          }
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

  ///////////////////////////////////////////////////////////////////////////////////
  synfetchFolderStructure(structure: string) {
    const inputString = structure;
    this.codeSynthesisFolderStructure = this.parseStructure(inputString);
    const temp = {
      name: 'DataScripting',
      type: 'folder',
      expanded: false,
      children: this.datascripttree,
    };
    const temp2 = {
      name: 'UnitTest',
      type: 'folder',
      expanded: false,
      children: this.unittestingtree,
    };
    console.log('ohohohoo', this.unittestingtree);
    this.codeSynthesisFolderStructure[0]['children'][0]['children'].push(temp2);
    this.codeSynthesisFolderStructure[0]['children'][0]['children'].push(temp);

    console.log(
      'children',
      this.codeSynthesisFolderStructure[0]['children'][0]['children']
    );
    // console.log(this.folderStructure,'this')
    console.log(
      'Parsed code synthesis:',
      JSON.stringify(this.codeSynthesisFolderStructure[0], null, 2)
    );
  }

  parseDatabaseScript(input: string): any[] {
    const databaseScript: any[] = [];

    // Find the database section
    const dbSectionMatch = input.match(
      /- Database Name:\s*(.*?)\s*(?=- Tables:)/s
    );
    if (dbSectionMatch) {
      const database: any = {
        type: 'folder',
        expanded: false,
        children: [],
        name: dbSectionMatch[1].trim(),
      };

      // Extract the tables section
      const tablesSection = input.split(/- Tables:\s*/s)[1].trim();

      // Extract each table section
      const tableSections = tablesSection
        .split(/- Table Name:/)
        .filter((section) => section.trim());

      tableSections.forEach((table, index) => {
        const tableObj: any = { type: 'file', content: '', name: '' };

        // Extract the table name
        const tableNameMatch = table.match(/^\s*(.*?)\s*(?=\n|$)/);
        if (tableNameMatch) {
          tableObj.name = tableNameMatch[1].trim() + '.sql';
        }

        // Extract content for the table
        let content = table.trim();

        // Remove the table name for content
        content = content.replace(/^\s*.*?\s*(?=\n|$)/, '').trim();

        tableObj.content = content;
        if (tableObj.name) {
          database.children.push(tableObj);
        }
      });

      if (database.name && database.children.length > 0) {
        databaseScript.push(database);
      }
    }

    return databaseScript;
  }

  createdatabasetree(databasescript: string) {
    const input = databasescript;

    this.datascripttree = this.parseDatabaseScript(input);

    // Print the parsed structure to the console
    console.log('databasescript', JSON.stringify(this.datascripttree, null, 2));
  }

  createUnittesttree(unittesting: string) {
    const temp = unittesting;

    this.unittestingtree = this.parseText(temp);

    console.log(
      'unittestingtree',
      JSON.stringify(this.unittestingtree, null, 2)
    );
  }

  parseText(input: string): any[] {
    const projects: any[] = [];

    // Split the input into sections based on "Project name:"
    const sections = input
      .split(/(?=Project name:)/)
      .filter((section) => section.trim());

    for (const section of sections) {
      const project: any = { type: 'folder', expanded: false, children: [] };

      // Extract project name
      const projectNameMatch = section.match(/Project name:\s*(.*)/);
      if (projectNameMatch) {
        project.name = projectNameMatch[1].trim();
      }

      // Extract files and their content
      const fileMatches = section.match(
        /- File name:\s*(.*?)(?=(?:- File name:|Project name:|$))/gs
      );

      if (fileMatches) {
        for (const fileMatch of fileMatches) {
          const file: any = { type: 'file', content: '', name: '' };

          // Extract file name
          const fileNameMatch = fileMatch.match(/- File name:\s*(.*)/);
          if (fileNameMatch) {
            file.name = fileNameMatch[1].trim();
          }

          // Extract class and test scenarios content
          const classMatch = fileMatch.match(
            /- Class:.*?(?=- File name:|- Test scenarios:|$)/s
          );
          const testScenariosMatch = fileMatch.match(
            /- Test scenarios:.*?(?=- File name:|$)/s
          );

          let content = '';

          if (classMatch) {
            content += classMatch[0].trim().replace(/- Class:/, 'Class:');
          }

          if (testScenariosMatch) {
            content +=
              '\n' +
              testScenariosMatch[0]
                .trim()
                .replace(/- Test scenarios:/, 'Test scenarios:');
          }

          file.content = content.trim();

          if (file.name) {
            project.children.push(file);
          }
        }
      }

      if (project.name && project.children.length > 0) {
        projects.push(project);
      }
    }

    return projects;
  }

  downloadZip() 
  {
    this.downloadFolderStructure(this.codeSynthesisFolderStructure[0]);
  }
  public async downloadFolderStructure(folderStructure: any) 
  {
    const zip = new JSZip();
    this.addFolderToZip(folderStructure, zip);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'folder-structure.zip');
  }

  private addFolderToZip(folder: any, zip: JSZip, folderPath: string = '') 
  {
    if (folder.type === 'folder') {
      const newFolderPath = folderPath
        ? `${folderPath}/${folder.name}`
        : folder.name;
      folder.children.forEach((child: any) => {
        this.addFolderToZip(child, zip, newFolderPath);
      });
    } else if (folder.type === 'file') {
      // Add code file
      if (folder.code) {
        zip.file(`${folderPath}/${folder.name}`, folder.code);
      }

      // Add description file
      if (folder.description) {
        zip.file(`${folderPath}/${folder.name}.txt`, folder.description);
      }
    }
  }


}
