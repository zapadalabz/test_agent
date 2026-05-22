// client/src/utils/latexExport.ts

export const generateLatex = (
  layout: any[], 
  generatedQuestions: any[], 
  title: string = "Exam Draft",
  imageMap?: Map<string, string> // Map for local zip paths
): string => {
  let tex = `\\documentclass[11pt, addpoints]{exam}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{geometry}
\\usepackage{pgfplots} % Native line/scatter/bar charts
\\usepackage{array}
\\pgfplotsset{compat=1.18}
\\geometry{a4paper, margin=1in}

% --- IB Style Exam Formatting ---
\\pointsinrightmargin
\\bracketedpoints
\\marginpointname{} % Removes the word "points" next to the number
\\renewcommand{\\choicelabel}{\\Alph{choice}.} % Correct standard exam class label
\\renewcommand{\\choiceshook}{\\setlength{\\leftmargin}{1.5em}} % Aligns the options with the question text

% --- Custom Header & Footer ---
\\pagestyle{headandfoot}
\\firstpageheader{}{}{}
\\runningheader{Physics}{Higher level}{Paper 1A \\& 2}
\\firstpagefooter{}{\\thepage}{}
\\runningfooter{}{\\thepage}{Turn over}

\\begin{document}

\\begin{questions}\n\n`;

  layout.forEach((item) => {
    if (item.itemType === 'BlankPage') {
      tex += `\\newpage\n\\thispagestyle{empty}\n\\mbox{}\n\\newpage\n\n`;
      return;
    }

    if (item.itemType === 'StaticAsset') {
      if (item.title === 'Exam Coverpage 2026') {
        tex += `\\begin{coverpages}
\\begin{flushleft}

% --- Logo and Header ---
\includegraphics[width=6.0cm]{BHlogo.png}

{\large \textbf{FINAL EXAMINATION JUNE 2026}}
\vspace{1cm}

% --- Meta Information ---
\\renewcommand{\\arraystretch}{1.5}
\\begin{tabular}{@{}p{7cm} l@{}}
\\textbf{Subject:} & \\\\
\\textbf{Course Code:} & \\\\
Date Written: & \\\\
Time Written: & \\\\
Length Of Exam: & \\\\
Number of Pages in exam: & \\textbf{(not including cover sheet)} \\\\
& \\\\
\\textbf{Teachers of this course:} & \\textbf{(Circle your teacher's name)} \\\\
\\end{tabular}

\\vspace{2cm}

% --- Instructions & Name ---
\\begin{tabular}{@{}p{7cm} p{8cm}@{}}
\\textbf{Instructions to Candidates:} & \\textbf{NAME:} \\hrulefill \\\\
\\end{tabular}

\\vfill
(do not include any exam questions on this page)

\\end{flushleft}
\\end{coverpages}\n\n`;
      } else if (item.title === 'Test Cover Sheet (with Rubric)') {
        tex += `\\begin{coverpages}
% --- PAGE 1: Meme Cover ---
\\begin{flushleft}
\\textbf{DP1 PHYSICS 2026} \\hfill \\textbf{NAME:} \\underline{\\hspace{8cm}} \\\\[0.8cm]

\\underline{\\textbf{Topic Title (\\# marks; \\# min)}} \\\\[0.2cm]
**Ensure you have a calculator for this test.
\\end{flushleft}

\\vspace{1.5cm}

\\begin{center}
    % Placeholder box for the meme. Replace \\fbox with \\includegraphics when ready!
    \\fbox{\\parbox{11.5cm}{\\centering \\vspace{4cm} \\textit{[ Insert Dank Physics Meme Here ]} \\vspace{4cm}}}
\\end{center}

\\vfill

\\begin{flushleft}
\\textbf{Honour pledge:} \\\\
\\textit{On my honour, I have neither given nor received unauthorized aid on this test.} \\\\[0.8cm]
\\textbf{Signature:} \\underline{\\hspace{10cm}}
\\end{flushleft}

\\newpage

% --- PAGE 2: Rubric ---
\\begin{center}
    \\renewcommand{\\arraystretch}{1.3}
    \\footnotesize
    \\begin{tabular}{|c|p{15cm}|}
    \\hline
    \\textbf{7} &
    \\vspace{-0.3cm}
    \\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=0pt]
        \\item display \\textbf{comprehensive} knowledge of factual information in the syllabus (K)
        \\item display a \\textbf{thorough command} of concepts and principles (K)
        \\item construct \\textbf{detailed} explanations of \\textbf{complex} phenomena (K)
        \\item analyze, conclude and evaluate quantitative and/or qualitative data \\textbf{thoroughly} (T)
        \\item communicate \\textbf{logically and concisely} using appropriate terminology and conventions (C)
        \\item select and apply relevant information, concepts and principles in a \\textbf{wide variety of contexts} (A)
        \\item solve \\textbf{familiar and unfamiliar} quantitative and/or qualitative problems \\textbf{proficiently} (A/T)
    \\end{itemize}
    \\vspace{-0.3cm} \\\\
    \\hline
    \\textbf{6} &
    \\vspace{-0.3cm}
    \\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=0pt]
        \\item display \\textbf{very broad} knowledge of factual information in the syllabus (K)
        \\item display a \\textbf{thorough understanding} of concepts and principles (K)
        \\item construct explanations of \\textbf{complex} phenomena (K)
        \\item analyze, conclude and evaluate quantitative and/or qualitative data \\textbf{with a high level of competence} (T)
        \\item communicate \\textbf{effectively} using appropriate terminology and convention (C)
        \\item select and apply relevant information, concepts and principles in \\textbf{most contexts} (A)
        \\item solve \\textbf{basic or familiar problems and most unfamiliar or difficult} quantitative and/or qualitative problems (A/T)
    \\end{itemize}
    \\vspace{-0.3cm} \\\\
    \\hline
    \\textbf{5} &
    \\vspace{-0.3cm}
    \\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=0pt]
        \\item display \\textbf{broad} knowledge of factual information in the syllabus (K)
        \\item display a \\textbf{sound understanding} of \\textbf{most} concepts and principles (K)
        \\item construct explanations of \\textbf{simple} phenomena (K)
        \\item analyze, conclude and evaluate quantitative and/or qualitative data \\textbf{competently} (T)
        \\item communicate \\textbf{clearly} with little or no irrelevant material (C)
        \\item select and apply relevant information, concepts and principles (A)
        \\item apply understanding of concepts and principles in \\textbf{some contexts} (A)
        \\item solve \\textbf{most basic or familiar problems and some unfamiliar or difficult} quantitative and/or qualitative problems (A/T)
    \\end{itemize}
    \\vspace{-0.3cm} \\\\
    \\hline
    \\textbf{4} &
    \\vspace{-0.3cm}
    \\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=0pt]
        \\item display reasonable knowledge of factual information in the syllabus, though possibly with some gaps (K)
        \\item show adequate comprehension of most basic concepts and principles (K)
        \\item demonstrate some analysis, conclusion or evaluation of quantitative or qualitative data (T)
        \\item communicate adequately although responses may lack clarity and include some repetitive or irrelevant material
        \\item select and apply some relevant information, concepts and principles (A)
        \\item show limited ability to apply most basic concepts and principles (A)
        \\item solve some basic or routine problems but show limited ability to deal with unfamiliar or difficult problems (A/T)
    \\end{itemize}
    \\vspace{-0.3cm} \\\\
    \\hline
    \\textbf{3} &
    \\vspace{-0.3cm}
    \\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=0pt]
        \\item display limited knowledge of information in the syllabus (K)
        \\item show a partial comprehension of basic concepts and principles (K)
        \\item demonstrate limited ability to analyse, conclude or evaluate quantitative or qualitative data (T)
        \\item communicate with a lack of clarity and some repetitive or irrelevant material
        \\item use a combination of formal and informal language and use scientific language inconsistently
        \\item select and apply some relevant information, concepts and principles (A)
        \\item show a weak ability to apply basic concepts and principles (A)
        \\item show some ability to manipulate data and solve basic or routine problems (A/T)
    \\end{itemize}
    \\vspace{-0.3cm} \\\\
    \\hline
    \\textbf{2} &
    \\vspace{-0.3cm}
    \\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=0pt]
        \\item display little recall of factual information in the syllabus (K)
        \\item show weak comprehension of basic concepts and principles (K)
        \\item demonstrate little ability to analyse, conclude or evaluate quantitative or qualitative data (T)
        \\item offer responses which are often incomplete or irrelevant (C)
        \\item use informal language and misapply scientific terms (C)
        \\item rarely select and apply relevant information, concepts and principles (A)
        \\item provide little evidence of the ability to apply concepts and principles (A)
        \\item exhibit minimal ability to manipulate data (A/T)
        \\item demonstrate little or no ability to solve problems (A/T)
    \\end{itemize}
    \\vspace{-0.3cm} \\\\
    \\hline
    \\textbf{1} &
    \\vspace{-0.3cm}
    \\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=0pt]
        \\item recall fragments of factual information in the syllabus and shows very little understanding of any concepts or principles (K)
        \\item cannot apply concepts and principles (K)
        \\item rarely able to analyse, conclude or evaluate quantitative or qualitative data (T)
        \\item offer responses which are incomplete and irrelevant (C)
        \\item use informal language and show no familiarity with scientific terms (C)
        \\item rarely selects and applies relevant information, concepts and principles (A)
        \\item exhibit no ability to manipulate data or solve basic problems (A/T)
    \\end{itemize}
    \\vspace{-0.3cm} \\\\
    \\hline
    \\end{tabular}
\\end{center}
\\end{coverpages}\n\n`;
      } else {
        tex += `% [STATIC ASSET PLACEHOLDER: ${item.title}]\n\n`;
      }
      return;
    }

    if (item.itemType === 'Question') {
      const q = generatedQuestions.find(gq => gq._id === item.itemId);
      if (!q) return;

      const renderAssets = (assets: any[]) => {
        let assetTex = '';
        if (assets && assets.length > 0) {
          assets.forEach((asset: any) => {
            if (asset.type === 'image') {
               const localPath = (imageMap && asset.image_data) ? imageMap.get(asset.image_data) : null;
               
               if (localPath) {
                 assetTex += `\\begin{center}\n\\includegraphics[max width=0.6\\textwidth]{${localPath}}\n\\end{center}\n`;
               } else if (asset.generated_prompt) {
                 assetTex += `\\begin{center}\n`;
                 assetTex += `  \\fbox{\\parbox{0.8\\textwidth}{\n`;
                 assetTex += `    \\centering \\textit{[ Missing Image Placeholder ]} \\\\\n`;
                 assetTex += `    \\vspace{0.2cm}\n`;
                 assetTex += `    \\textbf{Suggested Diagram Prompt:} ${cleanTextForLatex(asset.generated_prompt)}\n`;
                 assetTex += `  }}\n`;
                 assetTex += `\\end{center}\n`;
               }
            }
            
            if (asset.type === 'plot' && asset.plot_data) {
                const p = asset.plot_data;
                
                let coords = '';
                for(let i = 0; i < p.x_data.length; i++) {
                  coords += `(${p.x_data[i]}, ${p.y_data[i]}) `;
                }

                assetTex += `\\begin{center}\n`;
                assetTex += `\\begin{tikzpicture}\n`;
                assetTex += `\\begin{axis}[\n`;
                assetTex += `    xlabel={${cleanTextForLatex(p.x_label)}},\n`;
                assetTex += `    ylabel={${cleanTextForLatex(p.y_label)}},\n`;
                assetTex += `    width=0.7\\textwidth,\n`;
                assetTex += `    height=7.5cm,\n`;
                assetTex += `    axis lines=left,\n`; 
                assetTex += `    enlargelimits=true,\n`;
                // --- Authentic IB Graph Paper Styling ---
                assetTex += `    grid=both,\n`;
                assetTex += `    minor tick num=4,\n`; // 5 subdivisions between major ticks
                assetTex += `    major grid style={line width=.6pt, draw=black!40},\n`; // Darker major lines
                assetTex += `    minor grid style={line width=.3pt, draw=black!15}\n`;  // Fainter minor lines
                assetTex += `]\n`;
                
                if (p.chart_type === 'scatter') {
                    assetTex += `\\addplot[only marks, mark=*, color=black] coordinates {\n    ${coords}\n};\n`;
                } else if (p.chart_type === 'bar') {
                    assetTex += `\\addplot[ybar, fill=black!20] coordinates {\n    ${coords}\n};\n`;
                } else {
                    assetTex += `\\addplot[color=black, mark=*, thick] coordinates {\n    ${coords}\n};\n`;
                }
                
                assetTex += `\\end{axis}\n`;
                assetTex += `\\end{tikzpicture}\n`;
                assetTex += `\\end{center}\n`;
            }

            if (asset.type === 'table') {
               assetTex += `% Note: Contains a table. Please format manually in LaTeX.\n`;
            }
          });
        }
        return assetTex;
      };

      if (q.Question_Type === 'MCQ') {
        tex += `\\question\n${cleanTextForLatex(q.Stem.text)}\n\n`;
        const assetsTex = renderAssets(q.Stem.assets);
        if (assetsTex) tex += assetsTex + `\n\n`;
        
        tex += `\\begin{choices}\n`;
        q.Options.forEach((opt: any) => {
          tex += `  \\choice ${cleanTextForLatex(opt.text)}\\vspace{0.2cm}\n`;
        });
        tex += `\\end{choices}\n\n`;
      } 
      else if (q.Question_Type === 'Structured_Question') {
        tex += `\\question\n${cleanTextForLatex(q.Stem.text)}\n\n`;
        const stemAssetsTex = renderAssets(q.Stem.assets);
        if (stemAssetsTex) tex += stemAssetsTex + `\n\n`;
        
        tex += `\\begin{parts}\n`;
        q.Parts.forEach((part: any) => {
          const boxHeight = part.marks * 1.5; 
          
          let cTerm = cleanTextForLatex(part.command_term);
          let pText = cleanTextForLatex(part.text);
          
          if (pText.toLowerCase().startsWith(cTerm.toLowerCase())) {
             pText = pText.substring(cTerm.length).trim();
          }
          
          tex += `  \\part[${part.marks}] \\textbf{${cTerm}} ${pText}\n\n`; 
          
          const partAssetsTex = renderAssets(part.assets);
          if (partAssetsTex) tex += partAssetsTex + `\n\n`;
          
          tex += `  \\vspace{0.4cm}\n\n`;
          tex += `  \\noindent\\fbox{%\n`;
          tex += `    \\begin{minipage}{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule\\relax}\n`;
          tex += `      \\fillwithdottedlines{${boxHeight}cm}\n`;
          tex += `    \\end{minipage}%\n`;
          tex += `  }\n\n`;
        });
        tex += `\\end{parts}\n\n`;
      }
    }
  });

  tex += `\\end{questions}\n\\end{document}\n`;
  return tex;
};

const cleanTextForLatex = (text: string) => {
  if (!text) return '';
  return text
    .replace(/(?<!\\)%/g, '\\%') 
    .replace(/&/g, '\\&')        
    .replace(/#/g, '\\#');       
};