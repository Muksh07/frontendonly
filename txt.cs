using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using OpenAI_API.Models;
using System.Windows.Forms;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Reflection;
using OpenAI_API.Chat;
using System.Net.Http;
using Azure;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ProgressBar;
using NeuraCraft;
using System.Net;
using System.Linq;
using System.IO;
using System.Diagnostics;
using System.Xml.Linq;
using System.Drawing;
using GPTService.Core;

namespace NeuraCraft
{
    public partial class frmNeuraCraft : Form
    {
        private const string llmmodel = "gpt-4o";
        private const string ApiKey = "d6d103abbe8c4709a24fd28c8b77e02f";
        private const string ApiEndpoint = "https://digitalum-aoai-1.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview";
        private int chunkSize = 0;  // number of characters
        private int contextLimit = 0;  //number of tokens
        private string logfilepath = @"C:\Digital 2024\Cognitive AI\Projects\WinFormsApp1\Logs\";
        private string prompt = "";
        GPTService.Core.GPTService GPTService = new GPTService.Core.GPTService();
        int GrandTotalToken = 0;
        public frmNeuraCraft()
        {
            InitializeComponent();

        }

        private void frmNeuraCraft_Load(object sender, EventArgs e)
        {
            rchtxtPrompt.Select();
            rchtxtPrompt.Text = "";
            //GetTemplateOptimise();
            Getchunksize();
            progressBar1.Visible = false;
            progressBar2.Visible = false;
            progressBar3.Visible = false;
            progressBar4.Visible = false;
        }
        //private async Task<string> GetChatGPTResponseAsync(string question, string apikey, string endpoint, string llmmodel)
        //{
        //    var summaries = new List<string>();
        //    foreach (var chunk in chunks)
        //    {
        //        string chunkSummary = await GetSummaryAsync(chunk);
        //        summaries.Add(chunkSummary);
        //    }

        //    // Combine summaries
        //    return string.Join("\n\n", summaries);
        //}

        //    private async Task<string> GetChatGPTResponseAsync(string question, string apikey, string endpoint, string llmmodel)
        //{
        //    string generatedcontent = "";

        //    string API_KEY = apikey; 

        //    string QUESTION = question; 

        //    string ENDPOINT = endpoint; 

        //    using (var httpClient = new HttpClient())
        //    {
        //        httpClient.DefaultRequestHeaders.Add("api-key", API_KEY);

        //        var payload = new
        //        {
        //            model = llmmodel,
        //            messages = new[]
        //            {
        //                new { role = "user", content = QUESTION }
        //            },
        //            temperature = 0.7,
        //            top_p = 0.95,
        //            max_tokens = 800,
        //            stream = false
        //        };

        //        var response = await httpClient.PostAsync(ENDPOINT, new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));

        //        if (response.IsSuccessStatusCode)
        //        {
        //            var responseData = await response.Content.ReadAsStringAsync();

        //            var responseObject = JsonConvert.DeserializeObject<dynamic>(responseData);

        //            if (responseObject != null)
        //            {
        //                if (((JArray)responseObject.choices).Count > 0)
        //                {
        //                    generatedcontent = ((string)responseObject.choices[0].message.content).Trim();
        //                }
        //            }
        //        }
        //        else
        //        {
        //            generatedcontent = response.StatusCode + " ----" + response.ReasonPhrase;
        //        }

        //        return generatedcontent;
        //    }




        //}


        private void btnAnalyseBRD_Click(object sender, EventArgs e)
        {

            CallAnalyzeProc(0);

        }

        private async void btnVerifyBRD_Click(object sender, EventArgs e)
        {

            string txtResponse = GPTService.GetPromptTask(0);
            //if (rchtxtResponse.Text.Trim() != "")
            if (txtResponse.Trim() != "")
            {

                string prompttext = rchtxtPrompt.Text.Trim() + " " + txtTaskforPrompt.Text.Trim();
                if (prompttext != "")    //(txtchunksize.Text.Trim() != "")
                {

                    //chunkSize = TotalTokenCount(prompttext); //int.Parse(txtchunksize.Text.Trim());
                    if (txtcontextlimit.Text.Trim() != "")
                    {
                        try
                        {
                            contextLimit = int.Parse(txtcontextlimit.Text.Trim());

                            chunkSize = ((contextLimit / 2) * 3) - 100;
                        }
                        catch (Exception ex)
                        {
                            MessageBox.Show($"Error: {ex.Message}" + " give value as numbers for PromptLimit and TokenLimit");
                        }

                    }

                }
                if (chunkSize > 0 && contextLimit > 0)
                {
                    await AnalyzeBRDTemp();
                }
            }
        }

        private async Task<String> AnalyzeBRD(string txtprompt, string strtask, int opt)
        {

            Dictionary<int, string> processingsysmbol = new Dictionary<int, string>();
            processingsysmbol.Add(1, "-");
            processingsysmbol.Add(2, "\\");
            processingsysmbol.Add(3, "|");
            processingsysmbol.Add(4, "/");

            int countsteps = 0;
            int intprocessingsysmbol = 0;

            //string txtprompt = rchtxtPrompt.Text.Trim();
            //string strtask = txtTaskforPrompt.Text.Trim();
            if (txtprompt == "" || strtask == "")
            {
                MessageBox.Show("Please provide Business Requirement and Task to perform", "Information", MessageBoxButtons.OKCancel);
                return "";
            }

            int CompletionTokens = 0;
            int PromptTokens = 0;
            int TotalTokens = 0;
            string finalSummary = "";
            try
            {

                //OpenAIPrompt _OpenAIPrompt = new OpenAIPrompt();
                string context = "";
                List<string> chunks = GPTService.SplitTextIntoChunks(txtprompt, chunkSize);
                var summaries = new List<string>();

                Dictionary<string, APIResponse> _APIAllResponse = new Dictionary<string, APIResponse>();

                //strtask += " using format\r\n" + GetPromptTask(opt);

                foreach (var chunk in chunks)
                {
                    APIResponse _APIResponse = new APIResponse();
                    prompt = GPTService.BuildPrompt(context, strtask, chunk);
                    string chunkSummary = "";
                    //while (true)
                    //{
                    countsteps++;
                    intprocessingsysmbol++;
                    if (opt == 0)
                    {
                        lblProcessingPrompt.Text = "Processing " + processingsysmbol[intprocessingsysmbol].ToString() + " " + countsteps.ToString();
                    }
                    else if (opt == 1)
                    {
                        lblProcessingPrompt1.Text = "Processing " + processingsysmbol[intprocessingsysmbol].ToString() + " " + countsteps.ToString();
                    }
                    else if (opt == 2)
                    {
                        lblProcessingPrompt2.Text = "Processing " + processingsysmbol[intprocessingsysmbol].ToString() + " " + countsteps.ToString();
                    }
                    else if (opt == 3)
                    {
                        lblProcessingPrompt3.Text = "Processing " + processingsysmbol[intprocessingsysmbol].ToString() + " " + countsteps.ToString();
                    }


                    if (intprocessingsysmbol >= 4)
                    {
                        intprocessingsysmbol = 0;
                    }

                    //string prompt = _OpenAIPrompt.BuildPrompt(context, strtask, chunk);

                    _APIResponse = await GPTService.GetChatGPTResponseAsync(contextLimit, prompt, ApiKey, ApiEndpoint, llmmodel);

                    _APIAllResponse.Add(prompt, _APIResponse);

                    chunkSummary = _APIResponse.Response;

                    summaries.Add(chunkSummary);

                    //    if (_APIResponse.Finishreason == "length") // when responce truncated to continue
                    //    {
                    //        int strlenth = chunkSummary.Length;
                    //        int startindex = (strlenth > 100 ? strlenth - 100 : 0);
                    //        prompt = " continue from: " + chunkSummary.Substring(startindex);
                    //    }
                    //    else
                    //    {
                    //        break;
                    //    }
                    //}
                    if (chunks.Count < countsteps)
                    {
                        _APIResponse = await GPTService.SummerizeContext(chunkSize, context + "\n" + chunkSummary, ApiKey, ApiEndpoint, llmmodel);

                        context = _APIResponse.Response;

                        _APIAllResponse.Add(context, _APIResponse);
                    }

                    CompletionTokens += _APIResponse.CompletionTokens;
                    PromptTokens += _APIResponse.PromptTokens;
                    TotalTokens += _APIResponse.TotalTokens;
                    
                }

                if (opt == 0)
                {
                    lblCompletionTokens.Text = "CompletionTokens: " + CompletionTokens.ToString();
                    lblPromptTokens.Text = "PromptTokens: " + PromptTokens.ToString();
                    lblTotalTokens.Text = "TotalTokens: " + TotalTokens.ToString();
                }
                else if (opt == 1)
                {
                    lblCompletionTokens1.Text = "CompletionTokens: " + CompletionTokens.ToString();
                    lblPromptTokens1.Text = "PromptTokens: " + PromptTokens.ToString();
                    lblTotalTokens1.Text = "TotalTokens: " + TotalTokens.ToString();
                }
                else if (opt == 2)
                {
                    lblCompletionTokens2.Text = "CompletionTokens: " + CompletionTokens.ToString();
                    lblPromptTokens2.Text = "PromptTokens: " + PromptTokens.ToString();
                    lblTotalTokens2.Text = "TotalTokens: " + TotalTokens.ToString();
                }
                else if (opt == 3)
                {
                    lblCompletionTokens3.Text = "CompletionTokens: " + CompletionTokens.ToString();
                    lblPromptTokens3.Text = "PromptTokens: " + PromptTokens.ToString();
                    lblTotalTokens3.Text = "TotalTokens: " + TotalTokens.ToString();
                }

                GrandTotalToken += TotalTokens;
               


                if (opt == 0)
                {
                }
                else if (opt == 1)
                {
                }
                else if (opt == 2)
                {
                    lblGrandTotalToken1.Text = "Grand Total Tokens: " + GrandTotalToken.ToString();
                }
                else if (opt == 3)
                {
                    lblGrandTotalToken.Text = "Grand Total Tokens: " + GrandTotalToken.ToString();
                }








                finalSummary = string.Join("\n\n", summaries);

                //var response = await GetChatGPTResponseAsync(txtprompt, ApiKey, ApiEndpoint, llmmodel);

                //rchtxtResponse.Text = finalSummary;

            }
            catch (Exception ex)
            {
                //rchtxtResponse.Text = $"Error: {ex.Message}";
                finalSummary = $"Error: {ex.Message}";
            }

            return finalSummary;
        }

        private async Task<String> AnalyzeBRDTemp()
        {

            Dictionary<int, string> processingsysmbol = new Dictionary<int, string>();
            processingsysmbol.Add(1, "-");
            processingsysmbol.Add(2, "\\");
            processingsysmbol.Add(3, "|");
            processingsysmbol.Add(4, "/");

            lblProcessingPrompt.Text = "";
            int countsteps = 0;
            int intprocessingsysmbol = 0;

            string txtprompt = rchtxtPrompt.Text.Trim();
            string strtask = txtTaskforPrompt.Text.Trim();
            if (txtprompt == "" || strtask == "")
            {
                MessageBox.Show("Please provide Business Requirement and Task to perform", "Information", MessageBoxButtons.OKCancel);
                return "";
            }
            btnAnalyseBRD.Enabled = false;
            int CompletionTokens = 0;
            int PromptTokens = 0;
            int TotalTokens = 0;
            try
            {

                //OpenAIPrompt _OpenAIPrompt = new OpenAIPrompt();
                string context = "";
                List<string> chunks = GPTService.SplitTextIntoChunks(txtprompt, chunkSize);
                var summaries = new List<string>();

                Dictionary<string, APIResponse> _APIAllResponse = new Dictionary<string, APIResponse>();

                foreach (var chunk in chunks)
                {
                    countsteps++;
                    intprocessingsysmbol++;

                    lblProcessingPrompt.Text = "Processing " + processingsysmbol[intprocessingsysmbol].ToString() + " " + countsteps.ToString();

                    if (intprocessingsysmbol >= 4)
                    {
                        intprocessingsysmbol = 0;
                    }

                    string prompt = GPTService.BuildPrompt(context, strtask, chunk);

                    //APIResponse _APIResponse = await _OpenAIPrompt.GetChatGPTResponseAsync(prompt, ApiKey, ApiEndpoint, llmmodel);

                    //_APIAllResponse.Add(prompt, _APIResponse);

                    //string chunkSummary = _APIResponse.Response;

                    summaries.Add("chunk" + countsteps.ToString() + ": \n" + prompt);

                    if (chunks.Count < countsteps)
                    {
                        //_APIResponse = await _OpenAIPrompt.SummerizeContext(contextLimit, context + "\n" + chunkSummary, ApiKey, ApiEndpoint, llmmodel);

                        //context = _APIResponse.Response;

                        //_APIAllResponse.Add(context, _APIResponse);
                    }

                    //CompletionTokens += _APIResponse.CompletionTokens;
                    //PromptTokens += _APIResponse.PromptTokens;
                    //TotalTokens += _APIResponse.TotalTokens;
                }

                lblCompletionTokens.Text = "CompletionTokens:" + CompletionTokens.ToString();
                lblPromptTokens.Text = "PromptTokens:" + PromptTokens.ToString();
                lblTotalTokens.Text = "TotalTokens:" + TotalTokens.ToString();

                string finalSummary = string.Join("\n\n", summaries); ;

                //var response = await GetChatGPTResponseAsync(txtprompt, ApiKey, ApiEndpoint, llmmodel);

                rchtxtResponse.Text = finalSummary;

            }
            catch (Exception ex)
            {
                rchtxtResponse.Text = $"Error: {ex.Message}";
            }
            finally
            {
                btnAnalyseBRD.Enabled = true;

            }

            return "";
        }
        private void btnNoOfTokens_Click(object sender, EventArgs e)
        {

            lblNoOfTokens.Text = "No.of Tokens : " + TotalTokenCount(rchtxtPrompt.Text.Trim() + " " + txtTaskforPrompt.Text.Trim()).ToString();

        }

        private int TotalTokenCount(string text)
        {
            int tokencount = 0;
            if (text.Length > 0)
            {
                List<string> tokens = GetTokenCount(text);
                foreach (var word in tokens)
                {
                    tokencount += (int)Math.Ceiling((double)word.Length / 4);
                }

            }
            return tokencount;

        }
        private List<string> GetTokenCount(string text)
        {
            Regex tokenRegex = new Regex(@"[\w]+|[^\s\w]", RegexOptions.Compiled);
            MatchCollection matches = tokenRegex.Matches(text);
            List<string> tokens = new List<string>();
            foreach (Match match in matches)
            {
                tokens.Add(match.Value);
            }


            return tokens;
        }

        private async void btnUploadDocument_Click(object sender, EventArgs e)
        {
            var dlg = new OpenFileDialog()
            {
                InitialDirectory = AppDomain.CurrentDomain.BaseDirectory,
                Filter = "Text Files|*.txt|All Files (*.*)|*.*",
                RestoreDirectory = true
            };


            if (dlg.ShowDialog() != DialogResult.OK)
            {
                //rchtxtPrompt.Text = "";
            }
            else
            {
                FileReadWrite _FileReadWrite = new FileReadWrite();

                rchtxtPrompt.Text = await _FileReadWrite.ReadTextFile(dlg.FileName);

            }


        }

        private async void btnSaveBRD_Click(object sender, EventArgs e)
        {
            SaveFileDialog saveFileDialog1 = new SaveFileDialog();
            saveFileDialog1.Filter = "Text Files|*.txt|All Files (*.*)|*.*";
            saveFileDialog1.Title = "Save a Text File";
            saveFileDialog1.ShowDialog();

            if (saveFileDialog1.FileName != "")
            {
                string filepath = Path.GetDirectoryName(saveFileDialog1.FileName);
                string filename = Path.GetFileName(saveFileDialog1.FileName);
                string strtext = rchtxtPrompt.Text.Trim();

                FileReadWrite _FileReadWrite = new FileReadWrite();
                string strstatus = await _FileReadWrite.WriteTextFile(filepath, filename, strtext);

                MessageBox.Show(strstatus, "Confirmation");

            }
        }

        private void btnContextHistory_Click(object sender, EventArgs e)
        {

        }

        private void btnSaveContextHistory_Click(object sender, EventArgs e)
        {

        }

        private void frmNeuraCraft_Resize(object sender, EventArgs e)
        {

        }

        private void txtcontextlimit_TextChanged(object sender, EventArgs e)
        {
            Getchunksize();
        }
        private void Getchunksize()
        {

            if (txtcontextlimit.Text.Trim() != "")
            {
                try
                {
                    int totaltoken = int.Parse(txtcontextlimit.Text.Trim());
                    txtchunksize.Text = (totaltoken / 2).ToString();
                }
                catch (Exception ex)
                {
                    txtchunksize.Text = "0";
                    txtcontextlimit.Text = "0";
                    MessageBox.Show($"Error: {ex.Message}" + " give value as numbers");
                }

            }
        }
        private void btnTemplateOptimise_Click(object sender, EventArgs e)
        {
            GetTemplateOptimise();
        }

        private void GetTemplateOptimise()
        {
            //if (rchtxtResponse.Text.Trim() == "")
            //{
            //    rchtxtResponse.Text = GetPromptTask(0);
            //}
            if (txtTaskforPrompt.Text.Trim() == "")
            {
                txtTaskforPrompt.Text = "extract required information from text";
            }
        }

        private void btnSolidification_Click(object sender, EventArgs e)
        {
            CallAnalyzeProc(1);
        }

        private void btnNoOfTokens1_Click(object sender, EventArgs e)
        {
            lblNoOfTokens1.Text = "No.of Tokens : " + TotalTokenCount(rchtxtSolidification.Text.Trim() + " " + rchtxtResponse.Text.Trim() + " " + GPTService.GetPromptTask(1)).ToString();

        }

        //private string GetPromptTask(int opt, int prep = 0)
        //{
        //    string PromptTask = "";
        //    switch (opt)
        //    {
        //        case 0:
        //            if (prep == 1)
        //            {
        //                PromptTask = "Optimize the text by summarizing and condensing the information while retaining the essential details."; // Focus on reducing token count by minimizing formatting and eliminating unnesessary details.";
        //            }
        //            else
        //            {
        //                PromptTask = "Application Name :\r\n1.Functional Requirements:\r\na. User Story\r\nb. Use Cases\r\nc. Functional Requirements\r\nd. Data Requirements and data types\r\ne. Integration\r\n2. Technical Specifications\r\na. Architecture\r\nb. Components\r\ni. Frontend\r\nii. Backend\r\niii. Data Access Layer\r\niv. Data Flow\r\nv. Solution Structure\r\n" +
        //                    "Solution Name: Solution Name\r\n" +
        //                    "Root Folder: Root Folder\r\n" +
        //                    "(Project Name: Project Name\r\n" +
        //                    "Project Path: Project Path\r\n" +
        //                    "(File Name: File Name\r\n))" +
        //                    "vi.Unit Testing";
        //            }
        //            break;
        //        case 1:
        //            //PromptTask = "Generate project structure with folders and files use following format for each file, provide response without any extra symbols \r\n";
        //            //PromptTask += "File Name :\r\n1. Root Folder\r\n2. File Path\r\n3. File Context\r\n4. Coding Language\r\n5. Purpose and Context,\r\n6. Define data field, data types for each entity,\r\n7. Methods and Functions,\r\n8. Interactions and Dependencies,\r\n9. Integration Points,\r\n10. Common Functionalities,\r\n11. Architectural Preferences,\r\n12. Technology Stack,\r\n13. Overall Project Structure\r\n";
        //            //PromptTask = "Provide Structured plan for Application project with a focus on solution structure, unit testing, and file organization, provide response without any extra symbols and tab indented, follow the format as follows\r\n";
        //            //PromptTask += "Project Structure:\r\n1. Solution Overview : Application Name, Architecture, Technology Stack, Data Requirements\r\n2. Project Structure : \r\nSolution Name,\r\nRoot Folder,\r\nProject Name,\r\nProject folder path,\r\nFile path with Name (\r\nCoding Language ,\r\nTechnology Stack,\r\nFile Purpose and Context,\r\nMethods and functions (purpose, parameters (names and types), data fields and its type),\r\nData validation,\r\nError handling,\r\nLogging,\r\nInteractions and Dependencies,\r\nIntegration Points) \r\n3. Data flow\r\n4. Unit testing details\r\n5. Common Functionalities\r\n";
        //            //PromptTask += "1. Solution Overview (Application Name, Architecture, Technology Stack, Data Requirements,Overall Project Structure)\r\n2. Project Structure (Solution Name, Root Folder, Project Name (Project Path, Project File Details (Code File Name, Coding Language, Technology Stack, File Purpose and Context, Methods and Functions (Name, Purpose, Parameters (Name, Type) Data Fields Name, Type) ) ) ), Data Validation, Error Handling, Logging, Interactions and Dependencies, Integration Points)\r\n3. Data Flow\r\n4. Unit Testing Details\r\n5. Common Functionalities";
        //            //PromptTask += "1.\tSolution Overview (Application Name, Architecture, Technology Stack, Data Requirements, Solution Structure)\r\n2.\tSolution Structure (Solution Name, Root Folder, (Project Name, Project Path, (File Name, Coding Language, Technology Stack, File Purpose and Context, (Methods Name, Purpose, (Parameters, Name, Type), (Data Fields, Name, Type), Data Validation, Error Handling, Logging, Interactions and Dependencies, Integration Points))))\r\n3.\tData Flow\r\n4.\tUnit Testing Details\r\n5.\tCommon Functionalities";
        //            PromptTask = "Provide Structured plan for Application Project strictly follow below Format, Provide response without any extra symbols and tab indented\r\n";
        //            PromptTask += "Format:" +
        //                "1.\tSolution Overview (Application Name, Architecture, Technology Stack, Data Requirements, Solution Structure, Unit Testing)\r\n" +
        //                "2.\tSolution Structure\r\n(" +
        //                "Solution Name:Solution Name,\r\n" +
        //                "Root Folder:Root Folder Name,\r\n" +
        //                "Project Name:Project Name,\r\n" +
        //                "Project Path:Project Path,\r\n" +
        //                "(File Name:File Name\r\n(" +
        //                "Coding Language, Technology Stack, File Purpose and Context, Methods: \r\n(" +
        //                "Methods Name, Purpose, Parameters as input, output),\r\n " +
        //                "Data Validation, \r\nError Handling, \r\nLogging, \r\nInteractions and Dependencies, \r\nIntegration Points)))\r\n" +
        //                "3.\tData Flow\r\n" +
        //                "4.\tCommon Functionalities";
        //            break;
        //        case 2:

        //            //PromptTask = "summarize the text without loosing its context, response will be used to generate code and data base scripts, provide response without any extra symbols but bulleted points\r\n";
        //            PromptTask = "summarize the text to make it concise without loosing its context, provide response without any extra symbols but bulleted points\r\n";

        //            break;
        //        case 3:

        //            //PromptTask = "Provide Structured plan for Application project with a focus on database script follow format database name,table with data fields and data type , provide response without any extra symbols but bulleted points\r\n";
        //            //PromptTask = "Provide database script,DBMS,Database name,Table name,(column,data type,primary key,indexes,foreign key) refering text, provide response without any extra symbols but bulleted points\r\n";
        //            PromptTask = "Provide Structured plan for database script, strictly follow below Format " +
        //                "Format : " +
        //                "Database Script(" +
        //                "DBMS:DBMS name" +
        //                "Database Name:Database Name(" +
        //                "Tables:(Table Name:Table Name(" +
        //                "columns:(datafield name,data type),primary key,indexes,foreign key)))) " +
        //                "refering text, provide response without any extra symbols but bulleted points\r\n";

        //            break;

        //        case 4:

        //            PromptTask = "Refer Solution Overview,Data Flow,File Name,File Metadata and Generate code using technology specified in the File Metadata, provide response without any extra symbols";

        //            break;
        //        case 5:

        //            PromptTask = "Provide unit test details for each Project name and file name, (project name,(file name,(class,method,return type,parameter),test scenarios,(positive scenario,negative scenario,boundary condition,expected output))) refering text, provide response without any extra symbols but bulleted points";

        //            break;
        //        case 6:

        //            PromptTask = "Refer the text and generate database script as per the File Metadata, provide response without any extra symbols";

        //            break;
        //        case 7:

        //            PromptTask = "Refer the text and generate unit test code as per the File Metadata, provide response without any extra symbols";

        //            break;

        //    }
        //    return PromptTask;
        //}

        private void btnBlueprinting_Click(object sender, EventArgs e)
        {
            CallAnalyzeProc(2);
        }
        private void GenerateBluePrintDetails(string RequirementSummary, string strSolidification)
        {
            string[] separatingStrings = new string[] { };
            if (strSolidification.Contains("1. solution overview:"))
            {
                //separatingStrings = new string[] { "1. solution overview:", "2. solution structure:", "3. data flow:", "4. unit testing details:", "5. common functionalities:" };
                separatingStrings = new string[] { "1. solution overview:", "2. solution structure:", "3. data flow:", "4. common functionalities:" };

            }
            else if (strSolidification.Contains("1. solution overview"))
            {
                //separatingStrings = new string[] { "1. solution overview", "2. solution structure", "3. data flow", "4. unit testing details", "5. common functionalities" };
                separatingStrings = new string[] { "1. solution overview", "2. solution structure", "3. data flow", "4. common functionalities" };

            }
            else if (strSolidification.Contains("solution overview:"))
            {
                //separatingStrings = new string[] { "solution overview:", "solution structure:", "data flow:", "unit testing details:", "common functionalities:" };
                separatingStrings = new string[] { "solution overview:", "solution structure:", "data flow:", "common functionalities:" };

            }
            else if (strSolidification.Contains("solution overview"))
            {
                //separatingStrings = new string[] { "solution overview", "solution structure", "data flow", "unit testing details", "common functionalities" };
                separatingStrings = new string[] { "solution overview", "solution structure", "data flow", "common functionalities" };

            }
            string[] BluePrintDetails = strSolidification.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);

            int icount = BluePrintDetails.Length;

            for (int i = 0; i < icount; i++)
            {
                var strKeyPoint = BluePrintDetails[i].Trim();

                switch (i)
                {
                    case 0:

                        rchSolutionOverview.Text = strKeyPoint;

                        break;
                    case 1:
                        rchProjectStructure.Text = strKeyPoint;

                        trvProjectStructure.Nodes.Clear();

                        string[] separatingStrings1 = { "solution name:", "root folder:", "project name:" };

                        string[] BluePrintDetails1 = strKeyPoint.Split(separatingStrings1, StringSplitOptions.RemoveEmptyEntries);
                        int icount1 = BluePrintDetails1.Length;
                        TreeNode tnRoot = new TreeNode();
                        TreeNode tnRootFolder = new TreeNode();
                        TreeNode tn = new TreeNode();
                        TreeNode tnProjectName = new TreeNode();
                        int tnIndex = 0;
                        for (int j = 0; j < icount1; j++)
                        {
                            var strKeyPoint1 = BluePrintDetails1[j].Trim();
                            switch (j)
                            {
                                case 0:
                                    string StrSolutionName = strKeyPoint1;
                                    tnRoot.Text = strKeyPoint1;
                                    tnRoot.Tag = "Solution Name";
                                    trvProjectStructure.Nodes.Add(tnRoot);
                                    break;
                                case 1:
                                    string StrRootFolder = strKeyPoint1;
                                    tn = new TreeNode();
                                    tn.Text = strKeyPoint1;
                                    tn.Tag = "Root Folder";
                                    tnIndex = tnRoot.Nodes.Add(tn);
                                    tnRootFolder = tnRoot.Nodes[tnIndex];

                                    break;
                                default:
                                    string StrProjectName = GetFirstString(strKeyPoint1);
                                    //tn = new TreeNode();
                                    //tn.Text = StrProjectName;
                                    //tn.Tag = "Project Name";
                                    //int tnIndex = tnRootFolder.Nodes.Add(tn);
                                    //tnProjectName = tnRootFolder.Nodes[tnIndex];
                                    //GetHierarchyProjectStrcture(tnProjectName, strKeyPoint1, new[] { "- File path with Name:" });

                                    if (StrProjectName != "")
                                    {
                                        strKeyPoint1 = RemoveFirstLine(strKeyPoint1);

                                        string StrProjectPath = GetFirstString(strKeyPoint1).Trim();

                                        tn = new TreeNode();
                                        tn.Text = StrProjectName; //"Project Name";
                                        tn.Tag = StrProjectPath.Replace("project path:", "").Trim();  // "Project Path";
                                        tnIndex = tnRootFolder.Nodes.Add(tn);
                                        tnProjectName = tnRootFolder.Nodes[tnIndex];

                                        strKeyPoint1 = RemoveFirstLine(strKeyPoint1);

                                        GetHierarchyProjectStrcture(tnProjectName, strKeyPoint1, new[] { "file name:" });
                                    }


                                    break;

                            }

                        }

                        break;
                    case 2:
                        rchDataFLow.Text = strKeyPoint;
                        break;
                    //case 3:
                    //    rchUnitTesting.Text = strKeyPoint;
                    //    break;
                    case 3:
                        rchCommFunc.Text = strKeyPoint;
                        break;
                }
            }



        }

        private string GetFirstString(string strKeyPoint)
        {
            string strFirst = "";

            string[] separatingStrings = { "\n" };
            string[] BluePrintDetails = strKeyPoint.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
            int icount = BluePrintDetails.Length;
            if (icount > 0)
            {
                strFirst = BluePrintDetails[0].Trim();

            }

            return strFirst;
        }

        private string RemoveFirstLine(string strKeyPoint)
        {
            string strFirst = "";

            string[] separatingStrings = { "\n" };
            string[] BluePrintDetails = strKeyPoint.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
            int icount = BluePrintDetails.Length;
            if (icount > 1)
            {
                strFirst = string.Join("\n", BluePrintDetails.Skip(1));

            }

            return strFirst;
        }


        private void GetHierarchyProjectStrcture(TreeNode tnProjectName, string strKeyPoint, string[] separatingStrings)
        {
            string[] BluePrintDetails1 = strKeyPoint.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
            int icount1 = BluePrintDetails1.Length;
            TreeNode tn;
            TreeNode tnFileName = new TreeNode();
            for (int j = 0; j < icount1; j++)
            {
                var strKeyPoint1 = BluePrintDetails1[j].Trim();
                if (strKeyPoint1 != "")
                {
                    string strfilename = GetFirstString(strKeyPoint1);

                    strKeyPoint1 = RemoveFirstLine(strKeyPoint1);

                    string strFileDetails = strKeyPoint1;

                    if (strfilename != "" && strFileDetails != "")
                    {
                        tn = new TreeNode();
                        tn.Text = strfilename;
                        tn.Tag = strFileDetails;
                        int tnidx = tnProjectName.Nodes.Add(tn);
                        //tnFileName = tnProjectName.Nodes[tnidx];
                        //tn = new TreeNode();
                        //tn.Text = "File Details";
                        //tn.Tag = strFileDetails;
                        //tnFileName.Nodes.Add(tn);
                    }
                }

            }

        }

        private void trvProjectStructure_AfterSelect(object sender, TreeViewEventArgs e)
        {
            rchProjStructDetails.Text = "";
            if (e.Node != null)
            {
                TreeNode tn = e.Node;
                if (tn.Tag != null)
                {
                    rchProjStructDetails.Text = tn.Tag.ToString();
                }
            }

        }

        private void tabControl1_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (tabControl1.SelectedIndex == 3 && trvProjectStructure.Nodes.Count > 0)
            {
                trvSolutionStructure.Nodes.Clear();
                CopyTreeNodes(trvProjectStructure.Nodes, trvSolutionStructure.Nodes);
            }
        }
        private void CopyTreeNodes(TreeNodeCollection sourceNode, TreeNodeCollection tragetNodes)
        {
            foreach (TreeNode node in sourceNode)
            {
                TreeNode newnode = (TreeNode)node.Clone();
                tragetNodes.Add(newnode);
                //CopyTreeNodes(node.Nodes,newnode.Nodes);
            }
            CreateNodeUnitTest(tragetNodes);
            CreateNodeDBScript(tragetNodes);
        }

        private void CreateNodeUnitTest(TreeNodeCollection tragetNodes)
        {
            TreeNode ProjectNode = new TreeNode();
            TreeNode UnitTestNode = new TreeNode();

            foreach (TreeNode node in tragetNodes)
            {
                if (node.Level == 1)
                {
                    UnitTestNode = node;
                    break;
                }
                CreateNodeUnitTest(node.Nodes);
            }


            if (UnitTestNode.Level == 1)
            {
                TreeNode tn = new TreeNode();
                tn.Text = "UnitTest";
                tn.Tag = "";
                int idx = UnitTestNode.Nodes.Add(tn);
                ProjectNode = UnitTestNode.Nodes[idx];

                CreateUnitTestProject(ProjectNode);
            }

        }

        private void CreateUnitTestProject(TreeNode projectNode)
        {
            string strUnitTest = rchUnitTesting.Text.Trim();

            if (strUnitTest != "")
            {
                string[] separatingStrings = new string[] { ":" };
                string[] UnitTestDetails = new string[] { };

                string strProjectName = GetFirstString(strUnitTest);
                UnitTestDetails = strProjectName.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                TreeNode FileNode = new TreeNode();
                int idx = 0;
                if (UnitTestDetails.Length >= 2)
                {
                    string strProjectNamelbl = UnitTestDetails[0];
                    //strProjectName = UnitTestDetails[1];

                    separatingStrings = new string[] { strProjectNamelbl + ":", strProjectNamelbl };
                    string[] UnitTestProjectDetails = strUnitTest.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                    int icount = UnitTestProjectDetails.Length;

                    for (int i = 0; i < icount; i++)
                    {
                        strUnitTest = UnitTestProjectDetails[i].Trim();
                        if (strUnitTest != "")
                        {
                            strProjectName = GetFirstString(strUnitTest);

                            TreeNode tn = new TreeNode();
                            tn.Text = strProjectName;
                            tn.Tag = "Project Name";
                            idx = projectNode.Nodes.Add(tn);
                            FileNode = projectNode.Nodes[idx];

                            strUnitTest = RemoveFirstLine(strUnitTest);


                            string strFileName = GetFirstString(strUnitTest);
                            separatingStrings = new string[] { ":" };
                            UnitTestDetails = strFileName.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                            if (UnitTestDetails.Length >= 2)
                            {
                                strFileName = UnitTestDetails[0];
                                separatingStrings = new string[] { strFileName + ":", strFileName };
                                UnitTestDetails = strUnitTest.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                                int icount1 = UnitTestDetails.Length;
                                for (int j = 0; j < icount1; j++)
                                {
                                    strUnitTest = UnitTestDetails[j].Trim();
                                    if (strUnitTest != "")
                                    {
                                        strFileName = GetFirstString(strUnitTest);
                                        strUnitTest = RemoveFirstLine(strUnitTest);

                                        tn = new TreeNode();
                                        tn.Text = strFileName;
                                        tn.Tag = strUnitTest;
                                        FileNode.Nodes.Add(tn);



                                    }
                                }
                            }


                        }
                    }
                }
            }
        }

        private void CreateNodeDBScript(TreeNodeCollection tragetNodes)
        {
            TreeNode ProjectNode = new TreeNode();
            TreeNode DBScriptNode = new TreeNode();

            foreach (TreeNode node in tragetNodes)
            {
                if (node.Level == 1)
                {
                    DBScriptNode = node;
                    break;
                }
                CreateNodeDBScript(node.Nodes);
            }


            if (DBScriptNode.Level == 1)
            {
                TreeNode tn = new TreeNode();
                tn.Text = "DatabaseScript";
                tn.Tag = "";
                int idx = DBScriptNode.Nodes.Add(tn);
                ProjectNode = DBScriptNode.Nodes[idx];

                CreateDBScriptProject(ProjectNode);
            }

        }

        private void CreateDBScriptProject(TreeNode projectNode)
        {
            string strDBScript = rchDBscripts.Text.Trim();

            if (strDBScript != "")
            {

                string strDBMS = GetFirstString(strDBScript);
                strDBScript = RemoveFirstLine(strDBScript);
                strDBMS = GetFirstString(strDBScript);

                string[] separatingStrings = new string[] { ":" };
                string[] DBScriptDetails = new string[] { };

                DBScriptDetails = strDBMS.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                if (DBScriptDetails.Length >= 2)
                {
                    string strDBMSlbl = DBScriptDetails[0];
                    separatingStrings = new string[] { strDBMSlbl + ":", strDBMSlbl };
                    string[] DBMSName = strDBMS.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                    if (DBMSName.Length == 1)
                    {
                        strDBMSlbl = DBMSName[0];
                        strDBScript = RemoveFirstLine(strDBScript);

                        strDBMS = GetFirstString(strDBScript);
                        separatingStrings = new string[] { ":" };

                        DBScriptDetails = strDBMS.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                        if (DBScriptDetails.Length >= 2)
                        {
                            string strDBlbl = DBScriptDetails[0];
                            separatingStrings = new string[] { strDBlbl + ":", strDBlbl };
                            DBMSName = strDBMS.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                            if (DBMSName.Length == 1)
                            {
                                strDBlbl = DBMSName[0];
                                TreeNode tn = new TreeNode();
                                tn.Text = strDBlbl;
                                tn.Tag = strDBMSlbl;
                                int idx = projectNode.Nodes.Add(tn);
                                TreeNode tableNodes = projectNode.Nodes[idx];

                                strDBScript = RemoveFirstLine(strDBScript).Trim(); //table and details

                                string strtbls = GetFirstString(strDBScript); //tables DB Objects (Table , SPs)
                                separatingStrings = new string[] { strtbls };
                                string[] DBObjGrp = strDBScript.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);

                                if (DBObjGrp.Length > 0)
                                {
                                    int icounttbl = DBObjGrp.Length;
                                    for (int itbls = 0; itbls < icounttbl; itbls++)
                                    {

                                        switch (itbls)
                                        {
                                            case 0:  // for Data Object - table

                                                strDBScript = DBObjGrp[0];
                                                separatingStrings = new string[] { ":" };
                                                string strtbl = GetFirstString(strDBScript);
                                                DBScriptDetails = strtbl.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
                                                if (DBScriptDetails.Length >= 2)
                                                {
                                                    string strtbllbl = DBScriptDetails[0];
                                                    separatingStrings = new string[] { strtbllbl + ":", strtbllbl };
                                                    DBMSName = strDBScript.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);

                                                    int icount = DBMSName.Length;
                                                    string strtableName = "";
                                                    string strtableDetails = "";

                                                    for (int i = 0; i < icount; i++)
                                                    {
                                                        strtbllbl = DBMSName[i].Trim();

                                                        if (strtbllbl != "")
                                                        {
                                                            strtableName = GetFirstString(strtbllbl);
                                                            strtableDetails = RemoveFirstLine(strtbllbl);
                                                            tn = new TreeNode();
                                                            tn.Text = strtableName;
                                                            tn.Tag = "DBMS : " + strDBMSlbl + "\n" + strtableDetails;
                                                            tableNodes.Nodes.Add(tn);

                                                        }

                                                    }

                                                }
                                                break;
                                            case 1:  // for Data Object - SP
                                                break;
                                        }

                                    }
                                }

                            }

                        }

                    }
                }

            }
        }

        private void trvSolutionStructure_AfterSelect(object sender, TreeViewEventArgs e)
        {
            rchContents.Text = "";
            if (e.Node != null)
            {
                TreeNode tn = e.Node;
                if (tn.Tag != null)
                {
                    rchContents.Text = tn.Tag.ToString();
                }
            }
        }

        private void btnCodeSynthesisTest_Click(object sender, EventArgs e)
        {
            CallAnalyzeProc(3);
        }

        private async void btnCodeSynthesis_Click(object sender, EventArgs e)
        {
            if (trvSolutionStructure.Nodes.Count > 0)
            {
                string strSolutionName = "";
                string StrRootFolder = "";
                string strProjectName = "";
                string StrFileName = "";
                string StrDetails = "";

                string StrUnitTest = "";
                string StrDbScript = "";
                GrandTotalToken = 0;
                //bool isreadyforcodegeneration = false;



                TreeNode tnSolutionNode = new TreeNode();
                TreeNode tnRootFolderNode = new TreeNode();
                TreeNode tnProjectNode = new TreeNode();
                TreeNode tnFileNode = new TreeNode();
                TreeNode tnDetailsNode = new TreeNode();

                TreeNode tnUnitTestNode = new TreeNode();
                TreeNode tnDbScript = new TreeNode();

                if (trvSolutionStructure.Nodes.Count > 0)
                {
                    tnSolutionNode = trvSolutionStructure.Nodes[0];

                    if (tnSolutionNode.Nodes.Count > 0)
                    {
                        strSolutionName = tnSolutionNode.Text.Trim();

                        tnRootFolderNode = tnSolutionNode.Nodes[0];

                        if (tnRootFolderNode.Nodes.Count > 0)
                        {
                            StrRootFolder = tnRootFolderNode.Text;

                            foreach (TreeNode tn in tnRootFolderNode.Nodes)
                            {
                                if (tn.Level == 2 && tn.Text != "UnitTest" && tn.Text != "DatabaseScript") // project name
                                {
                                    strProjectName = tn.Text;

                                    tnProjectNode = tn;
                                    foreach (TreeNode tnFiles in tnProjectNode.Nodes)
                                    {
                                        StrFileName = tnFiles.Text;
                                        StrDetails = tnFiles.Tag.ToString();

                                        trvSolutionStructure.SelectedNode = tnFiles;
                                        string strGeneratorCode = "";
                                        //generate code here for this file and add it in the code tag

                                        strGeneratorCode = await CallAnalyzeProc(3);

                                        if (strGeneratorCode.Trim() != "")
                                        {
                                            tnFiles.Nodes.Clear();
                                            TreeNode tnCode = new TreeNode();
                                            tnCode.Text = "code";
                                            tnCode.Tag = rchContents.Text.Trim();
                                            tnFiles.Nodes.Add(tnCode);

                                            if (chkDescribeCode.Checked)
                                            {
                                                strGeneratorCode = await CallAnalyzeProc(6, rchContents.Text.Trim());

                                                tnCode = new TreeNode();
                                                tnCode.Text = "describe";
                                                tnCode.Tag = strGeneratorCode;
                                                tnFiles.Nodes.Add(tnCode);
                                            }
                                        }
                                    }
                                }
                                else if (tn.Level == 2 && tn.Text == "UnitTest")
                                {
                                    StrUnitTest = tn.Text;
                                    if (tn.Nodes.Count > 0)
                                    {
                                        foreach (TreeNode tnProjects in tn.Nodes)
                                        {
                                            //tnProjectNode = tn.Nodes[0];
                                            foreach (TreeNode tnFiles in tnProjects.Nodes)
                                            {
                                                StrFileName = tnFiles.Text;
                                                StrDetails = tnFiles.Tag.ToString();

                                                trvSolutionStructure.SelectedNode = tnFiles;
                                                string strGeneratorCode = "";
                                                //generate code here for this file and add it in the code tag

                                                strGeneratorCode = await CallAnalyzeProc(5);

                                                if (strGeneratorCode.Trim() != "")
                                                {
                                                    tnFiles.Nodes.Clear();
                                                    TreeNode tnCode = new TreeNode();
                                                    tnCode.Text = "code";
                                                    tnCode.Tag = rchContents.Text.Trim();
                                                    tnFiles.Nodes.Add(tnCode);

                                                    if (chkDescribeCode.Checked)
                                                    {
                                                        strGeneratorCode = await CallAnalyzeProc(6, rchContents.Text.Trim());

                                                        tnCode = new TreeNode();
                                                        tnCode.Text = "describe";
                                                        tnCode.Tag = strGeneratorCode;
                                                        tnFiles.Nodes.Add(tnCode);
                                                    }
                                                }

                                            }
                                        }
                                    }
                                }
                                else if (tn.Level == 2 && tn.Text == "DatabaseScript")
                                {
                                    StrDbScript = tn.Text;
                                    if (tn.Nodes.Count > 0)
                                    {
                                        tnProjectNode = tn.Nodes[0];
                                        foreach (TreeNode tnFiles in tnProjectNode.Nodes)
                                        {
                                            StrFileName = tnFiles.Text;
                                            StrDetails = tnFiles.Tag.ToString();

                                            trvSolutionStructure.SelectedNode = tnFiles;
                                            string strGeneratorCode = "";
                                            //generate code here for this file and add it in the code tag

                                            strGeneratorCode = await CallAnalyzeProc(4);

                                            if (strGeneratorCode.Trim() != "")
                                            {
                                                tnFiles.Nodes.Clear();
                                                TreeNode tnCode = new TreeNode();
                                                tnCode.Text = "code";
                                                tnCode.Tag = rchContents.Text.Trim();
                                                tnFiles.Nodes.Add(tnCode);

                                                if (chkDescribeCode.Checked)
                                                {
                                                    strGeneratorCode = await CallAnalyzeProc(6, rchContents.Text.Trim());

                                                    tnCode = new TreeNode();
                                                    tnCode.Text = "describe";
                                                    tnCode.Tag = strGeneratorCode;
                                                    tnFiles.Nodes.Add(tnCode);
                                                }
                                            }

                                        }
                                    }
                                }

                                //else if (tn.Level == 3)
                                //{
                                //    StrFileName = tn.Text;
                                //    StrDetails = tn.Tag.ToString();

                                //}
                                //if (StrRootFolder != "" && strProjectName != "" && StrDetails != "")
                                //{
                                //    isreadyforcodegeneration = true;
                                //}

                                //if (isreadyforcodegeneration)
                                //{
                                //    isreadyforcodegeneration = true;
                                //}
                            }

                        }
                    }
                }

                
            }
        }

        private async Task<String> CallAnalyzeProc(int opt, string codeForPrompt="")
        {
            GetTemplateOptimise();
            string prompttext = "";
            string strGeneratorCode = "";
            string txtResponse = GPTService.GetPromptTask(0);
            //if (rchtxtResponse.Text.Trim() != "")

            if (txtResponse.Trim() != "")
            {
                if (txtcontextlimit.Text.Trim() != "")
                {
                    try
                    {
                        contextLimit = int.Parse(txtcontextlimit.Text.Trim());
                        chunkSize = (contextLimit * 3) - 100;
                        //chunkSize = ((contextLimit / 2) * 3) - 100;
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Error: {ex.Message}" + " give value as numbers for PromptLimit and TokenLimit");
                    }

                }
                if (chunkSize > 0 && contextLimit > 0)
                {

                    switch (opt)
                    {
                        case 0:
                            lblProcessingPrompt.Text = "Processing ";
                            progressBar2.Visible = true;
                            btnAnalyseBRD.Enabled = false;
                            string strtask = txtTaskforPrompt.Text.Trim().ToLower();
                            prompttext = GPTService.GetPromptTask(0);
                            if (strtask.StartsWith("new:"))
                            {
                                strtask = txtTaskforPrompt.Text.Trim();
                            }
                            else
                            {
                                strtask = txtTaskforPrompt.Text.Trim() + "and provide solution with project folder, file structure , provide response without any extra symbols but bulleted points, using format\r\n" + prompttext;
                            }

                            rchtxtResponse.Text = await AnalyzeBRD(rchtxtPrompt.Text, strtask, 0);

                            btnAnalyseBRD.Enabled = true;
                            lblProcessingPrompt.Text = "Response received ";
                            progressBar2.Visible = false;

                            break;
                        case 1:
                            lblProcessingPrompt1.Text = "Processing ";
                            progressBar3.Visible = true;
                            btnSolidification.Enabled = false;
                            rchtxtSolidification.Text = await AnalyzeBRD(rchtxtResponse.Text.Trim(), GPTService.GetPromptTask(1), 1);

                            rchtxtSolidification.Text = removeSpecialCharacter(rchtxtSolidification.Text);

                            btnSolidification.Enabled = true;
                            lblProcessingPrompt1.Text = "Response received ";
                            progressBar3.Visible = false;
                            break;
                        case 2:
                            lblProcessingPrompt2.Text = "Processing ";
                            progressBar4.Visible = true;
                            btnBlueprinting.Enabled = false;

                            //Summary

                            string RequirementSummary = await AnalyzeBRD(rchtxtSolidification.Text.Trim(), GPTService.GetPromptTask(2), 2);
                            rchReqSummary.Text = RequirementSummary;

                            GenerateBluePrintDetails("summary", rchtxtSolidification.Text.Trim().ToLower());


                            //Unit Testing

                            prompttext = "Solution Overview:\n" + rchSolutionOverview.Text.Trim() + "\nProject Structure:\n" + rchProjectStructure.Text.Trim();

                            string unitTesting = await AnalyzeBRD(prompttext, GPTService.GetPromptTask(5), 2);
                            rchUnitTesting.Text = unitTesting;

                            // Database Script

                            prompttext = "Solution Overview:\n" + rchSolutionOverview.Text.Trim() + "\n Project Structure:\n" + rchProjectStructure.Text.Trim();

                            string dbscripts = await AnalyzeBRD(prompttext, GPTService.GetPromptTask(3), 2);
                            rchDBscripts.Text = dbscripts;

                            btnBlueprinting.Enabled = true;
                            lblProcessingPrompt2.Text = "Response received ";
                            progressBar4.Visible = false;
                            break;
                        case 3:
                            lblProcessingPrompt3.Text = "Processing ";
                            progressBar1.Visible = true;
                            btnCodeSynthesisTest.Enabled = false;

                            prompttext = GetPromptText();
                            if (prompttext != "")
                            {
                                strGeneratorCode = await AnalyzeBRD(prompttext, GPTService.GetPromptTask(4), 3);
                                rchContents.Text = strGeneratorCode;

                            }
                            lblProcessingPrompt3.Text = "Response received ";
                            progressBar1.Visible = false;
                            btnCodeSynthesisTest.Enabled = true;
                            break;
                        case 4:
                            lblProcessingPrompt3.Text = "Processing ";
                            progressBar1.Visible = true;
                            btnCodeSynthesisTest.Enabled = false;

                            prompttext = GetPromptText();
                            if (prompttext != "")
                            {
                                strGeneratorCode = await AnalyzeBRD(prompttext, GPTService.GetPromptTask(6), 3);
                                rchContents.Text = strGeneratorCode;

                            }
                            lblProcessingPrompt3.Text = "Response received ";
                            progressBar1.Visible = false;
                            btnCodeSynthesisTest.Enabled = true;
                            break;
                        case 5:
                            lblProcessingPrompt3.Text = "Processing ";
                            progressBar1.Visible = true;
                            btnCodeSynthesisTest.Enabled = false;

                            prompttext = GetPromptText();
                            if (prompttext != "")
                            {
                                strGeneratorCode = await AnalyzeBRD(prompttext, GPTService.GetPromptTask(7), 3);
                                rchContents.Text = strGeneratorCode;

                            }
                            lblProcessingPrompt3.Text = "Response received ";
                            progressBar1.Visible = false;
                            btnCodeSynthesisTest.Enabled = true;
                            break;
                        case 6: // Describe the code
                            if (codeForPrompt != "" && chkDescribeCode.Checked)
                            {
                                lblProcessingPrompt3.Text = "Processing ";
                                progressBar1.Visible = true;
                                btnCodeSynthesisTest.Enabled = false;

                                prompttext = codeForPrompt;
                                if (prompttext != "")
                                {
                                    strGeneratorCode = await AnalyzeBRD(prompttext, GPTService.GetPromptTask(8), 3);
                                    rchContents.Text = strGeneratorCode;

                                }
                                lblProcessingPrompt3.Text = "Response received ";
                                progressBar1.Visible = false;
                                btnCodeSynthesisTest.Enabled = true;
                            }
                            break;
                    }


                }
            }

            return strGeneratorCode;
        }

        private string GetPromptText()
        {
            string promptText = "";
            TreeNode tn = trvSolutionStructure.SelectedNode;
            if (tn != null && rchSolutionOverview.Text.Trim() != "" && rchDataFLow.Text.Trim() != "")
            {
                if ((tn.Level == 3 || tn.Level == 4) && rchSolutionOverview.Text.Trim() != "" && rchDataFLow.Text.Trim() != "")
                {
                    string FileName = tn.Text;
                    string FileDetails = tn.Tag.ToString();
                    string SolutionOverview = rchSolutionOverview.Text.Trim();
                    string DataFLow = rchDataFLow.Text.Trim();

                    lblFilename.Text = "File for code generation:" + FileName;

                    promptText = "Solution Overview:\n" + SolutionOverview + "\nData Flow:\n" + DataFLow +
                        "\nFile Name:\n" + FileName + "\nFile Metadata:\n" + FileDetails;
                }
            }
            //string strtask = "Generate code refer Solution Overview,Data Flow,File Name, File Metadata and using technology specified in the File Metadata";
            return promptText;
        }

        private void btnNoOfTokens2_Click(object sender, EventArgs e)
        {
            lblNoOfTokens2.Text = "No.of Tokens : " + TotalTokenCount(rchtxtPrompt.Text.Trim() + " " + GPTService.GetPromptTask(3));
        }

       
        private string removeSpecialCharacter(string strText)
        {
            string steupdatedText = "";

            string[] separatingStrings = { "\n" };
            string[] alllines = strText.Split(separatingStrings, StringSplitOptions.RemoveEmptyEntries);
            
            Regex regex = new Regex("^[^a-zA-Z0-9]+");

            for (int i = 0;i< alllines.Length; i++)
            {
                alllines[i] = regex.Replace(alllines[i], string.Empty);

            }

            steupdatedText = string.Join("\n", alllines);
           
            return steupdatedText;

        }

    }
}

