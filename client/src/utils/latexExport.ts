export const generateLatex = (
  layout: any[], 
  generatedQuestions: any[], 
  title: string = "Exam Draft",
  imageMap?: Map<string, string> // Optional map if using the ZIP approach
): string => {
  let tex = `\\documentclass[11pt, addpoints]{exam}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{enumitem}

\\title{${title}}
\\date{\\vspace{-5ex}}
\\author{}

\\begin{document}
\\maketitle
\\begin{questions}\n\n`;

  layout.forEach((item) => {
    if (item.itemType === 'BlankPage') {
      tex += `\\newpage\n\\thispagestyle{empty}\n\\mbox{}\n\\newpage\n\n`;
      return;
    }

    if (item.itemType === 'StaticAsset') {
      tex += `% [STATIC ASSET PLACEHOLDER: ${item.title}]\n\n`;
      return;
    }

    if (item.itemType === 'Question') {
      const q = generatedQuestions.find(gq => gq._id === item.itemId);
      if (!q) return;

      // Helper to render assets and handle the prompt fallback
      const renderAssets = (assets: any[]) => {
        let assetTex = '';
        if (assets && assets.length > 0) {
          assets.forEach((asset: any) => {
            if (asset.type === 'image') {
               // 1. Try to get the local image path if we are using the ZIP approach
               const localPath = (imageMap && asset.image_data) ? imageMap.get(asset.image_data) : null;
               
               if (localPath) {
                 // 2. If we have the image, render it normally
                 assetTex += `\\begin{center}\n\\includegraphics[max width=0.6\\textwidth]{${localPath}}\n\\end{center}\n`;
               } else if (asset.generated_prompt) {
                 // 3. IN LIEU OF IMAGE: Render a neat box containing the AI prompt!
                 assetTex += `\\begin{center}\n`;
                 assetTex += `  \\fbox{\\parbox{0.8\\textwidth}{\n`;
                 assetTex += `    \\centering \\textit{[ Missing Image Placeholder ]} \\\\\n`;
                 assetTex += `    \\vspace{0.2cm}\n`;
                 assetTex += `    \\textbf{Suggested Diagram Prompt:} ${cleanTextForLatex(asset.generated_prompt)}\n`;
                 assetTex += `  }}\n`;
                 assetTex += `\\end{center}\n`;
               }
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
        tex += renderAssets(q.Stem.assets); // Insert Stem assets / placeholders
        
        tex += `\\begin{choices}\n`;
        q.Options.forEach((opt: any) => {
          tex += `  \\choice ${cleanTextForLatex(opt.text)}\n`;
        });
        tex += `\\end{choices}\n\n`;
      } 
      else if (q.Question_Type === 'Structured_Question') {
        const totalMarks = q.Parts.reduce((sum: number, p: any) => sum + p.marks, 0);
        tex += `\\question[${totalMarks}]\n${cleanTextForLatex(q.Stem.text)}\n\n`;
        tex += renderAssets(q.Stem.assets); // Insert Stem assets / placeholders
        
        tex += `\\begin{parts}\n`;
        q.Parts.forEach((part: any) => {
          tex += `  \\part[${part.marks}] \\textbf{${part.command_term}} ${cleanTextForLatex(part.text)}\n`;
          tex += renderAssets(part.assets); // Insert Part assets / placeholders
        });
        tex += `\\end{parts}\n\n`;
      }
    }
  });

  tex += `\\end{questions}\n\\end{document}\n`;
  return tex;
};

// Helper function to escape LaTeX special characters
const cleanTextForLatex = (text: string) => {
  if (!text) return '';
  return text
    .replace(/(?<!\\)%/g, '\\%') // Escape percent signs
    .replace(/&/g, '\\&')        // Escape ampersands
    .replace(/#/g, '\\#');       // Escape hashtags
};